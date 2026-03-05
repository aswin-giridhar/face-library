"""Unified LLM client wrapping FLock API (primary) and Z.AI GLM (secondary).

Bounty coverage:
- FLock.io: All open-source model inference via FLock API
- Z.AI: GLM-4 Plus for contract generation and compliance summaries
- AnyWay: OpenTelemetry tracing on every LLM call
"""
import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from tracing import trace_llm_call, record_llm_result

load_dotenv()

# -- FLock API client (OpenAI-compatible, open-source models) -----------------

flock_client = OpenAI(
    api_key=os.getenv("FLOCK_API_KEY", ""),
    base_url=os.getenv("FLOCK_BASE_URL", "https://api.flock.io/v1"),
    default_headers={"x-litellm-api-key": os.getenv("FLOCK_API_KEY", "")},
)

# -- Z.AI GLM client ---------------------------------------------------------

zai_client = OpenAI(
    api_key=os.getenv("ZAI_API_KEY", ""),
    base_url=os.getenv("ZAI_BASE_URL", "https://open.bigmodel.cn/api/paas/v4"),
) if os.getenv("ZAI_API_KEY") else None

# -- Model mappings (all 5 FLock models + Z.AI) ------------------------------

MODELS = {
    # FLock models (Bounty 1: FLock.io)
    "fast": os.getenv("FLOCK_MODEL_FAST", "deepseek-v3.2"),
    "primary": os.getenv("FLOCK_MODEL_PRIMARY", "qwen3-30b-a3b-instruct-2507"),
    "reasoning": os.getenv("FLOCK_MODEL_REASONING", "qwen3-235b-a22b-thinking-2507"),
    "creative": os.getenv("FLOCK_MODEL_CREATIVE", "qwen3-235b-a22b-instruct-2507"),
    "longctx": os.getenv("FLOCK_MODEL_LONGCTX", "kimi-k2.5"),
    # Z.AI models (Bounty 2: Z.AI)
    "zai_primary": "glm-4-plus",
}

# Track which provider each model tier maps to
MODEL_PROVIDERS = {
    "fast": "flock",
    "primary": "flock",
    "reasoning": "flock",
    "creative": "flock",
    "longctx": "flock",
    "zai_primary": "zai",
}


def chat(
    messages: list[dict],
    model_tier: str = "primary",
    temperature: float = 0.7,
    max_tokens: int = 2048,
    response_format: dict | None = None,
    agent_name: str = "",
) -> dict:
    """Send a chat completion request to the appropriate LLM provider.

    Args:
        messages: List of message dicts with role/content
        model_tier: One of 'fast', 'primary', 'reasoning', 'creative', 'longctx', 'zai_primary'
        temperature: Sampling temperature
        max_tokens: Maximum output tokens
        response_format: Optional JSON response format
        agent_name: Name of the calling agent (for tracing)

    Returns:
        dict with 'content', 'model', 'tokens_used', 'provider'
    """
    use_zai = model_tier.startswith("zai") and zai_client is not None
    client = zai_client if use_zai else flock_client
    model = MODELS.get(model_tier, MODELS["primary"])
    provider = "zai" if use_zai else "flock"

    kwargs = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if response_format:
        kwargs["response_format"] = response_format

    # Anyway tracing: wrap every LLM call in a span
    with trace_llm_call(model, provider, agent_name) as span:
        try:
            response = client.chat.completions.create(**kwargs)
            content = response.choices[0].message.content
            usage = response.usage
            result = {
                "content": content,
                "model": model,
                "tokens_used": usage.total_tokens if usage else 0,
                "prompt_tokens": usage.prompt_tokens if usage else 0,
                "completion_tokens": usage.completion_tokens if usage else 0,
                "provider": provider,
            }
            record_llm_result(span, result)
            return result
        except Exception as e:
            # Fallback: return error info but don't crash the agent pipeline
            result = {
                "content": f"[LLM Error: {str(e)}]",
                "model": model,
                "tokens_used": 0,
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "provider": "error",
                "error": str(e),
            }
            record_llm_result(span, result)
            return result


def chat_json(
    messages: list[dict],
    model_tier: str = "primary",
    temperature: float = 0.3,
    max_tokens: int = 2048,
    agent_name: str = "",
) -> dict:
    """Chat completion that returns parsed JSON."""
    result = chat(
        messages=messages,
        model_tier=model_tier,
        temperature=temperature,
        max_tokens=max_tokens,
        agent_name=agent_name,
    )
    content = result["content"]

    # Try to extract JSON from the response
    try:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        parsed = json.loads(content)
        result["parsed"] = parsed
    except (json.JSONDecodeError, IndexError):
        result["parsed"] = None

    return result


def get_model_info() -> list[dict]:
    """Return info about all configured models for the agents dashboard."""
    models = []
    for tier, model_id in MODELS.items():
        provider = MODEL_PROVIDERS.get(tier, "unknown")
        models.append({
            "tier": tier,
            "model_id": model_id,
            "provider": provider,
            "available": True if provider == "flock" else (zai_client is not None),
        })
    return models
