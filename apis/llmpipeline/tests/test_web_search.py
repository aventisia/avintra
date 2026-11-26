"""Home chat web search: which models get the provider's built-in search, and how it is wired in."""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest

from app.features.langgraph.graphs.graph_factory import _create_dynamic_model_node
from app.features.langgraph.providers.web_search import (
    WEB_SEARCH_INSTRUCTION,
    supports_web_search,
    web_search_enabled,
    web_search_tool,
)
from app.features.llm_providers.llm_providers_schemas import LLMRequest


@pytest.mark.parametrize(
    ("provider", "model", "expected"),
    [
        ("anthropic", "claude-sonnet-5-5", True),
        ("anthropic", "claude-opus-4-6", True),
        ("anthropic", "claude-fable-5", True),
        ("anthropic", "claude-3-haiku", False),
        ("openai", "gpt-5", True),
        ("openai", "gpt-4.1", True),
        ("openai", "gpt-4o-mini", True),
        ("openai", "o3", True),
        ("openai", "gpt-4.1-nano", False),
        ("openai", "gpt-5-chat-latest", False),
        ("googlegemini", "gemini-2.5-pro", False),
        ("openrouter", "anthropic/claude-sonnet-4-6", False),
    ],
)
def test_supports_web_search(provider, model, expected):
    assert supports_web_search(provider, model) is expected


def _request(**overrides) -> LLMRequest:
    values = {
        "provider": "anthropic",
        "model": "claude-sonnet-5-5",
        "input": "hi",
        "conversation_id": "c1",
        "action": "LandingChat",
        "web_search": True,
        "credential_name": "cred",
    }
    return LLMRequest(**{**values, **overrides})


def test_search_runs_for_home_chat_only():
    assert web_search_enabled(_request()) is True
    assert web_search_enabled(_request(action="AgentExecution")) is False
    assert web_search_enabled(_request(web_search=False)) is False
    assert web_search_enabled(_request(model="claude-3-haiku")) is False
    assert web_search_enabled(_request(credential_name=None)) is False


def test_tool_dicts_per_provider():
    assert web_search_tool("anthropic") == {
        "type": "web_search_20250305",
        "name": "web_search",
        "max_uses": 5,
    }
    assert web_search_tool("openai") == {"type": "web_search"}


class _RecordingModel:
    def __init__(self):
        self.bound = None

    def bind_tools(self, tools):
        self.bound = list(tools)
        return self


async def _run_node(request: LLMRequest, function_tools: list):
    model = _RecordingModel()
    captured = {}

    def fake_create_model_node(**kwargs):
        captured.update(kwargs)
        return AsyncMock(return_value={})

    with (
        patch(
            "app.features.langgraph.graphs.graph_factory.resolve_tools",
            AsyncMock(return_value=function_tools),
        ),
        patch(
            "app.features.langgraph.graphs.graph_factory.create_model_node",
            fake_create_model_node,
        ),
    ):
        node = _create_dynamic_model_node(model, SimpleNamespace(), request)
        await node({"metadata": {}, "messages": []})
    return model.bound, captured["skill_prompt"]


def test_anthropic_node_binds_search_beside_function_tools():
    function_tool = SimpleNamespace(name="navigate")
    bound, prompt = asyncio.run(_run_node(_request(), [function_tool]))

    assert bound == [function_tool, web_search_tool("anthropic")]
    assert WEB_SEARCH_INSTRUCTION in prompt


def test_search_binds_without_any_function_tools():
    bound, _ = asyncio.run(_run_node(_request(), []))

    assert bound == [web_search_tool("anthropic")]


def test_nothing_is_bound_or_said_when_search_is_off():
    bound, prompt = asyncio.run(_run_node(_request(web_search=False), []))

    assert bound is None
    assert not prompt or WEB_SEARCH_INSTRUCTION not in prompt


def test_openai_model_uses_responses_api_when_search_is_on():
    from app.features.langgraph.providers.openai_provider import create_openai_model

    user = SimpleNamespace(access_token="jwt", env_type=None, tenant_id=None, space_id=None)
    credential = {"data": {"ApiKey": "sk-test", "Url": "https://api.openai.com/v1"}}

    def build(web_search: bool):
        request = _request(
            provider="openai", model="gpt-5", credential_name="cred", web_search=web_search
        )
        with patch(
            "app.features.langgraph.providers.openai_provider.VaultCredentialManager"
        ) as manager:
            manager.return_value.get_vault_credential_secret_by_name.return_value = credential
            return create_openai_model(request, user)

    assert build(True).use_responses_api is True
    assert build(False).use_responses_api is None


def test_toggling_search_rebuilds_the_graph():
    from app.features.langgraph.services.chat_service import ChatService
    from app.features.langgraph.skills.skill_registry import SkillRegistry
    from app.features.langgraph.tools.tool_registry import ToolRegistry

    service = ChatService(ToolRegistry(), SkillRegistry(), conversation_service=None)
    user = SimpleNamespace(access_token="jwt", env_type=None, tenant_id=None, space_id=None)

    with patch(
        "app.features.langgraph.services.chat_service.build_chat_graph",
        side_effect=lambda **kwargs: object(),
    ) as build:
        on = service._graph(_request(), user)
        assert service._graph(_request(), user) is on
        off = service._graph(_request(web_search=False), user)

    assert off is not on
    assert build.call_count == 2


