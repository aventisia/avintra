namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Stateless helpers for binding and assigning jobs to machines.
/// </summary>
public static class JobsAssignmentHelpers
{
    // Execution locations that do not identify a specific machine.
    private const string CloudExecutionLocation = "Cloud";
    private const string WebServerExecutionLocation = "Web Server";

    /// <summary>
    /// Returns true when the execution location does not identify a specific machine
    /// (empty, "Cloud" or "Web Server"), meaning the job should stay unassigned.
    /// </summary>
    public static bool IsUnassignedExecutionLocation(string? executionLocation)
        => string.IsNullOrWhiteSpace(executionLocation)
           || executionLocation.Equals(CloudExecutionLocation, StringComparison.OrdinalIgnoreCase)
           || executionLocation.Equals(WebServerExecutionLocation, StringComparison.OrdinalIgnoreCase);

    /// <summary>
    /// Attempts to read the execution location as a machine id. Returns false for empty
    /// values, the "Cloud"/"Web Server" sentinels, and any non-Guid value.
    /// </summary>
    public static bool TryParseMachineId(string? executionLocation, out Guid machineId)
    {
        machineId = Guid.Empty;
        if (IsUnassignedExecutionLocation(executionLocation))
            return false;

        return Guid.TryParse(executionLocation, out machineId) && machineId != Guid.Empty;
    }

    /// <summary>
    /// Deterministically selects the machine an unassigned job should run on: the lowest
    /// <see cref="ClientDataStore.ClientId"/> among the machines mapped to the job's flow version
    /// that are online/idle and are not already holding a live pending job. Returns null when no
    /// eligible machine exists, in which case the job stays unassigned.
    /// </summary>
    public static ClientDataStore? SelectDeterministicTargetMachine(
        IEnumerable<Guid> mappedMachineIds,
        IEnumerable<ClientDataStore> availableMachines,
        ISet<Guid> machineIdsWithLivePendingJob)
    {
        var mapped = mappedMachineIds.ToHashSet();
        ClientDataStore? selected = null;

        foreach (var machine in availableMachines)
        {
            // Only machines mapped to this flow version and currently available.
            if (!mapped.Contains(machine.ClientId))
                continue;

            if (machine.Status != MachineStatusEnum.Online && machine.Status != MachineStatusEnum.Idle)
                continue;

            if (machineIdsWithLivePendingJob.Contains(machine.ClientId))
                continue;

            // Lowest machine id wins so the choice is stable across concurrent callers.
            if (selected == null || machine.ClientId.CompareTo(selected.ClientId) < 0)
                selected = machine;
        }

        return selected;
    }
}
