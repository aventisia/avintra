"""Voice worker lifecycle inside the llmpipeline service.

The worker must start in the API event loop when LiveKit is configured, stay
out of the way when it is not, and never prevent the chat API from serving.

Run from ``apis/llmpipeline``:

    ./venv/Scripts/python.exe -m pytest tests/test_voice_agent_runtime.py -q
"""

from __future__ import annotations

import asyncio
from types import SimpleNamespace

import pytest
from starlette.testclient import TestClient

from app.core.config import settings
from app import main as api_main
from app.main import app as api_app
from voice_agent import agent
from voice_agent.metadata import VoiceSessionRejected


def _configure(monkeypatch):
    monkeypatch.setattr(settings, "LIVEKIT_WS_URL", "ws://localhost:7880")
    monkeypatch.setattr(settings, "LIVEKIT_HTTP_URL", "http://localhost:7880")
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


async def _wait_until(predicate, timeout: float = 1.0) -> None:
    deadline = asyncio.get_running_loop().time() + timeout
    while not predicate():
        assert asyncio.get_running_loop().time() < deadline, "condition not met"
        await asyncio.sleep(0.01)


@pytest.mark.parametrize(
    "field",
    ["LIVEKIT_WS_URL", "LIVEKIT_HTTP_URL", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"],
)
def test_voice_worker_requires_livekit_configuration(monkeypatch, field):
    _configure(monkeypatch)
    if field.endswith("_URL"):
        monkeypatch.setattr(settings, "LIVEKIT_WS_URL", "")
        monkeypatch.setattr(settings, "LIVEKIT_HTTP_URL", "")
    else:
        monkeypatch.setattr(settings, field, "")

    assert asyncio.run(agent.start_voice_worker()) is None


def test_voice_worker_accepts_the_cloud_http_url_alone(monkeypatch):
    _configure(monkeypatch)
    monkeypatch.setattr(settings, "LIVEKIT_WS_URL", "")
    monkeypatch.setattr(settings, "LIVEKIT_HTTP_URL", "https://test.livekit.cloud")

    assert agent.worker_options().ws_url == "wss://test.livekit.cloud"


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

        await _wait_until(lambda: worker.task.done())
        assert worker.server.closed
        assert worker.server.devmode is True

    asyncio.run(run())


def test_voice_worker_restarts_after_an_unexpected_exit(monkeypatch):
    _configure(monkeypatch)
    monkeypatch.setattr(agent, "env", "local")
    monkeypatch.setattr(agent, "WORKER_RESTART_INITIAL_DELAY_SECONDS", 0.01)
    servers: list[_FakeServer] = []

    class _RestartingServer(_FakeServer):
        async def run(self, *, devmode: bool) -> None:
            self.devmode = devmode
            servers.append(self)
            if len(servers) == 1:
                raise RuntimeError("worker crashed")
            await self.stop.wait()

    class _RestartingAgentServer:
        @classmethod
        def from_server_options(cls, _options):
            return _RestartingServer()

    monkeypatch.setattr(agent, "AgentServer", _RestartingAgentServer)

    async def run():
        worker = await agent.start_voice_worker()
        assert worker is not None
        await _wait_until(lambda: len(servers) == 2)

        assert servers[0].closed is True
        assert worker.server is servers[1]

        await agent.stop_voice_worker(worker)
        assert worker.task.done()

    asyncio.run(run())


def test_stop_voice_worker_does_not_restart_the_worker(monkeypatch):
    _configure(monkeypatch)
    monkeypatch.setattr(agent, "env", "local")
    servers: list[_FakeServer] = []

    class _CountingAgentServer:
        @classmethod
        def from_server_options(cls, _options):
            servers.append(_FakeServer())
            return servers[-1]

    monkeypatch.setattr(agent, "AgentServer", _CountingAgentServer)

    async def run():
        worker = await agent.start_voice_worker()
        assert worker is not None
        await asyncio.sleep(0)

        await agent.stop_voice_worker(worker)
        await _wait_until(lambda: worker.task.done())

        assert len(servers) == 1

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


def test_api_starts_and_stops_the_reconciler(monkeypatch):
    events = []
    handle = object()

    async def no_worker():
        return None

    monkeypatch.setattr(agent, "start_voice_worker", no_worker)
    monkeypatch.setattr(
        api_main, "start_reconciler", lambda: events.append("start") or handle
    )

    async def stop_reconciler(reconciler):
        events.append(("stop", reconciler))

    monkeypatch.setattr(api_main, "stop_reconciler", stop_reconciler)

    with TestClient(api_app) as client:
        assert client.get("/health-check").status_code == 200
        assert events == ["start"]

    assert events == ["start", ("stop", handle)]


class _FakeJobProcess:
    def __init__(self):
        self.userdata = {}


def test_audio_warmup_resamples_once_for_the_soxr_fft_cache(monkeypatch):
    calls = []

    class _FakeFrame:
        @classmethod
        def create(cls, sample_rate, num_channels, samples_per_channel):
            calls.append(("frame", sample_rate, num_channels, samples_per_channel))
            return cls()

    class _FakeResampler:
        def __init__(self, input_rate, output_rate, *, num_channels):
            calls.append(("resampler", input_rate, output_rate, num_channels))

        def push(self, frame):
            calls.append(("push", frame))

        def flush(self):
            calls.append(("flush",))

    monkeypatch.setattr(agent.rtc, "AudioFrame", _FakeFrame)
    monkeypatch.setattr(agent.rtc, "AudioResampler", _FakeResampler)

    agent._warm_audio_resampler()

    assert calls[:2] == [
        ("frame", 48000, 1, 4800),
        ("resampler", 48000, 16000, 1),
    ]
    assert calls[2][0] == "push" and isinstance(calls[2][1], _FakeFrame)
    assert calls[3] == ("flush",)


def test_prewarm_warms_the_audio_resampler_before_loading_the_vad(monkeypatch):
    calls = []

    monkeypatch.setattr(agent, "_warm_audio_resampler", lambda: calls.append("resampler"))
    monkeypatch.setattr(agent.silero.VAD, "load", lambda: calls.append("vad") or object())

    proc = _FakeJobProcess()
    agent.prewarm(proc)

    assert calls == ["resampler", "vad"]
    assert "vad" in proc.userdata


def test_prewarm_still_loads_the_vad_when_the_audio_warmup_fails(monkeypatch):
    def _fail():
        raise RuntimeError("soxr is unavailable")

    monkeypatch.setattr(agent, "_warm_audio_resampler", _fail)
    monkeypatch.setattr(agent.silero.VAD, "load", lambda: object())

    proc = _FakeJobProcess()
    agent.prewarm(proc)

    assert "vad" in proc.userdata


class _FakeEntrypointContext:
    def __init__(self) -> None:
        self.room = SimpleNamespace(name="voice-room", on=lambda *_args: None)
        self.job = SimpleNamespace(
            metadata="job-metadata",
            agent_name="avintra-voice-agent",
            room=self.room,
        )
        self.shutdowns: list[str] = []
        self.deleted_rooms = 0

    async def connect(self, **kwargs) -> None:
        self.connect_kwargs = kwargs

    async def delete_room(self) -> None:
        self.deleted_rooms += 1

    def shutdown(self, reason: str) -> None:
        self.shutdowns.append(reason)


def _patch_entrypoint(monkeypatch, fetch_settings):
    claims = object()
    sessions: list[dict] = []

    async def run_session(_ctx, _claims, agent_settings, *, started_at):
        sessions.append({"settings": agent_settings, "started_at": started_at})

    monkeypatch.setattr(agent, "parse_job_metadata", lambda _raw: claims)
    monkeypatch.setattr(agent, "validate_job", lambda *_args, **_kwargs: None)
    monkeypatch.setattr(agent, "fetch_settings", fetch_settings)
    monkeypatch.setattr(agent, "run_session", run_session)
    monkeypatch.setattr(settings, "LIVEKIT_AGENT_NAME", "avintra-voice-agent")
    return sessions


def test_entrypoint_starts_connecting_while_settings_are_still_loading(monkeypatch):
    connect_called = asyncio.Event()
    settings_loaded = asyncio.Event()

    async def fetch_settings(_claims):
        await connect_called.wait()
        settings_loaded.set()
        return {"engineMode": "pipeline"}

    sessions = _patch_entrypoint(monkeypatch, fetch_settings)
    ctx = _FakeEntrypointContext()

    async def connect(**kwargs):
        ctx.connect_kwargs = kwargs
        connect_called.set()

    monkeypatch.setattr(ctx, "connect", connect)

    async def run_entrypoint():
        await agent.entrypoint(ctx)
        assert settings_loaded.is_set()
        assert len(sessions) == 1
        assert sessions[0]["settings"] == {"engineMode": "pipeline"}

    asyncio.run(asyncio.wait_for(run_entrypoint(), timeout=1))
    assert ctx.connect_kwargs["auto_subscribe"] == agent.AutoSubscribe.AUDIO_ONLY


def test_entrypoint_deletes_the_room_when_job_validation_fails(monkeypatch):
    claims = object()

    def reject(*_args, **_kwargs):
        raise VoiceSessionRejected("Job metadata does not match the dispatch.")

    monkeypatch.setattr(agent, "parse_job_metadata", lambda _raw: claims)
    monkeypatch.setattr(agent, "validate_job", reject)
    ctx = _FakeEntrypointContext()

    asyncio.run(asyncio.wait_for(agent.entrypoint(ctx), timeout=1))

    assert ctx.deleted_rooms == 1
    assert ctx.shutdowns == ["voice session rejected"]


def test_entrypoint_shuts_down_a_job_rejected_after_connect(monkeypatch):
    connect_called = asyncio.Event()

    async def fetch_settings(_claims):
        await connect_called.wait()
        raise VoiceSessionRejected("Voice agent settings are unreachable.")

    sessions = _patch_entrypoint(monkeypatch, fetch_settings)
    ctx = _FakeEntrypointContext()

    async def connect(**kwargs):
        ctx.connect_kwargs = kwargs
        connect_called.set()

    monkeypatch.setattr(ctx, "connect", connect)

    asyncio.run(asyncio.wait_for(agent.entrypoint(ctx), timeout=1))

    assert ctx.shutdowns == ["voice session rejected"]
    assert ctx.deleted_rooms == 1
    assert sessions == []


def test_entrypoint_rejects_without_waiting_for_a_slow_connect(monkeypatch):
    async def fetch_settings(_claims):
        raise VoiceSessionRejected("Voice agent settings are unreachable.")

    sessions = _patch_entrypoint(monkeypatch, fetch_settings)
    ctx = _FakeEntrypointContext()

    async def connect(**_kwargs):
        await asyncio.Event().wait()

    monkeypatch.setattr(ctx, "connect", connect)

    asyncio.run(asyncio.wait_for(agent.entrypoint(ctx), timeout=1))

    assert ctx.shutdowns == ["voice session rejected"]
    assert ctx.deleted_rooms == 1
    assert sessions == []


def test_entrypoint_runs_the_session_when_the_early_connect_fails(monkeypatch):
    async def fetch_settings(_claims):
        return {"engineMode": "pipeline"}

    sessions = _patch_entrypoint(monkeypatch, fetch_settings)
    ctx = _FakeEntrypointContext()

    async def connect(**_kwargs):
        raise RuntimeError("connect failed")

    monkeypatch.setattr(ctx, "connect", connect)

    asyncio.run(asyncio.wait_for(agent.entrypoint(ctx), timeout=1))

    assert len(sessions) == 1
    assert sessions[0]["settings"] == {"engineMode": "pipeline"}


def test_entrypoint_cancellation_stops_the_connect_and_settings_tasks(monkeypatch):
    inner_tasks: list[asyncio.Task] = []

    async def fetch_settings(_claims):
        inner_tasks.append(asyncio.current_task())
        await asyncio.Event().wait()

    _patch_entrypoint(monkeypatch, fetch_settings)
    ctx = _FakeEntrypointContext()

    async def connect(**_kwargs):
        inner_tasks.append(asyncio.current_task())
        await asyncio.Event().wait()

    monkeypatch.setattr(ctx, "connect", connect)

    async def run_entrypoint():
        task = asyncio.create_task(agent.entrypoint(ctx))
        await asyncio.sleep(0.01)
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)
        return task

    task = asyncio.run(asyncio.wait_for(run_entrypoint(), timeout=1))

    assert task.cancelled()
    assert len(inner_tasks) == 2
    assert all(inner.cancelled() for inner in inner_tasks)
