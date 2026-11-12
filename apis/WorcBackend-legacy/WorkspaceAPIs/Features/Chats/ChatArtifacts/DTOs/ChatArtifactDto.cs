namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a file stored for a landing chat conversation, returned by the chat-artifacts API.
/// </summary>
public class ChatArtifactDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the artifact.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the ID of the conversation this artifact belongs to.
    /// </summary>
    [RequiredGuid]
    public Guid ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the file name shown to the user (max 255 characters).
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the file media type (max 100 characters).
    /// </summary>
    [StringLength(100)]
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
    /// Gets or sets the artifact origin ("Generated" or "Uploaded", max 20 characters).
    /// </summary>
    [StringLength(20)]
    public required string Origin { get; set; }

    /// <summary>
    /// Gets or sets the 1-based version within the conversation's artifacts sharing this name.
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the previous version's artifact ID, or null for the first version.
    /// </summary>
    public Guid? PreviousVersionId { get; set; }

    /// <summary>
    /// Gets or sets when the artifact was stored.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the title of the conversation that produced the artifact.
    /// </summary>
    public string? ConversationTitle { get; set; }
}
