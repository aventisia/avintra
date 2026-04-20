# KB (Knowledge Base) retrieval utilities for augmenting LLM requests with relevant context chunks
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

    query_doc_request = QueryDocRequest(
        vector_store="pgvector",
        embedding_provider="openai",
        embedding_model="text-embedding-3-small",
        query=query_text,
        kb_ids=llm_request.kb_ids,
        top_k=llm_request.top_k or 5,
        store_credential_id=None,
        embedding_credential_id=llm_request.credential_id,
        ref_type=llm_request.ref_type,
        ref_id=llm_request.ref_id,
        ref_name=llm_request.ref_name,
        action=llm_request.action,
        agent_name=llm_request.agent_name,
    )

    try:
        async with get_db_session_context(settings.POSTGRESQL_WORC_DB_NAME) as session:
            session.info["tenant_id"] = user.tenant_id
            db = TenantDB(session=session, tenant_id=user.tenant_id)
            vector_store = get_vector_store("pgvector", db)
            result = await vector_store.query_document(query_doc_request, user)

        if result.error:
            logger.warning(f"[KB-RETRIEVAL] query_document returned an error: {result.error} — skipping KB context.")
            return

        if not result.chunks:
            logger.info("[KB-RETRIEVAL] No chunks retrieved from knowledge base.")
            return

        # Format retrieved chunks as a context block and inject into LLMRequest input
        chunks_text = "\n\n".join(chunk.content for chunk in result.chunks)
        logger.info(f"[KB-RETRIEVAL] Retrieved {len(result.chunks)} chunk(s) from knowledge base.")
        context_str = f"[Knowledge Base Context]\n{chunks_text}\n[/Knowledge Base Context]"
        _inject_context_into_input(llm_request, context_str)

    except Exception as exc:
        logger.warning(f"[KB-RETRIEVAL] Failed to retrieve KB context: {exc} — continuing without KB context.")
