"""Model IDs from the OpenRouter-style catalog must map to valid direct Anthropic API IDs."""

import pytest

from app.features.langgraph.providers.anthropic_provider import normalize_anthropic_model_id


@pytest.mark.parametrize(
    ("model", "expected"),
    [
        ("anthropic/claude-4.5-haiku-20251001", "claude-haiku-4-5-20251001"),
        ("claude-4.5-haiku-20251001", "claude-haiku-4-5-20251001"),
        ("claude-4.5-sonnet-20250929", "claude-sonnet-4-5-20250929"),
        ("claude-haiku-4-5-20251001", "claude-haiku-4-5-20251001"),
        ("claude-sonnet-5-5", "claude-sonnet-5-5"),
        ("claude-opus-4-7", "claude-opus-4-7"),
    ],
)
def test_normalizes_catalog_ids_to_direct_api_ids(model, expected):
    assert normalize_anthropic_model_id(model) == expected


from app.features.langgraph.providers.anthropic_provider import normalize_anthropic_base_url


@pytest.mark.parametrize(
    ("url", "expected"),
    [
        ("https://api.anthropic.com/v1", "https://api.anthropic.com"),
        ("https://api.anthropic.com/v1/", "https://api.anthropic.com"),
        ("https://api.anthropic.com", "https://api.anthropic.com"),
        ("https://proxy.example.com/anthropic/v1", "https://proxy.example.com/anthropic"),
    ],
)
def test_strips_v1_because_sdk_appends_v1_messages(url, expected):
    assert normalize_anthropic_base_url(url) == expected


from types import SimpleNamespace
from unittest.mock import patch

from app.features.langgraph.providers.anthropic_provider import create_anthropic_model


def test_omits_sampling_params_because_api_version_2026_10_21_rejects_them():
    llm_request = SimpleNamespace(
        is_byok_enabled=True,
        credential_name="cred",
        model="anthropic/claude-4.5-haiku-20251001",
        temperature=1.0,
        top_p=1.0,
        max_output_tokens=1024,
    )
    user = SimpleNamespace(access_token="jwt", env_type=None, tenant_id=None, space_id=None)
    credential = {"data": {"ApiKey": "sk-test", "Url": "https://api.anthropic.com/v1"}}

    with patch(
        "app.features.langgraph.providers.anthropic_provider.VaultCredentialManager"
    ) as manager:
        manager.return_value.get_vault_credential_secret_by_name.return_value = credential
        model = create_anthropic_model(llm_request, user)

    payload = model._get_request_payload([("user", "hi")])
    sent = {**payload, **(payload.get("extra_body") or {})}
    assert "temperature" not in sent
    assert "top_p" not in sent
