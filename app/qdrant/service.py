# app/qdrant/service.py

from app.models.chat_message import ChatMessage
from qdrant_client.models import PointStruct, VectorParams, Distance, MatchValue, Filter, FieldCondition
from uuid import uuid4
from fastapi import HTTPException
from app.qdrant.setup import client, embedder
from app.core.logger import logger
import re

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
    Adds a ChatMessage to the Qdrant collection using word-based chunking.
    
    Chunking Strategy:
    - First chunk: First 500 words.
    - Subsequent chunks: Start with the last 50 words from the previous chunk (as overlap),
      followed by the next 450 words.
    
    Args:
        chat_message (ChatMessage): The chat message containing text, metadata, and optional file info.
    
    Returns:
        list[str]: List of unique point IDs for the added document chunks.
    """
    try:
        if embedder is None:
            raise ValueError("Embedder is not initialized. Cannot add document.")

        full_text = chat_message.message.strip()

        # Step 1: Tokenize the message text into individual words using regex
        all_words = re.findall(r'\S+', full_text)
        total_word_count = len(all_words)

        max_words_per_chunk = 100
        overlap_words = 20
        current_word_index = 0
        all_point_ids = []
        chunk_number = 0

        # Step 2: Generate overlapping word-based chunks
        while current_word_index < total_word_count:
            # Define the start and end word indices for this chunk
            start_index = current_word_index
            end_index = min(current_word_index + max_words_per_chunk, total_word_count)

            # Extract words and join them into a single string
            current_chunk_words = all_words[start_index:end_index]
            chunk_text = ' '.join(current_chunk_words)

            # Step 3: Generate the vector embedding for the chunk
            chunk_vector = embedder.encode(chunk_text).tolist()

            # Step 4: Create a new point ID
            point_id = str(uuid4())

            # Step 5: Create a fresh payload for this chunk
            payload = {
                "model_id": str(chat_message.model_id),
                "user_id": str(chat_message.user_id),
                "user_type": chat_message.user_type,
                "message": chunk_text,
                "timestamp": chat_message.timestamp,
                "chunk_index": chunk_number,
                "is_chunked": total_word_count > max_words_per_chunk,
            }

            # Step 6: Include file metadata if present
            if chat_message.file:
                payload["file"] = {
                    "filename": chat_message.file.filename,
                    "content_type": chat_message.file.content_type,
                    "size": chat_message.file.size,
                    "url": str(chat_message.file.url) if chat_message.file.url else None
                }

            # Step 7: Create a Qdrant Point and upsert it into the collection
            point = PointStruct(id=point_id, vector=chunk_vector, payload=payload)
            client.upsert(collection_name=CHAT_COLLECTION_NAME, points=[point], wait=True)

            # Save inserted point ID and increment counters
            all_point_ids.append(point_id)
            chunk_number += 1
            current_word_index += (max_words_per_chunk - overlap_words)

        logger.info(f"Successfully added {len(all_point_ids)} word-based chunk(s).")
        return all_point_ids

    except Exception as e:
        logger.error(f"Failed to add ChatMessage: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add document: {e}")

def get_last_chats_by_model_id(user_query: str, model_id: str, top_k: int = 2):
    """
    Retrieves the most recent chat exchanges between a user and an AI model based on the user's query embedding.

    Args:
        user_query (str): The user's query used to generate the embedding vector.
        model_id (str): The unique identifier of the model whose chat history is being fetched.
        top_k (int): The number of recent chat messages to retrieve for both the user and AI (default is 3).

    Returns:
        str: A concatenated string containing the latest user and AI messages, or an empty dictionary if an error occurs.
    """
    logger.info(f"Fetching the last {top_k} chat turns for model: {model_id}")

    try:
        # Step 1: Generate an embedding vector from the user query
        logger.info("Generating query embedding from user input.")
        query_vector = embedder.encode(user_query).tolist()

        # Step 2: Define the search filter for user messages
        user_search_filter = Filter(
            must=[
                FieldCondition(key="model_id", match=MatchValue(value=str(model_id))),
                FieldCondition(key="user_type", match=MatchValue(value="User"))
            ]
        )

        # Step 3: Fetch the latest 'top_k' user messages for the given model
        user_response = client.search(
            collection_name=CHAT_COLLECTION_NAME,
            query_vector=query_vector,
            query_filter=user_search_filter,
            limit=top_k,
            with_payload=True,  # Include message payload
            with_vectors=False  # No need to include vector data
        )

        # Step 4: Extract user messages from the search result
        user_msg = ""
        if user_response:
            user_messages = []
            for record in user_response:
                if record:
                    user_messages.append(record.payload.get("message", "No message found"))
            user_msg = ", ".join(user_messages)
        else:
            logger.warning(f"No user messages found for model: {model_id}")

        # Step 5: Define the search filter for AI messages
        ai_search_filter = Filter(
            must=[
                FieldCondition(key="model_id", match=MatchValue(value=str(model_id))),
                FieldCondition(key="user_type", match=MatchValue(value="AIPersona"))
            ]
        )

        # Step 6: Fetch the latest 'top_k' AI messages for the given model
        ai_response = client.search(
            collection_name=CHAT_COLLECTION_NAME,
            query_vector=query_vector,
            query_filter=ai_search_filter,
            limit=top_k,
            with_payload=True,
            with_vectors=False
        )

        # Step 7: Extract AI messages from the response
        ai_msg = ""
        if ai_response:
            ai_messages = []
            for record in ai_response:
                if record:
                    ai_messages.append(record.payload.get("message", "No message found"))
            ai_msg = ", ".join(ai_messages)

        else:
            logger.warning(f"No AI messages found for model: {model_id}")

        # Step 8: Return the concatenated user and AI messages as a string
        return f"User: {user_msg}, AIPersona: {ai_msg}"

    except Exception as e:
        # Handle any exceptions that occur during the process
        logger.error(f"Error fetching chat turns for model {model_id}: {e}")
        return {}
        

def get_document_context_by_model_id(user_query: str, model_id: str, top_k: int = 3) -> str:
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
            with_payload=True,
            with_vectors=False,
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

