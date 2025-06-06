from pydantic import BaseModel

class FileRequest(BaseModel):
    file_url: str  # URL to the file
    download: bool = False  # Whether to download the file or just view it
