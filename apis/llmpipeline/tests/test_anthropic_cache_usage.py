"""Anthropic cache-usage tests: cache creation is carried and billed.

Run from ``apis/llmpipeline``:

    python -m pytest tests/test_anthropic_cache_usage.py -q
"""

from __future__ import annotations

import pytest

import app.features.llm_providers.llm_providers_anthropic as anthropic_module
from app.features.llm_providers.llm_providers_schemas import LLMRequest, LLMResponse


@pytest.fixture(autouse=True)
def _stub_attribution(monkeypatch):
    monkeypatch.setattr(
        anthropic_module, "resolve_credential_name", lambda *_args, **_kwargs: "My Key"
    )
    monkeypatch.setattr(anthropic_module, "agent_has_fixed_credits", lambda *_args: False)

    class _NoopByokManager:
        def post_byok_usage(self, **_kwargs):
            return None

    monkeypatch.setattr(anthropic_module, "ByokUsageManager", _NoopByokManager)


@pytest.fixture
def provider():
    return anthropic_module.AnthropicProvider(
        api_url="https://api.anthropic.com/v1",
        api_key="test-key",
        anthropic_version="2023-06-01",
    )


def _request(**overrides) -> LLMRequest:
    values = {
        "provider": "anthropic",
        "model": "claude-4.5-sonnet",
        "input": "hi",
        "ref_type": "Agent",
        "ref_id": "agent-1",
        "ref_name": "Support Agent",
        "action": "AgentExecution",
    }
    values.update(overrides)
    return LLMRequest(**values)


def _usage_response(provider) -> LLMResponse:
    response_data = {
        "usage": {
            "input_tokens": 10,
            "output_tokens": 5,
            "cache_read_input_tokens": 3,
            "cache_creation_input_tokens": 4,
        },
        "stop_reason": "end_turn",
    }
    request = _request(credential_name="anthropic-key")
    default = provider._create_initial_llm_response_with_defaults(request)
    return provider._create_final_llm_response(
        request, default, 0.0, "out", "jwt", response_data, "space-1"
    )


def test_cache_creation_tokens_are_carried_on_the_response(provider):
    response = _usage_response(provider)

    assert response.input_cached_tokens == 3
    assert response.cache_write_tokens == 4


def test_byok_usage_records_cache_reads_and_writes(provider):
    request = _request(credential_name="anthropic-key")
    response = _usage_response(provider)

    entries = provider._build_anthropic_byok_usage(request, response, "space-1", "jwt")

    assert [entry["ServiceType"] for entry in entries] == [
        "CustomInputService",
        "CustomOutputService",
        "CustomCacheReadService",
        "CustomCacheWriteService",
    ]
    assert [entry["ConsumedUnit"] for entry in entries] == [10, 5, 3, 4]


def test_platform_usage_records_cache_writes(provider):
    request = _request()
    response = LLMResponse(provider="anthropic", model="claude-4.5-sonnet", output="out")
    response.input_tokens = 10
    response.output_tokens = 5
    response.input_cached_tokens = 3
    response.cache_write_tokens = 4

    entries = provider._build_anthropic_credit_usage(request, response, "space-1")

    assert [entry["ServiceType"] for entry in entries] == [
        "CustomInputService",
        "CustomOutputService",
        "CustomCacheReadService",
        "CustomCacheWriteService",
    ]
    assert [entry["SpaceId"] for entry in entries] == ["space-1"] * 4


def test_zero_cache_tokens_add_no_cache_entries(provider):
    request = _request()
    response = LLMResponse(provider="anthropic", model="claude-4.5-sonnet", output="out")
    response.input_tokens = 10

    entries = provider._build_anthropic_credit_usage(request, response)

    assert [entry["ServiceType"] for entry in entries] == ["CustomInputService"]
