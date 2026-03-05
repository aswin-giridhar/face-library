"""Agent Orchestrator -- Coordinates the multi-agent licensing pipeline.

Bounty coverage:
- Claw for Human: Full autonomous pipeline orchestration on OpenClaw
- Animoca: Multi-agent system with coordinated decision-making
- AnyWay: Session-level tracing spans for full observability
- FLock.io: Routes agents to appropriate FLock models
"""
import time
from .negotiator import NegotiatorAgent
from .compliance import ComplianceAgent
from .contract import ContractAgent
from .audit import AuditAgent
from .search import SearchAgent
from tracing import trace_session


class OrchestratorAgent:
    """Orchestrates the full licensing pipeline across all agents.

    Pipeline flow:
    1. Brand submits license request
    2. Compliance Agent assesses risk (DeepSeek V3.2 + GLM-4 summary)
    3. If risk acceptable -> Negotiator Agent proposes terms (Qwen3 235B)
    4. If terms proposed -> Contract Agent generates agreement (GLM-4 Plus)
    5. All steps logged by Audit Agent
    6. Result returned for talent approval
    """

    name = "orchestrator"
    version = "1.0.0"

    def __init__(self):
        self.negotiator = NegotiatorAgent()
        self.compliance = ComplianceAgent()
        self.contract = ContractAgent()
        self.audit = AuditAgent()
        self.search = SearchAgent()

    def process_license_request(
        self, talent_profile: dict, brand_profile: dict, license_request: dict
    ) -> dict:
        """Run the full licensing pipeline with tracing."""
        license_id = license_request.get("id")
        start_time = time.time()

        pipeline_results = {
            "license_id": license_id,
            "stages": [],
            "final_status": "pending",
            "pipeline_metadata": {
                "version": self.version,
                "agents_invoked": [],
                "models_used": [],
                "total_tokens": 0,
                "providers_used": set(),
            },
        }

        metadata = pipeline_results["pipeline_metadata"]

        # Wrap entire pipeline in a session-level trace span (AnyWay bounty)
        with trace_session(str(license_id), {
            "talent": talent_profile.get("name", "unknown"),
            "brand": brand_profile.get("company_name", "unknown"),
            "use_case": license_request.get("use_case", ""),
        }) as session_span:

            # -- Stage 1: Compliance Check (FLock DeepSeek + Z.AI GLM summary) --
            self.audit.log(license_id, "orchestrator", "pipeline_started",
                           f"Processing license request from {brand_profile.get('company_name')} "
                           f"for {talent_profile.get('name')}")

            compliance_result = self.compliance.run(talent_profile, license_request, brand_profile)
            metadata["agents_invoked"].append("compliance")
            metadata["models_used"].append(compliance_result.get("model", ""))
            if compliance_result.get("summary_model"):
                metadata["models_used"].append(compliance_result["summary_model"])
            metadata["total_tokens"] += compliance_result.get("tokens_used", 0)
            metadata["providers_used"].add(compliance_result.get("provider", "flock"))

            self.audit.log(license_id, "compliance", "risk_assessment_complete",
                           compliance_result.get("executive_summary") or str(compliance_result.get("result", {})),
                           compliance_result.get("model", ""), compliance_result.get("tokens_used", 0))

            pipeline_results["stages"].append({
                "stage": "compliance",
                "status": "complete",
                "result": compliance_result,
            })

            # Check if compliance recommends rejection
            cr = compliance_result.get("result", {})
            if cr and cr.get("recommendation") == "reject":
                pipeline_results["final_status"] = "rejected_compliance"
                self.audit.log(license_id, "orchestrator", "pipeline_rejected",
                               f"Rejected by compliance: {cr.get('compliance_notes', 'Risk too high')}")
                metadata["providers_used"] = list(metadata["providers_used"])
                pipeline_results["pipeline_metadata"]["elapsed_seconds"] = round(time.time() - start_time, 2)
                return pipeline_results

            # -- Stage 2: Negotiation (FLock Qwen3 235B) --
            negotiation_result = self.negotiator.run(talent_profile, license_request)
            metadata["agents_invoked"].append("negotiator")
            metadata["models_used"].append(negotiation_result.get("model", ""))
            metadata["total_tokens"] += negotiation_result.get("tokens_used", 0)
            metadata["providers_used"].add(negotiation_result.get("provider", "flock"))

            self.audit.log(license_id, "negotiator", "terms_proposed",
                           str(negotiation_result.get("result", {})),
                           negotiation_result.get("model", ""), negotiation_result.get("tokens_used", 0))

            pipeline_results["stages"].append({
                "stage": "negotiation",
                "status": "complete",
                "result": negotiation_result,
            })

            # -- Stage 3: Contract Generation (Z.AI GLM-4 Plus) --
            contract_result = self.contract.run(
                talent_profile, brand_profile, negotiation_result, compliance_result
            )
            metadata["agents_invoked"].append("contract")
            metadata["models_used"].append(contract_result.get("model", ""))
            metadata["total_tokens"] += contract_result.get("tokens_used", 0)
            metadata["providers_used"].add(contract_result.get("provider", "unknown"))

            self.audit.log(license_id, "contract", "contract_generated",
                           f"Contract generated ({len(contract_result.get('contract_text', ''))} chars) "
                           f"using {contract_result.get('model')} via {contract_result.get('provider')}",
                           contract_result.get("model", ""), contract_result.get("tokens_used", 0))

            pipeline_results["stages"].append({
                "stage": "contract",
                "status": "complete",
                "result": {
                    "contract_text": contract_result.get("contract_text", ""),
                    "model": contract_result.get("model", ""),
                    "provider": contract_result.get("provider", ""),
                },
            })

            # -- Pipeline complete --
            elapsed = round(time.time() - start_time, 2)
            pipeline_results["final_status"] = "awaiting_approval"
            metadata["providers_used"] = list(metadata["providers_used"])
            metadata["elapsed_seconds"] = elapsed
            metadata["unique_models"] = len(set(metadata["models_used"]))

            self.audit.log(license_id, "orchestrator", "pipeline_complete",
                           f"All stages complete in {elapsed}s. "
                           f"Agents: {len(metadata['agents_invoked'])}. "
                           f"Models: {metadata['unique_models']}. "
                           f"Tokens: {metadata['total_tokens']}. "
                           f"Providers: {', '.join(metadata['providers_used'])}. "
                           f"Awaiting talent approval.")

            session_span.set_attribute("pipeline.status", "complete")
            session_span.set_attribute("pipeline.elapsed_seconds", elapsed)
            session_span.set_attribute("pipeline.total_tokens", metadata["total_tokens"])

        return pipeline_results

    def search_talent(self, query: str, filters: dict = None) -> dict:
        """Search for talent using the Search Agent."""
        result = self.search.search(query, filters)
        self.audit.log(None, "search", "talent_search",
                       f"Search query: {query}", result.get("model", ""), result.get("tokens_used", 0))
        return result
