"""Realtime voice adapter and runtime tests for #373 (Phase 5, slice 2).

The LiveKit provider plugins and the AgentSession are faked, so these tests
cover the provider factory, its rejection paths, the realtime greeting, and the
published event contract without a provider key, database, or room.

Run from ``apis/llmpipeline``:

    python -m pytest tests/test_voice_realtime.py -q
"""

from __future__ import annotations

import asyncio
import json
from types import SimpleNamespace

import pytest
from livekit.agents import llm

import voice_agent.realtime_adapters as realtime_adapters
from voice_agent import session_runtime
from voice_agent.contracts import (
    ERROR_CODE_CREDENTIALS_UNAVAILABLE,
    ERROR_CODE_INVALID_CONFIG,
    ERROR_CODE_UNSUPPORTED_PROVIDER,
    ERROR_CODE_UPSTREAM,
    WS_CLOSE_BAD_CONFIG,
    WS_CLOSE_FORBIDDEN,
    WS_CLOSE_NORMAL,
    WS_CLOSE_UPSTREAM_FAILURE,
)
from voice_agent.metadata import VoiceJobClaims
from voice_agent.realtime_adapters import (
    RealtimeConfigurationError,
    build_realtime_model,
    normalize_realtime_provider,
)
from voice_agent.session_runtime import run_session
from voice_agent.tool_bridge import KNOWLEDGE_SYSTEM_INSTRUCTION
from .voice_test_helpers import FLOW_ID, TENANT_ID, USER_ID, voice_claims

SPOKEN_STYLE_GUIDANCE = (
    "Use short sentences and plain spoken language. Do not use Markdown, "
    "bullet points, numbered lists, or other formatting."
)

USER = SimpleNamespace(user_id=USER_ID, tenant_id=TENANT_ID)


def _claims(*, mode: str = "test") -> VoiceJobClaims:
    return voice_claims(mode=mode)


def _realtime_settings(**overrides) -> dict:
    settings = {
        "agentName": "Support Agent",
        "engineMode": "realtime",
        "firstSpeaker": "ai",
        "introduction": "Hi Alice from Acme.",
        "realtime": {
            "provider": "openai",
            "model": "gpt-realtime",
            "isByokEnabled": True,
            "credentialName": "voice-key",
        },
        "ttsVoice": {"language": "en-US", "voice": "Alloy", "speed": 1.1},
        "persona": {"systemPrompt": "Goal:\nHelp the caller."},
        "spokenStyleGuidance": SPOKEN_STYLE_GUIDANCE,
        "tools": [],
        "knowledgeBase": {"names": []},
        "skills": [],
        "memory": {},
    }
    settings.update(overrides)
    return settings


# ---------------------------------------------------------------------------
# Provider factory
# ---------------------------------------------------------------------------


class _FakeRealtimeModel:
    instances: list["_FakeRealtimeModel"] = []

    def __init__(self, **options) -> None:
        self.options = options
        self.azure = False
        _FakeRealtimeModel.instances.append(self)

    @classmethod
    def with_azure(cls, **options) -> "_FakeRealtimeModel":
        instance = cls(**options)
        instance.azure = True
        return instance


@pytest.fixture(autouse=True)
def fake_plugins(monkeypatch):
    _FakeRealtimeModel.instances = []
    monkeypatch.setattr(
        realtime_adapters.openai.realtime, "RealtimeModel", _FakeRealtimeModel
    )
    monkeypatch.setattr(
        realtime_adapters.google.beta.realtime, "RealtimeModel", _FakeRealtimeModel
    )
    return _FakeRealtimeModel.instances


def _resolver(monkeypatch, **credentials):
    calls: list[tuple] = []

    def resolve(provider, is_byok, credential_name, user):
        calls.append((provider, is_byok, credential_name, user))
        return realtime_adapters.CredentialResolution(
            kwargs=credentials,
            uses_platform_credentials=False,
            credential_name=credential_name,
        )

    monkeypatch.setattr(realtime_adapters, "resolve_credentials", resolve)
    return calls


def _model(**overrides) -> SimpleNamespace:
    return SimpleNamespace(**overrides)


def test_openai_realtime_model_uses_the_resolved_credentials(monkeypatch, fake_plugins):
    calls = _resolver(
        monkeypatch, api_key="sk-voice", api_base="https://proxy.example/v1"
    )

    model = build_realtime_model(_realtime_settings(), USER)

    [built] = fake_plugins
    assert built.options == {
        "model": "gpt-realtime",
        "api_key": "sk-voice",
        "base_url": "https://proxy.example/v1",
        "voice": "Alloy",
        "speed": 1.1,
    }
    assert calls == [("openai", True, "voice-key", USER)]
    assert model is built


