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

def extract_text_from_file(file_path: str) -> str:
    """Extract text from various file types."""
    logger.info("Extracting text from file: %s", file_path)
    try:
        ext = Path(file_path).suffix.lower()
        if ext == '.pdf':  # PDF Document
            return extract_text_from_pdf(file_path)
        elif ext in ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif']:
            try:
                image = Image.open(file_path)
                return pytesseract.image_to_string(image)
            except Exception as e:
                logger.error(f'Error extracting text from image: {e}')
                raise HTTPException(status_code=500, detail="Error extracting text from image file.")
        elif ext == '.docx':  # Word Document
            return docx2txt.process(file_path)
        elif ext == '.xlsx':  # Excel Spreadsheet
            wb = openpyxl.load_workbook(file_path, data_only=True)
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
        elif ext == '.txt':  # Plain Text
            with open(file_path, 'rb') as f:
                raw = f.read()
                result = chardet.detect(raw)
                encoding = result['encoding'] or 'utf-8'
                try:
                    return raw.decode(encoding, errors='replace')
                except Exception:
                    raise HTTPException(status_code=500, detail=f"Could not decode file with detected encoding: {encoding}")
        elif ext == '.csv':  # Comma-Separated Values
            df = pd.read_csv(file_path)
            return df.to_csv(index=False)
        elif ext in ['.rtf', '.odt', '.md']:  # Rich Text Format, OpenDocument Text Document, Markdown
            return pypandoc.convert_file(file_path, 'plain')
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")
    except Exception as e:
        logger.error(f"Error extracting text from file: {e}")
        raise HTTPException(status_code=500, detail="Error extracting text from file.")

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF, combining selectable text and OCR from images on each page."""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text() or ""
            ocr_texts = []
            if page.images:
                for img_index, img in enumerate(page.images):
                    try:
                        cropped = page.crop((img["x0"], img["top"], img["x1"], img["bottom"]))
                        pil_image = cropped.to_image(resolution=300).original
                        ocr_result = pytesseract.image_to_string(pil_image)
                        if ocr_result.strip():
                            ocr_texts.append(ocr_result.strip())
                    except Exception as e:
                        logger.warning(f"OCR failed for image {img_index+1} on page {i+1}: {e}")
            combined = page_text.strip()
            if ocr_texts:
                combined += "\n" + "\n".join(ocr_texts)
            text += combined + "\n"
    return text.strip()
