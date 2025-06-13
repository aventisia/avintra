# KokoroTTS.py
import io
import torch
import torchaudio as ta
from typing import Optional
from fastapi import APIRouter, Form
from fastapi.responses import StreamingResponse
from app.core.logger import logger
from kokoro import KPipeline

router = APIRouter()

# Global Kokoro TTS pipeline instance
kokoro_pipeline: Optional[KPipeline] = None
OUTPUT_SAMPLE_RATE = 24000  # Sample rate expected by Kokoro

@router.on_event("startup")
async def load_kokoro_pipeline():
    """
    Load the Kokoro TTS pipeline once at app startup.
    This avoids reloading it with every incoming request.
    """
    global kokoro_pipeline
    logger.info("Loading Kokoro TTS pipeline...")

    try:
        kokoro_pipeline = KPipeline(lang_code='a')  # 'a' = American English
        logger.info("Kokoro TTS pipeline loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Kokoro TTS pipeline: {e}")
        raise RuntimeError("TTS pipeline initialization failed.") from e

@router.post("/tts/kokoro/generate", status_code=200)
async def generate_kokoro_tts_audio(
    text: str = Form(..., description="Text to convert to speech."),
    voice_name: Optional[str] = Form('af_heart', description="Voice name (default: 'af_heart').")
):
    """
    Convert input text to speech using Kokoro TTS and return it as an MP3 audio stream.
    """
    if kokoro_pipeline is None:
        logger.warning("TTS pipeline not loaded.")
        return StreamingResponse(
            io.BytesIO(b"TTS pipeline not loaded. Please try again later."),
            media_type="text/plain",
            status_code=503
        )

    try:
        logger.info(f"Generating audio for text: '{text[:50]}...' | Voice: '{voice_name}'")

        # Generate audio chunks using the Kokoro pipeline
        audio_segments = [
            segment.cpu()
            for _, _, segment in kokoro_pipeline(
                text,
                voice=voice_name,
                speed=1,
                split_pattern=r'\n+'
            )
        ]

        if not audio_segments:
            raise ValueError("No audio segments were generated.")

        # Merge audio chunks into a single tensor
        full_audio = torch.cat(audio_segments, dim=0)

        # Save the audio to a memory buffer as MP3
        audio_buffer = io.BytesIO()
        ta.save(audio_buffer, full_audio.unsqueeze(0), OUTPUT_SAMPLE_RATE, format="mp3")
        audio_buffer.seek(0)

        logger.info("Audio generation completed successfully.")

        return StreamingResponse(
            audio_buffer,
            media_type="audio/mp3",
            headers={"Content-Disposition": "attachment; filename=generated_speech.mp3"}
        )

    except Exception as e:
        logger.error(f"Audio generation error: {e}")
        return StreamingResponse(
            io.BytesIO(f"An error occurred: {e}".encode('utf-8')),
            media_type="text/plain",
            status_code=500
        )