def test_azure_realtime_model_uses_the_deployment_and_legacy_version(
    monkeypatch, fake_plugins
):
    _resolver(
        monkeypatch,
        api_key="azure-key",
        api_base="https://contoso.openai.azure.com",
        api_version="2024-10-01-preview",
    )
    settings = _realtime_settings(
        realtime={
            "provider": "azure",
            "model": "gpt-realtime",
            "isByokEnabled": True,
            "credentialName": "azure-key",
        }
    )

    build_realtime_model(settings, USER)

    [built] = fake_plugins
    assert built.azure is True
    assert built.options == {
        "azure_deployment": "gpt-realtime",
        "api_key": "azure-key",
        "base_url": "https://contoso.openai.azure.com",
        "voice": "Alloy",
        "speed": 1.1,
        "api_version": "2024-10-01-preview",
    }


def test_gemini_alias_builds_the_google_plugin(monkeypatch, fake_plugins):
    calls = _resolver(monkeypatch, api_key="google-key")
    settings = _realtime_settings(
        realtime={
            "provider": "googlegemini",
            "model": "gemini-live-2.5-flash-native-audio",
            "isByokEnabled": True,
            "credentialName": "google-key",
        }
    )

    build_realtime_model(settings, USER)

    [built] = fake_plugins
    assert built.options == {
        "model": "gemini-live-2.5-flash-native-audio",
        "api_key": "google-key",
        "api_version": "v1beta",
        "voice": "Alloy",
        "language": "en-US",
    }
    assert calls[0][0] == "gemini"


def test_gemini_voice_is_capitalized_for_the_live_api(monkeypatch, fake_plugins):
    _resolver(monkeypatch, api_key="google-key")
    settings = _realtime_settings(
        realtime={
            "provider": "googlegemini",
            "model": "gemini/gemini-3.1-flash-live-preview",
            "isByokEnabled": True,
            "credentialName": "google-key",
        },
        ttsVoice={"language": "en", "voice": "journey", "speed": 1},
    )

    build_realtime_model(settings, USER)

    [built] = fake_plugins
    assert built.options["voice"] == "Journey"


@pytest.mark.parametrize(
    ("provider", "stored", "expected"),
    [
        ("openai", "openai/gpt-realtime", "gpt-realtime"),
        (
            "googlegemini",
            "gemini/gemini-3.1-flash-live-preview",
            "gemini-3.1-flash-live-preview",
        ),
        ("openai", "gpt-realtime", "gpt-realtime"),
        ("openai", "custom/gpt-realtime", "custom/gpt-realtime"),
    ],
)
def test_litellm_model_prefixes_are_stripped_for_the_provider_plugin(
    monkeypatch, fake_plugins, provider, stored, expected
):
    _resolver(monkeypatch, api_key="provider-key")
    settings = _realtime_settings(
        realtime={
            "provider": provider,
            "model": stored,
            "isByokEnabled": True,
            "credentialName": "provider-key",
        }
    )

    build_realtime_model(settings, USER)

    [built] = fake_plugins
    assert built.options["model"] == expected


def test_unknown_provider_is_rejected_before_any_credential_or_plugin(
    monkeypatch, fake_plugins
):
    calls = _resolver(monkeypatch, api_key="unused")
    settings = _realtime_settings(
        realtime={"provider": "xai", "model": "grok-voice-latest"}
    )

    with pytest.raises(RealtimeConfigurationError) as rejected:
        build_realtime_model(settings, USER)

    assert rejected.value.code == ERROR_CODE_UNSUPPORTED_PROVIDER
    assert calls == []
    assert fake_plugins == []


def test_missing_model_is_rejected_as_invalid_config(monkeypatch, fake_plugins):
    calls = _resolver(monkeypatch, api_key="unused")
    settings = _realtime_settings(
        realtime={"provider": "openai", "model": "", "isByokEnabled": True,
                  "credentialName": "voice-key"}
    )

    with pytest.raises(RealtimeConfigurationError) as rejected:
        build_realtime_model(settings, USER)

    assert rejected.value.code == ERROR_CODE_INVALID_CONFIG
    assert calls == []


