"""Provider transport for the realtime voice gateway.

The gateway owns the canonical client protocol; a :class:`RealtimeProviderSession`
translates to and from a provider's realtime wire protocol. The default session
drives LiteLLM's proxy-oriented ``_arealtime`` entrypoint so provider-specific
event translation stays owned by LiteLLM.

``open_provider_session`` is a module-level hook so the mocked pytest harness can
replace the provider peer without live credentials.
"""
from __future__ import annotations

import asyncio
import base64
import json
from dataclasses import dataclass
from typing import AsyncIterator, Optional, Protocol

from app.core.logger import logger

PROVIDER_OUTPUT_SAMPLE_RATE = 24000
PROVIDER_INPUT_SAMPLE_RATE = 16000

_AUDIO_DELTA_EVENTS = (
    "response.audio.delta",
    "response.output_audio.delta",
)
_TRANSCRIPT_DELTA_EVENTS = (
    "response.audio_transcript.delta",
    "response.output_audio_transcript.delta",
    "response.text.delta",
    "response.output_text.delta",
)
_TRANSCRIPT_DONE_EVENTS = (
    "response.audio_transcript.done",
    "response.output_audio_transcript.done",
)
_INPUT_TRANSCRIPT_DELTA_EVENTS = ("conversation.item.input_audio_transcription.delta",)
_INPUT_TRANSCRIPT_DONE_EVENTS = ("conversation.item.input_audio_transcription.completed",)

INPUT_TRANSCRIPTION_MODEL_BY_PROVIDER: dict[str, str | None] = {
    "openai": "whisper-1",
    "azure": "whisper-1",
    "gemini": "default",
    "vertex_ai": "default",
}


@dataclass
class ProviderAudio:
    """Provider audio output as raw PCM16 mono bytes."""

    pcm: bytes
    sample_rate: int


@dataclass
class ProviderTranscript:
    """A transcript fragment produced by the provider."""

    text: str
    final: bool = False
    role: str = "assistant"


ProviderEvent = ProviderAudio | ProviderTranscript


class RealtimeProviderError(Exception):
    """Raised when a provider session fails.

    ``retryable`` is true only for transient upstream failures, so the client can
    reconnect silently; configuration and auth failures stay non-retryable.
    """

    def __init__(self, message: str, *, retryable: bool = False) -> None:
        super().__init__(message)
        self.retryable = retryable


class RealtimeProviderSession(Protocol):
    """A duplex provider connection carrying PCM16 mono audio and transcripts."""

    output_sample_rate: int

    async def send_audio(self, pcm: bytes) -> None:
        """Forward canonical client audio to the provider."""

    async def send_commit(self) -> None:
        """Signal the provider that the current client turn is complete."""

    async def send_transcription_config(self, model: str) -> None:
        """Enable provider-side input transcription with the given model."""

    def events(self) -> AsyncIterator[ProviderEvent]:
        """Yield provider events until the upstream session ends."""

    async def close(self) -> None:
        """Release the provider connection."""


class ProviderConnector(Protocol):
    """Builds a live provider session for an allowlisted provider."""

    async def __call__(
        self,
        *,
        provider: str,
        model: str,
        credential_kwargs: dict,
        voice: Optional[str],
        language: Optional[str],
        input_sample_rate: int,
    ) -> RealtimeProviderSession: ...


class _ProviderSocketClosed(Exception):
    """Signals the bridge that the gateway stopped the provider socket."""


class _ProviderSocketAdapter:
    """In-memory WebSocket surface used to drive LiteLLM's ``_arealtime``.

    LiteLLM treats the ``websocket`` argument as the client socket: it awaits
    ``receive_text()`` for client frames and calls ``send_text()`` for provider
    frames. This adapter maps those calls onto the gateway's duplex queues.
    """

    def __init__(self) -> None:
        from starlette.websockets import WebSocketState

        self.to_provider: asyncio.Queue[str | None] = asyncio.Queue()
        self.from_provider: asyncio.Queue[dict | None] = asyncio.Queue()
        self.client_state = WebSocketState.CONNECTED
        self.application_state = WebSocketState.CONNECTED
        self.headers: dict = {}
        self.query_params: dict = {}
        self.cookies: dict = {}
        self.scope: dict = {"type": "websocket"}
        self.url = "/v2/llm/realtime/session"

    async def accept(self, *args, **kwargs) -> None:
        self.client_state = self.application_state

    async def close(self, code: int = 1000, reason: Optional[str] = None) -> None:
        await self.from_provider.put(None)

    async def connect(self) -> None:
        await self.accept()

    async def disconnect(self, code: int = 1000) -> None:
        await self.close(code)

    async def receive_text(self) -> str:
        message = await self.to_provider.get()
        if message is None:
            raise _ProviderSocketClosed()
        return message

    async def send_text(self, text: str) -> None:
        try:
            payload = json.loads(text)
        except json.JSONDecodeError:
            return
        await self.from_provider.put(payload)

    async def receive_bytes(self) -> bytes:
        return (await self.receive_text()).encode()

    async def send_bytes(self, data: bytes) -> None:
        await self.send_text(data.decode("utf-8", errors="ignore"))

    async def receive(self) -> dict:
        return {"type": "websocket.receive", "text": await self.receive_text()}

    async def send(self, message: dict) -> None:
        if message.get("text") is not None:
            await self.send_text(message["text"])
        elif message.get("bytes") is not None:
            await self.send_bytes(message["bytes"])


