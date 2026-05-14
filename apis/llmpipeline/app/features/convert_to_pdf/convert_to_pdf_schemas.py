# Pydantic schemas for convert_to_pdf feature
from pydantic import BaseModel

class ConvertToPDFRequest(BaseModel):
	file: str  # URL, local file path, or data URI

class ConvertToPDFResponse(BaseModel):
	name: str  # Name of the PDF file
	extension: str | None = None  # File extension
	size: int  # Size in bytes
	path: str  # Path to the PDF file
