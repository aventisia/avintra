from pydantic import BaseModel
from typing import Optional
from uuid import UUID

# Defining a class 'AIModelDocument' that inherits from Pydantic's BaseModel
class AIModelDocument(BaseModel):
    model_id: UUID  # Required field: a universally unique identifier (UUID) for the model
    file_path: Optional[str] = None  # Optional field: path to a file (can be None)
    content: Optional[str] = None  # Optional field: content of the document (can be None)
    user_id: UUID  # Unique identifier for the user
    timestamp: Optional[str] = None  # ISO 8601 formatted datetime string
