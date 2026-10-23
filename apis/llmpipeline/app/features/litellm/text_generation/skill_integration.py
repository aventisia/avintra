# Skill augmentation integration for the LLM Providers v2 feature.
#
# Skill resolution/injection lives in the legacy `llm_providers.llm_skill_retrieval`
# module. This module is the only place where the v2 feature touches it, mapping the
# v2 request onto a minimal legacy request and copying the injected input back.
from __future__ import annotations

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.llm_providers.llm_providers_schemas import LLMRequest as LegacyLLMRequest
from app.features.llm_providers.llm_skill_retrieval import resolve_and_inject_skill_context

from ..core.schemas import LLMGenerationRequest
from .kb_integration import _as_legacy_input, _as_v2_input


async def augment_with_skill_context(req: LLMGenerationRequest, user: User) -> None:
    """If skill_names are provided, inject the resolved skill instructions into req.input in place."""
    if not req.skill_names:
        return
    try:
        # IMPORTANT NOTE: model_construct skips validation because the legacy provider
        # literal does not cover every LiteLLM provider; only input/skill_names are read.
        legacy_req = LegacyLLMRequest.model_construct(
            provider=req.provider,
            model=req.model,
            input=_as_legacy_input(req.input),
            skill_names=req.skill_names,
        )
        await resolve_and_inject_skill_context(legacy_req, user)
        req.input = _as_v2_input(legacy_req.input)
    except Exception as e:  # never block generation on skill resolution failure
        logger.warning(f"[LLM-V2] Skill augmentation skipped: {e}")
