"""Unit tests for the LLM provider v2 credential resolver.

These tests exercise `resolve_credentials` in isolation by mocking the
`VaultCredentialManager` so no outbound HTTP call to the .NET WorkspaceAPIs is made.
"""
from __future__ import annotations

from unittest.mock import patch

import pytest
from fastapi import HTTPException

from app.core.config import settings
from app.features.litellm.core.credit_utils import should_record_byok
from app.features.litellm.core.credentials import (
    is_byok,
    resolve_credential_name,
    resolve_credentials,
)
from app.features.litellm.core.schemas import LLMGenerationRequest


class _FakeUser:
    """Minimal stand-in for the authenticated user carrying a JWT."""

    def __init__(
        self,
        access_token: str = "fake-jwt",
        env_type: str = "dev",
        tenant_id: str | None = None,
        space_id: str | None = None,
    ):
        self.access_token = access_token
        self.env_type = env_type
        self.tenant_id = tenant_id
        self.space_id = space_id


def _credential_data(payload: dict) -> dict:
    """Wrap a decrypted Data payload the way VaultCredentialManager returns it."""
    return {"data": payload}


def test_blank_credential_returns_platform_credentials():
    """No credential (null or whitespace) must return platform credentials from settings."""
    for credential_name in (None, "", "   "):
        result = resolve_credentials("openai", credential_name, _FakeUser())
        assert result.kwargs.get("api_key") == settings.OPENAI_API_KEY
        assert result.kwargs.get("api_base") == settings.OPENAI_API_URL
        assert result.uses_platform_credentials is True


def test_blank_credential_never_requires_a_credential():
    """A request with no credential is the platform path, never an error."""
    result = resolve_credentials("openai", None, _FakeUser())
    assert result.uses_platform_credentials is True
    assert result.credential_name is None


def test_byok_gate_is_derived_from_credential_name_only():
    """BYOK is decided by the credential name alone; padding is ignored."""
    assert is_byok(None) is False
    assert is_byok("   ") is False
    assert is_byok("  abc  ") is True
    assert should_record_byok("  abc  ") is True
    assert should_record_byok("") is False


def test_credential_name_is_trimmed_before_vault_lookup():
    """A padded credential name is trimmed before the vault lookup and attribution."""
    with patch(
        "app.features.litellm.core.credentials.VaultCredentialManager"
    ) as mock_vault_cls:
        vault = mock_vault_cls.return_value
        vault.get_vault_credential_secret_by_name.return_value = _credential_data(
            {"ApiKey": "sk-test", "Url": "https://api.openai.com/v1"}
        )
        result = resolve_credentials("openai", "  00000000-0000-0000-0000-000000000001  ", _FakeUser())

    assert vault.get_vault_credential_secret_by_name.call_args.kwargs["credential"] == (
        "00000000-0000-0000-0000-000000000001"
    )
    assert result.credential_name == "00000000-0000-0000-0000-000000000001"


def test_resolve_credential_name_returns_display_name():
    """The vault display Name is used for attribution instead of the raw id."""
    with patch(
        "app.features.litellm.core.credentials.VaultCredentialManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_credential_secret_by_name.return_value = {
            "Name": "My OpenAI Key",
            "data": {"ApiKey": "sk-test"},
        }
        assert resolve_credential_name("abc", jwt="fake-jwt") == "My OpenAI Key"


def test_generation_request_ignores_removed_byok_flag():
    """The removed is_byok_enabled flag is accepted and dropped, credential alone decides BYOK."""
    request = LLMGenerationRequest(
        provider="openai",
        model="gpt-4o-mini",
        input="hi",
        is_byok_enabled=False,
    )
    assert is_byok(request.credential_name) is False
    assert not hasattr(request, "is_byok_enabled")


def test_removed_byok_flag_true_is_warned_on_generation_requests(caplog):
    """An old payload that asked for BYOK must leave a warning before running on platform keys."""
    with caplog.at_level("WARNING", logger="fastapi"):
        LLMGenerationRequest(
            provider="openai",
            model="gpt-4o-mini",
            input="hi",
            is_byok_enabled=True,
        )

    assert "ignoring removed is_byok_enabled" in caplog.text


def test_removed_byok_flag_true_is_warned_on_legacy_provider_requests(caplog):
    from app.features.llm_providers.llm_providers_schemas import LLMRequest

    with caplog.at_level("WARNING", logger="fastapi"):
        LLMRequest(
            provider="openai",
            model="gpt-4o-mini",
            input="hi",
            is_byok_enabled=True,
        )

    assert "ignoring removed is_byok_enabled" in caplog.text


def test_removed_byok_flag_false_does_not_warn(caplog):
    """A false flag is the platform path and stays silent."""
    with caplog.at_level("WARNING", logger="fastapi"):
        LLMGenerationRequest(
            provider="openai",
            model="gpt-4o-mini",
            input="hi",
            is_byok_enabled=False,
        )

    assert "ignoring removed" not in caplog.text


