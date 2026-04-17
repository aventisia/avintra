namespace WorkspaceAPIs.Features.CloudConnectors.VectorStore;

public enum VectorStoreProviderEnum
{
    /// <summary>
    /// PostgreSQL with pgvector extension for vector storage and similarity search.
    /// </summary>
    PgVector,

    /// <summary>
    /// Qdrant vector database for high-performance vector search and storage.
    /// </summary>
    Qdrant,
}