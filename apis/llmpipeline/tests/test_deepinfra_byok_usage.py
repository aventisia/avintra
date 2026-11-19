"""DeepInfra BYOK usage tests: zero-token responses must not post rows.

Run from ``apis/llmpipeline``:

    python -m pytest tests/test_deepinfra_byok_usage.py -q
"""

from __future__ import annotations

import pytest

import app.features.llm_providers.llm_providers_deepinfra as deepinfra_module
from app.features.llm_providers.llm_providers_schemas import LLMRequest


@pytest.fixture(autouse=True)
def _stub_display_name(monkeypatch):
    monkeypatch.setattr(
        deepinfra_module, "resolve_credential_name", lambda *_args, **_kwargs: "My Key"
    )

    class _NoopByokManager:
        def post_byok_usage(self, **_kwargs):
            return None

    monkeypatch.setattr(deepinfra_module, "ByokUsageManager", _NoopByokManager)


@pytest.fixture
def provider():
    return deepinfra_module.DeepInfraProvider(
        api_url="https://api.deepinfra.com/v1/openai/chat/completions",
        api_key="test-key",
    )


def _request(**overrides) -> LLMRequest:
    values = {
        "provider": "deepinfra",
        "model": "meta-llama/Meta-Llama-3.1-8B-Instruct",
        "input": "hi",
        "credential_name": "deepinfra-key",
        "ref_type": "Agent",
        "ref_id": "agent-1",
        "ref_name": "Support Agent",
        "action": "AgentExecution",
    }
    values.update(overrides)
    return LLMRequest(**values)


def _final_response(provider, request, *, prompt_tokens: int, completion_tokens: int):
    default = provider._create_initial_llm_response_with_defaults(request)
    response_data = {
        "usage": {"prompt_tokens": prompt_tokens, "completion_tokens": completion_tokens},
        "choices": [{"finish_reason": "stop"}],
    }
    return provider._create_final_llm_response(
        request, default, 0.0, "output", "jwt", response_data, "space-1"
    )


def test_zero_tokens_build_no_entries(provider):
    request = _request()

    entries = provider._build_deepinfra_byok_usage(
        request, _final_response(provider, request, prompt_tokens=0, completion_tokens=0), "space-1", "jwt"
    )

    assert entries == []


def test_token_usage_builds_one_entry_per_billable_service(provider):
    request = _request()

    entries = provider._build_deepinfra_byok_usage(
        request, _final_response(provider, request, prompt_tokens=12, completion_tokens=7), "space-1", "jwt"
    )

    assert [entry["ServiceType"] for entry in entries] == [
        "CustomInputService",
        "CustomOutputService",
    ]
    assert [entry["ConsumedUnit"] for entry in entries] == [12, 7]
    assert all(entry["CredentialName"] == "My Key" for entry in entries)
    assert all(entry["SpaceId"] == "space-1" for entry in entries)


def test_zero_token_byok_call_posts_nothing(provider, monkeypatch):
    posted: list[dict] = []

    class _FakeByokManager:
        def post_byok_usage(self, **kwargs):
            posted.append(kwargs)

    monkeypatch.setattr(deepinfra_module, "ByokUsageManager", _FakeByokManager)

    _final_response(provider, _request(), prompt_tokens=0, completion_tokens=0)

    assert posted == []


def test_token_byok_call_posts_both_entries(provider, monkeypatch):
    posted: list[dict] = []

    class _FakeByokManager:
        def post_byok_usage(self, **kwargs):
            posted.append(kwargs)

    monkeypatch.setattr(deepinfra_module, "ByokUsageManager", _FakeByokManager)

    _final_response(provider, _request(), prompt_tokens=12, completion_tokens=7)

    [call] = posted
    assert call["task"] == "deepinfra"
    assert [entry["ConsumedUnit"] for entry in call["request"]] == [12, 7]
