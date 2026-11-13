"""Chat-engine bridge tests for #373 (S7).

The engine runs the real LangGraph graph with a scripted fake chat model and a
recording conversation service, so persona, KB, skills, memory, history, tool
execution, refs, temp mode, and transcript persistence are all exercised
without a provider or database. The mapping tests use a fake engine stream for
the frame and failure paths.

Run from ``apis/llmpipeline``:

    ./.venv/Scripts/python.exe -m pytest tests/test_voice_chat_bridge.py -q
"""

from __future__ import annotations

import asyncio
import json
from unittest.mock import AsyncMock
from uuid import UUID, uuid4

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_core.tools import tool
from livekit.agents import llm

from app.features.langgraph.graphs import graph_factory
from app.features.langgraph.schemas.skill_schema import SkillConfig
from app.features.langgraph.services import tool_skill_selector
from app.features.langgraph.services.chat_service import ChatService
from app.features.langgraph.services.conversation_service import ConversationService
from app.features.langgraph.skills.skill_registry import SkillRegistry
from app.features.langgraph.tools.tool_registry import ToolRegistry
from voice_agent import chat_bridge
from voice_agent.chat_bridge import (
    VOICE_APPROVAL_APOLOGY,
    VOICE_FALLBACK_APOLOGY,
    VoiceChatBridge,
    VoiceTurnFrame,
    build_voice_llm_request,
)
from voice_agent.llm_adapter import VoiceEngineLLM, latest_user_text
from voice_agent.metadata import VoiceJobClaims

FLOW_VERSION_ID = UUID("44444444-4444-4444-4444-444444444444")
FLOW_ID = UUID("33333333-3333-3333-3333-333333333333")
TENANT_ID = UUID("11111111-1111-1111-1111-111111111111")
USER_ID = UUID("22222222-2222-2222-2222-222222222222")


def _claims(
    *,
    mode: str = "live",
    conversation_id: str | None = None,
) -> VoiceJobClaims:
    return VoiceJobClaims(
        room_name="voice-room",
        flow_version_id=FLOW_VERSION_ID,
        flow_id=FLOW_ID,
        tenant_id=TENANT_ID,
        user_id=USER_ID,
        conversation_id=conversation_id or str(uuid4()),
        mode=mode,
        space_id="space-1",
        env_type="dev",
        worker_token="worker-token",
        username="voice-tester",
        email="voice-tester@example.com",
    )


def _agent_settings(**overrides) -> dict:
    settings = {
        "agentName": "Support Agent",
        "engineMode": "pipeline",
        "firstSpeaker": "ai",
        "introduction": "Hello, how can I help?",
        "llm": {
            "provider": "openai",
            "model": "gpt-4o-mini",
            "credentialName": "voice-key",
            "isByokEnabled": True,
            "temperature": 0.3,
            "topP": 0.9,
            "maxOutputTokens": 256,
            "reasoningEffort": "low",
        },
        "persona": {"systemPrompt": "Goal:\nHelp the caller.\n\nBe brief."},
        "tools": [
            {
                "tool": "demo",
                "credentialName": "tool-key",
                "actions": [{"action": "lookup", "approval": "auto"}],
            }
        ],
        "knowledgeBase": {"names": ["kb-one"], "topK": 3, "sourceThreshold": 0.4},
        "skills": ["demo-skill"],
        "memory": {"provider": "short-term", "maxShortTermTurns": 4},
        "pronunciations": [{"term": "API", "pronunciation": "A P I"}],
        "soundEffects": {
            "enabled": True,
            "toolCallCueUrl": "https://cue.example",
            "ambienceUrl": "https://ambience.example",
        },
        "managerAgentTarget": "billing",
    }
    settings.update(overrides)
    return settings


async def _noop_kb(_request, _user) -> None:
    return None


def _collect(agen):
    async def run():
        return [frame async for frame in agen]

    return asyncio.run(run())


def _collect_with_timeout(agen, timeout: float = 5.0):
    async def run():
        async def drain():
            return [frame async for frame in agen]

        return await asyncio.wait_for(drain(), timeout)

    return asyncio.run(run())


# ---------------------------------------------------------------------------
# Request mapping
# ---------------------------------------------------------------------------


