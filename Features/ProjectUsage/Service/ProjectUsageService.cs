namespace WorkspaceAPIs.Services;

public class ProjectUsageService : IProjectUsageService
{
    private readonly ILogger<ProjectUsageService> _logger;
    private readonly WorkspaceInternalDbContext _dbContext;

    public ProjectUsageService(
        ILogger<ProjectUsageService> logger,
        WorkspaceInternalDbContext dbContext)
    {
        _logger = logger;
        _dbContext = dbContext;
    }

    /// <summary>
    /// Retrieves aggregated usage metrics for the project from the previous day,
    /// including published flows, executed jobs, and total execution time.
    /// </summary>
    public async Task<ServiceResponse<ProjectUsageMetricDto>> GetUsageSummaryAsync()
    {
        // Initialize response with a default failure state
        var serviceResponse = new ServiceResponse<ProjectUsageMetricDto>
        {
            Data = null,
            Message = "Unable to retrieve project usage metrics at this time."
        };

        try
        {
            // Get yesterday's date in UTC (date only)
            var previousDay = DateTimeOffset.UtcNow.AddDays(-1).Date;

            _logger.LogInformation("Starting retrieval of project usage metrics for date: {Date}", previousDay);

            // Retrieve count of flows published on the previous day
            var publishedFlowCount = await _dbContext.FlowVersions
                .Where(w => w.IsPublished && w.LastModifiedOn.Date == previousDay)
                .CountAsync();

            _logger.LogInformation("Published flows for {Date}: {Count}", previousDay, publishedFlowCount);

            // Query for completed jobs from the previous day
            var completedJobsQuery = _dbContext.Jobs
                .Where(w =>
                    w.Status != JobStatusTypesEnum.Created &&
                    w.Status != JobStatusTypesEnum.Running &&
                    w.StartTime != null &&
                    w.EndTime != null &&
                    w.EndTime.Value.Date == previousDay);

            // Retrieve executed job count
            var executedJobCount = await completedJobsQuery.CountAsync();

            _logger.LogInformation("Executed jobs for {Date}: {Count}", previousDay, executedJobCount);

            // Calculate total execution time (in seconds) for completed jobs
            var totalJobExecutionTimeInSeconds = await completedJobsQuery
                .SumAsync(w => (w.EndTime!.Value - w.StartTime!.Value).TotalSeconds);

            _logger.LogInformation("Total job execution time for {Date}: {Seconds} seconds", previousDay, totalJobExecutionTimeInSeconds);

            // Populate successful response
            serviceResponse.Data = new ProjectUsageMetricDto
            {
                PublishedAgents = publishedFlowCount,
                JobsExecuted = executedJobCount,
                TotalExecutionTime = totalJobExecutionTimeInSeconds
            };
            serviceResponse.StatusCode = 200;

            serviceResponse.Message = "Project usage metrics retrieved successfully.";

            _logger.LogInformation(
                "Project usage metrics successfully computed and returned for {Date}",
                previousDay);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve project usage metrics due to an unexpected error.");
        }

        return serviceResponse;
    }
}
