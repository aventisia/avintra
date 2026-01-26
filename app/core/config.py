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
    PLATFORM_VERSION: str = "0.1.44"
    
    # App base url
    APP_BASE_URL: str

    # PostgreSQL settings
    POSTGRESQL_HOST: str
    POSTGRESQL_PORT: str
    POSTGRESQL_USERNAME: str
    POSTGRESQL_PASSWORD: str
    
    # JWT Settings
    JWT_SECRET_KEY: str
    
    # LLM Providers api keys
    OPENAI_API_KEY: str
    DEEPINFRA_API_KEY: str
    GEMINI_API_KEY: str
    OPENROUTER_API_KEY: str
    
    # LLM Providers api urls
    OPENAI_API_URL: str
    DEEPINFRA_API_URL: str
    GEMINI_API_URL: str
    OPENROUTER_API_URL: str
    
    # TODO: Need to adjust later
    OLLAMA_API_URL: str
    OLLAMA_API_KEY: str
    QDRANT_URL: str
    QDRANT_API_KEY: str
    
    model_config = SettingsConfigDict(
        env_file=env_files, # System env vars take precedence over these files
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='ignore'
    )

settings = Settings()