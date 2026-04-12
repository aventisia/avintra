# Provider factory to select correct vector store
from app.core.database import TenantDB

from .vector_store_pgvector import PgVectorStore
from .vector_store_qdrant import QdrantVectorStore

VECTOR_STORE_MAP = {
    'pgvector': PgVectorStore,
    'qdrant': QdrantVectorStore,
}

def get_vector_store(store_name: str, db: TenantDB):
    store_cls = VECTOR_STORE_MAP.get(store_name)
    if not store_cls:
        raise ValueError(f"Unsupported vector store: {store_name}")
    return store_cls(db)
