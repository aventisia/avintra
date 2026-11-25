"""LiveKit worker entrypoint for the VoiceAgent pipeline.

The llmpipeline API starts this worker automatically when a LiveKit URL
(``LIVEKIT_WS_URL`` or ``LIVEKIT_HTTP_URL``), ``LIVEKIT_API_KEY``, and
``LIVEKIT_API_SECRET`` are set; no separate service is needed. To debug the
worker alone, run it from ``apis/llmpipeline``:

    python -m voice_agent.agent dev

Every job is bound to one tenant, user, flow version, conversation, space, and
environment by its dispatch metadata. A job that fails that binding exits
before any provider call.
"""

from __future__ import annotations

import asyncio
import logging
import os
import time

from livekit import rtc
from livekit.agents import (
    AgentServer,
    AutoSubscribe,
    JobContext,
    JobExecutorType,
    JobProcess,
    WorkerOptions,
    cli,
)
from livekit.plugins import silero

from app.core.config import env, livekit_ws_url, settings
from app.core.logger import logger

from .metadata import VoiceSessionRejected, parse_job_metadata, validate_job
from .session_runtime import delete_room, run_session
from .settings_client import fetch_settings

WORKER_RESTART_INITIAL_DELAY_SECONDS = 5.0
WORKER_RESTART_MAX_DELAY_SECONDS = 60.0


class VoiceWorker:
    """Supervises the LiveKit worker in the API event loop, restarting it after a crash."""

    def __init__(self, options: WorkerOptions) -> None:
        self._options = options
        self.server: AgentServer | None = None
        self.stopped = asyncio.Event()
        self.task: asyncio.Task[None] | None = None

    async def run(self) -> None:
        delay = WORKER_RESTART_INITIAL_DELAY_SECONDS
        while not self.stopped.is_set():
            self.server = AgentServer.from_server_options(self._options)
            try:
                await self.server.run(devmode=env == "local")
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("[voice-agent] worker stopped unexpectedly")
            else:
                logger.warning("[voice-agent] worker exited unexpectedly")
            if self.stopped.is_set():
                return
            try:
                await self.server.aclose()
            except Exception:
                logger.warning(
                    "[voice-agent] failed to close the crashed worker", exc_info=True
                )
            logger.warning("[voice-agent] restarting worker in %.0f s", delay)
            try:
                await asyncio.wait_for(self.stopped.wait(), timeout=delay)
                return
            except TimeoutError:
                delay = min(delay * 2, WORKER_RESTART_MAX_DELAY_SECONDS)


async def entrypoint(ctx: JobContext) -> None:
    started_at = time.perf_counter()

    # IMPORTANT NOTE: only local metadata validation runs before connect. Joining
    # the room first keeps settings, credential, and model setup off the caller's
    # connection path.
    try:
        claims = parse_job_metadata(ctx.job.metadata)
        validate_job(
            claims,
            agent_name=ctx.job.agent_name,
            expected_agent_name=settings.LIVEKIT_AGENT_NAME,
            room_name=ctx.job.room.name,
        )
    except VoiceSessionRejected as error:
        logger.warning("[voice-agent] rejected job: %s", error)
        await delete_room(ctx)
        ctx.shutdown("voice session rejected")
        return

    room_name = ctx.job.room.name
    logger.info("[voice-timing] entrypoint room=%s", room_name)

    def _log_track_subscribed(_track, _publication, participant) -> None:
        logger.info(
            "[voice-timing] audio subscribed participant=%s total_ms=%d",
            participant.identity,
            round((time.perf_counter() - started_at) * 1000),
        )

    ctx.room.on("track_subscribed", _log_track_subscribed)
    connect_started_at = time.perf_counter()
    connect_task = asyncio.create_task(ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY))
    settings_started_at = time.perf_counter()
    settings_task = asyncio.create_task(fetch_settings(claims))

    try:
        agent_settings = await _prepare_session(
            ctx,
            connect_task,
            settings_task,
            room_name,
            connect_started_at,
        )
    except asyncio.CancelledError:
        await _cancel_tasks(connect_task, settings_task)
        raise

    if agent_settings is None:
        return

    logger.info(
        "[voice-timing] prepared room=%s total_ms=%d settings_ms=%d",
        room_name,
        round((time.perf_counter() - started_at) * 1000),
        round((time.perf_counter() - settings_started_at) * 1000),
    )
    await run_session(ctx, claims, agent_settings, started_at=started_at)


async def _cancel_tasks(*tasks: asyncio.Task) -> None:
    for task in tasks:
        task.cancel()
    await asyncio.gather(*tasks, return_exceptions=True)


async def _prepare_session(
    ctx: JobContext,
    connect_task: asyncio.Task[None],
    settings_task: asyncio.Task[dict],
    room_name: str,
    connect_started_at: float,
) -> dict | None:
    done, _ = await asyncio.wait(
        {connect_task, settings_task}, return_when=asyncio.FIRST_COMPLETED
    )

    if settings_task in done and not connect_task.done():
        try:
            settings_task.result()
        except VoiceSessionRejected as error:
            await _cancel_tasks(connect_task, settings_task)
            logger.warning("[voice-agent] rejected job: %s", error)
            await delete_room(ctx)
            ctx.shutdown("voice session rejected")
            return None
        except Exception:
            await _cancel_tasks(connect_task, settings_task)
            raise

    # IMPORTANT NOTE: the session join retries the connect and owns the
    # user-facing failure path; this early attempt only saves setup time.
    try:
        await connect_task
        logger.info(
            "[voice-timing] connected room=%s connect_ms=%d",
            room_name,
            round((time.perf_counter() - connect_started_at) * 1000),
        )
    except Exception as error:
        logger.warning("[voice-agent] early connect failed: %s", error)

    try:
        return await settings_task
    except VoiceSessionRejected as error:
        logger.warning("[voice-agent] rejected job: %s", error)
        await delete_room(ctx)
        ctx.shutdown("voice session rejected")
        return None


