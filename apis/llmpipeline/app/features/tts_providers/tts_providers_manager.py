# tts_job_manager.py

from typing import Dict
import uuid
import asyncio

# In-memory job tracking
active_tts_jobs: Dict[str, asyncio.Task] = {}


# Start a streaming TTS job
async def start_tts_streaming_job(provider, tts_request, user):
    """
    Start a streaming TTS job.

    Returns:
    - job_id
    - event_stream(): async generator for streaming response
    """

    job_id = str(uuid.uuid4())

    async def event_stream():
        try:
            async for chunk in provider.stream_synthesis(tts_request, job_id, user):
                # Stop if job is cancelled
                if job_id not in active_tts_jobs:
                    break
                yield chunk
        finally:
            # Cleanup when finished or cancelled
            active_tts_jobs.pop(job_id, None)

    # Register job BEFORE streaming starts
    active_tts_jobs[job_id] = asyncio.current_task()

    return job_id, event_stream
    
# Cancel a running tts job
def cancel_tts_job(job_id: str) -> bool:
    """
    Cancel an active streaming job.
    """

    task = active_tts_jobs.pop(job_id, None)

    if not task:
        return False

    task.cancel()
    return True


# List active jobs
def list_active_tts_jobs() -> list[str]:
    """
    Return all active job IDs.
    """
    return list(active_tts_jobs.keys())