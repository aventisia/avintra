# LiteLLM-backed Text-to-Speech provider.
#
# TTS supports both BYOK (a caller-supplied credential id) and the platform's
# environment credentials. The provider/model are validated with the same
# helpers used by Text Generation and Embeddings. Platform credits apply only
# for non-BYOK requests; BYOK requests are billed against the caller's own
# provider account.
from __future__ import annotations

import base64
import re
import time

from fastapi import HTTPException

from app.core.logger import log_exception, logger
from app.features.auth.authenticated_user import User
from app.utils.errors import friendly_error

from ..core.credit_utils import (
    build_byok_entry,
    has_sufficient_platform_credits,
    post_byok_usage,
    post_credit_usage,
    should_record_byok,
)
from ..core.credentials import resolve_credential_name
from ..core.litellm_service import litellm_service
from ..core.provider_registry import (
    get_credit_service_type,
    normalize_provider,
    should_post_usage,
    validate_model,
    validate_provider,
)
from ..core.schemas import PronunciationEntry, TTSRequest, TTSResponse
from .tts_base import BaseTextToSpeechProvider


def canonical_voice(provider: str, voice: str) -> str:
    """Return the provider's canonical voice spelling.

    Gemini matches voice names case-sensitively ("Journey"), while the Studio
    sends them lowercase.
    """

    if provider == "gemini" and voice:
        stripped = voice.strip()
        return stripped[:1].upper() + stripped[1:]
    return voice


def apply_pronunciations(
    text: str,
    pronunciations: list[PronunciationEntry] | None,
) -> str:
    """Rewrite ``text`` with the configured pronunciation aliases.

    Matching is case-insensitive and applies the longest term first so a longer
    term is never shadowed by a shorter term contained in it. Missing terms or
    an empty list leave the text unchanged.
    """

    if not text or not pronunciations:
        return text

    entries = [
        (entry.term, entry.pronunciation)
        for entry in pronunciations
        if entry.term and entry.pronunciation
    ]
    if not entries:
        return text

    entries.sort(key=lambda pair: len(pair[0]), reverse=True)

    result = text
    for term, pronunciation in entries:
        result = re.sub(
            re.escape(term),
            lambda _match, replacement=pronunciation: replacement,
            result,
            flags=re.IGNORECASE,
        )

    return result


class LiteLLMTTSProvider(BaseTextToSpeechProvider):
    """TTS provider that delegates to LiteLLM's `aspeech`."""

    async def synthesize(self, tts_request: TTSRequest, user: User) -> TTSResponse:
        """Synthesize speech using BYOK or the platform's environment credentials.

        When BYOK is enabled with a real credential id, those credentials are
        fetched from the vault and used exclusively. Otherwise the request runs
        on the platform's environment credentials and platform credits apply.
        """
        start_time = time.perf_counter()

        # IMPORTANT NOTE: Studio voice settings store the provider as
        # "googlegemini"; LiteLLM only accepts "gemini".
        tts_request.provider = normalize_provider(tts_request.provider)
        # Validate the provider/model with the request's credential mode.
        validate_provider(tts_request.provider, tts_request.is_byok_enabled, tts_request.credential_name)
        validate_model(tts_request.provider, tts_request.model, tts_request.is_byok_enabled, tts_request.credential_name)

        # Platform credits apply only for non-BYOK requests.
        if not tts_request.is_byok_enabled and tts_request.credential_name:
            self._check_credits(tts_request, user)

        try:
            # Apply pronunciation aliases before synthesis so the provider speaks
            # the intended pronunciation.
            synthesis_input = apply_pronunciations(
                tts_request.input,
                tts_request.pronunciations,
            )
            # Delegate the actual synthesis to the LiteLLM transport.
            audio_bytes = await litellm_service.synthesize(
                tts_request.provider,
                tts_request.model,
                input=synthesis_input,
                voice=canonical_voice(tts_request.provider, tts_request.voice_id or ""),
                speed=tts_request.speed if tts_request.speed is not None else 1.0,
                is_byok=tts_request.is_byok_enabled,
                credential_name=tts_request.credential_name,
                user=user,
            )
        except HTTPException:
            # Pass through provider-requested errors (e.g. 400 validation).
            raise
        except Exception as exc:
            # Normalize unexpected provider failures into a friendly 502.
            log_exception(logger, exc, "[LLM-TTS] synthesis error")
            raise HTTPException(
                status_code=502,
                detail=(
                    f"The request could not be processed by provider "
                    f"'{tts_request.provider}' for model '{tts_request.model}'. {friendly_error(exc)}"
                ),
            )

        # Encode the raw audio bytes as base64 for the response contract.
        return self._final_response(
            tts_request,
            start_time,
            audio_bytes,
            user,
        )

    def _check_credits(self, tts_request: TTSRequest, user: User) -> None:
        """Verify the request is eligible for platform-credit billing.

        Only non-BYOK requests are billed against the platform, so the platform
        account must have sufficient credits to proceed.
        """
        if not has_sufficient_platform_credits(user.access_token):
            raise HTTPException(status_code=400, detail="Insufficient credits.")

    def _final_response(
        self,
        tts_request: TTSRequest,
        start_time: float,
        audio_bytes: bytes,
        user: User,
    ) -> TTSResponse:
        """Build the completed TTS response and post credit usage.

        The input text length (characters) is used as the billable unit count
        sent to the credit service.
        """
        response = TTSResponse(
            provider=tts_request.provider,
            model=tts_request.model,
            output=base64.b64encode(audio_bytes).decode("utf-8"),
            status="completed",
            stream=False,
            credential_name=tts_request.credential_name,
            is_byok_enabled=tts_request.is_byok_enabled,
            time_taken=round(time.perf_counter() - start_time, 2),
            token_count=len(tts_request.input),
            ref_id=tts_request.ref_id,
            ref_type=tts_request.ref_type,
            ref_name=tts_request.ref_name,
            agent_name=tts_request.agent_name,
            action=tts_request.action,
        )
        # Post credit usage only for platform (non-BYOK) requests.
        if should_post_usage(tts_request.is_byok_enabled, tts_request.credential_name):
            try:
                # Bill based on the number of characters synthesized.
                post_credit_usage(tts_request, tts_request.provider, "service", len(tts_request.input), user.access_token, user.space_id)
            except Exception as exc:
                logger.error(f"Failed to post TTS credit usage | error={exc}")
                raise HTTPException(status_code=500, detail=f"Failed to post credit usage: {exc}")
        # Post BYOK usage for caller's own key requests.
        if should_record_byok(tts_request.is_byok_enabled, tts_request.credential_name):
            try:
                # Resolve the vault credential name for attribution.
                resolved_name = resolve_credential_name(tts_request.credential_name, user)
                service = get_credit_service_type(tts_request.provider, tts_request.model, "service")
                if service:
                    entry = build_byok_entry(
                        service,
                        tts_request.provider,
                        tts_request.model,
                        len(tts_request.input),
                        "Characters",
                        tts_request.credential_name,
                        tts_request.ref_type,
                        tts_request.ref_id,
                        tts_request.ref_name,
                        tts_request.action,
                        tts_request.agent_name,
                        user.space_id,
                        display_name=resolved_name,
                    )
                    post_byok_usage(tts_request.provider, [entry], user.access_token)
            except Exception as exc:
                logger.error(f"Failed to post TTS BYOK usage | error={exc}")
        return response
