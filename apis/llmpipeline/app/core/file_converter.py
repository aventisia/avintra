import base64
import os
import re
import mimetypes
from urllib.parse import urlparse
import requests
from app.core.logger import logger


class FileToBase64Converter:
    """Convert input (base64 string, URL, or local file path) → base64 data URI"""

    DEFAULT_MIME = "application/octet-stream"

    def convert_to_base64(self, input_value: str) -> str:
        """Convert input string to base64-encoded data URI"""
        # -------- Input validation --------
        if not isinstance(input_value, str) or not input_value.strip():
            logger.error("Invalid input: empty or non-string value received")
            raise ValueError("Input must be a non-empty string")

        input_value = input_value.strip()
        logger.info(f"Processing input: {input_value[:50]}...")

        try:
            # -------- Base64 handling --------
            # Extract raw data after any "base64," prefix
            raw_data = input_value.split("base64,")[-1]

            # Check if the raw string contains only valid base64 characters
            if re.fullmatch(r"[A-Za-z0-9+/=\n\r]+", raw_data):
                try:
                    # Attempt to decode to validate base64
                    decoded = base64.b64decode(raw_data, validate=True)
                    logger.info(f"Detected base64 input (size={len(decoded)} bytes)")

                    # If input already has a data URI prefix, return as-is
                    if input_value.startswith("data:"):
                        logger.info("Base64 input already contains data URI prefix")
                        return input_value

                    # Encode back to base64 to normalize
                    encoded = base64.b64encode(decoded).decode("utf-8")
                    mime = self._detect_mime(input_value)

                    # Return as data URI
                    return f"data:{mime};base64,{encoded}"

                except Exception as e:
                    logger.warning(f"Base64 validation failed: {str(e)}")

            # -------- URL handling --------
            # Parse input to check if it's a valid URL
            parsed = urlparse(input_value)
            if parsed.scheme in ("http", "https") and parsed.netloc:
                # Block unsafe local URLs
                if parsed.hostname in ("localhost", "127.0.0.1"):
                    logger.error(f"Blocked unsafe URL: {parsed.hostname}")
                    raise ValueError("Invalid URL")

                try:
                    # Fetch the content from the URL safely using context manager
                    with requests.get(input_value, timeout=10, stream=True) as response:
                        response.raise_for_status()  # Raise error for bad responses
                        file_bytes = response.content

                        # Convert content to base64
                        encoded = base64.b64encode(file_bytes).decode("utf-8")

                        # Detect MIME type from response header or fallback to default
                        mime = response.headers.get("Content-Type", self._detect_mime(input_value)
)
                        # Return as data URI
                        return f"data:{mime};base64,{encoded}"

                except requests.RequestException as e:
                    logger.exception(f"Failed to fetch URL: {input_value}")
                    raise ValueError(f"Unable to fetch URL: {input_value}") from e

            # -------- Local file handling --------
            if os.path.exists(input_value):
                # Ensure the path is a file
                if not os.path.isfile(input_value):
                    logger.error(f"Path exists but is not a file: {input_value}")
                    raise ValueError("Invalid file path")

                try:
                    # Read file content safely
                    with open(input_value, "rb") as f:
                        file_bytes = f.read()

                    # Guess MIME type from file extension
                    mime, _ = mimetypes.guess_type(input_value)
                    mime = mime or self.DEFAULT_MIME

                    # Convert content to base64
                    encoded = base64.b64encode(file_bytes).decode("utf-8")
                    logger.info(f"Successfully converted file '{input_value}' ({len(file_bytes)} bytes) to base64")

                    # Return as data URI
                    return f"data:{mime};base64,{encoded}"

                except Exception as e:
                    logger.exception(f"Failed to read file: {input_value}")
                    raise ValueError(f"Unable to read file: {input_value}") from e

            # -------- Unsupported input --------
            logger.error(f"Unsupported input format: {input_value}")
            raise ValueError("Unsupported input format")

        except Exception as ex:
            # Catch any unexpected exceptions
            logger.exception(f"Conversion failed for input: {input_value}")
            raise

    def _detect_mime(self, file_bytes: bytes) -> str:
        """
        Detect MIME type from raw file bytes (common audio, video, image, document, archive).
        Returns a MIME string or defaults to application/octet-stream.
        """

        # -------- Audio --------
        if file_bytes[:4] == b'RIFF' and file_bytes[8:12] == b'WAVE':
            return "audio/wav"
        if file_bytes[:3] == b'ID3' or file_bytes[:2] == b'\xff\xfb':
            return "audio/mpeg"  # MP3
        if file_bytes[:4] == b'OggS':
            return "audio/ogg"
        if file_bytes[:4] == b'fLaC':
            return "audio/flac"
        if file_bytes[:4] == b'MThd':
            return "audio/midi"

        # -------- Image --------
        if file_bytes[:8] == b'\x89PNG\r\n\x1a\n':
            return "image/png"
        if file_bytes[:3] == b'\xff\xd8\xff':
            return "image/jpeg"
        if file_bytes[:6] in (b'GIF87a', b'GIF89a'):
            return "image/gif"
        if file_bytes[:2] == b'BM':
            return "image/bmp"
        if file_bytes[:4] == b'RIFF' and file_bytes[8:12] == b'WEBP':
            return "image/webp"

        # -------- Video --------
        if file_bytes[:4] == b'\x00\x00\x00\x18' and file_bytes[4:8] == b'ftyp':
            return "video/mp4"
        if file_bytes[:4] == b'RIFF' and file_bytes[8:12] == b'AVI ':
            return "video/x-msvideo"
        if file_bytes[:4] == b'\x1A\x45\xDF\xA3':
            return "video/webm"  # Matroska/WebM
        if file_bytes[:4] == b'\x00\x00\x00\x20' and file_bytes[4:8] == b'ftyp':
            return "video/quicktime"  # MOV

        # -------- Document --------
        if file_bytes[:4] == b'%PDF':
            return "application/pdf"
        if file_bytes[:5] == b'%!PS-':
            return "application/postscript"
        if file_bytes[:2] == b'PK':  # could be docx, xlsx, pptx, zip
            # Check for Office docx/pptx/xlsx files by zip signature + [Content_Types].xml
            if b'[Content_Types].xml' in file_bytes[:4096]:
                return "application/vnd.openxmlformats-officedocument"
            return "application/zip"
        if file_bytes[:4] == b'\xd0\xcf\x11\xe0':  # old MS Office docs (doc, xls, ppt)
            return "application/msword"

        # -------- Archive --------
        if file_bytes[:2] == b'PK':
            return "application/zip"
        if file_bytes[:4] == b'Rar!\x1A\x07\x00':
            return "application/x-rar-compressed"
        if file_bytes[:6] == b'7z\xBC\xAF\x27\x1C':
            return "application/x-7z-compressed"
        if file_bytes[:4] == b'\x1f\x8b\x08':
            return "application/gzip"
        if file_bytes[:4] == b'BZh9':
            return "application/x-bzip2"

        # -------- Fallback --------
        return self.DEFAULT_MIME