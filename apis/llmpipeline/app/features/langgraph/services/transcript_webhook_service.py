"""Compose and deliver a VoiceAgent conversation transcript to a webhook.

Delivery is a single best-effort POST with a short timeout. Every failure is
logged as a warning with the redacted host and never raised, so a webhook can
never interrupt a voice conversation.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional
from urllib.parse import urlsplit

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import logger
from app.features.langgraph.checkpoint.models import (
    Conversation,
    ConversationMessage,
)

WEBHOOK_TIMEOUT_SECONDS = 15.0


def is_absolute_http_url(url: str) -> bool:
    """Return True when ``url`` is an absolute http or https URL."""

    try:
        parts = urlsplit((url or "").strip())
    except ValueError:
        return False

    return parts.scheme in ("http", "https") and bool(parts.netloc)


def _redacted_host(url: str) -> str:
    """Return only the host of ``url`` so secrets are never logged."""

    try:
        return urlsplit(url).hostname or "<unknown>"
    except ValueError:
        return "<unknown>"


def compose_transcript_payload(
    conversation: Conversation,
    messages: list[ConversationMessage],
) -> dict[str, Any]:
    """Build the transcript webhook payload from a persisted conversation."""

    return {
        "conversation_id": str(conversation.id),
        "ended_at": datetime.now(timezone.utc).isoformat(),
        "agent": {
            "ref_type": "Agent",
            "ref_id": str(conversation.flow_version_id),
            "ref_name": None,
            "agent_name": None,
        },
        "message_count": len(messages),
        "is_temp_chat": False,
        "transcript": [
            {"role": message.role or "unknown", "content": message.content or ""}
            for message in messages
        ],
    }


async def deliver_transcript_webhook(
    webhook_url: str,
    payload: dict[str, Any],
    client: Optional[httpx.AsyncClient] = None,
) -> bool:
    """POST ``payload`` to ``webhook_url`` in one attempt, never raising.

    Returns True when the endpoint responded with a success status, otherwise
    False. Failures and non-success responses are logged as warnings with only
    the host recorded.
    """

    host = _redacted_host(webhook_url)

    try:
        if client is not None:
            response = await client.post(webhook_url, json=payload)
        else:
            async with httpx.AsyncClient(timeout=WEBHOOK_TIMEOUT_SECONDS) as owned_client:
                response = await owned_client.post(webhook_url, json=payload)
    except Exception as exc:
        logger.warning(
            "Transcript webhook delivery failed | host=%s error=%s",
            host,
            exc,
        )
        return False

    if response.status_code >= 400:
        logger.warning(
            "Transcript webhook returned a non-success status | host=%s status=%s",
            host,
            response.status_code,
        )
        return False

    return True


async def send_transcript_webhook(
    db_session: AsyncSession,
    conversation_id: str,
    webhook_url: str,
) -> bool:
    """Load the conversation transcript and deliver it to ``webhook_url``."""

    try:
        conversation_uuid = conversation_id
        import uuid as _uuid

        conversation_uuid = _uuid.UUID(conversation_id)
    except ValueError:
        logger.warning(
            "Transcript webhook skipped; invalid conversation id | conversation_id=%s",
            conversation_id,
        )
        return False

    result = await db_session.execute(
        select(Conversation).where(Conversation.id == conversation_uuid)
    )
    conversation = result.scalar_one_or_none()
    if conversation is None:
        logger.warning(
            "Transcript webhook skipped; conversation not found | conversation_id=%s",
            conversation_id,
        )
        return False

    message_result = await db_session.execute(
        select(ConversationMessage)
        .where(ConversationMessage.conversation_id == conversation_uuid)
        .order_by(ConversationMessage.created_on)
    )
    messages = [
        record
        for record in message_result.scalars().all()
        if not (record.message_metadata or {}).get("ui_transcript")
    ]

    payload = compose_transcript_payload(conversation, messages)
    return await deliver_transcript_webhook(webhook_url, payload)