def _map_provider_event(payload: dict) -> Optional[ProviderEvent]:
    event_type = payload.get("type", "")

    if event_type in _AUDIO_DELTA_EVENTS and payload.get("delta"):
        return ProviderAudio(base64.b64decode(payload["delta"]), PROVIDER_OUTPUT_SAMPLE_RATE)

    if event_type in _TRANSCRIPT_DELTA_EVENTS:
        return ProviderTranscript(str(payload.get("delta", "")), False)

    if event_type in _TRANSCRIPT_DONE_EVENTS:
        return ProviderTranscript(str(payload.get("transcript", "")), True)

    if event_type in _INPUT_TRANSCRIPT_DELTA_EVENTS:
        return ProviderTranscript(str(payload.get("delta", "")), False, role="user")

    if event_type in _INPUT_TRANSCRIPT_DONE_EVENTS:
        return ProviderTranscript(str(payload.get("transcript", "")), True, role="user")

    if event_type == "error":
        detail = payload.get("error") or {}
        message = detail.get("message") if isinstance(detail, dict) else None
        raise RealtimeProviderError(message or "Provider realtime session failed.", retryable=True)

    return None


class LiteLLMRealtimeSession:
    """Realtime provider session backed by LiteLLM's ``_arealtime`` entrypoint."""

    def __init__(
        self,
        *,
        model: str,
        credential_kwargs: dict,
        voice: Optional[str],
        language: Optional[str],
    ) -> None:
        self.model = model
        self.output_sample_rate = PROVIDER_OUTPUT_SAMPLE_RATE
        self._credential_kwargs = credential_kwargs
        self._voice = voice
        self._language = language
        self._socket = _ProviderSocketAdapter()
        self._bridge_task: Optional[asyncio.Task] = None

    async def start(self) -> None:
        self._bridge_task = asyncio.create_task(self._run_bridge())

    async def _run_bridge(self) -> None:
        import litellm

        try:
            await litellm._arealtime(  # noqa: SLF001
                model=self.model,
                websocket=self._socket,
                **self._credential_kwargs,
            )
        except _ProviderSocketClosed:
            pass
        except Exception as error:  # noqa: BLE001
            logger.error(f"[REALTIME] Provider bridge failed: {error}")
            await self._socket.from_provider.put(
                {"type": "error", "error": {"message": str(error) or "Provider realtime session failed."}}
            )
        finally:
            await self._socket.from_provider.put(None)

    async def send_audio(self, pcm: bytes) -> None:
        await self._socket.to_provider.put(
            json.dumps(
                {
                    "type": "input_audio_buffer.append",
                    "audio": base64.b64encode(pcm).decode("ascii"),
                }
            )
        )

    async def send_commit(self) -> None:
        await self._socket.to_provider.put(json.dumps({"type": "input_audio_buffer.commit"}))

    async def send_transcription_config(self, model: str) -> None:
        await self._socket.to_provider.put(
            json.dumps(
                {
                    "type": "session.update",
                    "session": {"input_audio_transcription": {"model": model}},
                }
            )
        )

    async def events(self) -> AsyncIterator[ProviderEvent]:
        while True:
            payload = await self._socket.from_provider.get()
            if payload is None:
                return
            event = _map_provider_event(payload)
            if event is not None:
                yield event

    async def close(self) -> None:
        await self._socket.to_provider.put(None)
        if self._bridge_task is not None:
            self._bridge_task.cancel()
            self._bridge_task = None


async def open_provider_session(
    *,
    provider: str,
    model: str,
    credential_kwargs: dict,
    voice: Optional[str],
    language: Optional[str],
    input_sample_rate: int,
) -> RealtimeProviderSession:
    """Open a live provider session through LiteLLM."""
    session = LiteLLMRealtimeSession(
        model=model,
        credential_kwargs=credential_kwargs,
        voice=voice,
        language=language,
    )
    await session.start()
    return session


__all__ = [
    "ProviderAudio",
    "ProviderConnector",
    "ProviderEvent",
    "ProviderTranscript",
    "RealtimeProviderError",
    "RealtimeProviderSession",
    "LiteLLMRealtimeSession",
    "open_provider_session",
    "INPUT_TRANSCRIPTION_MODEL_BY_PROVIDER",
    "PROVIDER_INPUT_SAMPLE_RATE",
    "PROVIDER_OUTPUT_SAMPLE_RATE",
]
