namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Stateless helpers shared by the dispatch paths (scheduler, poll, hub-connect) for pending-job claims and marker release.
/// </summary>
public static class PendingJobClaimHelpers
{
    /// <summary>
    /// Returns true when the job is not bound to any machine yet (null or empty machine id).
    /// </summary>
    public static bool IsUnassignedMachineId(Guid? machineId)
        => machineId is null || machineId.Value == Guid.Empty;

    /// <summary>
    /// Clears the machine's pending-job marker, but only while it still refers to the given job, so a marker that another dispatch already replaced is never clobbered.
    /// </summary>
    public static bool ReleaseIfHeldBy(ClientDataStore? machine, Guid jobId)
    {
        if (machine is null || machine.JobId != jobId)
            return false;

        MachineReservationHelpers.Release(machine);
        return true;
    }
}
