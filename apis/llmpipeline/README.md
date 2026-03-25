# FastAPI Project: LLM Pipeline APIs

This project provides a set of RESTful APIs for extracting text from various file types (PDF, DOCX, XLSX, TXT, RTF, images, etc.) built with FastAPI.

## Features

- Extract text from PDF, DOCX, XLSX, TXT, RTF, and image files (PNG, JPG, BMP, TIFF, etc.)
- OCR support for images and scanned PDFs using Tesseract
- Modular API structure for easy extension
- Logging and error handling

## Requirements

### System dependencies

Install these with apt (for Ubuntu/Debian):

```sh
sudo apt update
sudo apt -y install python3 python3-pip python3-venv tesseract-ocr ocrmypdf ffmpeg pandoc
```

### Python dependencies

- Python 3.8+
- All required packages are listed in `requirements.txt` (install with `pip install -r requirements.txt`)
- Notable packages:
  - [FastAPI](https://fastapi.tiangolo.com/)
  - [Uvicorn](https://www.uvicorn.org/) (ASGI server)
  - [pytesseract](https://pypi.org/project/pytesseract/) (Python wrapper for Tesseract OCR)
  - [chardet](https://pypi.org/project/chardet/) (encoding detection)
  - [ocrmypdf](https://pypi.org/project/ocrmypdf/) (for OCR on PDFs)

## Setup

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd llmpipelineapis
   ```
2. **Create a virtual environment:**
   ```sh
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. **Install Python dependencies:**
   ```sh
   pip install -r requirements.txt
   ```
3. **Install Tesseract OCR (for image text extraction):**
   ```sh
   sudo apt-get update
   sudo apt-get install tesseract-ocr
   ```
4. **(Optional) Install Pandoc for RTF support:**
   ```sh
   sudo apt-get install pandoc
   ```
5. **To freeze dependencies:**
   ```sh
   pip freeze > requirements.txt
   ```

## Running the API Server

```sh
uvicorn app.main:app --reload
```

## API Usage

- See the `api_collections/extract_file_text.http` file for example requests.
- The main endpoint for text extraction is `/extract-file-text`.

## Project Structure

```
app/
  main.py            # FastAPI app entry point
  features/          # Feature modules (e.g., extract_file_text)
  core/              # Core utilities (config, logger, etc.)
  models/            # Pydantic models
  ...
api_collections/     # HTTP request collections for testing
requirements.txt     # Python dependencies
```
