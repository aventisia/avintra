from pydantic import BaseModel

class FileRequest(BaseModel):
    file_url: str  # URL to the file
    download: bool = False  # Whether to download the file or just view it
    lang_code: str = "en"
    use_gpu: bool = False
