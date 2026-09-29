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
