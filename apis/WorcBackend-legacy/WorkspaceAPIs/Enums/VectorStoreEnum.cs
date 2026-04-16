namespace WorkspaceAPIs.Enums;

/// <summary>
/// Represents the supported vector store types for knowledge bases. This enum is used to specify which vector 
/// store is being used for a particular knowledge base, enabling the application to handle different vector 
/// store implementations accordingly.
/// </summary>
public enum VectorStoreEnum
{
    pgvector,
    qdrant,
    // weaviate,
    // chromadb,
    // pinecone,
    // milvus,
}
