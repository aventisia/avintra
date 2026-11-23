"""Closes voice conversations whose worker stopped sending heartbeats.

A worker refreshes its conversation's ``LastModifiedOn`` every minute while the
call is live. When the process dies without running its teardown, that stamp
stops moving and this sweep marks the row failed, so the UI does not show a
call as active forever.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, update

from app.core.config import settings
from app.core.database import get_db_session_context
from app.core.logger import logger
from app.features.langgraph.checkpoint.models import Conversation

VOICE_HEARTBEAT_STALE_SECONDS = 600
VOICE_RECONCILE_INTERVAL_SECONDS = 300


async def close_stale_voice_conversations() -> int:
    """Mark active voice conversations with an expired heartbeat as failed."""

    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(seconds=VOICE_HEARTBEAT_STALE_SECONDS)
    try:
        async with get_db_session_context(
            settings.POSTGRESQL_WORKSPACE_DB_NAME
        ) as session:
            result = await session.execute(
                update(Conversation)
                .where(
                    func.lower(Conversation.channel) == "voice",
                    func.lower(Conversation.status) == "active",
                    Conversation.last_modified_on < cutoff,
                )
                .values(status="Failed", last_modified_on=now)
            )
            await session.commit()
    except Exception:
        logger.exception("[voice-reconciler] stale conversation sweep failed")
        return 0

    if result.rowcount:
        logger.warning(
            "[voice-reconciler] closed %d stale voice conversation(s)",
            result.rowcount,
        )
    return result.rowcount


@dataclass
class VoiceReconciler:
    """A reconciler loop running in the API event loop."""

    stop: asyncio.Event
    task: asyncio.Task[None] | None = None


async def _reconcile(reconciler: VoiceReconciler) -> None:
    while not reconciler.stop.is_set():
        try:
            await asyncio.wait_for(
                reconciler.stop.wait(),
                timeout=VOICE_RECONCILE_INTERVAL_SECONDS,
            )
            return
        except TimeoutError:
            pass
        await close_stale_voice_conversations()


def start_reconciler() -> VoiceReconciler:
    """Start the stale-session sweep in the API event loop."""

    reconciler = VoiceReconciler(stop=asyncio.Event())
    reconciler.task = asyncio.create_task(
        _reconcile(reconciler),
        name="voice-session-reconciler",
    )
    return reconciler


async def stop_reconciler(reconciler: VoiceReconciler, timeout: float = 5) -> None:
    """Stop the sweep and wait briefly for an in-flight database call."""

    reconciler.stop.set()
    if reconciler.task is None:
        return
    try:
        await asyncio.wait_for(reconciler.task, timeout=timeout)
    except asyncio.TimeoutError:
        reconciler.task.cancel()
        await asyncio.gather(reconciler.task, return_exceptions=True)
