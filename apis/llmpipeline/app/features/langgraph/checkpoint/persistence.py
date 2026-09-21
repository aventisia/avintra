"""Persistence helpers for LangGraph chat threads and messages.

- Temporary chats use the in-memory ``graph_memory`` saver only.
- Non-temporary chats are persisted to the Workspace DB using the
  ``worc_Conversations`` / ``worc_ConversationMessages`` tables.
"""

import json
import uuid
from datetime import datetime, timezone
from typing import Any

from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import logger
from app.features.langgraph.checkpoint.models import (
    Conversation,
    ConversationMessage,
)


def _message_role(message: BaseMessage) -> str:
    """Map a LangChain message to a conversation role string."""

    if isinstance(message, HumanMessage):
        return "user"
    if isinstance(message, AIMessage):
        return "assistant"
    if isinstance(message, SystemMessage):
        return "system"
    if isinstance(message, ToolMessage):
        return "tool"

    return "unknown"


def _message_content(message: BaseMessage) -> str:
    """Extract the plain-text user-visible content of a message.

    Only the actual text content is stored in the ``Content`` column.
    Provider metadata, tool calls, and message repr details are kept in the
    separate ``Metadata`` JSONB column.
    """

    content = getattr(message, "content", "")

    if isinstance(content, str):
        return content

    if isinstance(content, list):
        return "".join(
            part.get("text", "")
            for part in content
            if isinstance(part, dict)
        )

    return str(content)


def _message_metadata(message: BaseMessage) -> dict[str, Any]:
    """Capture provider-specific metadata for storage."""

    metadata: dict[str, Any] = {
        "tool_calls": getattr(message, "tool_calls", None),
        "tool_call_id": getattr(message, "tool_call_id", None),
        "name": getattr(message, "name", None),
        "message_id": getattr(message, "id", None),
    }

    if isinstance(message, AIMessage):
        metadata["response_metadata"] = message.response_metadata or {}
        metadata["usage_metadata"] = message.usage_metadata or {}

    # Filter out empty values but keep explicit False/0. Tool calls are
    # preserved as [] when present so they can be replayed to the model.
    return {
        k: v
        for k, v in metadata.items()
        if v is not None and v != []
    }


async def ensure_conversation(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    user_id: uuid.UUID,
    conversation_id: str,
    flow_version_id: str,
    audit_user_id: uuid.UUID,
) -> Conversation:
    """Fetch an existing conversation or create it if it does not exist."""

    try:
        conversation_uuid = uuid.UUID(conversation_id)
    except ValueError as exc:
        logger.error(
            "Invalid conversation_id UUID: %s",
            conversation_id,
        )
        raise exc

    try:
        flow_version_uuid = uuid.UUID(flow_version_id)
    except ValueError as exc:
        logger.error(
            "Invalid flow_version_id UUID: %s",
            flow_version_id,
        )
        raise exc

    result = await session.execute(
        select(Conversation).where(Conversation.id == conversation_uuid)
    )
    conversation = result.scalar_one_or_none()

    now = datetime.now(timezone.utc)

    if conversation is not None:
        conversation.last_modified_by_user_id = audit_user_id
        conversation.last_modified_on = now
        await session.flush()
        return conversation

    conversation = Conversation(
        id=conversation_uuid,
        tenant_id=tenant_id,
        user_id=user_id,
        flow_version_id=flow_version_uuid,
        status="active",
        created_by_user_id=audit_user_id,
        last_modified_by_user_id=audit_user_id,
        created_on=now,
        last_modified_on=now,
    )
    session.add(conversation)
    await session.flush()
    await session.refresh(conversation)

    logger.debug(
        "Created conversation. conversation_id=%s tenant=%s user=%s flow_version=%s",
        conversation_id,
        tenant_id,
        user_id,
        flow_version_id,
    )

    return conversation


async def save_message(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    conversation_id: str,
    message: BaseMessage,
) -> None:
    """Persist a single LangChain message for a conversation."""

    try:
        conversation_uuid = uuid.UUID(conversation_id)
    except ValueError:
        logger.error(
            "Cannot save message; invalid conversation_id UUID: %s",
            conversation_id,
        )
        return

    metadata = _message_metadata(message)

    session.add(
        ConversationMessage(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            conversation_id=conversation_uuid,
            role=_message_role(message),
            content=_message_content(message),
            message_metadata=metadata if metadata else None,
            created_on=datetime.now(timezone.utc),
        )
    )

    logger.debug(
        "Persisted %s message for conversation %s.",
        _message_role(message),
        conversation_id,
    )


async def load_messages(
    session: AsyncSession,
    conversation_id: str,
) -> list[BaseMessage]:
    """Load persisted messages for a conversation as LangChain messages."""

    try:
        conversation_uuid = uuid.UUID(conversation_id)
    except ValueError:
        logger.error(
            "Cannot load messages; invalid conversation_id UUID: %s",
            conversation_id,
        )
        return []

    result = await session.execute(
        select(ConversationMessage)
        .where(ConversationMessage.conversation_id == conversation_uuid)
        .order_by(ConversationMessage.created_on)
    )
    records = result.scalars().all()

    messages: list[BaseMessage] = []

    for record in records:
        metadata = record.message_metadata or {}

        message_id = metadata.get("message_id") or str(record.id)

        if record.role == "user":
            messages.append(
                HumanMessage(
                    content=record.content or "",
                    id=message_id,
                )
            )
        elif record.role == "assistant":
            messages.append(
                AIMessage(
                    content=record.content or "",
                    tool_calls=metadata.get("tool_calls"),
                    response_metadata=metadata.get("response_metadata") or {},
                    usage_metadata=metadata.get("usage_metadata"),
                    id=message_id,
                )
            )
        elif record.role == "system":
            messages.append(
                SystemMessage(
                    content=record.content or "",
                    id=message_id,
                )
            )
        elif record.role == "tool":
            messages.append(
                ToolMessage(
                    content=record.content or "",
                    tool_call_id=metadata.get("tool_call_id") or "",
                    name=metadata.get("name") or "",
                    id=message_id,
                )
            )

    return messages
