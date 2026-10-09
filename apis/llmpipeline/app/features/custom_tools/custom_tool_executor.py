import re
import time
from typing import Any
from urllib.parse import quote

import httpx

from app.features.custom_tools.vault_credential_client import (
    apply_credential_auth,
    fetch_decrypted_vault_credential,
)
from app.features.custom_tools.schemas import ToolOperation
from app.features.custom_tools.url_guard import UnsafeUrlError, ensure_public_http_url

_PATH_PLACEHOLDER_PATTERN = re.compile(r"\{([^/{}]+)\}")


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
    resolved_path = resolve_path_template(operation.path, parameters)
    method = operation.method.upper()
    headers: dict[str, str] = {}
    query_params: dict[str, Any] = {}
    body: Any = None

    for param in operation.parameters:
        name = param["name"]
        param_in = param.get("in", "query")
        value = parameters.get(name)
        if value is None:
            continue
        if param_in == "query":
            query_params[name] = value
        elif param_in == "header":
            headers[name] = str(value)

    if operation.request_body:
        body = _extract_body(parameters, operation.request_body)

    if authentication_type and authentication_type.lower() != "none":
        if credential_name and workspace_api:
            credential = await fetch_decrypted_vault_credential(
                workspace_api, credential_name, access_token, env_type=env_type
            )
            apply_credential_auth(
                headers, query_params, credential, fallback_type=authentication_type
            )

    url = f"{base_url.rstrip('/')}/{resolved_path.lstrip('/')}"

    try:
        await ensure_public_http_url(url)
    except UnsafeUrlError as error:
        return {
            "success": False,
            "status_code": None,
            "body": str(error),
            "duration_ms": 0.0,
        }

    start = time.perf_counter()
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=False) as client:
        response = await client.request(
            method=method,
            url=url,
            headers=headers,
            params=query_params,
            json=body,
        )
    duration_ms = round((time.perf_counter() - start) * 1000, 2)

    try:
        response_body = response.json()
    except Exception:
        response_body = response.text

    return {
        "success": 200 <= response.status_code < 300,
        "status_code": response.status_code,
        "body": response_body,
        "duration_ms": duration_ms,
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
    # Raw OpenAPI: content -> media type -> schema -> properties (name map).
    content = request_body.get("content")
    if isinstance(content, dict):
        for media in content.values():
            if not isinstance(media, dict):
                continue
            names = _property_names(media.get("schema"))
            if names:
                return names

    # Flattened summary: properties may sit under "schema" or on the body itself.
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