def test_missing_byok_credential_is_rejected_as_credentials_unavailable(
    monkeypatch, fake_plugins
):
    calls = _resolver(monkeypatch, api_key="unused")
    settings = _realtime_settings(
        realtime={"provider": "openai", "model": "gpt-realtime",
                  "isByokEnabled": True, "credentialName": None}
    )

    with pytest.raises(RealtimeConfigurationError) as rejected:
        build_realtime_model(settings, USER)

    assert rejected.value.code == ERROR_CODE_CREDENTIALS_UNAVAILABLE
    assert calls == []


def test_unresolvable_credential_is_rejected_as_credentials_unavailable(
    monkeypatch, fake_plugins
):
    def resolve(*_args):
        raise RuntimeError("vault unavailable")

    monkeypatch.setattr(realtime_adapters, "resolve_credentials", resolve)

    with pytest.raises(RealtimeConfigurationError) as rejected:
        build_realtime_model(_realtime_settings(), USER)

    assert rejected.value.code == ERROR_CODE_CREDENTIALS_UNAVAILABLE
    assert fake_plugins == []


def test_azure_without_an_endpoint_is_rejected(monkeypatch, fake_plugins):
    _resolver(monkeypatch, api_key="azure-key")
    settings = _realtime_settings(
        realtime={"provider": "azure", "model": "gpt-realtime",
                  "isByokEnabled": True, "credentialName": "azure-key"}
    )

    with pytest.raises(RealtimeConfigurationError) as rejected:
        build_realtime_model(settings, USER)

    assert rejected.value.code == ERROR_CODE_CREDENTIALS_UNAVAILABLE
    assert fake_plugins == []


@pytest.mark.parametrize(
    ("stored", "expected"),
    [
        ("openai", "openai"),
        ("OpenAI", "openai"),
        ("azure", "azure"),
        ("gemini", "gemini"),
        ("googlegemini", "gemini"),
        ("google_gemini", "gemini"),
        ("google", "gemini"),
        ("googleai", "gemini"),
        ("xai", ""),
        ("ultravox", ""),
        (None, ""),
    ],
)
def test_provider_normalization_matches_the_publish_allowlist(stored, expected):
    assert normalize_realtime_provider(stored) == expected


# ---------------------------------------------------------------------------
# Fake room, job context, and persistence
# ---------------------------------------------------------------------------


class _FakeLocalParticipant:
    def __init__(self) -> None:
        self.published: list[dict] = []

    async def publish_data(self, data: bytes, *, reliable=True, topic=None, **_kwargs):
        self.published.append(
            {
                "payload": json.loads(data.decode("utf-8")),
                "reliable": reliable,
                "topic": topic,
            }
        )


class _FakeRoom:
    def __init__(self) -> None:
        self.name = "voice-room"
        self.handlers: dict[str, object] = {}
        self.local_participant = _FakeLocalParticipant()

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


class _FakeTranscriptWriter:
    instances: list["_FakeTranscriptWriter"] = []

    def __init__(self, claims: VoiceJobClaims, agent_settings: dict) -> None:
        self.claims = claims
        self.agent_settings = agent_settings
        self.items: list[tuple[str, str, str | None, dict | None]] = []
        self.started = False
        self.closed = False
        self.instances.append(self)

    def start(self) -> None:
        self.started = True

    def add(self, role, text, message_id=None, timing=None) -> None:
        self.items.append((role, text, message_id, timing))

    async def aclose(self) -> None:
        self.closed = True


class _FakeUsageRecorder:
    instances: list["_FakeUsageRecorder"] = []

    def __init__(self, claims: VoiceJobClaims, agent_settings: dict) -> None:
        self.claims = claims
        self.agent_settings = agent_settings
        self.metrics: list[object] = []
        self.flushes = 0
        self.timing: dict | None = None
        self.instances.append(self)

    def on_metrics_collected(self, event) -> None:
        self.metrics.append(event)

    def take_response_timing(self) -> dict | None:
        timing = self.timing
        self.timing = None
        return timing

    async def flush(self) -> None:
        self.flushes += 1