def test_second_turn_after_an_anthropic_search_formats():
    from langchain_anthropic.chat_models import _format_messages
    from langchain_core.messages import AIMessage, HumanMessage

    searched = AIMessage(
        content=[
            {"type": "server_tool_use", "id": "srvtoolu_1", "name": "web_search", "input": {"query": "x"}},
            {
                "type": "web_search_tool_result",
                "tool_use_id": "srvtoolu_1",
                "content": [
                    {"type": "web_search_result", "url": "https://a.com", "title": "A", "encrypted_content": "e"}
                ],
            },
            {
                "type": "text",
                "text": "Answer",
                "citations": [
                    {"type": "web_search_result_location", "url": "https://a.com", "title": "A",
                     "cited_text": "c", "encrypted_index": "i"}
                ],
            },
        ]
    )

    _, formatted = _format_messages(
        [HumanMessage("q"), searched, HumanMessage("and then?")], model="claude-sonnet-5-5"
    )

    assert [block["type"] for block in formatted[1]["content"]] == [
        "server_tool_use",
        "web_search_tool_result",
        "text",
    ]


def test_second_turn_after_an_openai_search_formats():
    from langchain_core.messages import AIMessage, HumanMessage
    from langchain_openai import ChatOpenAI

    searched = AIMessage(
        content=[
            {"type": "web_search_call", "id": "ws_1", "status": "completed", "action": {"type": "search", "query": "x"}},
            {"type": "text", "text": "Answer", "id": "msg_1",
             "annotations": [{"type": "url_citation", "url": "https://b.com", "title": "B", "start_index": 0, "end_index": 1}]},
        ],
        response_metadata={"id": "resp_1"},
    )
    model = ChatOpenAI(model="gpt-5", api_key="x", use_responses_api=True)

    items = model._get_request_payload(
        [HumanMessage("q"), searched, HumanMessage("and then?")], tools=[{"type": "web_search"}]
    )["input"]

    assert [item["type"] for item in items] == ["message", "web_search_call", "message", "message"]


def _openai_payload(web_search: bool, effort: str | None):
    from app.features.langgraph.providers.openai_provider import create_openai_model
    from langchain_core.messages import HumanMessage

    user = SimpleNamespace(access_token="jwt", env_type=None, tenant_id=None, space_id=None)
    credential = {"data": {"ApiKey": "sk-test", "Url": "https://api.openai.com/v1"}}
    request = _request(
        provider="openai", model="gpt-5", credential_name="cred",
        web_search=web_search, reasoning_effort=effort,
    )
    with patch(
        "app.features.langgraph.providers.openai_provider.VaultCredentialManager"
    ) as manager:
        manager.return_value.get_vault_credential_secret_by_name.return_value = credential
        model = create_openai_model(request, user)
    return model._get_request_payload([HumanMessage("q")], tools=[{"type": "web_search"}])


def test_openai_effort_goes_to_the_responses_reasoning_param_when_search_is_on():
    payload = _openai_payload(web_search=True, effort="high")

    assert payload["reasoning"] == {"effort": "high"}
    assert "reasoning_effort" not in (payload.get("extra_body") or {})


def test_openai_effort_stays_in_extra_body_when_search_is_off():
    payload = _openai_payload(web_search=False, effort="high")

    assert payload["extra_body"] == {"reasoning_effort": "high"}


def _searched_turn(blocks):
    from langchain_core.messages import AIMessage, HumanMessage

    return [HumanMessage("q"), AIMessage(content=blocks), HumanMessage("and then?")]


def test_earlier_searched_turns_are_sent_as_plain_text():
    from app.features.langgraph.providers.web_search import without_search_blocks

    cited = {"type": "text", "text": "Answer",
             "citations": [{"type": "web_search_result_location", "url": "https://a.com"}]}
    for search_blocks in (
        [{"type": "server_tool_use", "id": "s", "name": "web_search", "input": {}},
         {"type": "web_search_tool_result", "tool_use_id": "s", "content": []}],
        [{"type": "reasoning", "id": "rs_1", "summary": []},
         {"type": "web_search_call", "id": "ws_1", "status": "completed"}],
    ):
        messages = without_search_blocks(_searched_turn([*search_blocks, cited]))

        assert messages[1].content == [{"type": "text", "text": "Answer"}]


def test_the_current_turns_search_blocks_are_kept_and_plain_turns_untouched():
    from langchain_core.messages import AIMessage, HumanMessage

    from app.features.langgraph.providers.web_search import without_search_blocks

    current = AIMessage(content=[{"type": "server_tool_use", "id": "s", "name": "web_search", "input": {}}])
    plain = AIMessage(content=[{"type": "text", "text": "hi", "annotations": []}])
    messages = [HumanMessage("a"), plain, HumanMessage("b"), current]

    assert without_search_blocks(messages) == messages