class TestRequestMapping:
    def test_voice_settings_become_the_engine_request(self):
        claims = _claims(mode="live")
        request = build_voice_llm_request(
            claims,
            _agent_settings(),
            "book a demo",
        )

        assert request.provider == "openai"
        assert request.model == "gpt-4o-mini"
        assert request.input == "book a demo"
        assert request.temperature == 0.3
        assert request.top_p == 0.9
        assert request.reasoning_effort == "low"
        assert request.is_byok_enabled is True
        assert request.credential_name == "voice-key"
        assert request.max_output_tokens == 256

        assert request.is_chat_agent is True
        assert request.is_voice_agent is True
        assert request.channel == "voice"
        assert request.is_temp_chat is False
        assert request.first_speaker == "ai"
        assert request.introduction_text == "Hello, how can I help?"
        assert request.voice_system_prompt == "Goal:\nHelp the caller.\n\nBe brief."

        assert request.conversation_id == claims.conversation_id
        assert request.flow_version_id == str(FLOW_VERSION_ID)
        assert request.ref_type == "Agent"
        assert request.ref_id == str(FLOW_ID)
        assert request.ref_name == "Support Agent"
        assert request.action == "AgentExecution"
        assert request.agent_name == "Support Agent"

        assert request.skill_names == ["demo-skill"]
        assert request.max_short_term_turns == 4
        assert request.kb_names == ["kb-one"]
        assert request.top_k == 3
        assert request.source_threshold == 0.4
        assert request.pronunciations == [
            {"term": "API", "pronunciation": "A P I"}
        ]
        assert request.sfx == {
            "enabled": True,
            "tool_call_cue_url": "https://cue.example",
            "ambience_url": "https://ambience.example",
        }

        assert request.manager_agent == {
            "target": "billing",
            "context": {
                "current_turn_summary": "book a demo",
                "voice_system_prompt": "Goal:\nHelp the caller.\n\nBe brief.",
                "conversation_id": claims.conversation_id,
            },
        }

        assert request.tool_config is not None
        tool_config = request.tool_config[0]
        assert tool_config.tool == "demo"
        assert tool_config.credential_name == "tool-key"
        assert tool_config.actions[0].action == "lookup"
        assert tool_config.actions[0].approval == "auto"

    def test_test_mode_is_temporary_and_missing_manager_is_omitted(self):
        request = build_voice_llm_request(
            _claims(mode="test"),
            _agent_settings(managerAgentTarget=None, knowledgeBase={"names": []}),
            "hello",
        )

        assert request.is_temp_chat is True
        assert request.manager_agent is None
        assert request.kb_names is None
        assert request.top_k is None
        assert request.source_threshold is None

    def test_unknown_approval_fails_closed_to_human(self):
        settings = _agent_settings(
            tools=[
                {
                    "tool": "demo",
                    "actions": [{"action": "lookup", "approval": "nonsense"}],
                }
            ]
        )

        request = build_voice_llm_request(_claims(), settings, "hello")

        assert request.tool_config[0].actions[0].approval == "human"


# ---------------------------------------------------------------------------
# Frame mapping and failure paths
# ---------------------------------------------------------------------------


class _Chunk:
    def __init__(self, type: str, output=None):
        self.type = type
        self.output = output


class _FakeEngine:
    def __init__(
        self,
        chunks: list[_Chunk] | None = None,
        error: Exception | None = None,
    ):
        self.chunks = chunks or []
        self.error = error
        self.requests = []

    async def stream_normalized(self, request, user, db_session=None):
        self.requests.append(request)
        for chunk in self.chunks:
            yield chunk
        if self.error:
            raise self.error


class _FakeSession:
    def __init__(self):
        self.commits = 0

    async def commit(self):
        self.commits += 1


class _FakeSessionContext:
    def __init__(self, session: _FakeSession):
        self._session = session

    async def __aenter__(self):
        return self._session

    async def __aexit__(self, *args) -> None:
        return None


def _patch_session(monkeypatch, session: _FakeSession) -> None:
    monkeypatch.setattr(
        chat_bridge,
        "get_db_session_context",
        lambda _name: _FakeSessionContext(session),
    )


