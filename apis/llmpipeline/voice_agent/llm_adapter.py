"""LiveKit ``llm.LLM`` adapter that delegates each turn to the chat bridge.

LiveKit sees a normal text stream, but the adapter forwards only the newest
caller utterance to the engine and ignores LiveKit's own chat history and
tools. The engine is the single owner of history and tool execution.
"""

from __future__ import annotations

import asyncio
from uuid import uuid4

from livekit.agents import llm
from livekit.agents.types import (
    DEFAULT_API_CONNECT_OPTIONS,
    NOT_GIVEN,
    APIConnectOptions,
    NotGivenOr,
)

from app.core.logger import logger

from .chat_bridge import VOICE_FALLBACK_APOLOGY, VoiceChatBridge
from .events import VoiceSessionEvents, error_code_for_source


def latest_user_text(chat_ctx: llm.ChatContext) -> str:
    """Return only the newest caller utterance from LiveKit's chat context."""

    for item in reversed(chat_ctx.items):
        if isinstance(item, llm.ChatMessage) and item.role == "user":
            return (item.text_content or "").strip()
    return ""


class VoiceEngineLLM(llm.LLM):
    """An ``LLM`` whose every turn is one call into ``VoiceChatBridge``."""

    def __init__(
        self,
        *,
        bridge: VoiceChatBridge,
        model: str,
        provider: str,
        events: VoiceSessionEvents | None = None,
    ) -> None:
        super().__init__()
        self._bridge = bridge
        self._model = model
        self._provider = provider
        self._session_events = events

    @property
    def model(self) -> str:
        return self._model

    @property
    def provider(self) -> str:
        return self._provider

    def chat(
        self,
        *,
        chat_ctx: llm.ChatContext,
        tools: list[llm.Tool] | None = None,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
        parallel_tool_calls: NotGivenOr[bool] = NOT_GIVEN,
        tool_choice: NotGivenOr[llm.ToolChoice] = NOT_GIVEN,
        extra_kwargs: NotGivenOr[dict] = NOT_GIVEN,
    ) -> llm.LLMStream:
        return VoiceEngineLLMStream(
            self,
            chat_ctx=chat_ctx,
            tools=tools or [],
            conn_options=conn_options,
            bridge=self._bridge,
            events=self._session_events,
        )


class VoiceEngineLLMStream(llm.LLMStream):
    """Stream the bridge's spoken deltas as LiveKit chat chunks."""

    def __init__(
        self,
        llm_: VoiceEngineLLM,
        *,
        chat_ctx: llm.ChatContext,
        tools: list[llm.Tool],
        conn_options: APIConnectOptions,
        bridge: VoiceChatBridge,
        events: VoiceSessionEvents | None,
    ) -> None:
        self._bridge = bridge
        self._session_events = events
        self._chunk_id = f"voice-{uuid4().hex}"
        self._sent_role = False
        super().__init__(
            llm_,
            chat_ctx=chat_ctx,
            tools=tools,
            conn_options=conn_options,
        )

    async def _run(self) -> None:
        transcript = latest_user_text(self._chat_ctx)
        sent_text = False
        persisted = False
        cancelled = False
        turn_id = self._session_events.begin_turn() if self._session_events is not None else None

        try:
            async for frame in self._bridge.stream_turn(transcript):
                if frame.kind == "delta" and frame.text:
                    sent_text = True
                    if self._session_events is not None and turn_id is not None:
                        self._session_events.assistant_delta(turn_id, frame.text)
                    self._send(frame.text)
                elif frame.kind == "tool_call" and self._session_events is not None:
                    self._session_events.tool_call(frame.payload, turn_id=turn_id)
                elif frame.kind == "error" and frame.text and self._session_events is not None:
                    self._session_events.error(
                        error_code_for_source(frame.payload),
                        frame.text,
                        turn_id=turn_id,
                    )
                elif frame.kind == "done":
                    persisted = frame.payload is True
        except asyncio.CancelledError:
            cancelled = True
            if self._session_events is not None and turn_id is not None:
                self._session_events.cancel_turn(turn_id)
            raise
        except Exception:
            logger.exception("[voice-agent] engine stream failed")
            if self._session_events is not None and turn_id is not None:
                self._session_events.error(
                    error_code_for_source(None),
                    "The chat engine could not complete this turn.",
                    turn_id=turn_id,
                )
            if not sent_text:
                self._send(VOICE_FALLBACK_APOLOGY)
        finally:
            if self._session_events is not None and turn_id is not None and not cancelled:
                self._session_events.finish_turn(turn_id, persist=persisted)

    def _send(self, text: str) -> None:
        self._event_ch.send_nowait(
            llm.ChatChunk(
                id=self._chunk_id,
                delta=llm.ChoiceDelta(
                    role=None if self._sent_role else "assistant",
                    content=text,
                ),
            )
        )
        self._sent_role = True
