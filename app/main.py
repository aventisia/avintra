# main.py
from fastapi import FastAPI
from app.api.Extraction import router as pdf_extraction_router
from app.api.TextToSpeech import router as text_to_speech_router
from app.api.SpeechToText import router as speech_to_text_router
from app.api.KokoroTTS import router as kokoro_text_to_speech_router

# Create a FastAPI application instance with a custom root path
app = FastAPI(root_path="/api")

# Register API routers with descriptive tags for automatic documentation
app.include_router(pdf_extraction_router, tags=["PDF Extraction"])
app.include_router(text_to_speech_router, tags=["Text-to-Speech"])
app.include_router(speech_to_text_router, tags=["Speech-to-Text"])
app.include_router(kokoro_text_to_speech_router, tags=["Kokoro TTS"])

# Define the root endpoint of the API
@app.get("/", tags=["General"])
def get_root_message():
    return {"message": "Welcome to the FastAPI service!"}


