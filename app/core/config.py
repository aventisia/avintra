import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Get ENVIRONMENT value from the system or default to 'development'
env = os.getenv("ENVIRONMENT", "development").lower()

# Set the correct .env file based on the environment
env_file = f".env.{env}" 

# Load environment variables from .env file
load_dotenv(env_file)

class Settings(BaseSettings):
    # JWT settings from environment variables
    secret_key: str = os.getenv("SecretKey")
    algorithm: str = "HS512"
    issuer: str = os.getenv("Issuer", "localhost")
    audience: str = os.getenv("Audience", "localhost")

    # Qdrant settings from environment variables
    qdrant_api_key: str | None = os.getenv("QDRANT_API_KEY", None) 
    qdrant_url: str | None = os.getenv("QDRANT_URL", None)

    # Ollama settings from environment variables
    ollama_api_url: str = os.getenv("OllamaAPI", None)
    ollama_api_key: str = os.getenv("OllamaAPIKey", None)

    # Dynamically load the .env file based on the environment
    model_config = SettingsConfigDict(
        # This tells Pydantic to load the correct .env file
        env_file=env_file,  
         # Allow extra fields not explicitly defined
        extra="allow" 
    )

# Initialize the settings class, loading the environment variables
settings = Settings()
