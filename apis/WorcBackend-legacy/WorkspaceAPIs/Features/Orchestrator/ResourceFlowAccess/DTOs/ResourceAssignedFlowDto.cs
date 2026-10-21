namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for a flow assigned to a resource.
/// </summary>
public class ResourceAssignedFlowDto
{
    /// <summary>
    /// Gets or sets Id of the flow.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the type of the flow.
    /// </summary>
    public FlowTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the number of non-archived versions of the flow.
    /// </summary>
    public int VersionCount { get; set; }

    /// <summary>
    /// Gets or sets the latest modification time across the flow and its versions.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
