import asyncio
import json
import time
from urllib.parse import urljoin

from app.core.vault_credential_manager import VaultCredentialManager
import httpx

from app.core.logger import logger
from app.features.custom_tools.vault_credential_client import apply_credential_auth
from app.features.custom_tools.custom_tool_executor import (
    ResponseTooLargeError,
    failure_envelope,
    build_request_parts,
    create_client,
    send_capped_request,
)
from app.features.custom_tools.openapi_parser import parse_openapi_spec
from app.features.custom_tools.schemas import ToolOperation


async def execute_tool_test(
    base_url: str,
    operation_id: str,
    parameters: dict | None = None,
    credential_name: str | None = None,
    access_token: str | None = None,
    open_api_spec: str | None = None,
    env_type: str = "dev",
    tenant_id: str | None = None,
    space_id: str | None = None,
) -> dict:
    resolved_operation = _resolve_operation(open_api_spec, operation_id)
    if resolved_operation is None:
        return failure_envelope(
            f"Operation '{operation_id}' was not found in the tool's OpenAPI specification.",
            0.0,
            status_code=400,
        )

    start = time.perf_counter()
    try:
        parts = build_request_parts(resolved_operation, parameters or {})

        if credential_name and access_token:
            vault_credential_manager = VaultCredentialManager()
            # IMPORTANT NOTE: the vault manager blocks on requests.get, so it runs in a worker thread to keep the event loop responsive.
            credential = await asyncio.to_thread(
                vault_credential_manager.get_vault_credential_secret_by_name,
                credential_name,
                access_token,
                env_type,
                tenant_id,
                space_id,
            )
            apply_credential_auth(parts.headers, parts.query_params, credential)
    except ValueError as error:
        return failure_envelope(str(error), start, status_code=400)

    full_url = urljoin(base_url.rstrip("/") + "/", parts.path.lstrip("/"))

    start = time.perf_counter()
    try:
        async with create_client() as client:
            status_code, content = await send_capped_request(
                client,
                method=parts.method,
                url=full_url,
                headers=parts.headers,
                params=parts.query_params,
                json_body=parts.body,
            )
    except ResponseTooLargeError:
        return failure_envelope(
            "The upstream API response exceeded the 5 MB limit.", start, status_code=502
        )
    except httpx.TimeoutException:
        return failure_envelope("Request timed out after 30 seconds", start, status_code=504)
    except Exception as error:
        logger.error("Custom tool test request failed: %s", error)
        return failure_envelope("The upstream API request failed.", start)

    return {
        "success": 200 <= status_code < 300,
        "status_code": status_code,
        "body": content.decode("utf-8", errors="replace"),
        "duration_ms": round((time.perf_counter() - start) * 1000, 2),
    }


def _resolve_operation(open_api_spec: str | None, operation_id: str) -> ToolOperation | None:
    if not open_api_spec:
        return None

    try:
        operations = parse_openapi_spec(json.loads(open_api_spec))
    except (json.JSONDecodeError, TypeError, AttributeError):
        logger.warning("Failed to parse OpenAPI spec for operation resolution")
        return None

    for operation in operations:
        if operation.operation_id == operation_id:
            return operation

    return None
