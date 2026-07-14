namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Composite key payload for a Machine_FlowVersion relation.
/// </summary>
public class MachineFlowKeyDto
{
    /// <summary>
    /// Gets or sets Id of the machine.
    /// </summary>
    [RequiredGuid]
    public required Guid MachineId { get; set; }

    /// <summary>
    /// Gets or sets Id of the flow version.
    /// </summary>
    [RequiredGuid]
    public required Guid FlowVersionId { get; set; }
}