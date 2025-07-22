import datetime
import re
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException
from app.models.ai_model_document import AIModelDocument
from app.qdrant.setup import client, embedder
from app.core.logger import logger
from app.api.Extraction import extract_pdf_text, PDFRequest
from qdrant_client.models import PointStruct


DOCUMENT_COLLECTION_NAME = "documents"

router = APIRouter()

@router.post("/ai-model/document")
async def add_ai_model_document(document: AIModelDocument):
    """
    Endpoint to add AI model document.
    Checks if file_path is provided, generates text from the file.
    If content is provided, saves the content.
    """

    extracted_text = None

    # Check if the file path is not None and if so, generate text from it
    if document.file_path:
        try:
            # Assuming `extract_pdf_text` is a method to extract text from the file URL
            payload = PDFRequest(pdf_url=document.file_path, download=False)
            extracted_text = await extract_pdf_text(payload)
            logger.info(f"Generated text from file at {document.file_path}: {extracted_text[:100]}...")  # log first 100 characters of generated text
        except Exception as e:
            logger.error(f"Error generating text from file at {document.file_path}: {e}")
            raise HTTPException(status_code=500, detail="Error generating text from file.")
    else:
        extracted_text = None

    # If content is provided, save the content
    if document.content:
        try:
            await add_document_content_to_collection(document, document.content)
            logger.info(f"Content saved for model {document.model_id}.")
        except Exception as e:
            logger.error(f"Error saving content for model {document.model_id}: {e}")
            raise HTTPException(status_code=500, detail="Error saving content.")

    # If extracted text exists, save it to the Qdrant collection
    if extracted_text:
        try:
            await add_document_content_to_collection(document, extracted_text)
            logger.info(f"Generated text added to collection for model {document.model_id}.")
        except Exception as e:
            logger.error(f"Error saving generated text for model {document.model_id}: {e}")
            raise HTTPException(status_code=500, detail="Error saving generated text.")

    return {"message": "AI model document added successfully."}


async def add_document_content_to_collection(document: AIModelDocument, content: str):
    """
    This function adds the content of the document into the Qdrant collection.
    It processes the content into chunks and then generates embeddings for each chunk.
    """

    try:
        if embedder is None:
            raise ValueError("Embedder is not initialized. Cannot add document.")

        full_text = content.strip()

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
                "model_id": str(document.model_id),
                "user_id": str(document.user_id),
                "text": chunk_text,
                "timestamp": str(datetime.datetime.utcnow()),
                "chunk_index": chunk_number,
                "is_chunked": total_word_count > max_words_per_chunk,
            }

            # Step 6: Create a Qdrant Point and upsert it into the collection
            point = PointStruct(id=point_id, vector=chunk_vector, payload=payload)
            client.upsert(collection_name=DOCUMENT_COLLECTION_NAME, points=[point], wait=True)

            # Save inserted point ID and increment counters
            all_point_ids.append(point_id)
            chunk_number += 1
            current_word_index += (max_words_per_chunk - overlap_words)

        logger.info(f"Successfully added {len(all_point_ids)} word-based chunk(s).")

    except Exception as e:
        logger.error(f"Failed to add document: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add document: {e}")
