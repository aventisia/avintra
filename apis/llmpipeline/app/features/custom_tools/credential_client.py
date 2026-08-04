from uuid import UUID

import httpx

from app.core.logger import logger


async def fetch_decrypted_credential(
    workspace_api: str,
    app_secret_id: UUID,
    access_token: str | None = None,
) -> dict:
    url = f"{workspace_api.rstrip('/')}/internal/tool-credential/{app_secret_id}/decrypt"
    headers = {}
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
