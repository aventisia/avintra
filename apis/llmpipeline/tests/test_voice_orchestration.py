"""Turn-lifecycle tests for #373 (S9).

The LiveKit session and room are faked, and the chat engine bridge is scripted,
so these tests cover the orchestration without a provider, database, or room.
They verify both first-speaker modes, the resolved introduction, the spoken-style
guidance, two turns over one chat context, barge-in cancellation, provider
errors, one engine call/tool report per turn, and a clean caller disconnect.

Run from ``apis/llmpipeline``:

    ./venv/Scripts/python.exe -m pytest tests/test_voice_orchestration.py -q
"""

from __future__ import annotations

import asyncio
import json
from types import SimpleNamespace
from uuid import UUID, uuid4

import pytest
from livekit.agents import AutoSubscribe, llm, stt

from app.features.realtime_voice.schemas import (
    ERROR_CODE_CREDENTIALS_UNAVAILABLE,
    ERROR_CODE_INVALID_CONFIG,
    ERROR_CODE_UPSTREAM,
    WS_CLOSE_BAD_CONFIG,
    WS_CLOSE_FORBIDDEN,
    WS_CLOSE_NORMAL,
    WS_CLOSE_UPSTREAM_FAILURE,
)
from voice_agent import session_runtime
from voice_agent.chat_bridge import VoiceTurnFrame, build_voice_llm_request
from voice_agent.events import (
    VOICE_EVENT_TOPIC,
    RoomEventPublisher,
    VoiceSessionEvents,
    close_code_for,
    configuration_error_code,
    error_code_for_source,
)
from voice_agent.llm_adapter import VoiceEngineLLM
from voice_agent.metadata import VoiceJobClaims
from voice_agent.session_runtime import introduction_for, run_session
from voice_agent.tts_adapter import LiteLLMTTS

FLOW_VERSION_ID = UUID("44444444-4444-4444-4444-444444444444")
FLOW_ID = UUID("33333333-3333-3333-3333-333333333333")
TENANT_ID = UUID("11111111-1111-1111-1111-111111111111")
USER_ID = UUID("22222222-2222-2222-2222-222222222222")

SPOKEN_STYLE_GUIDANCE = (
    "Use short sentences and plain spoken language. Do not use Markdown, "
    "bullet points, numbered lists, or other formatting."
)


def _claims() -> VoiceJobClaims:
    return VoiceJobClaims(
        room_name="voice-room",
        flow_version_id=FLOW_VERSION_ID,
        flow_id=FLOW_ID,
        tenant_id=TENANT_ID,
        user_id=USER_ID,
        conversation_id=str(uuid4()),
        mode="live",
        space_id="space-1",
        env_type="dev",
        worker_token="worker-token",
        username="voice-tester",
        email="voice-tester@example.com",
    )


def _settings(**overrides) -> dict:
    settings = {
        "agentName": "Support Agent",
        "engineMode": "pipeline",
        "firstSpeaker": "ai",
        "introduction": "Hi Alice from Acme.",
        "llm": {"provider": "openai", "model": "gpt-4o-mini"},
        "stt": {"provider": "elevenlabs", "model": "scribe_v1"},
        "tts": {"provider": "openai", "model": "tts-1"},
        "ttsVoice": {"language": "en-US", "voice": "alloy"},
        "persona": {"systemPrompt": "Goal:\nHelp the caller."},
        "spokenStyleGuidance": SPOKEN_STYLE_GUIDANCE,
        "tools": [],
        "knowledgeBase": {"names": []},
        "skills": [],
        "memory": {},
    }
    settings.update(overrides)
    return settings


class _FakeTurnTimingRecorder:
    instances: list["_FakeTurnTimingRecorder"] = []

    def __init__(self, claims: VoiceJobClaims) -> None:
        self.claims = claims
        self.turns: list[tuple[int, dict]] = []
        self.instances.append(self)

    async def __call__(self, turn_id: int, timing: dict) -> None:
        self.turns.append((turn_id, timing))


class _FakeConversationLifecycle:
    instances: list["_FakeConversationLifecycle"] = []

    def __init__(self, claims: VoiceJobClaims) -> None:
        self.claims = claims
        self.calls = 0
        self.failed: bool | None = None
        self.instances.append(self)

    async def finish(self, *, failed: bool) -> None:
        self.calls += 1
        self.failed = failed


