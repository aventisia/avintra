from pydantic import BaseModel

class ExtractFileTextRequest(BaseModel):
    file_url: str
