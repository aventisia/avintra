from pydantic import BaseModel

class OlmocrRequest(BaseModel):
    file_name: str
    file_data: str  # base64 encoded

class OlmocrResponse(BaseModel):
    markdown: str
