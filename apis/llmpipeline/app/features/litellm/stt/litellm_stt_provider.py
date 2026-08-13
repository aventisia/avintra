# LiteLLM-backed Speech-to-Text provider.
#
# STT supports both BYOK (a caller-supplied credential id) and the platform's
# environment credentials. The provider/model are validated with the same
# helpers used by Text Generation and Embeddings. Platform credits apply only
# for non-BYOK requests; BYOK requests are billed against the caller's own
# provider account.
from __future__ import annotations

import base64
import io
import time

from fastapi import HTTPException
from pydub import AudioSegment

from app.core.logger import log_exception, logger
from app.features.auth.authenticated_user import User
from app.utils.errors import friendly_error
from app.utils.file_converter_utils import file_to_base64

from ..core.credit_utils import (
    has_sufficient_platform_credits,
    post_credit_usage,
)
from ..core.litellm_service import litellm_service
from ..core.provider_registry import should_post_usage, validate_model, validate_provider
from ..core.schemas import STTRequest, STTResponse
from .stt_base import BaseSpeechToTextProvider


def _audio_bytes_from_data_uri(data_uri: str) -> bytes:
    """Decode a `data:<mime>;base64,<content>` URI into raw audio bytes."""
    try:
        header, b64 = data_uri.split(",", 1)
    except ValueError:
        raise HTTPException(status_code=400, detail="Audio input is not a valid data URI.")
    if ";base64" not in header:
        raise HTTPException(status_code=400, detail="Audio input is not base64-encoded.")
    return base64.b64decode(b64)


def _audio_duration_seconds(data_uri: str) -> float:
    """Return audio duration in seconds via pydub/ffmpeg."""
    try:
        _, b64 = data_uri.split(",", 1)
        audio = AudioSegment.from_file(io.BytesIO(base64.b64decode(b64)))
        return len(audio) / 1000.0
    except Exception as e:
        raise ValueError(f"Failed to process audio: {e}")


class LiteLLMSTTProvider(BaseSpeechToTextProvider):
    """STT provider that delegates to LiteLLM's `atranscription`."""

    async def transcribe(self, stt_request: STTRequest, user: User) -> STTResponse:
        """Transcribe audio using BYOK or the platform's environment credentials.

        When BYOK is enabled with a real credential id, those credentials are
        fetched from the vault and used exclusively. Otherwise the request runs
        on the platform's environment credentials and platform credits apply.
        """
        start_time = time.perf_counter()

        # Validate the provider/model with the request's credential mode.
        validate_provider(stt_request.provider, stt_request.is_byok_enabled, stt_request.credentials_id)
        validate_model(stt_request.provider, stt_request.model, stt_request.is_byok_enabled, stt_request.credentials_id)

        # # Platform credits apply only for non-BYOK requests.
        if not stt_request.is_byok_enabled and stt_request.credentials_id:
            self._check_credits(stt_request, user)

        try:
            # Normalize URL / local path / data URI into a base64 data URI, then
            # decode to raw bytes for the LiteLLM multipart audio upload.
            data_uri = file_to_base64(stt_request.input)
            audio_bytes = _audio_bytes_from_data_uri(data_uri)

            # Delegate the actual transcription to the LiteLLM transport.
            transcription_result = await litellm_service.transcribe(
                stt_request.provider,
                stt_request.model,
                file=audio_bytes,
                filename="audio",
                language=stt_request.language,
                is_byok=stt_request.is_byok_enabled,
                credential_id=stt_request.credentials_id,
                user=user,
            )
        except HTTPException:
            # Pass through provider-requested errors (e.g. 400 validation).
            raise
        except Exception as exc:
            # Normalize unexpected provider failures into a friendly 502.
            log_exception(logger, exc, "[LLM-STT] transcription error")
            raise HTTPException(
                status_code=502,
                detail=(
                    f"The request could not be processed by provider "
                    f"'{stt_request.provider}' for model '{stt_request.model}'. {friendly_error(exc)}"
                ),
            )

        # Extract the transcript text and build the response.
        transcript_text = getattr(transcription_result, "text", None) or ""
        return self._final_response(
            stt_request,
            start_time,
            transcript_text,
            user.access_token,
        )

    def _check_credits(self, stt_request: STTRequest, user: User) -> None:
        """Verify the request is eligible for platform-credit billing.

        Only non-BYOK requests are billed against the platform, so the platform
        account must have sufficient credits to proceed.
        """
        if not has_sufficient_platform_credits(user.access_token):
            raise HTTPException(status_code=400, detail="Insufficient credits.")

    def _final_response(
        self,
        stt_request: STTRequest,
        start_time: float,
        transcript_text: str,
        access_token: str,
    ) -> STTResponse:
        """Build the completed STT response and post credit usage.

        The audio duration is used both for the response metadata and as the
        billable unit count sent to the credit service.
        """
        response = STTResponse(
            provider=stt_request.provider,
            model=stt_request.model,
            output=transcript_text,
            status="completed",
            stream=False,
            credentials_id=stt_request.credentials_id,
            is_byok_enabled=stt_request.is_byok_enabled,
            time_taken=round(time.perf_counter() - start_time, 2),
            ref_id=stt_request.ref_id,
            ref_type=stt_request.ref_type,
            ref_name=stt_request.ref_name,
            agent_name=stt_request.agent_name,
            action=stt_request.action,
        )
        # Compute audio duration (seconds) for response metadata and billing.
        audio_duration_seconds = _audio_duration_seconds(file_to_base64(stt_request.input))
        response.duration_seconds = audio_duration_seconds
        response.token_count = audio_duration_seconds

        # Post credit usage only for platform (non-BYOK) requests.
        if should_post_usage(stt_request.is_byok_enabled, stt_request.credentials_id):
            try:
                post_credit_usage(stt_request, stt_request.provider, "service", audio_duration_seconds, access_token)
            except Exception as exc:
                logger.error(f"Failed to post STT credit usage | error={exc}")
                raise HTTPException(status_code=500, detail=f"Failed to post credit usage: {exc}")
        return response
