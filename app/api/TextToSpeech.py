# TextToSpeech.py

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
import pyttsx3
import tempfile
from pydub import AudioSegment
import os
from app.core.logger import logger
from datetime import datetime

# Create FastAPI router instance for handling TTS-related routes
router = APIRouter()

# Initialize the text-to-speech engine
engine = pyttsx3.init()

# Retrieve the list of available voices
available_voices = engine.getProperty('voices')

# Helper function to validate input parameters
def validate_input(text: str, index: int, speed: int):
    """
    Validates input parameters for the text-to-speech process.
    Raises HTTPException with appropriate status and message for invalid inputs.
    """
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    if index < 0 or index >= len(available_voices):
        raise HTTPException(status_code=400, detail=f"index must be between 0 and {len(available_voices) - 1}")
    
    if not (50 <= speed <= 400):
        raise HTTPException(status_code=400, detail="Speed must be between 50 and 400")

@router.get("/tts/voices/")
async def list_voices():
    """
    Returns a list of available text-to-speech voices.
    Includes the voice index, ID, name, and supported languages.
    """
    voice_list = [{
        "index": index,
        "id": voice.id,
        "name": voice.name,
        "languages": [lang.decode('utf-8') if isinstance(lang, bytes) else lang for lang in voice.languages],
    } for index, voice in enumerate(available_voices)]
    
    return voice_list

@router.get("/tts/synthesize/")
async def tts_endpoint(
    text: str,
    index: int = Query(0, ge=0),
    speed: int = Query(200, ge=50, le=400)
):
    """
    Converts input text into an MP3 audio file using text-to-speech.
    
    Parameters:
    - text: The input text to convert.
    - index: Voice index from the available voices list.
    - speed: Speaking rate (WPM), between 50 and 400.
    
    Returns:
    - MP3 audio file as a downloadable response.
    """
    # Validate inputs using helper
    validate_input(text, index, speed)

    # Set the chosen voice and speaking speed
    selected_voice = available_voices[index]
    engine.setProperty('voice', selected_voice.id)
    engine.setProperty('rate', speed)

    # Create a temporary WAV file
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as wav_temp_file:
        wav_path = wav_temp_file.name

    # Save spoken text to WAV file
    engine.save_to_file(text.strip(), wav_path)
    engine.runAndWait()

    # Create a temporary MP3 file path
    mp3_file_descriptor, mp3_path = tempfile.mkstemp(suffix=".mp3")
    os.close(mp3_file_descriptor)  # Close descriptor to avoid permission issues

    # Convert the WAV to MP3 using pydub
    audio = AudioSegment.from_wav(wav_path)
    audio.export(mp3_path, format="mp3")

    # Remove the temporary WAV file
    os.remove(wav_path)

    # Generate a filename including voice name, speed, and timestamp
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"text_to_speech_{selected_voice.name}_{speed}_{timestamp}.mp3"

    # Return the generated MP3 as a downloadable file
    return FileResponse(mp3_path, media_type="audio/mpeg", filename=filename)
