"""Talent Search Agent -- AI-driven talent discovery for brands.

Bounty coverage:
- FLock.io: Uses DeepSeek V3.2 via FLock API for search ranking
- Animoca: Intelligent agent that finds and recommends talent
"""
from llm_client import chat_json
from tracing import trace_agent
from models import TalentProfile, User, SessionLocal


class SearchAgent:
    name = "search"
    provider = "FLock (DeepSeek V3.2)"
    sdg_alignment = ["SDG 8 (Decent Work)", "SDG 10 (Reduced Inequalities)"]

    SYSTEM_PROMPT = """You are the Talent Search Agent for Face Library, a secure likeness licensing platform.

Your role is to help brands find the right talent for their campaigns. Given a brand's requirements and a list of available talent profiles, you must:

1. Rank talent by relevance to the brand's needs
2. Explain why each talent is a good or poor match
3. Flag any potential conflicts (restricted categories, geo limitations)
4. Suggest search refinements
5. Consider SDG alignment -- promote fair representation and equal opportunity

Respond in JSON format:
{
    "ranked_results": [
        {
            "talent_id": int,
            "name": string,
            "match_score": float (0-1),
            "match_reasons": [string],
            "potential_conflicts": [string],
            "recommended": boolean
        }
    ],
    "search_summary": string,
    "refinement_suggestions": [string],
    "total_matches": int
}"""

    def search(self, query: str, filters: dict = None) -> dict:
        """Search talents based on brand requirements."""
        with trace_agent(self.name, "talent_search", {"query": query}):
            db = SessionLocal()
            try:
                talents = db.query(TalentProfile, User).join(
                    User, TalentProfile.user_id == User.id
                ).all()

                talent_list = []
                for tp, user in talents:
                    talent_list.append({
                        "id": tp.id,
                        "name": user.name,
                        "bio": tp.bio or "No bio provided",
                        "categories": tp.categories or "General",
                        "restricted_categories": tp.restricted_categories or "None",
                        "min_price": tp.min_price_per_use,
                        "allows_video": tp.allow_video_generation,
                        "allows_image": tp.allow_image_generation,
                        "geo_scope": tp.geo_scope or "global",
                        "geo_restrictions": tp.geo_restrictions or "None",
                        "approval_mode": tp.approval_mode or "manual",
                    })

                if not talent_list:
                    return {
                        "agent": self.name,
                        "result": {
                            "ranked_results": [],
                            "search_summary": "No talent profiles found in the system.",
                            "refinement_suggestions": ["Check back later as more talent join the platform."],
                            "total_matches": 0,
                        },
                        "model": "none",
                        "tokens_used": 0,
                    }

                messages = [
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": f"""Find the best talent matches for this brand request:

SEARCH QUERY: {query}

FILTERS: {filters or 'None specified'}

AVAILABLE TALENT ({len(talent_list)} profiles):
{chr(10).join(f"- ID {t['id']}: {t['name']} | Bio: {t['bio']} | Categories: {t['categories']} | Min price: GBP {t['min_price']} | Video: {t['allows_video']} | Image: {t['allows_image']} | Geo: {t['geo_scope']} | Approval: {t['approval_mode']}" for t in talent_list)}

Rank and evaluate each talent for this request."""},
                ]

                result = chat_json(messages, model_tier="fast", temperature=0.3, agent_name=self.name)
                return {
                    "agent": self.name,
                    "result": result.get("parsed"),
                    "raw_response": result["content"],
                    "model": result["model"],
                    "tokens_used": result["tokens_used"],
                }
            finally:
                db.close()