@pytest.fixture(autouse=True)
def voice_persistence(monkeypatch):
    _FakeTurnTimingRecorder.instances = []
    _FakeConversationLifecycle.instances = []
    monkeypatch.setattr(
        session_runtime, "VoiceTurnTimingRecorder", _FakeTurnTimingRecorder
    )
    monkeypatch.setattr(
        session_runtime, "VoiceConversationLifecycle", _FakeConversationLifecycle
    )
    return SimpleNamespace(
        recorders=_FakeTurnTimingRecorder.instances,
        lifecycles=_FakeConversationLifecycle.instances,
    )


# ---------------------------------------------------------------------------
# Fake room and job context
# ---------------------------------------------------------------------------


class _FakeLocalParticipant:
    def __init__(self) -> None:
        self.published: list[dict] = []

    async def publish_data(
        self,
        data: bytes,
        *,
        reliable: bool = True,
        topic: str | None = None,
        **_kwargs,
    ) -> None:
        self.published.append(
            {
                "payload": json.loads(data.decode("utf-8")),
                "reliable": reliable,
                "topic": topic,
            }
        )


class _FailingLocalParticipant:
    async def publish_data(self, *_args, **_kwargs) -> None:
        raise RuntimeError("room is gone")


class _FakeRoom:
    def __init__(self, local_participant=None) -> None:
        self.name = "voice-room"
        self.handlers: dict[str, object] = {}
        self.local_participant = local_participant or _FakeLocalParticipant()

    def on(self, event: str, callback) -> None:
        self.handlers[event] = callback


class _FakeJobContext:
    def __init__(self) -> None:
        self.room = _FakeRoom()
        self.proc = SimpleNamespace(userdata={"vad": object()})
        self.caller = SimpleNamespace(identity=f"user-{USER_ID}")
        self.connected: list[dict] = []
        self.participant_requests: list[str] = []
        self.shutdowns: list[str] = []
        self.shutdown_callbacks: list = []
        self.deleted_rooms = 0

    async def connect(self, **kwargs) -> None:
        self.connected.append(kwargs)

    async def wait_for_participant(self, *, identity: str):
        self.participant_requests.append(identity)
        return self.caller

    def add_shutdown_callback(self, callback) -> None:
        self.shutdown_callbacks.append(callback)

    def shutdown(self, reason: str) -> None:
        self.shutdowns.append(reason)

    async def delete_room(self) -> None:
        self.deleted_rooms += 1


def _fake_agent_session(monkeypatch, *, on_start=None, start_error=None):
    class FakeAgentSession:
        instances: list = []

        def __init__(self, **options) -> None:
            self.options = options
            self.handlers: dict[str, object] = {}
            self.calls: list[str] = []
            self.said: list[tuple[str, bool]] = []
            self.started: dict | None = None
            self.closed = False
            FakeAgentSession.instances.append(self)

        def on(self, event: str, callback) -> None:
            self.handlers[event] = callback

        def say(self, text: str, *, add_to_chat_ctx: bool = True) -> None:
            self.said.append((text, add_to_chat_ctx))
            self.calls.append("say")

        async def start(self, **kwargs) -> None:
            self.calls.append("start")
            if start_error is not None:
                raise start_error
            self.started = kwargs
            if on_start is not None:
                result = on_start(self)
                if asyncio.iscoroutine(result):
                    await result

        async def aclose(self) -> None:
            self.calls.append("aclose")
            self.closed = True

    monkeypatch.setattr(session_runtime, "AgentSession", FakeAgentSession)
    return FakeAgentSession


def _payloads(ctx: _FakeJobContext) -> list[dict]:
    return [entry["payload"] for entry in ctx.room.local_participant.published]


def _of_type(events: list[dict], event_type: str) -> list[dict]:
    return [event for event in events if event["type"] == event_type]


def _disconnect_on_start(ctx: _FakeJobContext):
    def on_start(_session) -> None:
        ctx.room.handlers["participant_disconnected"](ctx.caller)

    return on_start


# ---------------------------------------------------------------------------
# Stable session events
# ---------------------------------------------------------------------------


