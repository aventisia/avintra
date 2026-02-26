namespace WorkspaceAPIs.DTOs;

public class FlowVersionHistoryDto
{
    /// <summary>
    /// Gets or sets the unique identifier of this flow version history entry.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the related flow version.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the version number of the flow.
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the parent flow.
    /// </summary>
    public Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the name of the parent flow.
    /// </summary>
    public string? FlowName { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user who created this history entry.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created this history entry.
    /// </summary>
    public string? CreatedByUsername { get; set; }

    /// <summary>
    /// Gets or sets the date and time when this history entry was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the initials of the user who created this history entry.
    /// </summary>
    public string? CreatedByUserInitials { get; set; }
}