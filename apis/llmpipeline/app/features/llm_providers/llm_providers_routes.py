# API routes for LLM Providers
from app.dependencies.authorize import authorize
from app.features.auth.authenticated_user import User
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from .llm_providers_schemas import EmbeddingRequest, LLMRequest
from .llm_providers_factory import get_llm_provider
from .llm_kb_retrieval import retrieve_and_inject_kb_context
from .llm_skill_retrieval import resolve_and_inject_skill_context
from app.features.llm_providers.llm_job_manager import start_llm_streaming_job, cancel_llm_job, get_active_llm_jobs
from app.core.logger import logger

router = APIRouter()

# Generate LLM response (streaming or non-streaming)
@router.post('/llm/generate')
async def generate_llm_response_route(llm_request: LLMRequest, _user: User = Depends(authorize())):
    try:
        # Get llm provider instance based on request
        llm_provider = get_llm_provider(llm_request.provider)
        
        # If credential_id is empty string or whitespace or empty guid, set it to None
        credential_id = str(llm_request.credential_id).strip() if llm_request.credential_id is not None else ""
        if credential_id in ["", "00000000-0000-0000-0000-000000000000"]:
            llm_request.credential_id = None
        else:
            llm_request.credential_id = credential_id

        # Retrieve KB context chunks and inject into input if kb_names are provided
        if llm_request.kb_names:
            await retrieve_and_inject_kb_context(llm_request, _user)

        # Resolve selected skills and inject skill instructions into input if skill_names are provided
        if llm_request.skill_names:
            await resolve_and_inject_skill_context(llm_request, _user)
            
        # Send request to provider and return response (streaming or non-streaming)
        if llm_request.stream:
            job_id, event_stream = await start_llm_streaming_job(llm_provider, llm_request, _user)
            # Use StreamingResponse for streaming
            return StreamingResponse(event_stream(), media_type="text/event-stream", headers={"X-Job-Id": job_id})
        else:
            # Use await for non-streaming
            return await llm_provider.generate_llm_response(llm_request, _user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating LLM response: {e}")
        raise HTTPException(status_code=500, detail="Error generating LLM response.")
    
# Cancel a running llm job
@router.post('/llm/cancel/{job_id}')
async def cancel_llm_job_route(job_id: str):
    success = cancel_llm_job(job_id)
    return {"job_id": job_id, "status": "cancelled" if success else "not_found"}

# Get all active llm jobs
@router.get('/llm/active-jobs')
async def list_active_jobs_route():
    return {"active_jobs": get_active_llm_jobs()}

# Generate embeddings
@router.post('/llm/embeddings')
async def generate_embedding_route(
    embedding_request: EmbeddingRequest,
    _user: User = Depends(authorize())
):
    try:
        # Get embedding provider instance
        embedding_provider = get_llm_provider(embedding_request.provider)

        # Normalize credential_id (handle empty / invalid values)
        credential_id = (
            str(embedding_request.credential_id).strip()
            if embedding_request.credential_id is not None
            else ""
        )

        if credential_id in ["", "00000000-0000-0000-0000-000000000000"]:
            embedding_request.credential_id = None
        else:
            embedding_request.credential_id = credential_id

        # Call provider to generate embeddings
        return await embedding_provider.generate_embeddings(
            embedding_request,
            _user
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating embeddings: {e}")
        raise HTTPException(status_code=500, detail="Error generating embeddings.")
