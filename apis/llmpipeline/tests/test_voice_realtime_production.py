"""Realtime persistence, memory seeding, and BYOK metering tests (#373 slice 3).

Run from ``apis/llmpipeline``:

    python -m pytest tests/test_voice_realtime_production.py -q
"""

from __future__ import annotations

import asyncio
from types import SimpleNamespace

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from livekit.agents import llm, metrics

from voice_agent import chat_bridge, persistence, usage
from voice_agent.metadata import VoiceJobClaims
from voice_agent.persistence import VoiceRealtimeTranscriptWriter
from voice_agent.usage import RealtimeUsageRecorder
from .voice_test_helpers import FLOW_ID, voice_claims

TIMING = {
    "stt_ms": None,
    "llm_first_token_ms": None,
    "tts_first_audio_ms": None,
    "turn_total_ms": None,
    "ttft_ms": 420,
    "duration_ms": 1500,
}


def _claims(*, mode: str = "live") -> VoiceJobClaims:
    return voice_claims(mode=mode)


def _settings(**realtime) -> dict:
    settings = {
        "agentName": "Support Agent",
        "engineMode": "realtime",
        "realtime": {
            "provider": "openai",
            "model": "gpt-realtime",
            "isByokEnabled": True,
            "credentialName": "voice-key",
        },
        "persona": {"systemPrompt": "Help the caller."},
        "spokenStyleGuidance": "",
        "tools": [],
        "knowledgeBase": {"names": []},
        "skills": [],
        "memory": {"maxShortTermTurns": 2},
    }
    settings["realtime"].update(realtime)
    return settings


def _realtime_metrics(
    *,
    input_audio: int,
    output_audio: int,
    ttft: float = 0.42,
    duration: float = 1.5,
    session_duration: float = 0.0,
) -> metrics.RealtimeModelMetrics:
    return metrics.RealtimeModelMetrics(
        request_id="response-1",
        timestamp=1.0,
        ttft=ttft,
        duration=duration,
        session_duration=session_duration,
        input_tokens=input_audio,
        output_tokens=output_audio,
        input_token_details=metrics.RealtimeModelMetrics.InputTokenDetails(
            audio_tokens=input_audio
        ),
        output_token_details=metrics.RealtimeModelMetrics.OutputTokenDetails(
            audio_tokens=output_audio
        ),
    )


# ---------------------------------------------------------------------------
# BYOK usage
# ---------------------------------------------------------------------------


class _FakeByokManager:
    instances: list["_FakeByokManager"] = []

    def __init__(self, **_kwargs) -> None:
        self.calls: list[dict] = []
        _FakeByokManager.instances.append(self)

    def post_byok_usage(self, *, task: str, request: list[dict], jwt: str) -> None:
        self.calls.append({"task": task, "request": request, "jwt": jwt})


class _FailingByokManager:
    def __init__(self, **_kwargs) -> None:
        pass

    def post_byok_usage(self, **_kwargs) -> None:
        raise RuntimeError("accounts api is down")


def test_audio_tokens_and_session_seconds_are_posted_once(monkeypatch):
    _FakeByokManager.instances = []
    monkeypatch.setattr(usage, "ByokUsageManager", _FakeByokManager)
    recorder = RealtimeUsageRecorder(_claims(), _settings())

    recorder.on_metrics_collected(
        SimpleNamespace(
            metrics=_realtime_metrics(
                input_audio=80, output_audio=40, session_duration=30.0
            )
        )
    )
    recorder.on_metrics_collected(
        SimpleNamespace(
            metrics=_realtime_metrics(
                input_audio=10, output_audio=5, session_duration=15.0
            )
        )
    )

    assert recorder.take_response_timing() == {"ttft_ms": 420, "duration_ms": 1500}
    assert recorder.take_response_timing() is None

    asyncio.run(recorder.flush())
    asyncio.run(recorder.flush())

    [manager] = _FakeByokManager.instances
    [call] = manager.calls
    assert call["task"] == "openai"
    assert call["jwt"] == "worker-token"

    tokens, seconds = call["request"]
    assert tokens == {
        "ServiceType": "AgentExecutionTime",
        "Provider": "openai",
        "Model": "gpt-realtime",
        "ConsumedUnit": 135,
        "UnitType": "Tokens",
        "CredentialName": "voice-key",
        "RefType": "Agent",
        "RefId": str(FLOW_ID),
        "RefName": "Support Agent",
        "Action": "AgentExecution",
        "TriggeredByAgent": "Support Agent",
        "SpaceId": "space-1",
    }
    assert seconds["ConsumedUnit"] == 45.0
    assert seconds["UnitType"] == "Seconds"


