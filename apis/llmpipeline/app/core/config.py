import os
import sys
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Enforce the supported Python version (3.12.x). The project depends on packages
# (e.g. pydub -> pyaudioop) that are not compatible with Python 3.13+.
# Fail fast with a clear message instead of a confusing import error later.
if sys.version_info.major != 3 or sys.version_info.minor != 12:
    raise RuntimeError(
        f"Unsupported Python version: {sys.version_info.major}.{sys.version_info.minor}."
        " This project requires Python 3.12.x. "
        "Install Python 3.12 and recreate the venv with: "
        "`py -3.12 -m venv venv` (Windows) or `python3.12 -m venv venv` (Linux/macOS)."
    )

# Load environment-specific .env (e.g., .env.local).
# We explicitly seed os.environ so libraries like LiteLLM that read env vars
# directly see the same values pydantic_settings will use. .env.local must
# override .env because it holds the real (untracked) secrets.
env = os.getenv("ENV", "local")
env_files = ['.env']
if env == "local":
    env_files.append(f'.env.{env}')

for env_file in env_files:
    if os.path.isfile(env_file):
        load_dotenv(env_file, override=(env_file != '.env'))

class Settings(BaseSettings):
    PROJECT_NAME: str = "LLM Pipeline APIs"
    PROJECT_DESCRIPTION: str = "APIs for managing LLM pipelines"
    PLATFORM_VERSION: str = "0.1.44"
    
    # App base url
    APP_BASE_URL: str

    # Whether to verify TLS certificates when calling internal backends (AccountsAPIs / WorkspaceAPIs).
    # In local/dev environments the backend may use a self-signed cert, so set this to false there.
    SSL_VERIFY: bool = True

    # Internal WorkspaceAPIs URL used for cloud-connector tool execution.
    # Defaults to https://{APP_BASE_URL}/api (the ASP.NET backend path base).
    # Override for local dev when WorkspaceAPIs runs on a non-standard port.
    WORKSPACE_API_URL: str = ""

    # PostgreSQL settings
    POSTGRESQL_HOST: str
    POSTGRESQL_PORT: str
    POSTGRESQL_USERNAME: str
    POSTGRESQL_PASSWORD: str
    POSTGRESQL_WORKSPACE_DB_NAME: str = "WorkspaceDb"
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
    QDRANT_URL: str = ""
    QDRANT_API_KEY: str = ""

    # TTS/STT
    ELEVENLABS_API_URL: str = "https://api.elevenlabs.io/v1"
    ELEVENLABS_API_KEY: str = ""

    # Corsair sidecar configuration
    # URL of the Corsair sidecar (llmpipeline calls this directly for Corsair tools).
    # The sidecar is backend-only and private; no auth header is required.
    CORSAIR_API_BASE_URL: str = ""

    model_config = SettingsConfigDict(
        env_file=env_files, # System env vars take precedence over these files
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='ignore'
    )

settings = Settings()