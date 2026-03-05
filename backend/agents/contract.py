"""IP Contract Generation Agent -- Generates legally-compliant licensing contracts.

Bounty coverage:
- Z.AI: Primary use of GLM-4 Plus for legal document generation (128K context)
- FLock.io: Qwen3 235B Thinking as fallback for contract generation
- Claw for Human: Autonomous contract generation protecting human identity rights
"""
from llm_client import chat
from tracing import trace_agent


class ContractAgent:
    name = "contract"
    provider = "Z.AI (GLM-4 Plus) / FLock (Qwen3 235B)"
    sdg_alignment = ["SDG 16 (Peace, Justice, Strong Institutions)"]

    SYSTEM_PROMPT = """You are the IP Contract Generation Agent for Face Library, a secure likeness licensing platform.

Your role is to generate legally-compliant licensing contracts for the use of a person's likeness in AI-generated content. All contracts must be aligned with UK legal frameworks including:

- UK Copyright, Designs and Patents Act 1988
- UK GDPR (Data Protection Act 2018)
- The right to one's own image under UK common law
- Consumer Rights Act 2015
- Electronic Commerce Regulations 2002
- Equality Act 2010 (non-discrimination provisions)

Generate a complete, professional licensing contract that includes ALL 12 sections:

1. PARTIES -- Licensor (talent) and Licensee (brand) details with full legal names
2. DEFINITIONS -- Key terms (Likeness, Licensed Content, Territory, AI-Generated Content, etc.)
3. GRANT OF LICENSE -- Scope, duration, exclusivity, permitted uses, sub-licensing restrictions
4. RESTRICTIONS -- What the licensee cannot do (deepfakes, defamatory use, political use, etc.)
5. COMPENSATION -- Fee structure, payment terms, late payment interest (8% per annum per Late Payment of Commercial Debts Act 1998)
6. INTELLECTUAL PROPERTY -- IP ownership, moral rights (Copyright Act 1988 s77-89), no AI training clause
7. DATA PROTECTION -- GDPR compliance, data processing agreements, lawful basis, DPIA requirements
8. WARRANTIES & REPRESENTATIONS -- Both parties' guarantees, authority to contract
9. TERMINATION -- Conditions for early termination, revocation rights (30-day notice), post-termination obligations
10. LIABILITY -- Limitation of liability, indemnification, insurance requirements
11. DISPUTE RESOLUTION -- Governing law (England & Wales), jurisdiction (Courts of England and Wales), mediation first
12. GENERAL PROVISIONS -- Entire agreement, amendments, severability, notices, force majeure, assignment

The contract should be professional, clear, and enforceable, protecting both parties' interests with special emphasis on the talent's likeness rights and data protection.

Output the full contract text, formatted with proper legal document structure using numbered clauses and sub-clauses."""

    def run(self, talent_profile: dict, brand_profile: dict, negotiation_result: dict, compliance_result: dict) -> dict:
        with trace_agent(self.name, "contract_generation", {
            "talent": talent_profile.get("name", "unknown"),
            "brand": brand_profile.get("company_name", "unknown"),
        }) as span:
            conditions = ""
            if compliance_result and compliance_result.get("result"):
                cr = compliance_result["result"]
                conditions = f"""
COMPLIANCE CONDITIONS:
- Risk level: {cr.get('risk_level', 'unknown')}
- Recommendation: {cr.get('recommendation', 'N/A')}
- Conditions: {', '.join(cr.get('conditions', []))}
- GDPR compliant: {cr.get('compliance_checks', {}).get('uk_gdpr_compliant', 'N/A')}
- IP law compliant: {cr.get('compliance_checks', {}).get('ip_law_compliant', 'N/A')}"""

            negotiation_terms = ""
            if negotiation_result and negotiation_result.get("result"):
                nr = negotiation_result["result"]
                terms = nr.get("recommended_terms", {})
                negotiation_terms = f"""
AGREED TERMS:
- Price: GBP {nr.get('proposed_price', 'TBD')}
- Currency: {nr.get('currency', 'GBP')}
- Duration: {terms.get('duration_days', 30)} days
- Exclusivity: {terms.get('exclusivity', False)}
- Regions: {', '.join(terms.get('regions', ['United Kingdom']))}
- Content types: {', '.join(terms.get('content_types', ['image']))}
- Usage limit: {terms.get('usage_limit', 'Unlimited within license period')}
- Revocation: {terms.get('revocation_terms', 'Standard 30-day notice')}
- Renewal: {terms.get('renewal_terms', 'Subject to mutual agreement')}"""

            messages = [
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": f"""Generate a licensing contract for the following arrangement:

LICENSOR (TALENT):
- Name: {talent_profile.get('name', '[TALENT NAME]')}
- Bio: {talent_profile.get('bio', 'N/A')}

LICENSEE (BRAND):
- Company: {brand_profile.get('company_name', '[BRAND NAME]')}
- Industry: {brand_profile.get('industry', 'N/A')}
- Website: {brand_profile.get('website', 'N/A')}

USE CASE:
- Description: {brand_profile.get('use_case', 'AI-generated marketing content')}
- Content type: {brand_profile.get('content_type', 'image')}
{negotiation_terms}
{conditions}

Generate a complete, enforceable licensing contract under the laws of England and Wales. Include all 12 sections with proper legal clause numbering."""},
            ]

            # Primary: Z.AI GLM-4 Plus (128K context -- ideal for long legal documents)
            result = chat(messages, model_tier="zai_primary", temperature=0.3, max_tokens=4096, agent_name=self.name)
            used_provider = "zai"

            # Fallback: FLock Qwen3 235B Thinking if Z.AI fails
            if result.get("error"):
                result = chat(messages, model_tier="reasoning", temperature=0.3, max_tokens=4096, agent_name=self.name)
                used_provider = "flock_fallback"

            span.set_attribute("contract.provider", used_provider)
            span.set_attribute("contract.length", str(len(result.get("content", ""))))

            return {
                "agent": self.name,
                "contract_text": result["content"],
                "model": result["model"],
                "tokens_used": result["tokens_used"],
                "provider": used_provider,
            }
