import requests
from fastapi import HTTPException
from app.core.logger import logger
from typing import Dict, Any
import uuid
from app.core.config import settings

class VaultManager:
    # Constructor: To initialize API URL and key (if any)
    def __init__(self, api_url: str =  f"https://{settings.APP_BASE_URL}/workspace/api/app-secret"):
        self.api_url = api_url

    def get_vault_secret_by_name(self, credential: str, jwt: str = None, env_type: str = "dev") -> Dict[str, Any]:
        """
        Fetches vault secret details by its NAME (or legacy ID) from the API.

        Newer flows store the credential NAME. Legacy flows store a GUID. This method
        dispatches on the value shape: a valid UUID is resolved via the by-id
        endpoint, otherwise the value is treated as a credential name.

        :param credential: The NAME or GUID of the vault secret to retrieve.
        :param jwt: Optional JWT token for authorization.
        :param env_type: The deployment environment ("dev" or "prod") forwarded as X-Env-Type.
        :return: A dictionary containing vault secret data or an error message.
        """
        # A name is not a valid UUID, so route to the by-name lookup.
        # try:
        #     uuid.UUID(str(credential))
        # except ValueError:
        return self._get_vault_secret_by_name(credential, jwt, env_type=env_type)
        # return self._get_vault_secret_by_id(credential, jwt, env_type=env_type)

    def _get_vault_secret_by_id(self, vault_secret_id: str, jwt: str = None, env_type: str = "dev") -> Dict[str, Any]:
        """Fetches vault secret details by its GUID from the by-id API."""
        try:
            # Prepare request headers
            headers = {"Content-Type": "application/json", "X-Env-Type": env_type}
            
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

            # Surface the backend's real reason on failure instead of hiding it.
            if not response.ok:
                detail = self._error_detail(response, vault_secret_id, env_type)
                logger.error(detail)
                raise HTTPException(status_code=response.status_code, detail=detail)

            # Parse the response JSON
            vault_secret_data = response.json()

            # The backend wraps the secret inside a ServiceResponse -> "data" field
            data = vault_secret_data.get("data")

            # Check if 'data' is present in the response
            if not data:
                detail = (
                    f"No credentials found for id '{vault_secret_id}' in the "
                    f"'{env_type}' environment."
                )
                logger.warning(detail)
                raise HTTPException(status_code=404, detail=detail)

            # Successful retrieval of vault secret data
            logger.info(f"Successfully retrieved vault secret for vaultSecretId: {vault_secret_id}")
            return data

        except HTTPException:
            raise
        except Exception as ex:
            # Log the exception if something goes wrong and raise an actionable error
            # so callers don't report a generic "invalid credentials" message.
            detail = f"Error retrieving vault secret for id '{vault_secret_id}' in the '{env_type}' environment: {ex}"
            logger.error(detail)
            raise HTTPException(status_code=500, detail=detail)

    def _get_vault_secret_by_name(self, vault_secret_name: str, jwt: str = None, env_type: str = "dev") -> Dict[str, Any]:
        """Fetches vault secret details by its NAME from the API."""
        try:
            if not vault_secret_name:
                return None

            # Prepare request headers
            headers = {"Content-Type": "application/json", "X-Env-Type": env_type}

            # Include Authorization header if JWT is provided
            if jwt:
                headers["Authorization"] = f"Bearer {jwt}"

            # Make the request to fetch vault secret data by name
            response = requests.get(
                f"{self.api_url}/decrypted-data/by-name/{vault_secret_name}",
                headers=headers,
                timeout=60,
                verify=settings.SSL_VERIFY,
            )

            # Surface the backend's real reason on failure instead of hiding it.
            if not response.ok:
                detail = self._error_detail(response, vault_secret_name, env_type)
                logger.error(detail)
                raise HTTPException(status_code=response.status_code, detail=detail)

            # Parse the response JSON
            vault_secret_data = response.json()

            # The backend wraps the secret inside a ServiceResponse -> "data" field
            data = vault_secret_data.get("data")

            # Check if 'data' is present in the response
            if not data:
                detail = (
                    f"No credentials found for name '{vault_secret_name}' in the "
                    f"'{env_type}' environment."
                )
                logger.warning(detail)
                raise HTTPException(status_code=404, detail=detail)

            # Successful retrieval of vault secret data
            logger.info(f"Successfully retrieved vault secret for name: {vault_secret_name}")
            return data

        except HTTPException:
            raise
        except Exception as ex:
            # Log the exception if something goes wrong and raise an actionable error
            # so callers don't report a generic "invalid credentials" message.
            detail = f"Error retrieving vault secret for name '{vault_secret_name}' in the '{env_type}' environment: {ex}"
            logger.error(detail)
            raise HTTPException(status_code=500, detail=detail)

    def _error_detail(self, response, credential_ref: str, env_type: str) -> str:
        """Builds an actionable error message from a failed vault backend response.

        The backend returns a plain-text message for non-2xx responses (e.g.
        "Credential not found." or "You do not have access to view this
        credential."). We forward that reason verbatim so the caller can tell a
        wrong name apart from a missing value or a permissions problem.
        """
        backend_reason = (response.text or "").strip()
        base = (
            f"Failed to load credential '{credential_ref}' in the "
            f"'{env_type}' environment"
        )
        if backend_reason:
            return f"{base}: {backend_reason}"
        return f"{base}. Status code: {response.status_code}."
