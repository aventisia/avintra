"""Worker pool options for the voice agent.

Production keeps a prewarmed process so the first caller does not wait for the
pipeline import and VAD load. Development registers before spawning so a fresh
API process never races its first dispatch. These tests pin that floor until
broader worker scaling is designed.

Run from ``apis/llmpipeline``:

    ./.venv/Scripts/python.exe -m pytest tests/test_voice_worker_processes.py -q
"""

from livekit.agents import JobExecutorType
from livekit.agents.worker import ServerEnvOption

from app.core.config import settings
from voice_agent.agent import worker_options


def test_worker_spawns_on_demand_in_dev_and_keeps_a_floor_in_prod(monkeypatch):
    monkeypatch.setattr(settings, "LIVEKIT_WS_URL", "ws://localhost:7880")
    monkeypatch.setattr(settings, "LIVEKIT_API_KEY", "devkey")
    monkeypatch.setattr(settings, "LIVEKIT_API_SECRET", "secret")

    options = worker_options()

    assert ServerEnvOption.getvalue(options.num_idle_processes, devmode=True) == 0
    assert ServerEnvOption.getvalue(options.num_idle_processes, devmode=False) == 4
    assert options.initialize_process_timeout == 30
    assert options.job_executor_type == JobExecutorType.PROCESS
