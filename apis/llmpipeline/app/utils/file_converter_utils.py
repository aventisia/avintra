from pathlib import Path
from typing import Optional, Tuple
from fastapi import HTTPException
from app.core.logger import logger
from pypdf import PdfReader
import requests
import tempfile
import os
import base64
import mimetypes
import uuid

MAX_FILE_SIZE_MB = 50

# Extra supported MIME types
MIME_TO_EXTENSION = {

    # Audio
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "audio/aac": ".aac",
    "audio/flac": ".flac",
    "audio/ogg": ".ogg",
    "audio/mp4": ".m4a",

    # Video
    "video/mp4": ".mp4",
    "video/x-msvideo": ".avi",
    "video/quicktime": ".mov",
    "video/x-matroska": ".mkv",
    "video/webm": ".webm",

    # Images
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/gif": ".gif",
    "image/bmp": ".bmp",
    "image/tiff": ".tiff",
    "image/tif": ".tif",
    "image/svg+xml": ".svg",
    "image/webp": ".webp",

    # Documents
    "application/pdf": ".pdf",
    "application/msword": ".doc",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",

    "application/vnd.ms-excel": ".xls",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",

    "application/vnd.ms-powerpoint": ".ppt",

    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",

    "application/vnd.oasis.opendocument.text": ".odt",

    # Text / Code
    "text/plain": ".txt",
    "text/csv": ".csv",
    "application/json": ".json",
    "application/xml": ".xml",
    "application/x-yaml": ".yaml",
    "text/markdown": ".md",
    "text/x-markdown": ".md",
    "text/html": ".html",
    "text/css": ".css",
    "application/javascript": ".js",
    "text/x-python": ".py",
    "text/rtf": ".rtf",
    "application/rtf": ".rtf",

    # Archives
    "application/zip": ".zip",
    "application/vnd.rar": ".rar",
    "application/x-7z-compressed": ".7z",
    "application/x-tar": ".tar",
    "application/gzip": ".gz",

    # Default
    "application/octet-stream": ".bin",
}

# Reverse mapping: extension -> mime type
EXTENSION_TO_MIME = {ext: mime for mime, ext in MIME_TO_EXTENSION.items()}


