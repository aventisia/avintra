from pydantic import BaseModel

class ExtractFileTextRequest(BaseModel):
    file: str # URL, local file path, data URI base64 content of the file to extract text from
