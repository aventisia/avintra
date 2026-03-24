namespace WorkspaceAPIs.Jobs;

public class TimeTriggerExecutionJob : IJob
{
    private readonly WorkspaceInternalDbContext _workspaceInternalDbContext;
    private readonly ILogger<TimeTriggerExecutionJob> _logger;
    private readonly IJobsExecutorService _jobsExecutorService;
    private readonly EnvironmentConfig _environmentConfig;

    public TimeTriggerExecutionJob(WorkspaceInternalDbContext workspaceInternalDbContext, ILogger<TimeTriggerExecutionJob> logger, IJobsExecutorService jobsExecutorService, EnvironmentConfig environmentConfig)
    {
        _workspaceInternalDbContext = workspaceInternalDbContext;
        _logger = logger;
        _jobsExecutorService = jobsExecutorService;
        _environmentConfig = environmentConfig;
    }

    // Main method for Quartz job execution
    public async Task Execute(IJobExecutionContext jobExecutionContext)
    {
        try
        {
            // Get current UTC time
            var currentUtcTime = DateTimeOffset.UtcNow.ToUniversalTime();

            _logger.LogInformation($"Job started at {currentUtcTime:O}");
            // Check if execution is disabled in the current environment.
            if (_environmentConfig.OnPremExecutionDisabled)
            {
                _logger.LogError("Execution is currently disabled in this environment. Job processing cannot be performed.");
                return;
            }

            // Define the current minute time window
            var startOfCurrentMinute = new DateTimeOffset(
                currentUtcTime.Year,
                currentUtcTime.Month,
                currentUtcTime.Day,
                currentUtcTime.Hour,
                currentUtcTime.Minute,
                0,
                TimeSpan.Zero
            );

            var endOfCurrentMinute = startOfCurrentMinute.AddMinutes(1);

            // Retrieve triggers that should fire during this minute
            var triggersToExecute = await _workspaceInternalDbContext.TimeTriggers
                .Where(trigger =>
                    trigger.NextTriggerTime >= startOfCurrentMinute && trigger.NextTriggerTime < endOfCurrentMinute &&
                    trigger.EffectiveDate <= currentUtcTime &&
                    (trigger.EndDate == null || trigger.EndDate >= currentUtcTime)
                )
                .Include(i => i.TimeTriggerFlowVersions)
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
                        Id = Guid.NewGuid(),
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
                _workspaceInternalDbContext.TimeTriggers.Update(trigger);
            }

            // Check if there are any jobs created
            if (createdJobs.Any())
            {
                // Insert the created jobs into the database asynchronously using the repository's InsertAsync method.
                await _workspaceInternalDbContext.Jobs.AddRangeAsync(createdJobs);

                // Save changes to the database
                await _workspaceInternalDbContext.SaveChangesAsync();
            }

            // Check if there are any triggers that need to be executed
            if (triggersToExecute.Count != 0)
            {
                // Save changes to the database
                await _workspaceInternalDbContext.SaveChangesAsync();
            }

            _logger.LogInformation($"Job completed successfully at {currentUtcTime:O}");

            // Now execute the jobs based on their IDs
            // Execute job commands for all created jobs
            if (createdJobs.Any())
            {
                var jobIds = createdJobs.Select(s => s.Id).ToList();

                // Log the job IDs
                if (jobIds.Count != 0)
                    await _jobsExecutorService.ExecuteCommanByIdsdAsync(jobIds);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during the trigger execution job.");
        }
    }
}