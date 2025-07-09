# app/qdrant/service.py

import datetime
from app.models.chat_message import ChatMessage
from qdrant_client.models import PointStruct, VectorParams, Distance, MatchValue, Filter, FieldCondition, OrderBy
from uuid import uuid4, UUID
from fastapi import HTTPException
from app.qdrant.setup import client, embedder
from app.core.logger import logger

# Constants
CHAT_COLLECTION_NAME = "chats"
DOCUMENT_COLLECTION_NAME = "documents"

def initialize_qdrant_collections():
    """
    Verifies the existence of Qdrant collections for chats and documents. 
    If they do not exist, it creates the necessary collections.
    This function should be called once during the application startup.
    """
    try:
        # Get the list of existing collections in Qdrant
        collections = client.get_collections().collections
        existing_collections = {col.name for col in collections}
        
        # Define collections to initialize
        collections_to_initialize = [
            (CHAT_COLLECTION_NAME, "Chat"),
            (DOCUMENT_COLLECTION_NAME, "Document")
        ]
        
        # Loop through each collection and check if it exists
        for collection_name, collection_type in collections_to_initialize:
            if collection_name not in existing_collections:
                logger.info(f"{collection_type} collection '{collection_name}' not found. Creating a new collection...")

                # Ensure the embedder is initialized before creating the collection
                if embedder is None:
                    raise ValueError("Embedder is not initialized. Cannot create collection.")
                
                # Create the collection with the appropriate vector configuration
                client.recreate_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(
                        size=embedder.get_sentence_embedding_dimension(),
                        distance=Distance.COSINE
                    ),
                )
                logger.info(f"{collection_type} collection '{collection_name}' created successfully.")
            else:
                logger.info(f"{collection_type} collection '{collection_name}' already exists.")
    
    except Exception as e:
        logger.error(f"Error occurred while initializing collections: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to initialize collections: {e}")

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
        client.upsert(collection_name=CHAT_COLLECTION_NAME, points=[point], wait=True)

        logger.info(f"ChatMessage with ID '{point_id}' added successfully.")
        return point_id

    except Exception as e:
        logger.error(f"Failed to add ChatMessage: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add document: {e}")

def get_last_chat_turn_by_model_id(model_id: str, top_k: int = 5):
    """
    Retrieves the most recent exchange between the user and AI, considering the latest 5 messages, sorted by timestamp.

    Args:
        model_id (str): The identifier for the model whose messages need to be fetched.
        top_k (int): The number of messages to retrieve (default is 5).

    Returns:
        dict: A dictionary containing the last user message and AI response, or an empty dictionary if no messages are found.
    """
    logger.info(f"Fetching the last {top_k} chat turns for model: {model_id}")

    try:
        model_id = UUID("da4c7baf-4557-4977-af54-c9745fc84dee")

        # Fetch the last 'top_k' user messages, sorted by timestamp
        user_response = client.scroll(
            collection_name=CHAT_COLLECTION_NAME,
            scroll_filter=Filter(must=[
                FieldCondition(key="user_id", match=MatchValue(value=str(model_id))),
                FieldCondition(key="username", match=MatchValue(value="User"))
            ]),
            limit=top_k,
            with_payload=True,
            with_vectors=False,
            # order_by=OrderBy(
            #     key="timestamp",
            #     direction="desc",
            #     start_from=str(datetime.datetime.utcnow()),
            # )
        )

        # Extract user messages if available
        user_msgs = []
        if user_response:
            for record in user_response[0]:
                if record:
                    user_msgs.append(record.payload.get("message", "No message found"))
        else:
            logger.warning(f"No user messages found for model: {model_id}")

        # Fetch the last 'top_k' AI messages, sorted by timestamp
        ai_response = client.scroll(
            collection_name=CHAT_COLLECTION_NAME,
            scroll_filter=Filter(must=[
                FieldCondition(key="user_id", match=MatchValue(value=str(model_id))),
                FieldCondition(key="username", match=MatchValue(value="AIPersona"))
            ]),
            limit=top_k,
            with_payload=True,
            with_vectors=False,
            # order_by=OrderBy(
            #     key="timestamp",
            #     direction="desc",
            #     start_from=str(datetime.datetime.utcnow()),
            # )
        )

        # Extract AI messages if available
        ai_msgs = []
        if ai_response:
            for record in ai_response[0]:
                if record:
                    ai_msgs.append(record.payload.get("message", "No message found"))
        else:
            logger.warning(f"No AI messages found for model: {model_id}")

        return {
            "User": user_msgs,
            "AIPersona": ai_msgs
        }

    except Exception as e:
        logger.error(f"Error fetching chat turns for model {model_id}: {e}")
        return {}
        

def get_document_context_by_model_id(user_query: str, model_id: str, top_k: int = 5) -> str:
    """
    Retrieves the top-k document chunks relevant to the user query and filtered by the model_id.

    Args:
        user_query (str): The query from the user to search for relevant documents.
        model_id (str): The model identifier to filter the documents.
        top_k (int): The number of top results to return (default is 5).

    Returns:
        str: A string containing the text from the top-k relevant document chunks.
    """

    # Step 1: Generate a query vector from the user query
    logger.info("Generating query vector for the user query.")
    query_vector = embedder.encode(user_query).tolist()

    # Step 2: Define the filter to search for documents by model_id
    logger.info(f"Creating search filter for model_id: {model_id}")
    search_filter = Filter(
        must=[
            FieldCondition(key="model_id", match=MatchValue(value=str(model_id)))
        ]
    )

    try:
        # Step 3: Perform the search in the document collection using the query vector and filter
        logger.info(f"Performing search in collection: {DOCUMENT_COLLECTION_NAME} for top-{top_k} results.")
        search_results = client.search(
            collection_name=DOCUMENT_COLLECTION_NAME,
            query_vector=query_vector,
            query_filter=search_filter,
            limit=top_k,
            with_payload=True
        )

        # Step 4: Extract and concatenate the document texts from the search results
        logger.info(f"Retrieved {len(search_results)} search results.")
        document_texts = [
            hit.payload["text"] for hit in search_results if "text" in hit.payload
        ]

        # Check if no valid documents are found
        if not document_texts:
            logger.warning(f"No document texts found for model_id: {model_id}. Returning empty context.")
            return ""

        # Join the document texts with a newline separator
        document_context = "\n".join(document_texts)
        logger.info(f"Successfully retrieved document context for model_id: {model_id}.")
        
        return document_context

    except Exception as e:
        logger.error(f"Error occurred while fetching document context for model_id {model_id}: {e}")
        return ""

