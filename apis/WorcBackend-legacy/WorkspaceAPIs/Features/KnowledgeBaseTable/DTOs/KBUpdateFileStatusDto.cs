namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the payload to update a Knowledge Base file's vectorization status after ingestion.
/// </summary>
public class KBUpdateFileStatusDto
{
    /// <summary>
    /// Gets or sets the vectorization status (e.g., Completed, Failed).
    /// </summary>
    [Required]
    public required VectorizationStatusEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the number of chunks created from the file during vectorization.
    /// </summary>
    [Range(0, int.MaxValue)]
    public int ChunksCount { get; set; }

    /// <summary>
    /// Gets or sets the error message if vectorization failed.
    /// </summary>
    public string? ErrorMessage { get; set; }
}
