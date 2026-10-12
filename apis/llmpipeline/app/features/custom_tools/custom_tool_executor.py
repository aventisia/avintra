import json
import re
import time
from dataclasses import dataclass
from typing import Any
from urllib.parse import quote

import httpcore
import httpx

from app.core.config import settings
from app.features.custom_tools.credential_client import (
    apply_credential_auth,
    fetch_decrypted_credential,
)
from app.features.custom_tools.schemas import ToolOperation
from app.features.custom_tools.url_guard import UnsafeUrlError, resolve_public_addresses

_PATH_PLACEHOLDER_PATTERN = re.compile(r"\{([^/{}]+)\}")
MAX_RESPONSE_BYTES = 5 * 1024 * 1024
_REQUEST_TIMEOUT_SECONDS = 30.0


class ResponseTooLargeError(Exception):
    """Raised when an upstream response exceeds the 5 MB read cap."""


class _PinnedNetworkBackend(httpcore.AnyIOBackend):
    async def connect_tcp(
        self,
        host: str,
        port: int,
        timeout: float | None = None,
        local_address: str | None = None,
        socket_options: Any = None,
    ) -> httpcore.AsyncNetworkStream:
        addresses = resolve_public_addresses(host)
        last_error: Exception | None = None
        for address in addresses:
            try:
                return await super().connect_tcp(
                    str(address),
                    port,
                    timeout=timeout,
                    local_address=local_address,
                    socket_options=socket_options,
                )
            except OSError as error:
                last_error = error
        raise UnsafeUrlError("The upstream host could not be reached.") from last_error


class PublicHostTransport(httpx.AsyncHTTPTransport):
    """Connects only to an address validated as public at connect time."""

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        # IMPORTANT NOTE: httpx exposes no public hook for the connect backend, so the pool backend is replaced after construction to pin each connection to a validated address.
        self._pool._network_backend = _PinnedNetworkBackend()


@dataclass
class RequestParts:
    """The outbound method, path, headers, query and JSON body for an operation."""

    method: str
    path: str
    headers: dict[str, str]
    query_params: dict[str, Any]
    body: Any


def build_request_parts(operation: ToolOperation, parameters: dict[str, Any]) -> RequestParts:
    """Build the outbound request parts for an operation from the supplied parameters."""
    headers: dict[str, str] = {}
    query_params: dict[str, Any] = {}
    body: Any = None

    for param in operation.parameters:
        name = param["name"]
        value = parameters.get(name)
        if value is None:
            continue
        if param.get("in", "query") == "header":
            headers[name] = str(value)
        elif param.get("in", "query") == "query":
            query_params[name] = value

    if operation.request_body:
        body = _extract_body(parameters, operation.request_body)

    return RequestParts(
        method=operation.method.upper(),
        path=resolve_path_template(operation.path, parameters),
        headers=headers,
        query_params=query_params,
        body=body,
    )


def create_client() -> httpx.AsyncClient:
    """Create an HTTP client that pins connections to validated public addresses."""
    return httpx.AsyncClient(
        timeout=_REQUEST_TIMEOUT_SECONDS,
        follow_redirects=False,
        transport=PublicHostTransport(verify=settings.SSL_VERIFY),
    )


async def send_capped_request(
    client: httpx.AsyncClient,
    *,
    method: str,
    url: str,
    headers: dict[str, str],
    params: dict[str, Any],
    json_body: Any,
) -> tuple[int, bytes]:
    """Send a request and read at most the 5 MB response cap."""
    async with client.stream(
        method=method,
        url=url,
        headers=headers,
        params=params,
        json=json_body,
    ) as response:
        status_code = response.status_code
        content = await _read_capped_body(response)
    return status_code, content


