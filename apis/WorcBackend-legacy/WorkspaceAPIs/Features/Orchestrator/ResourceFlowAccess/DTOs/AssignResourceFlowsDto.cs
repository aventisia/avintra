namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a request to replace the complete set of flows assigned to a resource.
/// </summary>
public class AssignResourceFlowsDto
{
    /// <summary>
    /// Gets or sets the type of resource.
    /// </summary>
    public required ResourceTypeEnum ResourceType { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the resource.
    /// </summary>
    [RequiredGuid]
    public required Guid ResourceId { get; set; }

    /// <summary>
    /// Gets or sets the complete set of flow identifiers to assign; an empty set removes all.
    /// </summary>
    public required IEnumerable<Guid> FlowIds { get; set; }
}
