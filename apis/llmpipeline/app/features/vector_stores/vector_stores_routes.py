from fastapi import APIRouter, Depends, HTTPException, status

from app.core.database import TenantDB, get_db_session_context
from app.core.config import settings
from app.core.logger import logger
from app.dependencies.authorize import authorize
from app.features.auth.authenticated_user import User
from app.features.vector_stores.vector_stores_factory import get_vector_store
from app.features.vector_stores.vector_stores_schemas import DeleteDocRequest, IngestDocRequest, QueryDocRequest

router = APIRouter()

# Helper: Utility function to normalize optional credential IDs, treating empty or all-zero values as None
def _normalize_optional_credential(value: str | None) -> str | None:
    cleaned = str(value).strip() if value is not None else ""
    if cleaned in ["", "00000000-0000-0000-0000-000000000000"]:
        return None
    return cleaned

# Ingest documents into vector store
@router.post('/vector-store/ingest')
async def ingest_document_route(
    ingest_doc_request: IngestDocRequest,
    _user: User = Depends(authorize()),
):
    try:
        # Normalize credential IDs
        ingest_doc_request.embedding_credential_id = _normalize_optional_credential(ingest_doc_request.embedding_credential_id)
        ingest_doc_request.store_credential_id = _normalize_optional_credential(ingest_doc_request.store_credential_id)

        logger.info("[VECTOR-INGEST] route called store=%s user=%s", ingest_doc_request.vector_store, _user.username)

        # PgVector
        if ingest_doc_request.vector_store == "pgvector":
            async with get_db_session_context(settings.POSTGRESQL_WORC_DB_NAME) as session:
                session.info["tenant_id"] = _user.tenant_id
                db = TenantDB(session=session, tenant_id=_user.tenant_id)
                vector_store = get_vector_store(ingest_doc_request.vector_store, db)
                return await vector_store.ingest_document(ingest_doc_request, _user)

        # Qdrant
        if ingest_doc_request.vector_store == "qdrant":
            db = TenantDB(session=None, tenant_id=_user.tenant_id)
            vector_store = get_vector_store(ingest_doc_request.vector_store, db)
            return await vector_store.ingest_document(ingest_doc_request, _user)

        # Unsupported vector store
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported vector store: {ingest_doc_request.vector_store}",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ingesting document: {e}")
        raise HTTPException(status_code=500, detail="Error ingesting document.")


@router.post('/vector-store/query')
async def query_document_route(
    query_doc_request: QueryDocRequest,
    _user: User = Depends(authorize()),
):
    try:
        # Normalize credential IDs
        query_doc_request.embedding_credential_id = _normalize_optional_credential(query_doc_request.embedding_credential_id)
        query_doc_request.store_credential_id = _normalize_optional_credential(query_doc_request.store_credential_id)

        logger.info("[VECTOR-QUERY] route called store=%s user=%s", query_doc_request.vector_store, _user.username)

        # PgVector
        if query_doc_request.vector_store == "pgvector":
            async with get_db_session_context(settings.POSTGRESQL_WORC_DB_NAME) as session:
                session.info["tenant_id"] = _user.tenant_id
                db = TenantDB(session=session, tenant_id=_user.tenant_id)
                vector_store = get_vector_store(query_doc_request.vector_store, db)
                return await vector_store.query_document(query_doc_request, _user)

        # Qdrant
        if query_doc_request.vector_store == "qdrant":
            db = TenantDB(session=None, tenant_id=_user.tenant_id)
            vector_store = get_vector_store(query_doc_request.vector_store, db)
            return await vector_store.query_document(query_doc_request, _user)

        # Unsupported vector store
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported vector store: {query_doc_request.vector_store}",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying document: {e}")
        raise HTTPException(status_code=500, detail="Error querying document.")


@router.delete('/vector-store/delete')
async def delete_document_route(
    delete_doc_request: DeleteDocRequest,
    _user: User = Depends(authorize()),
):
    try:
        # Normalize credential IDs
        delete_doc_request.store_credential_id = _normalize_optional_credential(delete_doc_request.store_credential_id)

        logger.info("[VECTOR-DELETE] route called store=%s user=%s", delete_doc_request.vector_store, _user.username)

        # PgVector
        if delete_doc_request.vector_store == "pgvector":
            async with get_db_session_context(settings.POSTGRESQL_WORC_DB_NAME) as session:
                session.info["tenant_id"] = _user.tenant_id
                db = TenantDB(session=session, tenant_id=_user.tenant_id)
                vector_store = get_vector_store(delete_doc_request.vector_store, db)
                return await vector_store.delete_document(delete_doc_request, _user)

        # Qdrant
        if delete_doc_request.vector_store == "qdrant":
            db = TenantDB(session=None, tenant_id=_user.tenant_id)
            vector_store = get_vector_store(delete_doc_request.vector_store, db)
            return await vector_store.delete_document(delete_doc_request, _user)

        # Unsupported vector store
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported vector store: {delete_doc_request.vector_store}",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(status_code=500, detail="Error deleting document.")