namespace WorkspaceAPIs.Services;

public interface IProjectUsageService
{
    /// <summary>
    /// Retrieves and aggregates usage metrics for the active project.
    /// </summary>
    /// <returns>
    /// A <see cref="ServiceResponse{ProjectUsageMetricDto}"/> with summarized project usage metrics.
    /// </returns>
    Task<ServiceResponse<ProjectUsageMetricDto>> GetUsageSummaryAsync();
}