from abc import ABC, abstractmethod

from app.features.auth.authenticated_user import User
from app.features.vector_stores.vector_stores_schemas import (
    DeleteDocRequest,
    DeleteDocResponse,
    IngestDocRequest,
    IngestDocResponse,
    QueryDocRequest,
    QueryDocResponse,
)


class BaseVectorStore(ABC):
    @abstractmethod
    async def ingest_document(self, ingest_doc_request: IngestDocRequest, user: User) -> IngestDocResponse:
        """Ingest document content, generate embeddings, and persist them in the vector store."""
        raise NotImplementedError

    @abstractmethod
    async def query_document(self, query_doc_request: QueryDocRequest, user: User) -> QueryDocResponse:
        """Retrieve top matching chunks from vector store for the given query."""
        raise NotImplementedError

    @abstractmethod
    async def delete_document(self, delete_doc_request: DeleteDocRequest, user: User) -> DeleteDocResponse:
        """Delete document chunks from vector store using document identity metadata."""
        raise NotImplementedError
