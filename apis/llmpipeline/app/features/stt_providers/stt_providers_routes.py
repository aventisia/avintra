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

        # Normalize credentials_id
        # Convert empty, whitespace, or default GUID to None
        raw_id = stt_request.credentials_id

        if raw_id:
            cleaned = str(raw_id).strip()

            # Ignore empty or placeholder GUID
            if cleaned and cleaned != "00000000-0000-0000-0000-000000000000":
                stt_request.credentials_id = cleaned
            else:
                stt_request.credentials_id = None
        else:
            stt_request.credentials_id = None

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