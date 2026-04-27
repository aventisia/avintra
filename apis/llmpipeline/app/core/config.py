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
    POSTGRESQL_WORC_DB_NAME: str = "WorkspaceDb"
    POSTGRESQL_ACCOUNTS_DB_NAME: str = "AccountsDb"
    
    # JWT Settings
    JWT_SECRET_KEY: str
    
    # LLM Providers api keys (Since for enterprise, these keys are optional as they might use BYOK, we will not enforce them to be present)
    OPENAI_API_KEY: str = ""
    DEEPINFRA_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    CLAUDE_API_KEY: str = ""

    # LLM Providers api urls
    OPENAI_API_URL: str = "https://api.openai.com/v1"
    DEEPINFRA_API_URL: str = "https://api.deepinfra.com/v1/openai/chat/completions"
    GEMINI_API_URL: str = "https://generativelanguage.googleapis.com/v1beta"
    OPENROUTER_API_URL: str = "https://openrouter.ai/api/v1"
    CLAUDE_API_URL: str = "https://api.anthropic.com/v1"

    CLAUDE_VERSION: str = "2023-06-01"

    # TODO: Need to adjust later
    OLLAMA_API_URL: str = ""
    OLLAMA_API_KEY: str = ""
    QDRANT_URL: str = "https://dev-qdrant-db.aventisia.com"
    QDRANT_API_KEY: str = ""

    # TTS/STT
    ELEVENLABS_API_URL: str = "https://api.elevenlabs.io/v1",
    ELEVENLABS_API_KEY: str = "",
    
    model_config = SettingsConfigDict(
        env_file=env_files, # System env vars take precedence over these files
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='ignore'
    )

settings = Settings()