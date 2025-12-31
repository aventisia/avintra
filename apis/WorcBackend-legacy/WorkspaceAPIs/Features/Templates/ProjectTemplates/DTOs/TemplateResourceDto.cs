namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a resource file linked to a specific project template version.
/// </summary>
public class TemplateResourceDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the resource.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the uploaded file. Maximum length is 255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the file extension of the uploaded resource (e.g., "txt", "json").
    /// </summary>
    public required string Extension { get; set; }

    /// <summary>
    /// Gets or sets the file size in bytes.
    /// </summary>
    public long Size { get; set; }

    /// <summary>
    /// Gets or sets the URL or local path pointing to the uploaded or external resource.
    /// </summary>
    public required string Path { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the associated project template.
    /// </summary>
    public Guid ProjectTemplateId { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the block is disabled.
    /// </summary>
    /// <remarks>
    /// Note: This property is nullable to allow differentiation between true, false, and unspecified (null) states.
    /// </remarks>
    public bool? IsDisabled { get; set; }
}
