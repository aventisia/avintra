# main.py
from fastapi import FastAPI
from app.api.Extraction import router as extraction_router
from app.api.TextToSpeech import router as text_to_speech_router
from app.api.SpeechToText import router as speech_to_text_router

# Initialize the FastAPI app
app = FastAPI(root_path="/api")

# Include routers for different APIs with tags for documentation
app.include_router(extraction_router, tags=["PDF Extraction"])
app.include_router(text_to_speech_router, tags=["Text-to-Speech"])
app.include_router(speech_to_text_router, tags=["Speech-to-Text"])

# Root endpoint
@app.get("/", tags=["General"])
def read_root():
    return {"message": "Hello, FastAPI!"}
