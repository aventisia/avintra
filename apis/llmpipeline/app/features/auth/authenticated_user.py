from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID


# Authenticated principal extracted from JWT claims.
class User(BaseModel):
    user_id: UUID
    username: str
    email: Optional[str] = None
    roles: Optional[List[str]]
    tenant_id: UUID
    access_token: Optional[str] = Field(default=None, exclude=True, repr=False)
    # Current space id from the "X-Space-Id" request header, used to scope
    # credit usage. None (or empty) means the default "Central" space.
    space_id: Optional[str] = Field(default=None, exclude=True, repr=False)
