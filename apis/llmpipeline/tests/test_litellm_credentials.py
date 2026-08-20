"""Unit tests for the LLM provider v2 credential resolver.

These tests exercise `resolve_credentials` in isolation by mocking the
`VaultManager` so no outbound HTTP call to the .NET WorkspaceAPIs is made.
"""
from __future__ import annotations

from unittest.mock import patch

import pytest
from fastapi import HTTPException

from app.features.litellm.core.credentials import resolve_credentials


class _FakeUser:
    """Minimal stand-in for the authenticated user carrying a JWT."""

    def __init__(self, access_token: str = "fake-jwt", env_type: str = "dev"):
        self.access_token = access_token
        self.env_type = env_type


def _credential_data(payload: dict) -> dict:
    """Wrap a decrypted Data payload the way VaultManager returns it."""
    return {"data": payload}


def test_non_byok_returns_platform_credentials():
    """BYOK disabled must return platform credentials from settings."""
    result = resolve_credentials("openai", False, None, _FakeUser())
    assert result.kwargs.get("api_key") == settings.OPENAI_API_KEY
    assert result.kwargs.get("api_base") == settings.OPENAI_API_URL
    assert result.uses_platform_credentials is True


def test_byok_requires_credential_id():
    """BYOK enabled without a credential_id must raise 400."""
    with pytest.raises(HTTPException) as exc:
        resolve_credentials("openai", True, None, _FakeUser())
    assert exc.value.status_code == 400


def test_byok_invalid_credentials_raises():
    """A missing/empty vault response must raise 400."""
    with patch(
        "app.features.litellm.core.credentials.VaultManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_secret_by_name.return_value = None
        with pytest.raises(HTTPException) as exc:
            resolve_credentials("openai", True, "00000000-0000-0000-0000-000000000001", _FakeUser())
        assert exc.value.status_code == 400


def test_openai_maps_pascalcase_fields():
    """OpenAI-style provider maps ApiKey/Url/ApiVersion to api_key/api_base/api_version."""
    payload = {
        "ApiKey": "sk-test",
        "Url": "https://api.openai.com/v1",
        "ApiVersion": None,
    }
    with patch(
        "app.features.litellm.core.credentials.VaultManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("openai", True, "00000000-0000-0000-0000-000000000001", _FakeUser())
    assert result.kwargs == {
        "api_key": "sk-test",
        "api_base": "https://api.openai.com/v1",
    }
    assert result.uses_platform_credentials is False


def test_groq_maps_url_to_api_base():
    """Groq is key-based: ApiKey -> api_key, Url -> api_base."""
    payload = {"ApiKey": "gsk-test", "Url": "https://api.groq.com/openai"}
    with patch(
        "app.features.litellm.core.credentials.VaultManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("groq", True, "00000000-0000-0000-0000-000000000001", _FakeUser())
    assert result.kwargs == {
        "api_key": "gsk-test",
        "api_base": "https://api.groq.com/openai",
    }
    assert result.uses_platform_credentials is False


def test_mistral_maps_url_to_api_base():
    """Mistral is key-based: ApiKey -> api_key, Url -> api_base."""
    payload = {"ApiKey": "mistral-test", "Url": "https://api.mistral.ai/v1"}
    with patch(
        "app.features.litellm.core.credentials.VaultManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("mistral", True, "00000000-0000-0000-0000-000000000001", _FakeUser())
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
        "app.features.litellm.core.credentials.VaultManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("bedrock", True, "00000000-0000-0000-0000-000000000001", _FakeUser())
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
        "app.features.litellm.core.credentials.VaultManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("bedrock", True, "00000000-0000-0000-0000-000000000001", _FakeUser())
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
        "app.features.litellm.core.credentials.VaultManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("gemini", True, "00000000-0000-0000-0000-000000000001", _FakeUser())
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
        "app.features.litellm.core.credentials.VaultManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("vertex_ai", True, "00000000-0000-0000-0000-000000000001", _FakeUser())
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
        "app.features.litellm.core.credentials.VaultManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("azure", True, "00000000-0000-0000-0000-000000000001", _FakeUser())
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
        "app.features.litellm.core.credentials.VaultManager"
    ) as mock_vault_cls:
        mock_vault_cls.return_value.get_vault_secret_by_name.return_value = _credential_data(payload)
        result = resolve_credentials("watsonx", True, "00000000-0000-0000-0000-000000000001", _FakeUser())
    assert result.kwargs == {
        "api_key": "wx-key",
        "watsonx_project_id": "proj-123",
        "watsonx_region": "us-south",
    }
    assert result.uses_platform_credentials is False
