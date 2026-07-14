namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the payload used to synchronize flow versions on a machine.
/// </summary>
public class UpdateMachineFlowVersionsDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the machine.
    /// </summary>
    [RequiredGuid]
    public required Guid MachineId { get; set; }

    /// <summary>
    /// Gets or sets the final set of flow version identifiers that should remain assigned to the machine.
    /// </summary>
    public required IEnumerable<Guid> FlowVersionIds { get; set; }
}