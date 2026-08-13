from app.features.auth.authenticated_user import User
from app.features.llm_providers.llm_providers_schemas import LLMRequest

from app.features.langgraph.providers.openai_provider import create_openai_model
from app.features.langgraph.providers.anthropic_provider import create_anthropic_model
from app.features.langgraph.providers.gemini_provider import create_gemini_model
from app.features.langgraph.providers.openrouter_provider import create_openrouter_model


def create_chat_model(
    llm_request: LLMRequest,
    user: User,
):
    """
    Create a chat model based on the requested provider.
    """

    # Normalize provider name for case-insensitive matching
    provider = llm_request.provider.strip().lower()

    # Create OpenAI model
    if provider == "openai":
        return create_openai_model(
            user=user,
            llm_request=llm_request,
        )

    # Create Anthropic model
    if provider == "anthropic":
        return create_anthropic_model(
            user=user,
            llm_request=llm_request,
        )

    # Create Gemini model
    # The frontend/backend schema uses provider value "googlegemini"
    # (see LLMRequest.ProviderLiteral), so accept both that and the
    # shorter "gemini" alias to avoid an "Unsupported LLM provider" error.
    if provider in ("gemini", "googlegemini"):
        return create_gemini_model(
            user=user,
            llm_request=llm_request,
        )

    # Create OpenRouter model
    if provider == "openrouter":
        return create_openrouter_model(
            user=user,
            llm_request=llm_request,
        )

    # Reject unsupported providers
    raise ValueError(
        f"Unsupported LLM provider: {provider}"
    )