import json
import time
from typing import Any
from uuid import UUID
from urllib.parse import urljoin

from app.core.vault_credential_manager import VaultCredentialManager
import httpx

from app.core.config import settings
from app.core.logger import logger
from app.features.custom_tools.vault_credential_client import apply_credential_auth
from app.features.custom_tools.custom_tool_executor import (
    path_placeholder_names,
    resolve_path_template,
)
from app.features.custom_tools.url_guard import ensure_public_http_url


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
    method = "GET"
    path = "/"
    headers: dict[str, str] = {}
    query_params: dict[str, Any] = {}
    body_data: Any = None

    if open_api_spec:
        try:
            spec = json.loads(open_api_spec)
            paths = spec.get("paths", {})
            for spec_path, methods in paths.items():
                for spec_method, details in methods.items():
                    if details.get("operationId") == operation_id:
                        method = spec_method.upper()
                        path = spec_path
                        break
        except json.JSONDecodeError:
            logger.warning("Failed to parse OpenAPI spec for operation resolution")

    # Substitute {placeholder} path segments (e.g. /users/{id}) before the call.
    path_placeholders = path_placeholder_names(path)
    resolved_path = resolve_path_template(path, parameters or {})

    full_url = urljoin(base_url.rstrip("/") + "/", resolved_path.lstrip("/"))

    # Resolve authentication from the vault credential when an identity is provided.
    if credential_name and access_token:
        vault_credential_manager = VaultCredentialManager()
        credential = vault_credential_manager.get_vault_credential_secret_by_name(
            credential_name,
            jwt=access_token,
            env_type=env_type,
            tenant_id=tenant_id,
            space_id=space_id,
        )
        apply_credential_auth(headers, query_params, credential)

    if parameters:
        # Path placeholders were already consumed into the URL; keep the rest as
        # query parameters (GET/DELETE) or the JSON request body.
        remaining_parameters = {
            key: value for key, value in parameters.items() if key not in path_placeholders
        }
        if method in ("GET", "DELETE"):
            query_params = {**query_params, **remaining_parameters}
        else:
            body_data = remaining_parameters or None

    start = time.perf_counter()

    try:
        await ensure_public_http_url(full_url)
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=False) as client:
            response = await client.request(
                method=method,
                url=full_url,
                params=query_params,
                json=body_data,
                headers=headers,
            )
        elapsed = (time.perf_counter() - start) * 1000
        return {
            "success": response.is_success,
            "status_code": response.status_code,
            "body": response.text,
            "duration_ms": round(elapsed, 2),
        }
    except httpx.TimeoutException:
        elapsed = (time.perf_counter() - start) * 1000
        return {
            "success": False,
            "status_code": None,
            "body": "Request timed out after 30 seconds",
            "duration_ms": round(elapsed, 2),
        }
    except Exception as e:
        elapsed = (time.perf_counter() - start) * 1000
        return {
            "success": False,
            "status_code": None,
            "body": f"Error: {str(e)}",
            "duration_ms": round(elapsed, 2),
        }

