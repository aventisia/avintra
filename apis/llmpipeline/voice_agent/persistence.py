"""Persistence for one voice call's messages, turn timing, and terminal status."""

from __future__ import annotations

import asyncio
from typing import Any

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, ToolMessage

from app.core.config import settings
from app.core.database import get_db_session_context
from app.core.logger import logger
from app.features.langgraph.services.conversation_service import conversation_service
from app.features.llm_providers.llm_providers_schemas import LLMRequest

from .chat_bridge import build_voice_llm_request
from .metadata import VoiceJobClaims
from .realtime_adapters import normalize_realtime_provider
from .stt_adapter import build_user


def _voice_message_request(
    claims: VoiceJobClaims,
    agent_settings: dict,
) -> LLMRequest:
    """Build the reference-only request that ``save_message`` reads.

    IMPORTANT NOTE: message persistence reads only the channel, flow version, and
    Agent reference fields, so the provider keeps the schema valid without
    describing a chat provider for this realtime call.
    """

    realtime = agent_settings.get("realtime") or {}
    provider = (
        "googlegemini"
        if normalize_realtime_provider(realtime.get("provider")) == "gemini"
        else "openai"
    )
    return build_voice_llm_request(
        claims,
        {
            **agent_settings,
            "llm": {
                "provider": provider,
                "model": str(realtime.get("model") or ""),
            },
        },
        "",
    )


class VoiceTurnTimingRecorder:
    """Persist each finalized turn's timing into its conversation transcript."""

    def __init__(self, claims: VoiceJobClaims) -> None:
        self._claims = claims

    async def __call__(self, turn_id: int, timing: dict[str, Any]) -> None:
        try:
            async with get_db_session_context(
                settings.POSTGRESQL_WORKSPACE_DB_NAME
            ) as session:
                await conversation_service.save_voice_turn_timing(
                    db_session=session,
                    conversation_id=self._claims.conversation_id,
                    timing=timing,
                )
                await session.commit()
        except Exception:
            logger.exception(
                "[voice-agent] turn timing persistence failed conversation=%s turn=%s",
                self._claims.conversation_id,
                turn_id,
            )


class VoiceConversationLifecycle:
    """Write the conversation's terminal status once, after the call ends."""

    def __init__(self, claims: VoiceJobClaims) -> None:
        self._claims = claims
        self._finished = False

    async def finish(self, *, failed: bool) -> None:
        if self._finished:
            return
        self._finished = True

        try:
            async with get_db_session_context(
                settings.POSTGRESQL_WORKSPACE_DB_NAME
            ) as session:
                await conversation_service.finish_voice_conversation(
                    db_session=session,
                    conversation_id=self._claims.conversation_id,
                    failed=failed,
                    user_id=self._claims.user_id,
                )
                await session.commit()
        except Exception:
            logger.exception(
                "[voice-agent] conversation status persistence failed conversation=%s",
                self._claims.conversation_id,
            )


class VoiceRealtimeTranscriptWriter:
    """Persist one live realtime call's finalized items in arrival order.

    LiveKit emits ``conversation_item_added`` synchronously, so items are queued
    and written by one worker: the transcript keeps the spoken order and no
    message is inserted twice.
    """

    def __init__(self, claims: VoiceJobClaims, agent_settings: dict) -> None:
        self._claims = claims
        self._agent_settings = agent_settings
        self._user = build_user(claims)
        self._queue: asyncio.Queue[
            tuple[BaseMessage, dict | None] | None
        ] = asyncio.Queue()
        self._persisted_ids: set[str] = set()
        self._task: asyncio.Task[None] | None = None

    def start(self) -> None:
        if self._task is None:
            self._task = asyncio.create_task(self._run())

    def add(
        self,
        role: str,
        text: str,
        message_id: str | None = None,
        timing: dict | None = None,
    ) -> None:
        text = text.strip()
        if self._task is None or not text or role not in ("user", "assistant"):
            return
        if message_id:
            if message_id in self._persisted_ids:
                return
            self._persisted_ids.add(message_id)

        message: BaseMessage = (
            HumanMessage(content=text) if role == "user" else AIMessage(content=text)
        )
        if message_id:
            message.id = message_id
        metadata = {"voice_turn_timing": timing} if timing else None
        self._queue.put_nowait((message, metadata))

    def add_tool_call(self, tool_call: dict) -> None:
        if self._task is None:
            return
        tool_call_id = str(tool_call.get("tool_call_id") or "")
        if not tool_call_id or tool_call_id in self._persisted_ids:
            return
        self._persisted_ids.add(tool_call_id)

        message = ToolMessage(
            content=str(tool_call.get("content") or ""),
            tool_call_id=tool_call_id,
            name=str(tool_call.get("name") or ""),
        )
        metadata = {
            "status": tool_call.get("status"),
            "duration_ms": tool_call.get("duration_ms"),
        }
        self._queue.put_nowait((message, metadata))

    async def aclose(self) -> None:
        if self._task is None:
            return
        self._queue.put_nowait(None)
        await self._task
        self._task = None

    async def _run(self) -> None:
        while True:
            item = await self._queue.get()
            try:
                if item is None:
                    return
                await self._save(*item)
            except Exception:
                logger.exception(
                    "[voice-agent] realtime message persistence failed conversation=%s",
                    self._claims.conversation_id,
                )
            finally:
                self._queue.task_done()

    async def _save(
        self,
        message: BaseMessage,
        metadata: dict | None,
    ) -> None:
        request = _voice_message_request(self._claims, self._agent_settings)

        async with get_db_session_context(
            settings.POSTGRESQL_WORKSPACE_DB_NAME
        ) as session:
            await conversation_service.save_message(
                db_session=session,
                request=request,
                user=self._user,
                conversation_id=self._claims.conversation_id,
                message=message,
                metadata=metadata,
            )
            await session.commit()
