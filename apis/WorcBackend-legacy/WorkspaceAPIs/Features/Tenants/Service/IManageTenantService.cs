namespace WorkspaceAPIs.Services;

public interface IManageTenantService
{
    /// <summary>
    /// Deletes a tenant identified by its ID, typically passed in the request headers.
    /// </summary>
    /// <returns>A task representing the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteTenantAsync();

    /// <summary>
    /// Gets tenant job summary (execution time and published agents).
    /// </summary>
    /// <param name="startDate">Start date (optional).</param>
    /// <param name="endDate">End date (optional).</param>
    /// <returns>List of tenant summaries.</returns>
    Task<ServiceResponse<IEnumerable<TenantTableSummaryDto>>> GetTenantJobSummaryAsync(DateTimeOffset? startDate, DateTimeOffset? endDate);

    /// <summary>
    /// Gets the list of published agents for a specific tenant along with usage metrics.
    /// </summary>
    /// <param name="tenantId">The tenant ID to fetch published agents for.</param>
    /// <returns>List of published agents for the tenant.</returns>
    Task<ServiceResponse<IEnumerable<TenantPublishedAgentDto>>> GetTenantPublishedAgentsAsync(Guid tenantId);

    /// <summary>
    /// Sets the fixed credits limit for a published agent (flow version).
    /// </summary>
    /// <param name="flowVersionId">The flow version (agent) ID.</param>
    /// <param name="fixedCredits">The fixed credits limit to set. Null clears the limit.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task<ServiceResponse<bool>> SetFixedCreditsAsync(Guid flowVersionId, double? fixedCredits);
}