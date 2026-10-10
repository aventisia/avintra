from uuid import UUID

import httpx

from app.core.logger import logger


async def fetch_decrypted_credential(
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

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        payload = response.json()

    data = payload.get("data")
    if data is None:
        raise ValueError("Credential endpoint returned empty data")

    return data
