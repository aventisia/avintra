# stt_job_manager.py

import uuid
import asyncio
from typing import Dict
from app.features.auth.authenticated_user import User

from app.features.stt_providers.stt_providers_schema import STTProviderRequest


# Store active streaming tasks by job_id
active_stt_jobs: Dict[str, asyncio.Task] = {}


# Start a streaming STT job
async def start_stt_streaming_job(
    provider,
    stt_request: STTProviderRequest,
    user: User
):
    """
    Start a streaming STT job.

    Returns:
    - job_id
    - event_stream(): async generator for streaming response
    """

    # Generate new one
    job_id = str(uuid.uuid4())

    async def event_stream():
        try:
            async for chunk in provider.stream_transcription(stt_request, job_id, user):
                # Stop if job is cancelled
                if job_id not in active_stt_jobs:
                    break
                yield chunk
        finally:
            # Cleanup when finished or cancelled
            active_stt_jobs.pop(job_id, None)

    # Register job BEFORE streaming starts
    active_stt_jobs[job_id] = asyncio.current_task()

    return job_id, event_stream



# Cancel a running STT job
def cancel_stt_job(job_id: str) -> bool:
    """
    Cancel an active streaming job.
    """

    task = active_stt_jobs.pop(job_id, None)

    if not task:
        return False

    task.cancel()
    return True


# List active jobs
def list_active_stt_jobs() -> list[str]:
    """
    Return all active job IDs.
    """
    return list(active_stt_jobs.keys())