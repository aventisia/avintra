# KokoroTTS.py
import io
from pydantic import BaseModel
import torch
import torchaudio as ta
from typing import Optional
from fastapi import APIRouter, Form
from fastapi.responses import StreamingResponse
from app.core.logger import logger
from kokoro import KPipeline

router = APIRouter()

# Define the request body using Pydantic model
class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = 'af_heart'
    lang_code: Optional[str] = 'a'
    speed: Optional[float] = 1.0
    use_gpu: Optional[bool] = False

# Global variable to hold the Kokoro TTS pipeline instance
kokoro_pipeline: Optional[KPipeline] = None
OUTPUT_SAMPLE_RATE = 24000  # Sample rate expected by Kokoro

# def load_kokoro_model():
#     """
#     Loads the Kokoro TTS pipeline.
#     If the pipeline is already loaded, it does nothing.
#     """
#     global kokoro_pipeline
#     if kokoro_pipeline is None:
#         logger.info("Loading Kokoro TTS pipeline...")

#         try:
#             kokoro_pipeline = KPipeline(lang_code='a')  # 'a' = American English
#             logger.info("Kokoro TTS pipeline loaded successfully.")
#         except Exception as e:
#             logger.error(f"Failed to initialize Kokoro TTS pipeline: {e}")
#             raise RuntimeError("TTS pipeline initialization failed.") from e

@router.post("/tts/kokoro/generate", status_code=200)
async def generate_kokoro_tts_audio(request: TTSRequest):
    """
    Convert input text to speech using Kokoro TTS and return it as an MP3 audio stream.

    Parameters:
    - text: The text to be converted to speech.
    - voice: The voice model to use for speech generation (default is 'af_heart').
    - lang_code: The language code for the voice (default is 'a' for American English).
    - speed: The speed of speech, ranging from 0.5 (slower) to 2.0 (faster). Default is 1.0.
    - use_gpu: Flag to indicate whether to use GPU for TTS generation. Default is False.

    Returns:
    - StreamingResponse: The generated audio file in MP3 format.
    """

    try:
        # Check for GPU availability and set device
        device = torch.device("cuda" if request.use_gpu and torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {device}")
        
        try:
            # Initialize the TTS pipeline with the specified language code
            kokoro_pipeline = KPipeline(lang_code=request.lang_code)  # 'a' = American English
            logger.info("Kokoro TTS pipeline loaded successfully.")
        except Exception as e:
            # If the TTS pipeline fails to initialize, log the error and raise an exception
            logger.error(f"Failed to initialize Kokoro TTS pipeline: {e}")
            raise RuntimeError("TTS pipeline initialization failed.") from e
            

        logger.info(f"Generating audio for text: '{request.text[:50]}...' | Voice: '{request.voice}'")

        # Generate audio chunks using the Kokoro pipeline
        audio_segments = [
            segment.cpu()
            for _, _, segment in kokoro_pipeline(
                request.text,
                voice=request.voice,
                speed=request.speed,
                split_pattern=r'\n+'
            )
        ]

        if not audio_segments:
            raise ValueError("No audio segments were generated.")

        # Merge audio chunks into a single tensor
        full_audio = torch.cat(audio_segments, dim=0).to(device)  # Move to chosen device

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
