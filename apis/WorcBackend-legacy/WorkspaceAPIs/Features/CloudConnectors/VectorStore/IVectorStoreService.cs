namespace WorkspaceAPIs.Features.CloudConnectors.VectorStore;

public interface IVectorStoreService
{
    // Add get connection string based on credential ID from vault, and other common methods needed for vector store connectors
    // based on provider like pgvecto qdrant and others in the future

    /// <summary>
    /// Get the vector store connection string based on the credential ID and provider.
    /// This will be used to connect to the vector store (like pgvector, qdrant, etc.) and perform operations like insert, search, delete, etc.
    /// </summary>
    /// <param name="credentialId"> The unique identifier for the credential stored in the vault, which contains the necessary information to connect to the vector store.</param>
    /// <param name="provider"> The vector store provider for which the connection string is being requested (e.g., "pgvector", "qdrant", etc.).</param>
    /// <returns> A task that represents the asynchronous operation.
    /// The task result contains the connection string for the vector store, or null if the operation fails or if the credential is not found.</returns>
    Task<string?> GetVectorStoreConnectionStringAsync(Guid credentialId, VectorStoreProviderEnum provider);

    /// <summary>
    /// Generates a numerical embedding vector based on the supplied input text.
    /// </summary>
    /// <param name="embeddingConfig">Specifies the embedding provider configuration (e.g., OpenAI, Gemini, OpenRouter).</param>
    /// <returns>A float array containing the embedding vector, or null if generation is unsuccessful.</returns>
    Task<EmbeddingResponseDto> GetEmbeddingVectorAsync(JsonElement embeddingConfig);
}