"""Claude models that take Anthropic's effort setting get adaptive thinking at the chosen effort."""

from types import SimpleNamespace
from unittest.mock import patch

import pytest

from app.features.langgraph.providers.anthropic_provider import (
    anthropic_effort_kwargs,
    create_anthropic_model,
    supports_anthropic_effort,
)


@pytest.mark.parametrize(
    ("model", "expected"),
    [
        ("claude-opus-4-6", True),
        ("claude-sonnet-4-6", True),
        ("claude-opus-4-8", True),
        ("claude-sonnet-5", True),
        ("claude-fable-5", True),
        ("claude-mythos-5", True),
        ("claude-haiku-5-5", True),
        ("claude-4.6-sonnet", True),
        ("anthropic/claude-opus-4-7", True),
        ("claude-opus-4-10", True),
        ("Claude-Sonnet-4-6-20260101", True),
        ("claude-haiku-4-5", False),
        ("claude-haiku-4-5-20251001", False),
        ("claude-opus-4-5", False),
        ("claude-3-7-sonnet", False),
        ("gpt-5", False),
        ("", False),
    ],
)
def test_supports_anthropic_effort(model, expected):
    assert supports_anthropic_effort(model) is expected


def test_effort_kwargs_for_supported_model():
    assert anthropic_effort_kwargs("claude-opus-4-8", "high") == {
        "thinking": {"type": "adaptive"},
        "output_config": {"effort": "high"},
    }


def test_no_kwargs_without_effort():
    assert anthropic_effort_kwargs("claude-opus-4-8", None) == {}


def test_no_kwargs_for_unsupported_model():
    assert anthropic_effort_kwargs("claude-haiku-4-5", "high") == {}


def _request_payload(
    model: str, reasoning_effort: str | None, action: str = "LandingChat"
) -> dict:
    llm_request = SimpleNamespace(
        action=action,
        credential_name="cred",
        model=model,
        temperature=1.0,
        top_p=1.0,
        max_output_tokens=4096,
        reasoning_effort=reasoning_effort,
    )
    user = SimpleNamespace(access_token="jwt", env_type=None, tenant_id=None, space_id=None)
    credential = {"data": {"ApiKey": "sk-test", "Url": "https://api.anthropic.com/v1"}}
    with patch(
        "app.features.langgraph.providers.anthropic_provider.VaultCredentialManager"
    ) as manager:
        manager.return_value.get_vault_credential_secret_by_name.return_value = credential
        chat_model = create_anthropic_model(llm_request, user)
    payload = chat_model._get_request_payload([("user", "hi")])
    return {**payload, **(payload.get("extra_body") or {})}


def test_request_carries_adaptive_thinking_and_effort():
    sent = _request_payload("anthropic/claude-opus-4-8", "medium")
    assert sent["thinking"] == {"type": "adaptive"}
    assert sent["output_config"] == {"effort": "medium"}
    assert "budget_tokens" not in sent["thinking"]


def test_agent_request_keeps_its_stored_effort_off_claude():
    sent = _request_payload("anthropic/claude-opus-4-8", "medium", action="AgentExecution")
    assert "thinking" not in sent
    assert "output_config" not in sent


def test_request_without_effort_has_no_thinking():
    sent = _request_payload("anthropic/claude-opus-4-8", None)
    assert "thinking" not in sent
    assert "output_config" not in sent


def test_changing_effort_mid_conversation_rebuilds_the_graph():
    from app.features.langgraph.services.chat_service import ChatService
    from app.features.langgraph.skills.skill_registry import SkillRegistry
    from app.features.langgraph.tools.tool_registry import ToolRegistry
    from app.features.llm_providers.llm_providers_schemas import LLMRequest

    service = ChatService(ToolRegistry(), SkillRegistry(), conversation_service=None)
    user = SimpleNamespace(access_token="jwt", env_type=None, tenant_id=None, space_id=None)

    def request(effort: str | None) -> LLMRequest:
        return LLMRequest(
            provider="anthropic",
            model="claude-opus-4-8",
            input="hi",
            conversation_id="c1",
            reasoning_effort=effort,
        )

    with patch(
        "app.features.langgraph.services.chat_service.build_chat_graph",
        side_effect=lambda **kwargs: object(),
    ) as build:
        low = service._graph(request("low"), user)
        assert service._graph(request("low"), user) is low
        high = service._graph(request("high"), user)

    assert high is not low
    assert build.call_count == 2
