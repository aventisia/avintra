"""Worker runtime for one dispatched voice session.

S5 joins the room and binds the caller. The configured engine then owns the
conversation: pipeline mode transcribes each utterance, calls the LangGraph chat
engine, and speaks the answer through LiteLLM providers; realtime mode runs a
LiveKit provider plugin end to end. Both publish the same stable events and
leave no room or task behind when a call ends or fails.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field

from livekit.agents import (
    Agent,
    AgentSession,
    AutoSubscribe,
    JobContext,
    llm,
)
from livekit.agents.voice.room_io import RoomOptions
from livekit.plugins import silero
from livekit.rtc import RemoteParticipant

from app.core.logger import logger

from .chat_bridge import VoiceChatBridge, load_realtime_chat_context, voice_system_prompt
from .events import (
    RoomEventPublisher,
    VoiceSessionEvents,
    configuration_error_code,
    error_code_for_source,
)
from .llm_adapter import VoiceEngineLLM
from .metadata import VoiceJobClaims
from .persistence import (
    VoiceConversationLifecycle,
    VoiceRealtimeTranscriptWriter,
    VoiceTurnTimingRecorder,
)
from .realtime_adapters import RealtimeConfigurationError, build_realtime_model
from .stt_adapter import (
    STTConfigurationError,
    build_stt,
    build_stt_request,
    build_user,
    uses_streaming_stt,
)
from .tool_bridge import KNOWLEDGE_SYSTEM_INSTRUCTION, RealtimeToolBridge
from .tts_adapter import LiteLLMTTS, build_tts_request
from .usage import RealtimeUsageRecorder, StreamingSTTUsageRecorder

USAGE_FLUSH_INTERVAL_SECONDS = 60.0


def introduction_for(agent_settings: dict) -> str | None:
    """Return the resolved introduction only when the agent speaks first."""

    if str(agent_settings.get("firstSpeaker") or "human").strip().lower() != "ai":
        return None
    introduction = (agent_settings.get("introduction") or "").strip()
    return introduction or None


def introduction_instruction(introduction: str) -> str:
    """Return the realtime reply instruction that speaks the introduction verbatim."""

    # IMPORTANT NOTE: a realtime model has no TTS path in this SDK, so its reply
    # cannot carry fixed text; the instruction has to rule out every paraphrase.
    return (
        "Your first turn is a scripted opening. Say the text below exactly as written, "
        "word for word, and nothing else: do not add a greeting, a question, or a "
        "closing line, and do not continue the conversation. Then stop and wait for "
        f"the caller.\n\n{introduction}"
    )


def engine_mode(agent_settings: dict) -> str:
    """Return the resolved engine mode, defaulting to the pipeline."""

    return str(agent_settings.get("engineMode") or "pipeline").strip().lower()


def _pipeline_configuration_problems(
    claims: VoiceJobClaims,
    agent_settings: dict,
) -> list[tuple[str, str]]:
    """Return every missing pipeline provider setting before the worker joins."""

    stt_request = build_stt_request(claims, agent_settings)
    llm_settings = agent_settings.get("llm") or {}
    tts_request = build_tts_request(claims, agent_settings)

    components = (
        (
            "speech-to-text",
            stt_request.provider,
            stt_request.model,
            stt_request.is_byok_enabled,
            stt_request.credential_name,
        ),
        (
            "language model",
            llm_settings.get("provider"),
            llm_settings.get("model"),
            bool(llm_settings.get("isByokEnabled")),
            llm_settings.get("credentialName"),
        ),
        (
            "text-to-speech",
            tts_request.provider,
            tts_request.model,
            tts_request.is_byok_enabled,
            tts_request.credential_name,
        ),
    )

    problems: list[tuple[str, str]] = []
    for label, provider, model, is_byok_enabled, credential_name in components:
        code = configuration_error_code(
            provider=provider,
            model=model,
            is_byok_enabled=is_byok_enabled,
            credential_name=credential_name,
        )
        if code is not None:
            problems.append((code, f"voice agent {label} is not configured"))
    return problems


@dataclass
class VoiceSession:
    """One joined call, shared by the pipeline and realtime engines."""

    ctx: JobContext
    claims: VoiceJobClaims
    agent_settings: dict
    events: VoiceSessionEvents
    lifecycle: VoiceConversationLifecycle
    caller: RemoteParticipant
    agent_session: AgentSession | None = None
    realtime_usage: RealtimeUsageRecorder | None = None
    stt_usage: StreamingSTTUsageRecorder | None = None
    realtime_transcript: VoiceRealtimeTranscriptWriter | None = None
    disconnected: asyncio.Event = field(default_factory=asyncio.Event)
    close_reason: str = ""
    close_failed: bool = False
    close_code: str | None = None
    failed: bool = False

    def mark_closed(self, reason: str, *, error: bool = False) -> None:
        if error:
            self.failed = True
        if self.close_reason:
            return
        self.close_reason = reason
        self.close_failed = error
        self.disconnected.set()

    def on_agent_state_changed(self, event) -> None:
        self.events.state(event.new_state, event.old_state)

    def on_user_state_changed(self, event) -> None:
        self.events.user_state(event.new_state)

    def on_user_input_transcribed(self, event) -> None:
        if event.is_final:
            self.events.caller_transcript(event.transcript)
        else:
            self.events.caller_interim(event.transcript)

    def on_conversation_item_added(self, event) -> None:
        item = event.item
        if not isinstance(item, llm.ChatMessage) or item.role not in ("user", "assistant"):
            return

        text = item.text_content or ""
        if item.role == "assistant":
            self.events.assistant_transcript(text)

        timing = None
        if item.role == "assistant" and self.realtime_usage is not None:
            response_timing = self.realtime_usage.take_response_timing()
            if response_timing is not None:
                timing = self.events.realtime_response_timing(response_timing)

        if self.realtime_transcript is not None:
            self.realtime_transcript.add(item.role, text, item.id, timing)

    def on_metrics_collected(self, event) -> None:
        if self.realtime_usage is not None:
            self.realtime_usage.on_metrics_collected(event)
        if self.stt_usage is not None:
            self.stt_usage.on_metrics_collected(event)

    def on_session_error(self, event) -> None:
        self.failed = True
        self.events.error(
            error_code_for_source(event.source),
            str(event.error) or type(event.error).__name__,
        )

    def on_session_close(self, event) -> None:
        reason = getattr(event.reason, "value", str(event.reason))
        self.mark_closed(reason, error=event.error is not None or reason == "error")


async def _delete_room(ctx: JobContext) -> None:
    try:
        await ctx.delete_room()
    except Exception:
        logger.exception("[voice-agent] room deletion failed")


async def _reject(
    ctx: JobContext,
    claims: VoiceJobClaims,
    events: VoiceSessionEvents,
    lifecycle: VoiceConversationLifecycle,
    code: str,
    message: str,
) -> None:
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


async def _join(
    ctx: JobContext,
    claims: VoiceJobClaims,
    events: VoiceSessionEvents,
    lifecycle: VoiceConversationLifecycle,
) -> RemoteParticipant:
    try:
        await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
        return await ctx.wait_for_participant(identity=f"user-{claims.user_id}")
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


def _room_options(session: VoiceSession) -> RoomOptions:
    return RoomOptions(
        participant_identity=session.caller.identity,
        audio_output=True,
    )


def _wire_agent_session(session: VoiceSession, agent_session: AgentSession) -> None:
    agent_session.on("agent_state_changed", session.on_agent_state_changed)
    agent_session.on("user_state_changed", session.on_user_state_changed)
    agent_session.on("user_input_transcribed", session.on_user_input_transcribed)
    agent_session.on("error", session.on_session_error)
    agent_session.on("close", session.on_session_close)


async def run_session(
    ctx: JobContext,
    claims: VoiceJobClaims,
    agent_settings: dict,
) -> None:
    """Validate the engine, join the room, run the call, and clean up once."""

    events = VoiceSessionEvents(
        claims.conversation_id,
        publish=RoomEventPublisher(ctx.room),
        persist_turn=VoiceTurnTimingRecorder(claims),
    )
    lifecycle = VoiceConversationLifecycle(claims)

    realtime_model = None
    if engine_mode(agent_settings) == "realtime":
        try:
            realtime_model = build_realtime_model(agent_settings, build_user(claims))
        except RealtimeConfigurationError as error:
            await _reject(ctx, claims, events, lifecycle, error.code, str(error))
            return
    else:
        problems = _pipeline_configuration_problems(claims, agent_settings)
        if problems:
            code, message = problems[0]
            await _reject(ctx, claims, events, lifecycle, code, message)
            return

    caller = await _join(ctx, claims, events, lifecycle)

    session = VoiceSession(
        ctx=ctx,
        claims=claims,
        agent_settings=agent_settings,
        events=events,
        lifecycle=lifecycle,
        caller=caller,
    )

    logger.info(
        "[voice-agent] joined room=%s conversation=%s flow_version=%s agent=%s",
        ctx.room.name,
        claims.conversation_id,
        claims.flow_version_id,
        agent_settings.get("agentName"),
    )

    def _on_participant_disconnected(participant: RemoteParticipant) -> None:
        if participant.identity == caller.identity:
            session.mark_closed("participant_disconnected")

    async def _on_shutdown(_reason: str) -> None:
        session.mark_closed("job_shutdown")

    ctx.room.on("participant_disconnected", _on_participant_disconnected)
    ctx.add_shutdown_callback(_on_shutdown)

    try:
        if realtime_model is None:
            await run_pipeline_session(session)
        else:
            await run_realtime_session(session, realtime_model)
    except asyncio.CancelledError:
        raise
    except Exception:
        logger.exception(
            "[voice-agent] session failed conversation=%s",
            claims.conversation_id,
        )
        session.mark_closed("error", error=True)
    finally:
        await _finish(session)


async def run_pipeline_session(session: VoiceSession) -> None:
    """Run one call through Silero VAD, LiteLLM STT/TTS, and the chat engine."""

    claims = session.claims
    agent_settings = session.agent_settings
    request = build_stt_request(claims, agent_settings)
    llm_settings = agent_settings.get("llm") or {}
    tts_request = build_tts_request(claims, agent_settings)

    vad = session.ctx.proc.userdata.get("vad") or silero.VAD.load()
    user = build_user(claims)
    engine_llm = VoiceEngineLLM(
        bridge=VoiceChatBridge(claims=claims, agent_settings=agent_settings),
        model=llm_settings.get("model") or "",
        provider=llm_settings.get("provider") or "",
        events=session.events,
    )
    try:
        pipeline_stt = build_stt(
            request=request,
            user=user,
            vad=vad,
            events=session.events,
        )
    except STTConfigurationError as error:
        session.events.error(error.code, str(error))
        session.close_code = error.code
        session.mark_closed("error", error=True)
        return
    if uses_streaming_stt(request):
        session.stt_usage = StreamingSTTUsageRecorder(claims, request)

    preemptive = bool(agent_settings.get("preemptiveGeneration"))
    session.agent_session = AgentSession(
        vad=vad,
        stt=pipeline_stt,
        llm=engine_llm,
        tts=LiteLLMTTS(request=tts_request, user=user, events=session.events),
        turn_handling={
            "turn_detection": "vad",
            "endpointing": {"min_delay": 0.5, "max_delay": 3.0},
            "interruption": {
                "enabled": True,
                "mode": "vad",
                "resume_false_interruption": False,
                "false_interruption_timeout": None,
            },
            "preemptive_generation": {
                "enabled": preemptive,
                "preemptive_tts": preemptive,
            },
        },
    )
    _wire_agent_session(session, session.agent_session)
    session.agent_session.on("metrics_collected", session.on_metrics_collected)

    try:
        await session.agent_session.start(
            agent=Agent(instructions=""),
            room=session.ctx.room,
            room_options=_room_options(session),
        )
        introduction = introduction_for(agent_settings)
        if introduction:
            session.agent_session.say(introduction, add_to_chat_ctx=False)
        await _wait_for_disconnect(session)
    except asyncio.CancelledError:
        raise
    except Exception:
        logger.exception(
            "[voice-agent] session failed conversation=%s",
            claims.conversation_id,
        )
        session.mark_closed("error", error=True)


async def run_realtime_session(
    session: VoiceSession,
    model: llm.RealtimeModel,
) -> None:
    """Run one call through a provider's speech-to-speech realtime model."""

    agent_settings = session.agent_settings
    session.agent_session = AgentSession(llm=model)
    _wire_agent_session(session, session.agent_session)
    session.agent_session.on(
        "conversation_item_added", session.on_conversation_item_added
    )
    session.agent_session.on("metrics_collected", session.on_metrics_collected)

    session.realtime_usage = RealtimeUsageRecorder(session.claims, agent_settings)
    if session.claims.mode != "test":
        session.realtime_transcript = VoiceRealtimeTranscriptWriter(
            session.claims, agent_settings
        )
        session.realtime_transcript.start()

    chat_ctx = await _realtime_chat_context(session)
    tool_bridge = RealtimeToolBridge(
        session.claims,
        agent_settings,
        session.events,
    )
    tools = await tool_bridge.build()
    instructions = voice_system_prompt(agent_settings) or ""
    if tool_bridge.has_knowledge_search:
        instructions = (
            f"{instructions}\n\n{KNOWLEDGE_SYSTEM_INSTRUCTION}".strip()
        )

    try:
        await session.agent_session.start(
            agent=Agent(
                instructions=instructions,
                chat_ctx=chat_ctx,
                tools=tools,
            ),
            room=session.ctx.room,
            room_options=_room_options(session),
        )
        introduction = introduction_for(agent_settings)
        if introduction:
            session.agent_session.generate_reply(
                instructions=introduction_instruction(introduction)
            )
        await _wait_for_disconnect(session)
    except asyncio.CancelledError:
        raise
    except Exception:
        logger.exception(
            "[voice-agent] session failed conversation=%s",
            session.claims.conversation_id,
        )
        session.mark_closed("error", error=True)


