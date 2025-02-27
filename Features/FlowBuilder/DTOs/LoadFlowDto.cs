namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the data transfer object for loading flow properties when a user opens a flow in the studio.
/// </summary>
public class LoadFlowDto
{
    /// <summary>
    /// Gets or sets the primary key of the flow record.
    /// </summary>
    public Guid Id { get; set; }

    // <summary>
    /// Gets or sets the version ID of the flow.
    /// </summary>
    public Guid? VersionId { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the flow's nodes, edges, and viewport JSON data in string format
    /// </summary>
    public string? ReactFlowObject { get; set; }
}
