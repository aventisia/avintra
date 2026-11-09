"""In-process LiteLLM speech synthesis for one LiveKit voice session.

Chat deltas are buffered into complete sentences so the first sentence is
spoken while the rest of the answer is still streaming. A sentence cut at the
safe maximum keeps providers that never emit punctuation speaking. LiveKit
cancels this stream on interruption, which cancels the in-flight provider call
and the queued playback.
"""

from __future__ import annotations

import asyncio
import base64
import re
from typing import Awaitable, Callable

from livekit import rtc
from livekit.agents import tts
from livekit.agents.types import DEFAULT_API_CONNECT_OPTIONS, APIConnectOptions
from livekit.agents.utils import codecs, shortuuid

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.litellm.core.schemas import PronunciationEntry, TTSRequest, TTSResponse
from app.features.litellm.tts.litellm_tts_provider import LiteLLMTTSProvider

from .events import VoiceSessionEvents
from .metadata import VoiceJobClaims

SAMPLE_RATE = 24000
MAX_SENTENCE_CHARS = 200

_SENTENCE_BOUNDARY = re.compile(r"[.!?…]+[\"'”’)\]]*\s+|[。！？｡]+")

SynthesizeSpeech = Callable[[TTSRequest, User], Awaitable[TTSResponse]]


class SentenceBuffer:
    """Accumulate deltas and emit complete sentences in order."""

    def __init__(self, max_chars: int = MAX_SENTENCE_CHARS) -> None:
        self._max_chars = max_chars
        self._buffer = ""

    def push(self, text: str) -> list[str]:
        self._buffer += text
        sentences: list[str] = []

        while True:
            boundary = _SENTENCE_BOUNDARY.search(self._buffer)
            if boundary and boundary.end() <= self._max_chars:
                sentence = self._buffer[: boundary.end()].strip()
                self._buffer = self._buffer[boundary.end() :]
                if sentence:
                    sentences.append(sentence)
                continue

            if len(self._buffer) >= self._max_chars:
                cut = self._buffer.rfind(" ", 0, self._max_chars)
                if cut > 0:
                    sentence = self._buffer[:cut].strip()
                    self._buffer = self._buffer[cut + 1 :]
                else:
                    sentence = self._buffer[: self._max_chars].strip()
                    self._buffer = self._buffer[self._max_chars :]
                if sentence:
                    sentences.append(sentence)
                continue

            return sentences

    def flush(self) -> list[str]:
        sentence = self._buffer.strip()
        self._buffer = ""
        return [sentence] if sentence else []


def build_tts_request(claims: VoiceJobClaims, agent_settings: dict) -> TTSRequest:
    """Build the request template; each sentence only replaces its input."""

    tts_settings = agent_settings.get("tts") or {}
    voice_settings = agent_settings.get("ttsVoice") or {}
    agent_name = agent_settings.get("agentName") or ""
    speed = voice_settings.get("speed")
    pronunciations = [
        PronunciationEntry(term=entry["term"], pronunciation=entry["pronunciation"])
        for entry in agent_settings.get("pronunciations") or []
        if entry.get("term") and entry.get("pronunciation")
    ]

    return TTSRequest(
        provider=tts_settings.get("provider") or "",
        model=tts_settings.get("model") or "",
        input="",
        voice_id=voice_settings.get("voice") or None,
        language=voice_settings.get("language") or None,
        speed=speed if speed is not None else 1.0,
        pronunciations=pronunciations or None,
        credential_name=tts_settings.get("credentialName") or None,
        is_byok_enabled=bool(tts_settings.get("isByokEnabled")),
        ref_type="Agent",
        ref_id=str(claims.flow_id),
        ref_name=agent_name,
        action="AgentExecution",
        agent_name=agent_name or None,
    )


async def _decode_audio(output: str | None) -> list[rtc.AudioFrame]:
    """Decode the provider's base64 audio into mono 24 kHz PCM frames."""

    if not output:
        return []

    raw = base64.b64decode(output)
    decoder = codecs.AudioStreamDecoder(
        sample_rate=SAMPLE_RATE,
        num_channels=1,
        format="audio/wav" if raw[:4] == b"RIFF" else None,
    )
    try:
        decoder.push(raw)
        decoder.end_input()
        return [frame async for frame in decoder]
    finally:
        await decoder.aclose()


class LiteLLMTTS(tts.TTS):
    """Sentence-buffered TTS backed by the LiteLLM TTS provider."""

    def __init__(
        self,
        *,
        request: TTSRequest,
        user: User,
        synthesize_speech: SynthesizeSpeech | None = None,
        events: VoiceSessionEvents | None = None,
    ) -> None:
        super().__init__(
            capabilities=tts.TTSCapabilities(streaming=True),
            sample_rate=SAMPLE_RATE,
            num_channels=1,
        )
        self._request = request
        self._user = user
        self._synthesize_speech = synthesize_speech or LiteLLMTTSProvider().synthesize
        self._session_events = events

    @property
    def model(self) -> str:
        return self._request.model

    @property
    def provider(self) -> str:
        return self._request.provider

    def synthesize(
        self,
        text: str,
        *,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
    ) -> tts.ChunkedStream:
        return self._synthesize_with_stream(text, conn_options=conn_options)

    def stream(
        self,
        *,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
    ) -> tts.SynthesizeStream:
        return LiteLLMTTSSynthesizeStream(
            tts_instance=self,
            conn_options=conn_options,
            events=self._session_events,
        )

    async def _synthesize_sentence(self, sentence: str) -> list[rtc.AudioFrame]:
        request = self._request.model_copy(update={"input": sentence})
        response = await self._synthesize_speech(request, self._user)
        return await _decode_audio(response.output)


class LiteLLMTTSSynthesizeStream(tts.SynthesizeStream):
    """Speak each buffered sentence as soon as it is complete."""

    def __init__(
        self,
        *,
        tts_instance: LiteLLMTTS,
        conn_options: APIConnectOptions,
        events: VoiceSessionEvents | None,
    ) -> None:
        super().__init__(tts=tts_instance, conn_options=conn_options)
        self._adapter = tts_instance
        self._sentences = SentenceBuffer()
        self._session_events = events
        self._first_audio_sent = False

    async def _run(self, output_emitter: tts.AudioEmitter) -> None:
        output_emitter.initialize(
            request_id=shortuuid(),
            sample_rate=self._adapter.sample_rate,
            num_channels=self._adapter.num_channels,
            mime_type="audio/pcm",
        )

        async for chunk in self._input_ch:
            if isinstance(chunk, tts.SynthesizeStream._FlushSentinel):
                await self._speak(output_emitter, self._sentences.flush())
                continue
            await self._speak(output_emitter, self._sentences.push(chunk))

        await self._speak(output_emitter, self._sentences.flush())

    async def _speak(self, output_emitter: tts.AudioEmitter, sentences: list[str]) -> None:
        for sentence in sentences:
            try:
                frames = await self._adapter._synthesize_sentence(sentence)
            except asyncio.CancelledError:
                raise
            except Exception as error:
                logger.warning(
                    "[voice-agent] speech synthesis failed: %s",
                    type(error).__name__,
                )
                continue
            for frame in frames:
                output_emitter.push_frame(frame)
                if not self._first_audio_sent and self._session_events is not None:
                    self._first_audio_sent = True
                    self._session_events.tts_first_audio()
