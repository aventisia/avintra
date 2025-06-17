# app/models/user.py

from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class User(BaseModel):
    id: UUID
    username: str
    email: str
    role: Optional[List[str]]
    tenant_id: UUID
