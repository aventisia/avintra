# SpeechToText.py

from pathlib import Path
import platform
import os
import tempfile
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from pydub import AudioSegment
import requests
import numpy as np
from sklearn.cluster import KMeans
from resemblyzer import preprocess_wav, VoiceEncoder
from app.models.FileRequest import FileRequest
from app.models.transcription_request import TranscriptionRequest
from app.models.TranscriptionSegment import TranscriptionSegment
from app.core.logger import logger
import whisper
import torch

# Initialize router
router = APIRouter()

# Global variable to cache the Whisper model
_whisper_model = None

def load_whisper_model(model_path: str = "./base.pt", use_gpu: bool = False):
    """
    Load the Whisper model, either on CPU or GPU, based on the provided configuration.
    If the model is already loaded, it checks if it's on the correct device, otherwise reloads it.
    """
    global _whisper_model
    
    # Choose device (GPU if available and requested, otherwise CPU)
    device = torch.device("cuda" if use_gpu and torch.cuda.is_available() else "cpu")
    
    # Unload and clear memory if the model is loaded on a different device
    if _whisper_model and _whisper_model.device != device:
        logger.info(f"Unloading current model from {_whisper_model.device} to load on {device}...")
        del _whisper_model
        torch.cuda.empty_cache()  # Clear GPU memory if the current model is on GPU
        _whisper_model = None
    
    # Load model if it's not already loaded
    if _whisper_model is None:
        logger.info(f"Loading Whisper model from: {model_path} on {device}...")
        _whisper_model = whisper.load_model(model_path, device=device)
        logger.info(f"Model successfully loaded on {device}.")
    else:
        logger.debug(f"Whisper model is already loaded on {device}.")
    
    return _whisper_model

def process_audio_file(audio_path: str, lang_code: str = "en", use_gpu: bool = False) -> List[TranscriptionSegment]:
    """
    Processes an MP3 audio file by transcribing it using Whisper and performing speaker diarization 
    via Resemblyzer embeddings and KMeans clustering.
    """
    logger.info(f"Processing audio file: {audio_path}")

    # Load the Whisper model
    whisper_model = load_whisper_model(use_gpu=use_gpu)

    # Convert MP3 to WAV format for speaker embedding extraction
    wav_path = audio_path.replace(".mp3", ".wav")
    logger.debug(f"Converting MP3 to WAV at: {wav_path}")
    AudioSegment.from_mp3(audio_path).export(wav_path, format="wav")

    # Initialize the voice encoder for speaker diarization
    logger.debug("Initializing voice encoder...")
    encoder = VoiceEncoder()

    # Perform transcription using Whisper
    logger.info("Running Whisper transcription...")
    result = whisper_model.transcribe(audio_path, language=lang_code)
    segments = result.get("segments", [])

    if not segments:
        logger.warning("No transcription segments found.")
        raise HTTPException(status_code=400, detail="No transcription segments found.")

    logger.info(f"Total transcription segments: {len(segments)}")

    # Extract speaker embeddings
    logger.debug("Preprocessing WAV file for speaker embeddings...")
    wav = preprocess_wav(wav_path)
    _, partial_embeds, _ = encoder.embed_utterance(wav, return_partials=True)
    partial_embeds = np.array(partial_embeds)
    logger.debug(f"Extracted {len(partial_embeds)} partial speaker embeddings.")

    # Perform speaker diarization using KMeans clustering
    if len(partial_embeds) < 2:
        logger.info("Single speaker detected, skipping clustering.")
        diarized_output = [
            {"speaker": "Speaker 1", "start": seg.get("start", 0), "end": seg.get("end", 0), "text": seg.get("text", "")}
            for seg in segments
        ]
    else:
        logger.info("Multiple speakers detected, applying KMeans clustering...")
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

    # Clean up the temporary WAV file
    if os.path.exists(wav_path):
        os.remove(wav_path)
        logger.debug(f"Deleted temporary WAV file: {wav_path}")

    logger.info("Audio processing complete.")
    return diarized_output


@router.post("/transcriptions/upload")
async def transcribe_audio(
    file: UploadFile = File(...),
    request: TranscriptionRequest = Depends(),
):
    """
    Endpoint to accept an MP3 file upload, transcribe it, and return speaker-diarized text.
    """
    logger.info(f"Received file: {file.filename}")
    temp_path = ""

    try:
        # Save the uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
            shutil.copyfileobj(file.file, temp_audio)
            temp_path = temp_audio.name
            logger.info(f"Saved uploaded file at: {temp_path}")

        # Process and transcribe the uploaded file
        logger.info("Starting transcription...")
        result = process_audio_file(temp_path, lang_code=request.lang_code, use_gpu=request.use_gpu)
        logger.info("Transcription completed successfully.")
        return result

    except Exception as e:
        logger.exception(f"Error during transcription of file: {file.filename}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Clean up the temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            logger.debug(f"Deleted temporary file: {temp_path}")

@router.post("/transcriptions/from-url")
async def transcribe_from_url(request: FileRequest):
    """
    Endpoint to transcribe an MP3 file provided via a URL or local file path.
    """
    logger.info(f"Transcription requested from URL: {request.file_url}, download required: {request.download}")
    file_path = ""

    try:
        # Download file from URL if required
        if request.download:
            logger.debug("Downloading audio from URL...")
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
            # Use the local file path if the download flag is not set
            file_path = "/var/www/aventisia.com" + str(request.file_url)
            logger.info(f"Using local file path: {file_path}")

        # Process the file for transcription
        logger.info(f"Starting transcription for file: {file_path}")
        result = process_audio_file(str(file_path), lang_code=request.lang_code, use_gpu=request.use_gpu)
        logger.info("Transcription from URL/local path completed.")
        return result

    except Exception as e:
        logger.exception(f"Error during transcription from URL: {request.file_url}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Remove the downloaded file if necessary
        if request.download and os.path.exists(file_path):
            os.remove(file_path)
            logger.debug(f"Deleted downloaded temp file: {file_path}")
            