namespace WorkspaceAPIs.DTOs;

/// <summary>
/// A static class that manages a collection of machines and their status information.
/// </summary>
public static class MachineStore
{
    /// <summary>
    /// A dictionary that stores machine statuses, indexed by their unique connection identifiers.
    /// </summary>
    public static Dictionary<Guid, MachineStatusDto> Machines = new();
}

public class MachineStatusDto
{
    /// <summary>
    /// The unique identifier for the machine.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// The status of the machine (e.g., Online, Offline, Running, Idle).
    /// </summary>
    public MachineStatusTypeEnum Status { get; set; }

    /// <summary>
    /// The timestamp of when the machine's status was last updated.
    /// </summary>
    public DateTimeOffset LastUpdated { get; set; }
}