# main.py

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.Extraction import router as pdf_extraction_router
from app.api.SpeechToText import router as speech_to_text_router
from app.api.KokoroTTS import router as kokoro_text_to_speech_router
from app.api.AIModelDocument import router as ai_model_document_router
from app.websocket.routes import router as websocket_router
from app.dependencies.auth import authenticate_current_user
from app.qdrant.service import initialize_qdrant_collections
from app.models.user import User

# Initialize the FastAPI application
app = FastAPI(root_path="/api")

initialize_qdrant_collections()

# Register API routes with tags for automatic documentation
app.include_router(pdf_extraction_router, tags=["PDF Extraction"])
app.include_router(speech_to_text_router, tags=["Speech-to-Text"])
app.include_router(kokoro_text_to_speech_router, tags=["Kokoro TTS"])
app.include_router(ai_model_document_router, tags=["AI Model Documents"])
app.include_router(websocket_router, tags=["WebSockets"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace * with specific domains if needed
    allow_credentials=True,
    allow_methods=["*"],  # Allow any method (GET, POST, etc.)
    allow_headers=["*"],  # Allow any header
)

# Define the root endpoint of the API
@app.get("/", tags=["General"])
def read_root():
    return {"message": "Welcome to the FastAPI service!"}

@app.get("/validate", tags=["General"])
def validate(user: User = Depends(authenticate_current_user)):
    return {"message": f"Welcome to the FastAPI service, {user.username}!"}