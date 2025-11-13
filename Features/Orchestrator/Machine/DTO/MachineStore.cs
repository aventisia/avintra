namespace WorkspaceAPIs.DTOs;

/// <summary>
/// A static class that manages a collection of machines and their status information.
/// </summary>
public static class MachineStore
{
    /// <summary>
    /// A dictionary that stores machine statuses, indexed by their unique connection identifiers.
    /// </summary>
    public static Dictionary<Guid, MachineDto> Machines = new();
}
