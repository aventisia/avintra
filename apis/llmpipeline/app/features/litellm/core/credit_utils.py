# Shared credit-usage helpers for the LiteLLM feature.
#
# Text generation / embeddings / STT / TTS all post credit usage through the
# provider registry's `get_credit_service_type`, which maps a provider+model to
# the backend `CreditServicesEnum` name. This module centralizes the credit
# check and usage-posting logic so every capability shares a single
# implementation.
from __future__ import annotations

import httpx
from fastapi import HTTPException

from app.core.byok_usage_manager import ByokUsageManager
from app.core.config import settings
from app.core.credit_manager import CreditManagerService
from app.core.logger import logger

from .provider_registry import get_credit_service_type, should_post_usage


def _workspace_api_base_url() -> str:
    """Return the base URL for WorkspaceAPIs internal calls.

    Defaults to ``https://{APP_BASE_URL}/api``. The ASP.NET backend uses a
    ``/api`` path base, so internal callers should target ``/api`` directly.
    Can be overridden via the ``WORKSPACE_API_URL`` setting for local dev.
    """
    default = f"https://{settings.APP_BASE_URL}/api"
    return getattr(settings, "WORKSPACE_API_URL", None) or default


def agent_has_fixed_credits(ref_id: str, access_token: str) -> bool:
    """Return whether the agent (flow version) has a fixed-credits override.

    When the Super Admin configured fixed credits for an agent in the Tenants
    section, every run of that agent is billed a fixed amount at job close
    (WorkspaceAPIs). The token-based credit postings in this pipeline must
    therefore be suppressed to avoid double-charging.

    Args:
        ref_id: The flow version (agent) ID the credit usage is attributed to.
        access_token: The authenticated user's JWT.

    Returns:
        True when the agent has a fixed-credits override and token-based
        platform credit postings should be skipped; False otherwise.
    """
    if not ref_id:
        return False

    try:
        headers = {"Content-Type": "application/json"}
        if access_token:
            headers["Authorization"] = f"Bearer {access_token}"

        url = f"{_workspace_api_base_url()}/execution/agent/{ref_id}/fixed-credits"
        response = httpx.get(url, headers=headers, timeout=15, verify=settings.SSL_VERIFY)
        if not response.is_success:
            return False

        data = response.json().get("data")
        return data is not None
    except Exception as e:
        logger.warning(f"[credit-utils] Failed to check fixed credits for agent {ref_id}: {e}")
        return False


def has_sufficient_platform_credits(access_token: str) -> bool:
    """Check whether the platform account has enough credits for a non-BYOK call.

    Args:
        access_token: The authenticated user's JWT, used to authorize the
            credit-balance lookup on the Accounts API.

    Returns:
        True if the platform has sufficient credits, False otherwise.
    """
    credit_manager = CreditManagerService()
    return bool(credit_manager.has_sufficient_credits(task="platform", jwt=access_token))


def check_sufficient_credits(is_byok_enabled: bool, credential_id: str | None, provider: str, access_token: str) -> None:
    """Raise a 400 if the platform lacks credits for a non-BYOK call.

    BYOK requests skip the platform credit check because the caller supplies
    their own provider credentials. Shared by Text Generation and Embeddings.

    Args:
        is_byok_enabled: Whether the request uses the caller's own credentials.
        credential_id: The BYOK vault credential id (None when not BYOK).
        provider: The provider name, used for billing/logging labels.
        access_token: The authenticated user's JWT.

    Raises:
        HTTPException(400): When non-BYOK and the platform has insufficient credits.
    """
    # BYOK requests are never billed against platform credits.
    if is_byok_enabled and credential_id:
        return

    credit_manager = CreditManagerService()
    if not credit_manager.has_sufficient_credits(task=provider, jwt=access_token):
        raise HTTPException(status_code=400, detail="Insufficient credits.")


def build_credit_entry(
    service_type: str,
    consumed_units: int,
    ref_type: str,
    ref_id: str,
    ref_name: str,
    action: str,
    agent_name: str | None,
    space_id: str | None = None,
) -> dict:
    """Build a single credit-usage payload entry (PascalCase fields).

    Shared by Text Generation and Embeddings so billing payloads stay identical.
    """
    return {
        "ServiceType": service_type,
        "ConsumedUnit": max(consumed_units or 0, 0),
        "RefType": ref_type,
        "RefId": ref_id,
        "RefName": ref_name,
        "Action": action or "AgentExecution",
        "TriggeredByAgent": agent_name,
        "SpaceId": space_id,
    }


def post_platform_credit_usage(provider: str, entries: list[dict], access_token: str) -> None:
    """Post credit-usage entries to the backend credit-usage endpoint.

    Args:
        provider: The provider name used as the billing task label.
        entries: A list of payload entries (see `build_credit_entry`).
        access_token: The authenticated user's JWT.
    """
    # Nothing to bill when no usage was produced.
    if not entries:
        return
    credit_manager = CreditManagerService()
    credit_manager.post_credit_usage(task=provider, request=entries, jwt=access_token)


