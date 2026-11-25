"""Stale voice-session reconciler tests.

Run from ``apis/llmpipeline``:

    ./venv/Scripts/python.exe -m pytest tests/test_voice_reconciler.py -q
"""

from __future__ import annotations

import asyncio
from types import SimpleNamespace

from sqlalchemy.dialects import postgresql

from app.features.voice_sessions import reconciler


class _FakeSession:
    def __init__(self, *, rowcount: int = 0, error: Exception | None = None) -> None:
        self.rowcount = rowcount
        self.error = error
        self.statements = []
        self.commits = 0

    async def execute(self, statement):
        if self.error is not None:
            raise self.error
        self.statements.append(statement)
        return SimpleNamespace(rowcount=self.rowcount)

    async def commit(self) -> None:
        self.commits += 1


class _FakeSessionContext:
    def __init__(self, session: _FakeSession) -> None:
        self._session = session

    async def __aenter__(self) -> _FakeSession:
        return self._session

    async def __aexit__(self, *_exc) -> bool:
        return False


def _patch_session(monkeypatch, session: _FakeSession) -> None:
    monkeypatch.setattr(
        reconciler,
        "get_db_session_context",
        lambda _name: _FakeSessionContext(session),
    )


def test_stale_voice_sweep_fails_expired_active_conversations(monkeypatch):
    session = _FakeSession(rowcount=3)
    _patch_session(monkeypatch, session)

    count = asyncio.run(reconciler.close_stale_voice_conversations())

    assert count == 3
    assert session.commits == 1
    [statement] = session.statements
    sql = str(
        statement.compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": True},
        )
    )
    assert 'UPDATE "run_Conversations"' in sql
    assert "lower(\"run_Conversations\".\"Channel\") = 'voice'" in sql
    assert "lower(\"run_Conversations\".\"Status\") = 'active'" in sql
    assert "'Failed'" in sql
    assert "LastModifiedOn" in sql


def test_stale_voice_sweep_logs_and_swallows_a_database_error(monkeypatch):
    session = _FakeSession(error=RuntimeError("database is down"))
    _patch_session(monkeypatch, session)
    errors: list[str] = []
    monkeypatch.setattr(
        reconciler.logger,
        "exception",
        lambda message, *_args, **_kwargs: errors.append(message),
    )

    assert asyncio.run(reconciler.close_stale_voice_conversations()) == 0
    assert errors == ["[voice-reconciler] stale conversation sweep failed"]


def test_reconciler_sweeps_on_an_interval_and_stops(monkeypatch):
    sweeps: list[int] = []

    async def sweep() -> int:
        sweeps.append(1)
        return 0

    monkeypatch.setattr(reconciler, "close_stale_voice_conversations", sweep)
    monkeypatch.setattr(reconciler, "VOICE_RECONCILE_INTERVAL_SECONDS", 0.01)

    async def run() -> None:
        handle = reconciler.start_reconciler()
        await asyncio.sleep(0.1)
        await reconciler.stop_reconciler(handle)
        stopped_at = len(sweeps)
        await asyncio.sleep(0.02)
        assert len(sweeps) == stopped_at
        assert handle.task is not None
        assert handle.task.done()

    asyncio.run(run())

    assert len(sweeps) >= 2
