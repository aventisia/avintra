namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents folder data returned by folder APIs.
/// </summary>
public class FoldersTableRowDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the folder.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the folder.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the folder.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the palette color key of the folder, or null when none was chosen.
    /// </summary>
    public string? Color { get; set; }

    /// <summary>
    /// Gets or sets the number of agents assigned to the folder, including archived agents and agents the caller cannot see.
    /// </summary>
    public int FlowCount { get; set; }

    /// <summary>
    /// Gets or sets the full name of the user who created the folder.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the folder was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }
}