def test_gemini_alias_is_metered_as_gemini(monkeypatch):
    _FakeByokManager.instances = []
    monkeypatch.setattr(usage, "ByokUsageManager", _FakeByokManager)
    recorder = RealtimeUsageRecorder(
        _claims(),
        _settings(provider="googlegemini", model="gemini-live-2.5-flash"),
    )

    recorder.on_metrics_collected(
        SimpleNamespace(metrics=_realtime_metrics(input_audio=5, output_audio=5))
    )
    asyncio.run(recorder.flush())

    [manager] = _FakeByokManager.instances
    assert manager.calls[0]["task"] == "gemini"


def test_non_byok_realtime_posts_nothing(monkeypatch):
    _FakeByokManager.instances = []
    monkeypatch.setattr(usage, "ByokUsageManager", _FakeByokManager)
    recorder = RealtimeUsageRecorder(
        _claims(), _settings(isByokEnabled=False, credentialName=None)
    )

    recorder.on_metrics_collected(
        SimpleNamespace(metrics=_realtime_metrics(input_audio=5, output_audio=5))
    )
    asyncio.run(recorder.flush())

    assert _FakeByokManager.instances == []


def test_usage_posting_failure_never_breaks_the_call(monkeypatch):
    monkeypatch.setattr(usage, "ByokUsageManager", _FailingByokManager)
    recorder = RealtimeUsageRecorder(_claims(), _settings())

    recorder.on_metrics_collected(
        SimpleNamespace(metrics=_realtime_metrics(input_audio=5, output_audio=5))
    )

    asyncio.run(recorder.flush())


def test_connection_metrics_do_not_report_a_response_timing(monkeypatch):
    recorder = RealtimeUsageRecorder(_claims(), _settings())

    recorder.on_metrics_collected(
        SimpleNamespace(metrics=_realtime_metrics(input_audio=0, output_audio=0, ttft=-1.0, duration=0.0))
    )

    assert recorder.take_response_timing() is None


def test_response_without_ttft_still_reports_its_duration():
    recorder = RealtimeUsageRecorder(_claims(), _settings())

    recorder.on_metrics_collected(
        SimpleNamespace(metrics=_realtime_metrics(input_audio=5, output_audio=5, ttft=-1.0))
    )

    assert recorder.take_response_timing() == {"duration_ms": 1500}


# ---------------------------------------------------------------------------
# Live transcript persistence
# ---------------------------------------------------------------------------


class _FakeSession:
    def __init__(self) -> None:
        self.commits = 0

    async def commit(self) -> None:
        self.commits += 1


class _FakeSessionContext:
    def __init__(self, session: _FakeSession) -> None:
        self._session = session

    async def __aenter__(self) -> _FakeSession:
        return self._session

    async def __aexit__(self, *_args) -> None:
        return None


class _RecordingConversationService:
    def __init__(self) -> None:
        self.saved: list[dict] = []

    async def save_message(
        self,
        *,
        db_session,
        request,
        user,
        conversation_id,
        message,
        metadata=None,
        **_kwargs,
    ) -> None:
        self.saved.append(
            {
                "role": type(message).__name__,
                "content": message.content,
                "message_id": message.id,
                "metadata": metadata,
                "request": request,
                "user": user,
                "conversation_id": conversation_id,
            }
        )


def _patch_writer(monkeypatch):
    session = _FakeSession()
    monkeypatch.setattr(
        persistence,
        "get_db_session_context",
        lambda _name: _FakeSessionContext(session),
    )
    service = _RecordingConversationService()
    monkeypatch.setattr(persistence, "conversation_service", service)
    return session, service


