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

- **Python 3.12.x** (required — the project is not compatible with Python 3.13+; see `pyproject.toml` and the version guard in `app/core/config.py`)
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
2. **Create a virtual environment with Python 3.12:**

   ```sh
   # Windows
   py -3.12 -m venv venv
   venv\Scripts\activate

   # Linux / macOS
   python3.12 -m venv venv
   source venv/bin/activate
   ```

   > If you don't have Python 3.12 installed, install it first (e.g. from https://www.python.org/downloads/release/python-3123/ on Windows, or via your package manager on Linux/macOS).

3. **Install Python dependencies:**
   ```sh
   pip install -r requirements.txt
   ```
4. **Install Tesseract OCR (for image text extraction):**
   ```sh
   sudo apt-get update
   sudo apt-get install tesseract-ocr
   ```
5. **(Optional) Install Pandoc for RTF support:**
   ```sh
   sudo apt-get install pandoc
   ```
6. **To freeze dependencies:**
   ```sh
   pip freeze > requirements.txt
   ```

## Running the API Server

```sh
ENV=local ./venv/bin/python dev.py
```

`dev.py` loads `.env` and `.env.local`, then starts Uvicorn with auto-reload on `UVICORN_PORT` (default `4003`). Override the port in `.env.local`:

```sh
UVICORN_PORT=14003
```

For other Uvicorn options, run `uvicorn app.main:app` directly and pass flags as needed.

## API Usage

- The main endpoint for text extraction is `/extract-file-text`.

## Project Structure

```
app/
  main.py            # FastAPI app entry point
  features/          # Feature modules (e.g., extract_file_text)
  core/              # Core utilities (config, logger, etc.)
  models/            # Pydantic models
  ...
requirements.txt     # Python dependencies
```
