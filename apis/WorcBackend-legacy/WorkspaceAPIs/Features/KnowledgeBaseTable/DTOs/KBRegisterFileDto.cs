namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents file registration payload for knowledge base ingestion metadata.
/// </summary>
public class KBRegisterFileDto
{
    [Required]
    public required string FileUrl { get; set; }

    [Required]
    [StringLength(255)]
    public required string FileName { get; set; }

    [Range(1, long.MaxValue)]
    public long FileSizeInBytes { get; set; }

    [StringLength(50)]
    public string? FileExtension { get; set; }

    [Range(50, 8000)]
    public int ChunkSize { get; set; }

    [Range(0, 2000)]
    public int ChunkOverlap { get; set; }
}
