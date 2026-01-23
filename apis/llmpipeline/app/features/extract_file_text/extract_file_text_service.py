from fastapi import HTTPException
from pathlib import Path
from app.core.logger import logger
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
import camelot

def extract_text_from_file(file_path: str) -> str:
    """Extract text from various file types. Supports local files and remote URLs."""
    # Initialize
    logger.info("Extracting text from file: %s", file_path)
    temp_file_path = None

    try:
        # Check if file_path is a URL
        if file_path.startswith("http://") or file_path.startswith("https://"):
            temp_file_path = download_remote_file(file_path)
            local_path = temp_file_path
        else:
            local_path = file_path

        # Get the file extension
        ext = Path(local_path.split("?")[0]).suffix.lower()

        # ---Extract text based on file type
        # Extract text from PDF
        if ext == '.pdf':
            return extract_text_from_pdf(local_path)

        # Extract text from images
        elif ext in ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif']:
            image = Image.open(local_path)
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
        
    # Return exception    
    except Exception as e:
        logger.error(f"Error extracting text from file: {e}")
        raise HTTPException(status_code=500, detail="Error extracting text from file.")

    # Clean up temp file if used
    finally:
        if temp_file_path is not None:
            try:
                os.unlink(temp_file_path)
                logger.info(f"Temporary file deleted: {temp_file_path}")
            except Exception as cleanup_err:
                logger.warning(f"Failed to delete temp file: {temp_file_path} ({cleanup_err})")

def merge_camelot_tables(tables):
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

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF, combining selectable text and OCR from images on each page."""

    # Initialize
    logger.info("Extracting text from PDF: %s", pdf_path)
    text_parts = []

    # Extract all tables using camelot
    try:
        tables = camelot.read_pdf(pdf_path, pages="all")
        logger.info(f"Total tables found: {tables.n} in pdf {pdf_path}")
        merged_tables = merge_camelot_tables(tables)
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

def download_remote_file(url: str) -> str:
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
