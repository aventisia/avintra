"""Stable session events for one LiveKit voice call.

The worker publishes these on the ``avintra.voice`` data topic so the caller UI
does not have to depend on LiveKit's internal event shapes. Event names,
error codes, and close codes stay fixed across pipeline versions.
"""

from __future__ import annotations

import asyncio
import json
import time
from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable

from livekit import rtc

from app.core.logger import logger
from .contracts import (
    ERROR_CODE_CREDENTIALS_UNAVAILABLE,
    ERROR_CODE_INVALID_CONFIG,
    ERROR_CODE_UNSUPPORTED_PROVIDER,
    ERROR_CODE_UPSTREAM,
    WS_CLOSE_BAD_CONFIG,
    WS_CLOSE_FORBIDDEN,
    WS_CLOSE_NORMAL,
    WS_CLOSE_UPSTREAM_FAILURE,
)

VOICE_EVENT_TOPIC = "avintra.voice"

SessionEventPublisher = Callable[[dict[str, Any]], None]
TurnTimingRecorder = Callable[[int, dict[str, int | None]], Awaitable[None]]

_CLOSE_CODES = {
    "participant_disconnected": WS_CLOSE_NORMAL,
    "user_initiated": WS_CLOSE_NORMAL,
    "task_completed": WS_CLOSE_NORMAL,
    "job_shutdown": WS_CLOSE_NORMAL,
    "error": WS_CLOSE_UPSTREAM_FAILURE,
}

_ERROR_CLOSE_CODES = {
    ERROR_CODE_INVALID_CONFIG: WS_CLOSE_BAD_CONFIG,
    ERROR_CODE_UNSUPPORTED_PROVIDER: WS_CLOSE_BAD_CONFIG,
    ERROR_CODE_CREDENTIALS_UNAVAILABLE: WS_CLOSE_FORBIDDEN,
}

_AGENT_STATES = {
    "initializing": "connecting",
    "idle": "idle",
    "listening": "listening",
    "thinking": "processing",
    "speaking": "speaking",
}


def configuration_error_code(
    *,
    provider: str | None,
    model: str | None,
    is_byok_enabled: bool,
    credential_name: str | None,
) -> str | None:
    """Map a missing provider setting to the S4 error-code taxonomy."""

    if not provider or not model:
        return ERROR_CODE_INVALID_CONFIG
    if is_byok_enabled and not credential_name:
        return ERROR_CODE_CREDENTIALS_UNAVAILABLE
    return None


def close_code_for(reason: str, *, error: bool = False, code: str | None = None) -> int:
    """Map a session close reason to the S4 close-code taxonomy."""

    if code in _ERROR_CLOSE_CODES:
        return _ERROR_CLOSE_CODES[code]
    if error:
        return WS_CLOSE_UPSTREAM_FAILURE
    return _CLOSE_CODES.get(reason, WS_CLOSE_NORMAL)


class RoomEventPublisher:
    """Publish session events to the room without blocking the audio path."""

    def __init__(self, room: rtc.Room) -> None:
        self._room = room
        self._tasks: set[asyncio.Task[None]] = set()

    def __call__(self, payload: dict[str, Any]) -> None:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            return

        task = loop.create_task(self._publish(payload))
        self._tasks.add(task)
        task.add_done_callback(self._tasks.discard)

    async def _publish(self, payload: dict[str, Any]) -> None:
        try:
            await self._room.local_participant.publish_data(
                json.dumps(payload, default=str).encode("utf-8"),
                reliable=True,
                topic=VOICE_EVENT_TOPIC,
            )
        except Exception as error:
            logger.debug(
                "[voice-agent] session event publish failed: %s",
                type(error).__name__,
            )

    async def aclose(self) -> None:
        if self._tasks:
            await asyncio.gather(*list(self._tasks), return_exceptions=True)


@dataclass
class _Turn:
    id: int
    started_at: float
    has_reference: bool
    stt_ms: int | None = None
    caller_stopped_at: float | None = None
    caller_final_at: float | None = None
    first_delta_at: float | None = None
    first_audio_at: float | None = None
    parts: list[str] = field(default_factory=list)


