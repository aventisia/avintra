from pydantic import BaseModel

class ExtractRequest(BaseModel):
    file_url: str
