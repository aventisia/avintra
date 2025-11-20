namespace WorkspaceAPIs.Jobs;

public class TimeTriggerExecutionJob : IJob
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<TimeTriggerExecutionJob> _logger;

    public TimeTriggerExecutionJob(IUnitOfWork unitOfWork, ILogger<TimeTriggerExecutionJob> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    // Main method for Quartz job execution
    public async Task Execute(IJobExecutionContext jobExecutionContext)
    {
        try
        {
            // Get current UTC time
            var currentUtcTime = DateTimeOffset.UtcNow;

            _logger.LogInformation($"Job started at {currentUtcTime:O}");

            // Define the current minute time window
            var startOfCurrentMinute = currentUtcTime.Date.AddHours(currentUtcTime.Hour).AddMinutes(currentUtcTime.Minute);
            var endOfCurrentMinute = startOfCurrentMinute.AddMinutes(1);

            // Retrieve triggers that should fire during this minute
            var triggersToExecute = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(trigger =>
                    trigger.NextTriggerTime >= startOfCurrentMinute && trigger.NextTriggerTime < endOfCurrentMinute &&
                    trigger.EffectiveDate.Date <= currentUtcTime.Date &&
                    (trigger.EndDate == null || trigger.EndDate >= currentUtcTime.Date)
                )
                .ToListAsync();

            // Log the number of triggers found
            _logger.LogInformation($"Found {triggersToExecute.Count} triggers for execution at {currentUtcTime:O}");

            var createdJobs = new List<Job>();

            // Process each trigger
            foreach (var trigger in triggersToExecute)
            {
                // Log trigger execution start
                _logger.LogInformation($"Executing Trigger: {trigger.Name} (ID: {trigger.Id})");


                foreach (var timeTriggerflowVersion in trigger.TimeTriggerFlowVersions)
                {
                    var jobToCreate = new Job()
                    {
                        TenantId = timeTriggerflowVersion.TenantId,
                        FlowVersionId = timeTriggerflowVersion.FlowVersionId,
                        TriggerType = TriggerTypesEnum.TimeTrigger,
                        RefId = timeTriggerflowVersion.TriggerId,
                        Priority = JobPriorityTypesEnum.Normal,
                        Status = JobStatusTypesEnum.Created,
                        CreatedOn = currentUtcTime,
                    };

                    createdJobs.Add(jobToCreate);

                    // Log job creation
                    _logger.LogInformation($"Job created for FlowVersionId: {timeTriggerflowVersion.FlowVersionId} and TenantId: {timeTriggerflowVersion.TenantId}");
                }

                // Update the trigger's last executed time and calculate the next trigger time
                trigger.LastTriggeredTime = DateTimeOffset.UtcNow;
                trigger.NextTriggerTime = CronScheduleUtil.ComputeNextTriggerUtc(
                    trigger.CronExpression,
                    trigger.EffectiveDate,
                    trigger.ExceptionHours,
                    trigger.ExceptionWeekdays,
                    trigger.ExceptionDates);

                // Log the next scheduled trigger time
                _logger.LogInformation($"Next Trigger Time for {trigger.Name}: {trigger.NextTriggerTime:O}");

                // Update the trigger record in the database
                _unitOfWork.TriggerRepo.Update(trigger);
            }

            // Check if there are any jobs created
            if (createdJobs.Any())
            {
                _logger.LogInformation($"Inserting {createdJobs.Count} jobs into the database.");

                // Insert the created jobs into the database asynchronously
                await _unitOfWork.JobRepo.InsertAsync(createdJobs);
            }
            else
            {
                _logger.LogInformation("No jobs to insert into the database.");
            }

            // Save changes to the database and check if successful
            if (await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save trigger updates to the database.");
            }

            _logger.LogInformation($"Job completed successfully at {currentUtcTime:O}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during the trigger execution job.");
        }
    }
}