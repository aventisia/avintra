# main.py

from fastapi import Depends, FastAPI
from app.api.Extraction import router as pdf_extraction_router
from app.api.TextToSpeech import router as text_to_speech_router
from app.api.SpeechToText import router as speech_to_text_router
from app.api.KokoroTTS import router as kokoro_text_to_speech_router
from app.dependencies.auth import authenticate_current_user
from app.websocket import routes as websocket_routes
# from app.qdrant.setup import initialize_qdrant_and_embedder
from app.models.user import User

# Initialize the FastAPI application
app = FastAPI(root_path="/api")

# initialize_qdrant_and_embedder()

# Register API routes with tags for automatic documentation
app.include_router(pdf_extraction_router, tags=["PDF Extraction"])
app.include_router(text_to_speech_router, tags=["Text-to-Speech"])
app.include_router(speech_to_text_router, tags=["Speech-to-Text"])
app.include_router(kokoro_text_to_speech_router, tags=["Kokoro TTS"])
app.include_router(websocket_routes.router)

# Define the root endpoint of the API
@app.get("/", tags=["General"])
def read_root():
    return {"message": "Welcome to the FastAPI service!"}

@app.get("/validate", tags=["General"])
def validate(user: User = Depends(authenticate_current_user)):
    return {"message": f"Welcome to the FastAPI service, {user.username}!"}