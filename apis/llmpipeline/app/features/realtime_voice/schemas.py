"""Canonical JSON frames for the realtime voice gateway.

The browser speaks these frames over ``WS /v2/llm/realtime/session``; audio is
always base64-encoded PCM16 mono at the canonical client sample rate. Provider
wire protocols and sample rates are translated inside the gateway.
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ValidationError

REALTIME_PROVIDERS: tuple[str, ...] = (
    "openai",
    "azure",
    "gemini",
    "vertex_ai",
    "xai",
    "bedrock",
)

CANONICAL_SAMPLE_RATE = 16000

WS_CLOSE_NORMAL = 1000
WS_CLOSE_UPSTREAM_FAILURE = 1011
WS_CLOSE_BAD_CONFIG = 4400
WS_CLOSE_UNAUTHORIZED = 4401
WS_CLOSE_FORBIDDEN = 4403

ERROR_CODE_INVALID_FRAME = "invalid_frame"
ERROR_CODE_UNSUPPORTED_PROVIDER = "unsupported_provider"
ERROR_CODE_UNSUPPORTED_MODEL = "unsupported_model"
ERROR_CODE_INVALID_CONFIG = "invalid_config"
ERROR_CODE_CREDENTIALS_UNAVAILABLE = "credentials_unavailable"
ERROR_CODE_MODEL_NOT_ENABLED = "model_not_enabled"
ERROR_CODE_UPSTREAM = "upstream_error"


class SessionStartFrame(BaseModel):
    """Client request that opens a provider session."""

    type: Literal["session.start"]
    provider: str
    model: str
    credential_name: str = ""
    voice: str | None = None
    language: str | None = None


class InputAudioChunkFrame(BaseModel):
    """Client audio chunk in canonical PCM16 mono."""

    type: Literal["input_audio_chunk"]
    audio_base64: str
    sample_rate: int = CANONICAL_SAMPLE_RATE
    commit: bool = False


class SessionStopFrame(BaseModel):
    """Client-initiated graceful end of the session."""

    type: Literal["session.stop"]


class SessionReadyFrame(BaseModel):
    """Server acknowledgement once the provider session is live."""

    type: Literal["session.ready"] = "session.ready"
    provider: str
    model: str
    output_sample_rate: int


class SessionClosedFrame(BaseModel):
    """Server acknowledgement of a client-initiated graceful end."""

    type: Literal["session.closed"] = "session.closed"


class OutputAudioChunkFrame(BaseModel):
    """Provider audio chunk at the provider-native sample rate."""

    type: Literal["output_audio_chunk"] = "output_audio_chunk"
    audio_base64: str
    sample_rate: int


class TranscriptDeltaFrame(BaseModel):
    """A transcript fragment produced by the provider."""

    type: Literal["transcript.delta"] = "transcript.delta"
    text: str
    final: bool = False


class ErrorFrame(BaseModel):
    """A non-silent failure report; ``retryable`` is true only for transient blips."""

    type: Literal["error"] = "error"
    code: str
    message: str
    retryable: bool = False


ClientFrame = SessionStartFrame | InputAudioChunkFrame | SessionStopFrame

_CLIENT_FRAME_MODELS: dict[str, type[BaseModel]] = {
    "session.start": SessionStartFrame,
    "input_audio_chunk": InputAudioChunkFrame,
    "session.stop": SessionStopFrame,
}


def parse_client_frame(payload: dict) -> ClientFrame:
    """Parse a decoded client frame.

    Unknown or malformed frames raise ``ValueError`` so the gateway can report
    them explicitly instead of dropping them silently.
    """
    frame_model = _CLIENT_FRAME_MODELS.get(payload.get("type"))
    if frame_model is None:
        raise ValueError(f"Unknown frame type: {payload.get('type')!r}")

    try:
        return frame_model.model_validate(payload)  # type: ignore[return-value]
    except ValidationError as error:
        first = error.errors()[0] if error.errors() else {}
        raise ValueError(f"Invalid {payload.get('type')} frame: {first.get('msg', 'invalid payload')}") from error
