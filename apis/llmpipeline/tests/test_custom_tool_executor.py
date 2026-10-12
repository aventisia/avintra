"""Regression tests for the custom-tool Python runtime (PR #317 review).

Covers the runtime defects fixed alongside the review:

- ``_extract_body`` must understand both the raw OpenAPI shape
  (``content.<media>.schema.properties`` as a name map) and the flattened
  shape the .NET ``OpenApiSpecHelpers`` persists (``properties`` as an array
  of ``{name, ...}`` objects, directly on the body or nested under ``schema``).
- ``apply_credential_auth`` must read the backend ``CustomApiTool`` credential
  keys (``headerName``/``parameterName``/``apiKey``/``username``/``password``/
  ``token``) and reject unsupported or incomplete credentials.
- ``resolve_path_template`` / ``path_placeholder_names`` must substitute and
  report ``{placeholder}`` path segments, percent-encoding each value.
- ``validate_public_http_url`` / ``resolve_public_addresses`` must reject
  non-http schemes and hosts that resolve to any non-public address.
- ``execute_operation`` / ``send_capped_request`` must return the standard
  failure envelope for credential, transport, and oversize failures.
- ``load_custom_tools`` must gate operations on per-operation ``is_verified``.

Run from ``apis/llmpipeline``:

    ./.venv/Scripts/python.exe -m pytest tests/test_custom_tool_executor.py -q
"""

import asyncio
import json
import socket
import time
from types import SimpleNamespace
from uuid import uuid4

import httpx
import pytest

from app.features.custom_tools import url_guard
from app.features.custom_tools.credential_client import (
    UnsupportedCredentialTypeError,
    apply_credential_auth,
)
from app.features.custom_tools.custom_tool_executor import (
    MAX_RESPONSE_BYTES,
    ResponseTooLargeError,
    _extract_body,
    build_request_parts,
    execute_operation,
    path_placeholder_names,
    resolve_path_template,
    send_capped_request,
)
from app.features.custom_tools.custom_tool_loader import load_custom_tools
from app.features.custom_tools.schemas import ToolOperation
from app.features.custom_tools.service import _resolve_operation, execute_tool_test
from app.features.custom_tools.url_guard import (
    UnsafeUrlError,
    validate_public_http_url,
)

_EXECUTOR_MODULE = "app.features.custom_tools.custom_tool_executor"


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


def test_build_request_parts_omits_body_without_declared_request_body():
    operation = ToolOperation(operation_id="op", method="POST", path="/things")

    parts = build_request_parts(operation, {"a": 1})

    assert parts.body is None
    assert parts.query_params == {}


def test_build_request_parts_extracts_declared_body_properties():
    operation = ToolOperation(
        operation_id="op",
        method="POST",
        path="/things",
        request_body={"properties": [{"name": "a"}]},
    )

    assert build_request_parts(operation, {"a": 1, "b": 2}).body == {"a": 1}


def test_build_request_parts_routes_declared_parameters():
    operation = ToolOperation(
        operation_id="op",
        method="GET",
        path="/things/{id}",
        parameters=[
            {"name": "id", "in": "path"},
            {"name": "q", "in": "query"},
            {"name": "X-Trace", "in": "header"},
        ],
    )

    parts = build_request_parts(operation, {"id": 7, "q": "x", "X-Trace": "v"})

    assert parts.path == "/things/7"
    assert parts.query_params == {"q": "x"}
    assert parts.headers == {"X-Trace": "v"}


def test_service_resolves_operation_via_openapi_parser():
    spec = json.dumps({"paths": {"/things/{id}": {"get": {"operationId": "getThing"}}}})

    operation = _resolve_operation(spec, "getThing")

    assert operation.method == "GET"
    assert operation.path == "/things/{id}"


def test_service_resolution_returns_none_for_missing_operation():
    assert _resolve_operation(None, "missing") is None


def test_service_test_returns_failure_envelope_for_unknown_operation():
    result = asyncio.run(
        execute_tool_test(
            base_url="http://api.example.test",
            operation_id="missing",
            open_api_spec=json.dumps({"paths": {"/things": {"get": {"operationId": "getThing"}}}}),
        )
    )

    assert result["success"] is False
    assert result["status_code"] == 400
    assert "missing" in result["body"]


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


def test_apply_credential_auth_rejects_unknown_type():
    with pytest.raises(UnsupportedCredentialTypeError):
        apply_credential_auth({}, {}, {"data": {"Type": "OAuth2", "Parameters": {}}})


