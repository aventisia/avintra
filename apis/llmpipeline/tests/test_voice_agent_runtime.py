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
