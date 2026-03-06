"""Agent Orchestrator -- Coordinates the 7-agent licensing pipeline.

Pipeline: Compliance -> Negotiator -> License Token -> Gen Orchestrator -> Fingerprint -> Web3 -> Audit

Bounty coverage:
- Claw for Human: Full autonomous pipeline orchestration on OpenClaw
- Animoca: Multi-agent system with coordinated decision-making
- AnyWay: Session-level tracing spans for full observability
- FLock.io: Routes agents to appropriate FLock models
"""
import time
import uuid
from .negotiator import NegotiatorAgent
from .compliance import ComplianceAgent
from .contract import ContractAgent
from .audit import AuditAgent
from .search import SearchAgent
from .gen_orchestrator import GenOrchestratorAgent
from .fingerprint import FingerprintAgent
from .web3 import Web3Agent
from tracing import trace_session


class OrchestratorAgent:
    """Orchestrates the full 7-step licensing pipeline across all agents.

    Pipeline flow:
    1. Compliance Agent: Risk assessment (DeepSeek V3.2 + GLM-4 summary)
    2. Negotiator Agent: Dynamic pricing (Qwen3 235B)
    3. Contract Agent: UK-law IP contract (GLM-4 Plus)
    4. Gen Orchestrator Agent: Avatar prompt generation (DeepSeek V3.2)
    5. Fingerprint Agent: Unauthorized use detection (DeepSeek V3.2)
    6. Web3 Agent: Smart contract metadata (Local/Animoca)
    7. Audit Agent: Pipeline logging (Local)
    """

    name = "orchestrator"
    version = "2.0.0"

    def __init__(self):
        self.negotiator = NegotiatorAgent()
        self.compliance = ComplianceAgent()
        self.contract = ContractAgent()
        self.audit = AuditAgent()
        self.search = SearchAgent()
        self.gen_orchestrator = GenOrchestratorAgent()
        self.fingerprint = FingerprintAgent()
        self.web3 = Web3Agent()

    def process_license_request(
        self, talent_profile: dict, brand_profile: dict, license_request: dict
    ) -> dict:
        """Run the full 7-step licensing pipeline with tracing."""
        license_id = license_request.get("id")
        start_time = time.time()

        pipeline_results = {
            "license_id": license_id,
            "stages": [],
            "final_status": "pending",
            "license_token": None,
            "pipeline_metadata": {
                "version": self.version,
                "agents_invoked": [],
                "models_used": [],
                "total_tokens": 0,
                "providers_used": set(),
            },
        }

        metadata = pipeline_results["pipeline_metadata"]

        with trace_session(str(license_id), {
            "talent": talent_profile.get("name", "unknown"),
            "brand": brand_profile.get("company_name", "unknown"),
            "use_case": license_request.get("use_case", ""),
        }) as session_span:

            # -- Stage 1: Compliance Check --
            self.audit.log(license_id, "orchestrator", "pipeline_started",
                           f"Processing license request from {brand_profile.get('company_name')} "
                           f"for {talent_profile.get('name')} (7-agent pipeline v{self.version})")

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
                "agent": "compliance",
                "status": "complete",
                "result": compliance_result,
            })

            # Check if compliance recommends rejection
            cr = compliance_result.get("result", {})
            if cr and cr.get("recommendation") == "reject":
                pipeline_results["final_status"] = "rejected_compliance"
                self.audit.log(license_id, "orchestrator", "pipeline_rejected",
                               f"Rejected by compliance: {cr.get('compliance_notes', 'Risk too high')}")

                # Audit still runs on failure
                self.audit.log(license_id, "audit", "pipeline_summary",
                               f"Pipeline failed at compliance -- 1 of 7 agents executed")
                pipeline_results["stages"].append({
                    "stage": "audit",
                    "agent": "audit",
                    "status": "complete",
                    "result": {"summary": "Pipeline failed at compliance"},
                })

                metadata["agents_invoked"].append("audit")
                metadata["providers_used"] = list(metadata["providers_used"])
                metadata["elapsed_seconds"] = round(time.time() - start_time, 2)
                return pipeline_results

            # -- Stage 2: Negotiation --
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
                "agent": "negotiator",
                "status": "complete",
                "result": negotiation_result,
            })

            # -- Stage 3: Contract Generation --
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
                "agent": "contract",
                "status": "complete",
                "result": {
                    "contract_text": contract_result.get("contract_text", ""),
                    "model": contract_result.get("model", ""),
                    "provider": contract_result.get("provider", ""),
                },
            })

            # -- Stage 4: License Token Generation --
            license_token = str(uuid.uuid4())
            pipeline_results["license_token"] = license_token

            self.audit.log(license_id, "license", "token_generated",
                           f"License token issued: {license_token}")

            pipeline_results["stages"].append({
                "stage": "license_token",
                "agent": "license",
                "status": "complete",
                "result": {"license_token": license_token},
            })
            metadata["agents_invoked"].append("license")

            # -- Stage 5: Gen Orchestrator (Avatar Prompt) --
            try:
                gen_result = self.gen_orchestrator.run(talent_profile, license_request, brand_profile)
                metadata["agents_invoked"].append("gen_orchestrator")
                metadata["models_used"].append(gen_result.get("model", ""))
                metadata["total_tokens"] += gen_result.get("tokens_used", 0)
                metadata["providers_used"].add(gen_result.get("provider", "flock"))

                self.audit.log(license_id, "gen_orchestrator", "prompt_generated",
                               gen_result.get("details", {}).get("generated_prompt", "")[:200],
                               gen_result.get("model", ""), gen_result.get("tokens_used", 0))

                pipeline_results["stages"].append({
                    "stage": "gen_orchestrator",
                    "agent": "gen_orchestrator",
                    "status": "complete",
                    "result": gen_result,
                })
            except Exception as e:
                self.audit.log(license_id, "gen_orchestrator", "gen_failed", str(e))
                pipeline_results["stages"].append({
                    "stage": "gen_orchestrator",
                    "agent": "gen_orchestrator",
                    "status": "skipped",
                    "result": {"error": str(e)},
                })

            # -- Stage 6: Fingerprint Agent --
            try:
                fp_result = self.fingerprint.run(talent_profile, license_request)
                metadata["agents_invoked"].append("fingerprint")
                metadata["models_used"].append(fp_result.get("model", ""))
                metadata["total_tokens"] += fp_result.get("tokens_used", 0)
                metadata["providers_used"].add(fp_result.get("provider", "flock"))

                fingerprint_id = fp_result.get("details", {}).get("fingerprint_id", "")
                self.audit.log(license_id, "fingerprint", "scan_complete",
                               f"Fingerprint ID: {fingerprint_id}",
                               fp_result.get("model", ""), fp_result.get("tokens_used", 0))

                pipeline_results["stages"].append({
                    "stage": "fingerprint",
                    "agent": "fingerprint",
                    "status": "complete",
                    "result": fp_result,
                })
            except Exception as e:
                self.audit.log(license_id, "fingerprint", "fingerprint_failed", str(e))
                pipeline_results["stages"].append({
                    "stage": "fingerprint",
                    "agent": "fingerprint",
                    "status": "skipped",
                    "result": {"error": str(e)},
                })

            # -- Stage 7: Web3 Smart Contract --
            try:
                web3_result = self.web3.run(talent_profile, license_request, license_token)
                metadata["agents_invoked"].append("web3_contract")

                self.audit.log(license_id, "web3_contract", "contract_metadata_generated",
                               f"Contract: {web3_result.get('details', {}).get('contract_address', 'N/A')}")

                pipeline_results["stages"].append({
                    "stage": "web3_contract",
                    "agent": "web3_contract",
                    "status": "complete",
                    "result": web3_result,
                })
            except Exception as e:
                self.audit.log(license_id, "web3_contract", "web3_failed", str(e))
                pipeline_results["stages"].append({
                    "stage": "web3_contract",
                    "agent": "web3_contract",
                    "status": "skipped",
                    "result": {"error": str(e)},
                })

            # -- Audit Summary --
            elapsed = round(time.time() - start_time, 2)
            pipeline_results["final_status"] = "awaiting_approval"
            metadata["agents_invoked"].append("audit")
            metadata["providers_used"] = list(metadata["providers_used"])
            metadata["elapsed_seconds"] = elapsed
            metadata["unique_models"] = len(set(metadata["models_used"]))

            self.audit.log(license_id, "audit", "pipeline_summary",
                           f"Full pipeline completed -- {len(metadata['agents_invoked'])} agents executed in {elapsed}s. "
                           f"Models: {metadata['unique_models']}. "
                           f"Tokens: {metadata['total_tokens']}. "
                           f"Providers: {', '.join(metadata['providers_used'])}.")

            pipeline_results["stages"].append({
                "stage": "audit",
                "agent": "audit",
                "status": "complete",
                "result": {"summary": f"Full pipeline completed -- {len(metadata['agents_invoked'])} agents executed"},
            })

            session_span.set_attribute("pipeline.status", "complete")
            session_span.set_attribute("pipeline.elapsed_seconds", elapsed)
            session_span.set_attribute("pipeline.total_tokens", metadata["total_tokens"])
            session_span.set_attribute("pipeline.agents_count", len(metadata["agents_invoked"]))

        return pipeline_results

    def search_talent(self, query: str, filters: dict = None) -> dict:
        """Search for talent using the Search Agent."""
        result = self.search.search(query, filters)
        self.audit.log(None, "search", "talent_search",
                       f"Search query: {query}", result.get("model", ""), result.get("tokens_used", 0))
        return result
