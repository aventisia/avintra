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

# Global variable to hold the Kokoro TTS pipeline instance
kokoro_pipeline: Optional[KPipeline] = None
OUTPUT_SAMPLE_RATE = 24000  # Sample rate expected by Kokoro

def load_kokoro_model():
    """
    Loads the Kokoro TTS pipeline.
    If the pipeline is already loaded, it does nothing.
    """
    global kokoro_pipeline
    if kokoro_pipeline is None:
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

    try:
        # Load the model if not already loaded
        load_kokoro_model()

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
