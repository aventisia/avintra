namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents raw-text registration payload for knowledge base ingestion metadata.
/// </summary>
public class KBRegisterTextDto
{
    [Required]
    public required string TextContent { get; set; }

    [Required]
    [StringLength(255)]
    public required string FileName { get; set; }

    [Range(50, 8000)]
    public int ChunkSize { get; set; }

    [Range(0, 2000)]
    public int ChunkOverlap { get; set; }
}
