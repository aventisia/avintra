import json
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
            response = requests.get(f"{self.api_url}/available-credits", headers=headers, timeout=60)
            
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
            
        # Try to post credit usage
        try:
            logger.info(f"OpenAI response data:\n{json.dumps(request, indent=2)}")
            response = requests.post(f"{self.api_url}/bulk", json=request, headers=headers, timeout=60)
            response.raise_for_status()
            logger.info(f"CreditManagerService: Successfully posted credit usage for task {task}")
        except Exception as e:
            logger.error(f"CreditManagerService: Failed to post credit usage for task {task}: {e}")
