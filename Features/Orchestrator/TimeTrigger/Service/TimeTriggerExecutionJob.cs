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
    public async Task Execute(IJobExecutionContext context)
    {
        try
        {
            // Get current UTC time
            var now = DateTimeOffset.UtcNow;

            _logger.LogInformation($"Job started at {now:O}");

            // Define the current minute window
            var startOfMinute = now.Date.AddHours(now.Hour).AddMinutes(now.Minute);
            var endOfMinute = startOfMinute.AddMinutes(1);

            // Retrieve triggers that should fire during this minute
            var triggers = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w =>
                    w.NextTriggerTime >= startOfMinute && w.NextTriggerTime < endOfMinute &&
                    w.EffectiveDate.Date <= now.Date &&
                    (w.EndDate == null || w.EndDate >= now.Date)
                )
                .ToListAsync();

            // Log the number of triggers found
            _logger.LogInformation($"Found {triggers.Count} triggers for execution at {now:O}");

            // Process each trigger
            foreach (var trigger in triggers)
            {
                // Log trigger execution
                _logger.LogInformation($"Executing Trigger: {trigger.Name} (ID: {trigger.Id})");

                // Process each linked flow version
                foreach (var triggersFlowVersion in trigger.TimeTriggerFlowVersions)
                {
                    // Log execution of each flow version
                    _logger.LogInformation($"Executing FlowVersion {triggersFlowVersion.FlowVersionId} for Trigger {trigger.Name}");
                    // TODO: Add actual execution logic here
                }

                // Update trigger last executed time and compute next trigger time
                trigger.LastTriggeredTime = DateTimeOffset.UtcNow;
                trigger.NextTriggerTime = CronScheduleUtil.ComputeNextTriggerUtc(
                    trigger.CronExpression,
                    trigger.EffectiveDate,
                    trigger.ExceptionHours,
                    trigger.ExceptionWeekdays,
                    trigger.ExceptionDates);

                // Log next trigger time
                _logger.LogInformation($"Next Trigger Time for {trigger.Name}: {trigger.NextTriggerTime:O}");

                // Update trigger in the database
                _unitOfWork.TriggerRepo.Update(trigger);
            }

            // Save changes to the database
            if (await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save trigger updates to the database.");
            }

            _logger.LogInformation($"Job completed successfully at {now:O}");
        }

        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during the trigger execution job.");
        }
    }
}