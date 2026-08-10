namespace WorkspaceAPIs.Services;

public interface ISpaceSummaryService
{
    /// <summary>
    /// Gets aggregated usage metrics (published agents, execution time, machines) grouped by space
    /// for the current tenant.
    /// </summary>
    /// <returns>A service response containing a list of per-space summaries.</returns>
    Task<ServiceResponse<IEnumerable<SpaceSummaryDto>>> GetSpaceSummariesAsync();
}