class TestFrameMapping:
    def test_delta_tool_followup_and_done_are_mapped(self, monkeypatch):
        session = _FakeSession()
        _patch_session(monkeypatch, session)
        engine = _FakeEngine(
            [
                _Chunk("delta", "Hello "),
                _Chunk("tool_call", {"name": "demo_lookup"}),
                _Chunk("followup", ["next"]),
                _Chunk("done", ""),
            ]
        )
        bridge = VoiceChatBridge(
            _claims(),
            _agent_settings(),
            service=engine,
            retrieve_kb=_noop_kb,
        )

        frames = _collect(bridge.stream_turn("  hi  "))

        assert [frame.kind for frame in frames] == [
            "delta",
            "tool_call",
            "followup",
            "done",
        ]
        assert frames[0].text == "Hello "
        assert frames[1].payload == {"name": "demo_lookup"}
        assert frames[2].payload == ["next"]
        assert frames[-1].payload is True
        assert engine.requests[0].input == "hi"
        assert session.commits == 1

    def test_temp_mode_never_commits(self, monkeypatch):
        session = _FakeSession()
        _patch_session(monkeypatch, session)
        engine = _FakeEngine([_Chunk("delta", "Hello "), _Chunk("done", "")])
        bridge = VoiceChatBridge(
            _claims(mode="test"),
            _agent_settings(),
            service=engine,
            retrieve_kb=_noop_kb,
        )

        _collect(bridge.stream_turn("hi"))

        assert engine.requests[0].is_temp_chat is True
        assert session.commits == 0

    def test_done_text_is_spoken_when_no_delta_arrived(self, monkeypatch):
        _patch_session(monkeypatch, _FakeSession())
        engine = _FakeEngine([_Chunk("done", "Final words")])
        bridge = VoiceChatBridge(
            _claims(),
            _agent_settings(),
            service=engine,
            retrieve_kb=_noop_kb,
        )

        frames = _collect(bridge.stream_turn("hi"))

        assert [frame.kind for frame in frames] == ["delta", "done"]
        assert frames[0].text == "Final words"

    def test_empty_engine_text_falls_back_to_an_apology(self, monkeypatch):
        _patch_session(monkeypatch, _FakeSession())
        engine = _FakeEngine([_Chunk("done", "")])
        bridge = VoiceChatBridge(
            _claims(),
            _agent_settings(),
            service=engine,
            retrieve_kb=_noop_kb,
        )

        frames = _collect(bridge.stream_turn("hi"))

        assert [frame.kind for frame in frames] == ["delta", "done"]
        assert frames[0].text == VOICE_FALLBACK_APOLOGY

    def test_empty_transcript_skips_the_engine(self, monkeypatch):
        session = _FakeSession()
        _patch_session(monkeypatch, session)
        engine = _FakeEngine()
        bridge = VoiceChatBridge(
            _claims(),
            _agent_settings(),
            service=engine,
            retrieve_kb=_noop_kb,
        )

        frames = _collect(bridge.stream_turn("   "))

        assert [frame.kind for frame in frames] == ["delta", "done"]
        assert frames[0].text == VOICE_FALLBACK_APOLOGY
        assert frames[-1].payload is False
        assert engine.requests == []
        assert session.commits == 0

    def test_engine_exception_ends_with_error_apology_and_done(self, monkeypatch):
        _patch_session(monkeypatch, _FakeSession())
        engine = _FakeEngine(error=RuntimeError("engine down"))
        bridge = VoiceChatBridge(
            _claims(),
            _agent_settings(),
            service=engine,
            retrieve_kb=_noop_kb,
        )

        frames = _collect(bridge.stream_turn("hi"))

        assert [frame.kind for frame in frames] == ["error", "delta", "done"]
        assert frames[1].text == VOICE_FALLBACK_APOLOGY
        assert frames[-1].payload is False

    def test_failed_turn_leaves_the_session_uncommitted(self, monkeypatch):
        session = _FakeSession()
        _patch_session(monkeypatch, session)
        engine = _FakeEngine([_Chunk("delta", "Hello ")], error=RuntimeError("engine down"))
        bridge = VoiceChatBridge(
            _claims(),
            _agent_settings(),
            service=engine,
            retrieve_kb=_noop_kb,
        )

        _collect(bridge.stream_turn("hi"))

        assert session.commits == 0

    def test_approval_fails_closed_without_hanging(self, monkeypatch):
        _patch_session(monkeypatch, _FakeSession())
        engine = _FakeEngine(
            [
                _Chunk("tool_call", {"name": "demo_lookup"}),
                _Chunk("approval_required", {"tool_call_id": "call-1"}),
                _Chunk("delta", "text that must not be spoken"),
                _Chunk("done", ""),
            ]
        )
        bridge = VoiceChatBridge(
            _claims(),
            _agent_settings(),
            service=engine,
            retrieve_kb=_noop_kb,
        )

        frames = _collect_with_timeout(bridge.stream_turn("hi"))

        assert [frame.kind for frame in frames] == [
            "tool_call",
            "error",
            "delta",
            "done",
        ]
        assert frames[2].text == VOICE_APPROVAL_APOLOGY
        assert sum(frame.kind == "done" for frame in frames) == 1


