# KB (Knowledge Base) retrieval utilities for augmenting LLM requests with relevant context chunks
from sqlalchemy import bindparam, text

from app.core.config import settings
from app.core.database import TenantDB, get_db_session_context
from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.llm_providers.llm_providers_schemas import LLMMessage, LLMRequest
from app.features.vector_stores.vector_stores_factory import get_vector_store
from app.features.vector_stores.vector_stores_schemas import QueryDocRequest


# Helper: Extract query text from LLMRequest input
def _extract_query_from_input(llm_request: LLMRequest) -> str:
    if isinstance(llm_request.input, str):
        return llm_request.input.strip()
    # List of LLMMessage — extract the last user message content
    for msg in reversed(llm_request.input):
        role = msg.role if hasattr(msg, "role") else msg.get("role", "")
        if role == "user":
            content = msg.content if hasattr(msg, "content") else msg.get("content", "")
            return (content or "").strip()
    return ""


# Helper: Inject KB context string into LLMRequest input
def _inject_context_into_input(llm_request: LLMRequest, context_str: str) -> None:
    if isinstance(llm_request.input, str):
        llm_request.input = f"{context_str}\n\n{llm_request.input}"
    else:
        # Prepend a user message with the KB context before existing messages
        context_message = LLMMessage(role="user", content=context_str)
        llm_request.input = [context_message] + list(llm_request.input)


async def _resolve_kb_embedding_configs(kb_ids: list[str], tenant_id: str) -> list[dict]:
    """
    Resolve per-KB retrieval configuration for selected knowledge bases.

    All selected KBs must exist, be active, and belong to the tenant.
    """
    normalized_kb_ids = [kb_id.strip() for kb_id in kb_ids if (kb_id or "").strip()]
    if not normalized_kb_ids:
        raise ValueError("kb_ids cannot be empty.")

    unique_kb_ids = list(dict.fromkeys(normalized_kb_ids))

    async with get_db_session_context(settings.POSTGRESQL_WORC_DB_NAME) as session:
        query_sql = text(
            """
            SELECT
                "Id"::text AS kb_id,
                "EmbeddingProvider" AS embedding_provider,
                "EmbeddingModel" AS embedding_model,
                "EmbeddingCredentialId"::text AS embedding_credential_id,
                "StoreCredentialId"::text AS store_credential_id,
                "VectorStore" AS vector_store
            FROM "worc_KBs"
            WHERE "TenantId" = :tenant_id
              AND "Id"::text IN :kb_ids
            """
        ).bindparams(bindparam("kb_ids", expanding=True))

        result = await session.execute(
            query_sql,
            {
                "tenant_id": str(tenant_id),
                "kb_ids": unique_kb_ids,
            },
        )
        rows = result.mappings().all()

    if len(rows) != len(unique_kb_ids):
        raise ValueError("One or more kb_ids are missing, disabled, or not accessible for this tenant.")

    kb_configs_by_id = {str(row["kb_id"]): row for row in rows}
    ordered_configs: list[dict] = []
    for kb_id in unique_kb_ids:
        row = kb_configs_by_id[kb_id]
        ordered_configs.append(
            {
                "kb_id": kb_id,
                "embedding_provider": str(row["embedding_provider"]),
                "embedding_model": str(row["embedding_model"]),
                "embedding_credential_id": row["embedding_credential_id"],
                "store_credential_id": row["store_credential_id"],
                "vector_store": str(row["vector_store"]),
            }
        )

    return ordered_configs


# Main: Query pgvector knowledge base and inject retrieved chunks as context into LLMRequest
async def retrieve_and_inject_kb_context(llm_request: LLMRequest, user: User) -> None:
    """
    Queries the pgvector knowledge base using the LLM request's input as the query,
    retrieves the top-k relevant chunks scoped to the specified kb_ids,
    and injects them as a formatted context block into llm_request.input in-place.

    Defaults: vector_store=pgvector, embedding_provider=openai, embedding_model=text-embedding-3-small.
    Uses llm_request.credential_id as the embedding credential (supports BYOK).
    Silently skips on any error to avoid blocking the LLM call.
    """
    query_text = _extract_query_from_input(llm_request)
    if not query_text:
        logger.warning("[KB-RETRIEVAL] Could not extract query text from LLM input — skipping KB retrieval.")
        return

    try:
        kb_configs = await _resolve_kb_embedding_configs(
            kb_ids=llm_request.kb_ids or [],
            tenant_id=str(user.tenant_id),
        )

        all_chunks = []

        async with get_db_session_context(settings.POSTGRESQL_WORC_DB_NAME) as session:
            session.info["tenant_id"] = user.tenant_id
            db = TenantDB(session=session, tenant_id=user.tenant_id)
            
            # Iterate through each KB configuration
            for kb_config in kb_configs:
                store_type = kb_config.get("vector_store")

                # Guard: skip if vector store not defined
                if not store_type:
                    logger.warning(
                        "[KB-RETRIEVAL] Unsupported vector store '%s' for kb_id=%s. Skipping.",
                        kb_config["vector_store"],
                        kb_config["kb_id"],
                    )
                    continue

                try:
                    # Dynamically initialize the appropriate vector store backend
                    vector_store = get_vector_store(store_type, db)
                except Exception as e:
                    # Fail gracefully if store init fails (do not block other KBs)
                    logger.warning(
                        "[KB-RETRIEVAL] Failed to initialize vector store '%s' for kb_id=%s. Error: %s",
                        store_type,
                        kb_config["kb_id"],
                        str(e),
                    )
                    continue
                
                # Build query request for this KB
                query_doc_request = QueryDocRequest(
                    vector_store=store_type,
                    embedding_provider=kb_config["embedding_provider"],
                    embedding_model=kb_config["embedding_model"],
                    query=query_text,
                    kb_ids=[kb_config["kb_id"]],
                    top_k=llm_request.top_k or 5,
                    store_credential_id=kb_config["store_credential_id"],
                    embedding_credential_id=kb_config["embedding_credential_id"] or llm_request.credential_id,
                    ref_type=llm_request.ref_type,
                    ref_id=llm_request.ref_id,
                    ref_name=llm_request.ref_name,
                    action=llm_request.action,
                    agent_name=llm_request.agent_name,
                )

                # Execute semantic search against vector store
                result = await vector_store.query_document(query_doc_request, user)

                # Handle query errors per KB (non-blocking)
                if result.error:
                    logger.warning(
                        "[KB-RETRIEVAL] query_document returned an error for kb_id=%s: %s",
                        kb_config["kb_id"],
                        result.error,
                    )
                    continue

                # Aggregate retrieved chunks
                all_chunks.extend(result.chunks)
        # Guard: no results from any KB
        if not all_chunks:
            logger.info("[KB-RETRIEVAL] No chunks retrieved from knowledge base.")
            return

         # Rank chunks globally by similarity score (descending)
        all_chunks.sort(key=lambda chunk: chunk.similarity_score, reverse=True)

        # Format retrieved chunks as a context block and inject into LLMRequest input
        chunks_text = "\n\n".join(chunk.content for chunk in all_chunks)
        logger.info(f"[KB-RETRIEVAL] Retrieved {len(all_chunks)} chunk(s) from knowledge base.")
        context_str = f"[Knowledge Base Context]\n{chunks_text}\n[/Knowledge Base Context]"
        _inject_context_into_input(llm_request, context_str)

    except Exception as exc:
        logger.warning(f"[KB-RETRIEVAL] Failed to retrieve KB context: {exc} — continuing without KB context.")
