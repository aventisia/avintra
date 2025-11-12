using Quartz;

namespace WorkspaceAPIs.Jobs;

public class TimeTriggerExecutionJob : IJob
{
    private readonly WorkspaceDbContext _db;
    private readonly ILogger<TimeTriggerExecutionJob> _logger;

    public TimeTriggerExecutionJob(WorkspaceDbContext db, ILogger<TimeTriggerExecutionJob> logger)
    {
        _db = db;
        _logger = logger;
    }

    // Main execution method for Quartz job
    public async Task Execute(IJobExecutionContext context)
    {
        // Get the current UTC time to compare with trigger times
        var now = DateTimeOffset.UtcNow;

        // Log the start of the execution process
        _logger.LogInformation($"[INFO] Starting trigger execution job at {now:O}");

        try
        {
            var startOfMinute = now.Date.AddHours(now.Hour).AddMinutes(now.Minute);
            var endOfMinute = startOfMinute.AddMinutes(1);

            var triggers = await _db.TimeTriggers
                .Where(w =>
                    w.NextTriggerTime >= startOfMinute && w.NextTriggerTime < endOfMinute &&
                    w.EffectiveDate.Date <= now.Date &&
                    (w.EndDate == null || w.EndDate >= now.Date)
                )
                .ToListAsync();



            // extTriggerTime >= CurrentDateTime or NextTriggerTime is null) and TriggerEffectiveDate >= CurrentDate
            // Log how many triggers were found for execution
            _logger.LogInformation($"[INFO] Found {triggers.Count} triggers due for execution at {now:O}");

            // Loop over each trigger to execute them
            foreach (var trigger in triggers)
            {
                // Log the start of trigger execution
                _logger.LogInformation($"[INFO] Executing Trigger: {trigger.Name} (ID: {trigger.Id}) at {now:O}");

                // Iterate over each linked flow version for the current trigger
                foreach (var link in trigger.TimeTriggerFlowVersions)
                {
                    // Log each linked flow version execution
                    _logger.LogInformation($"   → Executing FlowVersion {link.FlowVersionId} for Trigger {trigger.Name}");
                    // TODO Simulate with actual execution logic
                }

                // Compute the next trigger time using the cron expression and timezone
                try
                {
                    trigger.LastTriggeredTime = DateTimeOffset.UtcNow;
                    trigger.NextTriggerTime = CronScheduleUtil.ComputeNextTriggerUtc(
                        trigger.CronExpression,
                        trigger.ExceptionHours,
                        trigger.ExceptionWeekdays,
                        trigger.ExceptionDates);
                    _logger.LogInformation($"[INFO] Next Trigger Time for {trigger.Name}: {trigger.NextTriggerTime:O}");

                    _db.TimeTriggers.Update(trigger);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"[ERROR] Failed to compute next trigger time for {trigger.Name} (ID: {trigger.Id})");
                }
            }

            // Save any changes to the database (e.g., updating the next trigger time)
            await _db.SaveChangesAsync();

            // Log the successful completion of the job execution
            _logger.LogInformation($"[INFO] Trigger execution job completed successfully at {now:O}");
        }
        catch (Exception ex)
        {
            // Log any unhandled errors during the entire execution process
            _logger.LogError(ex, "[ERROR] An error occurred during the trigger execution job.");
        }
    }
}