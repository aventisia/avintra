# API routes for the LiteLLM embeddings capability.
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.core.logger import log_exception, logger
from app.dependencies.authorize import authorize
from app.features.auth.authenticated_user import User

from ..core.schemas import (
    EmbeddingRequest,
    EmbeddingResponse,
)
from .embedding_service import embedding_service

router = APIRouter(tags=["LiteLLM Embeddings"])


@router.post("/v2/llm/embeddings", response_model=EmbeddingResponse)
async def generate_embeddings_route(
    req: EmbeddingRequest,
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
    except HTTPException:
        raise
    except Exception as e:
        log_exception(logger, e, "Error generating embeddings: ")
        raise HTTPException(status_code=500, detail="Error generating embeddings.")
