import uuid
import asyncio
from typing import Dict
from app.features.auth.authenticated_user import User
from app.features.llm_providers.llm_providers_schemas import LLMRequest
from fastapi import Request

# In-memory job tracking
active_llm_jobs: Dict[str, asyncio.Task] = {}

# Start a streaming LLM job and return job_id and generator
async def start_llm_streaming_job(llm_provider, llm_request: LLMRequest, user: User):
    job_id = str(uuid.uuid4())
    
    # Define the event stream generator
    async def event_stream():
        try:
            async for chunk in llm_provider.stream_llm_response(llm_request, job_id, user):
                # If job is cancelled, stop streaming
                if job_id not in active_llm_jobs:
                    break
                yield chunk
        finally:
            # Cleanup job when finished or cancelled
            active_llm_jobs.pop(job_id, None)

    # Register the generator for cancellation tracking
    active_llm_jobs[job_id] = event_stream
    return job_id, event_stream

# Cancel a running job by job_id
def cancel_llm_job(job_id: str):
    task = active_llm_jobs.pop(job_id, None)
    if task:
        task.cancel()
        return True
    return False

# Utility to get active jobs
def get_active_llm_jobs():
    return list(active_llm_jobs.keys())
