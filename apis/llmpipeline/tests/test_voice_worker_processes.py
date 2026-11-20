"""Worker pool options for the voice agent.

Every environment keeps warm processes so the first caller does not wait for the
pipeline import, credential setup, and VAD load in a cold process.

Run from ``apis/llmpipeline``:

    ./.venv/Scripts/python.exe -m pytest tests/test_voice_worker_processes.py -q
"""

from livekit.agents import JobExecutorType

from app.core.config import settings
from voice_agent.agent import worker_options


def test_worker_keeps_two_warm_processes_in_every_environment(monkeypatch):
    monkeypatch.setattr(settings, "LIVEKIT_WS_URL", "ws://localhost:7880")
    monkeypatch.setattr(settings, "LIVEKIT_API_KEY", "devkey")
    monkeypatch.setattr(settings, "LIVEKIT_API_SECRET", "secret")

    options = worker_options()

    assert options.num_idle_processes == 2
    assert options.initialize_process_timeout == 30
    assert options.job_executor_type == JobExecutorType.PROCESS
