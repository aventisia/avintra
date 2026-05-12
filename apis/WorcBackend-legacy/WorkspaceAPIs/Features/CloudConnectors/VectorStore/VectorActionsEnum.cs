namespace WorkspaceAPIs.Features.CloudConnectors.VectorStore.PgVector;

/// <summary>
/// PgVector-specific node operations (similar to n8n node actions).
/// Keep these in sync with existing <see cref="VectorStoreOperation"/> if needed.
/// </summary>
public enum PgVectorActionsEnum
{
    /// <summary>
    /// Add new documents / embeddings to the pgvector store (fails if document with same ID exists).
    /// </summary>
    InsertDocuments,

    /// <summary>
    /// Upsert documents / embeddings in the pgvector store (insert or update based on existence).
    /// </summary>
    RetrieveDocuments,

    /// <summary>
    /// Update documents / embeddings in the pgvector store.
    /// </summary>
    Update,

    /// <summary>
    /// Delete documents / embeddings from the pgvector store based on document IDs or other criteria.
    /// </summary>
    Delete,

    /// <summary>
    /// Basic similarity search using embeddings.
    /// </summary>
    SemanticSearch,

    /// <summary>
    /// Reranked or hybrid search combining semantic and lexical signals.
    /// </summary>
    RankedRetrieval,

    /// <summary>
    /// Optimized retrieval for RAG chains (chained retrieval strategies).
    /// </summary>
    ChainRetrieval,

    /// <summary>
    /// Retrieval tailored to provide context for agent/tool decisions.
    /// </summary>
    AgentActionRetrieval
}