def _warm_audio_resampler() -> None:
    # IMPORTANT NOTE: livekit-ffi's bundled soxr creates its process-global FFT
    # cache lazily without a lock. Two job audio paths taking that first step at
    # once abort the process on Windows (`LSX_FFT_BR == NULL`), so prewarm runs
    # one resample alone before any session can race for it.
    frame = rtc.AudioFrame.create(48000, 1, 4800)
    resampler = rtc.AudioResampler(48000, 16000, num_channels=1)
    resampler.push(frame)
    resampler.flush()


def prewarm(proc: JobProcess) -> None:
    # IMPORTANT NOTE: LiveKit's dev CLI raises the root logger to DEBUG, so LiteLLM
    # dumps each request body (whole audio files included) to stdout and the worker
    # stalls on the pipe. Warnings and errors still come through.
    logging.getLogger("LiteLLM").setLevel(logging.WARNING)
    try:
        _warm_audio_resampler()
    except Exception:
        logger.warning("[voice-agent] audio resampler warm-up failed", exc_info=True)
    proc.userdata["vad"] = silero.VAD.load()


def voice_worker_configured() -> bool:
    return all(
        (value or "").strip()
        for value in (
            livekit_ws_url(),
            settings.LIVEKIT_API_KEY,
            settings.LIVEKIT_API_SECRET,
        )
    )


def _env_number(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return default
    try:
        return float(raw)
    except ValueError:
        logger.warning(
            "[voice-agent] ignoring invalid %s=%r; using %g", name, raw, default
        )
        return default


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return default
    try:
        return int(raw)
    except ValueError:
        logger.warning(
            "[voice-agent] ignoring invalid %s=%r; using %d", name, raw, default
        )
        return default


def worker_load(_server: AgentServer) -> float:
    # IMPORTANT NOTE: LiveKit's default load is host CPU percent, and its dispatch
    # affinity drops any job at 0.7, so a busy host or a warming process makes the
    # caller wait forever even though the API already returned 200. Report no load;
    # the API's active-session cap is the admission control.
    return 0.0


def worker_options() -> WorkerOptions:
    """Build worker options, failing fast instead of letting LiveKit guess credentials."""

    if not voice_worker_configured():
        raise RuntimeError(
            "A LiveKit URL (LIVEKIT_WS_URL or LIVEKIT_HTTP_URL), LIVEKIT_API_KEY, and "
            "LIVEKIT_API_SECRET are required to run the voice worker."
        )
    ws_url = livekit_ws_url()
    logger.info("[voice-agent] starting worker '%s' for %s", settings.LIVEKIT_AGENT_NAME, ws_url)

    return WorkerOptions(
        entrypoint_fnc=entrypoint,
        prewarm_fnc=prewarm,
        agent_name=settings.LIVEKIT_AGENT_NAME,
        ws_url=ws_url,
        api_key=settings.LIVEKIT_API_KEY,
        api_secret=settings.LIVEKIT_API_SECRET,
        # IMPORTANT NOTE: Windows defaults to thread-isolated jobs, so a process-global
        # engine or HTTP client survives into the next job's loop and fails. Process
        # isolation matches the Linux default and keeps each job's state loop-local.
        job_executor_type=JobExecutorType.PROCESS,
        load_fnc=worker_load,
        # IMPORTANT NOTE: a Windows job process imports its modules and loads the VAD
        # in ~20s, past the 10s default that kills it mid-startup.
        initialize_process_timeout=30,
        # IMPORTANT NOTE: a cold job process adds its whole import and VAD load
        # (~20s on Windows) to the caller's wait, so every environment keeps warm
        # processes instead of spawning on the first job. Each warm process costs
        # its full RSS, so raise the count only with measured memory headroom.
        num_idle_processes=_env_int("LIVEKIT_NUM_IDLE_PROCESSES", 2),
        # A per-job limit bounds the blast radius of one leaking call; 0 disables it.
        job_memory_warn_mb=_env_number("LIVEKIT_JOB_MEMORY_WARN_MB", 1000),
        job_memory_limit_mb=_env_number("LIVEKIT_JOB_MEMORY_LIMIT_MB", 0),
    )


async def start_voice_worker() -> VoiceWorker | None:
    """Start the worker in the API's event loop, or skip it when LiveKit is unset."""

    if not voice_worker_configured():
        logger.info("[voice-agent] LiveKit is not configured; voice worker not started.")
        return None

    worker = VoiceWorker(worker_options())
    worker.task = asyncio.create_task(worker.run(), name="voice-agent-worker")
    worker.task.add_done_callback(_log_worker_exit)
    return worker


async def stop_voice_worker(worker: VoiceWorker, timeout: float = 10) -> None:
    """Stop the worker and wait briefly for its process pool to close."""

    async def _shutdown() -> None:
        worker.stopped.set()
        if worker.server is not None:
            await worker.server.aclose()
        if worker.task is not None:
            await asyncio.gather(worker.task, return_exceptions=True)

    try:
        await asyncio.wait_for(_shutdown(), timeout=timeout)
    except asyncio.TimeoutError:
        if worker.task is None:
            return
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
