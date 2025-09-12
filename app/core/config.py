import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

if os.getenv("ENV") == "development":
    load_dotenv(".env.localhost")

class Settings(BaseSettings):
    # JWT settings from environment variables
    secret_key: str
    algorithm: str = "HS512"
    issuer: str = "localhost"
    audience: str = "localhost"

    # Qdrant settings from environment variables
    qdrant_api_key: str | None = None
    qdrant_url: str | None = None

    # Ollama settings from environment variables
    ollama_api_url: str
    ollama_api_key: str

    model_config = SettingsConfigDict(
        extra="allow"
    )

# Initialize the settings class, loading the environment variables
settings = Settings()
