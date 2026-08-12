# Thin wrapper around LiteLLM for the LLM Providers v2 feature.
#
# Responsibilities:
#   - Resolve provider credentials (platform env key OR BYOK from the external vault).
#   - Build the LiteLLM model string via the registry.
#   - Call `litellm.acompletion` / `litellm.aembedding`.
#   - Normalize LiteLLM/provider exceptions into HTTPException.
from __future__ import annotations

import litellm
from fastapi import HTTPException

from app.core.logger import log_exception, logger
from app.core.vault_manager import VaultManager
from app.features.auth.authenticated_user import User
from app.utils.errors import friendly_error

from .provider_registry import (
    build_litellm_model,
    capability_for_model,
    model_metadata,
    normalize_provider,
)
from .schemas import EmbeddingRequest, LLMGenerationRequest, ModelInfo


def _resolve_credentials(provider: str, is_byok: bool, credential_id: str | None, user: User):
    """
    Decide which credentials to use for a provider call.

    - BYOK enabled: the caller must supply a credential_id. We fetch those
      credentials from the vault and use them exclusively — never the env.
      If no credential_id is given, we fail instead of silently falling back.
    - BYOK disabled: return (None, None, None) so LiteLLM uses its own
      environment variables (e.g. OPENAI_API_KEY) for the provider.
    Returns (api_key, api_base, api_version).
    """
    if is_byok:
        # BYOK must always carry a credential id; never fall back to the env.
        if not credential_id:
            logger.error(
                f"[LLM-V2] BYOK enabled but no credential_id for provider {provider}"
            )
            raise HTTPException(
                status_code=400, detail="A valid credential_id is required when BYOK is enabled."
            )

        vault = VaultManager()
        credential = vault.get_vault_secret_by_id(
            vault_secret_id=credential_id,
            jwt=user.access_token,
        )
        if not credential:
            logger.error(f"[LLM-V2] Invalid BYOK credentials for provider {provider}")
            raise HTTPException(status_code=400, detail="No valid credentials found.")

        credential_data = credential.get("data") or credential
        api_key = credential_data.get("ApiKey")
        api_base = credential_data.get("Url") or credential_data.get("Host")
        api_version = credential_data.get("ApiVersion")
        return api_key, api_base, api_version

    # Non-BYOK: let LiteLLM read its own env credentials.
    return None, None, None


class LiteLLMService:
    """Encapsulates direct LiteLLM calls for chat/completion and embeddings."""

    async def chat_completion(
        self,
        request: LLMGenerationRequest,
        *,
        messages: list[dict],
        response_format: dict | None,
        user: User,
    ):
        litellm_model = build_litellm_model(request.provider, request.model)
        api_key, api_base, api_version = _resolve_credentials(
            request.provider,
            request.is_byok_enabled,
            request.credential_id,
            user,
        )
        kwargs: dict = {}
        if api_key:
            kwargs["api_key"] = api_key
        if api_base:
            kwargs["api_base"] = api_base
        if api_version:
            kwargs["api_version"] = api_version

        kwargs.update(
            {
                "model": litellm_model,
                "messages": messages,
                "temperature": request.temperature or 1.0,
                "top_p": request.top_p or 1.0,
                "stream": request.stream,
            }
        )
        if request.max_output_tokens:
            kwargs["max_tokens"] = request.max_output_tokens
        if request.stop is not None:
            kwargs["stop"] = request.stop
        if request.seed is not None:
            kwargs["seed"] = request.seed
        if request.reasoning_effort:
            kwargs["reasoning_effort"] = request.reasoning_effort
        if response_format is not None:
            # Some providers require response_format to be JSON-serializable dict.
            kwargs["response_format"] = response_format

        logger.info(
            f"[LLM-V2] chat_completion provider={request.provider} "
            f"model={request.model} stream={request.stream} byok={request.is_byok_enabled}"
        )
        try:
            return await litellm.acompletion(**kwargs)
        except HTTPException:
            raise
        except Exception as e:
            log_exception(
                logger, e,
                f"[LLM-V2] chat_completion error for {request.provider}/{request.model}: ",
            )
            raise HTTPException(
                status_code=502,
                detail=(
                    f"Provider '{request.provider}' failed to complete the request "
                    f"for model '{request.model}'. {friendly_error(e)}"
                ),
            )

    async def embed(
        self,
        request: EmbeddingRequest,
        *,
        input_texts: list[str],
        user: User,
    ):
        litellm_model = build_litellm_model(request.provider, request.model)
        api_key, api_base, api_version = _resolve_credentials(
            request.provider,
            request.is_byok_enabled,
            request.credential_id,
            user,
        )
        kwargs: dict = {}
        if api_key:
            kwargs["api_key"] = api_key
        if api_base:
            kwargs["api_base"] = api_base
        if api_version:
            kwargs["api_version"] = api_version

        kwargs.update(
            {
                "model": litellm_model,
                "input": input_texts,
                "encoding_format": request.encoding_format,
            }
        )
        if request.dimensions:
            kwargs["dimensions"] = request.dimensions

        logger.info(
            f"[LLM-V2] embed provider={request.provider} model={request.model} "
            f"inputs={len(input_texts)} byok={request.is_byok_enabled}"
        )
        try:
            return await litellm.aembedding(**kwargs)
        except HTTPException:
            raise
        except Exception as e:
            log_exception(
                logger, e,
                f"[LLM-V2] embed error for {request.provider}/{request.model}: ",
            )
            raise HTTPException(
                status_code=502,
                detail=(
                    f"Provider '{request.provider}' failed to compute embeddings "
                    f"for model '{request.model}'. {friendly_error(e)}"
                ),
            )

    async def list_providers(self) -> list[str]:
        """Return the list of providers supported by LiteLLM (dynamic)."""
        try:
            providers = [p.value for p in litellm.LlmProviders]
            # De-duplicate while preserving order.
            seen: set[str] = set()
            unique: list[str] = []
            for p in providers:
                if p not in seen:
                    seen.add(p)
                    unique.append(p)
            return sorted(unique)
        except Exception as e:
            log_exception(logger, e, "[LLM-V2] list_providers error: ")
            raise HTTPException(status_code=500, detail="Error listing providers.")

    async def list_models(self, provider: str, capability: str | None = None) -> list[ModelInfo]:
        """Return per-model metadata for a provider via LiteLLM (dynamic).

        When `capability` is provided, only models whose capability matches are
        returned. Provider aliases (e.g. 'google' -> 'gemini') are normalized.
        """
        try:
            provider = normalize_provider(provider)
            models = litellm.models_by_provider.get(provider, set())
            models = {m for m in models if isinstance(m, str)}
            if capability is not None:
                models = {m for m in models if capability_for_model(m) == capability}
            return [
                ModelInfo(**model_metadata(provider, m, capability))
                for m in sorted(models)
            ]
        except Exception as e:
            log_exception(logger, e, f"[LLM-V2] list_models error for {provider}: ")
            raise HTTPException(status_code=500, detail="Error listing models.")

    async def get_models(
        self, provider: str, capability: str | None = None
    ) -> list[ModelInfo]:
        """Public capability-aware model listing for a provider.

        Mirrors the requested interface `get_models(provider='openai',
        capability='embedding')`. Delegates to `list_models`.
        """
        return await self.list_models(provider, capability)


litellm_service = LiteLLMService()
