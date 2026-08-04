import json
import time
from typing import Any
from uuid import UUID
from urllib.parse import urljoin

from app.core.vault_manager import VaultManager
import httpx

from app.core.config import settings
from app.core.logger import logger
from app.features.custom_tools.credential_client import fetch_decrypted_credential


async def execute_tool_test(
    base_url: str,
    operation_id: str,
    parameters: dict | None = None,
    credential_id: UUID | None = None,
    access_token: str | None = None,
    open_api_spec: str | None = None,
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

    full_url = urljoin(base_url.rstrip("/") + "/", path.lstrip("/"))

    # Resolve authentication from the credential vault when an identity is provided.
    if credential_id and access_token:
        vault_manager = VaultManager()
        credential = vault_manager.get_vault_secret_by_id(str(credential_id), jwt=access_token)
        _inject_auth(headers, query_params, credential)

    if parameters:
        if method in ("GET", "DELETE"):
            query_params = {**query_params, **parameters}
        else:
            body_data = parameters

    start = time.perf_counter()

    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
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


def _inject_auth(
    headers: dict[str, str],
    query_params: dict[str, Any],
    credential: dict[str, Any],
) -> None:
    # Credential data is shaped as { "Type": "...", "Parameters": { ... } }
    credential_type = credential.get("Type") or credential.get("type") if credential else None
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
