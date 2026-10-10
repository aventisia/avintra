import requests
from fastapi import HTTPException
from app.core.logger import logger
from typing import Dict, Any
import uuid
from app.core.config import settings

class VaultManager:
    # Constructor: To initialize API URL and key (if any)
    def __init__(self, api_url: str =  f"https://{settings.APP_BASE_URL}/workspace/api/vault-credential"):
        self.api_url = api_url

    def get_vault_secret_by_name(
        self,
        credential: str,
        jwt: str = None,
        env_type: str = "dev",
        tenant_id: str = None,
        space_id: str = None,
    ) -> Dict[str, Any]:
        """
        Fetches vault secret details by its NAME from the API.

        Runtime credential resolution is ALWAYS keyed by the credential NAME
        (never by id/GUID). The backend scopes the lookup by tenant_id + space_id
        + env_type, so the credential_name + tenant_id combination must be unique.

        :param credential: The NAME of the vault secret to retrieve.
        :param jwt: Optional JWT token for authorization.
        :param env_type: The deployment environment ("dev" or "prod") forwarded as X-Env-Type.
        :param tenant_id: The tenant id used to scope the credential lookup (X-Tenant-Id header).
        :param space_id: The space id used to scope the credential lookup (X-Space-Id header).
        :return: A dictionary containing vault secret data or an error message.
        """
        return self._get_vault_secret_by_name(
            credential,
            jwt,
            env_type=env_type,
            tenant_id=tenant_id,
            space_id=space_id,
        )

    def _get_vault_secret_by_name(
        self,
        vault_secret_name: str,
        jwt: str = None,
        env_type: str = "dev",
        tenant_id: str = None,
        space_id: str = None,
    ) -> Dict[str, Any]:
        """Fetches vault secret details by its NAME from the API."""
        try:
            if not vault_secret_name:
                return None

            # Prepare request headers
            headers = {"Content-Type": "application/json", "X-Env-Type": env_type}

            # Include tenant/space scoping headers so the backend resolves the
            # credential by (name + tenant_id [+ space_id]) for uniqueness.
            if tenant_id:
                headers["X-Tenant-Id"] = str(tenant_id)
            if space_id:
                headers["X-Space-Id"] = str(space_id)

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
