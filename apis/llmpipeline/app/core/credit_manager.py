import json
import uuid
import requests
from app.core.logger import logger
from app.core.config import settings

class CreditManagerService:
    # Constructor: To initialize API URL and key (if any)
    def __init__(self, api_url: str =  f"https://{settings.APP_BASE_URL}/accounts/api/credit-usage"):
        self.api_url = api_url

    # Check if user has sufficient credits
    def has_sufficient_credits(self, task: str, jwt: str) -> dict:
        """
        Checks if the user has sufficient credits by calling the external API.
        Returns a bool indicating if sufficient credits are available or not.
        """
        
        try:
            # Set headers
            headers = {"Content-Type": "application/json"}
            
            # Add Authorization header if JWT is provided
            if jwt:
                headers["Authorization"] = f"Bearer {jwt}"

            # Get available credits
            response = requests.get(f"{self.api_url}/available-credits", headers=headers, timeout=60, verify=settings.SSL_VERIFY)
            
            # Failed to get credits
            if not response.ok:
                logger.error(f"Failed to retrieve available credits. Response: {response.status_code} - {response.text}")
                return False
            
            # Try to extract available credits from response
            try:
                credits = response.json().get("data", {}).get("availableCredits", 0)
            except Exception:
                return False
            
            # Check credits and return result
            logger.info(f"Successfully retrieved available credits: {credits}")
            if credits <= 10:
                logger.warning(f"Insufficient credits available: {credits}")
                return False
            
            # Sufficient credits
            logger.info("Sufficient credits are available to continue.")
            return True
        except Exception as ex:
            logger.error(f"Exception in has_sufficient_credits: {ex}")
            return False

    # Post credit usage
    def post_credit_usage(self, task: str, request: list[dict], jwt: str):
        """
        Posts credit usage to the external API.
        """
        
        # Set headers
        headers = {"Content-Type": "application/json"}
        
        # Add Authorization header if JWT is provided
        if jwt:
            headers["Authorization"] = f"Bearer {jwt}"

        sanitized_request = self._sanitize_credit_usage_payload(request)
            
        # Try to post credit usage
        try:
            logger.info(f"Credit usage post list:\n{json.dumps(sanitized_request, indent=2)}")
            response = requests.post(f"{self.api_url}/bulk", json=sanitized_request, headers=headers, timeout=60, verify=settings.SSL_VERIFY)
            response.raise_for_status()
            logger.info(f"CreditManagerService: Successfully posted credit usage for task {task}")
        except Exception as e:
            logger.error(f"CreditManagerService: Failed to post credit usage for task {task}: {e}")

    def _sanitize_credit_usage_payload(self, payload: list[dict]) -> list[dict]:
        """
        Normalizes payload fields to match Accounts API DTO expectations.
        """
        sanitized_items = []

        for item in payload:
            sanitized = dict(item)
            sanitized["RefId"] = self._sanitize_guid(sanitized.get("RefId"))
            sanitized["RefName"] = self._sanitize_optional_text(sanitized.get("RefName"))
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