# ---------------------------------------------------------------------------
# LiveKit adapter
# ---------------------------------------------------------------------------


class _RecordingBridge:
    def __init__(self, frames: list[VoiceTurnFrame]):
        self.frames = frames
        self.transcripts = []

    async def stream_turn(self, transcript: str):
        self.transcripts.append(transcript)
        for frame in self.frames:
            yield frame


def _chat_context() -> llm.ChatContext:
    context = llm.ChatContext.empty()
    context.add_message(role="user", content="old question")
    context.add_message(role="assistant", content="old answer")
    context.add_message(role="user", content="latest question")
    return context


class TestLiveKitAdapter:
    def test_only_the_latest_caller_text_reaches_the_engine(self):
        bridge = _RecordingBridge(
            [
                VoiceTurnFrame(kind="delta", text="ok"),
                VoiceTurnFrame(kind="done"),
            ]
        )
        adapter = VoiceEngineLLM(bridge=bridge, model="m", provider="p")

        async def run():
            stream = adapter.chat(chat_ctx=_chat_context())
            return [chunk async for chunk in stream]

        chunks = asyncio.run(run())

        assert bridge.transcripts == ["latest question"]
        assert [chunk.delta.content for chunk in chunks] == ["ok"]
        assert chunks[0].delta.role == "assistant"

    def test_livekit_history_and_tools_are_ignored(self):
        async def run_tool():
            raise AssertionError("LiveKit tool must not execute")

        class Tool:
            async def __call__(self):
                return await run_tool()

        bridge = _RecordingBridge(
            [VoiceTurnFrame(kind="delta", text="ok"), VoiceTurnFrame(kind="done")]
        )
        adapter = VoiceEngineLLM(bridge=bridge, model="m", provider="p")

        async def run():
            stream = adapter.chat(
                chat_ctx=_chat_context(),
                tools=[Tool()],
            )
            return [chunk async for chunk in stream]

        chunks = asyncio.run(run())

        assert [chunk.delta.content for chunk in chunks] == ["ok"]
        assert bridge.transcripts == ["latest question"]

    def test_latest_user_text_skips_non_user_items(self):
        context = _chat_context()
        context.items.append(
            llm.FunctionCall(
                call_id="call-1",
                name="demo_lookup",
                arguments="{}",
            )
        )

        assert latest_user_text(context) == "latest question"


# ---------------------------------------------------------------------------
# Real engine with a scripted model
# ---------------------------------------------------------------------------


class _ScriptedPlanner:
    def __init__(self, selections: list[dict]):
        self._selections = list(selections)
        self.calls = 0

    async def ainvoke(self, messages):
        self.calls += 1
        return AIMessage(content=json.dumps(self._selections.pop(0)))


class _ScriptedModel:
    def __init__(self, replies: list[AIMessage]):
        self._replies = list(replies)
        self.calls = []
        self.bound_tools = []

    def bind_tools(self, tools):
        self.bound_tools.append([tool.name for tool in tools])
        return self

    async def ainvoke(self, messages):
        self.calls.append(list(messages))
        return self._replies.pop(0)


class _RecordingConversationService(ConversationService):
    def __init__(self):
        self.saved = []
        self.transcripts = []

    async def load_history(self, db_session, conversation_id):
        return []

    async def save_message(
        self,
        db_session,
        request,
        user,
        conversation_id,
        message,
        persisted_ids=None,
        persisted_tool_call_ids=None,
    ):
        message_id = getattr(message, "id", None)
        tool_call_id = getattr(message, "tool_call_id", None)
        if message_id and persisted_ids is not None and message_id in persisted_ids:
            return
        if (
            tool_call_id
            and persisted_tool_call_ids is not None
            and tool_call_id in persisted_tool_call_ids
        ):
            return
        if message_id and persisted_ids is not None:
            persisted_ids.add(message_id)
        if tool_call_id and persisted_tool_call_ids is not None:
            persisted_tool_call_ids.add(tool_call_id)
        self.saved.append(message)

    async def save_transcript(
        self,
        db_session,
        request,
        user,
        conversation_id,
        content,
        frames,
        decisions=None,
    ):
        self.transcripts.append(
            {"content": content, "frames": frames, "request": request}
        )


