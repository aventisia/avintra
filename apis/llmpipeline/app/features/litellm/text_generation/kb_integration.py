# KB (Knowledge Base) augmentation integration for the LLM Providers v2 feature.
#
# The actual retrieval/injection logic lives in the legacy `llm_providers.llm_kb_retrieval`
# module (infrastructure shared across features). This module is the only place where the
# v2 feature touches that module, mapping v2 request fields onto the legacy helper and
# copying the injected context back into the v2 request. This keeps the v2 DTOs isolated
# from the legacy schemas while reusing proven infrastructure.
from __future__ import annotations

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.llm_providers.llm_kb_retrieval import retrieve_and_inject_kb_context
from app.features.llm_providers.llm_providers_schemas import (
    LLMMessage as LegacyLLMMessage,
    LLMRequest as LegacyLLMRequest,
)

from ..core.schemas import LLMGenerationRequest


def _to_legacy_request(req: LLMGenerationRequest) -> LegacyLLMRequest:
    """Build a minimal legacy LLMRequest carrying the fields KB retrieval needs."""
    return LegacyLLMRequest(
        provider=req.provider,
        model=req.model,
        input=_as_legacy_input(req.input),
        kb_names=req.kb_names,
        top_k=req.top_k or 5,
        ref_type=req.ref_type,
        ref_id=req.ref_id,
        ref_name=req.ref_name,
        action=req.action,
        agent_name=req.agent_name,
        credential_id=req.credential_name,
        is_byok_enabled=req.is_byok_enabled,
    )


def _as_legacy_input(input_value) -> str | list[LegacyLLMMessage]:
    if isinstance(input_value, str):
        return input_value
    return [LegacyLLMMessage(role=m.role, content=m.content) for m in input_value]


def _as_v2_input(legacy_input) -> str | list:
    if isinstance(legacy_input, str):
        return legacy_input
    return [
        {"role": m.role if hasattr(m, "role") else m.get("role"),
         "content": m.content if hasattr(m, "content") else m.get("content")}
        for m in legacy_input
    ]


async def augment_with_kb_context(req: LLMGenerationRequest, user: User) -> None:
    """If kb_names are provided, retrieve chunks and inject them into req.input in place."""
    if not req.kb_names:
        return
    try:
        legacy_req = _to_legacy_request(req)
        await retrieve_and_inject_kb_context(legacy_req, user)
        # Copy the injected (mutated) input back onto the v2 request.
        req.input = _as_v2_input(legacy_req.input)
    except Exception as e:  # never block generation on KB retrieval failure
        logger.warning(f"[LLM-V2] KB augmentation skipped: {e}")
