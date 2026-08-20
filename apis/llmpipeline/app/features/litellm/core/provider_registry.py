# Provider registry — BYOK-aware validation and LiteLLM model-string construction.
#
# No config-driven registry is used. Instead:
#   - Non-BYOK (POST credit-based) requests validate against the curated
#     `ProviderLiteral` list and the hardcoded `PROVIDER_MODELS` map below.
#   - BYOK requests (a real credential_id) validate against LiteLLM's dynamic
#     provider/model lists (`litellm.LlmProviders` / `litellm.models_by_provider`).
#
# The provider name is used directly as the LiteLLM prefix when building the
# `provider/model` string (e.g. "openai/gpt-4o-mini").
from __future__ import annotations

import litellm
from fastapi import HTTPException

from .schemas import ProviderLiteral

# Map user-facing provider names to LiteLLM prefixes. LiteLLM has no "google"
# provider (Gemini lives under "gemini" / "vertex_ai"), so normalize aliases.
PROVIDER_ALIASES: dict[str, str] = {
    "google": "gemini",
    "google_gemini": "gemini",
    "googleai": "gemini",
    "vertex": "vertex_ai",
}

# Map LiteLLM's `litellm.model_cost[model]["mode"]` to our capability enum.
# `mode` is LiteLLM's only reliable capability classifier. Unknown modes are
# dropped (they map to no capability).
CAPABILITY_BY_MODE: dict[str, str] = {
    "chat": "text",
    "completion": "text",
    "responses": "responses",
    "embedding": "embedding",
    "audio_speech": "tts",
    "audio_transcription": "stt",
    "image_generation": "image_generation",
    "image_edit": "image_edit",
    "video_generation": "video_generation",
    "moderation": "moderation",
    "ocr": "ocr",
    "realtime": "realtime",
    "rerank": "rerank",
    "search": "search",
    "vector_store": "vector_store",
}


def normalize_provider(provider: str) -> str:
    """Resolve a user-facing provider alias to its LiteLLM prefix."""
    if not provider:
        return provider
    normalized = provider.strip().lower()
    return PROVIDER_ALIASES.get(normalized, normalized)


def capability_for_model(model: str) -> str | None:
    """Return the capability ('text'/'embedding'/'tts'/'stt') of a model id.

    `litellm.model_cost` may be keyed by the bare model name or the full
    'provider/model' string, so try both. Returns None when unknown (the model
    is then dropped from capability-filtered listings).
    """
    for candidate in (model, _prefixed_model(model)):
        if not candidate:
            continue
        info = litellm.model_cost.get(candidate)
        if not info:
            continue
        mode = info.get("mode")
        return CAPABILITY_BY_MODE.get(mode)
    return None


def _prefixed_model(model: str) -> str | None:
    """Return the 'provider/model' form if the model is already namespaced."""
    return model if "/" in model else None


def _model_cost_entry(model: str) -> dict | None:
    """Return the raw `litellm.model_cost` entry for a model, or None.

    `model_cost` may be keyed by the bare model name or the full
    'provider/model' string, so try both forms.
    """
    for candidate in (model, _prefixed_model(model)):
        if not candidate:
            continue
        entry = litellm.model_cost.get(candidate)
        if entry:
            return entry
    return None


def model_metadata(provider: str, model: str, capability: str | None = None) -> dict:
    """Build the public per-model metadata dict from LiteLLM's model catalog.

    Combines the provider prefix, the derived capability, and the raw
    `litellm.model_cost` entry. Falls back to identity fields when the model is
    absent from `model_cost`.
    """
    entry = _model_cost_entry(model) or {}
    meta: dict = {
        "id": model,
        "provider": provider,
        "capability": capability if capability is not None else capability_for_model(model),
        "mode": entry.get("mode"),
        "max_input_tokens": entry.get("max_input_tokens"),
        "max_output_tokens": entry.get("max_output_tokens"),
        "max_tokens": entry.get("max_tokens"),
        "input_cost_per_token": entry.get("input_cost_per_token"),
        "output_cost_per_token": entry.get("output_cost_per_token"),
        "cache_read_input_token_cost": entry.get("cache_read_input_token_cost"),
        "supports_function_calling": entry.get("supports_function_calling"),
        "supports_parallel_function_calling": entry.get("supports_parallel_function_calling"),
        "supports_vision": entry.get("supports_vision"),
        "supports_system_messages": entry.get("supports_system_messages"),
        "supports_response_schema": entry.get("supports_response_schema"),
        "supports_prompt_caching": entry.get("supports_prompt_caching"),
        "supports_pdf_input": entry.get("supports_pdf_input"),
        "metadata": dict(entry),
    }
    return meta


