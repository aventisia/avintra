namespace WorkspaceAPIs.Services;

public class JobExecutionLogService : IJobExecutionLogService
{
    private readonly ILogger<JobExecutionLogService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INodeExecutionLogService _nodeExecutionLogService;

    public JobExecutionLogService(
        ILogger<JobExecutionLogService> logger,
        IUnitOfWork unitOfWork,
        INodeExecutionLogService nodeExecutionLogService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _nodeExecutionLogService = nodeExecutionLogService;
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
            var jobExecutionLogs = await _unitOfWork.JobRepo
                .GetByConditionAsync(j => j.FlowVersionId == flowVersionId)
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
            var jobExecutionLogDetail = await _unitOfWork.JobRepo
                .GetByConditionAsync(w => w.Id == jobId)
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
}