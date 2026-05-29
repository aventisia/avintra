from app.features.auth.authenticated_user import User
import httpx
from typing import Dict, Any
from app.core.logger import logger
from app.core.config import settings

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
        "Authorization": f"Bearer {user.access_token}"
    }

    if not endpoint:
        return {"status": "failed", "error": "No endpoint provided in agent data"}

    try:
        logger.info(f"Agent '{agent_data.get('agentName')}' calling endpoint: {endpoint}")
        logger.info(f"Payload: {payload}")

        timeout = httpx.Timeout(600.0)

        async with httpx.AsyncClient(
            timeout=timeout,
            base_url=f"https://{settings.APP_BASE_URL}/workspace/api"
        ) as client:
            
            method_upper = method.upper()
            if method_upper == "POST":
                response = await client.post(endpoint, json=payload, headers=headers)
            elif method_upper == "GET":
                response = await client.get(endpoint, params=payload, headers=headers)
            else:
                response = await client.request(method_upper, endpoint, json=payload, headers=headers)

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