namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a vectorized document stored for semantic search or AI-driven retrieval.
/// Each record contains the original content, its vector embedding,
/// optional metadata, and is associated with a specific tenant.
/// </summary>
[Table("worc_VectorStore")]
public class VectorStore : IMustHaveTenant
{
    /// <summary>
    /// Gets the unique identifier for the vector record. Set is private to prevent external modification.
    /// </summary>
    public Guid Id { get; private set; }

    /// <summary>
    /// Gets or sets the original textual content that was transformed into a vector embedding.
    /// </summary>
    public required string Content { get; set; }

    /// <summary>
    /// Gets or sets optional structured metadata stored as JSON (e.g., source, tags, timestamps, etc.).
    /// </summary>
    public JsonDocument? Metadata { get; set; }

    /// <summary>
    /// Gets or sets the vector embedding representation of the content,  used for similarity search and AI operations.
    /// </summary>
    public required Vector Embedding { get; set; }

    /// <summary>
    /// Gets the identifier of the tenant that owns this record.
    /// </summary>
    public Guid TenantId { get; set; }
}