def test_live_writer_persists_items_in_order_and_attaches_timing(monkeypatch):
    session, service = _patch_writer(monkeypatch)
    claims = _claims()

    async def run() -> None:
        writer = VoiceRealtimeTranscriptWriter(claims, _settings())
        writer.start()
        writer.add("user", "  hello there  ", "user-1")
        writer.add_tool_call(
            {
                "tool_call_id": "call-1",
                "name": "demo_lookup",
                "content": "demo-result",
                "status": "success",
                "duration_ms": 42,
            }
        )
        writer.add_tool_call(
            {
                "tool_call_id": "call-1",
                "name": "demo_lookup",
                "content": "demo-result",
                "status": "success",
                "duration_ms": 42,
            }
        )
        writer.add("assistant", "Hi.", "agent-1", TIMING)
        writer.add("assistant", "Hi.", "agent-1", TIMING)
        writer.add("system", "ignored", "system-1")
        await writer.aclose()

    asyncio.run(run())

    assert [
        (saved["role"], saved["content"], saved["message_id"])
        for saved in service.saved
    ] == [
        ("HumanMessage", "hello there", "user-1"),
        ("ToolMessage", "demo-result", None),
        ("AIMessage", "Hi.", "agent-1"),
    ]
    assert service.saved[0]["metadata"] is None
    assert service.saved[1]["metadata"] == {"status": "success", "duration_ms": 42}
    assert service.saved[2]["metadata"] == {"voice_turn_timing": TIMING}
    assert service.saved[0]["request"].channel == "voice"
    assert service.saved[0]["request"].is_temp_chat is False
    assert service.saved[0]["conversation_id"] == claims.conversation_id
    assert session.commits == 3


def test_writer_failure_keeps_draining_without_raising(monkeypatch):
    session, service = _patch_writer(monkeypatch)
    original = service.save_message
    attempts: list[str] = []

    async def flaky(**kwargs):
        attempts.append(kwargs["message"].content)
        if len(attempts) == 1:
            raise RuntimeError("database unavailable")
        await original(**kwargs)

    monkeypatch.setattr(service, "save_message", flaky)

    async def run() -> None:
        writer = VoiceRealtimeTranscriptWriter(_claims(), _settings())
        writer.start()
        writer.add("user", "first", "user-1")
        writer.add("assistant", "second", "agent-1")
        await writer.aclose()

    asyncio.run(run())

    assert attempts == ["first", "second"]
    assert [saved["content"] for saved in service.saved] == ["second"]


# ---------------------------------------------------------------------------
# Chat-context seeding
# ---------------------------------------------------------------------------


def test_realtime_chat_items_keep_the_last_configured_turns():
    history = [
        SystemMessage(content="system"),
        HumanMessage(content="q1", id="m1"),
        AIMessage(content="a1", id="m2"),
        ToolMessage(content="tool", tool_call_id="call-1", id="m3"),
        HumanMessage(content="q2", id="m4"),
        AIMessage(content="", id="m5"),
        AIMessage(content="a2", id="m6"),
        HumanMessage(content="q3", id="m7"),
        AIMessage(content="a3", id="m8"),
    ]

    items = chat_bridge.realtime_chat_items(history, 2)

    assert [(item.role, item.text_content, item.id) for item in items] == [
        ("user", "q2", "m4"),
        ("assistant", "a2", "m6"),
        ("user", "q3", "m7"),
        ("assistant", "a3", "m8"),
    ]


def test_realtime_chat_items_without_a_window_keep_every_turn():
    history = [HumanMessage(content="q1"), AIMessage(content="a1")]

    items = chat_bridge.realtime_chat_items(history, None)

    assert [(item.role, item.text_content) for item in items] == [
        ("user", "q1"),
        ("assistant", "a1"),
    ]


def test_history_is_loaded_into_a_chat_context(monkeypatch):
    class _HistoryService:
        def __init__(self) -> None:
            self.calls: list[str] = []

        async def load_history(self, _session, conversation_id):
            self.calls.append(conversation_id)
            return [HumanMessage(content="earlier question")]

    service = _HistoryService()
    monkeypatch.setattr(
        chat_bridge, "get_db_session_context", lambda _name: _FakeSessionContext(_FakeSession())
    )
    claims = _claims()

    context = asyncio.run(
        chat_bridge.load_realtime_chat_context(claims, _settings(), service=service)
    )

    assert service.calls == [claims.conversation_id]
    assert [(item.role, item.text_content) for item in context.items] == [
        ("user", "earlier question")
    ]


def test_empty_history_returns_no_context(monkeypatch):
    class _EmptyService:
        async def load_history(self, _session, _conversation_id):
            return []

    monkeypatch.setattr(
        chat_bridge, "get_db_session_context", lambda _name: _FakeSessionContext(_FakeSession())
    )

    assert (
        asyncio.run(
            chat_bridge.load_realtime_chat_context(
                _claims(), _settings(), service=_EmptyService()
            )
        )
        is None
    )
