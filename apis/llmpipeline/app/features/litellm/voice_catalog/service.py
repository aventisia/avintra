"""Voice and language catalogs for the LiteLLM TTS and realtime paths."""
from __future__ import annotations

from typing import cast
from urllib.parse import quote

import httpx
from fastapi import HTTPException

from app.core.config import settings
from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.litellm.core.credentials import resolve_credentials
from app.features.litellm.core.provider_registry import (
    capability_for_model,
    normalize_provider,
)

from .catalog import PROVIDERS_BY_CAPABILITY, static_languages, static_voices
from .schemas import (
    LanguageInfo,
    LanguagesResponse,
    VoiceCapability,
    VoiceInfo,
    VoicesResponse,
)

_VOICE_CAPABILITIES = frozenset({"tts", "realtime"})
_ELEVENLABS_TIMEOUT_SECONDS = 10


class VoiceCatalogService:
    """Resolve voices and languages for a selected provider and model."""

    async def list_voices(
        self,
        provider: str,
        model: str,
        capability: str | None,
        credential_name: str | None,
        user: User,
    ) -> VoicesResponse:
        """Return the voices for a provider/model and voice capability."""
        provider, model, capability = self._resolve(provider, model, capability)
        voices = await self._voices(provider, capability, credential_name, user)
        return VoicesResponse(
            provider=provider,
            model=model,
            capability=capability,
            voices=voices,
            count=len(voices),
        )

    async def list_languages(
        self,
        provider: str,
        model: str,
        capability: str | None,
        credential_name: str | None,
        user: User,
    ) -> LanguagesResponse:
        """Return the languages supported by a provider/model voice."""
        provider, model, capability = self._resolve(provider, model, capability)
        languages = await self._languages(provider, model, capability, credential_name, user)
        return LanguagesResponse(
            provider=provider,
            model=model,
            capability=capability,
            languages=languages,
            count=len(languages),
        )

    def _resolve(
        self,
        provider: str,
        model: str,
        capability: str | None,
    ) -> tuple[str, str, VoiceCapability]:
        normalized_provider = normalize_provider((provider or "").strip())
        if not normalized_provider:
            raise HTTPException(status_code=400, detail="Provider is required.")

        normalized_model = (model or "").strip()
        if not normalized_model:
            raise HTTPException(status_code=400, detail="Model is required.")

        resolved_capability = self._capability(capability, normalized_model)
        supported = PROVIDERS_BY_CAPABILITY[resolved_capability]
        if normalized_provider not in supported:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported voice provider '{normalized_provider}' for "
                    f"{resolved_capability}. Supported providers: "
                    f"{', '.join(supported)}."
                ),
            )

        known_capability = _model_capability(normalized_model)
        if (
            known_capability
            and known_capability != resolved_capability
            and not _realtime_chat_model(
                normalized_provider,
                resolved_capability,
                known_capability,
            )
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Model '{normalized_model}' is not a {resolved_capability} "
                    f"model for provider '{normalized_provider}'."
                ),
            )

        return normalized_provider, normalized_model, resolved_capability

    def _capability(self, value: str | None, model: str) -> VoiceCapability:
        if value:
            normalized = value.strip().lower()
            if normalized not in _VOICE_CAPABILITIES:
                raise HTTPException(
                    status_code=400,
                    detail="Voice capability must be 'tts' or 'realtime'.",
                )
            return cast(VoiceCapability, normalized)

        return "realtime" if _model_capability(model) == "realtime" else "tts"

    async def _voices(
        self,
        provider: str,
        capability: VoiceCapability,
        credential_name: str | None,
        user: User,
    ) -> list[VoiceInfo]:
        if provider == "elevenlabs":
            live = await self._elevenlabs_voices(credential_name, user)
            if live:
                return live
        return static_voices(provider, capability)

    async def _languages(
        self,
        provider: str,
        model: str,
        capability: VoiceCapability,
        credential_name: str | None,
        user: User,
    ) -> list[LanguageInfo]:
        if provider == "elevenlabs":
            live = await self._elevenlabs_languages(model, credential_name, user)
            if live:
                return live
        return static_languages(provider, model, capability)

    async def _elevenlabs_voices(
        self,
        credential_name: str | None,
        user: User,
    ) -> list[VoiceInfo]:
        credentials = self._elevenlabs_credentials(credential_name, user)
        if credentials is None:
            return []

        api_base, api_key = credentials
        voices: list[VoiceInfo] = []
        token: str | None = None
        try:
            for _ in range(20):
                path = "/voices?page_size=100"
                if token:
                    path += f"&next_page_token={quote(str(token), safe='')}"
                payload = await _fetch_elevenlabs(path, api_base, api_key)
                voices.extend(_parse_elevenlabs_voices(payload))
                token = payload.get("next_page_token") if isinstance(payload, dict) else None
                if not token or not payload.get("has_more"):
                    break
        except Exception as error:
            logger.warning("[LLM-V2] ElevenLabs voice catalog unavailable: %s", error)
            return voices

        return voices

    async def _elevenlabs_languages(
        self,
        model: str,
        credential_name: str | None,
        user: User,
    ) -> list[LanguageInfo]:
        credentials = self._elevenlabs_credentials(credential_name, user)
        if credentials is None:
            return []

        api_base, api_key = credentials
        try:
            payload = await _fetch_elevenlabs("/models", api_base, api_key)
        except Exception as error:
            logger.warning("[LLM-V2] ElevenLabs language catalog unavailable: %s", error)
            return []

        return _parse_elevenlabs_languages(payload, model)

    def _elevenlabs_credentials(
        self,
        credential_name: str | None,
        user: User,
    ) -> tuple[str, str] | None:
        cleaned = str(credential_name).strip() if credential_name else ""
        try:
            resolution = resolve_credentials(
                "elevenlabs",
                bool(cleaned),
                cleaned or None,
                user,
            )
        except HTTPException:
            raise
        except Exception as error:
            logger.warning("[LLM-V2] ElevenLabs credentials unavailable: %s", error)
            return None

        api_key = resolution.kwargs.get("api_key")
        if not api_key:
            return None
        api_base = resolution.kwargs.get("api_base") or settings.ELEVENLABS_API_URL
        return api_base, api_key


