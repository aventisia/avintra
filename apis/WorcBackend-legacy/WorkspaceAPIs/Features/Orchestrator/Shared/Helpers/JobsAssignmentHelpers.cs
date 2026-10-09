namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Stateless helpers for binding and assigning jobs to machines.
/// </summary>
public static class JobsAssignmentHelpers
{
    private const string CloudExecutionLocation = "Cloud";
    private const string WebServerExecutionLocation = "Web Server";

    /// <summary>
    /// Returns true when the execution location does not identify a specific machine (empty, "Cloud" or "Web Server").
    /// </summary>
    public static bool IsUnassignedExecutionLocation(string? executionLocation)
        => string.IsNullOrWhiteSpace(executionLocation)
           || executionLocation.Equals(CloudExecutionLocation, StringComparison.OrdinalIgnoreCase)
           || executionLocation.Equals(WebServerExecutionLocation, StringComparison.OrdinalIgnoreCase);

    /// <summary>
    /// Returns true when the execution location explicitly requests cloud execution.
    /// </summary>
    public static bool IsCloudExecutionLocation(string? executionLocation)
        => !string.IsNullOrWhiteSpace(executionLocation)
           && executionLocation.Trim().Equals(CloudExecutionLocation, StringComparison.OrdinalIgnoreCase);

    /// <summary>
    /// Returns true when the agent's <c>SupportedPlatform</c> excludes cloud execution; a null/empty value is treated as unsupported.
    /// </summary>
    public static bool IsCloudExecutionUnsupported(string? supportedPlatform)
        => string.IsNullOrWhiteSpace(supportedPlatform)
           || !supportedPlatform
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Any(IsCloudExecutionLocation);

    /// <summary>
    /// Deterministically selects the lowest-id online/idle machine mapped to the job's flow version that is not holding a live pending job, or null when none is eligible.
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
            if (!mapped.Contains(machine.ClientId))
                continue;

            if (machine.Status != MachineStatusEnum.Online && machine.Status != MachineStatusEnum.Idle)
                continue;

            if (machineIdsWithLivePendingJob.Contains(machine.ClientId))
                continue;

            if (selected == null || machine.ClientId.CompareTo(selected.ClientId) < 0)
                selected = machine;
        }

        return selected;
    }
}
