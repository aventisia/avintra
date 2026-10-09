namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Stateless query helpers for pending-job detection across dispatch paths.
/// </summary>
public static class PendingJobHelpers
{
    /// <summary>
    /// Returns the transaction-scoped advisory lock key that serializes concurrent pending-job polls for one machine.
    /// </summary>
    public static string PendingJobPollLockKey(Guid machineId) => $"pending-job-poll:{machineId}";

    /// <summary>
    /// Returns true when the machine's pending job marker still refers to a live, un-started job assigned to that machine.
    /// </summary>
    public static Task<bool> HasLivePendingJobAsync(this IQueryable<Job> jobs, ClientDataStore? machine)
    {
        if (machine?.JobId is not Guid pendingJobId || pendingJobId == Guid.Empty)
            return Task.FromResult(false);

        return jobs.AnyAsync(w => w.Id == pendingJobId
            && w.Status == JobStatusEnum.Created
            && (w.MachineId == machine.ClientId || w.MachineId == null));
    }
}
