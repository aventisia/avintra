"""Voice agent contract and failure-path tests for #381.

Covers the VoiceAgent fields added to ``LLMRequest``, the persona/introduction
context merged into the model input, and the manager-agent failure default
(error frame + plain-text fallback, conversation continues).

Run from ``apis/llmpipeline`` (``ENV`` defaults to ``local``):

    ./.venv/Scripts/python.exe -m pytest tests/test_voice_agent.py -q
"""

from langchain_core.messages import HumanMessage, SystemMessage

from app.features.langgraph.services.chat_service import ChatService
from app.features.langgraph.services.conversation_service import conversation_service
from app.features.langgraph.skills.skill_registry import SkillRegistry
from app.features.langgraph.tools.tool_registry import ToolRegistry
from app.features.llm_providers.llm_providers_schemas import LLMChunkResponse, LLMRequest


def _service() -> ChatService:
    return ChatService(ToolRegistry(), SkillRegistry(), conversation_service, None)


def _voice_request(**overrides) -> LLMRequest:
    payload = {
        "provider": "openai",
        "model": "gpt-4o-mini",
        "input": "hello",
        "is_chat_agent": True,
        "is_voice_agent": True,
    }
    payload.update(overrides)
    return LLMRequest(**payload)


# ---------------------------------------------------------------------------
# Contract shape
# ---------------------------------------------------------------------------


class TestVoiceContractShape:
    def test_request_defaults_keep_chat_behaviour(self):
        request = LLMRequest(provider="openai", model="gpt-4o-mini", input="hi")

        assert request.is_voice_agent is False
        assert request.first_speaker is None
        assert request.introduction_text is None
        assert request.voice_system_prompt is None
        assert request.manager_agent is None
        assert request.flow_version_id is None
        assert request.channel == "chat"

    def test_request_accepts_voice_fields(self):
        request = _voice_request(
            first_speaker="ai",
            introduction_text="Hello there.",
            voice_system_prompt="Goal:\nHelp the caller.",
            manager_agent={"target": "billing_agent", "context": {"conversation_id": "c1"}},
            flow_version_id="22222222-2222-2222-2222-222222222222",
            channel="voice",
        )

        assert request.is_voice_agent is True
        assert request.first_speaker == "ai"
        assert request.introduction_text == "Hello there."
        assert request.voice_system_prompt == "Goal:\nHelp the caller."
        assert request.manager_agent["target"] == "billing_agent"
        assert request.flow_version_id == "22222222-2222-2222-2222-222222222222"
        assert request.channel == "voice"


# ---------------------------------------------------------------------------
# Persona / introduction context
# ---------------------------------------------------------------------------


class TestVoiceContext:
    def test_chat_request_is_untouched(self):
        service = _service()
        request = LLMRequest(provider="openai", model="gpt-4o-mini", input="hi")
        messages = [HumanMessage(content="hi")]

        assert service._with_voice_context(request, messages) == messages

    def test_persona_and_introduction_merge_into_system_context(self):
        service = _service()
        request = _voice_request(
            voice_system_prompt="Goal:\nHelp the caller.\n\nRole:\nBilling helper.",
            introduction_text="Hello, how can I help?",
        )

        messages = service._with_voice_context(request, [HumanMessage(content="hi")])

        assert isinstance(messages[0], SystemMessage)
        assert messages[0].type == "system"
        assert "Goal:\nHelp the caller." in messages[0].content
        assert "Role:\nBilling helper." in messages[0].content
        assert "Hello, how can I help?" in messages[0].content

    def test_introduction_is_never_an_assistant_turn(self):
        service = _service()
        request = _voice_request(introduction_text="Hello, how can I help?")

        messages = service._with_voice_context(request, [HumanMessage(content="hi")])

        assert [message.type for message in messages] == ["system", "human"]

    def test_missing_persona_and_introduction_adds_nothing(self):
        service = _service()
        request = _voice_request()
        messages = [HumanMessage(content="hi")]

        assert service._with_voice_context(request, messages) == messages


# ---------------------------------------------------------------------------
# Manager agent contract + failure default
# ---------------------------------------------------------------------------


class TestManagerAgent:
    def test_resolvable_target_is_forwarded(self):
        request = _voice_request(manager_agent={"target": "billing_agent", "context": {}})

        assert ChatService._unresolvable_manager_target(request) is False

    def test_blank_target_is_unresolvable(self):
        request = _voice_request(manager_agent={"target": "   ", "context": {}})

        assert ChatService._unresolvable_manager_target(request) is True

    def test_missing_target_is_unresolvable(self):
        request = _voice_request(manager_agent={"context": {}})

        assert ChatService._unresolvable_manager_target(request) is True

    def test_chat_request_without_voice_flag_is_resolvable(self):
        request = LLMRequest(
            provider="openai",
            model="gpt-4o-mini",
            input="hi",
            manager_agent={"target": ""},
        )

        assert ChatService._unresolvable_manager_target(request) is False

    def test_failure_path_emits_error_then_plain_text_fallback_and_done(self):
        request = _voice_request(manager_agent={"target": ""})

        frames = list(ChatService._voice_manager_fallback_frames(request, "conv-1"))

        assert all(isinstance(frame, LLMChunkResponse) for frame in frames)
        assert [frame.type for frame in frames] == ["error", "delta", "done"]
        assert frames[0].output == "The configured manager agent could not be reached."
        assert isinstance(frames[1].output, str) and frames[1].output.strip()
        assert frames[2].output == ""
        assert {frame.conversation_id for frame in frames} == {"conv-1"}