def test_session_events_cover_state_transcripts_tools_errors_and_timing():
    published: list[dict] = []
    events = VoiceSessionEvents("conversation-1", publish=published.append)

    events.state("initializing")
    events.state("idle", "initializing")
    events.state("idle")
    events.caller_transcript("   ")
    events.caller_transcript("  hello there  ")
    events.stt_final(120)
    turn = events.begin_turn()
    events.assistant_delta(turn, "Hi ")
    events.assistant_delta(turn, "there.")
    events.tts_first_audio()
    events.tool_call({"name": "demo_lookup"}, turn_id=turn)
    events.error("upstream_error", "provider down", retryable=True, turn_id=turn)
    events.finish_turn(turn)
    events.close("participant_disconnected")
    events.close("error", error=True)

    assert [event["type"] for event in published] == [
        "session.state",
        "session.state",
        "transcript.final",
        "tool.call",
        "error",
        "transcript.final",
        "timing",
        "timing",
        "session.closed",
    ]
    states = _of_type(published, "session.state")
    assert [(state["state"], state["previousState"]) for state in states] == [
        ("connecting", None),
        ("idle", "connecting"),
    ]
    assert _of_type(published, "transcript.final")[0]["text"] == "hello there"
    assert _of_type(published, "transcript.final")[0]["role"] == "user"
    assistant = _of_type(published, "transcript.final")[1]
    assert assistant["role"] == "assistant"
    assert assistant["text"] == "Hi there."
    assert assistant["turnId"] == turn
    assert _of_type(published, "tool.call")[0]["tool"] == {"name": "demo_lookup"}
    error = _of_type(published, "error")[0]
    assert error["code"] == "upstream_error"
    assert error["retryable"] is True
    turn_timing = [event for event in _of_type(published, "timing") if event["stage"] == "turn"][0]
    assert turn_timing["interrupted"] is False
    assert turn_timing["firstDeltaMs"] is not None
    voice_timing = turn_timing["voice_turn_timing"]
    assert set(voice_timing) == {
        "stt_ms",
        "llm_first_token_ms",
        "tts_first_audio_ms",
        "turn_total_ms",
    }
    assert voice_timing["stt_ms"] == 120
    assert voice_timing["llm_first_token_ms"] is not None
    assert voice_timing["tts_first_audio_ms"] is not None
    assert voice_timing["turn_total_ms"] is not None
    assert turn_timing["durationMs"] == voice_timing["turn_total_ms"]
    assert len(_of_type(published, "session.closed")) == 1
    assert _of_type(published, "session.closed")[0]["code"] == WS_CLOSE_NORMAL


def test_finished_turn_persists_the_same_timing_object_as_its_event():
    published: list[dict] = []
    persisted: list[tuple[int, dict]] = []

    async def persist(turn_id: int, timing: dict) -> None:
        persisted.append((turn_id, timing))

    events = VoiceSessionEvents(
        "conversation-1",
        publish=published.append,
        persist_turn=persist,
    )

    async def run() -> int:
        events.stt_final(80)
        turn = events.begin_turn()
        events.assistant_delta(turn, "Hello.")
        events.tts_first_audio()
        events.finish_turn(turn)
        events.finish_turn(turn)
        await events.aclose()
        return turn

    turn = asyncio.run(run())

    [timing_event] = [
        event for event in _of_type(published, "timing") if event["stage"] == "turn"
    ]
    assert persisted == [(turn, timing_event["voice_turn_timing"])]
    assert persisted[0][1]["stt_ms"] == 80
    assert len([event for event in _of_type(published, "timing") if event["stage"] == "turn"]) == 1


def test_unpersisted_turn_emits_timing_without_touching_the_previous_row():
    published: list[dict] = []
    persisted: list[tuple[int, dict]] = []

    async def persist(turn_id: int, timing: dict) -> None:
        persisted.append((turn_id, timing))

    events = VoiceSessionEvents(
        "conversation-1",
        publish=published.append,
        persist_turn=persist,
    )

    class _UnpersistedBridge:
        async def stream_turn(self, transcript: str):
            yield VoiceTurnFrame(kind="delta", text="Sorry, I could not finish.")
            yield VoiceTurnFrame(kind="done", payload=False)

    adapter = VoiceEngineLLM(
        bridge=_UnpersistedBridge(),
        model="m",
        provider="p",
        events=events,
    )

    async def run() -> None:
        events.stt_final(10)
        [chunk async for chunk in adapter.chat(chat_ctx=_chat_context(("user", "hi")))]
        await events.aclose()

    asyncio.run(run())

    [timing_event] = [
        event for event in _of_type(published, "timing") if event["stage"] == "turn"
    ]
    assert timing_event["interrupted"] is False
    assert persisted == []