def _patch_models(monkeypatch, planner, conversation) -> None:
    def create_chat_model(*, llm_request, user):
        if llm_request.action == "ToolSkillSelection":
            return planner
        return conversation

    monkeypatch.setattr(graph_factory, "create_chat_model", create_chat_model)
    monkeypatch.setattr(tool_skill_selector, "create_chat_model", create_chat_model)


def _engine_service(recorder, demo_tool) -> ChatService:
    service = ChatService(ToolRegistry(), SkillRegistry(), recorder, None)
    service.tool_registry.register(demo_tool)
    service.skill_registry.register(
        SkillConfig(name="demo-skill", description="Demo skill.")
    )
    service._load_custom_tools = AsyncMock()
    service._load_custom_skills = AsyncMock()
    return service


async def _kb_injector(request, user) -> None:
    request.input = (
        "[Knowledge Base Context]\nkb-fact\n[/Knowledge Base Context]\n\n"
        + str(request.input)
    )


def _demo_tool(calls: list[str]):
    @tool
    def demo_lookup(query: str) -> str:
        """Look up a demo value."""
        calls.append(query)
        return "demo-result"

    return demo_lookup


def _tool_call_reply() -> AIMessage:
    return AIMessage(
        id="ai-tool",
        content="",
        tool_calls=[
            {
                "id": "call-1",
                "name": "demo_lookup",
                "args": {"query": "first question"},
                "type": "tool_call",
            }
        ],
    )