class VoiceSessionEvents:
    """Build and publish the stable event stream for one conversation."""

    def __init__(
        self,
        conversation_id: str,
        *,
        publish: SessionEventPublisher | None = None,
        persist_turn: TurnTimingRecorder | None = None,
    ) -> None:
        self._conversation_id = conversation_id
        self._publish = publish
        self._persist_turn = persist_turn
        self._started_at = time.perf_counter()
        self._state: str | None = None
        self._turn: _Turn | None = None
        self._next_turn_id = 0
        self._closed = False
        self._speech_end_at: float | None = None
        self._stt_ms: int | None = None
        self._caller_speaking = False
        self._caller_stopped_at: float | None = None
        self._caller_final_at: float | None = None
        self._turn_tasks: set[asyncio.Task[None]] = set()

    def state(self, state: str, previous: str | None = None) -> None:
        self._set_state(
            _AGENT_STATES.get(state, state),
            _AGENT_STATES.get(previous or "", previous),
        )

    def user_state(self, state: str) -> None:
        """Reflect microphone activity before LiveKit commits the caller's turn.

        LiveKit reports ``thinking`` only once the final transcript arrives, which
        can be many seconds after the caller stopped speaking.
        """

        if state == "speaking":
            self._caller_speaking = True
            if self._state == "processing":
                self._set_state("listening", "processing")
            return
        if state == "listening":
            if self._caller_speaking:
                self._caller_speaking = False
                self._caller_stopped_at = time.perf_counter()
            if self._state in ("idle", "listening"):
                self._set_state("processing", self._state)

    def empty_transcript(self) -> None:
        """Return to listening when the caller's utterance produced no transcript."""

        self._caller_stopped_at = None
        self._caller_final_at = None
        if self._state == "processing":
            self._set_state("listening", "processing")

    def _set_state(self, stable: str, previous: str | None) -> None:
        if stable == self._state:
            return
        self._state = stable
        self._emit("session.state", state=stable, previousState=previous)

    def caller_interim(self, text: str) -> None:
        """Publish the in-progress caller transcript a streaming STT reports."""

        text = text.strip()
        if not text:
            return
        self._emit("transcript.interim", role="user", text=text)

    def caller_transcript(self, text: str) -> None:
        text = text.strip()
        if not text:
            return
        self._caller_final_at = time.perf_counter()
        if self._turn is not None and self._turn.caller_final_at is None:
            self._turn.caller_final_at = self._caller_final_at
            self._turn.has_reference = True
        self._emit("transcript.final", role="user", text=text)

    def assistant_transcript(self, text: str, *, turn_id: int | None = None) -> None:
        """Publish a finalized assistant transcript."""

        text = text.strip()
        if not text:
            return
        self._emit("transcript.final", role="assistant", text=text, turnId=turn_id)

    def realtime_response_timing(
        self, timing: dict[str, int], first_audio_ms: int | None = None
    ) -> dict[str, int | None]:
        """Publish a realtime response's provider latency in the turn format."""

        voice_timing: dict[str, int | None] = {
            "stt_ms": None,
            "llm_first_token_ms": None,
            "tts_first_audio_ms": first_audio_ms,
            "turn_total_ms": None,
            "endpointing_ms": None,
            "caller_to_speaking_ms": first_audio_ms,
            "ttft_ms": timing.get("ttft_ms"),
            "duration_ms": timing.get("duration_ms"),
        }
        self._emit(
            "timing",
            stage="turn",
            durationMs=voice_timing["duration_ms"],
            voice_turn_timing=voice_timing,
        )
        return voice_timing

    def stt_final(self, duration_ms: int) -> None:
        """Record the end and duration of the final speech-to-text call."""

        self._speech_end_at = time.perf_counter()
        self._stt_ms = max(0, round(duration_ms))

    def begin_turn(self) -> int:
        if self._turn is not None:
            self.cancel_turn(self._turn.id)
        reference_at = self._speech_end_at or self._caller_final_at
        self._next_turn_id += 1
        self._turn = _Turn(
            id=self._next_turn_id,
            started_at=reference_at or time.perf_counter(),
            has_reference=reference_at is not None,
            stt_ms=self._stt_ms,
            caller_stopped_at=self._caller_stopped_at,
            caller_final_at=self._caller_final_at,
        )
        self._speech_end_at = None
        self._stt_ms = None
        self._caller_stopped_at = None
        self._caller_final_at = None
        return self._turn.id

    def assistant_delta(self, turn_id: int, text: str) -> None:
        turn = self._matching_turn(turn_id)
        if turn is None or not text:
            return
        if turn.first_delta_at is None:
            turn.first_delta_at = time.perf_counter()
        turn.parts.append(text)

    def tts_first_audio(self) -> None:
        """Record the first audio frame of the active turn."""

        turn = self._turn
        if turn is not None and turn.first_audio_at is None:
            turn.first_audio_at = time.perf_counter()

    def finish_turn(self, turn_id: int, *, persist: bool = True) -> None:
        turn = self._matching_turn(turn_id)
        if turn is None:
            return
        self._turn = None
        text = "".join(turn.parts).strip()
        if text:
            self._emit(
                "transcript.final",
                role="assistant",
                text=text,
                turnId=turn.id,
            )
        timing = self._emit_turn_timing(turn, interrupted=False)
        if persist:
            self._persist_timing(turn, timing)

    def cancel_turn(self, turn_id: int) -> None:
        turn = self._matching_turn(turn_id)
        if turn is None:
            return
        self._turn = None
        self._emit_turn_timing(turn, interrupted=True)

    def tool_call(self, payload: Any, *, turn_id: int | None = None) -> None:
        self._emit("tool.call", tool=payload, turnId=turn_id)

    def skill_call(self, name: str, *, turn_id: int | None = None) -> None:
        name = name.strip()
        if not name:
            return
        self._emit("skill.call", skill=name, turnId=turn_id)

    def error(
        self,
        code: str,
        message: str,
        *,
        retryable: bool = False,
        turn_id: int | None = None,
    ) -> None:
        self._emit(
            "error",
            code=code,
            message=message,
            retryable=retryable,
            turnId=turn_id,
        )

    def close(
        self,
        reason: str,
        *,
        error: bool = False,
        code: str | None = None,
    ) -> None:
        if self._closed:
            return
        self._closed = True
        self._emit(
            "timing",
            stage="session",
            durationMs=milliseconds(time.perf_counter() - self._started_at),
        )
        self._emit(
            "session.closed",
            reason=reason,
            code=close_code_for(reason, error=error, code=code),
        )

    async def aclose(self) -> None:
        if self._turn_tasks:
            await asyncio.gather(*list(self._turn_tasks), return_exceptions=True)
        closer = getattr(self._publish, "aclose", None)
        if closer is not None:
            await closer()

    def _matching_turn(self, turn_id: int) -> _Turn | None:
        return self._turn if self._turn is not None and self._turn.id == turn_id else None

    def _emit_turn_timing(
        self,
        turn: _Turn,
        *,
        interrupted: bool,
    ) -> dict[str, int | None]:
        completed_at = time.perf_counter()
        has_reference = turn.has_reference
        first_delta_ms = (
            milliseconds(turn.first_delta_at - turn.started_at)
            if has_reference and turn.first_delta_at is not None
            else None
        )
        timing = {
            "stt_ms": turn.stt_ms,
            "llm_first_token_ms": first_delta_ms,
            "tts_first_audio_ms": (
                milliseconds(turn.first_audio_at - turn.started_at)
                if has_reference and turn.first_audio_at is not None
                else None
            ),
            "turn_total_ms": (
                milliseconds(completed_at - turn.started_at) if has_reference else None
            ),
            "endpointing_ms": _elapsed_ms(turn.caller_stopped_at, turn.caller_final_at),
            "caller_to_speaking_ms": _elapsed_ms(
                turn.caller_stopped_at, turn.first_audio_at
            ),
        }
        self._emit(
            "timing",
            stage="turn",
            turnId=turn.id,
            durationMs=timing["turn_total_ms"],
            firstDeltaMs=first_delta_ms,
            interrupted=interrupted,
            voice_turn_timing=timing,
        )
        return timing

    def _persist_timing(self, turn: _Turn, timing: dict[str, int | None]) -> None:
        if self._persist_turn is None:
            return
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            return

        task = loop.create_task(self._persist_turn(turn.id, timing))
        self._turn_tasks.add(task)

        def _done(completed: asyncio.Task[None]) -> None:
            self._turn_tasks.discard(completed)
            if not completed.cancelled() and completed.exception() is not None:
                logger.warning(
                    "[voice-agent] turn timing persistence failed: %s",
                    type(completed.exception()).__name__,
                )

        task.add_done_callback(_done)

    def _emit(self, event_type: str, **fields: Any) -> None:
        payload = {
            "type": event_type,
            "conversationId": self._conversation_id,
            "timestamp": time.time(),
            **fields,
        }
        if self._publish is not None:
            self._publish(payload)


def milliseconds(seconds: float) -> int:
    return max(0, round(seconds * 1000))


def _elapsed_ms(start: float | None, end: float | None) -> int | None:
    if start is None or end is None or end < start:
        return None
    return milliseconds(end - start)


def error_code_for_source(_source: Any) -> str:
    """LiveKit provider failures are upstream errors in the S4 taxonomy."""

    return ERROR_CODE_UPSTREAM
