"""Worker pool options for the voice agent.

The LiveKit worker starts no idle processes in dev, so every caller would wait
for a fresh process to import the pipeline and load the VAD. These tests pin the
warm-process floor until broader worker scaling is designed.

Run from ``apis/llmpipeline``:

    ./.venv/Scripts/python.exe -m pytest tests/test_voice_worker_processes.py -q
"""

from livekit.agents.worker import ServerEnvOption

from voice_agent.agent import worker_options


def test_worker_keeps_a_prewarmed_process_ready():
    options = worker_options()

    assert ServerEnvOption.getvalue(options.num_idle_processes, devmode=True) == 1
    assert ServerEnvOption.getvalue(options.num_idle_processes, devmode=False) == 4
