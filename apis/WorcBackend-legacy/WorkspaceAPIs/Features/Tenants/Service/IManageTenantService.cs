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
}