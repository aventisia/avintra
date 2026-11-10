"""LiveKit worker entrypoint for the VoiceAgent pipeline.

Start it from ``apis/llmpipeline`` (``dekit start voice_agent`` or directly):

    python -m voice_agent.agent dev

Every job is bound to one tenant, user, flow version, conversation, space, and
environment by its dispatch metadata. A job that fails that binding exits
before any provider call.
"""

from __future__ import annotations

import logging

from livekit.agents import JobContext, JobExecutorType, JobProcess, WorkerOptions, cli
from livekit.agents.worker import ServerEnvOption
from livekit.plugins import silero

from app.core.config import settings
from app.core.logger import logger

from .metadata import VoiceSessionRejected, parse_job_metadata, validate_job
from .session_runtime import run_session
from .settings_client import fetch_settings


async def entrypoint(ctx: JobContext) -> None:
    try:
        claims = parse_job_metadata(ctx.job.metadata)
        validate_job(
            claims,
            agent_name=ctx.job.agent_name,
            expected_agent_name=settings.LIVEKIT_AGENT_NAME,
            room_name=ctx.job.room.name,
        )
        agent_settings = await fetch_settings(claims)
    except VoiceSessionRejected as error:
        logger.warning("[voice-agent] rejected job: %s", error)
        ctx.shutdown("voice session rejected")
        return

    await run_session(ctx, claims, agent_settings)


def prewarm(proc: JobProcess) -> None:
    """Load the VAD model once per worker process instead of once per call."""

    # IMPORTANT NOTE: LiveKit's dev CLI raises the root logger to DEBUG, so LiteLLM
    # dumps each request body (whole audio files included) to stdout and the worker
    # stalls on the pipe. Warnings and errors still come through.
    logging.getLogger("LiteLLM").setLevel(logging.WARNING)
    proc.userdata["vad"] = silero.VAD.load()


def worker_options() -> WorkerOptions:
    """Build worker options, failing fast instead of letting LiveKit guess credentials."""

    if not settings.LIVEKIT_WS_URL or not settings.LIVEKIT_API_KEY or not settings.LIVEKIT_API_SECRET:
        raise SystemExit(
            "LIVEKIT_WS_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET are required to run the voice worker."
        )

    return WorkerOptions(
        entrypoint_fnc=entrypoint,
        prewarm_fnc=prewarm,
        agent_name=settings.LIVEKIT_AGENT_NAME,
        ws_url=settings.LIVEKIT_WS_URL,
        api_key=settings.LIVEKIT_API_KEY,
        api_secret=settings.LIVEKIT_API_SECRET,
        # IMPORTANT NOTE: Windows defaults to thread-isolated jobs, so a process-global
        # engine or HTTP client survives into the next job's loop and fails. Process
        # isolation matches the Linux default and keeps each job's state loop-local.
        job_executor_type=JobExecutorType.PROCESS,
        # Keep a prewarmed process ready so the first caller does not wait for imports
        # and the VAD load; dev defaults to zero idle processes.
        num_idle_processes=ServerEnvOption(dev_default=1, prod_default=4),
    )


if __name__ == "__main__":
    cli.run_app(worker_options())
