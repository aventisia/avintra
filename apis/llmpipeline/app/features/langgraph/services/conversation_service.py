from uuid import uuid4

from langchain_core.messages import BaseMessage
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.langgraph.checkpoint.persistence import (
    ensure_conversation,
    load_messages,
    save_message as _save_message,
)
from app.features.langgraph.graphs.message_builder import build_messages
from app.features.llm_providers.llm_providers_schemas import LLMRequest


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
                flow_version_id=request.ref_id,
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
