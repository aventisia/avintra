using ExecutorLibrary.FlowProcessor;
using ExecutorLibrary.FlowProcessor.Interfaces;
using ExecutorLibrary.FlowProcessor.Models;
using ExecutorLibrary.Models;

namespace WorkspaceAPIs.Services;

public class FlowExecutionService : IFlowExecutionService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<FlowExecutionService> _logger;

    public FlowExecutionService(
        IServiceScopeFactory scopeFactory,
        ILogger<FlowExecutionService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    // Note: This method is intentionally not async and does not await the background execution task. 
    // We want the API to return immediately after starting the background execution without waiting for it to complete.
    public void StartExecution(Guid tenantId, Guid userId, Guid jobId, ReactFlowDataModel flow)
    {
        _ = Task.Run(() => ExecuteInBackgroundAsync(jobId, flow, tenantId, userId));
    }

    // This method runs the flow execution in the background and updates the job status in the database accordingly. 
    // It also handles any unhandled exceptions to ensure that the job status is updated to Failed if something goes wrong during execution.
    private async Task ExecuteInBackgroundAsync(Guid jobId, ReactFlowDataModel flow, Guid tenantId, Guid userId)
    {
        try
        {
            // Create a new scope to get scoped services for the background execution
            using var scope = _scopeFactory.CreateScope();

            // Set the current tenant in the scoped services so that we can access tenant-specific data during flow execution
            var currentTenantService = scope.ServiceProvider.GetRequiredService<ICurrentTenantService>();
            currentTenantService.CurrentTenantId = tenantId;

            // Get the unit of work to access the database
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            // Get the flow notification service to send real-time updates
            var flowNotificationService = scope.ServiceProvider.GetRequiredService<IFlowNotificationService>();

            // Get the job from the database
            var job = await unitOfWork.JobRepo.GetByConditionAsync(w => w.Id == jobId).SingleOrDefaultAsync();

            // Validate: Job not found
            if (job is null)
            {
                _logger.LogWarning("Background flow execution skipped because job was not found. JobId: {JobId}", jobId);
                return;
            }

            // Update job's metadata before starting execution
            job.Status = JobStatusTypesEnum.Running;
            job.StartTime = DateTimeOffset.UtcNow;
            unitOfWork.JobRepo.Update(job);

            // Error: Failed to save the job start status
            if (!await unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Context SaveChanges failed while updating job status to Running for background flow execution. JobId: {JobId}", jobId);
                return;
            }

            // Initialize the FlowProcessor with NodeProcessor and execute the flow
            var initialVariables = new Dictionary<string, object?>
            {
                ["UserId"] = userId.ToString(),
                ["TenantId"] = tenantId.ToString(),
                ["AccessToken"] = string.Empty,
            };

            var flowProcessor = new FlowProcessor(new NodeProcessor());
            var flowResult = await flowProcessor.ExecuteAsync(flow, initialVariables);

            // Update the job with the final status and results after execution
            job.Status = MapFlowStatusToJobStatus(flowResult.Status);
            job.EndTime = flowResult.EndTime;
            job.NodeExecutionLogs = System.Text.Json.JsonSerializer.Serialize(flowResult.NodeLogs);
            job.OutputDataJson = System.Text.Json.JsonSerializer.Serialize(flowResult);
            unitOfWork.JobRepo.Update(job);

            // Error: Failed to save the final job status and results
            if (!await unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Context SaveChanges failed while persisting final flow execution status for job. JobId: {JobId}", jobId);
            }
            else
            {
                // Send real-time notification to the user about job completion
                await flowNotificationService.NotifyExecutionCompletedAsync(userId, jobId, job.Status);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled error while running background flow execution. JobId: {JobId}", jobId);
            await MarkJobAsFailedAsync(jobId, tenantId, userId, ex.Message);
        }
    }

    // Helper: Marks the job as failed in case of unhandled exceptions during flow execution
    private async Task MarkJobAsFailedAsync(Guid jobId, Guid tenantId, Guid userId, string errorMessage)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var currentTenantService = scope.ServiceProvider.GetRequiredService<ICurrentTenantService>();
            currentTenantService.CurrentTenantId = tenantId;
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var flowNotificationService = scope.ServiceProvider.GetRequiredService<IFlowNotificationService>();

            var job = await unitOfWork.JobRepo
                .GetByConditionAsync(w => w.Id == jobId)
                .SingleOrDefaultAsync();

            if (job is null)
            {
                return;
            }

            job.Status = JobStatusTypesEnum.Failed;
            job.EndTime = DateTimeOffset.UtcNow;
            job.OutputDataJson = System.Text.Json.JsonSerializer.Serialize(new { ErrorMessage = errorMessage });

            unitOfWork.JobRepo.Update(job);
            if (await unitOfWork.SaveAsync())
            {
                // Send real-time notification to the user about job failure
                await flowNotificationService.NotifyExecutionCompletedAsync(userId, jobId, JobStatusTypesEnum.Failed, errorMessage);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update failure status for background flow execution job. JobId: {JobId}", jobId);
        }
    }

    // Helper: Maps the flow execution status to the corresponding job status
    private static JobStatusTypesEnum MapFlowStatusToJobStatus(FlowExecutionStatus status)
    {
        return status switch
        {
            FlowExecutionStatus.Completed => JobStatusTypesEnum.Completed,
            FlowExecutionStatus.Aborted => JobStatusTypesEnum.Abort, // TODO: Consider changing this to Aborted to align with FlowExecutionStatus enum naming
            _ => JobStatusTypesEnum.Failed,
        };
    }

}
