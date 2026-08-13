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
