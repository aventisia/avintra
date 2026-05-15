# audio_provider_routes.py

from app.features.tts_providers.tts_providers_manager import start_tts_streaming_job
from app.dependencies.authorize import authorize
from app.features.auth.authenticated_user import User
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.features.tts_providers.tts_providers_factory import get_tts_provider
from app.features.tts_providers.tts_providers_schema import TTSProviderRequest
from app.core.logger import logger

# Router for TTS endpoints
router = APIRouter()


@router.post('/tts/synthesize')
async def synthesize_tts(
    tts_request: TTSProviderRequest,
    _user: User = Depends(authorize())
):
    """
    Text-to-Speech endpoint.

    Supports:
    - Non-streaming (full audio)
    - Streaming (SSE)
    """
    try:
        # Get provider instance (e.g., elevenlabs)
        provider = get_tts_provider(tts_request.provider)

        # Normalize credentials_id
        # Convert empty, whitespace, or default GUID to None
        raw_id = tts_request.credentials_id

        if raw_id:
            cleaned = str(raw_id).strip()

            # Ignore empty or placeholder GUID
            if cleaned and cleaned != "00000000-0000-0000-0000-000000000000":
                tts_request.credentials_id = cleaned
            else:
                tts_request.credentials_id = None
        else:
            tts_request.credentials_id = None

        # Streaming response (SSE with job tracking)
        if tts_request.stream:
            # Start streaming job and get job_id + generator
            job_id, event_stream = await start_tts_streaming_job(
                provider,
                tts_request,
                _user
            )

            # Return SSE stream with job_id in headers
            return StreamingResponse(
                event_stream(),
                media_type="text/event-stream",
                headers={"X-Job-Id": job_id}
            )

        # Non-streaming response (full audio)
        return await provider.synthesize(tts_request, _user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in text-to-speech synthesis: {e}")
        raise HTTPException(status_code=500, detail="Error in text-to-speech synthesis.")