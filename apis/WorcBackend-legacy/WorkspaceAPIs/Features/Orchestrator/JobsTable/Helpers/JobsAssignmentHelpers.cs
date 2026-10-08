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
    /// Returns true when the execution location explicitly requests cloud execution.
    /// </summary>
    public static bool IsCloudExecutionLocation(string? executionLocation)
        => !string.IsNullOrWhiteSpace(executionLocation)
           && executionLocation.Trim().Equals(CloudExecutionLocation, StringComparison.OrdinalIgnoreCase);

    /// <summary>
    /// Returns true when the agent's <c>SupportedPlatform</c> excludes cloud execution. The value
    /// is a comma-separated list (for example "cloud" or "windows"); a null/empty value is
    /// treated as unsupported. The cloud marker matches <see cref="CloudExecutionLocation"/>.
    /// </summary>
    public static bool IsCloudExecutionUnsupported(string? supportedPlatform)
        => string.IsNullOrWhiteSpace(supportedPlatform)
           || !supportedPlatform
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Any(IsCloudExecutionLocation);

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
