"""Worker pool options for the voice agent.

Every environment keeps warm processes so the first caller does not wait for the
pipeline import, credential setup, and VAD load in a cold process.

Run from ``apis/llmpipeline``:

    ./.venv/Scripts/python.exe -m pytest tests/test_voice_worker_processes.py -q
"""

from types import SimpleNamespace

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
    assert options.preload_modules == ["voice_agent.agent"]


def test_worker_never_reports_load_that_would_drop_a_dispatch(monkeypatch):
    monkeypatch.setattr(settings, "LIVEKIT_WS_URL", "ws://localhost:7880")
    monkeypatch.setattr(settings, "LIVEKIT_API_KEY", "devkey")
    monkeypatch.setattr(settings, "LIVEKIT_API_SECRET", "secret")

    load_fnc = worker_options().load_fnc
    server = SimpleNamespace(active_jobs=[object(), object()])

    assert load_fnc(server) == 0.0


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
