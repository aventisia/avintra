"""In-process LiteLLM speech-to-text for one LiveKit voice session.

Silero VAD decides where each utterance ends and LiveKit's ``StreamAdapter``
calls this non-streaming STT once with the whole utterance, so the worker never
loops back through the public ``/stt/transcribe`` endpoint.
"""

from __future__ import annotations

import base64
import io
import time
import wave
from typing import Awaitable, Callable

from livekit import rtc
from livekit.agents import stt, utils
from livekit.agents.types import DEFAULT_API_CONNECT_OPTIONS, NOT_GIVEN, APIConnectOptions, NotGivenOr

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.litellm.core.schemas import STTRequest, STTResponse
from app.features.litellm.stt.litellm_stt_provider import LiteLLMSTTProvider

from .events import VoiceSessionEvents
from .metadata import VoiceJobClaims

Transcribe = Callable[[STTRequest, User], Awaitable[STTResponse]]


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