def test_interrupted_turn_emits_timing_but_never_persists_partial_audio():
    published: list[dict] = []
    persisted: list[tuple[int, dict]] = []

    async def persist(turn_id: int, timing: dict) -> None:
        persisted.append((turn_id, timing))

    events = VoiceSessionEvents(
        "conversation-1",
        publish=published.append,
        persist_turn=persist,
    )

    events.stt_final(50)
    turn = events.begin_turn()
    events.assistant_delta(turn, "Half an ans")
    events.cancel_turn(turn)
    asyncio.run(events.aclose())

    [timing_event] = [
        event for event in _of_type(published, "timing") if event["stage"] == "turn"
    ]
    assert timing_event["interrupted"] is True
    assert persisted == []


def test_cancelled_turn_discards_partial_assistant_text_and_clears_state():
    published: list[dict] = []
    events = VoiceSessionEvents("conversation-1", publish=published.append)

    first = events.begin_turn()
    events.assistant_delta(first, "Half an ans")
    second = events.begin_turn()
    events.finish_turn(first)

    assert second == first + 1
    assert _of_type(published, "transcript.final") == []
    timings = [event for event in _of_type(published, "timing") if event["stage"] == "turn"]
    assert [timing["interrupted"] for timing in timings] == [True]
    assert timings[0]["turnId"] == first


def test_event_and_close_codes_preserve_the_realtime_taxonomy():
    assert close_code_for("participant_disconnected") == WS_CLOSE_NORMAL
    assert close_code_for("job_shutdown") == WS_CLOSE_NORMAL
    assert close_code_for("error") == WS_CLOSE_UPSTREAM_FAILURE
    assert close_code_for("something_unknown") == WS_CLOSE_NORMAL
    assert close_code_for("something_unknown", error=True) == WS_CLOSE_UPSTREAM_FAILURE
    assert (
        close_code_for("error", error=True, code=ERROR_CODE_INVALID_CONFIG)
        == WS_CLOSE_BAD_CONFIG
    )
    assert (
        close_code_for("error", error=True, code=ERROR_CODE_CREDENTIALS_UNAVAILABLE)
        == WS_CLOSE_FORBIDDEN
    )

    def code(**kwargs):
        return configuration_error_code(
            provider=kwargs.get("provider", "openai"),
            model=kwargs.get("model", "gpt-4o-mini"),
            is_byok_enabled=kwargs.get("is_byok_enabled", False),
            credential_name=kwargs.get("credential_name"),
        )

    assert code(provider=None) == ERROR_CODE_INVALID_CONFIG
    assert code(model=None) == ERROR_CODE_INVALID_CONFIG
    assert code(is_byok_enabled=True) == ERROR_CODE_CREDENTIALS_UNAVAILABLE
    assert code(is_byok_enabled=True, credential_name="voice-key") is None
    assert code() is None
    assert error_code_for_source(object()) == ERROR_CODE_UPSTREAM


def test_room_event_publisher_uses_the_voice_topic_and_survives_a_dead_room():
    room = _FakeRoom()

    async def publish() -> None:
        publisher = RoomEventPublisher(room)
        publisher({"type": "session.state", "state": "listening"})
        await publisher.aclose()

    asyncio.run(publish())

    [entry] = room.local_participant.published
    assert entry["payload"] == {"type": "session.state", "state": "listening"}
    assert entry["reliable"] is True
    assert entry["topic"] == VOICE_EVENT_TOPIC

    dead_room = _FakeRoom(_FailingLocalParticipant())

    async def publish_to_dead_room() -> None:
        publisher = RoomEventPublisher(dead_room)
        publisher({"type": "error", "code": "upstream_error"})
        await publisher.aclose()

    asyncio.run(publish_to_dead_room())


# ---------------------------------------------------------------------------
# Runtime orchestration
# ---------------------------------------------------------------------------


