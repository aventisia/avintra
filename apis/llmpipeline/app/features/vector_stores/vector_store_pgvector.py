import json
import time
import uuid

from fastapi import HTTPException, status
from sqlalchemy import text

from app.core.database import TenantDB
from app.core.logger import log_exception, logger
from app.features.auth.authenticated_user import User
from app.features.llm_providers.llm_providers_factory import get_llm_provider
from app.features.llm_providers.llm_providers_schemas import EmbeddingRequest
from app.features.vector_stores.vector_store_base import BaseVectorStore
from app.features.vector_stores.vector_stores_schemas import (
    IngestDocRequest,
    IngestDocResponse,
    QueryDocRequest,
    QueryDocResponse,
    RetrievedChunk,
)
from app.features.vector_stores.vector_store_utils import VectorStoreInputResolver, VectorStoreTextChunker


class PgVectorStore(BaseVectorStore):
    """Store chunked document embeddings in the existing worc_VectorStore table (pgvector)."""

    def __init__(self, db: TenantDB):
        if db.session is None:
            raise ValueError("PgVectorStore requires an active database session.")
        self.db = db
        self.session = db.session

    # Method: Ingest document by chunking input text, generating embeddings, and storing in pgvector column
    async def ingest_document(self, ingest_doc_request: IngestDocRequest, user: User) -> IngestDocResponse:
        # Set initial values for logging and response
        started = time.perf_counter()
        chunks_created = 0
        embeddings_stored = 0

        try:
            # Resolve source text from input (raw text, file path, URL, or data URI)
            source_text = VectorStoreInputResolver.resolve_source_text(ingest_doc_request.input)
            doc_name_from_metadata = ingest_doc_request.metadata.get("doc_name") if ingest_doc_request.metadata else None
            chunks = VectorStoreTextChunker.chunk_text(source_text, ingest_doc_request.chunk_size, ingest_doc_request.chunk_overlap)
            chunks_created = len(chunks)

            # Error: No chunks created
            if chunks_created == 0:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No text chunks produced from input.")

            # Generate embeddings for chunks using specified embedding provider
            embedding_model_provider = get_llm_provider(ingest_doc_request.embedding_provider)
            embedding_request = EmbeddingRequest(
                provider=ingest_doc_request.embedding_provider,
                model=ingest_doc_request.embedding_model,
                input=chunks,
                # dimensions=ingest_doc_request.dimensions, TODO: Yet to implement
                reference_id=ingest_doc_request.ref_id,
                reference_type=ingest_doc_request.ref_type,
                reference_name=ingest_doc_request.ref_name,
                action=ingest_doc_request.action,
                is_byok_enabled=bool(ingest_doc_request.embedding_credential_id),
                credential_id=ingest_doc_request.embedding_credential_id,
            )
            embedding_response = await embedding_model_provider.generate_embeddings(embedding_request, user)
            
            # Error: Embedding generation failed
            if embedding_response.status == "failed" or not embedding_response.embeddings:
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=embedding_response.error or "Embedding generation failed.")

            # Error: Embedding count mismatch with chunk count
            if len(embedding_response.embeddings) != len(chunks):
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Embedding count mismatch with chunk count.")

            # Log the number of chunks created before attempting to store embeddings
            logger.info("[VECTOR-INGEST] tenant_id=%s chunks=%s", self.db.tenant_id, chunks_created)

            # Create parameterized SQL statement for inserting chunks and embeddings into pgvector column
            insert_sql = text(
                """
                INSERT INTO "worc_VectorStore" ("Id", "TenantId", "Content", "Metadata", "Embedding")
                VALUES (:id, :tenant_id, :content, CAST(:metadata AS jsonb), CAST(:embedding AS vector))
                """
            )

            # Iterate over chunks and their corresponding embeddings, and insert into database
            for chunk, embedding in zip(chunks, embedding_response.embeddings):
                # Set chunk-level metadata
                chunk_metadata = {
                    "doc_name": doc_name_from_metadata,
                }

                # Insert chunk, metadata, and embedding into pgvector column using parameterized query to prevent SQL injection
                await self.session.execute(
                    insert_sql,
                    {
                        "id": str(uuid.uuid4()),
                        "tenant_id": str(self.db.tenant_id),
                        "content": chunk,
                        "metadata": json.dumps(chunk_metadata),
                        "embedding": self._to_pgvector_literal(embedding),
                    },
                )
                embeddings_stored += 1

            # Commit transaction after all inserts are successful
            await self.session.commit()
            elapsed = round(time.perf_counter() - started, 2)

            # Log success
            logger.info("[VECTOR-INGEST] success tenant_id=%s stored=%s elapsed_s=%s", self.db.tenant_id, embeddings_stored, elapsed)

            # Return response with ingestion details
            return IngestDocResponse(
                vector_store=ingest_doc_request.vector_store,
                embedding_provider=ingest_doc_request.embedding_provider,
                embedding_model=ingest_doc_request.embedding_model,
                doc_name=doc_name_from_metadata,
                chunks_created=chunks_created,
                embeddings_stored=embeddings_stored,
                time_taken=elapsed,
                input_tokens=embedding_response.input_tokens or 0,
                store_credential_id=ingest_doc_request.store_credential_id,
                embedding_credential_id=ingest_doc_request.embedding_credential_id,
                error=None,
            )

        except HTTPException:
            await self.session.rollback()
            raise
        except Exception as exc:
            await self.session.rollback()
            elapsed = round(time.perf_counter() - started, 2)
            log_exception(logger, exc, "[VECTOR-INGEST] pgvector ingestion failed")
            return IngestDocResponse(
                vector_store=ingest_doc_request.vector_store,
                embedding_provider=ingest_doc_request.embedding_provider,
                embedding_model=ingest_doc_request.embedding_model,
                doc_name="error",
                chunks_created=chunks_created,
                embeddings_stored=embeddings_stored,
                time_taken=elapsed,
                input_tokens=0,
                store_credential_id=ingest_doc_request.store_credential_id,
                embedding_credential_id=ingest_doc_request.embedding_credential_id,
                error=str(exc),
            )

    # Method: Query document by generating embedding for query text, retrieving similar chunks from pgvector column, and returning results
    async def query_document(self, query_doc_request: QueryDocRequest, user: User) -> QueryDocResponse:
        started = time.perf_counter()

        try:
            # Validate: Query text cannot be empty
            query_text = (query_doc_request.query or "").strip()
            if not query_text:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="query cannot be empty.")

            # Generate embedding for query text using specified embedding provider
            embedding_model_provider = get_llm_provider(query_doc_request.embedding_provider)
            embedding_request = EmbeddingRequest(
                provider=query_doc_request.embedding_provider,
                model=query_doc_request.embedding_model,
                input=query_text,
                reference_id=query_doc_request.ref_id,
                reference_type=query_doc_request.ref_type,
                action=query_doc_request.action,
                is_byok_enabled=bool(query_doc_request.embedding_credential_id),
                credential_id=query_doc_request.embedding_credential_id,
            )
            embedding_response = await embedding_model_provider.generate_embeddings(embedding_request, user)

            # Error: Embedding generation failed
            if embedding_response.status == "failed" or not embedding_response.embeddings:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=embedding_response.error or "Embedding generation failed.",
                )

            # Retrieve similar chunks from pgvector column using vector similarity search with the generated query embedding
            query_embedding = embedding_response.embeddings[0]
            query_sql = text(
                """
                SELECT
                    "Content" AS content,
                    "Metadata" AS metadata,
                    (1 - ("Embedding" <=> CAST(:query_embedding AS vector))) AS similarity_score
                FROM "worc_VectorStore"
                WHERE "TenantId" = :tenant_id
                ORDER BY "Embedding" <=> CAST(:query_embedding AS vector)
                LIMIT :top_k
                """
            )

            # Execute the query and fetch results
            result = await self.session.execute(
                query_sql,
                {
                    "tenant_id": str(self.db.tenant_id),
                    "query_embedding": self._to_pgvector_literal(query_embedding),
                    "top_k": query_doc_request.top_k,
                },
            )
            rows = result.mappings().all()

            # Transform query results into list of RetrievedChunk objects for response
            chunks: list[RetrievedChunk] = []
            for row in rows:
                chunks.append(
                    RetrievedChunk(
                        content=row["content"],
                        similarity_score=float(row["similarity_score"] or 0.0),
                        metadata=row["metadata"] or {},
                    )
                )

            # Log success with number of chunks returned
            elapsed = round(time.perf_counter() - started, 2)
            logger.info(
                "[VECTOR-QUERY] success tenant_id=%s top_k=%s returned=%s elapsed_s=%s",
                self.db.tenant_id,
                query_doc_request.top_k,
                len(chunks),
                elapsed,
            )

            # Return response with query results and details
            return QueryDocResponse(
                vector_store=query_doc_request.vector_store,
                embedding_provider=query_doc_request.embedding_provider,
                embedding_model=query_doc_request.embedding_model,
                query=query_text,
                top_k=query_doc_request.top_k,
                chunks=chunks,
                time_taken=elapsed,
                input_tokens=embedding_response.input_tokens or 0,
                store_credential_id=query_doc_request.store_credential_id,
                embedding_credential_id=query_doc_request.embedding_credential_id,
                error=None,
            )
        except HTTPException:
            raise
        except Exception as exc:
            elapsed = round(time.perf_counter() - started, 2)
            log_exception(logger, exc, "[VECTOR-QUERY] pgvector retrieval failed")
            return QueryDocResponse(
                vector_store=query_doc_request.vector_store,
                embedding_provider=query_doc_request.embedding_provider,
                embedding_model=query_doc_request.embedding_model,
                query=query_doc_request.query,
                top_k=query_doc_request.top_k,
                chunks=[],
                time_taken=elapsed,
                input_tokens=0,
                store_credential_id=query_doc_request.store_credential_id,
                embedding_credential_id=query_doc_request.embedding_credential_id,
                error=str(exc),
            )
    
    # Helper: Convert embedding list to pgvector literal format (e.g., "[0.1,0.2,0.3]") for parameterized SQL insertion
    def _to_pgvector_literal(self, embedding: list[float]) -> str:
        return "[" + ",".join(str(float(value)) for value in embedding) + "]"


# TODO(important-hardening):
# - Add idempotency using content hash + ref_id to prevent duplicate ingestion.
# - Add deduplication across repeated chunks.
# - Add source versioning strategy (upsert/delete old chunks when source updates).
# - Add background job queue + per-stage retries for large documents.
# - Add circuit-breaker and provider fallback for embedding failures.
