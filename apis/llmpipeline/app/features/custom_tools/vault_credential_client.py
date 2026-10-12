import base64
from typing import Any
from urllib.parse import quote

import httpx

from app.core.config import settings

_CREDENTIAL_TIMEOUT_SECONDS = 30.0
_KNOWN_CREDENTIAL_TYPES = frozenset({"ApiKeyHeader", "ApiKeyQuery", "Bearer", "Basic"})


class UnsupportedCredentialTypeError(ValueError):
    """Raised when a vault credential carries an unsupported authentication type."""


async def fetch_decrypted_vault_credential(
    workspace_api: str,
    credential_name: str,
    access_token: str | None = None,
    env_type: str = "dev",
) -> dict:
    """Fetch a decrypted credential by its unique NAME from the Workspace API."""
    url = (
        f"{workspace_api.rstrip('/')}/api/app-secret/decrypted-data/by-name/"
        f"{quote(credential_name, safe='')}"
    )
    headers = {"X-Env-Type": env_type}
    if access_token:
        headers["Authorization"] = access_token

    async with httpx.AsyncClient(
        verify=settings.SSL_VERIFY, timeout=_CREDENTIAL_TIMEOUT_SECONDS
    ) as client:
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
    """Normalize a vault secret DTO into ``(credential_type, parameters)``."""
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
    """Apply a vault credential to the outbound request as HTTP auth headers and query parameters."""
    credential_type, parameters = extract_credential_material(credential)
    credential_type = credential_type or fallback_type
    if not credential_type or credential_type.lower() == "none":
        return

    if credential_type not in _KNOWN_CREDENTIAL_TYPES:
        raise UnsupportedCredentialTypeError(
            f"Credential has an unsupported authentication type '{credential_type}'."
        )

    if credential_type == "ApiKeyHeader":
        key_name = _first_value(parameters, "headerName", "keyName", "KeyName") or "X-API-Key"
        api_key = _first_value(parameters, "apiKey", "ApiKey")
        if not api_key:
            raise UnsupportedCredentialTypeError("Credential has no 'apiKey' value.")
        headers[key_name] = api_key
    elif credential_type == "ApiKeyQuery":
        key_name = _first_value(parameters, "parameterName", "keyName", "KeyName") or "api_key"
        api_key = _first_value(parameters, "apiKey", "ApiKey")
        if not api_key:
            raise UnsupportedCredentialTypeError("Credential has no 'apiKey' value.")
        query_params[key_name] = api_key
    elif credential_type == "Bearer":
        token = _first_value(parameters, "token", "Token")
        if not token:
            raise UnsupportedCredentialTypeError("Credential has no 'token' value.")
        headers["Authorization"] = f"Bearer {token}"
    elif credential_type == "Basic":
        username = _first_value(parameters, "username", "Username")
        password = _first_value(parameters, "password", "Password") or ""
        if not username:
            raise UnsupportedCredentialTypeError("Credential has no 'username' value.")
        encoded = base64.b64encode(f"{username}:{password}".encode()).decode()
        headers["Authorization"] = f"Basic {encoded}"


def _first_value(parameters: dict, *keys: str) -> str | None:
    for key in keys:
        value = parameters.get(key)
        if value:
            return str(value)
    return None
