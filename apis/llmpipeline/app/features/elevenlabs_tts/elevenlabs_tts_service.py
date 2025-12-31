import io
import os
import json
import base64
import datetime

from fastapi.responses import StreamingResponse
from elevenlabs import ElevenLabs
from app.core.config import settings
from app.core.logger import logger
from app.features.kokoro_tts.kokoro_tts_utils import clean_text_for_tts
from .elevenlabs_tts_constants import AUDIO_FORMATS


# === Initialization ===

ELEVENLABS_API_KEY = settings.ELEVENLABS_API_KEY

if not ELEVENLABS_API_KEY:
    logger.error("ELEVENLABS_API_KEY environment variable not set.")
    raise ValueError("ELEVENLABS_API_KEY is not configured.")

try:
    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
    logger.info("ElevenLabs client initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize ElevenLabs client: {e}")
    raise


# === Synthesis Function ===

def synthesize(request):
    """
    Generate speech audio from text using ElevenLabs TTS.

    Args:
        request: An object with properties:
            - text (str): The input text to synthesize.
            - voice_id (str): Voice ID.
            - model_id (str): Model ID (e.g., 'eleven_multilingual_v2').
            - output_format (str): Output format (e.g., 'mp3_22050_32').
            - return_base64 (bool): Return audio as base64 or raw stream.

    Returns:
        StreamingResponse or dict with base64 audio.
    """
    
    if not request.text:
        raise ValueError("No text provided for TTS synthesis.")

    cleaned_text = clean_text_for_tts(request.text)

    logger.info(f"Synthesizing text using ElevenLabs | voice={request.voice_id}, model={request.model_id}, format={request.output_format}")

    try:
        audio_stream = client.text_to_speech.convert(
            text=cleaned_text,
            voice_id=request.voice_id,
            model_id=request.model_id,
            output_format=f"{request.output_format}"
        )

        audio_bytes = b"".join(chunk for chunk in audio_stream)

        if request.return_base64:
            return {
                "media_type": AUDIO_FORMATS.get(request.output_format, "audio/mpeg"),
                "audio_base64": base64.b64encode(audio_bytes).decode("utf-8")
            }

        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"tts_{timestamp}.{request.output_format}"

        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type=AUDIO_FORMATS.get(request.output_format, "audio/mpeg"),
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        logger.error(f"TTS synthesis failed: {e}")
        return StreamingResponse(
            io.BytesIO(f"Error: {e}".encode("utf-8")),
            media_type="text/plain",
            status_code=500
        )


# === Metadata Function ===

def metadata():
    """
    Load voice and language metadata for ElevenLabs TTS from local JSON.

    """
    try:
        metadata_path = os.path.join(os.path.dirname(__file__), "elevenlabs_tts_metadata.json")
        with open(metadata_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return {"languages": data}
    except Exception as e:
        logger.error(f"Failed to load TTS metadata: {e}")
        return {"languages": []}