@pytest.fixture(autouse=True)
def voice_persistence(monkeypatch):
    _FakeTurnTimingRecorder.instances = []
    _FakeConversationLifecycle.instances = []
    _FakeTranscriptWriter.instances = []
    _FakeUsageRecorder.instances = []
    monkeypatch.setattr(
        session_runtime, "VoiceTurnTimingRecorder", _FakeTurnTimingRecorder
    )
    monkeypatch.setattr(
        session_runtime, "VoiceConversationLifecycle", _FakeConversationLifecycle
    )
    monkeypatch.setattr(
        session_runtime, "VoiceRealtimeTranscriptWriter", _FakeTranscriptWriter
    )
    monkeypatch.setattr(session_runtime, "RealtimeUsageRecorder", _FakeUsageRecorder)
    return SimpleNamespace(
        recorders=_FakeTurnTimingRecorder.instances,
        lifecycles=_FakeConversationLifecycle.instances,
        writers=_FakeTranscriptWriter.instances,
        usage=_FakeUsageRecorder.instances,
    )


def _fake_agent_session(monkeypatch, *, on_start=None, start_error=None):
    class FakeAgentSession:
        instances: list = []

        def __init__(self, **options) -> None:
            self.options = options
            self.handlers: dict[str, object] = {}
            self.calls: list[str] = []
            self.said: list[tuple[str, bool]] = []
            self.replies: list[str] = []
            self.started: dict | None = None
            self.closed = False
            FakeAgentSession.instances.append(self)

        def on(self, event: str, callback) -> None:
            self.handlers[event] = callback

        def say(self, text: str, *, add_to_chat_ctx: bool = True) -> None:
            self.said.append((text, add_to_chat_ctx))
            self.calls.append("say")

        def generate_reply(self, *, instructions: str = "") -> None:
            self.replies.append(instructions)
            self.calls.append("generate_reply")

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


def _realtime_model(monkeypatch, model=None):
    sentinel = model or _model()
    monkeypatch.setattr(session_runtime, "build_realtime_model", lambda *_: sentinel)
    return sentinel


# ---------------------------------------------------------------------------
# Realtime runtime
# ---------------------------------------------------------------------------


