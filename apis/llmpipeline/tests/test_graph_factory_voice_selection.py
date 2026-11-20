"""Voice pipeline turns use the same per-message tool/skill planner as chat.

The realtime bridge has no planner and binds every configured capability. The
pipeline turn runs the chat graph, so it must not short-circuit the selector.
"""

import asyncio
from uuid import uuid4

from app.features.auth.authenticated_user import User
from app.features.langgraph.graphs import graph_factory
from app.features.langgraph.services.tool_skill_selector import (
    ToolSkillSelectionResponse,
)
from app.features.langgraph.skills.skill_registry import SkillRegistry
from app.features.langgraph.tools.tool_registry import ToolRegistry
from app.features.llm_providers.llm_providers_schemas import LLMRequest


def _voice_request(input_text: str) -> LLMRequest:
    return LLMRequest(
        provider="openai",
        model="gpt-4o",
        input=input_text,
        is_voice_agent=True,
        channel="voice",
    )


def _select(monkeypatch, request: LLMRequest, reply: ToolSkillSelectionResponse):
    calls = []

    async def fake_selection(**kwargs):
        calls.append(kwargs)
        return reply

    monkeypatch.setattr(graph_factory, "select_tools_and_skills", fake_selection)

    user = User(
        user_id=uuid4(),
        username="u",
        roles=["r"],
        tenant_id=uuid4(),
        access_token="x",
    )
    selector = graph_factory._create_agent_selector_node(
        model=None,
        tool_registry=ToolRegistry(),
        skill_registry=SkillRegistry(),
        request=request,
        user=user,
        explicit_tool_names=["email_send", "email_delete"],
        explicit_skill_names=None,
    )

    async def run():
        return await selector(
            {"metadata": {"request": request, "user": user}, "messages": []}
        )

    return calls, asyncio.run(run())


def test_voice_turn_uses_the_per_message_planner(monkeypatch):
    calls, result = _select(
        monkeypatch,
        _voice_request("email the invoice"),
        ToolSkillSelectionResponse(tool_names=["email_send"], skill_names=[]),
    )

    assert calls, "voice turns must run the same planner as chat"
    assert result["metadata"]["selected_tool_names"] == ["email_send"]
    assert result["metadata"]["selected_skills"] == []


def test_voice_text_turn_binds_nothing_when_the_planner_selects_nothing(monkeypatch):
    calls, result = _select(
        monkeypatch,
        _voice_request("how are you?"),
        ToolSkillSelectionResponse(tool_names=[], skill_names=[]),
    )

    assert calls
    assert result["metadata"]["selected_tool_names"] is None
    assert result["metadata"]["selected_skills"] == []
