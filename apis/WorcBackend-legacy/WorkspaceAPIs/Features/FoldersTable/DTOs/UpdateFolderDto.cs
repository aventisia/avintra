namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the payload used to update a folder.
/// </summary>
public class UpdateFolderDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the folder.
    /// </summary>
    [RequiredGuid]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the folder. Max 50 characters.
    /// </summary>
    [StringLength(50)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the folder. Max 250 characters.
    /// </summary>
    [StringLength(250)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the palette color key of the folder (e.g. "indigo"). Max 20 characters.
    /// </summary>
    [StringLength(20)]
    public string? Color { get; set; }
}
