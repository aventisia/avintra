# Thin wrapper around LiteLLM for the LiteLLM feature.
#
# Responsibilities:
#   - Build the LiteLLM model string via the registry.
#   - Call `litellm.acompletion` / `litellm.aembedding` /
#     `litellm.atranscription` / `litellm.aspeech`.
#   - Normalize LiteLLM/provider exceptions into HTTPException.
#
# Credential resolution (env vs BYOK) lives in `core/credentials.py` and is
# shared by every capability folder.
from __future__ import annotations

import litellm
from fastapi import HTTPException

from app.core.logger import log_exception, logger
from app.features.auth.authenticated_user import User
from app.utils.errors import friendly_error

from .credentials import resolve_credentials
from .ollama_discovery import OLLAMA_PROVIDERS, discover_ollama_models
from .provider_registry import (
    build_litellm_model,
    capability_for_model,
    model_metadata,
    normalize_provider,
)
from .schemas import EmbeddingRequest, LLMGenerationRequest, ModelInfo, ProviderInfo

class LiteLLMService:
    """Encapsulates direct LiteLLM calls for text, embeddings, STT and TTS."""

    async def chat_completion(
        self,
        request: LLMGenerationRequest,
        *,
        messages: list[dict],
        response_format: dict | None,
        user: User,
    ):
        litellm_model = build_litellm_model(request.provider, request.model)
        credential_resolution = resolve_credentials(
            request.provider,
            request.is_byok_enabled,
            request.credential_name,
            user,
        )
        # Carry the resolved vault credential name for BYOK usage attribution.
        request.credential_name = credential_resolution.credential_name
        kwargs: dict = dict(credential_resolution.kwargs)

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
        credential_resolution = resolve_credentials(
            request.provider,
            request.is_byok_enabled,
            request.credential_name,
            user,
        )
        # Carry the resolved vault credential name for BYOK usage attribution.
        request.credential_name = credential_resolution.credential_name
        kwargs: dict = dict(credential_resolution.kwargs)

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

    async def transcribe(
        self,
        provider: str,
        model: str,
        *,
        file: bytes,
        filename: str,
        language: str | None = None,
        is_byok: bool = False,
        credential_name: str | None = None,
        user: User,
    ):
        """Audio-to-text via `litellm.atranscription` (non-streaming).

        The audio file is passed as raw bytes with a filename so LiteLLM can
        classify the upload; `language` is forwarded when provided.
        """
        litellm_model = build_litellm_model(provider, model)
        credential_resolution = resolve_credentials(
            provider,
            is_byok,
            credential_name,
            user,
        )
        kwargs: dict = dict(credential_resolution.kwargs)
        kwargs.update(
            {
                "model": litellm_model,
                "file": file,
                "filename": filename,
            }
        )
        if language:
            kwargs["language"] = language

        logger.info(
            f"[LLM-V2] transcribe provider={provider} model={model} "
            f"byok={is_byok}"
        )
        try:
            return await litellm.atranscription(**kwargs)
        except HTTPException:
            raise
        except Exception as e:
            log_exception(
                logger, e,
                f"[LLM-V2] transcribe error for {provider}/{model}: ",
            )
            raise HTTPException(
                status_code=502,
                detail=(
                    f"Provider '{provider}' failed to transcribe audio "
                    f"for model '{model}'. {friendly_error(e)}"
                ),
            )

    async def synthesize(
        self,
        provider: str,
        model: str,
        *,
        input: str,
        voice: str,
        speed: float = 1.0,
        is_byok: bool = False,
        credential_name: str | None = None,
        user: User,
    ):
        """Text-to-speech via `litellm.aspeech` (non-streaming).

        Returns the raw audio bytes; the caller is responsible for encoding
        them (e.g. base64) into the capability response DTO.
        """
        litellm_model = build_litellm_model(provider, model)
        credential_resolution = resolve_credentials(
            provider,
            is_byok,
            credential_name,
            user,
        )
        kwargs: dict = dict(credential_resolution.kwargs)
        
        kwargs.update(
            {
                "model": litellm_model,
                "input": input,
                "voice": voice,
                "speed": speed,
            }
        )

        logger.info(
            f"[LLM-V2] synthesize provider={provider} model={model} "
            f"byok={is_byok}"
        )
        try:
            resp = await litellm.aspeech(**kwargs)
            return resp.content if hasattr(resp, "content") else bytes(resp)
        except HTTPException:
            raise
        except Exception as e:
            log_exception(
                logger, e,
                f"[LLM-V2] synthesize error for {provider}/{model}: ",
            )
            raise HTTPException(
                status_code=502,
                detail=(
                    f"Provider '{provider}' failed to synthesize speech "
                    f"for model '{model}'. {friendly_error(e)}"
                ),
            )

    async def list_providers(
        self,
        capability: str | None = None,
        provider: str | None = None,
    ) -> list[ProviderInfo]:
        """Return providers supported by LiteLLM (dynamic), each with its capabilities.

        Capabilities are derived from each provider's models in LiteLLM's model
        catalog via `capability_for_model`.

        Optional filters:
            capability: keep only providers that support this capability.
            provider: keep only providers whose name matches (case-insensitive).
        """
        try:
            providers = [p.value for p in litellm.LlmProviders]
            # De-duplicate while preserving order.
            seen: set[str] = set()
            unique: list[str] = []
            for p in providers:
                if p not in seen:
                    seen.add(p)
                    unique.append(p)
            unique.sort()

            result: list[ProviderInfo] = []
            for name in unique:
                # Filter by explicit provider name.
                if provider and name.lower() != provider.strip().lower():
                    continue

                models = litellm.models_by_provider.get(name, set())
                models = {m for m in models if isinstance(m, str)}
                capabilities: set[str] = set()
                for m in models:
                    cap = capability_for_model(m)
                    if cap:
                        capabilities.add(cap)
                if capability and capability not in capabilities:
                    continue
                result.append(
                    ProviderInfo(
                        name=name,
                        capabilities=sorted(capabilities),
                    )
                )
            return result
        except Exception as e:
            log_exception(logger, e, "[LLM-V2] list_providers error: ")
            raise HTTPException(status_code=500, detail="Error listing providers.")

    async def list_models(
        self,
        provider: str,
        capability: str | None = None,
        *,
        credential_name: str | None = None,
        user: User | None = None,
    ) -> list[ModelInfo]:
        """Return per-model metadata for a provider via LiteLLM (dynamic).

        When `capability` is provided, only models whose capability matches are
        returned. Provider aliases (e.g. 'google' -> 'gemini') are normalized.

        For on-prem Ollama (`ollama` / `ollama_chat`), when a `credential_name` is
        supplied the model list is discovered live from the Ollama server via
        `GET {base_url}/api/tags` instead of LiteLLM's static catalog. `user` is
        required in that case to resolve the credential from the vault.
        """
        try:
            provider = normalize_provider(provider)

            if provider in OLLAMA_PROVIDERS and credential_name:
                if user is None:
                    raise HTTPException(
                        status_code=400,
                        detail="An authenticated user is required to resolve the Ollama credential.",
                    )
                return await discover_ollama_models(provider, credential_name, user)

            models = litellm.models_by_provider.get(provider, set())
            models = {m for m in models if isinstance(m, str)}
            if capability is not None:
                models = {m for m in models if capability_for_model(m) == capability}
            return [
                ModelInfo(**model_metadata(provider, m, capability))
                for m in sorted(models)
            ]
        except HTTPException:
            raise
        except Exception as e:
            log_exception(logger, e, f"[LLM-V2] list_models error for {provider}: ")
            raise HTTPException(status_code=500, detail="Error listing models.")

    async def get_models(
        self,
        provider: str,
        capability: str | None = None,
        *,
        credential_name: str | None = None,
        user: User | None = None,
    ) -> list[ModelInfo]:
        """Public capability-aware model listing for a provider.

        Mirrors the requested interface `get_models(provider='openai',
        capability='embedding')`. Delegates to `list_models`.
        """
        return await self.list_models(
            provider,
            capability,
            credential_name=credential_name,
            user=user,
        )


litellm_service = LiteLLMService()
