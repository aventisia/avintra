from typing import Any
from uuid import UUID, uuid4

from langchain_core.messages import BaseMessage
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.langgraph.checkpoint.persistence import (
    attach_voice_turn_timing as _attach_voice_turn_timing,
    ensure_conversation,
    load_messages,
    save_message as _save_message,
    save_transcript as _save_transcript,
    update_conversation_status as _update_conversation_status,
)
from app.features.langgraph.graphs.message_builder import build_messages
from app.features.llm_providers.llm_providers_schemas import LLMRequest


def _flow_version_id(request: LLMRequest) -> str:
    if request.flow_version_id:
        return request.flow_version_id
    # IMPORTANT NOTE: legacy chat requests send only the parent flow id, which voice
    # turns must never record as a version.
    return "" if request.is_voice_agent else (request.ref_id or "")


class ConversationService:
    """Save conversation state and history to the workspace database."""

    async def load_history(
        self,
        db_session: AsyncSession,
        conversation_id: str,
    ) -> list[BaseMessage]:
        """Load prior conversation messages from the workspace DB."""

        try:
            return await load_messages(
                session=db_session,
                conversation_id=conversation_id,
            )
        except Exception:
            logger.exception(
                "Failed to load persisted messages. conversation_id=%s",
                conversation_id,
            )
            return []

    async def save_message(
        self,
        db_session: AsyncSession,
        request: LLMRequest,
        user: User,
        conversation_id: str,
        message: BaseMessage,
        persisted_ids: set[str | None] | None = None,
        persisted_tool_call_ids: set[str] | None = None,
    ) -> None:
        """Persist a single message if it has not already been written to the DB.

        The ``persisted_ids`` and ``persisted_tool_call_ids`` sets are updated in
        place so subsequent calls can skip already-saved messages. Either set may
        be ``None`` when deduplication is not needed.
        """

        message_id = getattr(message, "id", None)
        tool_call_id = getattr(message, "tool_call_id", None)

        if message_id in (persisted_ids or set()):
            return

        if tool_call_id and tool_call_id in (persisted_tool_call_ids or set()):
            return

        try:
            await ensure_conversation(
                session=db_session,
                tenant_id=user.tenant_id,
                user_id=user.user_id,
                conversation_id=conversation_id,
                flow_version_id=_flow_version_id(request),
                channel=request.channel,
                audit_user_id=user.user_id,
            )

            await _save_message(
                session=db_session,
                tenant_id=user.tenant_id,
                conversation_id=conversation_id,
                message=message,
            )

            if message_id is not None and persisted_ids is not None:
                persisted_ids.add(message_id)

            if tool_call_id and persisted_tool_call_ids is not None:
                persisted_tool_call_ids.add(tool_call_id)

            await db_session.flush()
        except Exception:
            logger.exception(
                "Failed to persist message. conversation_id=%s",
                conversation_id,
            )

    async def save_transcript(
        self,
        db_session: AsyncSession,
        request: LLMRequest,
        user: User,
        conversation_id: str,
        content: str,
        frames: list[dict],
        decisions: dict[str, str] | None = None,
    ) -> None:
        """Persist the normalized-frame transcript for a streamed assistant turn.

        Separate from :meth:`save_message`: the LangChain rows are replayed to
        the model, while this row is read only by the UI to rebuild the
        structured content (skills, tool calls, approvals) on reload.
        """

        try:
            await ensure_conversation(
                session=db_session,
                tenant_id=user.tenant_id,
                user_id=user.user_id,
                conversation_id=conversation_id,
                flow_version_id=_flow_version_id(request),
                channel=request.channel,
                audit_user_id=user.user_id,
            )

            await _save_transcript(
                session=db_session,
                tenant_id=user.tenant_id,
                conversation_id=conversation_id,
                content=content,
                frames=frames,
                decisions=decisions,
            )

            await db_session.flush()
        except Exception:
            logger.exception(
                "Failed to persist chat transcript. conversation_id=%s",
                conversation_id,
            )

    async def save_voice_turn_timing(
        self,
        db_session: AsyncSession,
        conversation_id: str,
        timing: dict[str, Any],
    ) -> None:
        """Merge the voice timing for the turn that just completed."""

        try:
            await _attach_voice_turn_timing(
                session=db_session,
                conversation_id=conversation_id,
                timing=timing,
            )
            await db_session.flush()
        except Exception:
            logger.exception(
                "Failed to persist voice turn timing. conversation_id=%s",
                conversation_id,
            )

    async def finish_voice_conversation(
        self,
        db_session: AsyncSession,
        conversation_id: str,
        *,
        failed: bool,
        user_id: UUID | None = None,
    ) -> None:
        """Set the terminal status for a finished voice conversation."""

        try:
            await _update_conversation_status(
                session=db_session,
                conversation_id=conversation_id,
                status="Failed" if failed else "Completed",
                audit_user_id=user_id,
            )
            await db_session.flush()
        except Exception:
            logger.exception(
                "Failed to finish voice conversation. conversation_id=%s",
                conversation_id,
            )

    def build_request_messages(
        self,
        request: LLMRequest,
    ) -> list[BaseMessage]:
        """Convert the request input into LangChain messages with stable ids."""

        request_messages = build_messages(request)
        self._ensure_message_ids(request_messages)
        return request_messages

    def _ensure_message_ids(
        self,
        messages: list[BaseMessage],
    ) -> None:
        """Assign ids to messages that do not already have one."""

        for message in messages:
            if not getattr(message, "id", None):
                message.id = str(uuid4())

    def extract_persisted_ids(
        self,
        messages: list[BaseMessage],
    ) -> set[str | None]:
        """Return the set of message ids already present in the database."""

        return {
            message.id
            for message in messages
            if getattr(message, "id", None) is not None
        }


# Singleton instance used by ChatService.
conversation_service = ConversationService()
