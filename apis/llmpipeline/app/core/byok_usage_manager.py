import json
import uuid
import requests
from app.core.logger import logger
from app.core.config import settings


class ByokUsageManager:
    """Posts BYOK (Bring Your Own Key) consumption to the Accounts API.

    Unlike platform credit usage, BYOK consumption is not billed against the
    platform's credit system. It records the provider's own unit of measurement
    (tokens, seconds, characters) so admins can see how much a user's own key
    consumed. The payload mirrors the Accounts API `ByokUsageDto` expectations.
    """

    # Constructor: To initialize API URL
    def __init__(self, api_url: str = f"https://{settings.APP_BASE_URL}/accounts/api/byok-usage"):
        self.api_url = api_url

    # Post BYOK usage
    def post_byok_usage(self, task: str, request: list[dict], jwt: str):
        """
        Posts BYOK usage to the external API.
        """

        # Set headers
        headers = {"Content-Type": "application/json"}

        # Add Authorization header if JWT is provided
        if jwt:
            headers["Authorization"] = f"Bearer {jwt}"

        sanitized_request = self._sanitize_byok_usage_payload(request)

        # Try to post BYOK usage
        try:
            logger.info(f"BYOK usage post list:\n{json.dumps(sanitized_request, indent=2)}")
            response = requests.post(f"{self.api_url}/bulk", json=sanitized_request, headers=headers, timeout=60, verify=settings.SSL_VERIFY)
            response.raise_for_status()
            logger.info(f"ByokUsageManager: Successfully posted BYOK usage for task {task}")
        except Exception as e:
            logger.error(f"ByokUsageManager: Failed to post BYOK usage for task {task}: {e}")

    def _sanitize_byok_usage_payload(self, payload: list[dict]) -> list[dict]:
        """
        Normalizes payload fields to match Accounts API DTO expectations.
        """
        sanitized_items = []

        for item in payload:
            sanitized = dict(item)
            sanitized["RefId"] = self._sanitize_guid(sanitized.get("RefId"))
            sanitized["SpaceId"] = self._sanitize_guid(sanitized.get("SpaceId"))
            sanitized["CredentialId"] = self._sanitize_guid(sanitized.get("CredentialId"))
            sanitized["RefName"] = self._sanitize_optional_text(sanitized.get("RefName"))
            sanitized["CredentialName"] = self._sanitize_optional_text(sanitized.get("CredentialName"))
            sanitized["TriggeredByAgent"] = self._sanitize_optional_text(sanitized.get("TriggeredByAgent"))
            sanitized["RefType"] = self._sanitize_ref_type(sanitized.get("RefType"))
            sanitized["Action"] = self._sanitize_action(sanitized.get("Action"))
            sanitized_items.append(sanitized)

        return sanitized_items

    def _sanitize_optional_text(self, value):
        if value is None:
            return None
        if isinstance(value, str) and not value.strip():
            return None
        return value

    def _sanitize_guid(self, value):
        if value is None:
            return None

        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return None
            try:
                return str(uuid.UUID(stripped))
            except ValueError:
                return None

        return None

    def _sanitize_ref_type(self, value):
        sanitized = self._sanitize_optional_text(value)
        if sanitized is None:
            return None

        if not isinstance(sanitized, str):
            return None

        normalized = sanitized.strip().lower()
        alias_map = {
            "agent": "Agent",
            "chatagent": "Agent",
            "workflowagent": "Agent",
            "platform": "Platform",
        }

        return alias_map.get(normalized)

    def _sanitize_action(self, value):
        sanitized = self._sanitize_optional_text(value)
        if sanitized is None:
            return None

        if not isinstance(sanitized, str):
            return None

        normalized = sanitized.strip().lower()
        alias_map = {
            "agentexecution": "AgentExecution",
            "templatedescriptiongeneration": "TemplateDescriptionGeneration",
        }

        return alias_map.get(normalized)
