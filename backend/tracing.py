"""Anyway SDK -- OpenTelemetry tracing for Face Library agent pipeline.

Captures session-level, agent-level, LLM-level, and tool-level spans
for full observability of the multi-agent licensing pipeline.

Exports traces to the Anyway collector for visualization and analysis.
"""
import os
import time
import functools
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()

_TRACING_ENABLED = False
_tracer = None

try:
    from opentelemetry import trace
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor
    from opentelemetry.sdk.resources import Resource
    from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
    from opentelemetry.trace import StatusCode

    ANYWAY_ENDPOINT = os.getenv(
        "ANYWAY_TRACE_ENDPOINT",
        "https://trace-dev-collector.anyway.sh/v1/traces",
    )
    ANYWAY_API_KEY = os.getenv("ANYWAY_API_KEY", "")

    if ANYWAY_API_KEY:
        resource = Resource.create({
            "service.name": "face-library",
            "service.version": "1.0.0",
            "deployment.environment": os.getenv("ENVIRONMENT", "development"),
        })

        provider = TracerProvider(resource=resource)
        exporter = OTLPSpanExporter(
            endpoint=ANYWAY_ENDPOINT,
            headers={"Authorization": f"Bearer {ANYWAY_API_KEY}"},
        )
        provider.add_span_processor(BatchSpanProcessor(exporter))
        trace.set_tracer_provider(provider)
        _tracer = trace.get_tracer("face-library", "1.0.0")
        _TRACING_ENABLED = True
        print("[Tracing] Anyway SDK enabled -- exporting to", ANYWAY_ENDPOINT)
    else:
        print("[Tracing] ANYWAY_API_KEY not set -- tracing disabled (spans will be no-ops)")

except ImportError:
    print("[Tracing] OpenTelemetry not installed -- tracing disabled")


class _NoOpSpan:
    """Fallback span when tracing is disabled."""
    def set_attribute(self, key, value): pass
    def set_status(self, status, description=None): pass
    def add_event(self, name, attributes=None): pass
    def record_exception(self, exc): pass
    def end(self): pass
    def __enter__(self): return self
    def __exit__(self, *args): pass


class _NoOpStatusCode:
    OK = "OK"
    ERROR = "ERROR"


if not _TRACING_ENABLED:
    StatusCode = _NoOpStatusCode


@contextmanager
def trace_session(session_id: str, metadata: dict = None):
    """Top-level span for a full license processing session."""
    if not _TRACING_ENABLED:
        yield _NoOpSpan()
        return

    with _tracer.start_as_current_span(
        "license_pipeline",
        attributes={
            "session.id": str(session_id),
            "session.type": "license_processing",
            **(metadata or {}),
        },
    ) as span:
        yield span


@contextmanager
def trace_agent(agent_name: str, action: str, metadata: dict = None):
    """Span for an individual agent invocation."""
    if not _TRACING_ENABLED:
        yield _NoOpSpan()
        return

    with _tracer.start_as_current_span(
        f"agent.{agent_name}",
        attributes={
            "agent.name": agent_name,
            "agent.action": action,
            **(metadata or {}),
        },
    ) as span:
        yield span


@contextmanager
def trace_llm_call(model: str, provider: str, agent_name: str = ""):
    """Span for a single LLM API call with token/latency tracking."""
    if not _TRACING_ENABLED:
        yield _NoOpSpan()
        return

    with _tracer.start_as_current_span(
        f"llm.{provider}.{model}",
        attributes={
            "llm.model": model,
            "llm.provider": provider,
            "agent.name": agent_name,
        },
    ) as span:
        span._start_time_ns = time.time_ns()
        yield span


@contextmanager
def trace_tool(tool_name: str, operation: str, metadata: dict = None):
    """Span for database or tool operations."""
    if not _TRACING_ENABLED:
        yield _NoOpSpan()
        return

    with _tracer.start_as_current_span(
        f"tool.{tool_name}",
        attributes={
            "tool.name": tool_name,
            "tool.operation": operation,
            **(metadata or {}),
        },
    ) as span:
        yield span


def record_llm_result(span, result: dict):
    """Record LLM call results on a span."""
    if not _TRACING_ENABLED:
        return
    span.set_attribute("llm.tokens.total", result.get("tokens_used", 0))
    span.set_attribute("llm.model_used", result.get("model", ""))
    span.set_attribute("llm.provider", result.get("provider", ""))
    if result.get("error"):
        span.set_status(StatusCode.ERROR, result["error"])
    else:
        span.set_status(StatusCode.OK)
