namespace WorkspaceAPIs.Services;

public class JobExecutionLogService : IJobExecutionLogService
{
    private readonly ILogger<JobExecutionLogService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INodeExecutionLogService _nodeExecutionLogService;
    private readonly EnvironmentConfig _environmentConfig;

    public JobExecutionLogService(
        ILogger<JobExecutionLogService> logger,
        IUnitOfWork unitOfWork,
        INodeExecutionLogService nodeExecutionLogService,
        EnvironmentConfig environmentConfig)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _nodeExecutionLogService = nodeExecutionLogService;
        _environmentConfig = environmentConfig;
    }

    // Get all job execution logs for a specific FlowVersionId
    public async Task<ServiceResponse<IEnumerable<JobExecutionLogDto>>> GetLogsByFlowVersionAsync(Guid flowVersionId)
    {
        // Default response setup (failure case)
        var serviceResponse = new ServiceResponse<IEnumerable<JobExecutionLogDto>>
        {
            Data = null,
            Message = "Failed to retrieve execution logs. Please try again."
        };

        try
        {
            // Query job logs filtered by FlowVersionId
            var earliestReadable = HistoryRetentionHelpers.GetEarliestReadableDate(_environmentConfig);
            var jobExecutionLogs = await _unitOfWork.JobRepo
                .GetByConditionAsync(j => j.FlowVersionId == flowVersionId && j.CreatedOn >= earliestReadable)
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.Flow)
                .OrderByDescending(o => o.CreatedOn)
                .ProjectToType<JobExecutionLogDto>()
                .ToListAsync();

            // Success response
            serviceResponse.Data = jobExecutionLogs;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Execution logs retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log error with exception details
            _logger.LogError(ex, "Failed to get job logs for FlowVersionId: {FlowVersionId}", flowVersionId);
        }

        // Return final response
        return serviceResponse;
    }

    // Get detailed information for a specific JobId
    public async Task<ServiceResponse<JobExecutionLogDetailDto>> GetLogDetailAsync(Guid jobId)
    {
        // Default response setup (failure case)
        var serviceResponse = new ServiceResponse<JobExecutionLogDetailDto>
        {
            Data = null,
            Message = "Failed to retrieve execution log detail. Please try again."
        };

        try
        {
            // Query job log by JobId
            var earliestReadable = HistoryRetentionHelpers.GetEarliestReadableDate(_environmentConfig);
            var jobExecutionLogDetail = await _unitOfWork.JobRepo
                .GetByConditionAsync(w => w.Id == jobId && w.CreatedOn >= earliestReadable)
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.Flow)
                .ProjectToType<JobExecutionLogDetailDto>()
                .SingleOrDefaultAsync();

            // Check if job not found
            if (jobExecutionLogDetail == null)
            {
                _logger.LogWarning("Job log not found for JobId: {JobId}", jobId);

                // Return 404 response
                serviceResponse.Message = "Execution log not found.";
                return serviceResponse;
            }

            // Retrieve per-node execution logs from the isolated log table.
            var nodeLogsResponse = await _nodeExecutionLogService.GetNodeExecutionLogsAsync(jobId);
            jobExecutionLogDetail.NodeExecutionLogs = nodeLogsResponse.Data ?? [];

            // Success response
            serviceResponse.Data = jobExecutionLogDetail;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Execution log detail retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log error with exception details
            _logger.LogError(ex, "Failed to get job details for JobId: {JobId}", jobId);
        }

        // Return final response
        return serviceResponse;
    }

    // Get run counts, outcomes, and average duration for an agent across all its versions
    public async Task<ServiceResponse<AgentRunActivityDto>> GetRunActivityAsync(Guid flowId, int days, int utcOffsetMinutes)
    {
        var serviceResponse = ServiceResponse<AgentRunActivityDto>.Create("Failed to retrieve run activity. Please try again.", 500);

        try
        {
            var windowDays = JobRunActivityHelpers.ClampDays(days);
            var offsetMinutes = JobRunActivityHelpers.ClampUtcOffsetMinutes(utcOffsetMinutes);
            var windowStart = JobRunActivityHelpers.GetWindowStart(windowDays, offsetMinutes);
            var earliestReadable = HistoryRetentionHelpers.GetEarliestReadableDate(_environmentConfig);
            var readableFrom = (windowStart > earliestReadable ? windowStart : earliestReadable).ToUniversalTime();

            var jobRuns = await _unitOfWork.JobRepo
                .GetByConditionAsync(j => j.FlowVersion.FlowId == flowId && j.CreatedOn >= readableFrom)
                .Select(j => new JobRunSample(j.CreatedOn, j.Status, j.StartTime, j.EndTime))
                .ToListAsync();

            var activity = JobRunActivityHelpers.Build(jobRuns, windowDays, offsetMinutes);
            serviceResponse.Update("Run activity retrieved successfully.", 200, activity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get run activity for FlowId: {FlowId}", flowId);
        }

        return serviceResponse;
    }
}