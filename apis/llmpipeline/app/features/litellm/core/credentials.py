# Credential resolution for the LiteLLM feature.
#
# Shared by every capability (text_generation, embeddings, stt, tts) so the
# BYOK-vs-env decision is a single source of truth. Extracted from the former
# `litellm_service.py` so the transport layer stays a pure LiteLLM wrapper and
# each capability folder can reuse the same credential logic.
from __future__ import annotations

from dataclasses import dataclass, field

from fastapi import HTTPException

from app.core.config import settings
from app.core.logger import logger
from app.core.vault_credential_manager import VaultCredentialManager
from app.features.auth.authenticated_user import User


@dataclass
class CredentialResolution:
    """Result of resolving credentials for a provider call.

    Attributes:
        kwargs: Provider-aware kwargs to spread into the LiteLLM call. Empty
            when using environment credentials (LiteLLM reads its own env vars).
        uses_platform_credentials: True when the request runs on the platform's
            environment credentials (non-BYOK), so platform credits apply.
            False when the caller supplied their own (BYOK) credentials.
        credential_name: The display name of the BYOK vault credential
            (None when not BYOK).
    """
    kwargs: dict = field(default_factory=dict)
    uses_platform_credentials: bool = True
    credential_name: str | None = None


def resolve_credentials(provider: str, is_byok: bool, credential_name: str | None, user: User) -> CredentialResolution:
    """
    Decide which credentials to use for a provider call.

    - BYOK enabled with a valid credential name: fetch those credentials
      from the vault credential and use them exclusively — never the env. The request is
      a BYOK request, so no platform credits apply.
    - BYOK disabled (or null/default credential): return an empty kwargs dict
      so LiteLLM uses its own environment variables (e.g. OPENAI_API_KEY).
      Platform credit tracking is enabled.

    Returns a `CredentialResolution` carrying the provider-aware kwargs and a
    flag indicating whether platform (env) credentials are in use. This is the
    single source of truth for authentication and billing across text
    generation, streaming, STT and TTS.
    """
    # Non-BYOK: use platform credentials from settings (platform credit tracking applies).
    if not is_byok and not credential_name:
        kwargs = _platform_credentials_kwargs(provider)
        return CredentialResolution(kwargs=kwargs, uses_platform_credentials=True)

    # BYOK must always carry a real credential name; never fall back to the env.
    if not _is_real_credential(credential_name):
        logger.error(
            f"[LLM-V2] BYOK enabled but no credential for provider {provider}"
        )
        raise HTTPException(
            status_code=400, detail="A valid credential is required when BYOK is enabled."
        )

    vault_credential = VaultCredentialManager()
    credential = vault_credential.get_vault_credential_secret_by_name(
        credential=credential_name,
        jwt=user.access_token,
        env_type=user.env_type,
        tenant_id=str(user.tenant_id) if user.tenant_id else None,
        space_id=user.space_id,
    )
    if not credential:
        logger.error(f"[LLM-V2] Invalid BYOK credentials for provider {provider}")
        raise HTTPException(status_code=400, detail="No valid credentials found.")

    credential_data = credential.get("data") or credential
    # The vault credential secret carries a display Name at the top level; fall back to the
    # credential name when it is not present so BYOK usage can still be attributed.
    resolved_name = credential.get("Name") or credential_data.get("Name") or credential_name

    # AWS-style providers authenticate via AWS credentials, not an api_key.
    if provider in _AWS_PROVIDERS:
        kwargs: dict = {
            "aws_access_key_id": credential_data.get("AccessKeyId"),
            "aws_secret_access_key": credential_data.get("SecretAccessKey"),
            "aws_region_name": credential_data.get("Region"),
        }
        session_token = credential_data.get("SessionToken")
        if session_token:
            kwargs["aws_session_token"] = session_token
        return CredentialResolution(
            kwargs={k: v for k, v in kwargs.items() if v is not None},
            uses_platform_credentials=False,
            credential_name=resolved_name,
        )

    # Google Vertex AI uses a service-account JSON + project + location.
    if provider in _VERTEX_PROVIDERS:
        kwargs = {
            "vertex_project": credential_data.get("ProjectId"),
            "vertex_location": credential_data.get("Location"),
            "vertex_credentials": credential_data.get("ServiceAccountJson"),
        }
        return CredentialResolution(
            kwargs={k: v for k, v in kwargs.items() if v is not None},
            uses_platform_credentials=False,
            credential_name=resolved_name,
        )

    # Azure OpenAI uses a key + endpoint + version.
    if provider in _AZURE_PROVIDERS:
        kwargs = {
            "api_key": credential_data.get("ApiKey"),
            "api_base": credential_data.get("Endpoint") or credential_data.get("Url"),
            "api_version": credential_data.get("ApiVersion"),
        }
        return CredentialResolution(
            kwargs={k: v for k, v in kwargs.items() if v is not None},
            uses_platform_credentials=False,
            credential_name=resolved_name,
        )

    # IBM WatsonX uses a key + project id + region.
    if provider in _WATSONX_PROVIDERS:
        kwargs = {
            "api_key": credential_data.get("ApiKey"),
            "watsonx_project_id": credential_data.get("ProjectId"),
            "watsonx_region": credential_data.get("Region"),
        }
        return CredentialResolution(
            kwargs={k: v for k, v in kwargs.items() if v is not None},
            uses_platform_credentials=False,
            credential_name=resolved_name,
        )

    # Key-based providers: api_key + optional api_base/api_version.
    kwargs = {
        "api_key": credential_data.get("ApiKey"),
        "api_base": credential_data.get("Url") or credential_data.get("Host"),
        "api_version": credential_data.get("ApiVersion"),
    }
    return CredentialResolution(
        kwargs={k: v for k, v in kwargs.items() if v is not None},
        uses_platform_credentials=False,
        credential_name=resolved_name,
    )


