"""Negotiator Agent -- Proposes dynamic pricing and licensing terms.

Bounty coverage:
- FLock.io: Uses Qwen3 235B via FLock API for pricing reasoning
- Animoca: Decision engine for fair pricing in multi-agent system
"""
from llm_client import chat_json
from tracing import trace_agent


class NegotiatorAgent:
    name = "negotiator"
    provider = "FLock (Qwen3 235B)"
    sdg_alignment = ["SDG 8 (Decent Work)", "SDG 10 (Reduced Inequalities)"]

    SYSTEM_PROMPT = """You are the Negotiator Agent for Face Library, a secure likeness licensing platform.

Your role is to propose fair licensing terms between talent (who own their likeness rights) and brands (who want to use those likenesses in AI-generated content).

You must consider:
- The talent's minimum price and preferences
- The brand's use case, duration, and regions
- Market rates for likeness licensing in the UK/EU
- Exclusivity premiums (2-3x for exclusive usage)
- Content type pricing (video > both > image > static)
- Duration-based pricing tiers (longer = discounted per-day rate)
- Geographic scope pricing (global > EU > UK only)
- SDG 8 alignment: ensure fair compensation that creates decent economic opportunities

Always protect the talent's interests while proposing commercially viable terms.

Respond in JSON format:
{
    "proposed_price": float,
    "currency": "GBP",
    "price_breakdown": {
        "base_rate": float,
        "duration_multiplier": float,
        "exclusivity_premium": float,
        "content_type_factor": float,
        "region_factor": float,
        "market_adjustment": float
    },
    "recommended_terms": {
        "duration_days": int,
        "usage_limit": string,
        "exclusivity": boolean,
        "regions": [string],
        "content_types": [string],
        "revocation_terms": string,
        "renewal_terms": string
    },
    "negotiation_notes": string,
    "confidence_score": float,
    "sdg_impact": {
        "fair_compensation": boolean,
        "creator_rights_protected": boolean,
        "market_rate_aligned": boolean
    }
}"""

    def run(self, talent_profile: dict, license_request: dict) -> dict:
        with trace_agent(self.name, "price_negotiation", {
            "talent": talent_profile.get("name", "unknown"),
            "min_price": str(talent_profile.get("min_price_per_use", 100)),
        }) as span:
            messages = [
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": f"""Negotiate licensing terms for this request:

TALENT PROFILE:
- Name: {talent_profile.get('name', 'Unknown')}
- Bio: {talent_profile.get('bio', 'N/A')}
- Minimum price per use: GBP {talent_profile.get('min_price_per_use', 100)}
- Max license duration: {talent_profile.get('max_license_duration_days', 365)} days
- Allowed content: Image={talent_profile.get('allow_image_generation', True)}, Video={talent_profile.get('allow_video_generation', True)}
- Restricted categories: {talent_profile.get('restricted_categories', 'None')}
- Geo scope: {talent_profile.get('geo_scope', 'global')}
- Geo restrictions: {talent_profile.get('geo_restrictions', 'None')}
- Approval mode: {talent_profile.get('approval_mode', 'manual')}

BRAND REQUEST:
- Company: {license_request.get('company_name', 'Unknown')}
- Industry: {license_request.get('industry', 'Unknown')}
- Use case: {license_request.get('use_case', 'N/A')}
- Campaign: {license_request.get('campaign_description', 'N/A')}
- Desired duration: {license_request.get('desired_duration_days', 30)} days
- Desired regions: {license_request.get('desired_regions', 'Global')}
- Content type: {license_request.get('content_type', 'image')}
- Exclusivity requested: {license_request.get('exclusivity', False)}

Propose fair terms that protect the talent while being commercially viable. Ensure pricing aligns with SDG 8 (decent work and fair economic opportunities for creators)."""},
            ]

            # Use Qwen3 235B creative model for nuanced negotiation
            result = chat_json(messages, model_tier="creative", temperature=0.4, agent_name=self.name)

            parsed = result.get("parsed")
            if parsed:
                span.set_attribute("proposed_price", str(parsed.get("proposed_price", 0)))
                span.set_attribute("confidence", str(parsed.get("confidence_score", 0)))

            return {
                "agent": self.name,
                "result": parsed,
                "raw_response": result["content"],
                "model": result["model"],
                "tokens_used": result["tokens_used"],
                "provider": result.get("provider", "flock"),
            }