def get_models(provider: str, capability: str | None = None) -> list[str]:
    """Return model names for a provider, optionally filtered by capability.

    Mirrors the public interface `get_models(provider='openai',
    capability='embedding')`. Provider aliases are normalized. When
    `capability` is None the full provider list is returned (backward compatible).
    """
    provider = normalize_provider(provider)
    models = _litellm_models(provider)
    if capability is None:
        return sorted(models)
    return sorted(m for m in models if capability_for_model(m) == capability)


# Hardcoded mapping of curated providers to their models and the backend
# credit-service enum names used for POST credit-based (non-BYOK) requests.
#
# IMPORTANT: Enum names MUST match the backend `CreditServicesEnum` exactly
# (see apis/WorcBackend-legacy/AspNetToolkit/Enums/CreditServiceTypesEnum.cs).
# Chat models map to {"input", "output", "cache"}; embedding models map to a
# single {"service"} enum. Models without a backend enum use None.
PROVIDER_MODEL_MAP: dict[str, dict[str, dict[str, str | None]]] = {
    "openai": {
        "gpt-4o": {"input": "Gpt4oInput", "output": "Gpt4oOutput", "cache": "Gpt4oCached"},
        "gpt-4o-mini": {"input": "Gpt4oMiniInput", "output": "Gpt4oMiniOutput", "cache": "Gpt4oMiniCached"},
        "gpt-5.1": {"input": "Gpt51Input", "output": "Gpt51Output", "cache": "Gpt51Cached"},
        "gpt-5-mini": {"input": "Gpt5MiniInput", "output": "Gpt5MiniOutput", "cache": "Gpt5MiniCached"},
        "gpt-5-nano": {"input": "Gpt5NanoInput", "output": "Gpt5NanoOutput", "cache": "Gpt5NanoCached"},
        "text-embedding-3-small": {"service": "OpenAIEmbedding3Small"},
        "text-embedding-3-large": {"service": None},
        "text-embedding-ada-002": {"service": "OpenAIEmbeddingAda002"},
    },
    "azure": {
        "gpt-4o": {"input": "Gpt4oInput", "output": "Gpt4oOutput", "cache": "Gpt4oCached"},
        "gpt-4o-mini": {"input": "Gpt4oMiniInput", "output": "Gpt4oMiniOutput", "cache": "Gpt4oMiniCached"},
        "text-embedding-3-small": {"service": "OpenAIEmbedding3Small"},
    },
    "anthropic": {
        "claude-4.5-sonnet-20250929": {"input": "Claude45SonnetInput", "output": "Claude45SonnetOutput", "cache": "Claude45SonnetCached"},
        "claude-4.5-haiku-20251001": {"input": "Claude45HaikuInput", "output": "Claude45HaikuOutput", "cache": "Claude45HaikuCached"},
    },
    "gemini": {
        "gemini-2.5-flash": {"input": "Gemini25FlashInput", "output": "Gemini25FlashOutput", "cache": "Gemini25FlashCached"},
        "gemini-2.5-flash-lite": {"input": "Gemini25FlashLiteInput", "output": "Gemini25FlashLiteOutput", "cache": "Gemini25FlashLiteCached"},
    },
    "ollama": {
        "llama3.1": {"input": None, "output": None, "cache": None},
        "nomic-embed-text": {"service": None},
    },
    "openrouter": {
        "openai/gpt-4o": {"input": "Gpt4oInput", "output": "Gpt4oOutput", "cache": "Gpt4oCached"},
        "openai/gpt-4o-mini": {"input": "Gpt4oMiniInput", "output": "Gpt4oMiniOutput", "cache": "Gpt4oMiniCached"},
        "openai/text-embedding-3-small": {"service": "OpenRouterOpenAIEmbedding3Small"},
        "openai/text-embedding-ada-002": {"service": "OpenRouterOpenAIEmbeddingAda002"},
    },
    "deepinfra": {
        "meta-llama/Meta-Llama-3.1-8B-Instruct": {"input": None, "output": None, "cache": None},
        "BAAI/bge-large-en-v1.5": {"service": None},
    },
    "elevenlabs": {
        # STT (Scribe) models.
        "scribe_v2": {"service": "ElevenLabsScribeV2"},
        "scribe_v2_realtime": {"service": "ElevenLabsScribeV2Realtime"},
        "scribe_v1": {"service": "ElevenLabsScribeV1"},
        # TTS models.
        "eleven_v3": {"service": "ElevenLabsV3"},
        "eleven_multilingual_v2": {"service": "ElevenLabsMultilingualV2"},
        "eleven_multilingual_v3": {"service": "ElevenLabsMultilingualV3"},
        "eleven_turbo_v2": {"service": "ElevenLabsTurboV2"},
        "eleven_flash_v2": {"service": "ElevenLabsFlashV2"},
        "eleven_english_v2": {"service": "ElevenLabsEnglishV2"},
    },
}


