# SpeechToText.py

from pathlib import Path
import platform
from fastapi import APIRouter, HTTPException, UploadFile, File
import requests
import whisper
from resemblyzer import preprocess_wav, VoiceEncoder
from sklearn.cluster import KMeans
from pydub import AudioSegment
import tempfile, shutil, os
import numpy as np
from app.models.FileRequest import FileRequest
from app.models.TranscriptionSegment import TranscriptionSegment
from typing import List

# Initialize FastAPI router
router = APIRouter()

def process_audio_file(audio_path: str) -> List[TranscriptionSegment]:
    """
    Transcribes an MP3 audio file and assigns speaker labels using Resemblyzer embeddings and KMeans clustering.
    
    Args:
        audio_path (str): Path to the input MP3 file.

    Returns:
        List[dict]: List of segments, each with speaker, start, end, and text.
    """
    # Convert MP3 to WAV for speaker embedding extraction
    wav_path = audio_path.replace(".mp3", ".wav")
    AudioSegment.from_mp3(audio_path).export(wav_path, format="wav")

    # Load Resemblyzer encoder for speaker embedding
    encoder = VoiceEncoder()
    
    # Load Whisper base model for transcription
    model = whisper.load_model("base.pt")

    # Run transcription with Whisper
    result = model.transcribe(audio_path, language="en")
    segments = result.get("segments", [])
    
    # If no segments found, raise error
    if not segments:
        raise HTTPException(status_code=400, detail="No transcription segments found.")

    # Preprocess WAV audio for speaker embedding extraction
    wav = preprocess_wav(wav_path)
    _, partial_embeds, _ = encoder.embed_utterance(wav, return_partials=True)
    partial_embeds = np.array(partial_embeds)

    # If not enough embeddings, assume single speaker
    if len(partial_embeds) < 2:
        diarized_output = [
            {
                "speaker": "Speaker 1",
                "start": seg.get("start", 0),
                "end": seg.get("end", 0),
                "text": seg.get("text", "")
            } for seg in segments
        ]
    else:
        # Perform KMeans clustering (max 2 speakers)
        n_clusters = min(2, len(partial_embeds))
        kmeans = KMeans(n_clusters=n_clusters, random_state=0)
        labels = kmeans.fit_predict(partial_embeds)

        # Assign speaker labels to each segment based on clustering
        speakers = [f"Speaker {i+1}" for i in range(n_clusters)]
        diarized_output = []
        for idx, seg in enumerate(segments):
            label_index = idx % len(labels)  # Avoid index error
            diarized_output.append({
                "speaker": speakers[labels[label_index]],
                "start": seg.get("start", 0),
                "end": seg.get("end", 0),
                "text": seg["text"]
            })

    # Clean up temporary WAV file
    if os.path.exists(wav_path):
        os.remove(wav_path)

    return diarized_output

@router.post("/transcriptions/upload")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    FastAPI endpoint to accept an uploaded MP3 file, transcribe it, and return speaker-diarized text.
    
    Args:
        file (UploadFile): The uploaded MP3 file.

    Returns:
        List[dict]: Diarized transcription segments.
    """
    temp_path = ""
    try:
        # Save uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
            shutil.copyfileobj(file.file, temp_audio)
            temp_path = temp_audio.name

        # Process and return the transcription
        return process_audio_file(temp_path)

    except Exception as e:
        # Return internal server error with exception message
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Ensure temporary file is deleted
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.post("/transcriptions/from-url")
async def transcribe_from_url(request: FileRequest):
    """
    FastAPI endpoint to transcribe a remote or local audio file (MP3) using its URL.
    
    Args:
        request (FileRequest): JSON body containing file_url and download flag.

    Returns:
        List[dict]: Diarized transcription segments.
    """
    try:
        if request.download:
            # Download file from URL to temporary file
            response = requests.get(request.file_url)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to download file.")

            temp_audio_path = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3").name
            with open(temp_audio_path, "wb") as f:
                f.write(response.content)

            file_path = temp_audio_path
        else:
            # Use local path depending on operating system
            if platform.system() == "Linux":
                file_path = Path("/var/www/aventisia.com") / request.file_url
            else:
                file_path = request.file_url  # Adjust for Windows or other OS

        # Transcribe the file
        return process_audio_file(file_path)

    except Exception as e:
        # Catch and report any errors
        raise HTTPException(status_code=500, detail=str(e))