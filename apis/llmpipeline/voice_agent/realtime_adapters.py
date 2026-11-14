"""Build the LiveKit realtime model for one voice session.

Realtime voice runs through LiveKit's provider plugins rather than LiteLLM, so
this module is the single mapping from a resolved realtime setting to an
executable plugin. Credentials come from the same resolver the pipeline uses,
which keeps BYOK, vault lookups, and platform keys consistent across engines.
An unknown provider is rejected before any provider client is constructed.
"""

from __future__ import annotations

from livekit.agents import llm
from livekit.plugins import google, openai

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.litellm.core.credentials import CredentialResolution, resolve_credentials

from .contracts import (
    ERROR_CODE_CREDENTIALS_UNAVAILABLE,
    ERROR_CODE_INVALID_CONFIG,
    ERROR_CODE_UNSUPPORTED_PROVIDER,
)
from .events import configuration_error_code

# IMPORTANT NOTE: this allowlist mirrors `VoiceAgentGraphHelpers.AllowedRealtimeProviders`
# in WorkspaceAPIs and `EXECUTABLE_REALTIME_PROVIDERS` in Studio. A provider that
# passes publish but is missing here fails the call after dispatch, so all three
# lists must change together.
_PROVIDER_ALIASES = {
    "openai": "openai",
    "azure": "azure",
    "gemini": "gemini",
    "googlegemini": "gemini",
    "google": "gemini",
    "google_gemini": "gemini",
    "googleai": "gemini",
}

# IMPORTANT NOTE: tenant model lists store LiteLLM model IDs (`gemini/...`,
# `openai/...`) while the realtime plugins call the provider APIs directly and
# reject unknown model names.
_MODEL_PREFIXES = {
    "openai": ("openai/",),
    "azure": ("azure/",),
    "gemini": ("gemini/",),
}


class RealtimeConfigurationError(Exception):
    """A realtime provider cannot be executed; no provider call is made."""

    def __init__(self, message: str, *, code: str) -> None:
        super().__init__(message)
        self.code = code


def normalize_realtime_provider(value: str | None) -> str:
    """Return the executable provider name, or an empty string when unknown."""

    return _PROVIDER_ALIASES.get((value or "").strip().lower(), "")


def normalize_realtime_model(provider: str, value: str | None) -> str:
    """Return the provider model ID without the LiteLLM routing prefix."""

    model = (value or "").strip()
    for prefix in _MODEL_PREFIXES.get(provider, ()):
        if model.lower().startswith(prefix):
            return model[len(prefix) :]
    return model


def build_realtime_model(agent_settings: dict, user: User) -> llm.RealtimeModel:
    """Build the provider plugin for the resolved realtime settings."""

    realtime_settings = agent_settings.get("realtime") or {}
    provider = normalize_realtime_provider(realtime_settings.get("provider"))
    model = normalize_realtime_model(provider, realtime_settings.get("model"))

    if not provider:
        raise RealtimeConfigurationError(
            f"Realtime voice provider '{realtime_settings.get('provider') or ''}' is not supported.",
            code=ERROR_CODE_UNSUPPORTED_PROVIDER,
        )

    code = configuration_error_code(
        provider=provider,
        model=model,
        is_byok_enabled=bool(realtime_settings.get("isByokEnabled")),
        credential_name=realtime_settings.get("credentialName"),
    )
    if code is not None:
        message = (
            "Realtime voice provider and model are required."
            if code == ERROR_CODE_INVALID_CONFIG
            else "Realtime voice requires a BYOK credential."
        )
        raise RealtimeConfigurationError(message, code=code)

    credentials = _resolve_credentials(provider, realtime_settings, user)
    voice_settings = agent_settings.get("ttsVoice") or {}
    voice = voice_settings.get("voice") or None
    language = voice_settings.get("language") or None
    speed = voice_settings.get("speed")

    logger.info(
        "[voice-agent] realtime model provider=%s model=%s voice=%s language=%s speed=%s",
        provider,
        model,
        voice,
        language,
        speed,
    )

    if provider == "openai":
        return _openai_model(model, voice, speed, credentials)
    if provider == "azure":
        return _azure_model(model, voice, speed, credentials)
    # IMPORTANT NOTE: Gemini Live exposes voice and language but no speech-speed
    # option, so ttsVoice.speed applies only to the OpenAI and Azure realtime models.
    return _gemini_model(model, voice, language, credentials)


def _resolve_credentials(
    provider: str,
    realtime_settings: dict,
    user: User,
) -> CredentialResolution:
    try:
        credentials = resolve_credentials(
            provider,
            bool(realtime_settings.get("isByokEnabled")),
            realtime_settings.get("credentialName") or None,
            user,
        )
    except Exception as error:
        raise RealtimeConfigurationError(
            "The realtime credential could not be resolved.",
            code=ERROR_CODE_CREDENTIALS_UNAVAILABLE,
        ) from error

    if not credentials.kwargs.get("api_key"):
        raise RealtimeConfigurationError(
            "Realtime voice requires a provider API key.",
            code=ERROR_CODE_CREDENTIALS_UNAVAILABLE,
        )
    return credentials


def _openai_model(
    model: str,
    voice: str | None,
    speed: float | None,
    credentials: CredentialResolution,
) -> llm.RealtimeModel:
    options = _connection_options(credentials)
    if voice:
        options["voice"] = voice
    if speed is not None:
        options["speed"] = speed
    return openai.realtime.RealtimeModel(model=model, **options)


def _azure_model(
    model: str,
    voice: str | None,
    speed: float | None,
    credentials: CredentialResolution,
) -> llm.RealtimeModel:
    if not credentials.kwargs.get("api_base"):
        raise RealtimeConfigurationError(
            "Realtime voice requires an Azure endpoint.",
            code=ERROR_CODE_CREDENTIALS_UNAVAILABLE,
        )

    options = _connection_options(credentials)
    if voice:
        options["voice"] = voice
    if speed is not None:
        options["speed"] = speed
    if credentials.kwargs.get("api_version"):
        options["api_version"] = credentials.kwargs["api_version"]
    return openai.realtime.RealtimeModel.with_azure(azure_deployment=model, **options)


def _gemini_model(
    model: str,
    voice: str | None,
    language: str | None,
    credentials: CredentialResolution,
) -> llm.RealtimeModel:
    options = {"api_key": credentials.kwargs["api_key"], "api_version": "v1beta"}
    # IMPORTANT NOTE: google-genai defaults the Live API to a version that
    # returns 404 for every Live model; v1beta is the version that serves them.
    if credentials.kwargs.get("api_version"):
        options["api_version"] = credentials.kwargs["api_version"]
    if voice:
        # IMPORTANT NOTE: the Live API matches prebuilt voice names case-sensitively
        # ("Puck", "Kore"), while the Studio voice list stores them lowercase.
        voice = voice.strip()
        options["voice"] = voice[:1].upper() + voice[1:]
    if language:
        options["language"] = language
    return google.beta.realtime.RealtimeModel(model=model, **options)


def _connection_options(credentials: CredentialResolution) -> dict:
    options = {"api_key": credentials.kwargs["api_key"]}
    if credentials.kwargs.get("api_base"):
        options["base_url"] = credentials.kwargs["api_base"]
    return options
