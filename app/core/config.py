import os
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load environment-specific .env (e.g., .env.local, .env.development)
env = os.getenv("ENV", "local")
env_files = ['.env']
if env == "local":
    env_files.append(f'.env.{env}')

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
    
    OPENROUTER_API_URL: str
    OPENROUTER_API_KEY: str

    ANTHROPIC_API_URL: str
    ANTHROPIC_API_KEY: str
    
    DEEPINFRA_API_URL: str
    DEEPINFRA_API_KEY: str
    
    # TTS and STT
    ELEVENLABS_API_KEY: str
    DEEPGRAM_API_KEY: str
    
    model_config = SettingsConfigDict(
        env_file=env_files, # System env vars take precedence over these files
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='ignore'
    )

settings = Settings()