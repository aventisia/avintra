namespace WorkspaceAPIs.DTOs;

/// <summary>
/// A static class that acts as a store for managing machine statuses.
/// </summary>
public static class MachineStore
{
    /// <summary>
    /// A dictionary that stores the status information of each machine.
    /// </summary>
    public static Dictionary<Guid, MachineStatusDto> Machines = new();


    // Adds or updates the status of a machine in the store. If the machine already exists, its status is updated. Otherwise, a new machine status is added.
    public static void AddOrUpdateMachineStatus(MachineStatusDto machineStatusDto)
    {
        // If the machine exists, update its status
        if (Machines.ContainsKey(machineStatusDto.MachineId))
        {
            Machines[machineStatusDto.MachineId] = machineStatusDto;
        }
        else
        {
            // Add a new machine status
            Machines.Add(machineStatusDto.MachineId, machineStatusDto);
        }
    }

    // Removes a machine from the store based on its unique MachineId.
    public static bool RemoveMachine(Guid machineId)
    {
        // Check if the machine exists in the store
        if (Machines.ContainsKey(machineId))
        {
            // Remove the machine from the dictionary
            Machines.Remove(machineId);
            return true;
        }

        // Return false if the machine doesn't exist
        return false;
    }

    // Retrieves the status of a machine by its unique machine identifier.
    public static MachineStatusTypeEnum? GetMachineStatusById(Guid machineId)
    {
        // Try to get the machine status from the dictionary
        Machines.TryGetValue(machineId, out var machineStatusDto);
        return machineStatusDto.Status;
    }
}

/// <summary>
/// Represents the status of a machine within the system. machine-specific information such as its identifier,its associated agent's identifier, current status, and the last update timestamp.
/// </summary>
public class MachineStatusDto
{
    /// <summary>
    /// The unique identifier for the machine.
    /// </summary>
    public Guid MachineId { get; set; }

    /// <summary>
    /// The unique identifier for the agent managing the machine.
    /// </summary>
    public Guid? AgentId { get; set; }

    /// <summary>
    /// The current operational status of the machine. Possible statuses may include Online, Offline, Running, Idle, etc.
    /// </summary>
    public MachineStatusTypeEnum Status { get; set; }

    /// <summary>
    /// The timestamp indicating when the machine's status was last updated.
    /// </summary>
    public DateTimeOffset LastUpdated { get; set; }
}