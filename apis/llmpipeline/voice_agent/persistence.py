"""Persistence for one voice call's turn timing and terminal status."""

from __future__ import annotations

from typing import Any

from app.core.config import settings
from app.core.database import get_db_session_context
from app.core.logger import logger
from app.features.langgraph.services.conversation_service import conversation_service

from .metadata import VoiceJobClaims


class VoiceTurnTimingRecorder:
    """Persist each finalized turn's timing into its conversation transcript."""

    def __init__(self, claims: VoiceJobClaims) -> None:
        self._claims = claims

    async def __call__(self, turn_id: int, timing: dict[str, Any]) -> None:
        if self._claims.mode == "test":
            return

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