def check_pdf_not_encrypted(file_path: str) -> None:
    """
    Check if a PDF file is encrypted/password-protected.
    Raises HTTPException with 400 if the PDF is encrypted.
    Does nothing if the file is not a PDF or is not encrypted.
    """

    ext = Path(file_path).suffix.lower()
    if ext != ".pdf":
        return

    try:
        reader = PdfReader(file_path)
        if reader.is_encrypted:
            raise HTTPException(
                status_code=400,
                detail="The PDF file is encrypted or password-protected. Please provide an unprotected PDF."
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(
            "Unable to check PDF encryption for %s: %s",
            file_path,
            str(e)
        )


def file_to_local_path(file_input: str) -> tuple[str, bool]:
    """
    Resolve any file input (URL, data URI, or local path)
    into a local file path.

    Returns:
        tuple of (local_file_path, is_temp)
        - local_file_path: path to the file on disk
        - is_temp: True if a temp file was created (caller must clean up)
    """

    # If input is a URL, download it
    if _is_url(file_input):

        temp_file_path = _download_remote_file(file_input)
        return temp_file_path, True

    # If input is a data URI, decode and save to temp
    elif _is_data_uri(file_input):

        # Extract mime type and encoded data
        mime, encoded_payload = _parse_data_uri(file_input)

        # Decode base64 content
        decoded_bytes = _decode_base64_payload(encoded_payload)

        # Check decoded file size
        if len(decoded_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:

            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds {MAX_FILE_SIZE_MB}MB."
            )

        # Get extension from mime type
        extension = _get_extension_from_mime(mime)

        # Reject unsupported mime types
        if not extension:

            raise HTTPException(
                status_code=400,
                detail="Unsupported encoded file type."
            )

        # Save decoded content to temp file
        temp_file_path = _write_temp_file(
            decoded_bytes,
            extension
        )

        return temp_file_path, True

    # If input is an existing local file
    elif os.path.exists(file_input):

        return file_input, False

    # Invalid input
    else:

        raise HTTPException(
            status_code=400,
            detail="Invalid file or URL provided."
        )


def file_to_base64(file_input: str) -> str:
    """
    Convert:
    - Local file
    - Remote URL
    - Base64 data URI

    into:
    data:<mime>;base64,<content>
    """

    # Final usable file path
    local_path = None

    # Temp file path for cleanup
    temp_file_path = None

    try:

        # If input is a URL, download it first
        if _is_url(file_input):

            # Download remote file
            temp_file_path = _download_remote_file(file_input)

            # Use downloaded file path
            local_path = temp_file_path

        # If input is already a data URI
        elif _is_data_uri(file_input):

            # Extract mime type and encoded data
            mime, encoded_payload = _parse_data_uri(file_input)

            # Decode base64 content
            decoded_bytes = _decode_base64_payload(encoded_payload)

            # Check decoded file size
            if len(decoded_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:

                raise HTTPException(
                    status_code=400,
                    detail=f"File size exceeds {MAX_FILE_SIZE_MB}MB."
                )

            # Get extension from mime type
            extension = _get_extension_from_mime(mime)

            # Reject unsupported mime types
            if not extension:

                raise HTTPException(
                    status_code=400,
                    detail="Unsupported encoded file type."
                )

            # Save decoded content temporarily
            temp_file_path = _write_temp_file(
                decoded_bytes,
                extension
            )

            # Use temp file path
            local_path = temp_file_path

        # If input is an existing local file
        elif os.path.exists(file_input):

            local_path = file_input

        # Invalid input
        else:

            raise HTTPException(
                status_code=400,
                detail="Invalid file or URL provided."
            )

        # Get file size
        file_size = os.path.getsize(local_path)

        # Reject oversized files
        if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:

            logger.error(
                "File size exceeded limit: %s (%s bytes)",
                local_path,
                file_size
            )

            raise HTTPException(
                status_code=400,
                detail=f"File exceeds {MAX_FILE_SIZE_MB}MB limit."
            )

        # Detect mime type
        mime_type = _detect_mime_type(local_path)

        # Read file and encode to base64
        with open(local_path, "rb") as f:

            encoded = base64.b64encode(
                f.read()
            ).decode("utf-8")

        # Return final data URI
        return f"data:{mime_type};base64,{encoded}"

    # Re-raise handled HTTP exceptions
    except HTTPException:
        raise

    # Catch unexpected errors
    except Exception as e:

        logger.exception(
            "Failed converting file to base64: %s",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to convert file to base64."
        )

    # Always cleanup temp files
    finally:

        try:

            # Delete temp file if created
            if temp_file_path and os.path.exists(temp_file_path):

                os.unlink(temp_file_path)

                logger.info(
                    "Temporary file deleted: %s",
                    temp_file_path
                )

        except Exception as cleanup_err:

            logger.warning(
                "Failed to delete temp file: %s (%s)",
                temp_file_path,
                cleanup_err
            )


# Check if input is a URL
def _is_url(value: str) -> bool:

    return (
        value.startswith("http://")
        or value.startswith("https://")
    )


# Download remote file to temp storage
def _download_remote_file(url: str) -> str:

    # Log download start
    logger.info(f"Downloading remote file: {url}")

    # Send request
    response = requests.get(
        url,
        stream=True
    )

    # Reject failed downloads
    if response.status_code != 200:

        raise HTTPException(
            status_code=400,
            detail=f"Failed to download file from URL: {url}"
        )

    # Keep original file extension
    ext = Path(url).suffix.lower()

    # Create temp file
    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=ext
    )

    # Write file in chunks
    for chunk in response.iter_content(chunk_size=8192):

        temp_file.write(chunk)

    # Close temp file
    temp_file.close()

    # Return temp file path
    return temp_file.name


# Check if input is a data URI
def _is_data_uri(value: str) -> bool:

    return value.startswith("data:")


# Extract mime type and base64 payload
def _parse_data_uri(
    data_uri: str
) -> Tuple[Optional[str], str]:

    try:

        # Split metadata and payload
        metadata, encoded_payload = data_uri.split(",", 1)

    except ValueError:

        raise HTTPException(
            status_code=400,
            detail="Invalid data URI format."
        )

    # Reject empty payload
    if not encoded_payload.strip():

        raise HTTPException(
            status_code=400,
            detail="Data URI payload is empty."
        )

    # Only support base64 data URIs
    if ";base64" not in metadata.lower():

        raise HTTPException(
            status_code=400,
            detail="Only base64 data URIs are supported."
        )

    mime = None

    # Remove "data:" prefix
    meta_no_prefix = metadata[5:]

    # Extract mime type if present
    if meta_no_prefix:

        mime = meta_no_prefix.split(
            ";",
            1
        )[0].strip().lower() or None

    return mime, encoded_payload.strip()


# Decode base64 safely
def _decode_base64_payload(payload: str) -> bytes:

    # Remove whitespace/newlines
    compact_payload = "".join(payload.split())

    # Reject empty payload
    if not compact_payload:

        raise HTTPException(
            status_code=400,
            detail="Encoded payload is empty."
        )

    try:

        # Decode normally
        return base64.b64decode(
            compact_payload,
            validate=True
        )

    except Exception:

        # Fix missing padding
        pad = len(compact_payload) % 4

        if pad:
            compact_payload += "=" * (4 - pad)

        try:

            # Retry decoding
            return base64.b64decode(
                compact_payload,
                validate=True
            )

        except Exception:

            raise HTTPException(
                status_code=400,
                detail="Invalid base64 payload."
            )


# Get extension from mime type
def _get_extension_from_mime(
    mime: Optional[str]
) -> Optional[str]:

    # Reject missing mime type
    if not mime:
        return None

    # Return matching extension
    return MIME_TO_EXTENSION.get(mime.lower())


# Save bytes to a temporary file
def _write_temp_file(
    decoded_bytes: bytes,
    extension: str
) -> str:

    # Generate unique file suffix
    unique_suffix = uuid.uuid4().hex[:8]

    # Create temp filename
    temp_file_name = (
        f"extract_text_{unique_suffix}{extension}"
    )

    # Build full temp path
    temp_file_path = os.path.join(
        tempfile.gettempdir(),
        temp_file_name
    )

    # Write bytes to temp file
    with open(temp_file_path, "wb") as temp_file:

        temp_file.write(decoded_bytes)

    # Return temp file path
    return temp_file_path


# Detect mime type from file extension
def _detect_mime_type(file_path: str) -> str:

    # Extract extension
    ext = Path(file_path).suffix.lower()

    # Use custom reverse mapping first
    if ext in EXTENSION_TO_MIME:

        return EXTENSION_TO_MIME[ext]

    # Fallback to Python detection
    mime_type, _ = mimetypes.guess_type(file_path)

    # Return detected mime type
    if mime_type:

        return mime_type

    # Log unknown mime types
    logger.warning(
        "Unable to determine MIME type for file: %s",
        file_path
    )

    # Generic fallback type
    return "application/octet-stream"