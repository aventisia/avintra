# Embeddings orchestration for the LLM Providers v2 feature.
from __future__ import annotations

import time

from fastapi import HTTPException

from app.core.logger import log_exception, logger
from app.features.auth.authenticated_user import User

from ..core.credit_utils import (
    build_credit_entry,
    check_sufficient_credits,
    post_platform_credit_usage,
)
from ..core.litellm_service import litellm_service
from ..core.provider_registry import get_credit_service_type, should_post_usage, validate_model, validate_provider
from ..core.schemas import EmbeddingRequest, EmbeddingResponse


def _normalize_input(input_value) -> list[str]:
    if isinstance(input_value, str):
        return [input_value]
    if not input_value:
        raise HTTPException(status_code=422, detail="Embedding input must not be empty.")
    return [str(i) for i in input_value]


def _estimate_tokens(texts: list[str]) -> int:
    # Rough heuristic: ~4 chars per token. Used when the provider does not return usage.
    return max(sum(max(1, len(t) // 4) for t in texts), 0)


class EmbeddingService:
    def __init__(self) -> None:
        self._litellm = litellm_service

    async def embed(self, req: EmbeddingRequest, user: User) -> EmbeddingResponse:
        validate_provider(req.provider, req.is_byok_enabled, req.credential_id)
        validate_model(req.provider, req.model, req.is_byok_enabled, req.credential_id)

        check_sufficient_credits(req.is_byok_enabled, req.credential_id, req.provider, user.access_token)
        texts = _normalize_input(req.input)
        start = time.perf_counter()

        try:
            result = await self._litellm.embed(
                req,
                input_texts=texts,
                user=user,
            )
        except HTTPException:
            raise
        except Exception as e:
            log_exception(logger, e, f"[LLM-V2] embedding error: ")
            return EmbeddingResponse(
                provider=req.provider,
                model=req.model,
                embeddings=[],
                status="failed",
                error=str(e),
            )

        data = getattr(result, "data", None) or []
        embeddings = [d.get("embedding") or d.get("embedding", []) for d in data] \
            if data and isinstance(data[0], dict) else [d.embedding for d in data]

        usage = getattr(result, "usage", None) or {}
        input_tokens = usage.get("prompt_tokens") or usage.get("total_tokens")
        if input_tokens is None:
            input_tokens = _estimate_tokens(texts)

        response = EmbeddingResponse(
            provider=req.provider,
            model=req.model,
            embeddings=embeddings,
            time_taken=round(time.perf_counter() - start, 2),
            input_tokens=input_tokens,
            is_byok_enabled=req.is_byok_enabled,
            credential_id=req.credential_id,
            status="completed",
        )

        self._post_credit_usage(req, response, user)
        return response

    def _post_credit_usage(self, req: EmbeddingRequest, resp: EmbeddingResponse, user: User) -> None:
        # Only post usage for platform (non-BYOK) requests.
        if not should_post_usage(req.is_byok_enabled, req.credential_id):
            return
        try:
            service = get_credit_service_type(req.provider, req.model, "service")
            if not service:
                return
            entry = build_credit_entry(
                service,
                resp.input_tokens or 0,
                req.reference_type,
                req.reference_id,
                req.reference_name,
                req.action,
                None,
                user.space_id,
            )
            post_platform_credit_usage(req.provider, [entry], user.access_token)
        except Exception as e:
            logger.warning(f"[LLM-V2] Failed to post embedding credit usage: {e}")


embedding_service = EmbeddingService()
