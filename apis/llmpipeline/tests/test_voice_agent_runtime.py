"""Voice worker lifecycle inside the llmpipeline service.

The worker must start in the API event loop when LiveKit is configured, stay
out of the way when it is not, and never prevent the chat API from serving.

Run from ``apis/llmpipeline``:

    ./venv/Scripts/python.exe -m pytest tests/test_voice_agent_runtime.py -q
"""

from __future__ import annotations

import asyncio

import pytest
from starlette.testclient import TestClient

from app.core.config import settings
from app.main import app as api_app
from voice_agent import agent


def _configure(monkeypatch):
    monkeypatch.setattr(settings, "LIVEKIT_WS_URL", "ws://localhost:7880")
    monkeypatch.setattr(settings, "LIVEKIT_API_KEY", "devkey")
    monkeypatch.setattr(settings, "LIVEKIT_API_SECRET", "secret")
    monkeypatch.setattr(settings, "LIVEKIT_AGENT_NAME", "avintra-voice-agent")


class _FakeServer:
    def __init__(self):
        self.stop = asyncio.Event()
        self.closed = False
        self.devmode = None

    async def run(self, *, devmode: bool) -> None:
        self.devmode = devmode
        await self.stop.wait()

    async def aclose(self) -> None:
        self.closed = True
        self.stop.set()


class _FakeAgentServer:
    instance: _FakeServer | None = None

    @classmethod
    def from_server_options(cls, _options) -> _FakeServer:
        cls.instance = _FakeServer()
        return cls.instance


@pytest.mark.parametrize(
    "field",
    ["LIVEKIT_WS_URL", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"],
)
def test_voice_worker_requires_livekit_configuration(monkeypatch, field):
    _configure(monkeypatch)
    monkeypatch.setattr(settings, field, "")

    assert asyncio.run(agent.start_voice_worker()) is None


def test_voice_worker_rejects_blank_livekit_configuration(monkeypatch):
    _configure(monkeypatch)
    monkeypatch.setattr(settings, "LIVEKIT_API_SECRET", "   ")

    assert asyncio.run(agent.start_voice_worker()) is None


def test_voice_worker_runs_inside_the_api_event_loop(monkeypatch):
    _configure(monkeypatch)
    monkeypatch.setattr(agent, "env", "local")
    monkeypatch.setattr(agent, "AgentServer", _FakeAgentServer)

    async def run():
        worker = await agent.start_voice_worker()
        assert worker is not None
        await asyncio.sleep(0)
        assert not worker.task.done()

        await agent.stop_voice_worker(worker)

        assert worker.server.closed
        assert worker.task.done()
        assert worker.server.devmode is True

    asyncio.run(run())


def test_stop_voice_worker_cancels_a_worker_that_will_not_stop(monkeypatch):
    _configure(monkeypatch)
    monkeypatch.setattr(agent, "env", "local")

    class _StubbornServer(_FakeServer):
        async def aclose(self) -> None:
            self.closed = True

    class _StubbornAgentServer:
        @classmethod
        def from_server_options(cls, _options):
            return _StubbornServer()

    monkeypatch.setattr(agent, "AgentServer", _StubbornAgentServer)

    async def run():
        worker = await agent.start_voice_worker()
        assert worker is not None
        await asyncio.sleep(0)

        await agent.stop_voice_worker(worker, timeout=0.01)

        assert worker.server.closed
        assert worker.task.cancelled()

    asyncio.run(run())


def test_stop_voice_worker_returns_when_server_close_hangs(monkeypatch):
    _configure(monkeypatch)
    monkeypatch.setattr(agent, "env", "local")

    class _HangingServer(_FakeServer):
        async def aclose(self) -> None:
            await asyncio.Event().wait()

    class _HangingAgentServer:
        @classmethod
        def from_server_options(cls, _options):
            return _HangingServer()

    monkeypatch.setattr(agent, "AgentServer", _HangingAgentServer)

    async def run():
        worker = await agent.start_voice_worker()
        assert worker is not None
        await asyncio.sleep(0)

        await asyncio.wait_for(agent.stop_voice_worker(worker, timeout=0.01), timeout=1)

        assert worker.task.cancelled()

    asyncio.run(run())


def test_api_starts_and_stops_the_voice_worker(monkeypatch):
    events = []
    handle = object()

    async def start_voice_worker():
        events.append("start")
        return handle

    async def stop_voice_worker(worker):
        events.append(("stop", worker))

    monkeypatch.setattr(agent, "start_voice_worker", start_voice_worker)
    monkeypatch.setattr(agent, "stop_voice_worker", stop_voice_worker)

    with TestClient(api_app) as client:
        assert client.get("/health-check").status_code == 200
        assert events == ["start"]

    assert events == ["start", ("stop", handle)]


def test_chat_api_starts_when_the_voice_worker_fails(monkeypatch):
    async def start_voice_worker():
        raise RuntimeError("LiveKit is unavailable")

    monkeypatch.setattr(agent, "start_voice_worker", start_voice_worker)

    with TestClient(api_app) as client:
        assert client.get("/health-check").status_code == 200
