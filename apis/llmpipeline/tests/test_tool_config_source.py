"""Tool-config source markers and platform resolution.

``ToolConfig.source`` is optional (absent tries the custom store first, then
enabled platform tools) and rejects unknown values at request validation.
Resolved platform entries are rewritten to the plugin root so existing Corsair
expansion and binding rules apply.

Run from ``apis/llmpipeline``:

    ENV=local ./venv/Scripts/python.exe -m pytest tests/test_tool_config_source.py -q
"""

import asyncio
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from app.features.langgraph.graphs.graph_factory import (
    _build_corsair_tools_for_names,
    _resolve_tools,
)
from app.features.langgraph.services.chat_service import ChatService
from app.features.langgraph.services.tool_skill_selector import (
    _build_corsair_catalog_entries,
)
from app.features.langgraph.skills.skill_registry import SkillRegistry
from app.features.langgraph.tools.tool_config_utils import (
    configured_tool_roots,
    expand_tool_config,
    platform_candidate_entries,
    tool_source,
)
from app.features.langgraph.tools.tool_registry import ToolRegistry
from app.features.llm_providers.llm_providers_schemas import (
    LLMRequest,
    ToolAction,
    ToolConfig,
)


def _config(tool, action="chat.postMessage", source=None):
    return {
        "tool": tool,
        "actions": [{"action": action, "approval": "auto"}],
        "source": source,
    }


def _request(tool_config):
    return LLMRequest(
        provider="openai",
        model="gpt-4o",
        input="post a message",
        tool_config=tool_config,
    )


# ---------------------------------------------------------------------------
# Wire contract
# ---------------------------------------------------------------------------


def test_source_defaults_to_absent_and_means_custom():
    config = ToolConfig(
        tool="outlook",
        actions=[ToolAction(action="send_email", approval="auto")],
    )

    assert config.source is None
    assert tool_source(config) == "custom"


def test_unknown_source_is_rejected_at_validation():
    with pytest.raises(ValidationError):
        ToolConfig(
            tool="slack",
            source="library",
            actions=[ToolAction(action="chat.postMessage", approval="auto")],
        )


def test_both_sources_are_accepted():
    platform = ToolConfig(tool="slack", source="platform", actions=[])
    custom = ToolConfig(tool="outlook", source="custom", actions=[])

    assert (tool_source(platform), tool_source(custom)) == ("platform", "custom")


def test_platform_candidates_include_unmarked_and_platform_entries():
    unmarked = _config("outlook")
    platform = ToolConfig(tool="slack", source="platform", actions=[])
    explicit_custom = ToolConfig(tool="gmail", source="custom", actions=[])

    assert platform_candidate_entries([unmarked, platform, explicit_custom]) == [
        unmarked,
        platform,
    ]


def test_configured_roots_can_exclude_the_platform_source():
    configs = [
        ToolConfig(tool="outlook", actions=[]),
        ToolConfig(tool="slack", source="platform", actions=[]),
    ]

    assert configured_tool_roots(configs) == ["outlook", "slack"]
    assert configured_tool_roots(configs, exclude_source="platform") == ["outlook"]


def test_expansion_is_unchanged_for_unmarked_entries():
    configs = [
        ToolConfig(
            tool="outlook",
            actions=[ToolAction(action="send_email", approval="auto")],
        ),
        ToolConfig(
            tool="openai",
            actions=[ToolAction(action="openai.models.list", approval="auto")],
        ),
    ]

    assert expand_tool_config(configs) == [
        "outlook_send_email",
        "openai.api.models.list",
    ]


# ---------------------------------------------------------------------------
# Binding and planner catalog
# ---------------------------------------------------------------------------


def _patch_sidecar(monkeypatch, module_path="app.features.llm_providers.services.corsair_sidecar_service"):
    calls = []

    async def fake_fetch(configs):
        calls.append(configs)
        plugin = configs[0]["tool"]
        action = configs[0]["actions"][0]["action"]
        return [
            {
                "name": f"{plugin}.{action}",
                "description": "post",
            }
        ]

    monkeypatch.setattr(f"{module_path}.fetch_corsair_schemas", fake_fetch)
    monkeypatch.setattr(
        "app.features.langgraph.tools.corsair.corsair_tool_factory.build_corsair_tools_from_schemas",
        lambda schemas: schemas,
    )
    return calls


def test_binding_keeps_configured_corsair_plugin(monkeypatch):
    calls = _patch_sidecar(monkeypatch)
    request = _request([_config("Slack", "slack.chat.postMessage")])

    tools = asyncio.run(
        _build_corsair_tools_for_names(
            ["slack.api.chat.postMessage"],
            request,
        )
    )

    assert [tool["name"] for tool in tools] == ["slack.api.chat.postMessage"]
    assert calls