def test_introduction_is_used_only_for_an_ai_first_speaker():
    assert introduction_for({"firstSpeaker": "AI", "introduction": "  Hi  "}) == "Hi"
    assert introduction_for({"firstSpeaker": "human", "introduction": "Hi"}) is None
    assert introduction_for({"introduction": "Hi"}) is None
    assert introduction_for({"firstSpeaker": "ai", "introduction": "   "}) is None


def test_ai_first_speaks_the_resolved_introduction_and_wires_the_pipeline(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()
    fake_session = _fake_agent_session(monkeypatch, on_start=_disconnect_on_start(ctx))
    claims = _claims()

    asyncio.run(run_session(ctx, claims, _settings()))

    [session] = fake_session.instances
    assert session.calls == ["start", "say", "aclose"]
    assert session.said == [("Hi Alice from Acme.", False)]
    assert session.closed is True
    assert session.started["room"] is ctx.room
    assert session.started["room_options"].participant_identity == ctx.caller.identity
    assert session.started["room_options"].audio_output is True

    options = session.options
    assert options["vad"] is ctx.proc.userdata["vad"]
    assert isinstance(options["stt"], stt.StreamAdapter)
    assert isinstance(options["llm"], VoiceEngineLLM)
    assert options["llm"].model == "gpt-4o-mini"
    assert options["llm"].provider == "openai"
    assert isinstance(options["tts"], LiteLLMTTS)
    assert options["turn_handling"]["turn_detection"] == "vad"
    assert options["turn_handling"]["endpointing"] == {"min_delay": 0.5, "max_delay": 3.0}
    assert options["turn_handling"]["interruption"] == {
        "enabled": True,
        "mode": "vad",
        "resume_false_interruption": False,
        "false_interruption_timeout": None,
    }
    assert options["turn_handling"]["preemptive_generation"] == {"enabled": False}

    assert ctx.connected == [{"auto_subscribe": AutoSubscribe.AUDIO_ONLY}]
    assert ctx.participant_requests == [f"user-{USER_ID}"]
    assert ctx.shutdowns == []
    assert ctx.deleted_rooms == 1

    [lifecycle] = voice_persistence.lifecycles
    assert lifecycle.calls == 1
    assert lifecycle.failed is False

    events = _payloads(ctx)
    assert _of_type(events, "error") == []
    [closed] = _of_type(events, "session.closed")
    assert closed["reason"] == "participant_disconnected"
    assert closed["code"] == WS_CLOSE_NORMAL
    assert events[-1] is closed


def test_human_first_stays_silent_until_the_caller_speaks(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()
    fake_session = _fake_agent_session(monkeypatch, on_start=_disconnect_on_start(ctx))

    asyncio.run(run_session(ctx, _claims(), _settings(firstSpeaker="human")))

    [session] = fake_session.instances
    assert session.said == []
    assert session.calls == ["start", "aclose"]
    assert _of_type(_payloads(ctx), "session.closed")[0]["code"] == WS_CLOSE_NORMAL
    assert voice_persistence.lifecycles[0].failed is False
    assert ctx.deleted_rooms == 1


@pytest.mark.parametrize(
    ("overrides", "expected_code", "expected_close_code"),
    [
        (
            {"stt": {"provider": "", "model": "scribe_v1"}},
            ERROR_CODE_INVALID_CONFIG,
            WS_CLOSE_BAD_CONFIG,
        ),
        (
            {"llm": {"provider": "", "model": "gpt-4o-mini"}},
            ERROR_CODE_INVALID_CONFIG,
            WS_CLOSE_BAD_CONFIG,
        ),
        (
            {
                "tts": {
                    "provider": "openai",
                    "model": "tts-1",
                    "isByokEnabled": True,
                    "credentialName": None,
                }
            },
            ERROR_CODE_CREDENTIALS_UNAVAILABLE,
            WS_CLOSE_FORBIDDEN,
        ),
    ],
)
def test_configuration_problem_closes_before_connecting(
    monkeypatch,
    voice_persistence,
    overrides,
    expected_code,
    expected_close_code,
):
    ctx = _FakeJobContext()
    fake_session = _fake_agent_session(monkeypatch, on_start=_disconnect_on_start(ctx))

    asyncio.run(run_session(ctx, _claims(), _settings(**overrides)))

    assert fake_session.instances == []
    assert ctx.connected == []
    assert ctx.participant_requests == []
    assert len(ctx.shutdowns) == 1
    assert ctx.deleted_rooms == 1
    [lifecycle] = voice_persistence.lifecycles
    assert lifecycle.calls == 1
    assert lifecycle.failed is True
    events = _payloads(ctx)
    [error] = _of_type(events, "error")
    assert error["code"] == expected_code
    [closed] = _of_type(events, "session.closed")
    assert closed["reason"] == "error"
    assert closed["code"] == expected_close_code
    assert events[-1] is closed


def test_state_caller_transcript_and_provider_error_events_are_published(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()

    def on_start(session) -> None:
        session.handlers["agent_state_changed"](
            SimpleNamespace(old_state="idle", new_state="listening")
        )
        session.handlers["user_input_transcribed"](
            SimpleNamespace(is_final=False, transcript="hel")
        )
        session.handlers["user_input_transcribed"](
            SimpleNamespace(is_final=True, transcript="  hello there  ")
        )
        session.handlers["error"](SimpleNamespace(source=object(), error=RuntimeError("STT down")))
        ctx.room.handlers["participant_disconnected"](ctx.caller)

    _fake_agent_session(monkeypatch, on_start=on_start)

    asyncio.run(run_session(ctx, _claims(), _settings()))

    events = _payloads(ctx)
    [state] = _of_type(events, "session.state")
    assert state["state"] == "listening"
    assert state["previousState"] == "idle"
    [transcript] = _of_type(events, "transcript.final")
    assert transcript["role"] == "user"
    assert transcript["text"] == "hello there"
    [error] = _of_type(events, "error")
    assert error["code"] == ERROR_CODE_UPSTREAM
    assert error["message"] == "STT down"
    assert _of_type(events, "session.closed")[0]["code"] == WS_CLOSE_NORMAL
    assert voice_persistence.lifecycles[0].failed is True
    assert ctx.deleted_rooms == 1


def test_join_failure_marks_the_conversation_failed_and_deletes_the_room(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()

    async def connect(**_kwargs) -> None:
        raise RuntimeError("token rejected")

    ctx.connect = connect

    with pytest.raises(RuntimeError, match="token rejected"):
        asyncio.run(run_session(ctx, _claims(), _settings()))

    events = _payloads(ctx)
    [error] = _of_type(events, "error")
    assert error["code"] == ERROR_CODE_UPSTREAM
    [closed] = _of_type(events, "session.closed")
    assert closed["reason"] == "error"
    assert closed["code"] == WS_CLOSE_UPSTREAM_FAILURE
    [lifecycle] = voice_persistence.lifecycles
    assert lifecycle.calls == 1
    assert lifecycle.failed is True
    assert ctx.deleted_rooms == 1


def test_other_participants_leaving_does_not_end_the_call(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()

    def on_start(_session) -> None:
        ctx.room.handlers["participant_disconnected"](
            SimpleNamespace(identity="someone-else")
        )
        assert not _of_type(_payloads(ctx), "session.closed")
        ctx.room.handlers["participant_disconnected"](ctx.caller)

    _fake_agent_session(monkeypatch, on_start=on_start)

    asyncio.run(run_session(ctx, _claims(), _settings(firstSpeaker="human")))

    [closed] = _of_type(_payloads(ctx), "session.closed")
    assert closed["reason"] == "participant_disconnected"
    assert ctx.shutdowns == []
    assert voice_persistence.lifecycles[0].failed is False
    assert ctx.deleted_rooms == 1


def test_session_failure_closes_with_the_upstream_failure_code(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()
    fake_session = _fake_agent_session(
        monkeypatch,
        start_error=RuntimeError("room failure"),
    )

    asyncio.run(run_session(ctx, _claims(), _settings()))

    [session] = fake_session.instances
    assert session.closed is True
    [closed] = _of_type(_payloads(ctx), "session.closed")
    assert closed["reason"] == "error"
    assert closed["code"] == WS_CLOSE_UPSTREAM_FAILURE
    [lifecycle] = voice_persistence.lifecycles
    assert lifecycle.calls == 1
    assert lifecycle.failed is True
    assert ctx.deleted_rooms == 1


def test_repeated_disconnect_and_error_callbacks_close_and_persist_once(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()

    def on_start(session) -> None:
        ctx.room.handlers["participant_disconnected"](ctx.caller)
        ctx.room.handlers["participant_disconnected"](ctx.caller)
        session.handlers["error"](
            SimpleNamespace(source=object(), error=RuntimeError("provider down"))
        )
        session.handlers["error"](
            SimpleNamespace(source=object(), error=RuntimeError("provider down"))
        )
        session.handlers["close"](
            SimpleNamespace(reason="job_shutdown", error=None)
        )

    _fake_agent_session(monkeypatch, on_start=on_start)

    asyncio.run(run_session(ctx, _claims(), _settings(firstSpeaker="human")))

    events = _payloads(ctx)
    assert len(_of_type(events, "session.closed")) == 1
    assert _of_type(events, "session.closed")[0]["reason"] == "participant_disconnected"
    [lifecycle] = voice_persistence.lifecycles
    assert lifecycle.calls == 1
    assert lifecycle.failed is True
    assert ctx.deleted_rooms == 1


# ---------------------------------------------------------------------------
# Adapter turn lifecycle
# ---------------------------------------------------------------------------


def _chat_context(*messages: tuple[str, str]) -> llm.ChatContext:
    context = llm.ChatContext.empty()
    for role, content in messages:
        context.add_message(role=role, content=content)
    return context


class _RecordingBridge:
    def __init__(self, replies: dict[str, list[str]]) -> None:
        self.replies = replies
        self.transcripts: list[str] = []

    async def stream_turn(self, transcript: str):
        self.transcripts.append(transcript)
        for text in self.replies[transcript]:
            yield VoiceTurnFrame(kind="delta", text=text)
        yield VoiceTurnFrame(kind="done")


def test_two_turns_use_the_latest_utterance_and_the_engine_history_stays_out():
    published: list[dict] = []
    events = VoiceSessionEvents("conversation-1", publish=published.append)
    bridge = _RecordingBridge(
        {
            "first question": ["First ", "answer."],
            "second question": ["Second answer."],
        }
    )
    adapter = VoiceEngineLLM(bridge=bridge, model="m", provider="p", events=events)
    chat_ctx = _chat_context(("user", "old question"), ("assistant", "old answer"))

    async def run() -> tuple[list[str], list[str]]:
        chat_ctx.add_message(role="user", content="first question")
        first = [chunk.delta.content async for chunk in adapter.chat(chat_ctx=chat_ctx)]
        chat_ctx.add_message(role="assistant", content="First answer.")
        chat_ctx.add_message(role="user", content="second question")
        second = [chunk.delta.content async for chunk in adapter.chat(chat_ctx=chat_ctx)]
        await events.aclose()
        return first, second

    first, second = asyncio.run(run())

    assert bridge.transcripts == ["first question", "second question"]
    assert first == ["First ", "answer."]
    assert second == ["Second answer."]
    finals = [
        event
        for event in _of_type(published, "transcript.final")
        if event["role"] == "assistant"
    ]
    assert [event["text"] for event in finals] == ["First answer.", "Second answer."]
    assert [event["turnId"] for event in finals] == [1, 2]
    turn_timings = [
        event for event in _of_type(published, "timing") if event["stage"] == "turn"
    ]
    assert [event["interrupted"] for event in turn_timings] == [False, False]


def test_barge_in_cancels_the_turn_and_the_next_turn_starts_clean():
    published: list[dict] = []
    events = VoiceSessionEvents("conversation-1", publish=published.append)
    blocked = asyncio.Event()
    cancelled = asyncio.Event()

    class _BargeInBridge:
        def __init__(self) -> None:
            self.calls = 0

        async def stream_turn(self, transcript: str):
            self.calls += 1
            if self.calls == 1:
                try:
                    yield VoiceTurnFrame(kind="delta", text="Half an ans")
                    blocked.set()
                    await asyncio.sleep(30)
                except asyncio.CancelledError:
                    cancelled.set()
                    raise
            else:
                yield VoiceTurnFrame(kind="delta", text="Full answer.")
            yield VoiceTurnFrame(kind="done")

    bridge = _BargeInBridge()
    adapter = VoiceEngineLLM(bridge=bridge, model="m", provider="p", events=events)
    chat_ctx = _chat_context(("user", "first question"))

    async def run():
        stream = adapter.chat(chat_ctx=chat_ctx)
        first_chunk = await stream.__anext__()
        await asyncio.wait_for(blocked.wait(), timeout=2)
        await stream.aclose()
        chat_ctx.add_message(role="user", content="second question")
        second = [chunk async for chunk in adapter.chat(chat_ctx=chat_ctx)]
        await events.aclose()
        return first_chunk, second

    first_chunk, second = asyncio.run(run())

    assert first_chunk.delta.content == "Half an ans"
    assert second[0].delta.content == "Full answer."
    assert cancelled.is_set()
    finals = [
        event
        for event in _of_type(published, "transcript.final")
        if event["role"] == "assistant"
    ]
    assert [(event["turnId"], event["text"]) for event in finals] == [(2, "Full answer.")]
    turn_timings = [
        event for event in _of_type(published, "timing") if event["stage"] == "turn"
    ]
    assert [event["interrupted"] for event in turn_timings] == [True, False]


def test_engine_tool_and_error_frames_are_reported_once_per_turn():
    published: list[dict] = []
    events = VoiceSessionEvents("conversation-1", publish=published.append)
    livekit_tool_runs: list[str] = []

    class _FramesBridge:
        def __init__(self) -> None:
            self.calls = 0

        async def stream_turn(self, transcript: str):
            self.calls += 1
            yield VoiceTurnFrame(kind="tool_call", payload={"name": "demo_lookup"})
            yield VoiceTurnFrame(
                kind="error",
                text="The chat engine could not complete this turn.",
            )
            yield VoiceTurnFrame(kind="delta", text="Sorry, I could not finish that answer.")
            yield VoiceTurnFrame(kind="done")

    class _LiveKitTool:
        async def __call__(self) -> None:
            livekit_tool_runs.append("executed")

    bridge = _FramesBridge()
    adapter = VoiceEngineLLM(bridge=bridge, model="m", provider="p", events=events)

    async def run():
        chat_ctx = _chat_context(("user", "do the thing"))
        chunks = [
            chunk
            async for chunk in adapter.chat(chat_ctx=chat_ctx, tools=[_LiveKitTool()])
        ]
        await events.aclose()
        return chunks

    chunks = asyncio.run(run())

    assert bridge.calls == 1
    assert livekit_tool_runs == []
    assert [chunk.delta.content for chunk in chunks] == [
        "Sorry, I could not finish that answer."
    ]
    [tool_event] = _of_type(published, "tool.call")
    assert tool_event["tool"] == {"name": "demo_lookup"}
    assert tool_event["turnId"] == 1
    [error] = _of_type(published, "error")
    assert error["code"] == ERROR_CODE_UPSTREAM
    assert error["message"] == "The chat engine could not complete this turn."
    [final] = [
        event
        for event in _of_type(published, "transcript.final")
        if event["role"] == "assistant"
    ]
    assert final["text"] == "Sorry, I could not finish that answer."


# ---------------------------------------------------------------------------
# Spoken-style prompt
# ---------------------------------------------------------------------------


def test_spoken_style_guidance_is_added_once_and_forbids_markdown():
    settings = _settings()

    request = build_voice_llm_request(_claims(), settings, "hello")
    prompt = request.voice_system_prompt

    assert prompt == f"Goal:\nHelp the caller.\n\n{SPOKEN_STYLE_GUIDANCE}"
    assert prompt.count(SPOKEN_STYLE_GUIDANCE) == 1
    assert "Do not use Markdown" in prompt

    already_composed = _settings(
        persona={"systemPrompt": f"Goal:\nHelp the caller.\n\n{SPOKEN_STYLE_GUIDANCE}"}
    )
    request = build_voice_llm_request(_claims(), already_composed, "hello")
    assert request.voice_system_prompt.count(SPOKEN_STYLE_GUIDANCE) == 1

    guidance_only = _settings(persona={"systemPrompt": ""})
    request = build_voice_llm_request(_claims(), guidance_only, "hello")
    assert request.voice_system_prompt == SPOKEN_STYLE_GUIDANCE