def post_credit_usage(request, provider: str, kind: str, consumed_units: float, access_token: str, space_id: str | None = None) -> None:
    """Resolve the backend service name for a model and post usage.

    Shared by STT and TTS. The provider+model are translated to the backend
    `CreditServicesEnum` name via `get_credit_service_type` (kind "service").

    Args:
        request: The STT/TTS request carrying model + reference metadata.
        provider: The provider name (e.g. 'elevenlabs').
        kind: The usage kind passed to `get_credit_service_type` (e.g. "service").
        consumed_units: Number of billable units consumed (audio seconds / chars).
        access_token: The authenticated user's JWT.
        space_id: The current space id to attribute credit usage to (None = Central).

    Raises:
        ValueError: When the model has no mapped backend service, so silent
            billing errors are avoided.
    """
    # Translate the requested model into the backend's billing enum name.
    backend_service_type = get_credit_service_type(provider, request.model, kind)

    # Reject unmapped models to prevent silent billing gaps.
    if not backend_service_type:
        raise ValueError(f"Unsupported model for credit usage: {request.model}")

    # Skip token-based deduction when the agent has a fixed-credits override.
    ref_id = getattr(request, "ref_id", None)
    if agent_has_fixed_credits(ref_id, access_token):
        logger.info(f"[credit-utils] Skipping platform credit usage for agent {ref_id} (fixed credits).")
        return

    # Build the payload the Accounts API expects (PascalCase fields).
    credit_usage_entry = {
        "ServiceType": backend_service_type,
        "ConsumedUnit": max(int(consumed_units or 0), 0),
        "RefType": request.ref_type,
        "RefId": request.ref_id,
        "RefName": request.ref_name,
        "Action": request.action,
        "TriggeredByAgent": request.agent_name,
        "SpaceId": space_id,
    }

    # Post a single-entry bulk request to the credit-usage endpoint.
    credit_manager = CreditManagerService()
    credit_manager.post_credit_usage(task=provider, request=[credit_usage_entry], jwt=access_token)
    logger.info(f"Credit usage posted | task={provider} ref_id={request.ref_id}")


def should_record_byok(is_byok: bool, credential_id: str | None) -> bool:
    """True when a request used the caller's own (BYOK) credentials.

    BYOK consumption is recorded against the user's own key (not platform
    credits). A null/empty/default-GUID credential counts as "no real
    credential" and therefore not BYOK.

    Args:
        is_byok: Whether the request is flagged as BYOK.
        credential_id: The BYOK vault credential id (None when not BYOK).

    Returns:
        True when BYOK is enabled AND a real credential is supplied.
    """
    if not is_byok:
        return False
    if not credential_id:
        return False
    cleaned = str(credential_id).strip()
    return cleaned not in ("", "00000000-0000-0000-0000-000000000000")


def build_byok_entry(
    service_type: str,
    provider: str,
    model: str,
    consumed_units: float,
    unit_type: str | None,
    credential_id: str | None,
    credential_name: str | None,
    ref_type: str,
    ref_id: str,
    ref_name: str,
    action: str,
    agent_name: str | None,
    space_id: str | None = None,
) -> dict:
    """Build a single BYOK usage payload entry (PascalCase fields).

    Mirrors `build_credit_entry` but carries the vault credential attribution,
    the provider/model names, and the provider's unit type instead of platform
    credit math.

    Args:
        service_type: The backend `CreditServicesEnum` name.
        provider: The model provider name (e.g. "openai", "gemini").
        model: The model name (e.g. "gpt-4o-mini").
        consumed_units: Number of provider units consumed (tokens/seconds/chars).
        unit_type: The provider unit type (e.g. "Tokens", "Seconds", "Characters").
        credential_id: The BYOK vault credential id.
        credential_name: The display name of the BYOK vault credential.
        ref_type: The reference type (e.g. "Agent").
        ref_id: The reference id (e.g. AgentId).
        ref_name: The reference display name.
        action: The action type (e.g. "AgentExecution").
        agent_name: The triggering agent name.
        space_id: The current space id (None = Central).

    Returns:
        A dict payload ready for the Accounts API `ByokUsageDto`.
    """
    return {
        "ServiceType": service_type,
        "Provider": provider,
        "Model": model,
        "ConsumedUnit": max(consumed_units or 0, 0),
        "UnitType": unit_type,
        "CredentialId": credential_id,
        "CredentialName": credential_name,
        "RefType": ref_type,
        "RefId": ref_id,
        "RefName": ref_name,
        "Action": action or "AgentExecution",
        "TriggeredByAgent": agent_name,
        "SpaceId": space_id,
    }


def post_byok_usage(provider: str, entries: list[dict], access_token: str) -> None:
    """Post BYOK usage entries to the backend byok-usage endpoint.

    Args:
        provider: The provider name used as the billing task label.
        entries: A list of payload entries (see `build_byok_entry`).
        access_token: The authenticated user's JWT.
    """
    # Nothing to record when no usage was produced.
    if not entries:
        return
    byok_manager = ByokUsageManager()
    byok_manager.post_byok_usage(task=provider, request=entries, jwt=access_token)