def resolve_credential_name(
    credential_name: str | None,
    user: User | None = None,
    *,
    jwt: str | None = None,
) -> str | None:
    """Resolve the display name for a vault credential name.

    Used for BYOK usage attribution. Returns the credential's `Name` if the
    secret is found, otherwise falls back to the credential name itself.
    Accepts either a `User` instance (from which the access token and tenant
    scoping are read) or a raw `jwt` keyword argument.
    """
    if not _is_real_credential(credential_name):
        return None

    access_token = jwt
    tenant_id = None
    space_id = None
    env_type = "dev"
    if access_token is None and user is not None:
        access_token = user.access_token
        tenant_id = str(user.tenant_id) if user.tenant_id else None
        space_id = user.space_id
        env_type = user.env_type

    if not access_token:
        logger.warning(
            f"[LLM-V2] resolve_credential_name called without an access token for credential {credential_name}"
        )
        return credential_name

    try:
        vault_credential = VaultCredentialManager()
        credential = vault_credential.get_vault_credential_secret_by_name(
            credential=credential_name,
            jwt=access_token,
            env_type=env_type,
            tenant_id=tenant_id,
            space_id=space_id,
        )
        if not credential:
            return credential_name

        credential_data = credential.get("data") or credential
        name = credential.get("Name") or credential_data.get("Name")
        return name if name else credential_name
    except Exception as exc:
        logger.warning(
            f"[LLM-V2] Failed to resolve credential name for {credential_name}: {exc}"
        )
        return credential_name


def _is_real_credential(credential_name: str | None) -> bool:
    """True when a real (non-null / non-empty) credential name is supplied."""
    if not credential_name:
        return False
    cleaned = str(credential_name).strip()
    return cleaned != ""


def _platform_credentials_kwargs(provider: str) -> dict:
    """Build LiteLLM kwargs from platform settings for the given provider.

    pydantic_settings loads .env/.env.local into `settings` but does not export
    them back into os.environ. LiteLLM reads API keys from os.environ, so we
    must pass the platform credentials explicitly for non-BYOK requests.
    """
    provider = provider.lower()

    if provider == "openai":
        return _drop_empty(
            api_key=settings.OPENAI_API_KEY,
            api_base=settings.OPENAI_API_URL,
        )

    if provider == "anthropic":
        return _drop_empty(
            api_key=settings.CLAUDE_API_KEY,
            api_base=settings.CLAUDE_API_URL,
        )

    if provider == "gemini":
        return _drop_empty(
            api_key=settings.GEMINI_API_KEY,
            api_base=settings.GEMINI_API_URL,
        )

    if provider == "openrouter":
        return _drop_empty(
            api_key=settings.OPENROUTER_API_KEY,
            api_base=settings.OPENROUTER_API_URL,
        )

    if provider == "deepinfra":
        return _drop_empty(
            api_key=settings.DEEPINFRA_API_KEY,
            api_base=settings.DEEPINFRA_API_URL,
        )

    if provider == "ollama":
        return _drop_empty(
            api_base=settings.OLLAMA_API_URL,
            api_key=settings.OLLAMA_API_KEY or None,
        )

    if provider == "elevenlabs":
        return _drop_empty(
            api_key=settings.ELEVENLABS_API_KEY,
            api_base=settings.ELEVENLABS_API_URL,
        )

    # Unknown / unsupported provider: fall back to environment variables so we
    # don't break providers that rely on process-level env configuration.
    return {}


def _drop_empty(**kwargs) -> dict:
    """Return a dict with only truthy values, filtering out empty strings."""
    return {k: v for k, v in kwargs.items() if v}


# Providers that authenticate via AWS credentials.
_AWS_PROVIDERS = {
    "bedrock", "bedrock_mantle", "sagemaker", "sagemaker_chat", "sagemaker_nova",
    "aws_polly", "amazon_nova",
}

# Providers that use Google Vertex service-account credentials.
_VERTEX_PROVIDERS = {"vertex_ai", "vertex_ai_beta"}

# Providers that use Azure OpenAI-style credentials.
_AZURE_PROVIDERS = {"azure", "azure_ai", "azure_text", "azure_anthropic"}

# Providers that use IBM WatsonX credentials.
_WATSONX_PROVIDERS = {"watsonx", "watsonx_text"}
