# API routes for LLM Providers
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from .llm_providers_schemas import LLMRequest
from .llm_providers_factory import get_llm_provider
from app.features.llm_providers.llm_job_manager import start_llm_streaming_job, cancel_llm_job, get_active_llm_jobs

router = APIRouter()

# Generate LLM response (streaming or non-streaming)
@router.post('/llm/generate')
async def generate_llm_response_route(llm_request: LLMRequest, request:Request):
    # Get llm provider instance based on request
    llm_provider = get_llm_provider(llm_request.provider)
    
    # If credential_id is empty string or whitespace or empty guid, set it to None
    credential_id = str(llm_request.credential_id).strip() if llm_request.credential_id is not None else ""
    if credential_id in ["", "00000000-0000-0000-0000-000000000000"]:
        llm_request.credential_id = None
    else:
        llm_request.credential_id = credential_id
        
    # Send request to provider and return response (streaming or non-streaming)
    if llm_request.stream:
        job_id, event_stream = await start_llm_streaming_job(llm_provider, llm_request, request)
        # Use StreamingResponse for streaming
        return StreamingResponse(event_stream(), media_type="text/event-stream", headers={"X-Job-Id": job_id})
    else:
        # Use await for non-streaming
        return await llm_provider.generate_llm_response(llm_request, request)
    
# Cancel a running llm job
@router.post('/llm/cancel/{job_id}')
async def cancel_llm_job_route(job_id: str):
    success = cancel_llm_job(job_id)
    return {"job_id": job_id, "status": "cancelled" if success else "not_found"}

# Get all active llm jobs
@router.get('/llm/active-jobs')
async def list_active_jobs_route():
    return {"active_jobs": get_active_llm_jobs()}