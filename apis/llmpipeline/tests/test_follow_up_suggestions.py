"""Home chat follow-up suggestions come from one short call to the chat's own model."""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest

from langchain_core.messages import AIMessage

from app.features.langgraph.services import follow_up_suggestions as suggestions
from app.features.langgraph.services.follow_up_suggestions import (
    generate_follow_up_suggestions,
    latest_user_text,
    parse_suggestions,
    suggestion_request,
)
from app.features.llm_providers.llm_providers_schemas import LLMMessage, LLMRequest

USER = SimpleNamespace(access_token="jwt", env_type=None, tenant_id=None, space_id=None)


def _request(**overrides) -> LLMRequest:
    fields = {
        "provider": "anthropic",
        "model": "claude-opus-4-8",
        "input": "What is a vector database?",
        "conversation_id": "c1",
        "action": "LandingChat",
    }
    return LLMRequest(**{**fields, **overrides})


def test_parse_plain_array():
    assert parse_suggestions('["A?", "B?", "C?"]') == ["A?", "B?", "C?"]


def test_parse_array_inside_prose_and_fence():
    assert parse_suggestions('Sure:\n```json\n["A", "B"]\n```') == ["A", "B"]


def test_parse_caps_at_three():
    assert parse_suggestions('["a","b","c","d"]') == ["a", "b", "c"]


def test_parse_drops_non_strings_blanks_and_long_items():
    assert parse_suggestions('["ok", 3, "", "' + "x" * 201 + '"]') == ["ok"]


def test_parse_without_array_returns_nothing():
    assert parse_suggestions("no json here") == []
    assert parse_suggestions("") == []
    assert parse_suggestions("[not json]") == []


def test_latest_user_text():
    assert latest_user_text("hi") == "hi"
    messages = [
        LLMMessage(role="system", content="rules"),
        LLMMessage(role="user", content="first"),
        LLMMessage(role="assistant", content="answer"),
        LLMMessage(role="user", content="second"),
    ]
    assert latest_user_text(messages) == "second"
    assert latest_user_text([]) == ""


def test_suggestion_request_keeps_claude_effort_low():
    request = suggestion_request(_request(reasoning_effort="high"))
    assert request.reasoning_effort == "low"
    assert request.max_output_tokens == 1024
    assert request.model == "claude-opus-4-8"
    assert suggestion_request(_request(model="claude-fable-5-2")).reasoning_effort == "low"


def test_suggestion_request_drops_effort_where_claude_has_none():
    request = suggestion_request(_request(model="claude-haiku-4-5", reasoning_effort="high"))
    assert request.reasoning_effort is None


def test_suggestion_request_keeps_openai_reasoning_low():
    assert suggestion_request(_request(provider="openai", model="gpt-5")).reasoning_effort == "low"
    assert (
        suggestion_request(_request(provider="openai", model="gpt-4o-mini")).reasoning_effort
        is None
    )


class _FakeModel:
    def __init__(self, reply=None, error=None, delay=0.0):
        self.reply = reply
        self.error = error
        self.delay = delay
        self.sent = None

    async def ainvoke(self, messages):
        self.sent = messages
        if self.delay:
            await asyncio.sleep(self.delay)
        if self.error:
            raise self.error
        return self.reply


def _generate(model: _FakeModel, reply: str = "An answer.", timeout: float = 10.0):
    with patch.object(suggestions, "create_chat_model", return_value=model):
        return asyncio.run(
            generate_follow_up_suggestions(_request(), USER, reply, timeout=timeout)
        )


def test_generate_sends_trimmed_reply_and_returns_parsed():
    message = AIMessage(content='["A","B","C"]')
    model = _FakeModel(reply=message)

    result, returned = _generate(model, reply="y" * 5000)

    assert result == ["A", "B", "C"]
    assert returned is message
    human = model.sent[-1].content
    assert "What is a vector database?" in human
    assert human.count("y") == 4000


def test_generate_handles_list_content():
    model = _FakeModel(reply=AIMessage(content=[{"type": "text", "text": '["A"]'}]))
    assert _generate(model)[0] == ["A"]


def test_generate_returns_nothing_on_error():
    assert _generate(_FakeModel(error=RuntimeError("boom"))) == ([], None)


def test_generate_returns_nothing_on_timeout():
    model = _FakeModel(reply=AIMessage(content='["A"]'), delay=1.0)
    assert _generate(model, timeout=0.01) == ([], None)


def _service():
    from app.features.langgraph.services.chat_service import ChatService
    from app.features.langgraph.skills.skill_registry import SkillRegistry
    from app.features.langgraph.tools.tool_registry import ToolRegistry

    return ChatService(ToolRegistry(), SkillRegistry(), conversation_service=None)


def _frames(request: LLMRequest, generated, reply="An answer.", pending=False):
    from app.features.langgraph.services import chat_service

    service = _service()
    generator = AsyncMock(return_value=generated)
    with patch.object(chat_service, "generate_follow_up_suggestions", generator), patch.object(
        chat_service.ChatService, "_create_final_response"
    ) as final_response:

        async def collect():
            return [
                frame
                async for frame in service._follow_up_frames(request, USER, reply, pending)
            ]

        frames = asyncio.run(collect())
    return frames, generator, final_response


USAGE_MESSAGE = AIMessage(
    content="x", usage_metadata={"input_tokens": 10, "output_tokens": 5, "total_tokens": 15}
)


def test_landing_reply_yields_one_followup_frame():
    frames, _, final_response = _frames(_request(), (["A", "B", "C"], USAGE_MESSAGE))

    assert len(frames) == 1
    assert frames[0].type == "followup"
    assert frames[0].output == ["A", "B", "C"]
    assert frames[0].conversation_id == "c1"
    final_response.assert_called_once()
    assert final_response.call_args.kwargs["request"].max_output_tokens == 1024
    assert final_response.call_args.kwargs["graph_response"] is USAGE_MESSAGE


@pytest.mark.parametrize(
    "overrides, reply, pending",
    [
        ({"action": "AgentExecution"}, "An answer.", False),
        ({"is_temp_chat": True}, "An answer.", False),
        ({"is_voice_agent": True}, "An answer.", False),
        ({"channel": "voice"}, "An answer.", False),
        ({}, "An answer.", True),
        ({}, "   ", False),
    ],
)
def test_no_followups_when_skipped(overrides, reply, pending):
    frames, generator, final_response = _frames(
        _request(**overrides), (["A"], USAGE_MESSAGE), reply=reply, pending=pending
    )

    assert frames == []
    generator.assert_not_called()
    final_response.assert_not_called()


def test_usage_posted_even_without_suggestions():
    frames, _, final_response = _frames(_request(), ([], USAGE_MESSAGE))

    assert frames == []
    final_response.assert_called_once()


def test_no_usage_when_call_failed():
    frames, _, final_response = _frames(_request(), ([], None))

    assert frames == []
    final_response.assert_not_called()


def test_suggestions_never_search_the_web():
    request = _request(web_search=True)

    assert suggestion_request(request).web_search is False
