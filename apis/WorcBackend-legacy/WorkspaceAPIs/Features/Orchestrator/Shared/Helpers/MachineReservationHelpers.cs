namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Stateless helpers for reserving and releasing a machine's pending-job marker.
/// </summary>
public static class MachineReservationHelpers
{
    /// <summary>
    /// Marks the machine as holding a dispatched-but-not-started job so other dispatchers skip it.
    /// </summary>
    public static void Reserve(ClientDataStore machine, Guid jobId, Guid flowVersionId)
    {
        machine.JobId = jobId;
        machine.AgentId = flowVersionId;
        machine.LastSeen = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Clears the machine's pending-job marker so it becomes eligible for dispatch again.
    /// </summary>
    public static void Release(ClientDataStore machine)
    {
        machine.JobId = null;
        machine.AgentId = null;
        machine.LastSeen = DateTimeOffset.UtcNow;
    }
}