def test_realtime_session_greets_with_generate_reply(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()
    fake_session = _fake_agent_session(monkeypatch, on_start=_disconnect_on_start(ctx))
    model = _realtime_model(monkeypatch)

    asyncio.run(run_session(ctx, _claims(), _realtime_settings()))

    [session] = fake_session.instances
    assert session.calls == ["start", "generate_reply", "aclose"]
    assert session.said == []
    [reply] = session.replies
    assert reply.endswith("\n\nHi Alice from Acme.")
    assert "exactly as written" in reply
    assert "do not add a greeting" in reply
    assert session.options == {"llm": model}
    assert session.started["room"] is ctx.room
    assert session.started["room_options"].participant_identity == ctx.caller.identity
    assert session.started["room_options"].audio_output is True

    instructions = session.started["agent"].instructions
    assert "Goal:\nHelp the caller." in instructions
    assert SPOKEN_STYLE_GUIDANCE in instructions

    assert ctx.connected == [{"auto_subscribe": session_runtime.AutoSubscribe.AUDIO_ONLY}]
    assert ctx.deleted_rooms == 1
    [lifecycle] = voice_persistence.lifecycles
    assert lifecycle.failed is False
    assert voice_persistence.recorders[0].turns == []

    events = _payloads(ctx)
    [closed] = _of_type(events, "session.closed")
    assert closed["reason"] == "participant_disconnected"
    assert closed["code"] == WS_CLOSE_NORMAL
    assert events[-1] is closed


def test_realtime_session_without_an_introduction_stays_silent(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()
    fake_session = _fake_agent_session(monkeypatch, on_start=_disconnect_on_start(ctx))
    _realtime_model(monkeypatch)

    asyncio.run(
        run_session(ctx, _claims(), _realtime_settings(firstSpeaker="human"))
    )

    [session] = fake_session.instances
    assert session.replies == []
    assert session.calls == ["start", "aclose"]


def test_realtime_knowledge_search_adds_tools_and_prompt_line(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()
    fake_session = _fake_agent_session(monkeypatch, on_start=_disconnect_on_start(ctx))
    _realtime_model(monkeypatch)

    class FakeToolBridge:
        def __init__(self, claims, agent_settings, events) -> None:
            self.has_knowledge_search = True
            self.built = ["search-tool"]

        async def build(self):
            return self.built

    monkeypatch.setattr(session_runtime, "RealtimeToolBridge", FakeToolBridge)

    asyncio.run(
        run_session(
            ctx,
            _claims(),
            _realtime_settings(knowledgeBase={"names": ["kb-one"]}),
        )
    )

    [session] = fake_session.instances
    assert session.started["agent"].tools == ["search-tool"]
    assert KNOWLEDGE_SYSTEM_INSTRUCTION in session.started["agent"].instructions


def test_realtime_transcripts_come_from_provider_events(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()

    def on_start(session) -> None:
        session.handlers["user_input_transcribed"](
            SimpleNamespace(is_final=False, transcript="hel")
        )
        session.handlers["user_input_transcribed"](
            SimpleNamespace(is_final=True, transcript="  hello there  ")
        )
        session.handlers["conversation_item_added"](
            SimpleNamespace(item=llm.ChatMessage(role="user", content=["hello there"]))
        )
        session.handlers["conversation_item_added"](
            SimpleNamespace(
                item=llm.ChatMessage(role="assistant", content=["Hi there."])
            )
        )
        session.handlers["conversation_item_added"](
            SimpleNamespace(
                item=llm.ChatMessage(role="assistant", content=["   "])
            )
        )
        ctx.room.handlers["participant_disconnected"](ctx.caller)

    _fake_agent_session(monkeypatch, on_start=on_start)
    _realtime_model(monkeypatch)

    asyncio.run(run_session(ctx, _claims(), _realtime_settings()))

    transcripts = _of_type(_payloads(ctx), "transcript.final")
    assert [(event["role"], event["text"]) for event in transcripts] == [
        ("user", "hello there"),
        ("assistant", "Hi there."),
    ]


def test_realtime_configuration_error_closes_before_connecting(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()
    fake_session = _fake_agent_session(monkeypatch)

    def reject(*_args):
        raise RealtimeConfigurationError(
            "Realtime voice provider 'xai' is not supported.",
            code=ERROR_CODE_UNSUPPORTED_PROVIDER,
        )

    monkeypatch.setattr(session_runtime, "build_realtime_model", reject)

    asyncio.run(
        run_session(
            ctx,
            _claims(),
            _realtime_settings(realtime={"provider": "xai", "model": "grok-voice"}),
        )
    )

    assert fake_session.instances == []
    assert ctx.connected == []
    assert len(ctx.shutdowns) == 1
    assert ctx.deleted_rooms == 1
    [lifecycle] = voice_persistence.lifecycles
    assert lifecycle.calls == 1
    assert lifecycle.failed is True

    events = _payloads(ctx)
    [error] = _of_type(events, "error")
    assert error["code"] == ERROR_CODE_UNSUPPORTED_PROVIDER
    [closed] = _of_type(events, "session.closed")
    assert closed["reason"] == "error"
    assert closed["code"] == WS_CLOSE_BAD_CONFIG
    assert events[-1] is closed


def test_realtime_missing_credential_closes_with_the_forbidden_code(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()
    fake_session = _fake_agent_session(monkeypatch)

    def reject(*_args):
        raise RealtimeConfigurationError(
            "Realtime voice requires a BYOK credential.",
            code=ERROR_CODE_CREDENTIALS_UNAVAILABLE,
        )

    monkeypatch.setattr(session_runtime, "build_realtime_model", reject)

    asyncio.run(run_session(ctx, _claims(), _realtime_settings()))

    assert fake_session.instances == []
    [error] = _of_type(_payloads(ctx), "error")
    assert error["code"] == ERROR_CODE_CREDENTIALS_UNAVAILABLE
    [closed] = _of_type(_payloads(ctx), "session.closed")
    assert closed["code"] == WS_CLOSE_FORBIDDEN


def test_realtime_start_failure_closes_with_the_upstream_code(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()
    fake_session = _fake_agent_session(
        monkeypatch, start_error=RuntimeError("provider handshake failed")
    )
    _realtime_model(monkeypatch)

    asyncio.run(run_session(ctx, _claims(), _realtime_settings()))

    [session] = fake_session.instances
    assert session.closed is True
    [closed] = _of_type(_payloads(ctx), "session.closed")
    assert closed["reason"] == "error"
    assert closed["code"] == WS_CLOSE_UPSTREAM_FAILURE
    [lifecycle] = voice_persistence.lifecycles
    assert lifecycle.failed is True
    assert ctx.deleted_rooms == 1


def test_realtime_provider_error_marks_the_call_failed(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()

    def on_start(session) -> None:
        session.handlers["error"](
            SimpleNamespace(source=object(), error=RuntimeError("provider down"))
        )
        ctx.room.handlers["participant_disconnected"](ctx.caller)

    _fake_agent_session(monkeypatch, on_start=on_start)
    _realtime_model(monkeypatch)

    asyncio.run(run_session(ctx, _claims(), _realtime_settings()))

    [error] = _of_type(_payloads(ctx), "error")
    assert error["code"] == ERROR_CODE_UPSTREAM
    [lifecycle] = voice_persistence.lifecycles
    assert lifecycle.failed is True


# ---------------------------------------------------------------------------
# Live production behaviour (slice 3)
# ---------------------------------------------------------------------------


def _history_loader(monkeypatch, chat_ctx=None):
    calls: list[str] = []

    async def load(claims, _agent_settings):
        calls.append(claims.conversation_id)
        return chat_ctx

    monkeypatch.setattr(session_runtime, "load_realtime_chat_context", load)
    return calls


def test_test_mode_realtime_persists_nothing_and_loads_no_history(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()
    _fake_agent_session(monkeypatch, on_start=_disconnect_on_start(ctx))
    _realtime_model(monkeypatch)
    history_calls = _history_loader(monkeypatch)

    asyncio.run(run_session(ctx, _claims(), _realtime_settings()))

    assert history_calls == []
    assert voice_persistence.writers == []
    [usage] = voice_persistence.usage
    assert usage.flushes == 1


def test_live_realtime_persists_finalized_items_in_spoken_order(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()

    def on_start(session) -> None:
        session.handlers["user_input_transcribed"](
            SimpleNamespace(is_final=True, transcript="hello there")
        )
        session.handlers["conversation_item_added"](
            SimpleNamespace(
                item=llm.ChatMessage(
                    role="user", content=["hello there"], id="user-1"
                )
            )
        )
        _FakeUsageRecorder.instances[0].timing = {
            "ttft_ms": 250,
            "duration_ms": 900,
        }
        session.handlers["conversation_item_added"](
            SimpleNamespace(
                item=llm.ChatMessage(role="assistant", content=["Hi."], id="agent-1")
            )
        )
        ctx.room.handlers["participant_disconnected"](ctx.caller)

    _fake_agent_session(monkeypatch, on_start=on_start)
    _realtime_model(monkeypatch)
    _history_loader(monkeypatch)

    asyncio.run(run_session(ctx, _claims(mode="live"), _realtime_settings()))

    [writer] = voice_persistence.writers
    assert writer.started is True
    assert writer.closed is True
    assert [(role, text, message_id) for role, text, message_id, _ in writer.items] == [
        ("user", "hello there", "user-1"),
        ("assistant", "Hi.", "agent-1"),
    ]
    assert writer.items[0][3] is None
    assert writer.items[1][3] == {
        "stt_ms": None,
        "llm_first_token_ms": None,
        "tts_first_audio_ms": None,
        "turn_total_ms": None,
        "endpointing_ms": None,
        "caller_to_speaking_ms": None,
        "ttft_ms": 250,
        "duration_ms": 900,
    }

    turn_timing = [event for event in _of_type(_payloads(ctx), "timing") if event["stage"] == "turn"]
    [timing] = turn_timing
    assert timing["voice_turn_timing"] == writer.items[1][3]

    [lifecycle] = voice_persistence.lifecycles
    assert lifecycle.failed is False


def test_live_realtime_seeds_the_agent_with_persisted_history(
    monkeypatch, voice_persistence
):
    ctx = _FakeJobContext()
    _fake_agent_session(monkeypatch, on_start=_disconnect_on_start(ctx))
    _realtime_model(monkeypatch)
    seeded = llm.ChatContext(
        items=[llm.ChatMessage(role="user", content=["earlier question"])]
    )
    history_calls = _history_loader(monkeypatch, seeded)
    claims = _claims(mode="live")

    asyncio.run(run_session(ctx, claims, _realtime_settings()))

    [session] = session_runtime.AgentSession.instances
    assert [
        (item.role, item.text_content)
        for item in session.started["agent"].chat_ctx.items
    ] == [("user", "earlier question")]
    assert history_calls == [claims.conversation_id]


def test_realtime_metrics_reach_the_usage_recorder(monkeypatch, voice_persistence):
    ctx = _FakeJobContext()
    collected = SimpleNamespace(label="realtime")

    def on_start(session) -> None:
        session.handlers["metrics_collected"](collected)
        ctx.room.handlers["participant_disconnected"](ctx.caller)

    _fake_agent_session(monkeypatch, on_start=on_start)
    _realtime_model(monkeypatch)
    _history_loader(monkeypatch)

    asyncio.run(run_session(ctx, _claims(mode="live"), _realtime_settings()))

    [usage] = voice_persistence.usage
    assert usage.metrics == [collected]
    assert usage.flushes >= 1
