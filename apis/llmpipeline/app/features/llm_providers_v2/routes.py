# API routes for the LLM Providers v2 feature (LiteLLM).
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.core.logger import log_exception, logger
from app.dependencies.authorize import authorize
from app.features.auth.authenticated_user import User

from .embedding_service import embedding_service
from .generation_service import generation_service
from .provider_admin_service import provider_admin_service
from .schemas import (
    EmbeddingRequest,
    EmbeddingResponse,
    LLMGenerationRequest,
    LLMGenerationResponse,
    ModelsResponse,
    ProviderCapability,
    ProvidersResponse,
)
from .streaming_job_manager import v2_job_manager

router = APIRouter()


@router.post("/v2/llm/generate", response_model=LLMGenerationResponse)
async def generate_llm_response_route(
    req: LLMGenerationRequest,
    _user: User = Depends(authorize()),
):
    try:
        # Empty / whitespace / empty-GUID credential_id means "no credential".
        credential_id = str(req.credential_id).strip() if req.credential_id is not None else ""
        if credential_id in ["", "00000000-0000-0000-0000-000000000000"]:
            req.credential_id = None
        else:
            req.credential_id = credential_id

        if req.stream:
            # Register the streaming job and return an SSE stream.
            job_id, stream_gen = await generation_service.start_streaming(req, _user)
            return StreamingResponse(
                stream_gen,
                media_type="text/event-stream",
                headers={"X-Job-Id": job_id},
            )
        return await generation_service.generate(req, _user)
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, "Error generating LLM response: ")
        raise HTTPException(
            status_code=500,
            detail="The request could not be processed. Please check the request and try again.",
        )


@router.post("/v2/llm/embeddings", response_model=EmbeddingResponse)
async def generate_embeddings_route(
    req: EmbeddingRequest,
    _user: User = Depends(authorize()),
):
    try:
        # Empty / whitespace / empty-GUID credential_id means "no credential".
        credential_id = str(req.credential_id).strip() if req.credential_id is not None else ""
        if credential_id in ["", "00000000-0000-0000-0000-000000000000"]:
            req.credential_id = None
        else:
            req.credential_id = credential_id

        return await embedding_service.embed(req, _user)
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, "Error generating embeddings: ")
        raise HTTPException(status_code=500, detail="Error generating embeddings.")


@router.get("/v2/llm/providers", response_model=ProvidersResponse)
async def list_providers_route(_user: User = Depends(authorize())):
    return await provider_admin_service.list_providers()


@router.get("/v2/llm/models", response_model=ModelsResponse)
async def list_models_route(
    provider: str,
    capability: ProviderCapability | None = None,
    _user: User = Depends(authorize()),
):
    return await provider_admin_service.list_models(
        provider, capability=capability.value if capability else None
    )


@router.post("/v2/llm/cancel/{job_id}")
async def cancel_llm_job_route(job_id: str, _user: User = Depends(authorize())):
    success = v2_job_manager.cancel(job_id)
    return {"job_id": job_id, "status": "cancelled" if success else "not_found"}


@router.get("/v2/llm/active-jobs")
async def list_active_jobs_route(_user: User = Depends(authorize())):
    return {"active_jobs": v2_job_manager.active_job_ids()}