def test_custom_and_platform_tools_bind_together(monkeypatch):
    _patch_sidecar(monkeypatch)
    custom_entry = _config("outlook", "send_email")
    platform_entry = _config("Slack", "slack.chat.postMessage")
    # The platform loader rewrites a resolved entry's tool to the plugin root.
    platform_entry["tool"] = "slack"
    request = _request([custom_entry, platform_entry])

    custom_tool = SimpleNamespace(name="outlook_send_email")
    tool_registry = ToolRegistry()
    tool_registry.register(custom_tool)

    names = expand_tool_config(request.tool_config)
    assert names == ["outlook_send_email", "slack.api.chat.postMessage"]

    tools = asyncio.run(
        _resolve_tools(
            tool_registry,
            names,
            request,
        )
    )

    assert tools[0] is custom_tool
    assert tools[1]["name"] == "slack.api.chat.postMessage"


def test_registered_custom_tool_wins_a_dotted_name(monkeypatch):
    calls = _patch_sidecar(monkeypatch)
    request = _request([_config("Slack", "chat.postMessage")])

    custom_tool = SimpleNamespace(name="Slack_chat.postMessage")
    tool_registry = ToolRegistry()
    tool_registry.register(custom_tool)

    tools = asyncio.run(
        _resolve_tools(tool_registry, ["slack_chat.postMessage"], request)
    )

    assert tools == [custom_tool]
    assert not calls


def test_registered_custom_tool_matches_case_insensitively():
    custom_tool = SimpleNamespace(name="outlook_send_email")
    tool_registry = ToolRegistry()
    tool_registry.register(custom_tool)

    assert tool_registry.get("Outlook_Send_Email") is custom_tool


def test_catalog_entries_include_configured_plugin(monkeypatch):
    _patch_sidecar(monkeypatch, "app.features.langgraph.services.tool_skill_selector")

    entries = asyncio.run(
        _build_corsair_catalog_entries(
            ["github.api.issues.list"],
        )
    )

    assert [entry["name"] for entry in entries] == ["github.api.issues.list"]


# ---------------------------------------------------------------------------
# Chat wiring: fail closed
# ---------------------------------------------------------------------------


def test_platform_resolution_failure_withholds_entries(monkeypatch):
    service = ChatService(ToolRegistry(), SkillRegistry(), conversation_service=None)
    entry = ToolConfig(tool="slack", source="platform", actions=[])
    request = _request([entry])

    async def failing_resolver(**kwargs):
        raise RuntimeError("db down")

    monkeypatch.setattr(
        "app.features.langgraph.services.chat_service.resolve_platform_tools",
        failing_resolver,
    )

    asyncio.run(service._load_platform_tools(request, _user(), object(), set()))

    assert entry.tool == ""


def test_unmarked_entry_is_resolved_as_a_platform_candidate(monkeypatch):
    service = ChatService(ToolRegistry(), SkillRegistry(), conversation_service=None)
    entry = ToolConfig(tool="Slack", actions=[])
    request = _request([entry])
    calls = []

    async def resolving(**kwargs):
        calls.append(kwargs)
        entry.tool = "slack"

    monkeypatch.setattr(
        "app.features.langgraph.services.chat_service.resolve_platform_tools",
        resolving,
    )

    asyncio.run(service._load_platform_tools(request, _user(), object(), set()))

    assert calls[0]["platform_entries"] == [entry]
    assert entry.tool == "slack"


def test_resolution_failure_leaves_unmarked_entry_for_the_custom_store(monkeypatch):
    service = ChatService(ToolRegistry(), SkillRegistry(), conversation_service=None)
    entry = ToolConfig(tool="Slack", actions=[])
    request = _request([entry])

    async def failing_resolver(**kwargs):
        raise RuntimeError("db down")

    monkeypatch.setattr(
        "app.features.langgraph.services.chat_service.resolve_platform_tools",
        failing_resolver,
    )

    asyncio.run(service._load_platform_tools(request, _user(), object(), set()))

    assert entry.tool == "Slack"


def _user():
    from uuid import UUID

    from app.features.auth.authenticated_user import User

    return User(
        user_id="69de1a13-3779-4933-a46f-01c813502f86",
        username="admin@aventisia.com",
        tenant_id=UUID("b2aaa86e-a637-4b28-9128-367cab0669cc"),
        roles=[],
    )