def _model_capability(model: str) -> str | None:
    known = capability_for_model(model)
    if known:
        return known

    name = model.split("/")[-1].lower()
    if "realtime" in name or "native-audio" in name or name.startswith("gemini-live"):
        return "realtime"
    if name.startswith("scribe") or "transcribe" in name:
        return "stt"
    if "tts" in name or name.startswith("eleven_"):
        return "tts"
    return None


def _realtime_chat_model(
    provider: str,
    capability: str,
    known_capability: str,
) -> bool:
    # IMPORTANT NOTE: Gemini Live reuses chat model IDs, and Azure deployments
    # may be named after their base model, so a LiteLLM "text" mode does not
    # prove the model is unusable for realtime voice.
    return (
        capability == "realtime"
        and known_capability == "text"
        and provider in {"gemini", "azure"}
    )


async def _fetch_elevenlabs(path: str, api_base: str, api_key: str):
    async with httpx.AsyncClient(timeout=_ELEVENLABS_TIMEOUT_SECONDS) as client:
        response = await client.get(
            f"{api_base.rstrip('/')}{path}",
            headers={"xi-api-key": api_key},
        )
        response.raise_for_status()
        return response.json()


def _parse_elevenlabs_voices(payload) -> list[VoiceInfo]:
    items = payload.get("voices") if isinstance(payload, dict) else None
    if not isinstance(items, list):
        return []

    voices: list[VoiceInfo] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        voice_id = item.get("voice_id")
        name = item.get("name")
        if not voice_id or not name:
            continue
        sample = item.get("preview_url")
        voices.append(
            VoiceInfo(
                id=str(voice_id),
                name=str(name),
                sample=str(sample) if sample else None,
            )
        )
    return voices


def _parse_elevenlabs_languages(payload, model: str) -> list[LanguageInfo]:
    if not isinstance(payload, list):
        return []

    model_id = model.split("/")[-1].lower()
    for item in payload:
        if not isinstance(item, dict):
            continue
        if str(item.get("model_id") or "").lower() != model_id:
            continue

        items = item.get("languages")
        if not isinstance(items, list):
            return []

        languages: list[LanguageInfo] = []
        for language in items:
            if not isinstance(language, dict):
                continue
            language_id = language.get("language_id")
            name = language.get("name")
            if not language_id or not name:
                continue
            languages.append(LanguageInfo(id=str(language_id), name=str(name)))
        return languages

    return []


voice_catalog_service = VoiceCatalogService()
