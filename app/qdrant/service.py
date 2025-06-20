# app/qdrant/service.py

from app.models import ChatMessage
from qdrant_client.models import PointStruct, VectorParams, Distance, FieldCondition, MatchValue
from uuid import uuid4
from fastapi import HTTPException
from setup import client, embedder, COLLECTION_NAME
from app.core.logger import logger


def initialize_qdrant_collection():
    """
    Checks if the Qdrant collection exists. If not, it creates a new one. 
    This should be called once during the application startup.
    """
    try:
        # Fetch the list of existing collections from Qdrant
        collections = client.get_collections().collections
        collection_names = [col.name for col in collections]
        
        # If the target collection does not exist, create it
        if COLLECTION_NAME not in collection_names:
            logger.info(f"Collection '{COLLECTION_NAME}' not found. Creating a new collection...")
            
            # Ensure the embedder is initialized before trying to get its dimension
            if embedder is None:
                raise ValueError("Embedder is not initialized. Cannot create collection.")
            
            # Create the collection with appropriate vector parameters
            client.recreate_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=embedder.get_sentence_embedding_dimension(), distance=Distance.COSINE),
            )
            logger.info(f"Collection '{COLLECTION_NAME}' created successfully.")
        else:
            logger.info(f"Collection '{COLLECTION_NAME}' already exists.")
    except Exception as e:
        logger.error(f"Error occurred while initializing collection: {e}")
        # Raise an HTTPException to propagate error response to FastAPI
        raise HTTPException(status_code=500, detail=f"Failed to initialize collection: {e}")

def add_document_to_collection(chat_message: ChatMessage):
    """
    Adds a ChatMessage to the Qdrant collection with an embedding vector and its metadata.

    Args:
        chat_message (ChatMessage): The chat message object containing text, user info, timestamp, etc.

    Returns:
        str: The unique ID of the added document.
    """
    try:
        if embedder is None:
            raise ValueError("Embedder is not initialized. Cannot add document.")
        
        # Generate embedding vector from the message text
        message_vector = embedder.encode(chat_message.message).tolist()

        # Generate a unique point ID for Qdrant
        point_id = str(uuid4())

        # Construct the payload from the ChatMessage
        payload = {
            "model_id": str(chat_message.model_id),
            "user_id": str(chat_message.user_id),
            "username": chat_message.username,
            "message": chat_message.message,
            "timestamp": chat_message.timestamp,
        }

        # Include file metadata if present
        if chat_message.file:
            payload["file"] = {
                "filename": chat_message.file.filename,
                "content_type": chat_message.file.content_type,
                "size": chat_message.file.size,
                "url": str(chat_message.file.url) if chat_message.file.url else None
            }

        # Create and upsert the point
        point = PointStruct(id=point_id, vector=message_vector, payload=payload)
        client.upsert(collection_name=COLLECTION_NAME, points=[point], wait=True)

        logger.info(f"ChatMessage with ID '{point_id}' added successfully.")
        return point_id

    except Exception as e:
        logger.error(f"Failed to add ChatMessage: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add document: {e}")


def search_documents_in_collection(query: str, user_id: str = None, model_id: str = None, top_k: int = 5):
    """
    Searches for relevant chat messages using semantic similarity, optionally filtered by user_id.

    Args:
        query (str): The search query text.
        user_id (str, optional): The user_id to filter the search results by. Defaults to None (no filtering).
        top_k (int, optional): Number of top results to return. Defaults to 5.

    Returns:
        list: A list of search result dicts including message, score, and metadata.
    """
    try:
        if embedder is None:
            raise ValueError("Embedder is not initialized. Cannot search documents.")
        
        # Build filter conditions dynamically
        conditions = []
        if user_id:
            conditions.append(FieldCondition(key="user_id", match=MatchValue(value=str(user_id))))
        if model_id:
            conditions.append(FieldCondition(key="model_id", match=MatchValue(value=str(model_id))))

        # Combine conditions with AND if any exist
        filter_condition = Filter(must=conditions) if conditions else None


        # Perform the search with or without user_id filter
        search_results = client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_vector,
            limit=top_k,
            filter=filter_condition,  # Apply the filter if provided
        )

        logger.info(f"Search executed for query '{query}', found {len(search_results)} results.")

        # Return the search results with relevant metadata
        return [
            {
                "id": result.id,
                "score": result.score,
                "message": result.payload.get("message"),
                "username": result.payload.get("username"),
                "timestamp": result.payload.get("timestamp"),
                "user_id": result.payload.get("user_id"),
                "model_id": result.payload.get("model_id"),
                "file": result.payload.get("file")
            }
            for result in search_results
        ]

    except Exception as e:
        logger.error(f"Failed to search documents: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to search documents: {e}")
