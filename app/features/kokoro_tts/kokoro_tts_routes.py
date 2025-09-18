
from fastapi import APIRouter
from .kokoro_tts_schemas import KokoroTTSRequest, KokoroTTSMetadataResponse
from .kokoro_tts_service import synthesize, metadata

router = APIRouter()

@router.post("/kokoro-tts/synthesize", status_code=200)
async def synthesize_route(request: KokoroTTSRequest):
	return await synthesize(request)

@router.get("/kokoro-tts/metadata", response_model=KokoroTTSMetadataResponse)
async def metadata_route():
	"""
	Returns metadata about supported voices and language codes for Kokoro TTS.
	"""
	return metadata()
