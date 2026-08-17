import json
from typing import Any

from fastapi import HTTPException
from langchain_openai import ChatOpenAI

from app.core.config import settings
from app.core.logger import logger
from app.core.vault_manager import VaultManager
from app.core.credit_manager import CreditManagerService
from app.features.auth.authenticated_user import User
from app.features.llm_providers.llm_providers_schemas import LLMRequest


def create_openai_model(
    llm_request: LLMRequest,
    user: User,
) -> ChatOpenAI:
    """
    Create OpenAI chat model using BYOK or platform credentials.
    """

    # Variables resolved from either BYOK or platform configuration
    resolved_api_key: str | None
    resolved_base_url: str | None

    # Use user-provided OpenAI credentials when BYOK is enabled
    if llm_request.is_byok_enabled and llm_request.credential_id:

        # Initialize vault client
        vault_manager = VaultManager()

        logger.info(
            "Fetching OpenAI BYOK credentials. credential_id=%s",
            llm_request.credential_id,
        )

        # Retrieve credentials from vault
        credential = vault_manager.get_vault_secret_by_id(
            vault_secret_id=llm_request.credential_id,
            jwt=user.access_token,
        )

        # Validate credential exists
        if not credential:
            raise HTTPException(
                status_code=400,
                detail="Unable to retrieve OpenAI credentials.",
            )

        # Extract credential values
        credential_data = credential.get("data", {})

        # Resolve user API credentials
        resolved_api_key = credential_data.get("ApiKey")
        resolved_base_url = (
            credential_data.get("Url")
            or settings.OPENAI_API_URL
        )

        # Validate API key exists
        if not resolved_api_key:
            raise HTTPException(
                status_code=400,
                detail="OpenAI API key is missing.",
            )

        logger.info(
            "OpenAI BYOK credentials loaded successfully."
        )

    else:

        # Initialize credit manager
        credit_manager = CreditManagerService()

        # Validate user credits before using platform resources
        has_credit = credit_manager.has_sufficient_credits(
            task="openai",
            jwt=user.access_token,
        )

        # Stop request when credits are insufficient
        if not has_credit:
            logger.warning(
                "Insufficient OpenAI credits. user=%s",
                user.username,
            )

            raise HTTPException(
                status_code=400,
                detail="Insufficient credits to continue.",
            )
        
        # Load platform credentials
        resolved_api_key = settings.OPENAI_API_KEY
        resolved_base_url = settings.OPENAI_API_URL

        # Validate platform configuration
        if not resolved_api_key or not resolved_base_url:
            raise HTTPException(
                status_code=400,
                detail="OpenAI configuration is incomplete.",
            )

    # Create OpenAI model instance.
    # Tool binding and structured output are applied later inside LangGraph nodes.
    # For reasoning models (o1/o3/gpt-5) we pass `reasoning_effort` (when set) so
    # the model emits reasoning content that can be streamed live. Some providers
    # expect it via `extra_body` rather than as a top-level ChatOpenAI arg, so we
    # set it on extra_body to be safe across OpenAI-compatible endpoints.
    model_kwargs = {}
    if llm_request.reasoning_effort:
        model_kwargs["reasoning_effort"] = llm_request.reasoning_effort

    return ChatOpenAI(
        model=llm_request.model,
        temperature=llm_request.temperature,
        top_p=llm_request.top_p,
        max_tokens=llm_request.max_output_tokens,
        stream_usage=True,
        api_key=resolved_api_key,
        base_url=resolved_base_url,
        extra_body=model_kwargs or None,
    )
