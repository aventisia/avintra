"""In-process speech-to-text for one LiveKit voice session.

Silero VAD still decides where each utterance ends. ``scribe_v2_realtime`` runs
through the ElevenLabs LiveKit plugin so interim transcripts and the turn final
arrive over one websocket; every other model keeps LiveKit's ``StreamAdapter``
over the non-streaming LiteLLM adapter, so the worker never loops back through
the public ``/stt/transcribe`` endpoint.
"""

from __future__ import annotations

import base64
import io
import time
import wave
from typing import Awaitable, Callable

from livekit import rtc
from livekit.agents import stt, utils, vad as vad_module
from livekit.agents.types import DEFAULT_API_CONNECT_OPTIONS, NOT_GIVEN, APIConnectOptions, NotGivenOr
from livekit.plugins import elevenlabs

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.litellm.core.credentials import resolve_credentials
from app.features.litellm.core.schemas import STTRequest, STTResponse
from app.features.litellm.stt.litellm_stt_provider import LiteLLMSTTProvider

from .contracts import ERROR_CODE_CREDENTIALS_UNAVAILABLE
from .events import VoiceSessionEvents
from .metadata import VoiceJobClaims

STREAMING_STT_MODEL = "scribe_v2_realtime"

Transcribe = Callable[[STTRequest, User], Awaitable[STTResponse]]


class STTConfigurationError(Exception):
    """A streaming STT provider cannot be executed; no provider call is made."""

    def __init__(self, message: str, *, code: str) -> None:
        super().__init__(message)
        self.code = code


def uses_streaming_stt(request: STTRequest) -> bool:
    """True when the resolved model is ElevenLabs' realtime Scribe model."""

    return (
        request.provider.strip().lower() == "elevenlabs"
        and request.model.strip().lower() == STREAMING_STT_MODEL
    )


def build_stt(
    *,
    request: STTRequest,
    user: User,
    vad: vad_module.VAD,
    events: VoiceSessionEvents | None = None,
) -> stt.STT:
    """Build the streaming ElevenLabs STT, or the batch adapter for other models."""

    if uses_streaming_stt(request):
        return _build_streaming_stt(request, user)
    return stt.StreamAdapter(
        stt=LiteLLMSTT(request=request, user=user, events=events),
        vad=vad,
    )


def _build_streaming_stt(request: STTRequest, user: User) -> stt.STT:
    try:
        credentials = resolve_credentials(
            request.provider,
            request.is_byok_enabled,
            request.credential_name,
            user,
        )
    except Exception as error:
        raise STTConfigurationError(
            "The speech-to-text credential could not be resolved.",
            code=ERROR_CODE_CREDENTIALS_UNAVAILABLE,
        ) from error

    api_key = credentials.kwargs.get("api_key")
    if not api_key:
        raise STTConfigurationError(
            "Streaming speech-to-text requires an ElevenLabs API key.",
            code=ERROR_CODE_CREDENTIALS_UNAVAILABLE,
        )

    options: dict = {"api_key": api_key, "model": STREAMING_STT_MODEL}
    if credentials.kwargs.get("api_base"):
        options["base_url"] = credentials.kwargs["api_base"]
    if request.language:
        options["language_code"] = request.language
    return elevenlabs.STT(**options)


def build_stt_request(claims: VoiceJobClaims, agent_settings: dict) -> STTRequest:
    """Build the request template; each utterance only replaces its audio input."""

    stt_settings = agent_settings.get("stt") or {}
    agent_name = agent_settings.get("agentName") or ""
    return STTRequest(
        provider=stt_settings.get("provider") or "",
        model=stt_settings.get("model") or "",
        input="",
        language=(agent_settings.get("ttsVoice") or {}).get("language"),
        credential_name=stt_settings.get("credentialName") or None,
        is_byok_enabled=bool(stt_settings.get("isByokEnabled")),
        ref_type="Agent",
        ref_id=str(claims.flow_id),
        ref_name=agent_name,
        action="AgentExecution",
        agent_name=agent_name or None,
    )


def build_user(claims: VoiceJobClaims) -> User:
    """Build the principal the STT provider uses for vault and credit calls."""

    return User(
        user_id=claims.user_id,
        username=claims.username or str(claims.user_id),
        email=claims.email or None,
        roles=[],
        tenant_id=claims.tenant_id,
        access_token=claims.worker_token,
        space_id=claims.space_id or None,
        env_type=claims.env_type,
    )


def _wav_data_uri(frame: rtc.AudioFrame) -> str:
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav:
        wav.setnchannels(frame.num_channels)
        wav.setsampwidth(2)
        wav.setframerate(frame.sample_rate)
        wav.writeframes(bytes(frame.data))
    return "data:audio/wav;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")


class LiteLLMSTT(stt.STT):
    """Non-streaming STT that LiveKit's ``StreamAdapter`` feeds per VAD utterance."""

    def __init__(
        self,
        *,
        request: STTRequest,
        user: User,
        transcribe: Transcribe | None = None,
        events: VoiceSessionEvents | None = None,
    ) -> None:
        super().__init__(capabilities=stt.STTCapabilities(streaming=False, interim_results=False))
        self._request = request
        self._user = user
        self._transcribe = transcribe or LiteLLMSTTProvider().transcribe
        self._session_events = events

    @property
    def model(self) -> str:
        return self._request.model

    @property
    def provider(self) -> str:
        return self._request.provider

    async def _recognize_impl(
        self,
        buffer: utils.AudioBuffer,
        *,
        language: NotGivenOr[str] = NOT_GIVEN,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
    ) -> stt.SpeechEvent:
        if isinstance(buffer, list) and not buffer:
            self._report_empty_transcript()
            return stt.SpeechEvent(type=stt.SpeechEventType.FINAL_TRANSCRIPT)

        started_at = time.perf_counter()
        frame = utils.merge_frames(buffer)
        request = self._request.model_copy(
            update={
                "input": _wav_data_uri(frame),
                "language": language if utils.is_given(language) and language else self._request.language,
            }
        )

        try:
            response = await self._transcribe(request, self._user)
        except Exception as error:
            logger.warning("[voice-agent] speech-to-text failed: %s", type(error).__name__)
            self._report_empty_transcript()
            return stt.SpeechEvent(type=stt.SpeechEventType.FINAL_TRANSCRIPT)

        text = (response.output or "").strip()
        if not text:
            self._report_empty_transcript()
            return stt.SpeechEvent(type=stt.SpeechEventType.FINAL_TRANSCRIPT)

        if self._session_events is not None:
            self._session_events.stt_final(round((time.perf_counter() - started_at) * 1000))

        return stt.SpeechEvent(
            type=stt.SpeechEventType.FINAL_TRANSCRIPT,
            alternatives=[stt.SpeechData(language=request.language or "", text=text)],
        )

    def _report_empty_transcript(self) -> None:
        if self._session_events is not None:
            self._session_events.empty_transcript()
