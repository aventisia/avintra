from fastapi import HTTPException
from langchain_openrouter import ChatOpenRouter

from app.core.config import settings
from app.core.credit_manager import CreditManagerService
from app.core.logger import logger
from app.core.vault_credential_manager import VaultCredentialManager
from app.features.auth.authenticated_user import User
from app.features.llm_providers.llm_providers_schemas import LLMRequest


def create_openrouter_model(
    llm_request: LLMRequest,
    user: User,
) -> ChatOpenRouter:
    """
    Create OpenRouter chat model using BYOK or platform credentials.
    """

    # Resolved credentials used to initialize the model
    resolved_api_key: str | None = None
    resolved_base_url: str | None = None

    # Use user-provided credentials when BYOK is enabled
    if llm_request.is_byok_enabled and llm_request.credential_name:

        # Initialize vault credential client
        vault_credential_manager = VaultCredentialManager()

        logger.debug(
            "Fetching OpenRouter BYOK credentials. credential_name=%s",
            llm_request.credential_name,
        )

        # Retrieve credentials from the vault credential
        credential = vault_credential_manager.get_vault_credential_secret_by_name(
            credential=llm_request.credential_name,
            jwt=user.access_token,
            env_type=user.env_type,
            tenant_id=str(user.tenant_id) if user.tenant_id else None,
            space_id=user.space_id,
        )

        # Validate credential exists
        if not credential:
            logger.error(
                "OpenRouter BYOK credentials not found. credential_name=%s",
                llm_request.credential_name,
            )

            raise HTTPException(
                status_code=400,
                detail="Unable to retrieve OpenRouter credentials.",
            )

        # Extract credential values
        credential_data = credential.get("data", {})

        # Resolve user API credentials
        resolved_api_key = credential_data.get("ApiKey")
        resolved_base_url = (
            credential_data.get("Url")
            or settings.OPENROUTER_API_URL
        )

        # Validate API key exists
        if not resolved_api_key:
            logger.error(
                "OpenRouter API key missing in BYOK credentials."
            )

            raise HTTPException(
                status_code=400,
                detail="OpenRouter API key is missing.",
            )

        logger.debug(
            "OpenRouter BYOK credentials loaded successfully."
        )

    else:

        # Initialize credit manager
        credit_manager = CreditManagerService()

        # Validate user credits before using platform resources
        has_credit = credit_manager.has_sufficient_credits(
            task="openrouter",
            jwt=user.access_token,
        )

        # Stop request when credits are insufficient
        if not has_credit:
            logger.warning(
                "Insufficient OpenRouter credits. user=%s",
                user.username,
            )

            raise HTTPException(
                status_code=400,
                detail="Insufficient credits to continue.",
            )

        # Load platform credentials
        resolved_api_key = settings.OPENROUTER_API_KEY
        resolved_base_url = settings.OPENROUTER_API_URL

        # Validate platform configuration
        if not resolved_api_key or not resolved_base_url:
            logger.error(
                "OpenRouter platform configuration is missing."
            )

            raise HTTPException(
                status_code=400,
                detail="OpenRouter configuration is incomplete.",
            )

    # Create OpenRouter model client
    # Tool binding and structured output are applied later inside LangGraph nodes.
    return ChatOpenRouter(
        model=llm_request.model,
        temperature=llm_request.temperature,
        top_p=llm_request.top_p,
        max_tokens=llm_request.max_output_tokens,
        stream_usage=True,
        api_key=resolved_api_key,
        base_url=resolved_base_url,
    )