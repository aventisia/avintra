# app/core/config.py
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # JWT settings
    secret_key: str = os.getenv("SECRET_KEY", "some_random_secret_key_some_random_secret_key_some_random_secret_key_some_random_secret_key_some_random_secret_key_some_random_secret_key_some_random_secret_key")  # Can be loaded from environment variable
    algorithm: str = "HS512"
    issuer: str = os.getenv("JWT_ISSUER", "localhost")
    audience: str = os.getenv("JWT_AUDIENCE", "localhost")
    
    # Cookie settings
    # cookie_name: str = "access_token"
    # cookie_max_age: int = 3600  # 1 hour
    # cookie_secure: bool = False  # Set to True if using HTTPS
    # cookie_samesite: str = "Strict"  # SameSite settings can be "Strict", "Lax", or "None"
    # cookie_domain: str = ".aventisia.com"  # Domain for the cookie

    class Config:
        env_file = ".env"  # Optional: Load environment variables from .env file

settings = Settings()
