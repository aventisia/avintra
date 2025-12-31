from fastapi import APIRouter
from .elevenlabs_tts_schemas import ElevenLabsTTSRequest, ElevenLabsTTSMetadataResponse
from .elevenlabs_tts_service import synthesize, metadata

router = APIRouter()


@router.post("/elevenlabs_tts/synthesize", status_code=200)
async def synthesize_route(request: ElevenLabsTTSRequest):
    """
    Synthesizes speech using the ElevenLabs API based on the provided text and voice settings.
    Returns either a streaming audio file or a base64-encoded string depending on request flags.
    """
    return await synthesize(request)


@router.get("/elevenlabs_tts/metadata", response_model=ElevenLabsTTSMetadataResponse)
async def metadata_route():
    """
    Returns metadata about supported languages and voices available through ElevenLabs TTS.
    """
    return metadata()