async def _realtime_chat_context(session: VoiceSession) -> llm.ChatContext | None:
    if session.claims.mode == "test":
        return None

    try:
        return await load_realtime_chat_context(
            session.claims, session.agent_settings
        )
    except Exception:
        logger.exception(
            "[voice-agent] history load failed conversation=%s",
            session.claims.conversation_id,
        )
        return None


async def _wait_for_disconnect(session: VoiceSession) -> None:
    """Wait for the call, posting accumulated usage periodically while it lasts."""

    recorders = [
        recorder
        for recorder in (session.realtime_usage, session.stt_usage)
        if recorder is not None
    ]
    if not recorders:
        await session.disconnected.wait()
        return

    while True:
        try:
            await asyncio.wait_for(
                session.disconnected.wait(),
                timeout=USAGE_FLUSH_INTERVAL_SECONDS,
            )
            return
        except TimeoutError:
            for recorder in recorders:
                await recorder.flush()


async def _finish(session: VoiceSession) -> None:
    if session.agent_session is not None:
        await session.agent_session.aclose()
    if session.realtime_transcript is not None:
        await session.realtime_transcript.aclose()
    if session.realtime_usage is not None:
        await session.realtime_usage.flush()
    if session.stt_usage is not None:
        await session.stt_usage.flush()
    session.events.close(
        session.close_reason or "job_shutdown",
        error=session.close_failed,
        code=session.close_code,
    )
    await session.events.aclose()
    await _delete_room(session.ctx)
    await session.lifecycle.finish(failed=session.failed or session.close_failed)
    logger.info(
        "[voice-agent] ended conversation=%s",
        session.claims.conversation_id,
    )
