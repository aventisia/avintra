namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the outcome of replacing the flows assigned to a resource.
/// </summary>
public class AssignResourceFlowsResultDto
{
    /// <summary>
    /// Gets or sets the number of flows newly assigned.
    /// </summary>
    public int AssignedCount { get; set; }

    /// <summary>
    /// Gets or sets the number of flows removed from the assignment.
    /// </summary>
    public int RemovedCount { get; set; }

    /// <summary>
    /// Gets or sets the names of published flows that use the resource but are not assigned and will fail to republish.
    /// </summary>
    public IEnumerable<string> UnassignedPublishedFlows { get; set; } = Array.Empty<string>();
}