def test_apply_credential_auth_rejects_empty_bearer_token():
    headers: dict[str, str] = {}

    with pytest.raises(UnsupportedCredentialTypeError):
        apply_credential_auth(headers, {}, {"data": {"Type": "Bearer", "Parameters": {}}})

    assert "Authorization" not in headers


def test_apply_credential_auth_ignores_none_type():
    headers: dict[str, str] = {}
    apply_credential_auth(headers, {}, {"data": {"Type": "None", "Parameters": {}}})
    assert headers == {}


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


def _addrinfo(*addresses: str) -> list[tuple]:
    return [
        (
            socket.AF_INET6 if ":" in address else socket.AF_INET,
            socket.SOCK_STREAM,
            6,
            "",
            (address, 0),
        )
        for address in addresses
    ]


def test_dns_mixed_public_and_private_records_rejected(monkeypatch):
    monkeypatch.setattr(
        socket, "getaddrinfo", lambda host, port: _addrinfo("93.184.216.34", "10.0.0.5")
    )

    with pytest.raises(UnsafeUrlError):
        validate_public_http_url("http://mixed.example.test/resource")


def test_dns_public_only_records_allowed(monkeypatch):
    monkeypatch.setattr(
        socket, "getaddrinfo", lambda host, port: _addrinfo("93.184.216.34", "1.1.1.1")
    )

    assert (
        validate_public_http_url("http://public.example.test/resource")
        == "http://public.example.test/resource"
    )


def test_dns_unresolvable_host_rejected(monkeypatch):
    def fail(host, port):
        raise socket.gaierror("name not resolved")

    monkeypatch.setattr(socket, "getaddrinfo", fail)

    with pytest.raises(UnsafeUrlError):
        validate_public_http_url("http://missing.example.test/resource")


def test_dns_resolution_timeout_rejected(monkeypatch):
    def slow(host, port):
        time.sleep(0.5)
        return _addrinfo("93.184.216.34")

    monkeypatch.setattr(socket, "getaddrinfo", slow)
    monkeypatch.setattr(url_guard, "_DNS_TIMEOUT_SECONDS", 0.05)

    with pytest.raises(UnsafeUrlError):
        validate_public_http_url("http://slow.example.test/resource")


