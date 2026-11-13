"""LiveKit worker entrypoint for the VoiceAgent pipeline.

The llmpipeline API starts this worker automatically when ``LIVEKIT_WS_URL``,
``LIVEKIT_API_KEY``, and ``LIVEKIT_API_SECRET`` are set; no separate service is
needed. To debug the worker alone, run it from ``apis/llmpipeline``:

    python -m voice_agent.agent dev

Every job is bound to one tenant, user, flow version, conversation, space, and
environment by its dispatch metadata. A job that fails that binding exits
before any provider call.
"""

from __future__ import annotations

import asyncio
import logging
from typing import NamedTuple

from livekit.agents import (
    AgentServer,
    JobContext,
    JobExecutorType,
    JobProcess,
    WorkerOptions,
    cli,
)
from livekit.agents.worker import ServerEnvOption
from livekit.plugins import silero

from app.core.config import env, settings
from app.core.logger import logger

from .metadata import VoiceSessionRejected, parse_job_metadata, validate_job
from .session_runtime import run_session
from .settings_client import fetch_settings


class VoiceWorker(NamedTuple):
    """A worker running in the API event loop, with the task that owns it."""

    server: AgentServer
    task: asyncio.Task[None]


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
    # IMPORTANT NOTE: LiveKit's dev CLI raises the root logger to DEBUG, so LiteLLM
    # dumps each request body (whole audio files included) to stdout and the worker
    # stalls on the pipe. Warnings and errors still come through.
    logging.getLogger("LiteLLM").setLevel(logging.WARNING)
    proc.userdata["vad"] = silero.VAD.load()


def voice_worker_configured() -> bool:
    return all(
        (value or "").strip()
        for value in (
            settings.LIVEKIT_WS_URL,
            settings.LIVEKIT_API_KEY,
            settings.LIVEKIT_API_SECRET,
        )
    )


def worker_options() -> WorkerOptions:
    """Build worker options, failing fast instead of letting LiveKit guess credentials."""

    if not voice_worker_configured():
        raise RuntimeError(
            "LIVEKIT_WS_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET are required to run the voice worker."
        )
    logger.info("[voice-agent] starting worker '%s' for %s", settings.LIVEKIT_AGENT_NAME, settings.LIVEKIT_WS_URL)

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
        # IMPORTANT NOTE: a Windows job process imports its modules and loads the VAD
        # in ~20s, past the 10s default that kills it mid-startup.
        initialize_process_timeout=30,
        # IMPORTANT NOTE: warm processes delay registration until they initialize, so dev
        # registers immediately and spawns on the first job while prod keeps a floor.
        num_idle_processes=ServerEnvOption(dev_default=0, prod_default=4),
    )


async def start_voice_worker() -> VoiceWorker | None:
    """Start the worker in the API's event loop, or skip it when LiveKit is unset."""

    if not voice_worker_configured():
        logger.info("[voice-agent] LiveKit is not configured; voice worker not started.")
        return None

    server = AgentServer.from_server_options(worker_options())
    task = asyncio.create_task(
        server.run(devmode=env == "local"),
        name="voice-agent-worker",
    )
    task.add_done_callback(_log_worker_exit)
    return VoiceWorker(server=server, task=task)


async def stop_voice_worker(worker: VoiceWorker, timeout: float = 10) -> None:
    """Stop the worker and wait briefly for its process pool to close."""

    async def _shutdown() -> None:
        await worker.server.aclose()
        await asyncio.gather(worker.task, return_exceptions=True)

    try:
        await asyncio.wait_for(_shutdown(), timeout=timeout)
    except asyncio.TimeoutError:
        worker.task.cancel()
        try:
            await asyncio.wait_for(worker.task, timeout=2)
        except (asyncio.CancelledError, asyncio.TimeoutError):
            pass


def _log_worker_exit(task: asyncio.Task[None]) -> None:
    if task.cancelled():
        return
    error = task.exception()
    if error is not None:
        logger.error("[voice-agent] worker stopped: %s", error)


if __name__ == "__main__":
    try:
        cli.run_app(worker_options())
    except RuntimeError as error:
        raise SystemExit(str(error)) from error
