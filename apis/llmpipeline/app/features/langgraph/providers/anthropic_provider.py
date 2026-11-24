import re
from typing import Any

from fastapi import HTTPException
from langchain_anthropic import ChatAnthropic

from app.core.config import settings
from app.core.credit_manager import CreditManagerService
from app.core.logger import logger
from app.core.vault_credential_manager import VaultCredentialManager
from app.features.auth.authenticated_user import User
from app.features.litellm.core.credentials import is_byok
from app.features.llm_providers.llm_providers_schemas import LLMRequest

# IMPORTANT NOTE: the model catalog stores OpenRouter-style IDs ("anthropic/claude-4.5-haiku-20251001"),
# but the direct Anthropic API only accepts "claude-haiku-4-5-20251001". Sending the catalog form returns 404.
_CATALOG_MODEL_ID = re.compile(
    r"^claude-(?:(\d+)\.(\d+)-(opus|sonnet|haiku)|(opus|sonnet|haiku)-(\d+)\.(\d+))(-\d{8})?$"
)


def normalize_anthropic_base_url(url: str) -> str:
    """Return the base URL without a trailing /v1, because the SDK appends /v1/messages itself."""
    base_url = (url or "").strip().rstrip("/")
    if base_url.endswith("/v1"):
        base_url = base_url[: -len("/v1")]
    return base_url


def normalize_anthropic_model_id(model: str) -> str:
    """Return the direct Anthropic API model ID for a catalog or API model ID."""
    model_id = (model or "").strip()
    if model_id.lower().startswith("anthropic/"):
        model_id = model_id[len("anthropic/"):]

    match = _CATALOG_MODEL_ID.match(model_id)
    if not match:
        return model_id

    if match.group(3):
        major, minor, family = match.group(1), match.group(2), match.group(3)
    else:
        family, major, minor = match.group(4), match.group(5), match.group(6)

    date_suffix = match.group(7) or ""
    return f"claude-{family}-{major}-{minor}{date_suffix}"


# IMPORTANT NOTE: agents store a "medium" effort even when no builder chose it, so Claude gets an
# effort only from Home chat, where the user picks it per message; agent support needs an explicit opt-in.
HOME_CHAT_ACTION = "LandingChat"

_CLAUDE_FAMILY_FIRST = re.compile(
    r"^claude-(opus|sonnet|haiku|fable|mythos)-(\d+)(?:-(\d{1,2}))?(?:-\d{8})?$"
)
_CLAUDE_VERSION_FIRST = re.compile(
    r"^claude-(\d+)(?:\.(\d+))?-(opus|sonnet|haiku|fable|mythos)(?:-\d{8})?$"
)


def _claude_version(model: str) -> tuple[str, int, int] | None:
    model_id = normalize_anthropic_model_id((model or "").lower())
    if match := _CLAUDE_FAMILY_FIRST.match(model_id):
        return match.group(1), int(match.group(2)), int(match.group(3) or 0)
    if match := _CLAUDE_VERSION_FIRST.match(model_id):
        return match.group(3), int(match.group(1)), int(match.group(2) or 0)
    return None


def supports_anthropic_effort(model: str) -> bool:
    """Whether the model takes adaptive thinking with Anthropic's effort setting."""
    version = _claude_version(model)
    if version is None:
        return False
    family, major, minor = version
    if family in ("fable", "mythos"):
        return True
    if family == "haiku":
        return major >= 5
    return (major, minor) >= (4, 6)


def anthropic_effort_kwargs(model: str, reasoning_effort: str | None) -> dict[str, Any]:
    """ChatAnthropic arguments for the requested effort, or none when the model can't take it."""
    if not reasoning_effort or not supports_anthropic_effort(model):
        return {}
    return {"thinking": {"type": "adaptive"}, "output_config": {"effort": reasoning_effort}}


def create_anthropic_model(
    llm_request: LLMRequest,
    user: User,
) -> ChatAnthropic:
    """
    Create Anthropic chat model using BYOK or platform credentials.
    """

    # Resolved credentials used to create the model
    resolved_api_key: str | None = None
    resolved_base_url: str | None = None

    # Use user credentials when BYOK is enabled
    if is_byok(llm_request.credential_name):

        # Initialize vault credential client
        vault_credential_manager = VaultCredentialManager()

        logger.debug(
            "Fetching Anthropic BYOK credentials. credential_name=%s",
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
                "Anthropic BYOK credentials not found. credential_name=%s",
                llm_request.credential_name,
            )

            raise HTTPException(
                status_code=400,
                detail="Unable to retrieve Anthropic credentials.",
            )

        # Extract credential values
        credential_data = credential.get("data", {})

        # Resolve user API credentials
        resolved_api_key = credential_data.get("ApiKey")
        resolved_base_url = (
            credential_data.get("Url")
            or settings.CLAUDE_API_URL
        )

        # Validate API key exists
        if not resolved_api_key:
            raise HTTPException(
                status_code=400,
                detail="Anthropic API key is missing.",
            )

        logger.debug(
            "Anthropic BYOK credentials loaded successfully."
        )

    else:

        # Initialize credit manager
        credit_manager = CreditManagerService()

        # Validate user credits
        has_credit = credit_manager.has_sufficient_credits(
            task="anthropic",
            jwt=user.access_token,
        )

        # Stop request when credits are insufficient
        if not has_credit:
            logger.warning(
                "Insufficient Anthropic credits. user=%s",
                user.username,
            )

            raise HTTPException(
                status_code=400,
                detail="Insufficient credits to continue.",
            )

        # Load platform credentials
        resolved_api_key = settings.CLAUDE_API_KEY
        resolved_base_url = settings.CLAUDE_API_URL

        # Validate platform configuration
        if not resolved_api_key or not resolved_base_url:
            logger.error(
                "Anthropic platform configuration is missing."
            )

            raise HTTPException(
                status_code=400,
                detail="Anthropic configuration is incomplete.",
            )

    # Create raw Anthropic model.
    # Tool binding and structured output are applied later inside LangGraph nodes.
    # IMPORTANT NOTE: the anthropic SDK sends API version 2026-10-21, which rejects temperature,
    # top_p and top_k on every model with a 400, so the request's sampling values are not forwarded.
    return ChatAnthropic(
        model=normalize_anthropic_model_id(llm_request.model),
        max_tokens=llm_request.max_output_tokens,
        stream_usage=True,
        api_key=resolved_api_key,
        base_url=normalize_anthropic_base_url(resolved_base_url),
        **anthropic_effort_kwargs(
            llm_request.model,
            llm_request.reasoning_effort if llm_request.action == HOME_CHAT_ACTION else None,
        ),
    )