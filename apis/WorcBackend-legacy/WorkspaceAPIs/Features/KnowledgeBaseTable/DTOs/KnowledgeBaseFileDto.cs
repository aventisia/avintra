namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents metadata of a file registered under a knowledge base.
/// </summary>
public class KnowledgeBaseFileDto
{
    public Guid Id { get; set; }

    [StringLength(255)]
    public required string FileName { get; set; }

    /// <summary>
    /// Human-readable file size string (e.g. 1.8 MB).
    /// </summary>
    public required string FileSize { get; set; }

    public string? ContentType { get; set; }

    public int ChunksCount { get; set; }

    public VectorizationStatusEnum Status { get; set; }

    public string? VectorizationErrorMessage { get; set; }

    public string? CreatedBy { get; set; }

    public DateTimeOffset? CreatedOn { get; set; }
}
