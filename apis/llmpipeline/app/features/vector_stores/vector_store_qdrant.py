import datetime
import time
import uuid
import httpx
from fastapi import HTTPException, status

from app.core.logger import log_exception, logger
from app.core.config import settings
from app.features.auth.authenticated_user import User
from app.features.llm_providers.llm_providers_factory import get_llm_provider
from app.features.llm_providers.llm_providers_schemas import EmbeddingRequest
from app.features.vector_stores.vector_store_base import BaseVectorStore
from app.features.vector_stores.vector_stores_schemas import (
    DeleteDocRequest,
    DeleteDocResponse,
    IngestDocRequest,
    IngestDocResponse,
    QueryDocRequest,
    QueryDocResponse,
    RetrievedChunk,
)
from app.features.vector_stores.vector_store_utils import (
    VectorStoreInputResolver,
    VectorStoreTextChunker,
)


class QdrantVectorStore(BaseVectorStore):
    """Qdrant Vector Store with validation, logging, and reusable HTTP client"""

    def __init__(
            self,
            api_url: str = settings.QDRANT_URL,
            api_key: str = settings.QDRANT_API_KEY,
            # TODO: move collection_name to request (IngestDocRequest / QueryDocRequest)
            collection_name: str = "test_collection_384"
        ):
        # Initialization
        self.api_url = api_url
        self.api_key = api_key
        self.collection_name = collection_name

    # TODO: Move this method to QdrantManager (shared client layer)
    # Reusable HTTP Client Method
    async def _make_request(self, method: str, endpoint: str, payload: dict):
        """
        Centralized HTTP request handler.

        Responsibilities:
        - Build full request URL
        - Attach required headers (API key, content type)
        - Execute async HTTP request
        - Handle non-success responses
        - Log success and failure scenarios
        - Return parsed JSON response
        """

        # Construct full URL using base API URL and endpoint
        url = f"{self.api_url}{endpoint}"

        # Prepare request headers (authentication + content type)
        headers = {
            "Content-Type": "application/json",
            "api-key": self.api_key,
        }

        try:
            # Create async HTTP client with timeout to avoid hanging requests
            async with httpx.AsyncClient(timeout=60.0) as client:

                # Execute HTTP request with given method, URL, headers, and JSON payload
                response = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    json=payload,
                )

            # Validate HTTP response status
            # Accept only success codes (200 OK, 202 Accepted)
            if response.status_code not in (200, 202):
                logger.error(
                    "[HTTP] Request failed | %s %s | Status=%s | Body=%s",
                    method,
                    url,
                    response.status_code,
                    response.text,
                )

                # Raise standardized API error for upstream handling
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Vector DB request failed",
                )

            # Parse and return JSON response body
            return response.json()

        except httpx.TimeoutException as exc:
            # Handle request timeout separately for better debugging
            log_exception(logger, exc, "[HTTP] Request timeout")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Vector DB request timed out",
            )

        except httpx.RequestError as exc:
            # Handle network-level errors (DNS failure, connection issues, etc.)
            log_exception(logger, exc, "[HTTP] Network error during request")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Vector DB network error",
            )

        except Exception as exc:
            # Catch-all for unexpected errors
            log_exception(logger, exc, "[HTTP] Unexpected exception during request")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Vector DB connection error",
            )

    async def ingest_document(self, ingest_doc_request: IngestDocRequest, user: User) -> IngestDocResponse:

        # Start timer to measure total execution time
        started = time.perf_counter()

        # Initialize counters for tracking processing stats
        chunks_created, embeddings_stored = 0, 0

        try:
            # Resolve input into raw text
            source_text = VectorStoreInputResolver.resolve_source_text(
                ingest_doc_request.input
            )

            # Validate input text
            if not source_text or not source_text.strip():
                logger.error("[INGEST] Empty input text")
                raise HTTPException(status_code=400, detail="Input text is empty")

            # Split text into chunks
            chunks = VectorStoreTextChunker.chunk_text(
                source_text,
                ingest_doc_request.chunk_size,
                ingest_doc_request.chunk_overlap,
            )

            # Store number of chunks created
            chunks_created = len(chunks)

            # Ensure chunking worked
            if chunks_created == 0:
                logger.error("[INGEST] No chunks created")
                raise HTTPException(status_code=400, detail="Chunking failed")

            # Initialize embedding provider
            provider = get_llm_provider(ingest_doc_request.embedding_provider)

            # Generate embeddings for all chunks
            embedding_response = await provider.generate_embeddings(
                EmbeddingRequest(
                    provider=ingest_doc_request.embedding_provider,
                    model=ingest_doc_request.embedding_model,
                    input=chunks,
                    reference_id=ingest_doc_request.ref_id,
                    reference_type=ingest_doc_request.ref_type,
                    action=ingest_doc_request.action,
                    is_byok_enabled=bool(ingest_doc_request.embedding_credential_name),
                    credential_name=ingest_doc_request.embedding_credential_name,
                ),
                user,
            )

            # Validate embedding response
            if (embedding_response.status == "failed" or not embedding_response.embeddings):
                logger.error("[INGEST] Embedding generation failed")
                raise HTTPException(502, "Embedding generation failed")

            # Ensure embeddings match chunks
            if len(embedding_response.embeddings) != chunks_created:
                logger.error("[INGEST] Embedding count mismatch")
                raise HTTPException(500, "Embedding count mismatch")

            # Initialize list to store Qdrant points
            points = []

            # Iterate through chunks and corresponding embeddings
            for chunk, embedding in zip(chunks, embedding_response.embeddings):

                # Skip invalid embedding
                if not isinstance(embedding, list) or not embedding:
                    logger.warning("[INGEST] Skipping invalid embedding")
                    continue

                # Skip non-numeric embedding values
                if not all(isinstance(x, (float, int)) for x in embedding):
                    logger.warning("[INGEST] Non-numeric embedding skipped")
                    continue

                # Create vector point with payload
                points.append(
                    {
                        "id": str(uuid.uuid4()),
                        "vector": embedding,
                        "payload": {
                            "content": chunk,
                            "metadata": ingest_doc_request.metadata,
                            "tenant_id": str(user.tenant_id),
                            "timestamp": datetime.datetime.now(
                                datetime.timezone.utc
                            ).isoformat(),
                        },
                    }
                )

                # Increment successfully stored embeddings count
                embeddings_stored += 1

            # Ensure we have valid points to insert
            if not points:
                logger.error("[INGEST] No valid points to insert")
                raise HTTPException(500, "No valid embeddings")

            # TODO: Replace with QdrantManager client call
            # Insert points into Qdrant collection
            await self._make_request(
                "PUT",
                f"/collections/{self.collection_name}/points?wait=true",
                {"points": points},
            )

            # Calculate total execution time
            elapsed = round(time.perf_counter() - started, 2)

            logger.debug("[INGEST] Completed in %ss", elapsed)

            # Return successful ingestion response
            return IngestDocResponse(
                vector_store=ingest_doc_request.vector_store,
                embedding_provider=ingest_doc_request.embedding_provider,
                embedding_model=ingest_doc_request.embedding_model,
                metadata=ingest_doc_request.metadata,
                chunks_created=chunks_created,
                embeddings_stored=embeddings_stored,
                time_taken=elapsed,
                input_tokens=embedding_response.input_tokens or 0,
                error=None,
            )

        except HTTPException:
            # Re-raise known HTTP exceptions
            raise

        except Exception as exc:
            # Calculate execution time on failure
            elapsed = round(time.perf_counter() - started, 2)

            # Log exception with context
            log_exception(logger, exc, "[INGEST] Failed")

            # Return failure response
            return IngestDocResponse(
                vector_store=ingest_doc_request.vector_store,
                embedding_provider=ingest_doc_request.embedding_provider,
                embedding_model=ingest_doc_request.embedding_model,
                metadata=ingest_doc_request.metadata,
                chunks_created=chunks_created,
                embeddings_stored=embeddings_stored,
                time_taken=elapsed,
                input_tokens=0,
                error=str(exc),
            )
        
    async def query_document(self, query_doc_request: QueryDocRequest, user: User) -> QueryDocResponse:

        # Start timer to measure query execution time
        started = time.perf_counter()

        try:
            # Normalize and validate query text
            query_text = (query_doc_request.query or "").strip()

            if not query_text:
                logger.error("[QUERY] Empty query")
                raise HTTPException(400, "Query cannot be empty")

            # Initialize embedding provider
            provider = get_llm_provider(query_doc_request.embedding_provider)


            # Generate embedding for query
            embedding_response = await provider.generate_embeddings(
                EmbeddingRequest(
                    provider=query_doc_request.embedding_provider,
                    model=query_doc_request.embedding_model,
                    input=query_text,
                    reference_id=query_doc_request.ref_id,
                    reference_type=query_doc_request.ref_type,
                    action=query_doc_request.action,
                    is_byok_enabled=bool(query_doc_request.embedding_credential_name),
                    credential_name=query_doc_request.embedding_credential_name,
                ),
                user,
            )

            # Validate embedding response
            if not embedding_response.embeddings:
                raise HTTPException(400, "Embedding failed")

            # Extract query vector
            query_vector = embedding_response.embeddings[0]

            # Prepare search payload with tenant-level filtering
            # Build dynamic filter conditions based on provided parameters
            must_filters = [
                {
                    "key": "tenant_id",
                    "match": {"value": str(user.tenant_id)},
                }
            ]

            # Name-based filters (preferred)
            normalized_kb_names = (
                [k.strip() for k in query_doc_request.kb_names if (k or "").strip()]
                if query_doc_request.kb_names else []
            )
            if normalized_kb_names:
                must_filters.append({
                    "key": "metadata.kb_name",
                    "match": {"any": normalized_kb_names},
                })

            normalized_doc_names = (
                [k.strip() for k in query_doc_request.doc_names if (k or "").strip()]
                if query_doc_request.doc_names else []
            )
            if normalized_doc_names:
                must_filters.append({
                    "key": "metadata.doc_name",
                    "match": {"any": normalized_doc_names},
                })

            payload = {
                "vector": query_vector,
                "limit": query_doc_request.top_k,
                "with_payload": True,
                "score_threshold": query_doc_request.score_threshold,
                "filter": {
                    "must": must_filters,
                },
            }

            # TODO: Replace with QdrantManager client call
            # Execute vector search in Qdrant
            result = await self._make_request(
                "POST",
                f"/collections/{self.collection_name}/points/search",
                payload,
            )

            # Initialize list for retrieved chunks
            chunks = []

            # Parse search results into response schema
            for point in result.get("result", []):
                payload = point.get("payload", {})

                chunks.append(
                    RetrievedChunk(
                        id=point["id"],
                        content=payload.get("content"),
                        similarity_score=float(point["score"]),
                        metadata=payload.get("metadata"),
                    )
                )

            # Calculate total execution time
            elapsed = round(time.perf_counter() - started, 2)

            logger.debug("[QUERY] Retrieved %s chunks", len(chunks))

            # Return successful query response
            return QueryDocResponse(
                vector_store=query_doc_request.vector_store,
                embedding_provider=query_doc_request.embedding_provider,
                embedding_model=query_doc_request.embedding_model,
                query=query_text,
                top_k=query_doc_request.top_k,
                kb_names=query_doc_request.kb_names,
                doc_names=query_doc_request.doc_names,
                chunks=chunks,
                time_taken=elapsed,
                input_tokens=embedding_response.input_tokens or 0,
                error=None,
            )

        except HTTPException:
            # Re-raise known HTTP errors
            raise

        except Exception as exc:
            # Calculate execution time on failure
            elapsed = round(time.perf_counter() - started, 2)

            # Log exception details
            log_exception(logger, exc, "[QUERY] Failed")

            # Return failure response
            return QueryDocResponse(
                vector_store=query_doc_request.vector_store,
                embedding_provider=query_doc_request.embedding_provider,
                embedding_model=query_doc_request.embedding_model,
                query=query_doc_request.query,
                top_k=query_doc_request.top_k,
                kb_names=query_doc_request.kb_names,
                doc_names=query_doc_request.doc_names,
                chunks=[],
                time_taken=elapsed,
                input_tokens=0,
                error=str(exc),
            )        
    
    # Implement doc delete just like pgvector
    async def delete_document(
        self, delete_doc_request: DeleteDocRequest, user: User
    ) -> DeleteDocResponse:

        # Start timer for performance tracking
        started = time.perf_counter()

        try:
            # Build dynamic filter conditions based on provided parameters
            # At least one filter must be provided to prevent accidental full-collection deletion
            should_filters = []

            # Name-based filters (preferred)
            normalized_kb_names = (
                [k.strip() for k in delete_doc_request.kb_names if (k or "").strip()]
                if delete_doc_request.kb_names else []
            )
            if normalized_kb_names:
                should_filters.append({
                    "key": "metadata.kb_name",
                    "match": {"any": normalized_kb_names},
                })

            normalized_doc_names = (
                [k.strip() for k in delete_doc_request.doc_names if (k or "").strip()]
                if delete_doc_request.doc_names else []
            )
            if normalized_doc_names:
                should_filters.append({
                    "key": "metadata.doc_name",
                    "match": {"any": normalized_doc_names},
                })

            if not should_filters:
                logger.error(
                    "[VECTOR-DELETE-QDRANT] Invalid input: no filters provided | tenant_id=%s",
                    user.tenant_id,
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="At least one filter (kb_names, doc_names) must be provided.",
                )

            # Build Qdrant filter.
            # All conditions are placed in 'must' (AND logic) so that when both kb_name and
            # doc_name are supplied, only chunks matching BOTH are deleted — not chunks from
            # other KBs that happen to share the same doc_name.
            must_filters = [
                {
                    "key": "tenant_id",
                    "match": {"value": str(user.tenant_id)},
                },
                *should_filters,  # each name filter is ANDed, not ORed
            ]

            payload = {
                "filter": {
                    "must": must_filters,
                }
            }

            logger.debug(
                "[VECTOR-DELETE-QDRANT] Initiating delete | tenant_id=%s filters=%s",
                user.tenant_id,
                {k: v for k, v in {
                    "kb_names": normalized_kb_names or None,
                    "doc_names": normalized_doc_names or None,
                }.items() if v},
            )

            # Execute delete request to Qdrant
            result = await self._make_request(
                "POST",
                f"/collections/{self.collection_name}/points/delete?wait=true",
                payload,
            )

            # Extract operation_id (Qdrant does not return deleted count)
            operation_id = result.get("result", {}).get("operation_id")

            # Calculate elapsed time
            elapsed = round(time.perf_counter() - started, 2)

            logger.debug(
                "[VECTOR-DELETE-QDRANT] Success | tenant_id=%s operation_id=%s elapsed_s=%s",
                user.tenant_id,
                operation_id,
                elapsed,
            )

            return DeleteDocResponse(
                vector_store=delete_doc_request.vector_store,
                kb_names=delete_doc_request.kb_names,
                doc_names=delete_doc_request.doc_names,
                deleted_chunks=0,  # Qdrant does not provide exact count
                time_taken=elapsed,
                error=None,
            )

        except HTTPException as http_exc:
            # Handle expected HTTP errors
            elapsed = round(time.perf_counter() - started, 2)

            logger.warning(
                "[VECTOR-DELETE-QDRANT] HTTPException | tenant_id=%s kb_names=%s doc_names=%s error=%s elapsed_s=%s",
                user.tenant_id,
                delete_doc_request.kb_names,
                delete_doc_request.doc_names,
                str(http_exc.detail),
                elapsed,
            )

            raise

        except Exception as exc:
            # Handle unexpected failures
            elapsed = round(time.perf_counter() - started, 2)

            log_exception(
                logger,
                exc,
                "[VECTOR-DELETE-QDRANT] Unexpected failure during deletion",
            )

            logger.error(
                "[VECTOR-DELETE-QDRANT] Failed | tenant_id=%s elapsed_s=%s",
                user.tenant_id,
                elapsed,
            )

            return DeleteDocResponse(
                vector_store=delete_doc_request.vector_store,
                kb_names=delete_doc_request.kb_names,
                doc_names=delete_doc_request.doc_names,
                deleted_chunks=0,
                time_taken=elapsed,
                error=str(exc),
            )