"""LangGraph chat credit branch tests: credential decides BYOK vs platform.

Run from ``apis/llmpipeline``:

    python -m pytest tests/test_chat_credit_branch.py -q
"""

from __future__ import annotations

import time

import pytest
from langchain_core.messages import AIMessage

import app.features.langgraph.services.chat_service as chat_service_module
from app.features.langgraph.services.chat_service import ChatService
from app.features.langgraph.skills.skill_registry import SkillRegistry
from app.features.langgraph.tools.tool_registry import ToolRegistry
from app.features.llm_providers.llm_providers_schemas import LLMRequest


class _Recorder:
    def __init__(self) -> None:
        self.calls: list[tuple[str, dict]] = []

    def post_usage(self, **kwargs) -> None:
        self.calls.append(("platform", kwargs))

    def post_byok_usage(self, **kwargs) -> None:
        self.calls.append(("byok", kwargs))


@pytest.fixture(autouse=True)
def _stub_fixed_credits(monkeypatch):
    monkeypatch.setattr(
        chat_service_module, "agent_has_fixed_credits", lambda *_args: False
    )


def _request(**overrides) -> LLMRequest:
    values = {
        "provider": "openai",
        "model": "gpt-4o-mini",
        "input": "hi",
        "ref_type": "Agent",
        "ref_id": "agent-1",
        "ref_name": "Support Agent",
        "action": "AgentExecution",
    }
    values.update(overrides)
    return LLMRequest(**values)


def _final_response(recorder: _Recorder, request: LLMRequest):
    service = ChatService(
        ToolRegistry(),
        SkillRegistry(),
        conversation_service=None,
        credit_usage_service=recorder,
    )
    response = service._create_initial_response(request)
    graph_response = AIMessage(
        content="hello",
        usage_metadata={"input_tokens": 5, "output_tokens": 3, "total_tokens": 8},
    )
    return service._create_final_response(
        request=request,
        response=response,
        graph_response=graph_response,
        start_time=time.perf_counter(),
        jwt="jwt",
        space_id="space-1",
    )


def test_blank_credential_posts_platform_usage():
    recorder = _Recorder()

    _final_response(recorder, _request())

    assert [kind for kind, _ in recorder.calls] == ["platform"]


def test_named_credential_posts_byok_usage():
    recorder = _Recorder()

    _final_response(recorder, _request(credential_name="chat-key"))

    assert [kind for kind, _ in recorder.calls] == ["byok"]


def test_fixed_credits_suppress_platform_usage(monkeypatch):
    monkeypatch.setattr(
        chat_service_module, "agent_has_fixed_credits", lambda *_args: True
    )
    recorder = _Recorder()

    _final_response(recorder, _request())

    assert recorder.calls == []


def test_fixed_credits_do_not_suppress_byok_usage(monkeypatch):
    monkeypatch.setattr(
        chat_service_module, "agent_has_fixed_credits", lambda *_args: True
    )
    recorder = _Recorder()

    _final_response(recorder, _request(credential_name="chat-key"))

    assert [kind for kind, _ in recorder.calls] == ["byok"]


def test_no_credit_service_posts_nothing():
    request = _request()
    service = ChatService(
        ToolRegistry(),
        SkillRegistry(),
        conversation_service=None,
        credit_usage_service=None,
    )
    response = service._create_initial_response(request)

    result = service._create_final_response(
        request=request,
        response=response,
        graph_response=AIMessage(
            content="hello",
            usage_metadata={"input_tokens": 5, "output_tokens": 3, "total_tokens": 8},
        ),
        start_time=time.perf_counter(),
        jwt="jwt",
        space_id="space-1",
    )

    assert result.output == "hello"
