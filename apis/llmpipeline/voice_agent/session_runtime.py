"""Worker runtime for one dispatched voice session.

S5 joins the room and binds the caller. S6 runs LiveKit's Silero VAD and
endpointing over the caller's audio and transcribes each whole utterance with
the configured LiteLLM STT provider. S7 forwards the latest caller utterance
to the LangGraph chat engine, which owns history, tools, and persistence. S8
speaks the engine's deltas sentence by sentence through the configured LiteLLM
TTS provider. S9 owns the turn lifecycle: the introduction, interruption,
stable session events, and clean disconnect. S10 persists each finalized turn's
timing, records the terminal conversation status, and leaves no room or task
behind when a call ends or fails.
"""

from __future__ import annotations

import asyncio

from livekit.agents import (
    Agent,
    AgentSession,
    AutoSubscribe,
    JobContext,
    stt,
)
from livekit.agents.voice.room_io import RoomOptions
from livekit.plugins import silero
from livekit.rtc import RemoteParticipant

from app.core.logger import logger

from .chat_bridge import VoiceChatBridge
from .events import (
    RoomEventPublisher,
    VoiceSessionEvents,
    configuration_error_code,
    error_code_for_source,
)
from .llm_adapter import VoiceEngineLLM
from .metadata import VoiceJobClaims
from .persistence import VoiceConversationLifecycle, VoiceTurnTimingRecorder
from .stt_adapter import LiteLLMSTT, build_stt_request, build_user
from .tts_adapter import LiteLLMTTS, build_tts_request


def introduction_for(agent_settings: dict) -> str | None:
    """Return the resolved introduction only when the agent speaks first."""

    if str(agent_settings.get("firstSpeaker") or "human").strip().lower() != "ai":
        return None
    introduction = (agent_settings.get("introduction") or "").strip()
    return introduction or None


def _configuration_problem(
    label: str,
    *,
    provider: str | None,
    model: str | None,
    is_byok_enabled: bool,
    credential_name: str | None,
) -> tuple[str, str] | None:
    code = configuration_error_code(
        provider=provider,
        model=model,
        is_byok_enabled=is_byok_enabled,
        credential_name=credential_name,
    )
    if code is None:
        return None
    return code, f"voice agent {label} is not configured"


async def _delete_room(ctx: JobContext) -> None:
    try:
        await ctx.delete_room()
    except Exception:
        logger.exception("[voice-agent] room deletion failed")


