from app.features.auth.authenticated_user import User
import httpx
from typing import Dict, Any
from app.core.logger import logger
from app.core.config import settings


def _workspace_api_base_url() -> str:
    """Return the base URL for WorkspaceAPIs internal calls.

    Defaults to ``https://{APP_BASE_URL}/api``. The ASP.NET backend uses a
    ``/api`` path base, so internal callers should target ``/api`` directly
    rather than the nginx-exposed ``/workspace/api`` prefix.

    Can be overridden via the ``WORKSPACE_API_URL`` setting for local dev when
    WorkspaceAPIs runs on a non-standard port (e.g. ``https://localhost:4001/api``).
    """
    default = f"https://{settings.APP_BASE_URL}/api"
    return getattr(settings, "WORKSPACE_API_URL", None) or default


async def execute_agent(
    user: User,
    agent_data: Dict[str, Any],
    endpoint: str,
    method: str = "POST",
    timeout: int = 30,
) -> Dict[str, Any]:
    """
    Generic executor to call any API endpoint dynamically with bearer token authorization.

    Parameters:
    - agent_data: {
          "agentId": "...",
          "agentName": "...",
          "provider": "...",
          "action": "...",
          "credentialId": "...",
          "payload": {...}
      }
    - endpoint: target API URL
    - method: HTTP method ("GET", "POST", etc.)
    - timeout: request timeout in seconds
    - user: authenticated User object with access_token

    Returns:
    - Dict containing status and API response
    """
    payload = agent_data.get("payload", {})
    headers = {
        "Authorization": f"Bearer {user.access_token}",
        "Content-Type": "application/json",
    }

    if not endpoint:
        return {"status": "failed", "error": "No endpoint provided in agent data"}

    base_url = _workspace_api_base_url()

    try:
        logger.info(
            "Agent '%s' calling %s/%s",
            agent_data.get("agentName"),
            base_url,
            endpoint,
        )
        logger.info(f"Payload: {payload}")

        timeout = httpx.Timeout(600.0)

        # WorkspaceAPIs expects the full CloudConnectorReqDto body, not just the
        # nested payload. Pass the complete agent_data dict so required fields
        # (agentId, agentName, provider, action, credentialId) are present.
        request_body = {
            "agentId": agent_data.get("agentId"),
            "agentName": agent_data.get("agentName"),
            "provider": agent_data.get("provider"),
            "action": agent_data.get("action"),
            "credentialId": agent_data.get("credentialId"),
            "payload": payload,
        }

        async with httpx.AsyncClient(
            timeout=timeout,
            base_url=base_url,
            verify=settings.SSL_VERIFY,
        ) as client:
            method_upper = method.upper()
            if method_upper == "POST":
                response = await client.post(endpoint, json=request_body, headers=headers)
            elif method_upper == "GET":
                response = await client.get(endpoint, params=payload, headers=headers)
            else:
                response = await client.request(method_upper, endpoint, json=request_body, headers=headers)

            response.raise_for_status()
            result = response.json()

        return {"status": "success", "response": result}

    except httpx.HTTPStatusError as e:
        logger.exception(f"HTTP error while calling {endpoint}")
        return {
            "status": "failed",
            "error": f"HTTP error {e.response.status_code}: {e.response.text}"
        }
    except httpx.RequestError as e:
        logger.exception(f"Request error while calling {endpoint}")
        return {"status": "failed", "error": str(e)}
    except Exception as e:
        logger.exception(f"Unexpected error while calling {endpoint}")
        return {"status": "failed", "error": str(e)}