namespace WorkspaceAPIs.Services;

public class TriggerWebhookService : ITriggerWebhookService
{
    private readonly ILogger<TriggerWebhookService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJobsExecutorService _jobsExecutorService;

    public TriggerWebhookService(
        ILogger<TriggerWebhookService> logger,
        IUnitOfWork unitOfWork,
        IJobsExecutorService jobsExecutorService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _jobsExecutorService = jobsExecutorService;
    }

    // Creates jobs for all flow versions associated with the given trigger ID.
    public async Task<ServiceResponse<bool>> CreateJobByTriggerIdAsync(string triggerId)
    {
        // Default failure response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to create job(s) from trigger. Please try again."
        };

        try
        {
            // Validate triggerId as GUID
            if (!Guid.TryParse(triggerId, out var triggerGuid) || triggerGuid == Guid.Empty)
            {
                _logger.LogWarning("Invalid triggerId received: {TriggerId}", triggerId);
                serviceResponse.Message = "Invalid triggerId provided.";
                return serviceResponse;
            }

            // Retrieve trigger along with its flow versions
            var trigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(x => x.Id == triggerGuid)
                .Include(i => i.TriggerFlowVersions)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            // Trigger not found
            if (trigger == null)
            {
                _logger.LogWarning("Trigger not found for id: {TriggerId}", triggerId);
                serviceResponse.Message = $"No trigger found for id: {triggerId}";
                return serviceResponse;
            }

            var triggerFlowVersions = trigger.TriggerFlowVersions?.ToList();

            // No flow versions mapped to trigger
            if (triggerFlowVersions == null || !triggerFlowVersions.Any())
            {
                _logger.LogWarning("No flow versions found for triggerId: {TriggerId}", triggerId);
                serviceResponse.Message = "No flow versions configured for this trigger.";
                return serviceResponse;
            }

            // Create jobs for each associated flow version
            foreach (var triggerFlowVersion in triggerFlowVersions)
            {
                // Skip invalid entries
                if (triggerFlowVersion.FlowVersion == null)
                {
                    _logger.LogWarning("Skipping invalid FlowVersionId for triggerId: {TriggerId}", triggerId);
                    continue;
                }

                // Convert the incoming request into a new Job entity
                var newJob = new Job()
                {
                    TenantId = triggerFlowVersion.TenantId,
                    FlowVersionId = triggerFlowVersion.FlowVersionId,
                    TriggerType = trigger.TriggerType,
                    MachineId = null,
                    Priority = JobPriorityTypesEnum.Normal,
                    Status = JobStatusTypesEnum.Created,
                    CreatedOn = DateTimeOffset.UtcNow,
                    IsPublished = triggerFlowVersion.FlowVersion.IsPublished,
                };

                // Insert the new job into the repository
                await _unitOfWork.JobRepo.InsertAsync(newJob);

                // Check if changes were successfully saved
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("Failed to save changes while inserting new job.");
                    return serviceResponse;
                }

                // If the flow version is published, trigger the job execution.
                if (newJob.IsPublished)
                {
                    // Execute the job asynchronously.
                    await _jobsExecutorService.ExecuteJobCommandAsync(newJob);
                }
            }

            // Success (even if partial)
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Job(s) created successfully from trigger.";
        }
        catch (Exception ex)
        {
            // ❌ Unexpected error
            _logger.LogError(ex, "Error creating job(s) from triggerId: {TriggerId}", triggerId);
        }

        return serviceResponse;
    }
}