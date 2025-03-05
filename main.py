from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pdfplumber
import pytesseract
from pdf2image import convert_from_path
import requests
import os
import tempfile
import platform
from pathlib import Path
from logger import logger

app = FastAPI(root_path="/api")

# Define request model for PDF extraction
class PDFRequest(BaseModel):
    pdf_url: str
    download: bool = False

# Pass full PDF path based on OS. For Windows developers, the path will be the same as the URL so send full path in payload.
def get_pdf_path(pdf_url: str):
    """Constructs full PDF path based on OS"""
    logger.info("THE OS NAME IS: %s", platform.system())

    if platform.system() == "Linux":
        return Path("/var/www/aventisia.com") / pdf_url
    else:
        return pdf_url

def download_pdf(pdf_url):
    """Download PDF file from the given URL."""
    response = requests.get(pdf_url)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to download PDF.")
    
    temp_pdf_path = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf").name
    with open(temp_pdf_path, "wb") as f:
        f.write(response.content)
    
    return temp_pdf_path

# TODO: If any pdf page does not have selectable text, we assume it is an image-based PDF
def is_text_pdf(pdf_path):
    """Check if PDF contains selectable text."""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            if page.extract_text():
                return True
    return False

def extract_text_from_pdf(pdf_path):
    """Extract text from an electronic (text-based) PDF."""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text.strip()

def extract_text_from_image_pdf(pdf_path):
    """Extract text from a scanned (image-based) PDF using OCR."""
    images = convert_from_path(pdf_path)
    text = ""
    for image in images:
        text += pytesseract.image_to_string(image) + "\n"
    return text.strip()

@app.post("/extract-pdf-text/")
async def extract_pdf_text(payload: PDFRequest):
    pdf_path = payload.pdf_url

    # Download PDF if required
    if payload.download:
        pdf_path = download_pdf(payload.pdf_url)
    else:
        pdf_path = get_pdf_path(payload.pdf_url)

    # TODO: Not able to get the pdf full path so adding it manually
    pdf_path = "/var/www/aventisia.com" + pdf_path
    
    logger.info("THE FULL PATH OF PDF: %s", pdf_path)

    try:
        # Identify PDF type
        if is_text_pdf(pdf_path):
            extracted_text = extract_text_from_pdf(pdf_path)
        else:
            extracted_text = extract_text_from_image_pdf(pdf_path)
    finally:
        # Clean up the temporary file if it was downloaded
        if payload.download and os.path.exists(pdf_path):
            os.remove(pdf_path)

    return extracted_text

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}