async def run_session(
    ctx: JobContext,
    claims: VoiceJobClaims,
    agent_settings: dict,
) -> None:
    """Speak first when configured, answer each turn, and stop on caller disconnect."""

    recorder = VoiceTurnTimingRecorder(claims)
    lifecycle = VoiceConversationLifecycle(claims)
    events = VoiceSessionEvents(
        claims.conversation_id,
        publish=RoomEventPublisher(ctx.room),
        persist_turn=recorder,
    )

    request = build_stt_request(claims, agent_settings)
    llm_settings = agent_settings.get("llm") or {}
    tts_request = build_tts_request(claims, agent_settings)

    problems = [
        _configuration_problem(
            "speech-to-text",
            provider=request.provider,
            model=request.model,
            is_byok_enabled=request.is_byok_enabled,
            credential_name=request.credential_name,
        ),
        _configuration_problem(
            "language model",
            provider=llm_settings.get("provider"),
            model=llm_settings.get("model"),
            is_byok_enabled=bool(llm_settings.get("isByokEnabled")),
            credential_name=llm_settings.get("credentialName"),
        ),
        _configuration_problem(
            "text-to-speech",
            provider=tts_request.provider,
            model=tts_request.model,
            is_byok_enabled=tts_request.is_byok_enabled,
            credential_name=tts_request.credential_name,
        ),
    ]

    for problem in problems:
        if problem is None:
            continue
        code, message = problem
        logger.warning(
            "[voice-agent] %s conversation=%s",
            message,
            claims.conversation_id,
        )
        events.error(code, message)
        events.close("error", error=True, code=code)
        await events.aclose()
        await _delete_room(ctx)
        await lifecycle.finish(failed=True)
        ctx.shutdown(message)
        return

    try:
        await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
        caller = await ctx.wait_for_participant(identity=f"user-{claims.user_id}")
    except asyncio.CancelledError:
        raise
    except Exception:
        logger.exception(
            "[voice-agent] join failed conversation=%s",
            claims.conversation_id,
        )
        events.error(error_code_for_source(None), "The voice session could not start.")
        events.close("error", error=True)
        await events.aclose()
        await _delete_room(ctx)
        await lifecycle.finish(failed=True)
        raise

    logger.info(
        "[voice-agent] joined room=%s conversation=%s flow_version=%s agent=%s",
        ctx.room.name,
        claims.conversation_id,
        claims.flow_version_id,
        agent_settings.get("agentName"),
    )

    disconnected = asyncio.Event()
    close_reason = ""
    close_failed = False
    failed = False

    def _mark_closed(reason: str, *, error: bool = False) -> None:
        nonlocal close_reason, close_failed, failed
        if error:
            failed = True
        if close_reason:
            return
        close_reason = reason
        close_failed = error
        disconnected.set()

    def _on_participant_disconnected(participant: RemoteParticipant) -> None:
        if participant.identity == caller.identity:
            _mark_closed("participant_disconnected")

    async def _on_shutdown(_reason: str) -> None:
        _mark_closed("job_shutdown")

    def _on_agent_state_changed(event) -> None:
        events.state(event.new_state, event.old_state)

    def _on_user_input_transcribed(event) -> None:
        if event.is_final:
            events.caller_transcript(event.transcript)

    def _on_session_error(event) -> None:
        nonlocal failed
        failed = True
        events.error(
            error_code_for_source(event.source),
            str(event.error) or type(event.error).__name__,
        )

    def _on_session_close(event) -> None:
        reason = getattr(event.reason, "value", str(event.reason))
        _mark_closed(reason, error=event.error is not None or reason == "error")

    ctx.room.on("participant_disconnected", _on_participant_disconnected)
    ctx.add_shutdown_callback(_on_shutdown)

    vad = ctx.proc.userdata.get("vad") or silero.VAD.load()
    user = build_user(claims)
    engine_llm = VoiceEngineLLM(
        bridge=VoiceChatBridge(claims=claims, agent_settings=agent_settings),
        model=llm_settings.get("model") or "",
        provider=llm_settings.get("provider") or "",
        events=events,
    )

    session = AgentSession(
        vad=vad,
        stt=stt.StreamAdapter(
            stt=LiteLLMSTT(request=request, user=user, events=events),
            vad=vad,
        ),
        llm=engine_llm,
        tts=LiteLLMTTS(request=tts_request, user=user, events=events),
        turn_handling={
            "turn_detection": "vad",
            "endpointing": {"min_delay": 0.5, "max_delay": 3.0},
            "interruption": {
                "enabled": True,
                "mode": "vad",
                "resume_false_interruption": False,
                "false_interruption_timeout": None,
            },
            "preemptive_generation": {"enabled": False},
        },
    )

    session.on("agent_state_changed", _on_agent_state_changed)
    session.on("user_input_transcribed", _on_user_input_transcribed)
    session.on("error", _on_session_error)
    session.on("close", _on_session_close)

    try:
        await session.start(
            agent=Agent(instructions=""),
            room=ctx.room,
            room_options=RoomOptions(
                participant_identity=caller.identity,
                audio_output=True,
            ),
        )
        introduction = introduction_for(agent_settings)
        if introduction:
            session.say(introduction, add_to_chat_ctx=False)
        await disconnected.wait()
    except asyncio.CancelledError:
        raise
    except Exception:
        logger.exception(
            "[voice-agent] session failed conversation=%s",
            claims.conversation_id,
        )
        _mark_closed("error", error=True)
    finally:
        await session.aclose()
        events.close(close_reason or "job_shutdown", error=close_failed)
        await events.aclose()
        await _delete_room(ctx)
        await lifecycle.finish(failed=failed or close_failed)
        logger.info("[voice-agent] ended conversation=%s", claims.conversation_id)
