"""Gen Orchestrator Agent -- Generates avatar/image prompts for Z.AI integration.

Bounty coverage:
- FLock.io: Uses FLock models for prompt generation
- Z.AI: Output prompts designed for Z.AI image generation
- Claw for Human: Part of 7-agent orchestration pipeline
"""
import uuid
from llm_client import chat
from tracing import trace_agent


class GenOrchestratorAgent:
    name = "gen_orchestrator"
    provider = "FLock (DeepSeek V3.2)"
    sdg_alignment = ["SDG 8 (Decent Work)"]

    SYSTEM_PROMPT = """You are the Gen Orchestrator Agent for Face Library, a secure likeness licensing platform.

Your role is to generate detailed avatar/image generation prompts that can be dispatched to Z.AI or other image generation APIs.

Given a talent profile and campaign details, generate a detailed prompt that:
1. Describes the desired output image/avatar
2. Incorporates the talent's physical attributes
3. Matches the campaign's brand aesthetic
4. Respects content restrictions and preferences
5. Includes technical specifications (resolution, style, lighting)

Return ONLY the prompt text, nothing else. The prompt should be 2-4 sentences, specific and actionable."""

    def run(self, talent_profile: dict, license_request: dict, brand_profile: dict) -> dict:
        with trace_agent(self.name, "gen_prompt", {
            "talent": talent_profile.get("name", "unknown"),
            "brand": brand_profile.get("company_name", "unknown"),
        }) as span:
            user_prompt = f"""Generate an avatar/image generation prompt for:

TALENT: {talent_profile.get('name', 'Unknown')}
CAMPAIGN CATEGORY: {license_request.get('use_case', 'General advertising')}
BRAND: {brand_profile.get('company_name', 'Unknown')} ({brand_profile.get('industry', 'General')})
GEOGRAPHY: {license_request.get('desired_regions', 'Global')}
CONTENT TYPE: {license_request.get('content_type', 'image')}
DURATION: {license_request.get('desired_duration_days', 30)} days

Generate the image prompt now."""

            result = chat(
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                model_tier="fast",
                temperature=0.7,
                max_tokens=512,
                agent_name=self.name,
            )

            generated_prompt = result["content"] if not result.get("error") else ""
            status = "passed" if generated_prompt and not result.get("error") else "failed"

            span.set_attribute("gen.status", status)

            return {
                "agent": self.name,
                "status": status,
                "details": {
                    "generated_prompt": generated_prompt,
                    "dispatch_status": "pending_external",
                    "note": "Prompt ready for Z.AI dispatch when integrated",
                },
                "model": result["model"],
                "tokens_used": result.get("tokens_used", 0),
                "provider": result["provider"],
            }
