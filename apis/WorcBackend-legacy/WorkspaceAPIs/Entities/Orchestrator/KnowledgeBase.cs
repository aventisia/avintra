namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a Knowledge Base entity for storing metadata about knowledge bases.
/// Each knowledge base is associated with a vector store and embedding model for semantic search capability.
/// </summary>
[Table("worc_KBs")]
public class KnowledgeBase : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the Knowledge Base. Max-255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the Knowledge Base.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the type of vector store used for this Knowledge Base.
    /// </summary>
    [MaxLength(50)]
    public required VectorStoreEnum VectorStore { get; set; }

    /// <summary>
    /// Gets or sets the embedding provider name used for generating vectors.
    /// Examples: openai, google, openrouter, azure, anthropic, etc.
    /// </summary>
    [MaxLength(255)]
    public required string EmbeddingProvider { get; set; }

    /// <summary>
    /// Gets or sets the embedding model name used for vectorizing content.
    /// Examples: text-embedding-3-small, text-embedding-3-large, text-embedding-ada-002, etc.
    /// </summary>
    [MaxLength(255)]
    public required string EmbeddingModel { get; set; }

    /// <summary>
    /// Gets or sets the credential ID used for the embedding model provider.
    /// This references an AppSecret credential that contains API keys or authentication info.
    /// </summary>
    public Guid? EmbeddingCredentialId { get; set; }

    /// <summary>
    /// Gets or sets the credential ID used for the vector store.
    /// This references an AppSecret credential that contains vector store connection info or API keys.
    /// </summary>
    public Guid? StoreCredentialId { get; set; }

    /// <summary>
    /// TODO: Not yet implemented. Gets or sets the name of the collection/index in the vector store.
    /// </summary>
    [MaxLength(255)]
    public string? CollectionName { get; set; }

    /// <summary>
    /// TODO: Not yet implemented. Gets or sets the dynamic JSON configuration for the external vector store.
    /// </summary>
    public string? VectorStoreConfig { get; set; }

    /// <summary>
    /// Navigation property for the files associated with this Knowledge Base.
    /// </summary>
    public virtual ICollection<KnowledgeBaseFile> Files { get; set; } = new List<KnowledgeBaseFile>();
}
