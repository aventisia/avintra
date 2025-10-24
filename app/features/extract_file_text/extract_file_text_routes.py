from fastapi import APIRouter, HTTPException
from .extract_file_text_schemas import ExtractFileTextRequest
from .extract_file_text_service import extract_text_from_file
from app.core.logger import logger

router = APIRouter()

@router.post("/extract-file-text")
async def extract_text_from_file_route(payload: ExtractFileTextRequest):
    try:
        extracted_text = extract_text_from_file(payload.file_url)
        logger.info("Successfully extracted text from file: %s", payload.file_url)
        return extracted_text
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during extraction: {e}")
        raise HTTPException(status_code=500, detail="Unexpected error during extraction.")