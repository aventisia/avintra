namespace WorkspaceAPIs.Services;

/// <summary>
/// Enforces the tenant's credit balance before a Runner job is dispatched or started.
/// Reads the read-only TenantCredits projection from AccountsDb, so the gate behaves
/// identically in request, trigger, hub and background/scheduler contexts (none of which
/// can rely on an end-user access token to call AccountsAPIs over HTTP).
/// </summary>
public interface ICreditGateService
{
    /// <summary>
    /// Determines whether the tenant currently has enough credits to dispatch a Runner job.
    /// </summary>
    /// <remarks>
    /// Enterprise (non-commercial) tenants are not credit-metered and are always treated as
    /// having sufficient credits. When the balance cannot be read the gate fails closed, so a
    /// job that could not be evaluated is never dispatched.
    /// </remarks>
    /// <param name="tenantId">The tenant that owns the job being dispatched.</param>
    /// <returns><c>true</c> when the job may be dispatched; otherwise <c>false</c>.</returns>
    Task<bool> HasSufficientCreditsAsync(Guid tenantId);

    /// <summary>
    /// Moves a job to the terminal <see cref="JobStatusEnum.Canceled"/> status because the
    /// tenant has insufficient credits.
    /// </summary>
    /// <remarks>
    /// This only mutates the in-memory entity. The caller is responsible for inserting or
    /// updating and saving the job so the cancellation is persisted.
    /// </remarks>
    /// <param name="job">The job to cancel.</param>
    void CancelForInsufficientCredits(Job job);
}
