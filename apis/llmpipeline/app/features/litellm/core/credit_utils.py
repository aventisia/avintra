# Shared credit-usage helpers for the LiteLLM feature.
#
# Text generation / embeddings / STT / TTS all post credit usage through the
# provider registry's `get_credit_service_type`, which maps a provider+model to
# the backend `CreditServicesEnum` name. This module centralizes the credit
# check and usage-posting logic so every capability shares a single
# implementation.
from __future__ import annotations

from fastapi import HTTPException

from app.core.credit_manager import CreditManagerService
from app.core.logger import logger

from .provider_registry import get_credit_service_type, should_post_usage


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


def post_credit_usage(request, provider: str, kind: str, consumed_units: float, access_token: str) -> None:
    """Resolve the backend service name for a model and post usage.

    Shared by STT and TTS. The provider+model are translated to the backend
    `CreditServicesEnum` name via `get_credit_service_type` (kind "service").

    Args:
        request: The STT/TTS request carrying model + reference metadata.
        provider: The provider name (e.g. 'elevenlabs').
        kind: The usage kind passed to `get_credit_service_type` (e.g. "service").
        consumed_units: Number of billable units consumed (audio seconds / chars).
        access_token: The authenticated user's JWT.

    Raises:
        ValueError: When the model has no mapped backend service, so silent
            billing errors are avoided.
    """
    # Translate the requested model into the backend's billing enum name.
    backend_service_type = get_credit_service_type(provider, request.model, kind)

    # Reject unmapped models to prevent silent billing gaps.
    if not backend_service_type:
        raise ValueError(f"Unsupported model for credit usage: {request.model}")

    # Build the payload the Accounts API expects (PascalCase fields).
    credit_usage_entry = {
        "ServiceType": backend_service_type,
        "ConsumedUnit": max(int(consumed_units or 0), 0),
        "RefType": request.ref_type,
        "RefId": request.ref_id,
        "RefName": request.ref_name,
        "Action": request.action,
        "TriggeredByAgent": request.agent_name,
    }

    # Post a single-entry bulk request to the credit-usage endpoint.
    credit_manager = CreditManagerService()
    credit_manager.post_credit_usage(task=provider, request=[credit_usage_entry], jwt=access_token)
    logger.info(f"Credit usage posted | task={provider} ref_id={request.ref_id}")
