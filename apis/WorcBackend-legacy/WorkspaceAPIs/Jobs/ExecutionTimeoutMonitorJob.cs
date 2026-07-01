namespace WorkspaceAPIs.Jobs
{
    public class ExecutionTimeoutMonitorJob : IJob
    {
        // Default execution timeout (in minutes) used when no timeout  is configured in the flow version settings.
        private const int DefaultMaxExecutionTimeInMinutes = 30;

        private readonly WorkspaceInternalDbContext _workspaceInternalDbContext;
        private readonly ILogger<ExecutionTimeoutMonitorJob> _logger;

        public ExecutionTimeoutMonitorJob(
            WorkspaceInternalDbContext workspaceInternalDbContext,
            ILogger<ExecutionTimeoutMonitorJob> logger)
        {
            _workspaceInternalDbContext = workspaceInternalDbContext;
            _logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            // Use a single UTC timestamp throughout the execution to ensure  consistent timeout calculations.
            var currentUtcTime = DateTimeOffset.UtcNow;

            _logger.LogInformation("Execution timeout monitor started at {CurrentUtcTime}.", currentUtcTime);

            try
            {
                // Retrieve all jobs that are currently running.
                var runningJobs = await _workspaceInternalDbContext.Jobs
                    .Where(job =>
                        job.Status == JobStatusTypesEnum.Running &&
                        job.StartTime != null &&
                        job.EndTime == null)
                    .ToListAsync();

                if (runningJobs.Count == 0)
                {
                    _logger.LogInformation("No active jobs found for timeout evaluation.");
                    return;
                }

                _logger.LogInformation("Evaluating {RunningJobCount} running job(s) for execution timeout.", runningJobs.Count);

                // Load all required FlowVersion records in a single query to avoid repeated database lookups during processing.
                var flowVersionIds = runningJobs
                    .Select(job => job.FlowVersionId)
                    .Distinct()
                    .ToList();

                var flowVersionLookup = await _workspaceInternalDbContext.FlowVersions
                    .Where(flowVersion => flowVersionIds.Contains(flowVersion.Id))
                    .Include(i => i.Flow)
                    .ToDictionaryAsync(flowVersion => flowVersion.Id);

                var killedJobCount = 0;

                foreach (var runningJob in runningJobs)
                {
                    // Default timeout used when no custom value is configured.
                    var maximumExecutionTimeInMinutes = DefaultMaxExecutionTimeInMinutes;

                    if (flowVersionLookup.TryGetValue(runningJob.FlowVersionId, out var flowVersion))
                    {
                        if (flowVersion.Flow.Type == FlowTypesEnum.ChatAgent)
                            maximumExecutionTimeInMinutes = 5;

                        // Read the execution settings configured for the flow version.
                        var executionSettings = flowVersion?.Settings == null
                                ? new ExecutionSettings()
                                : System.Text.Json.JsonSerializer.Deserialize<ExecutionSettings>(
                                        flowVersion.Settings.RootElement.GetRawText(),
                                        new JsonSerializerOptions
                                        {
                                            PropertyNameCaseInsensitive = true
                                        }) ?? new ExecutionSettings();

                        if (executionSettings?.MaxExecutionTimeInMinutes > 0)
                        {
                            maximumExecutionTimeInMinutes = executionSettings.MaxExecutionTimeInMinutes;
                        }
                    }

                    // Determine when the job should have completed.
                    var executionTimeoutAt = runningJob.StartTime!.Value.AddMinutes(maximumExecutionTimeInMinutes);

                    // Skip jobs that are still within their allowed execution time.
                    if (executionTimeoutAt > currentUtcTime)
                    {
                        continue;
                    }

                    // Mark the timed-out job as killed.
                    runningJob.Status = JobStatusTypesEnum.Killed;
                    runningJob.EndTime = currentUtcTime;

                    killedJobCount++;

                    _logger.LogWarning(
                        "Job {JobId} exceeded its execution timeout ({MaximumExecutionTimeInMinutes} minute(s)) and was marked as Killed.",
                        runningJob.Id,
                        maximumExecutionTimeInMinutes);
                }

                // Save changes only when one or more jobs have been updated.
                if (killedJobCount > 0)
                {
                    await _workspaceInternalDbContext.SaveChangesAsync();
                }

                _logger.LogInformation(
                    "Execution timeout monitor completed. Evaluated {EvaluatedJobCount} job(s); marked {KilledJobCount} job(s) as Killed.",
                    runningJobs.Count,
                    killedJobCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "An error occurred while monitoring running jobs for execution timeouts.");
            }
        }
    }
}