async def execute_operation(
    base_url: str,
    operation: ToolOperation,
    parameters: dict[str, Any],
    authentication_type: str | None,
    credential_name: str | None,
    workspace_api: str | None = None,
    access_token: str | None = None,
    env_type: str = "dev",
) -> dict[str, Any]:
    start = time.perf_counter()
    try:
        parts = build_request_parts(operation, parameters)

        if authentication_type and authentication_type.lower() != "none":
            if credential_name and workspace_api:
                credential = await fetch_decrypted_credential(
                    workspace_api, credential_name, access_token, env_type=env_type
                )
                apply_credential_auth(
                    parts.headers, parts.query_params, credential, fallback_type=authentication_type
                )

        url = f"{base_url.rstrip('/')}/{parts.path.lstrip('/')}"
        async with create_client() as client:
            status_code, content = await send_capped_request(
                client,
                method=parts.method,
                url=url,
                headers=parts.headers,
                params=parts.query_params,
                json_body=parts.body,
            )
    except ResponseTooLargeError:
        return _failure_envelope(
            "The upstream API response exceeded the 5 MB limit.", start, status_code=502
        )
    except (httpx.HTTPError, ValueError) as error:
        return _failure_envelope(str(error), start)

    return {
        "success": 200 <= status_code < 300,
        "status_code": status_code,
        "body": _decode_body(content),
        "duration_ms": round((time.perf_counter() - start) * 1000, 2),
    }


def resolve_path_template(path_template: str, parameters: dict[str, Any]) -> str:
    """Substitute ``{placeholder}`` tokens in a path template from ``parameters``."""
    result = path_template
    for key, value in parameters.items():
        result = result.replace(f"{{{key}}}", quote(str(value), safe=""))
    return result


def path_placeholder_names(path_template: str) -> set[str]:
    """Return the ``{placeholder}`` names declared in a path template."""
    return set(_PATH_PLACEHOLDER_PATTERN.findall(path_template))


async def _read_capped_body(response: httpx.Response) -> bytes:
    buffer = bytearray()
    async for chunk in response.aiter_bytes():
        if len(buffer) + len(chunk) > MAX_RESPONSE_BYTES:
            raise ResponseTooLargeError()
        buffer.extend(chunk)
    return bytes(buffer)


def _decode_body(content: bytes) -> Any:
    try:
        return json.loads(content)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return content.decode("utf-8", errors="replace")


def _failure_envelope(
    message: str, start: float, status_code: int | None = None
) -> dict[str, Any]:
    return {
        "success": False,
        "status_code": status_code,
        "body": message,
        "duration_ms": round((time.perf_counter() - start) * 1000, 2),
    }


def _extract_body(parameters: dict[str, Any], request_body: dict[str, Any]) -> dict[str, Any]:
    """Build the JSON request body from the supplied parameters.

    Supports both the raw OpenAPI shape
    (``content.<media>.schema.properties`` as a name -> schema map) and the
    flattened shape emitted by the .NET ``OpenApiSpecHelpers`` (``properties``
    as an array of ``{name, ...}`` objects, directly on the request body or
    nested under ``schema``). When no property schema is declared the supplied
    parameters are forwarded as-is, matching the .NET free-form body behavior.
    """
    property_names = _extract_body_property_names(request_body)
    if not property_names:
        return dict(parameters)

    return {name: parameters[name] for name in property_names if name in parameters}


def _extract_body_property_names(request_body: dict[str, Any]) -> list[str]:
    content = request_body.get("content")
    if isinstance(content, dict):
        for media in content.values():
            if not isinstance(media, dict):
                continue
            names = _property_names(media.get("schema"))
            if names:
                return names

    for container in (request_body.get("schema"), request_body):
        names = _property_names(container)
        if names:
            return names

    return []


def _property_names(schema: Any) -> list[str]:
    if not isinstance(schema, dict):
        return []

    properties = schema.get("properties")
    if isinstance(properties, dict):
        return list(properties.keys())
    if isinstance(properties, list):
        return [
            prop["name"]
            for prop in properties
            if isinstance(prop, dict) and prop.get("name")
        ]
    return []
