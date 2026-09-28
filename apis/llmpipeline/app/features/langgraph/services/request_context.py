"""Access to the current turn's ``LLMRequest`` carried in graph state metadata.

The compiled graph is cached per conversation, so the request captured in the
node closures at graph-build time goes stale after the first turn. Callers seed
the live request into ``metadata["request"]`` on every invocation; checkpoint
round-trips (approval pauses) deserialize it back to a plain dict.
"""

from typing import Any

from app.core.logger import logger
from app.features.llm_providers.llm_providers_schemas import LLMRequest


def restore_request(
    metadata: dict[str, Any],
    fallback: LLMRequest | None,
) -> LLMRequest | None:
    """Return the current request from state metadata.

    Prefers a live ``LLMRequest``; rebuilds it when checkpoint deserialization
    left a dict; otherwise falls back to the build-time request (e.g. for
    resumptions seeded without a request).
    """

    request = metadata.get("request")
    if isinstance(request, LLMRequest):
        return request
    if isinstance(request, dict):
        try:
            return LLMRequest(**request)
        except Exception:
            logger.exception("Failed to rebuild request from graph state.")
    return fallback
