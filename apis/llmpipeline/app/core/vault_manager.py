import requests
from app.core.logger import logger
from typing import Dict, Any
import uuid
from app.core.config import settings

class VaultManager:
    # Constructor: To initialize API URL and key (if any)
    def __init__(self, api_url: str =  f"https://{settings.APP_BASE_URL}/workspace/api/app-secret"):
        self.api_url = api_url

    def get_vault_secret_by_id(self, vault_secret_id: str, jwt: str = None) -> Dict[str, Any]:
        """
        Fetches vault secret details by its ID from the API.

        :param vault_secret_id: The GUID of the vault secret to retrieve.
        :param jwt: Optional JWT token for authorization.
        :return: A dictionary containing vault secret data or an error message.
        """
        try:
            # Validate if the vault_secret_id is a valid UUID
            try:
                uuid.UUID(vault_secret_id)
            except ValueError:
                return {"error": "Invalid vaultSecretId. Must be a valid GUID."}

            # Prepare request headers
            headers = {"Content-Type": "application/json"}
            
            # Include Authorization header if JWT is provided
            if jwt:
                headers["Authorization"] = f"Bearer {jwt}"

            # Make the request to fetch vault secret data
            response = requests.get(
                f"{self.api_url}/decrypted-data/{vault_secret_id}",
                headers=headers,
                timeout=60,
                verify=settings.SSL_VERIFY,
            )
            
            # Handle non-successful response
            if not response.ok:
                logger.error(f"Failed to fetch vault secret. Status code: {response.status_code}. Message: {response.text}")
                return None
            
            # Parse the response JSON
            vault_secret_data = response.json()

            # The backend wraps the secret inside a ServiceResponse -> "data" field
            data = vault_secret_data.get("data")

            # Check if 'data' is present in the response
            if not data:
                logger.warning(f"No data found for vaultSecretId: {vault_secret_id}")
                return None
            
            # Successful retrieval of vault secret data
            logger.info(f"Successfully retrieved vault secret for vaultSecretId: {vault_secret_id}")
            return data
        
        except Exception as ex:
            # Log the exception if something goes wrong and return None so callers
            # surface a clean "invalid credentials" error instead of crashing.
            logger.error(f"Error retrieving vault secret for vaultSecretId {vault_secret_id}: {ex}")
            return None
