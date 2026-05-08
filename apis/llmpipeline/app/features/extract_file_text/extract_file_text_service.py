from fastapi import HTTPException
from pathlib import Path
from app.core.logger import logger
from typing import Optional, Tuple
import docx2txt
import openpyxl
import pdfplumber
import pytesseract
import chardet
import pandas as pd
import pypandoc
from PIL import Image
import requests
import tempfile
import os
import base64
import uuid
import camelot

MAX_FILE_SIZE_MB = 50  # Maximum file size limit for uploads (in megabytes)
MIME_TO_EXTENSION = {
    "application/pdf": ".pdf",
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/bmp": ".bmp",
    "image/tiff": ".tiff",
    "image/tif": ".tif",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "text/plain": ".txt",
    "text/csv": ".csv",
    "text/rtf": ".rtf",
    "application/rtf": ".rtf",
    "application/vnd.oasis.opendocument.text": ".odt",
    "text/markdown": ".md",
    "text/x-markdown": ".md",
}

def extract_text_from_file(file: str) -> str:
    """Extract text from various file types. Supports local files, remote URLs, and base64 encoded content."""
    # Initialize
    logger.info("Extracting text from file input: %s", _safe_input_log(file))
    temp_file_paths = []  # Track temp files for cleanup

    try:
        # Check if file is a URL
        if _is_url(file):
            temp_file_path = _download_remote_file(file)
            temp_file_paths.append(temp_file_path)
            local_path = temp_file_path
        # Check if file is base64 encoded content
        elif _is_data_uri(file):
            # Get MIME type and base64 payload from data URI
            mime, encoded_payload = _parse_data_uri(file)
            decoded_bytes = _decode_base64_payload(encoded_payload)

            # Validate file size before processing
            if len(decoded_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
                raise HTTPException(status_code=400, detail=f"File size exceeds the maximum limit of {MAX_FILE_SIZE_MB}MB.")

            # Get file extension from MIME type
            extension = _get_extension_from_mime(mime)
            if not extension:
                raise HTTPException(status_code=400, detail="Unsupported file type for encoded payload.")

            # Write decoded bytes to a temp file and use that for extraction
            temp_file_path = _write_temp_file(decoded_bytes, extension)
            temp_file_paths.append(temp_file_path)
            local_path = temp_file_path
        elif os.path.exists(file):
            local_path = file
        else:
            raise HTTPException(status_code=400, detail="Invalid file or URL provided.")
        # Get the file extension
        ext = Path(local_path.split("?")[0]).suffix.lower()

        # Extract text from PDF
        if ext == '.pdf':
            return _extract_text_from_pdf(local_path)

        # Extract text from images
        elif ext in ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif']:
            with Image.open(local_path) as image:
                return pytesseract.image_to_string(image)

        # Extract text from Word document
        elif ext == '.docx':
            return docx2txt.process(local_path)

        # Extract text from Excel spreadsheets
        elif ext == '.xlsx':
            wb = openpyxl.load_workbook(local_path, data_only=True)
            text = []
            for ws in wb.worksheets:
                for row in ws.iter_rows(values_only=True):
                    cleaned_row = [str(cell).strip() if cell is not None else '' for cell in row]
                    # Remove trailing empty cells for cleaner output
                    while cleaned_row and cleaned_row[-1] == '':
                        cleaned_row.pop()
                    if any(cell for cell in cleaned_row):
                        text.append('\t'.join(cleaned_row))
            return '\n'.join(text)

        # Extract text from plain text files
        elif ext == '.txt':
            with open(local_path, 'rb') as f:
                raw = f.read()
                result = chardet.detect(raw)
                encoding = result['encoding'] or 'utf-8'
                return raw.decode(encoding, errors='replace')

        # Extract text from CSV files
        elif ext == '.csv':
            df = pd.read_csv(local_path)
            return df.to_csv(index=False)

        # Extract text from Rich Text Format, OpenDocument Text Document, Markdown
        elif ext in ['.rtf', '.odt', '.md']:  
            return pypandoc.convert_file(local_path, 'plain')

        # Return an error for unsupported file types
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error extracting text from file: {e}")
        raise HTTPException(status_code=500, detail="Error extracting text from file.")

    # Clean up temp file if used
    finally:
        logger.info("Successfully extracted text from file: %s", _safe_input_log(file))
        for temp_file_path in temp_file_paths:
            try:
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    logger.info(f"Temporary file deleted: {temp_file_path}")
            except Exception as cleanup_err:
                logger.warning(f"Failed to delete temp file: {temp_file_path} ({cleanup_err})")


# Helper: Gets if a string is a URL
def _is_url(value: str) -> bool:
    return value.startswith("http://") or value.startswith("https://")

# Helper: Gets if a string is a data URI
def _is_data_uri(value: str) -> bool:
    return value.startswith("data:")

# Helper: Truncate file_data for logging if too long
def _safe_input_log(file_data: str) -> str:
    logValue = file_data
    if isinstance(file_data, str) and len(file_data) > 200:
        logValue = file_data[:100] + "..." + file_data[-50:]
    return logValue

# Helper: Extract MIME type and base64 payload from a data URI, with validation
def _parse_data_uri(data_uri: str) -> Tuple[Optional[str], str]:
    try:
        metadata, encoded_payload = data_uri.split(",", 1)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid data URI format.")

    if not encoded_payload.strip():
        raise HTTPException(status_code=400, detail="Data URI payload is empty.")

    if ";base64" not in metadata.lower():
        raise HTTPException(status_code=400, detail="Only base64 data URI payloads are supported.")

    mime = None
    meta_no_prefix = metadata[5:]  # removes "data:"
    if meta_no_prefix:
        mime = meta_no_prefix.split(";", 1)[0].strip().lower() or None

    return mime, encoded_payload.strip()

# Helper: Decode a base64 payload with validation and error handling
def _decode_base64_payload(payload: str) -> bytes:
    compact_payload = "".join(payload.split())
    if not compact_payload:
        raise HTTPException(status_code=400, detail="Encoded payload is empty.")

    try:
        return base64.b64decode(compact_payload, validate=True)
    except Exception:
        # Fallback for payloads that omit padding.
        pad = len(compact_payload) % 4
        if pad:
            compact_payload = compact_payload + ("=" * (4 - pad))
        try:
            return base64.b64decode(compact_payload, validate=True)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 encoded payload.")

# Helper: Get file extension from MIME type, if possible
def _get_extension_from_mime(mime: Optional[str]) -> Optional[str]:
    if not mime:
        return None
    return MIME_TO_EXTENSION.get(mime.lower())

# Helper: Write decoded bytes to a temp file with the given extension, and return the temp file path
def _write_temp_file(decoded_bytes: bytes, extension: str) -> str:
    unique_suffix = uuid.uuid4().hex[:8]
    temp_file_name = f"extract_text_{unique_suffix}{extension}"
    temp_file_path = os.path.join(tempfile.gettempdir(), temp_file_name)
    with open(temp_file_path, "wb") as temp_file:
        temp_file.write(decoded_bytes)
    return temp_file_path

# Helper: Merge tables with identical columns (headers) into a single DataFrame list.
def _merge_camelot_tables(tables):
    """Merge tables with identical columns (headers) into a single DataFrame list."""
    merged_tables = []
    prev_df = None

    for table in tables:
        df = table.df
        # Remove empty rows
        df = df.dropna(how='all')
        # If previous table exists and columns match, append
        if prev_df is not None and df.shape[1] == prev_df.shape[1] and (df.iloc[0] == prev_df.iloc[0]).all():
            # Skip header row for the new table
            df_no_header = df.iloc[1:]
            prev_df = pd.concat([prev_df, df_no_header], ignore_index=True)
        else:
            if prev_df is not None:
                merged_tables.append(prev_df)
            prev_df = df
    if prev_df is not None:
        merged_tables.append(prev_df)
    return merged_tables

# Helper: Extract text from a PDF, combining selectable text and OCR from images on each page.
def _extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF, combining selectable text and OCR from images on each page."""

    # Initialize
    logger.info("Extracting text from PDF: %s", pdf_path)
    text_parts = []

    # Extract all tables using camelot
    try:
        tables = camelot.read_pdf(pdf_path, pages="all")
        logger.info(f"Total tables found: {tables.n} in pdf {pdf_path}")
        merged_tables = _merge_camelot_tables(tables)
        for idx, table in enumerate(merged_tables):
            table_text = table.to_json(orient="records", force_ascii=False)
            text_parts.append(f"--- Table {idx+1} (JSON) ---\n{table_text}")
    except Exception as e:
        logger.warning(f"Failed to extract tables with camelot: {e}")

    # Extract text and OCR from each page using pdfplumber
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text() or ""
                ocr_texts = []
                if page.images:
                    for img_index, img in enumerate(page.images):
                        try:
                            # Clamp bounding box to page bounds
                            x0 = max(img["x0"], 0)
                            x1 = min(img["x1"], page.width)
                            top = max(img["top"], 0)
                            bottom = min(img["bottom"], page.height)
                           
                            width = x1 - x0
                            height = bottom - top

                            # Ignore tiny objects
                            if width < 50 or height < 50:
                                continue

                            # Ignore horizontal line-like objects
                            if width > 10 * height:
                                continue

                            # Ignore vertical line-like objects
                            if height > 10 * width:
                               continue
                            
                            if x0 < x1 and top < bottom:
                                cropped = page.crop((x0, top, x1, bottom))
                                pil_image = cropped.to_image(resolution=300).original
                                ocr_result = pytesseract.image_to_string(pil_image)
                                if ocr_result.strip():
                                    ocr_texts.append(ocr_result.strip())
                            else:
                                logger.warning(f"OCR skipped for image {img_index+1} on page {i+1}: Invalid bounding box after clamping.")
                        except Exception as e:
                            logger.warning(f"OCR failed for image {img_index+1} on page {i+1}: {e}")
                combined = page_text.strip()
                if ocr_texts:
                    combined += "\n" + "\n".join(ocr_texts)
                if combined:
                    text_parts.append(f"--- Page {i+1} ---\n{combined}")
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")

    return "\n\n".join(text_parts).strip()

# Helper: Download a remote file and return the local temp file path. Caller is responsible for cleanup.
def _download_remote_file(url: str) -> str:
    """Download a remote file and return the local temp file path. Caller is responsible for cleanup."""

    # Initialize
    logger.info(f"Downloading remote file: {url}")

    # Send GET request
    response = requests.get(url, stream=True)

    # Check for errors
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Failed to download file from URL: {url}")

    # Get file extension and create temp file
    ext = Path(url).suffix.lower()
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    for chunk in response.iter_content(chunk_size=8192):
        temp_file.write(chunk)
    temp_file.close()

    # Return the path of the downloaded temp file
    return temp_file.name
