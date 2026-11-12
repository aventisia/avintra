namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a file produced by or attached to a landing chat conversation.
/// </summary>
[Table("chat_artifacts")]
public class ChatArtifact : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the space this artifact belongs to.
    /// Null indicates the artifact is in the default "Central" space (shared across the tenant).
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the conversation this artifact belongs to.
    /// </summary>
    public required Guid ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the conversation this artifact belongs to.
    /// </summary>
    [ForeignKey("ConversationId")]
    public virtual Conversation? Conversation { get; set; }

    /// <summary>
    /// Gets or sets the file name shown to the user. Max-255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the file media type. Max-100 characters.
    /// </summary>
    [MaxLength(100)]
    public required string ContentType { get; set; }

    /// <summary>
    /// Gets or sets the file size in bytes.
    /// </summary>
    public long SizeBytes { get; set; }

    /// <summary>
    /// Gets or sets the blob storage path holding the file bytes.
    /// </summary>
    public required string BlobPath { get; set; }

    /// <summary>
    /// Gets or sets the pipeline source artifact for generated output, or null otherwise.
    /// </summary>
    public string? SourceArtifact { get; set; }

    /// <summary>
    /// Gets or sets the artifact origin ("Generated" or "Uploaded"). Max-20 characters.
    /// </summary>
    [MaxLength(20)]
    public required string Origin { get; set; }

    /// <summary>
    /// Gets or sets the 1-based version within the conversation's artifacts sharing this name.
    /// </summary>
    public int VersionNumber { get; set; } = 1;

    /// <summary>
    /// Gets or sets the previous version's artifact ID, or null for the first version.
    /// </summary>
    public Guid? PreviousVersionId { get; set; }

    /// <summary>
    /// Gets or sets the previous version of this artifact.
    /// </summary>
    [ForeignKey("PreviousVersionId")]
    public virtual ChatArtifact? PreviousVersion { get; set; }
}
