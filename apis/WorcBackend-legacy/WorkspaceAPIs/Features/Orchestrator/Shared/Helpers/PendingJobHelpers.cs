namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Stateless query helpers for pending-job detection across dispatch paths.
/// </summary>
public static class PendingJobHelpers
{
    /// <summary>
    /// Time a dispatched job may stay un-started before its claim is released so the machine can be picked again.
    /// </summary>
    public static readonly TimeSpan PendingClaimTimeout = TimeSpan.FromMinutes(5);

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

        var cutoff = DateTimeOffset.UtcNow - PendingClaimTimeout;

        return jobs.AnyAsync(w => w.Id == pendingJobId
            && w.Status == JobStatusEnum.Created
            && w.MachineId == machine.ClientId
            && (w.ClaimedOn == null || w.ClaimedOn > cutoff));
    }

    /// <summary>
    /// Releases the machine's pending claim when the job was pushed more than <see cref="PendingClaimTimeout"/> ago and never started.
    /// </summary>
    /// <returns>True when the claim was released; the caller must persist the machine marker.</returns>
    public static async Task<bool> TryReleaseExpiredClaimAsync(this IQueryable<Job> jobs, ClientDataStore? machine)
    {
        if (machine?.JobId is not Guid pendingJobId || pendingJobId == Guid.Empty)
            return false;

        var cutoff = DateTimeOffset.UtcNow - PendingClaimTimeout;

        var released = await jobs
            .Where(w => w.Id == pendingJobId
                && w.Status == JobStatusEnum.Created
                && w.MachineId == machine.ClientId
                && (w.ClaimedOn == null || w.ClaimedOn <= cutoff))
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(w => w.MachineId, (Guid?)null)
                .SetProperty(w => w.ExecutedOn, (string?)null)
                .SetProperty(w => w.ClaimedOn, (DateTimeOffset?)null)
                .SetProperty(w => w.RetryCount, w => w.RetryCount + 1));

        if (released != 1)
            return false;

        return PendingJobClaimHelpers.ReleaseIfHeldBy(machine, pendingJobId);
    }

    /// <summary>
    /// Releases the machine's expired pending claim and persists the cleared marker. Returns true when a claim was released.
    /// </summary>
    public static async Task<bool> ReleaseExpiredClaimAndRefreshAsync(this IQueryable<Job> jobs, ClientDataStore? machine, IClientStatusStore clientStatusStore)
    {
        if (machine is null || !await jobs.TryReleaseExpiredClaimAsync(machine))
            return false;

        await clientStatusStore.UpdateClientStatusAsync(machine);
        return true;
    }
}
