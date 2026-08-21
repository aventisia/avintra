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

    // Retrieves aggregated usage metrics for the project over the last 7 days, including published flows, executed jobs, and total execution time for each day.
    public async Task<ServiceResponse<List<ProjectUsageMetricDto>>> GetUsageSummaryAsync()
    {
        // Initialize response with a default failure state
        var serviceResponse = new ServiceResponse<List<ProjectUsageMetricDto>>
        {
            Data = null,
            Message = "Unable to retrieve project usage metrics at this time."
        };

        try
        {
            // Get yesterday's date in UTC (date only) and the date 7 days ago
            var previousDay = DateTimeOffset.UtcNow.AddDays(-1).Date;
            var sevenDaysAgo = DateTimeOffset.UtcNow.AddDays(-7).Date;

            // Initialize the list to hold 7 days of usage data
            var last7DayUsageMetrics = new List<ProjectUsageMetricDto>();

            // Query for published flows and executed jobs in the last 7 days
            var publishedFlowCountQuery = _dbContext.FlowVersions
                 .Where(w => w.IsPublished);

            // var publishedFlowCountQuery = _dbContext.FlowVersions
            //     .Where(w => w.IsPublished && w.LastModifiedOn.Date >= sevenDaysAgo && w.LastModifiedOn.Date <= previousDay);

            var completedJobsQuery = _dbContext.Jobs
                .Where(w =>
                    w.Status != JobStatusEnum.Created &&
                    w.Status != JobStatusEnum.Running &&
                    w.StartTime != null &&
                    w.EndTime != null &&
                    w.EndTime.Value.Date >= sevenDaysAgo &&
                    w.EndTime.Value.Date <= previousDay);

            // Loop through the last 7 days and fetch the metrics for each day
            for (int i = 0; i < 7; i++)
            {
                var currentDate = sevenDaysAgo.AddDays(i);

                // Calculate the number of published flows for this day
                var publishedFlowsForDay = await publishedFlowCountQuery
                    .Where(w => w.LastModifiedOn.Date <= currentDate)
                    .CountAsync();

                // Query for jobs executed on this day
                var executedJobsForDayQuery = completedJobsQuery
                    .Where(w => w.EndTime != null && w.EndTime.Value.Date == currentDate);

                // Count the number of jobs executed on this day
                var executedJobsForDay = await executedJobsForDayQuery.CountAsync();

                // Calculate the total execution time for jobs executed on this day
                var totalExecutionTimeForDayInSeconds = await executedJobsForDayQuery
                    .SumAsync(w => (w.EndTime!.Value - w.StartTime!.Value).TotalSeconds);

                // Create a metric entry for this day
                var dayMetric = new ProjectUsageMetricDto
                {
                    Date = currentDate,
                    PublishedAgents = publishedFlowsForDay,
                    JobsExecuted = executedJobsForDay,
                    TotalExecutionTime = totalExecutionTimeForDayInSeconds
                };

                // Add the day's metric to the list
                last7DayUsageMetrics.Add(dayMetric);
            }

            // Assign the collected data to the response
            serviceResponse.Data = last7DayUsageMetrics;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Project usage metrics for the last 7 days retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log any error that occurs during the retrieval of metrics
            _logger.LogError(ex, "Failed to retrieve project usage metrics due to an unexpected error.");
            serviceResponse.Message = "An error occurred while retrieving project usage metrics.";
        }

        // Return the service response, whether successful or containing an error message
        return serviceResponse;
    }
}
