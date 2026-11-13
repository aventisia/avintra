"""Voice call timing and terminal-status persistence tests for #373 (S10).

Run from ``apis/llmpipeline``:

    ./venv/Scripts/python.exe -m pytest tests/test_voice_persistence.py -q
"""

from __future__ import annotations

import asyncio
from unittest.mock import AsyncMock
from uuid import UUID, uuid4

from voice_agent import persistence
from voice_agent.metadata import VoiceJobClaims
from voice_agent.persistence import (
    VoiceConversationLifecycle,
    VoiceTurnTimingRecorder,
)

FLOW_VERSION_ID = UUID("44444444-4444-4444-4444-444444444444")
FLOW_ID = UUID("33333333-3333-3333-3333-333333333333")
TENANT_ID = UUID("11111111-1111-1111-1111-111111111111")
USER_ID = UUID("22222222-2222-2222-2222-222222222222")

TIMING = {
    "stt_ms": 90,
    "llm_first_token_ms": 120,
    "tts_first_audio_ms": 300,
    "turn_total_ms": 700,
}


def _claims(*, mode: str = "live") -> VoiceJobClaims:
    return VoiceJobClaims(
        room_name="voice-room",
        flow_version_id=FLOW_VERSION_ID,
        flow_id=FLOW_ID,
        tenant_id=TENANT_ID,
        user_id=USER_ID,
        conversation_id=str(uuid4()),
        mode=mode,
        space_id="space-1",
        env_type="dev",
        worker_token="worker-token",
        username="voice-tester",
        email="voice-tester@example.com",
    )


class _FakeSession:
    def __init__(self) -> None:
        self.commits = 0

    async def commit(self) -> None:
        self.commits += 1


class _FakeSessionContext:
    def __init__(self, session: _FakeSession) -> None:
        self._session = session
        self.entered = False

    async def __aenter__(self) -> _FakeSession:
        self.entered = True
        return self._session

    async def __aexit__(self, *_args) -> None:
        return None


def _patch_session(monkeypatch) -> tuple[_FakeSession, _FakeSessionContext]:
    session = _FakeSession()
    context = _FakeSessionContext(session)
    monkeypatch.setattr(
        persistence,
        "get_db_session_context",
        lambda _name: context,
    )
    return session, context


def test_test_mode_writes_turn_timing(monkeypatch):
    session, _context = _patch_session(monkeypatch)
    save = AsyncMock()
    monkeypatch.setattr(persistence.conversation_service, "save_voice_turn_timing", save)
    claims = _claims(mode="test")

    asyncio.run(VoiceTurnTimingRecorder(claims)(1, TIMING))

    save.assert_awaited_once_with(
        db_session=session,
        conversation_id=claims.conversation_id,
        timing=TIMING,
    )
    assert session.commits == 1


def test_lifecycle_closes_the_conversation_row_created_by_the_api(monkeypatch):
    session, _context = _patch_session(monkeypatch)
    finish = AsyncMock()
    monkeypatch.setattr(
        persistence.conversation_service, "finish_voice_conversation", finish
    )
    claims = _claims(mode="test")

    asyncio.run(VoiceConversationLifecycle(claims).finish(failed=False))

    finish.assert_awaited_once_with(
        db_session=session,
        conversation_id=claims.conversation_id,
        failed=False,
        user_id=USER_ID,
    )
    assert session.commits == 1


def test_turn_timing_is_saved_through_the_conversation_service(monkeypatch):
    session, _context = _patch_session(monkeypatch)
    save = AsyncMock()
    monkeypatch.setattr(persistence.conversation_service, "save_voice_turn_timing", save)
    claims = _claims()

    asyncio.run(VoiceTurnTimingRecorder(claims)(7, TIMING))

    save.assert_awaited_once_with(
        db_session=session,
        conversation_id=claims.conversation_id,
        timing=TIMING,
    )
    assert session.commits == 1


def test_lifecycle_writes_the_terminal_status_only_once(monkeypatch):
    session, _context = _patch_session(monkeypatch)
    finish = AsyncMock()
    monkeypatch.setattr(
        persistence.conversation_service, "finish_voice_conversation", finish
    )
    claims = _claims()
    lifecycle = VoiceConversationLifecycle(claims)

    async def run() -> None:
        await lifecycle.finish(failed=True)
        await lifecycle.finish(failed=False)

    asyncio.run(run())

    finish.assert_awaited_once_with(
        db_session=session,
        conversation_id=claims.conversation_id,
        failed=True,
        user_id=USER_ID,
    )
    assert session.commits == 1