class TestRealEngineTurn:
    def test_engine_runs_persona_kb_skill_tool_and_persistence(
        self,
        monkeypatch,
    ):
        session = _FakeSession()
        _patch_session(monkeypatch, session)
        calls: list[str] = []
        planner = _ScriptedPlanner(
            [{"tool_names": ["demo_lookup"], "skill_names": ["demo-skill"]}]
        )
        conversation = _ScriptedModel(
            [_tool_call_reply(), AIMessage(id="ai-final", content="Done.")]
        )
        _patch_models(monkeypatch, planner, conversation)

        recorder = _RecordingConversationService()
        service = _engine_service(recorder, _demo_tool(calls))
        bridge = VoiceChatBridge(
            _claims(),
            _agent_settings(),
            service=service,
            retrieve_kb=_kb_injector,
        )

        frames = _collect_with_timeout(bridge.stream_turn("first question"))

        # The engine executed the configured tool exactly once.
        assert calls == ["first question"]
        assert conversation.bound_tools[0] == ["demo_lookup"]
        # Voice turns bind every configured capability instead of planning.
        assert planner.calls == 0

        # Persona, KB context, and the selected skill reached the model prompt.
        first_prompt = conversation.calls[0]
        system_text = first_prompt[0].content
        assert isinstance(first_prompt[0], SystemMessage)
        assert "Goal:\nHelp the caller." in system_text
        assert "You have access to the following skills" in system_text
        assert "demo-skill" in system_text
        human_text = next(
            message.content
            for message in first_prompt
            if isinstance(message, HumanMessage)
        )
        assert "[Knowledge Base Context]" in human_text
        assert "kb-fact" in human_text
        assert "first question" in human_text

        # The engine's normalized frames drove the voice turn.
        kinds = [frame.kind for frame in frames]
        assert "tool_call" in kinds
        assert "delta" in kinds
        assert kinds[-1] == "done"

        # The same engine persistence boundary was used for messages,
        # transcript, and commits.
        assert isinstance(recorder.saved[0], HumanMessage)
        assert recorder.saved[0].content.endswith("first question")
        assert any(isinstance(message, ToolMessage) for message in recorder.saved)
        assert any(
            isinstance(message, AIMessage) and message.content == "Done."
            for message in recorder.saved
        )
        assert len(recorder.transcripts) == 1
        assert recorder.transcripts[0]["content"] == "Done."
        assert any(
            frame.get("type") == "tool_call"
            for frame in recorder.transcripts[0]["frames"]
        )
        assert session.commits > 0

        saved_request = recorder.transcripts[0]["request"]
        assert saved_request.ref_id == str(FLOW_ID)
        assert saved_request.flow_version_id == str(FLOW_VERSION_ID)
        assert saved_request.channel == "voice"

    def test_second_turn_uses_engine_history(self, monkeypatch):
        _patch_session(monkeypatch, _FakeSession())
        planner = _ScriptedPlanner(
            [
                {"tool_names": [], "skill_names": []},
                {"tool_names": [], "skill_names": []},
            ]
        )
        conversation = _ScriptedModel(
            [
                AIMessage(id="ai-1", content="First answer."),
                AIMessage(id="ai-2", content="Second answer."),
            ]
        )
        _patch_models(monkeypatch, planner, conversation)

        recorder = _RecordingConversationService()
        service = _engine_service(recorder, _demo_tool([]))
        settings = _agent_settings(tools=[], skills=[], knowledgeBase={"names": []})
        bridge = VoiceChatBridge(
            _claims(),
            settings,
            service=service,
            retrieve_kb=_noop_kb,
        )

        _collect_with_timeout(bridge.stream_turn("first question"))
        _collect_with_timeout(bridge.stream_turn("second question"))

        second_turn = conversation.calls[-1]
        human_messages = [
            message.content
            for message in second_turn
            if isinstance(message, HumanMessage)
        ]
        assert human_messages == ["first question", "second question"]
        assert second_turn[-1].content == "second question"

    def test_memory_window_keeps_only_the_latest_turns(self, monkeypatch):
        _patch_session(monkeypatch, _FakeSession())
        planner = _ScriptedPlanner(
            [
                {"tool_names": [], "skill_names": []},
                {"tool_names": [], "skill_names": []},
            ]
        )
        conversation = _ScriptedModel(
            [
                AIMessage(id="ai-1", content="First answer."),
                AIMessage(id="ai-2", content="Second answer."),
            ]
        )
        _patch_models(monkeypatch, planner, conversation)

        recorder = _RecordingConversationService()
        service = _engine_service(recorder, _demo_tool([]))
        settings = _agent_settings(
            tools=[],
            skills=[],
            knowledgeBase={"names": []},
            memory={"provider": "short-term", "maxShortTermTurns": 1},
        )
        bridge = VoiceChatBridge(
            _claims(),
            settings,
            service=service,
            retrieve_kb=_noop_kb,
        )

        _collect_with_timeout(bridge.stream_turn("first question"))
        _collect_with_timeout(bridge.stream_turn("second question"))

        second_turn = conversation.calls[-1]
        assert not any(
            isinstance(message, HumanMessage) and message.content == "first question"
            for message in second_turn
        )
        assert any(
            isinstance(message, HumanMessage) and message.content == "second question"
            for message in second_turn
        )

    def test_test_mode_skips_persistence(self, monkeypatch):
        session = _FakeSession()
        _patch_session(monkeypatch, session)
        planner = _ScriptedPlanner([{"tool_names": [], "skill_names": []}])
        conversation = _ScriptedModel([AIMessage(id="ai-1", content="Temp answer.")])
        _patch_models(monkeypatch, planner, conversation)

        recorder = _RecordingConversationService()
        service = _engine_service(recorder, _demo_tool([]))
        settings = _agent_settings(tools=[], skills=[], knowledgeBase={"names": []})
        bridge = VoiceChatBridge(
            _claims(mode="test"),
            settings,
            service=service,
            retrieve_kb=_noop_kb,
        )

        frames = _collect_with_timeout(bridge.stream_turn("hello"))

        assert frames[-1].kind == "done"
        assert recorder.saved == []
        assert recorder.transcripts == []
        assert session.commits == 0

    def test_human_approval_pauses_and_fails_closed(self, monkeypatch):
        _patch_session(monkeypatch, _FakeSession())
        calls: list[str] = []
        planner = _ScriptedPlanner(
            [{"tool_names": ["demo_lookup"], "skill_names": []}]
        )
        conversation = _ScriptedModel([_tool_call_reply()])
        _patch_models(monkeypatch, planner, conversation)

        recorder = _RecordingConversationService()
        service = _engine_service(recorder, _demo_tool(calls))
        settings = _agent_settings(
            skills=[],
            knowledgeBase={"names": []},
            tools=[
                {
                    "tool": "demo",
                    "actions": [{"action": "lookup", "approval": "human"}],
                }
            ],
        )
        claims = _claims()
        bridge = VoiceChatBridge(
            claims,
            settings,
            service=service,
            retrieve_kb=_noop_kb,
        )

        frames = _collect_with_timeout(bridge.stream_turn("do the thing"))

        assert calls == []
        assert frames[-1].kind == "done"
        assert any(frame.text == VOICE_APPROVAL_APOLOGY for frame in frames)
        assert claims.conversation_id in service._pending_approval_conversations
