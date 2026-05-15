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
import os
import camelot

from app.utils.file_converter_utils import file_to_local_path, check_pdf_not_encrypted


def extract_text_from_file(file: str) -> str:
    """Extract text from various file types. Supports local files, remote URLs, and base64 encoded content."""
    # Initialize
    logger.info("Extracting text from file input: %s", _safe_input_log(file))
    local_path = None
    is_temp = False

    try:
        # Resolve file input to a local path using the shared utility
        local_path, is_temp = file_to_local_path(file)

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

    # Clean up temp file if created
    finally:
        logger.info("Successfully extracted text from file: %s", _safe_input_log(file))
        if is_temp and local_path:
            try:
                if os.path.exists(local_path):
                    os.unlink(local_path)
                    logger.info(f"Temporary file deleted: {local_path}")
            except Exception as cleanup_err:
                logger.warning(f"Failed to delete temp file: {local_path} ({cleanup_err})")


# Helper: Truncate file_data for logging if too long
def _safe_input_log(file_data: str) -> str:
    logValue = file_data
    if isinstance(file_data, str) and len(file_data) > 200:
        logValue = file_data[:100] + "..." + file_data[-50:]
    return logValue


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

    # Check if PDF is encrypted before processing
    check_pdf_not_encrypted(pdf_path)

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
