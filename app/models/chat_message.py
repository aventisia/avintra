from pydantic import BaseModel, HttpUrl
from typing import Optional
from uuid import UUID

# File details for message attachments
class FileDetail(BaseModel):
    filename: str
    content_type: str
    size: int  # File size in bytes
    url: Optional[HttpUrl] = None  # URL of the uploaded file (if available)

# Chat message model with UUIDs
class ChatMessage(BaseModel):
    model_id: UUID  # Unique identifier for the model
    user_id: UUID  # Unique identifier for the user
    user_type: str  # User or Bot
    message: str  # Text message
    timestamp: str  # ISO 8601 formatted datetime string
    file: Optional[FileDetail] = None  # Optional file attachment
