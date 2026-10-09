"""Regression tests for the custom-tool Python runtime (PR #317 review).

Covers the three runtime defects fixed alongside the review:

- ``_extract_body`` must understand both the raw OpenAPI shape
  (``content.<media>.schema.properties`` as a name map) and the flattened
  shape the .NET ``OpenApiSpecHelpers`` persists (``properties`` as an array
  of ``{name, ...}`` objects, directly on the body or nested under ``schema``).
- ``apply_credential_auth`` must read the backend ``CustomApiTool`` credential
  keys (``headerName``/``parameterName``/``apiKey``/``username``/``password``/
  ``token``).
- ``resolve_path_template`` / ``path_placeholder_names`` must substitute and
  report ``{placeholder}`` path segments, percent-encoding each value.
- ``validate_public_http_url`` must reject non-http schemes and hosts that
  resolve to non-public addresses.

Run from ``apis/llmpipeline``:

    ./.venv/Scripts/python.exe -m pytest tests/test_custom_tool_executor.py -q
"""

import pytest

from app.features.custom_tools.credential_client import apply_credential_auth
from app.features.custom_tools.custom_tool_executor import (
    _extract_body,
    path_placeholder_names,
    resolve_path_template,
)
from app.features.custom_tools.url_guard import (
    UnsafeUrlError,
    validate_public_http_url,
)


def test_extract_body_flattened_properties_array():
    """Flattened OpenApiSpecHelpers shape: properties array nested under schema."""
    request_body = {
        "required": True,
        "contentType": "application/json",
        "schema": {
            "type": "object",
            "properties": [
                {"name": "name", "type": "string", "required": True},
                {"name": "age", "type": "integer", "required": False},
            ],
        },
    }
    parameters = {"name": "Ada", "age": 36, "ignored": "x"}

    assert _extract_body(parameters, request_body) == {"name": "Ada", "age": 36}


def test_extract_body_flattened_properties_on_body():
    """Flattened DTO shape: properties array directly on the request body."""
    request_body = {
        "properties": [{"name": "email"}, {"name": "subscribe"}],
        "contentType": "application/json",
    }

    assert _extract_body({"email": "a@b.com", "subscribe": True}, request_body) == {
        "email": "a@b.com",
        "subscribe": True,
    }


def test_extract_body_standard_openapi_object():
    """Raw OpenAPI shape: content -> media -> schema.properties as a name map."""
    request_body = {
        "content": {
            "application/json": {
                "schema": {
                    "type": "object",
                    "properties": {"a": {"type": "string"}, "b": {"type": "integer"}},
                }
            }
        }
    }

    assert _extract_body({"a": "1", "b": 2, "c": "drop"}, request_body) == {"a": "1", "b": 2}


def test_extract_body_without_declared_schema_forwards_all():
    """No declared property schema: forward supplied parameters as-is."""
    assert _extract_body({"free": "form"}, {}) == {"free": "form"}


def test_apply_credential_auth_api_key_header_uses_backend_keys():
    headers: dict[str, str] = {}
    query: dict = {}
    credential = {"type": "CustomApiTool", "data": {"Type": "ApiKeyHeader", "Parameters": {"headerName": "X-Token", "apiKey": "secret"}}}

    apply_credential_auth(headers, query, credential)

    assert headers == {"X-Token": "secret"}
    assert query == {}


def test_apply_credential_auth_api_key_query_uses_backend_keys():
    headers: dict[str, str] = {}
    query: dict = {}
    credential = {"data": {"Type": "ApiKeyQuery", "Parameters": {"parameterName": "key", "apiKey": "secret"}}}

    apply_credential_auth(headers, query, credential)

    assert query == {"key": "secret"}
    assert headers == {}


def test_apply_credential_auth_basic_and_bearer():
    basic_headers: dict[str, str] = {}
    apply_credential_auth(
        basic_headers,
        {},
        {"data": {"Type": "Basic", "Parameters": {"username": "u", "password": "p"}}},
    )
    assert basic_headers["Authorization"].startswith("Basic ")

    bearer_headers: dict[str, str] = {}
    apply_credential_auth(
        bearer_headers,
        {},
        {"data": {"Type": "Bearer", "Parameters": {"token": "abc"}}},
    )
    assert bearer_headers["Authorization"] == "Bearer abc"


def test_apply_credential_auth_falls_back_to_tool_type():
    headers: dict[str, str] = {}
    apply_credential_auth(headers, {}, {"Parameters": {"token": "abc"}}, fallback_type="Bearer")
    assert headers["Authorization"] == "Bearer abc"


def test_path_placeholder_helpers():
    assert path_placeholder_names("/users/{id}/posts/{postId}") == {"id", "postId"}
    assert (
        resolve_path_template("/users/{id}/posts/{postId}", {"id": 7, "postId": "a b"})
        == "/users/7/posts/a%20b"
    )


def test_path_placeholder_encoding_blocks_traversal():
    assert (
        resolve_path_template("/files/{name}", {"name": "../secrets"})
        == "/files/..%2Fsecrets"
    )


@pytest.mark.parametrize(
    "url",
    [
        "http://127.0.0.1/internal",
        "http://10.0.0.5/internal",
        "http://169.254.169.254/latest/meta-data",
        "http://[::1]/internal",
        "http://192.168.1.10/admin",
    ],
)
def test_validate_public_http_url_blocks_non_public_hosts(url):
    with pytest.raises(UnsafeUrlError):
        validate_public_http_url(url)


@pytest.mark.parametrize("url", ["ftp://example.com/x", "file:///etc/passwd", "/relative"])
def test_validate_public_http_url_blocks_non_http_schemes(url):
    with pytest.raises(UnsafeUrlError):
        validate_public_http_url(url)


def test_validate_public_http_url_allows_public_hosts():
    assert validate_public_http_url("https://93.184.216.34/api") == "https://93.184.216.34/api"
