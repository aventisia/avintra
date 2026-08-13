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


def _resolve_credentials(provider: str, is_byok: bool, credential_id: str | None, user: User) -> dict:
    """
    Decide which credentials to use for a provider call.

    - BYOK enabled: the caller must supply a credential_id. We fetch those
      credentials from the vault and use them exclusively — never the env.
      If no credential_id is given, we fail instead of silently falling back.
    - BYOK disabled: return an empty dict so LiteLLM uses its own environment
      variables (e.g. OPENAI_API_KEY) for the provider.

    Returns a provider-aware kwargs dict that can be spread directly into
    `litellm.acompletion` / `litellm.aembedding`. Every provider is now its own
    typed vault credential (or a legacy typed AppSecret like OpenAI/Anthropic).
    Credential fields are mapped to LiteLLM kwargs by shape:

      - api_key / api_key_url  -> api_key + api_base
      - aws                    -> aws_access_key_id / aws_secret_access_key /
                                  aws_region_name / aws_session_token
      - vertex                 -> vertex_project / vertex_location /
                                  vertex_credentials (service-account JSON)
      - azure                  -> api_key + api_base (endpoint) + api_version
      - watsonx                -> api_key + watsonx_project_id + watsonx_region
      - no_auth                -> api_base only
    """
    if not is_byok:
        # Non-BYOK: let LiteLLM read its own env credentials.
        return {}

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

    # AWS-style providers authenticate via AWS credentials, not an api_key.
    if provider in _AWS_PROVIDERS:
        kwargs: dict = {
            "aws_access_key_id": credential_data.get("AccessKeyId"),
            "aws_secret_access_key": credential_data.get("SecretAccessKey"),
            "aws_region_name": credential_data.get("Region"),
        }
        session_token = credential_data.get("SessionToken")
        if session_token:
            kwargs["aws_session_token"] = session_token
        return {k: v for k, v in kwargs.items() if v is not None}

    # Google Vertex AI uses a service-account JSON + project + location.
    if provider in _VERTEX_PROVIDERS:
        kwargs = {
            "vertex_project": credential_data.get("ProjectId"),
            "vertex_location": credential_data.get("Location"),
            "vertex_credentials": credential_data.get("ServiceAccountJson"),
        }
        return {k: v for k, v in kwargs.items() if v is not None}

    # Azure OpenAI uses a key + endpoint + version.
    if provider in _AZURE_PROVIDERS:
        kwargs = {
            "api_key": credential_data.get("ApiKey"),
            "api_base": credential_data.get("Endpoint") or credential_data.get("Url"),
            "api_version": credential_data.get("ApiVersion"),
        }
        return {k: v for k, v in kwargs.items() if v is not None}

    # IBM WatsonX uses a key + project id + region.
    if provider in _WATSONX_PROVIDERS:
        kwargs = {
            "api_key": credential_data.get("ApiKey"),
            "watsonx_project_id": credential_data.get("ProjectId"),
            "watsonx_region": credential_data.get("Region"),
        }
        return {k: v for k, v in kwargs.items() if v is not None}

    # Key-based providers: api_key + optional api_base/api_version.
    kwargs = {
        "api_key": credential_data.get("ApiKey"),
        "api_base": credential_data.get("Url") or credential_data.get("Host"),
        "api_version": credential_data.get("ApiVersion"),
    }
    return {k: v for k, v in kwargs.items() if v is not None}


# Providers that authenticate via AWS credentials.
_AWS_PROVIDERS = {
    "bedrock", "bedrock_mantle", "sagemaker", "sagemaker_chat", "sagemaker_nova",
    "aws_polly", "amazon_nova",
}

# Providers that use Google Vertex service-account credentials.
_VERTEX_PROVIDERS = {"vertex_ai", "vertex_ai_beta"}

# Providers that use Azure OpenAI-style credentials.
_AZURE_PROVIDERS = {"azure", "azure_ai", "azure_text", "azure_anthropic"}

# Providers that use IBM WatsonX credentials.
_WATSONX_PROVIDERS = {"watsonx", "watsonx_text"}


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
        credential_kwargs = _resolve_credentials(
            request.provider,
            request.is_byok_enabled,
            request.credential_id,
            user,
        )
        kwargs: dict = dict(credential_kwargs)

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
        credential_kwargs = _resolve_credentials(
            request.provider,
            request.is_byok_enabled,
            request.credential_id,
            user,
        )
        kwargs: dict = dict(credential_kwargs)

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
