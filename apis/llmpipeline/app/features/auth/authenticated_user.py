from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID


# Authenticated principal extracted from JWT claims.
class User(BaseModel):
    user_id: UUID
    username: str
    roles: Optional[List[str]]
    tenant_id: UUID
