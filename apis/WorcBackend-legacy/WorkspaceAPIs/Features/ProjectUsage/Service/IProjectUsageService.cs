namespace WorkspaceAPIs.Services;

public interface IProjectUsageService
{
    /// <summary>
    /// Retrieves and aggregates usage metrics for the current project.
    /// </summary>
    /// <returns>
    /// A <see cref="ServiceResponse{List{ProjectUsageMetricDto}}"/> containing the aggregated usage metrics for the project.
    /// </returns>
    Task<ServiceResponse<List<ProjectUsageMetricDto>>> GetUsageSummaryAsync();
}