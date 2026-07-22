namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a machine search result returned by the search by query endpoint.
/// </summary>
public class MachineSearchResultDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the machine.
    /// </summary>
    public Guid MachineId { get; set; }

    /// <summary>
    /// Gets or sets the unique name of the machine.
    /// </summary>
    public required string MachineName { get; set; }

    /// <summary>
    /// Gets or sets the status of the machine.
    /// </summary>
    public MachineStatusEnum Status { get; set; }
}
