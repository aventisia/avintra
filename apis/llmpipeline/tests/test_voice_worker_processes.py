"""Worker options for the voice agent: its process pool and the LiveKit URL it registers on.

The worker registers on the server-side LiveKit URL, not the browser URL, so
with several servers behind one public address it joins the one hosting its
rooms. Every environment keeps warm processes so the first caller does not wait for the
pipeline import, credential setup, and VAD load in a cold process.

Run from ``apis/llmpipeline``:

    ./.venv/Scripts/python.exe -m pytest tests/test_voice_worker_processes.py -q
"""

import pytest
from livekit.agents import JobExecutorType

from app.core.config import settings
from voice_agent.agent import worker_options


def test_worker_keeps_two_warm_processes_in_every_environment(monkeypatch):
    monkeypatch.setattr(settings, "LIVEKIT_WS_URL", "ws://localhost:7880")
    monkeypatch.setattr(settings, "LIVEKIT_API_KEY", "devkey")
    monkeypatch.setattr(settings, "LIVEKIT_API_SECRET", "secret")
    for name in (
        "LIVEKIT_NUM_IDLE_PROCESSES",
        "LIVEKIT_JOB_MEMORY_WARN_MB",
        "LIVEKIT_JOB_MEMORY_LIMIT_MB",
    ):
        monkeypatch.delenv(name, raising=False)

    options = worker_options()

    assert options.num_idle_processes == 2
    assert options.initialize_process_timeout == 30
    assert options.job_executor_type == JobExecutorType.PROCESS
    assert options.job_memory_warn_mb == 1000
    assert options.job_memory_limit_mb == 0


def test_worker_pool_and_memory_limits_come_from_the_environment(monkeypatch):
    monkeypatch.setattr(settings, "LIVEKIT_WS_URL", "ws://localhost:7880")
    monkeypatch.setattr(settings, "LIVEKIT_API_KEY", "devkey")
    monkeypatch.setattr(settings, "LIVEKIT_API_SECRET", "secret")
    monkeypatch.setenv("LIVEKIT_NUM_IDLE_PROCESSES", "4")
    monkeypatch.setenv("LIVEKIT_JOB_MEMORY_WARN_MB", "600")
    monkeypatch.setenv("LIVEKIT_JOB_MEMORY_LIMIT_MB", "800")

    options = worker_options()

    assert options.num_idle_processes == 4
    assert options.job_memory_warn_mb == 600
    assert options.job_memory_limit_mb == 800


def test_worker_ignores_an_invalid_pool_setting_instead_of_failing(monkeypatch):
    monkeypatch.setattr(settings, "LIVEKIT_WS_URL", "ws://localhost:7880")
    monkeypatch.setattr(settings, "LIVEKIT_API_KEY", "devkey")
    monkeypatch.setattr(settings, "LIVEKIT_API_SECRET", "secret")
    monkeypatch.setenv("LIVEKIT_NUM_IDLE_PROCESSES", "2x")
    monkeypatch.setenv("LIVEKIT_JOB_MEMORY_LIMIT_MB", "lots")

    options = worker_options()

    assert options.num_idle_processes == 2
    assert options.job_memory_limit_mb == 0


def test_worker_rejects_a_fractional_process_count(monkeypatch):
    monkeypatch.setattr(settings, "LIVEKIT_WS_URL", "ws://localhost:7880")
    monkeypatch.setattr(settings, "LIVEKIT_API_KEY", "devkey")
    monkeypatch.setattr(settings, "LIVEKIT_API_SECRET", "secret")
    monkeypatch.setenv("LIVEKIT_NUM_IDLE_PROCESSES", "2.9")

    options = worker_options()

    assert options.num_idle_processes == 2


@pytest.mark.parametrize(
    ("http_url", "ws_url", "expected_ws_url"),
    [
        ("http://livekit:7880", "wss://avintra.example.com/livekit", "ws://livekit:7880"),
        ("https://test.livekit.cloud", "wss://test.livekit.cloud", "wss://test.livekit.cloud"),
        ("", "wss://test.livekit.cloud", "wss://test.livekit.cloud"),
    ],
)
def test_worker_registers_on_the_server_side_livekit_url(
    monkeypatch, http_url, ws_url, expected_ws_url
):
    monkeypatch.setattr(settings, "LIVEKIT_HTTP_URL", http_url)
    monkeypatch.setattr(settings, "LIVEKIT_WS_URL", ws_url)
    monkeypatch.setattr(settings, "LIVEKIT_API_KEY", "key")
    monkeypatch.setattr(settings, "LIVEKIT_API_SECRET", "secret")

    assert worker_options().ws_url == expected_ws_url
