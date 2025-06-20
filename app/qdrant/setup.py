# setup.py

from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
import os
from fastapi import HTTPException
from app.core.logger import logger

# Constants
COLLECTION_NAME = "chats"  # Define collection name here as it's used in services

# --- Initialize Qdrant client and embedder ---
def initialize_qdrant_and_embedder():
    """
    Initializes and returns the Qdrant client and SentenceTransformer embedder.
    Raises ValueError or HTTPException if environment variables are not set or initialization fails.
    """
    # Load Qdrant URL and API Key from environment variables
    QDRANT_URL = os.getenv("QDRANT_URL")
    QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

    # Check if QDRANT_URL is set in environment variables
    if not QDRANT_URL:
        logger.error("QDRANT_URL environment variable is not set.")
        raise ValueError("QDRANT_URL environment variable must be set.")

    qdrant_client_instance = None
    embedder_instance = None

    try:
        # Initialize Qdrant client
        qdrant_client_instance = QdrantClient(
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY if QDRANT_API_KEY else None  # Use API key if provided
        )
        logger.info(f"Qdrant client initialized successfully for URL: {QDRANT_URL}")
    except Exception as e:
        # Log and raise an HTTPException if Qdrant client initialization fails
        logger.error(f"Failed to initialize Qdrant client: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to initialize Qdrant client: {e}")

    try:
        # Initialize SentenceTransformer embedder
        embedder_instance = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("SentenceTransformer model 'all-MiniLM-L6-v2' loaded successfully.")
    except Exception as e:
        # Log and raise an HTTPException if embedder initialization fails
        logger.error(f"Failed to load SentenceTransformer model: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load SentenceTransformer model: {e}")

    return qdrant_client_instance, embedder_instance

# Initialize Qdrant client and embedder globally to be used across the application
try:
    # Attempt to initialize client and embedder
    client, embedder = initialize_qdrant_and_embedder()
except (ValueError, HTTPException) as e:
    # Critical error, log and re-raise to stop application startup
    logger.critical(f"Critical error during Qdrant/Embedder setup: {e}. Exiting application.")
    raise  # In a real application, a graceful shutdown or retry logic might be implemented
