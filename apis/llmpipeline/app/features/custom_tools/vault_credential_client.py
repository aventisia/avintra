import base64
from typing import Any
from uuid import UUID

import httpx

from app.core.config import settings
from app.core.logger import logger


async def fetch_decrypted_vault_credential(
    workspace_api: str,
    credential_name: str,
    access_token: str | None = None,
    env_type: str = "dev",
) -> dict:
    """Fetch a decrypted credential by its unique NAME from the Workspace API."""
    url = f"{workspace_api.rstrip('/')}/api/vault-credential/decrypted-data/by-name/{credential_name}"
    headers = {"X-Env-Type": env_type}
    if access_token:
        # The token is already a full Authorization value (e.g. "Bearer <token>")
        # when forwarded from the .NET Workspace API.
        headers["Authorization"] = access_token

    async with httpx.AsyncClient(verify=settings.SSL_VERIFY) as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        payload = response.json()

    data = payload.get("data")
    if data is None:
        raise ValueError("Credential endpoint returned empty data")

    return data


def extract_credential_material(
    credential: dict | None,
) -> tuple[str | None, dict]:
    """Normalize a vault secret DTO into ``(auth_type, parameters)``.

    The vault endpoint returns the full secret DTO, e.g.::

        {"type": "CustomApiTool",
         "data": {"Type": "Bearer", "Parameters": {"token": "..."}}}

    The actual auth material lives under the nested ``data`` field, while the
    top-level ``type`` is the credential kind (``CustomApiTool``) rather than
    the auth scheme. Some callers may already pass the inner payload directly,
    so both shapes are supported.
    """
    if not credential:
        return None, {}

    inner = credential.get("data")
    if isinstance(inner, dict) and any(
        key in inner for key in ("Type", "type", "Parameters", "parameters")
    ):
        credential = inner

    credential_type = credential.get("Type") or credential.get("type")
    parameters = credential.get("Parameters") or credential.get("parameters") or {}
    return credential_type, parameters


def apply_credential_auth(
    headers: dict[str, str],
    query_params: dict[str, Any],
    credential: dict | None,
    fallback_type: str | None = None,
) -> None:
    """Resolve a vault credential into concrete HTTP auth for a custom tool.

    Mirrors the backend ``CustomApiTool`` credential contract (see
    ``CustomToolConnectorService.ResolveAuthenticationAsync``) so the Python
    runtime and the .NET runtime read the same parameter keys:

    - ``ApiKeyHeader``: ``headerName`` + ``apiKey``
    - ``ApiKeyQuery``:  ``parameterName`` + ``apiKey``
    - ``Bearer``:       ``token``
    - ``Basic``:        ``username`` + ``password``

    ``fallback_type`` is used when the credential carries no ``Type`` (e.g. the
    tool's own ``authentication_type``). Legacy camelCase/PascalCase keys are
    still accepted as fallbacks.
    """
    credential_type, parameters = extract_credential_material(credential)
    credential_type = credential_type or fallback_type
    if not credential_type or credential_type.lower() == "none":
        return

    if credential_type == "ApiKeyHeader":
        key_name = _first_value(parameters, "headerName", "keyName", "KeyName") or "X-API-Key"
        headers[key_name] = _first_value(parameters, "apiKey", "ApiKey") or ""
    elif credential_type == "ApiKeyQuery":
        key_name = _first_value(parameters, "parameterName", "keyName", "KeyName") or "api_key"
        query_params[key_name] = _first_value(parameters, "apiKey", "ApiKey") or ""
    elif credential_type == "Bearer":
        token = _first_value(parameters, "token", "Token")
        headers["Authorization"] = f"Bearer {token or ''}"
    elif credential_type == "Basic":
        username = _first_value(parameters, "username", "Username") or ""
        password = _first_value(parameters, "password", "Password") or ""
        encoded = base64.b64encode(f"{username}:{password}".encode()).decode()
        headers["Authorization"] = f"Basic {encoded}"


def _first_value(parameters: dict, *keys: str) -> str | None:
    """Return the first non-empty value among ``keys`` as a string."""
    for key in keys:
        value = parameters.get(key)
        if value:
            return str(value)
    return None
