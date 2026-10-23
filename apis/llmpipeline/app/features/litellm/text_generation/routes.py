# API routes for the LiteLLM text generation capability.
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.core.logger import log_exception, logger
from app.dependencies.authorize import authorize
from app.features.auth.authenticated_user import User

from ..core.schemas import (
    LLMGenerationRequest,
    LLMGenerationResponse,
)
from .generation_service import generation_service

router = APIRouter(tags=["LiteLLM Text Generation"])


@router.post("/v2/llm/generate", response_model=LLMGenerationResponse)
async def generate_llm_response_route(
    req: LLMGenerationRequest,
    _user: User = Depends(authorize()),
):
    try:
        # Normalize credential_name:
        # - Convert to string and trim surrounding whitespace.
        # - Treat None, empty strings, and whitespace-only values as "no credential".
        credential_name = (
            str(req.credential_name).strip()
            if req.credential_name is not None
            else ""
        )

        # Empty or whitespace-only value means no credential was provided.
        if not credential_name:
            req.credential_name = None
        else:
            # Preserve the normalized credential name.
            req.credential_name = credential_name

        if req.stream:
            # Register the streaming job and return an SSE stream.
            job_id, stream_gen = await generation_service.start_streaming(req, _user)
            return StreamingResponse(
                stream_gen,
                media_type="text/event-stream",
                headers={
                    "X-Job-Id": job_id,
                    "X-Accel-Buffering": "no",
                    "Cache-Control": "no-cache",
                },
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