@pytest.mark.parametrize(
    "url",
    [
        "http://127.0.0.1/internal",
        "http://10.0.0.5/internal",
        "http://169.254.169.254/latest/meta-data",
        "http://[::1]/internal",
        "http://192.168.1.10/admin",
        "http://[::ffff:127.0.0.1]/internal",
        "http://100.64.0.1/cgnat",
        "http://224.0.0.1/multicast",
        "http://240.0.0.1/reserved",
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


def test_execute_operation_envelopes_credential_failure(monkeypatch):
    async def failing_credential(*args, **kwargs):
        raise ValueError("Credential endpoint returned empty data")

    monkeypatch.setattr(f"{_EXECUTOR_MODULE}.fetch_decrypted_credential", failing_credential)
    operation = ToolOperation(operation_id="op", method="GET", path="/things")

    result = asyncio.run(
        execute_operation(
            base_url="http://api.example.test",
            operation=operation,
            parameters={},
            authentication_type="Bearer",
            credential_name="cred",
            workspace_api="http://workspace.example.test",
            access_token="token",
        )
    )

    assert result["success"] is False
    assert result["status_code"] is None
    assert "empty data" in result["body"]
    assert "duration_ms" in result


def test_execute_operation_envelopes_unknown_credential_type(monkeypatch):
    async def unsupported_credential(*args, **kwargs):
        return {"data": {"Type": "OAuth2", "Parameters": {}}}

    monkeypatch.setattr(f"{_EXECUTOR_MODULE}.fetch_decrypted_credential", unsupported_credential)
    operation = ToolOperation(operation_id="op", method="GET", path="/things")

    result = asyncio.run(
        execute_operation(
            base_url="http://api.example.test",
            operation=operation,
            parameters={},
            authentication_type="OAuth2",
            credential_name="cred",
            workspace_api="http://workspace.example.test",
            access_token="token",
        )
    )

    assert result["success"] is False
    assert "unsupported authentication type" in result["body"]


def test_execute_operation_envelopes_oversize_response(monkeypatch):
    async def oversize(*args, **kwargs):
        raise ResponseTooLargeError()

    monkeypatch.setattr(f"{_EXECUTOR_MODULE}.send_capped_request", oversize)
    operation = ToolOperation(operation_id="op", method="GET", path="/things")

    result = asyncio.run(
        execute_operation(
            base_url="http://api.example.test",
            operation=operation,
            parameters={},
            authentication_type=None,
            credential_name=None,
        )
    )

    assert result["success"] is False
    assert result["status_code"] == 502
    assert "5 MB" in result["body"]


def test_send_capped_request_rejects_oversize_response():
    body = b"x" * (MAX_RESPONSE_BYTES + 1)
    transport = httpx.MockTransport(lambda request: httpx.Response(200, content=body))

    async def run():
        async with httpx.AsyncClient(transport=transport) as client:
            with pytest.raises(ResponseTooLargeError):
                await send_capped_request(
                    client,
                    method="GET",
                    url="http://api.example.test/things",
                    headers={},
                    params={},
                    json_body=None,
                )

    asyncio.run(run())


def test_send_capped_request_reads_within_cap():
    transport = httpx.MockTransport(
        lambda request: httpx.Response(200, content=b'{"ok": true}')
    )

    async def run():
        async with httpx.AsyncClient(transport=transport) as client:
            return await send_capped_request(
                client,
                method="GET",
                url="http://api.example.test/things",
                headers={},
                params={},
                json_body=None,
            )

    status_code, content = asyncio.run(run())
    assert status_code == 200
    assert content == b'{"ok": true}'


def test_send_capped_request_does_not_follow_redirects():
    transport = httpx.MockTransport(
        lambda request: httpx.Response(
            302, headers={"Location": "http://internal.example.test/"}
        )
    )

    async def run():
        async with httpx.AsyncClient(transport=transport, follow_redirects=False) as client:
            return await send_capped_request(
                client,
                method="GET",
                url="http://api.example.test/things",
                headers={},
                params={},
                json_body=None,
            )

    status_code, _ = asyncio.run(run())
    assert status_code == 302


# ---------------------------------------------------------------------------
# Loader gating
# ---------------------------------------------------------------------------


class _FakeResult:
    def __init__(self, rows):
        self._rows = rows

    def scalars(self):
        return self

    def all(self):
        return self._rows


class _FakeSession:
    def __init__(self, rows):
        self._rows = rows

    async def execute(self, statement):
        return _FakeResult(self._rows)


def _custom_tool(is_verified: bool, parsed_schema: list) -> SimpleNamespace:
    return SimpleNamespace(
        name="weather",
        parsed_schema=parsed_schema,
        is_verified=is_verified,
        base_url="http://api.example.test",
        authentication_type=None,
        credential_name=None,
    )


def _load_tools(tool: SimpleNamespace, monkeypatch) -> list:
    selected: list[str] = []

    def fake_build(*, tool_record, operation, **kwargs):
        selected.append(operation.operation_id)
        return operation.operation_id

    monkeypatch.setattr(
        "app.features.custom_tools.custom_tool_loader._build_langchain_tool",
        fake_build,
    )
    return asyncio.run(
        load_custom_tools(
            session=_FakeSession([tool]),
            tenant_id=uuid4(),
            tool_names=["weather"],
            env_type="dev",
        )
    )


def test_loader_blocks_unverified_operation(monkeypatch):
    operations = [
        {"operationId": "getWeather", "method": "GET", "path": "/weather", "isVerified": False}
    ]

    assert _load_tools(_custom_tool(False, operations), monkeypatch) == []


def test_loader_allows_verified_operation(monkeypatch):
    operations = [
        {"operationId": "getWeather", "method": "GET", "path": "/weather", "isVerified": True}
    ]

    assert _load_tools(_custom_tool(False, operations), monkeypatch) == ["getWeather"]


def test_loader_tool_level_flag_unlocks_unverified_operation(monkeypatch):
    operations = [
        {"operationId": "getWeather", "method": "GET", "path": "/weather", "isVerified": False}
    ]

    assert _load_tools(_custom_tool(True, operations), monkeypatch) == ["getWeather"]


def test_build_langchain_tool_returns_named_invocable_tool():
    from app.features.custom_tools.custom_tool_loader import _build_langchain_tool

    langchain_tool = _build_langchain_tool(
        tool_record=_custom_tool(True, []),
        operation=ToolOperation(
            operation_id="getWeather",
            method="GET",
            path="/weather",
            summary="Get weather",
        ),
    )

    assert langchain_tool.name == "weather_getWeather"
    assert langchain_tool.description == "Get weather"
