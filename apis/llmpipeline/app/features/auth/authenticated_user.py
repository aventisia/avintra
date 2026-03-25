from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID


# Authenticated principal extracted from JWT claims.
class User(BaseModel):
    user_id: UUID
    username: str
    roles: Optional[List[str]]
    tenant_id: UUID
    access_token: Optional[str] = Field(default=None, exclude=True, repr=False)
