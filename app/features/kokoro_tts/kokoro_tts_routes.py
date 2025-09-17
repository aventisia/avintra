
from fastapi import APIRouter
from .kokoro_tts_schemas import KokoroTTSRequest, KokoroTTSMetadataResponse
from .kokoro_tts_service import generate_kokoro_tts_audio, get_kokoro_tts_metadata

router = APIRouter()

@router.post("/kokoro-tts/generate", status_code=200)
async def generate_kokoro_tts_audio_route(request: KokoroTTSRequest):
	return await generate_kokoro_tts_audio(request)

@router.get("/kokoro-tts/metadata", response_model=KokoroTTSMetadataResponse)
async def get_kokoro_tts_metadata_route():
	"""
	Returns metadata about supported voices and language codes for Kokoro TTS.
	"""
	return get_kokoro_tts_metadata()
