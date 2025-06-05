# SpeechToText.py

from fastapi import APIRouter, UploadFile, File, Query
import whisper
from resemblyzer import preprocess_wav, VoiceEncoder
from sklearn.cluster import KMeans
from pydub import AudioSegment
import tempfile, shutil, os
import numpy as np
from urllib.parse import urlparse, unquote

# Create an API router instance
router = APIRouter()

# Load the Whisper model (base version) for speech-to-text
model = whisper.load_model("base")

# Load the speaker encoder from Resemblyzer
encoder = VoiceEncoder()

def process_audio_file(audio_path: str):
    """
    Transcribes an audio file and applies basic speaker diarization using embeddings and KMeans clustering.
    
    Parameters:
        audio_path (str): Path to the input MP3 audio file.

    Returns:
        dict: A dictionary containing transcription segments with speaker labels.
    """
    # Convert MP3 to WAV to prepare for embedding generation
    wav_path = audio_path.replace(".mp3", ".wav")
    AudioSegment.from_mp3(audio_path).export(wav_path, format="wav")

    # Run Whisper transcription on the original MP3
    result = model.transcribe(audio_path, language="en")
    segments = result.get("segments", [])
    
    # Return error if no transcription segments were detected
    if not segments:
        return {"error": "No transcription segments found."}

    # Generate speaker embeddings using the Resemblyzer encoder
    wav = preprocess_wav(wav_path)
    _, partial_embeds, _ = encoder.embed_utterance(wav, return_partials=True)
    partial_embeds = np.array(partial_embeds)

    # If there are not enough embeddings for clustering, fallback to a single speaker
    if len(partial_embeds) < 2:
        return {
            "segments": [
                {
                    "speaker": "Speaker 1",
                    "start": seg.get("start", 0),
                    "end": seg.get("end", 0),
                    "text": seg.get("text", "")
                } for seg in segments
            ]
        }

    # Perform KMeans clustering to group embeddings by speaker (assume 2 speakers max)
    n_clusters = min(2, len(partial_embeds))
    kmeans = KMeans(n_clusters=n_clusters, random_state=0)
    labels = kmeans.fit_predict(partial_embeds)

    # Create speaker labels like "Speaker 1", "Speaker 2"
    speakers = [f"Speaker {i+1}" for i in range(n_clusters)]

    # Assign each transcription segment to a speaker label
    diarized_output = []
    for idx, seg in enumerate(segments):
        label_index = idx % len(labels)  # Use modulo to avoid index errors
        diarized_output.append({
            "speaker": speakers[labels[label_index]],
            "start": seg.get("start", 0),
            "end": seg.get("end", 0),
            "text": seg["text"]
        })

    # Remove temporary WAV file after processing
    if os.path.exists(wav_path):
        os.remove(wav_path)

    return {"segments": diarized_output}


@router.post("/stt/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    API endpoint to upload an MP3 file and return a diarized transcription.
    
    Parameters:
        file (UploadFile): The uploaded MP3 audio file.

    Returns:
        JSON response with diarized transcription segments or error message.
    """
    temp_path = ""
    try:
        # Save uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
            shutil.copyfileobj(file.file, temp_audio)
            temp_path = temp_audio.name

        # Process the saved file
        return process_audio_file(temp_path)

    except Exception as e:
        return {"error": str(e)}
    
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.post("/stt/transcribe_from_url/")
async def transcribe_from_url(url: str = Query(..., description="Local file:// URL of the MP3 file")):
    """
    API endpoint to transcribe a locally hosted MP3 file using a file:// URL.
    
    Parameters:
        url (str): The file:// URL pointing to a local MP3 file.

    Returns:
        JSON response with diarized transcription segments or error message.
    """
    try:
        # Parse the provided URL
        parsed = urlparse(url)
        if parsed.scheme != "file":
            return {"error": "Only file:// URLs are supported."}

        # Decode and adjust file path
        file_path = unquote(parsed.path)
        if os.name == "nt" and file_path.startswith("/"):
            file_path = file_path[1:]  # Windows file path fix

        # Ensure the file exists
        if not os.path.exists(file_path):
            return {"error": f"File does not exist: {file_path}"}

        # Process the file
        return process_audio_file(file_path)

    except Exception as e:
        return {"error": str(e)}
