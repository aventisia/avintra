import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load base .env
load_dotenv(".env")

# Load environment-specific .env (e.g., .env.local, .env.development)
env = os.getenv("ENV", "local")
if env and env == "local":
    load_dotenv(f".env.{env}", override=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "LLM Pipeline APIs"
    PROJECT_DESCRIPTION: str = "APIs for managing LLM pipelines"
    PROJECT_VERSION: str = "0.1.0"
    
    # Database
    APP_DB_CONNECTION_STRING: str
    TENANT_DB_CONNECTION_STRING: str
    QDRANT_URL: str
    QDRANT_API_KEY: str
    
    # JWT Settings
    JWT_ISSUER: str
    JWT_AUDIENCE: str
    JWT_SECRET_KEY: str
    
    # CORS Settings
    ALLOWED_ORIGINS: str
    ALLOWED_HOSTS: str
    
    # LLM Providers
    OLLAMA_API_URL: str
    OLLAMA_API_KEY: str
    
    OPENAI_API_URL: str
    OPENAI_API_KEY: str
    
    GEMINI_API_URL: str
    GEMINI_API_KEY: str
    
    ANTHROPIC_API_URL: str
    ANTHROPIC_API_KEY: str
    
    # TTS and STT
    ELEVENLABS_API_KEY: str
    DEEPGRAM_API_KEY: str

settings = Settings()