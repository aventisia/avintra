namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for a Knowledge Base record.
/// </summary>
public class KnowledgeBaseDto
{
    /// <summary>
    /// Gets or sets the primary key of the Knowledge Base record.
    /// Note: Not required for insert operations, only populated in responses.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the Knowledge Base. Max-255 characters.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the Knowledge Base.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the type of vector store used for this Knowledge Base.
    /// </summary>
    public required VectorStoreEnum VectorStore { get; set; }

    /// <summary>
    /// Gets or sets the embedding provider used for vectorizing content.
    /// </summary>
    [StringLength(255)]
    public required string EmbeddingProvider { get; set; }

    /// <summary>
    /// Gets or sets the embedding model name used for vectorizing content.
    /// </summary>
    [StringLength(255)]
    public required string EmbeddingModel { get; set; }

    /// <summary>
    /// Gets or sets the credential ID used for the embedding model provider.
    /// </summary>
    public Guid? EmbeddingCredentialId { get; set; }

    /// <summary>
    /// Gets or sets the credential ID used for the vector store.
    /// </summary>
    public Guid? StoreCredentialId { get; set; }

    /// <summary>
    /// Gets or sets the name of the collection/index in the vector store.
    /// </summary>
    [StringLength(255)]
    public string? CollectionName { get; set; }

    /// <summary>
    /// Gets or sets the dynamic JSON configuration for the external vector store.
    /// </summary>
    public string? VectorStoreConfig { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the knowledge base is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets the permission level granted to the user.
    /// </summary>
    public ResourceAccessTypeEnum AccessLevel { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the Knowledge Base record is disabled.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the Knowledge Base record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the Knowledge Base record was created.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the Knowledge Base record.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the Knowledge Base record was last modified.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }

    /// <summary>
    /// Gets or sets the total number of chunks across all files in this Knowledge Base.
    /// </summary>
    public int TotalChunks { get; set; }
}
