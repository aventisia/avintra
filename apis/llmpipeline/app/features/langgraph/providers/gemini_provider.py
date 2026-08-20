from fastapi import HTTPException
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings
from app.core.credit_manager import CreditManagerService
from app.core.logger import logger
from app.core.vault_manager import VaultManager
from app.features.auth.authenticated_user import User
from app.features.llm_providers.llm_providers_schemas import LLMRequest


def create_gemini_model(
    llm_request: LLMRequest,
    user: User,
) -> ChatGoogleGenerativeAI:
    """
    Create Gemini chat model using BYOK or platform credentials.
    """

    # Resolved credentials used to create the model
    resolved_api_key: str | None = None
    resolved_base_url: str | None = None

    # Use user-provided credentials when BYOK is enabled
    if llm_request.is_byok_enabled and llm_request.credential_name:

        # Initialize vault client
        vault_manager = VaultManager()

        logger.info(
            "Fetching Gemini BYOK credentials. credential_name=%s",
            llm_request.credential_name,
        )

        # Retrieve credentials from vault
        credential = vault_manager.get_vault_secret_by_name(
            credential=llm_request.credential_name,
            jwt=user.access_token,
            env_type=user.env_type,
            tenant_id=str(user.tenant_id) if user.tenant_id else None,
            space_id=user.space_id,
        )

        # Validate credential exists
        if not credential:
            logger.error(
                "Gemini BYOK credentials not found. credential_name=%s",
                llm_request.credential_name,
            )

            raise HTTPException(
                status_code=400,
                detail="Unable to retrieve Gemini credentials.",
            )

        # Extract credential values
        credential_data = credential.get("data", {})

        # Resolve user API credentials
        resolved_api_key = credential_data.get("ApiKey")
        resolved_base_url = (
            credential_data.get("Url")
            or settings.GEMINI_API_URL
        )

        # Validate API key exists
        if not resolved_api_key:
            logger.error(
                "Gemini API key missing in BYOK credentials."
            )

            raise HTTPException(
                status_code=400,
                detail="Gemini API key is missing.",
            )

        logger.info(
            "Gemini BYOK credentials loaded successfully."
        )

    else:

        # Initialize credit manager
        credit_manager = CreditManagerService()

        # Validate user credits before using platform resources
        has_credit = credit_manager.has_sufficient_credits(
            task="gemini",
            jwt=user.access_token,
        )

        # Stop request when credits are insufficient
        if not has_credit:
            logger.warning(
                "Insufficient Gemini credits. user=%s",
                user.username,
            )

            raise HTTPException(
                status_code=400,
                detail="Insufficient credits to continue.",
            )

        # Load platform credentials
        resolved_api_key = settings.GEMINI_API_KEY
        resolved_base_url = settings.GEMINI_API_URL

        # Validate platform configuration
        if not resolved_api_key or not resolved_base_url:
            logger.error(
                "Gemini platform configuration is missing."
            )

            raise HTTPException(
                status_code=500,
                detail="Gemini configuration is incomplete.",
            )

    # Create Gemini model client.
    # Tool binding and structured output are applied later inside LangGraph nodes.
    return ChatGoogleGenerativeAI(

        model=llm_request.model,
        temperature=llm_request.temperature,
        top_p=llm_request.top_p,
        max_tokens=llm_request.max_output_tokens,
        stream_usage=True,
        api_key=resolved_api_key,
        base_url=resolved_base_url,
    )