def test_byok_invalid_credentials_raises():
    """A missing/empty vault credential response must raise 400."""
    with patch(
        "app.features.litellm.core.credentials.VaultCredentialManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_credential_secret_by_name.return_value = None
        with pytest.raises(HTTPException) as exc:
            resolve_credentials("openai", "00000000-0000-0000-0000-000000000001", _FakeUser())
        assert exc.value.status_code == 400


def test_openai_maps_pascalcase_fields():
    """OpenAI-style provider maps ApiKey/Url/ApiVersion to api_key/api_base/api_version."""
    payload = {
        "ApiKey": "sk-test",
        "Url": "https://api.openai.com/v1",
        "ApiVersion": None,
    }
    with patch(
        "app.features.litellm.core.credentials.VaultCredentialManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_credential_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("openai", "00000000-0000-0000-0000-000000000001", _FakeUser())
    assert result.kwargs == {
        "api_key": "sk-test",
        "api_base": "https://api.openai.com/v1",
    }
    assert result.uses_platform_credentials is False


def test_groq_maps_url_to_api_base():
    """Groq is key-based: ApiKey -> api_key, Url -> api_base."""
    payload = {"ApiKey": "gsk-test", "Url": "https://api.groq.com/openai"}
    with patch(
        "app.features.litellm.core.credentials.VaultCredentialManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_credential_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("groq", "00000000-0000-0000-0000-000000000001", _FakeUser())
    assert result.kwargs == {
        "api_key": "gsk-test",
        "api_base": "https://api.groq.com/openai",
    }
    assert result.uses_platform_credentials is False


def test_mistral_maps_url_to_api_base():
    """Mistral is key-based: ApiKey -> api_key, Url -> api_base."""
    payload = {"ApiKey": "mistral-test", "Url": "https://api.mistral.ai/v1"}
    with patch(
        "app.features.litellm.core.credentials.VaultCredentialManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_credential_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("mistral", "00000000-0000-0000-0000-000000000001", _FakeUser())
    assert result.kwargs == {
        "api_key": "mistral-test",
        "api_base": "https://api.mistral.ai/v1",
    }
    assert result.uses_platform_credentials is False


def test_bedrock_maps_aws_fields_and_no_api_key():
    """Bedrock must map AWS fields and must NOT set api_key."""
    payload = {
        "AccessKeyId": "AKIA-test",
        "SecretAccessKey": "secret",
        "Region": "us-east-1",
        "SessionToken": "session-token",
    }
    with patch(
        "app.features.litellm.core.credentials.VaultCredentialManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_credential_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("bedrock", "00000000-0000-0000-0000-000000000001", _FakeUser())
    assert result.kwargs == {
        "aws_access_key_id": "AKIA-test",
        "aws_secret_access_key": "secret",
        "aws_region_name": "us-east-1",
        "aws_session_token": "session-token",
    }
    assert "api_key" not in result.kwargs
    assert result.uses_platform_credentials is False


def test_bedrock_omits_session_token_when_absent():
    """Bedrock without a session token must omit aws_session_token."""
    payload = {
        "AccessKeyId": "AKIA-test",
        "SecretAccessKey": "secret",
        "Region": "us-east-1",
        "SessionToken": "",
    }
    with patch(
        "app.features.litellm.core.credentials.VaultCredentialManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_credential_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("bedrock", "00000000-0000-0000-0000-000000000001", _FakeUser())
    assert result.kwargs == {
        "aws_access_key_id": "AKIA-test",
        "aws_secret_access_key": "secret",
        "aws_region_name": "us-east-1",
    }
    assert "aws_session_token" not in result.kwargs
    assert result.uses_platform_credentials is False


def test_host_fallback_for_api_base():
    """Providers that expose Host (e.g. Gemini) fall back to Host for api_base."""
    payload = {"ApiKey": "gemini-test", "Host": "https://generativelanguage.googleapis.com"}
    with patch(
        "app.features.litellm.core.credentials.VaultCredentialManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_credential_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("gemini", "00000000-0000-0000-0000-000000000001", _FakeUser())
    assert result.kwargs == {
        "api_key": "gemini-test",
        "api_base": "https://generativelanguage.googleapis.com",
    }
    assert result.uses_platform_credentials is False


def test_vertex_maps_service_account_fields():
    """Vertex AI maps ProjectId/Location/ServiceAccountJson to vertex_* kwargs."""
    payload = {
        "ProjectId": "my-project",
        "Location": "us-central1",
        "ServiceAccountJson": '{"type":"service_account"}',
    }
    with patch(
        "app.features.litellm.core.credentials.VaultCredentialManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_credential_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("vertex_ai", "00000000-0000-0000-0000-000000000001", _FakeUser())
    assert result.kwargs == {
        "vertex_project": "my-project",
        "vertex_location": "us-central1",
        "vertex_credentials": '{"type":"service_account"}',
    }
    assert "api_key" not in result.kwargs
    assert result.uses_platform_credentials is False


def test_azure_maps_endpoint_and_version():
    """Azure maps ApiKey/Endpoint/ApiVersion to api_key/api_base/api_version."""
    payload = {
        "ApiKey": "az-key",
        "Endpoint": "https://my-resource.openai.azure.com",
        "ApiVersion": "2024-06-01",
    }
    with patch(
        "app.features.litellm.core.credentials.VaultCredentialManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_credential_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("azure", "00000000-0000-0000-0000-000000000001", _FakeUser())
    assert result.kwargs == {
        "api_key": "az-key",
        "api_base": "https://my-resource.openai.azure.com",
        "api_version": "2024-06-01",
    }
    assert result.uses_platform_credentials is False


def test_watsonx_maps_project_and_region():
    """WatsonX maps ApiKey/ProjectId/Region to watsonx_* kwargs."""
    payload = {
        "ApiKey": "wx-key",
        "ProjectId": "proj-123",
        "Region": "us-south",
    }
    with patch(
        "app.features.litellm.core.credentials.VaultCredentialManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_credential_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("watsonx", "00000000-0000-0000-0000-000000000001", _FakeUser())
    assert result.kwargs == {
        "api_key": "wx-key",
        "watsonx_project_id": "proj-123",
        "watsonx_region": "us-south",
    }
    assert result.uses_platform_credentials is False
