# SpeechToText.py

from pathlib import Path
import platform
import os
import tempfile
import shutil
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
from pydub import AudioSegment
import requests
import numpy as np
from sklearn.cluster import KMeans
from resemblyzer import preprocess_wav, VoiceEncoder
from app.models.FileRequest import FileRequest
from app.models.TranscriptionSegment import TranscriptionSegment
from app.core.logger import logger
import whisper

# Initialize router
router = APIRouter()

# Global variable to cache the whisper model
_whisper_model = None

def load_whisper_model(model_path: str = "./base.pt"):
    """
    Loads the Whisper model if not already loaded.
    """
    global _whisper_model
    if _whisper_model is None:
        logger.info(f"Loading Whisper model from: {model_path}")
        _whisper_model = whisper.load_model(model_path)
    else:
        logger.debug("Whisper model already loaded.")
    return _whisper_model

def process_audio_file(audio_path: str) -> List[TranscriptionSegment]:
    """
    Transcribes an MP3 audio file and assigns speaker labels using Resemblyzer embeddings and KMeans clustering.
    """
    logger.info(f"Processing audio file: {audio_path}")

    # Load whisper model (only if not already loaded)
    whisper_model = load_whisper_model()

    # Step 1: Convert MP3 to WAV for speaker embedding
    wav_path = audio_path.replace(".mp3", ".wav")
    logger.debug(f"Converting MP3 to WAV at path: {wav_path}")
    AudioSegment.from_mp3(audio_path).export(wav_path, format="wav")

    # Step 2: Initialize speaker encoder
    logger.debug("Initializing voice encoder...")
    encoder = VoiceEncoder()

    # Step 3: Run Whisper transcription
    logger.info("Running Whisper transcription...")
    result = whisper_model.transcribe(audio_path, language="en")
    segments = result.get("segments", [])

    if not segments:
        logger.warning("No transcription segments found in audio.")
        raise HTTPException(status_code=400, detail="No transcription segments found.")

    logger.info(f"Total transcription segments found: {len(segments)}")

    # Step 4: Extract speaker embeddings
    logger.debug("Preprocessing WAV for speaker embeddings...")
    wav = preprocess_wav(wav_path)
    _, partial_embeds, _ = encoder.embed_utterance(wav, return_partials=True)
    partial_embeds = np.array(partial_embeds)
    logger.debug(f"Extracted {len(partial_embeds)} partial speaker embeddings.")

    # Step 5: Speaker diarization using KMeans clustering
    if len(partial_embeds) < 2:
        logger.info("Detected single speaker. Skipping clustering.")
        diarized_output = [
            {
                "speaker": "Speaker 1",
                "start": seg.get("start", 0),
                "end": seg.get("end", 0),
                "text": seg.get("text", "")
            } for seg in segments
        ]
    else:
        logger.info("Multiple speakers detected. Applying KMeans clustering...")
        n_clusters = min(2, len(partial_embeds))
        kmeans = KMeans(n_clusters=n_clusters, random_state=0)
        labels = kmeans.fit_predict(partial_embeds)

        speakers = [f"Speaker {i+1}" for i in range(n_clusters)]
        diarized_output = []
        for idx, seg in enumerate(segments):
            label_index = idx % len(labels)  # Protect against index overflow
            diarized_output.append({
                "speaker": speakers[labels[label_index]],
                "start": seg.get("start", 0),
                "end": seg.get("end", 0),
                "text": seg["text"]
            })

    # Step 6: Clean up temporary WAV file
    if os.path.exists(wav_path):
        os.remove(wav_path)
        logger.debug(f"Deleted temporary WAV file: {wav_path}")

    logger.info("Finished processing audio.")
    return diarized_output


@router.post("/transcriptions/upload")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Endpoint to accept an uploaded MP3 file, transcribe it, and return speaker-diarized text.
    """
    logger.info(f"Received file upload: {file.filename}")
    temp_path = ""

    try:
        # Save uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
            shutil.copyfileobj(file.file, temp_audio)
            temp_path = temp_audio.name
            logger.info(f"Saved uploaded audio to temporary path: {temp_path}")

        # Process and transcribe the audio file
        logger.info("Starting transcription of uploaded file...")
        result = process_audio_file(temp_path)
        logger.info("Transcription completed successfully.")
        return result

    except Exception as e:
        logger.exception(f"Error occurred while transcribing file: {file.filename}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Clean up the temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            logger.debug(f"Deleted temporary uploaded file: {temp_path}")


@router.post("/transcriptions/from-url")
async def transcribe_from_url(request: FileRequest):
    """
    Endpoint to transcribe an MP3 file via URL or local path.
    """
    logger.info(f"Transcription requested from URL: {request.file_url}, download required: {request.download}")
    file_path = ""

    try:
        if request.download:
            # Download the audio file from the provided URL
            logger.debug("Downloading audio file from URL...")
            response = requests.get(request.file_url)
            if response.status_code != 200:
                logger.warning(f"Failed to download file (status code {response.status_code}): {request.file_url}")
                raise HTTPException(status_code=400, detail="Failed to download file.")

            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
            file_path = temp_file.name
            with open(file_path, "wb") as f:
                f.write(response.content)
            logger.info(f"Downloaded file saved to: {file_path}")

        else:
            # Use local file path based on platform
            if platform.system() == "Linux":
                file_path = Path("/var/www/aventisia.com") / request.file_url
            else:
                file_path = request.file_url
            logger.info(f"Using existing local file path: {file_path}")

        # Process the file
        logger.info(f"Starting transcription for: {file_path}")
        result = process_audio_file(str(file_path))
        logger.info("Transcription from URL/local path completed.")
        return result

    except Exception as e:
        logger.exception(f"Error occurred during URL-based transcription: {request.file_url}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Remove downloaded file if necessary
        if request.download and os.path.exists(file_path):
            os.remove(file_path)
            logger.debug(f"Deleted downloaded temp file: {file_path}")
