from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pdfplumber
import pytesseract
from pathlib import Path
from app.core.logger import logger
import docx2txt

# Create FastAPI router for file text extraction
router = APIRouter()

# General request model for file text extraction
class ExtractRequest(BaseModel):
    file_url: str

# Endpoint for extracting text from a file
@router.post("/extract-file-text")
async def extract_file_text(payload: ExtractRequest):
    try:
        extracted_text = extract_text_from_file(payload.file_url)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during extraction: {e}")
        raise HTTPException(status_code=500, detail="Unexpected error during extraction.")

    # Log the successful extraction
    logger.info("Successfully extracted text from file: %s", payload.file_url)

    # Return the extracted text
    return extracted_text

# Function to extract text from a file
def extract_text_from_file(file_path: str) -> str:
    """Extract text from various file types."""

    logger.info("Extracting text from file: %s", file_path)

    try:
        ext = Path(file_path).suffix.lower()
        if ext == '.pdf':
            return extract_text_from_pdf(file_path)
        elif ext == '.docx':
            return docx2txt.process(file_path)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")
    except Exception as e:
        logger.error(f"Error extracting text from file: {e}")
        raise HTTPException(status_code=500, detail="Error extracting text from file.")

# Function to extract text from a PDF file
def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF, combining selectable text and OCR from images on each page."""
    
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text() or ""
            ocr_texts = []
            # Check for images on the page
            if page.images:
                for img_index, img in enumerate(page.images):
                    try:
                        # Extract the image as a PIL Image
                        cropped = page.crop((img["x0"], img["top"], img["x1"], img["bottom"]))
                        pil_image = cropped.to_image(resolution=300).original
                        ocr_result = pytesseract.image_to_string(pil_image)
                        if ocr_result.strip():
                            ocr_texts.append(ocr_result.strip())
                    except Exception as e:
                        logger.warning(f"OCR failed for image {img_index+1} on page {i+1}: {e}")
            # Combine text
            combined = page_text.strip()
            if ocr_texts:
                combined += "\n" + "\n".join(ocr_texts)
            text += combined + "\n"
    return text.strip()

