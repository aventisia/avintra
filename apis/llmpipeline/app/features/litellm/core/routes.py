# API routes for LiteLLM provider/model administration.
from __future__ import annotations

from fastapi import APIRouter, Depends

from app.dependencies.authorize import authorize
from app.features.auth.authenticated_user import User

from .provider_admin_service import provider_admin_service
from .schemas import (
    ModelsResponse,
    ProviderCapability,
    ProvidersResponse,
)
from .streaming_job_manager import v2_job_manager

router = APIRouter(tags=["LLM Providers v2 (LiteLLM)"])


@router.get("/v2/llm/providers", response_model=ProvidersResponse)
async def list_providers_route(
    capability: ProviderCapability | None = None,
    provider: str | None = None,
    _user: User = Depends(authorize()),
):
    return await provider_admin_service.list_providers(
        capability=capability.value if capability else None,
        provider=provider,
    )


@router.get("/v2/llm/models", response_model=ModelsResponse)
async def list_models_route(
    provider: str,
    capability: ProviderCapability | None = None,
    credential_id: str | None = None,
    _user: User = Depends(authorize()),
):
    return await provider_admin_service.list_models(
        provider,
        capability=capability.value if capability else None,
        credential_id=credential_id,
        user=_user,
    )


@router.post("/v2/llm/cancel/{job_id}")
async def cancel_llm_job_route(job_id: str, _user: User = Depends(authorize())):
    success = v2_job_manager.cancel(job_id)
    return {"job_id": job_id, "status": "cancelled" if success else "not_found"}


@router.get("/v2/llm/active-jobs")
async def list_active_jobs_route(_user: User = Depends(authorize())):
    return {"active_jobs": v2_job_manager.active_job_ids()}
