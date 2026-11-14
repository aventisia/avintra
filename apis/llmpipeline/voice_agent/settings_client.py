"""Resolved VoiceAgent settings fetched from WorkspaceAPIs with the worker credential."""

from __future__ import annotations

import httpx

from app.core.config import settings
from app.core.logger import logger

from .metadata import VoiceJobClaims, VoiceSessionRejected


def workspace_api_base_url() -> str:
    """Return the WorkspaceAPIs base URL; ASP.NET serves everything under ``/api``."""

    return settings.WORKSPACE_API_URL or f"https://{settings.APP_BASE_URL}/api"


async def fetch_settings(claims: VoiceJobClaims) -> dict:
    """Fetch the S2 settings and fail closed unless they match the validated job."""

    headers = {
        "Authorization": f"Bearer {claims.worker_token}",
        "X-Env-Type": claims.env_type,
    }
    if claims.space_id:
        headers["X-Space-Id"] = claims.space_id

    url = f"{workspace_api_base_url()}/assist/voice/settings/{claims.flow_version_id}"

    try:
        async with httpx.AsyncClient(timeout=15, verify=settings.SSL_VERIFY) as client:
            response = await client.get(url, headers=headers, params={"mode": claims.mode})
    except httpx.HTTPError as error:
        logger.warning("[voice-agent] settings request failed: %s", type(error).__name__)
        raise VoiceSessionRejected("Voice agent settings are unreachable.") from error

    if not response.is_success:
        logger.warning("[voice-agent] settings rejected: status=%s", response.status_code)
        raise VoiceSessionRejected("Voice agent settings could not be resolved.")

    try:
        body = response.json()
    except ValueError as error:
        raise VoiceSessionRejected("Voice agent settings response is not JSON.") from error

    data = body.get("data") if isinstance(body, dict) else None
    if not isinstance(data, dict):
        raise VoiceSessionRejected("Voice agent settings response is invalid.")

    if data.get("flowVersionId") != str(claims.flow_version_id):
        raise VoiceSessionRejected("Voice agent settings belong to another flow version.")
    if data.get("flowId") != str(claims.flow_id):
        raise VoiceSessionRejected("Voice agent settings belong to another flow.")
    if data.get("engineMode") not in {"pipeline", "realtime"}:
        raise VoiceSessionRejected("Voice agent engine mode is not supported.")

    return data