def supported_providers() -> list[str]:
    """Return the curated providers the platform supports with its own keys."""
    return list(ProviderLiteral.__args__)


def get_models_for_provider(provider: str) -> list[str]:
    """Return the hardcoded supported models for a curated provider."""
    return list((PROVIDER_MODEL_MAP.get(provider) or {}).keys())


def get_credit_service_type(provider: str, model: str, kind: str) -> str | None:
    """Return the backend `CreditServicesEnum` name for a model usage kind.

    `kind` is one of "input" / "output" / "cache" for chat models, or "service"
    for embedding models. Returns None when no backend enum is defined.
    """
    model_map = (PROVIDER_MODEL_MAP.get(provider) or {}).get(model)
    if not model_map:
        return None
    return model_map.get(kind)


def _has_credential(is_byok: bool, credential_name: str | None) -> bool:
    """True when a real BYOK credential name is supplied (not null / empty)."""
    if not is_byok:
        return False
    if not credential_name:
        return False
    cleaned = str(credential_name).strip()
    return cleaned != ""


def should_post_usage(is_byok: bool, credential_name: str | None) -> bool:
    """True only when the request used platform (non-BYOK) credentials.

    Usage is posted against the platform's credit system only when BYOK is
    disabled AND no real credential name is supplied. A null/empty
    credential counts as "no real credential"; any other value (a real
    credential) means we should not post platform usage.
    """
    if is_byok:
        return False
    if not credential_name:
        return True
    cleaned = str(credential_name).strip()
    return cleaned == ""


def _litellm_providers() -> set[str]:
    try:
        return {p.value for p in litellm.LlmProviders}
    except Exception:
        return set()


def _litellm_models(provider: str) -> set[str]:
    try:
        return {m for m in litellm.models_by_provider.get(provider, set()) if isinstance(m, str)}
    except Exception:
        return set()


def validate_provider(provider: str, is_byok: bool = False, credential_id: str | None = None) -> None:
    """Validate a provider name.

    - Non-BYOK: must be in the curated `ProviderLiteral` list.
    - BYOK (real credential_id): must be a provider LiteLLM knows about.
    """
    if _has_credential(is_byok, credential_id):
        if provider not in _litellm_providers():
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported provider for BYOK: {provider}. "
                f"Provider must be one supported by LiteLLM.",
            )
        return

    if provider not in supported_providers():
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported provider: {provider}. "
            f"Supported providers: {', '.join(supported_providers())}.",
        )


def validate_model(provider: str, model: str, is_byok: bool = False, credential_id: str | None = None) -> None:
    """Validate a model id for a provider.

    - Non-BYOK (POST credit-based): must be in the hardcoded `PROVIDER_MODEL_MAP` list.
    - BYOK (real credential_id): must be in `litellm.models_by_provider[provider]`.
      Providers with no model catalog (empty set) are accepted — LiteLLM will
      validate the model at call time, so we don't reject catalog-less providers.
    """
    if _has_credential(is_byok, credential_id):
        available = _litellm_models(provider)
        # Catalog-less providers (empty model set) are valid; don't reject them.
        if not available:
            return
    else:
        available = set(get_models_for_provider(provider))

    if model not in available:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported model '{model}' for provider '{provider}'. "
            f"Available models: {', '.join(sorted(available))}.",
        )


def build_litellm_model(provider: str, model: str) -> str:
    """Build the LiteLLM model string, e.g. 'openai/gpt-4o-mini'."""
    model_id = model.strip()
    if model_id.startswith(f"{provider}/"):
        return model_id
    return f"{provider}/{model_id}"
