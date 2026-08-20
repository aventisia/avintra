import time
from typing import Any
from uuid import UUID

import httpx

from app.core.logger import logger
from app.features.custom_tools.credential_client import fetch_decrypted_credential
from app.features.custom_tools.schemas import ToolOperation


async def execute_operation(
    base_url: str,
    operation: ToolOperation,
    parameters: dict[str, Any],
    authentication_type: str | None,
    credential_id: UUID | None,
    workspace_api: str | None = None,
    access_token: str | None = None,
    env_type: str = "dev",
) -> dict[str, Any]:
    resolved_path = _resolve_path(operation.path, parameters)
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

    if credential_id and authentication_type and authentication_type != "none":
        if workspace_api:
            credential = await fetch_decrypted_credential(
                workspace_api, credential_id, access_token, env_type=env_type
            )
            _inject_auth(headers, query_params, authentication_type, credential)

    url = f"{base_url.rstrip('/')}/{resolved_path.lstrip('/')}"

    start = time.perf_counter()
    async with httpx.AsyncClient(timeout=30.0) as client:
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


def _resolve_path(path_template: str, parameters: dict[str, Any]) -> str:
    result = path_template
    for key, value in parameters.items():
        result = result.replace(f"{{{key}}}", str(value))
    return result


def _extract_body(parameters: dict[str, Any], request_body: dict[str, Any]) -> dict[str, Any]:
    content = request_body.get("content", {})
    for media in content.values():
        schema = media.get("schema", {})
        if schema.get("type") == "object" and "properties" in schema:
            body = {}
            for name in schema["properties"].keys():
                if name in parameters:
                    body[name] = parameters[name]
            return body
    return {}


def _inject_auth(
    headers: dict[str, str],
    query_params: dict[str, Any],
    authentication_type: str,
    credential: dict[str, Any],
) -> None:
    # Credential data is shaped as { "Type": "...", "Parameters": { ... } }
    credential_type = credential.get("Type") or credential.get("type") or authentication_type
    parameters = credential.get("Parameters") or credential.get("parameters") or {}

    if credential_type == "ApiKeyHeader":
        key_name = parameters.get("KeyName") or parameters.get("key_name") or "X-API-Key"
        headers[key_name] = parameters.get("ApiKey") or parameters.get("api_key") or ""
    elif credential_type == "ApiKeyQuery":
        key_name = parameters.get("KeyName") or parameters.get("key_name") or "api_key"
        query_params[key_name] = parameters.get("ApiKey") or parameters.get("api_key") or ""
    elif credential_type == "Bearer":
        headers["Authorization"] = f"Bearer {parameters.get('Token') or parameters.get('token', '')}"
    elif credential_type == "Basic":
        import base64
        username = parameters.get("Username") or parameters.get("basic_username") or ""
        password = parameters.get("Password") or parameters.get("basic_password") or ""
        encoded = base64.b64encode(f"{username}:{password}".encode()).decode()
        headers["Authorization"] = f"Basic {encoded}"
