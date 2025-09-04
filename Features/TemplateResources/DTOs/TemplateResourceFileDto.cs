namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a file resource associated with a specific project template version.
/// </summary>
public class TemplateResourceFileDto
{
    /// <summary>
    /// Gets or sets the unique identifier of this file resource.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the file. Maximum length is 255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the file extension (e.g., ".txt", ".json").
    /// </summary>
    public required string Extension { get; set; }

    /// <summary>
    /// Gets or sets the size of the file in bytes.
    /// </summary>
    public long Size { get; set; }

    /// <summary>
    /// Gets or sets the file storage path of the uploaded resource.
    /// </summary>
    public required string Path { get; set; }
}
