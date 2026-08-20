# stt_provider_routes.py

from app.features.stt_providers.stt_providers_manager import start_stt_streaming_job
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.dependencies.authorize import authorize
from app.features.auth.authenticated_user import User

from app.features.stt_providers.stt_providers_factory import get_stt_provider
from app.features.stt_providers.stt_providers_schema import STTProviderRequest
from app.core.logger import logger

# Router for STT endpoints
router = APIRouter()


@router.post("/stt/transcribe")
async def transcribe_speech_to_text(
    stt_request: STTProviderRequest,
    _user: User = Depends(authorize())
):
    """
    Speech-to-Text endpoint.

    Supports:
    - Non-streaming (full transcript)
    - Streaming (SSE)
    """
    try:
        # Get provider instance (e.g., elevenlabs)
        provider = get_stt_provider(stt_request.provider)

        # Normalize credential_name:
        # - Convert to string and trim surrounding whitespace.
        # - Treat None, empty strings, and whitespace-only values as "no credential".
        credential_name = (
            str(stt_request.credential_name).strip()
            if stt_request.credential_name is not None
            else ""
        )

        # Empty or whitespace-only value means no credential was provided.
        if not credential_name:
            stt_request.credential_name = None
        else:
            # Preserve the normalized credential name.
            stt_request.credential_name = credential_name

        # Streaming response (SSE)
        if stt_request.stream:
            # Start streaming job → returns job_id + generator
            job_id, event_stream = await start_stt_streaming_job(
                provider,
                stt_request,
                _user
            )

            # Return SSE stream with job tracking header
            return StreamingResponse(
                event_stream(),
                media_type="text/event-stream",
                headers={"X-Job-Id": job_id}
            )

        # Non-streaming response (full transcript)
        return await provider.transcribe(stt_request, _user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in speech-to-text transcription: {e}")
        raise HTTPException(status_code=500, detail="Error in speech-to-text transcription.")