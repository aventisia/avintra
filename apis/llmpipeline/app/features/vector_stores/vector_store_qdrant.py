from fastapi import HTTPException, status

from app.core.database import TenantDB
from app.features.auth.authenticated_user import User
from app.features.vector_stores.vector_store_base import BaseVectorStore
from app.features.vector_stores.vector_stores_schemas import (
    IngestDocRequest,
    IngestDocResponse,
    QueryDocRequest,
    QueryDocResponse,
)
from app.features.vector_stores.vector_store_utils import VectorStoreInputResolver, VectorStoreTextChunker


class QdrantVectorStore(BaseVectorStore):
    def __init__(self, db: TenantDB):
        self.db = db

    async def ingest_document(self, ingest_doc_request: IngestDocRequest, user: User) -> IngestDocResponse:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Qdrant ingestion is not implemented yet.",
        )

    async def query_document(self, query_doc_request: QueryDocRequest, user: User) -> QueryDocResponse:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Qdrant retrieval is not implemented yet.",
        )
