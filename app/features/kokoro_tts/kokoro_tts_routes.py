
from fastapi import APIRouter
from .kokoro_tts_schemas import KokoroTTSRequest, KokoroTTSMetadataResponse
from .kokoro_tts_service import generate_audio, get_metadata

router = APIRouter()

@router.post("/kokoro-tts/generate", status_code=200)
async def generate_audio_route(request: KokoroTTSRequest):
	return await generate_audio(request)

@router.get("/kokoro-tts/metadata", response_model=KokoroTTSMetadataResponse)
async def get_metadata_route():
	"""
	Returns metadata about supported voices and language codes for Kokoro TTS.
	"""
	return get_metadata()
