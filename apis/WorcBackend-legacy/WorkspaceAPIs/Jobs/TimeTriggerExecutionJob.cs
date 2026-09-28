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

            // Fetch active TimeTriggers
            var triggersQuery = await _workspaceInternalDbContext.Triggers
                .Where(w => w.TriggerType == TriggerTypesEnum.Time && !w.IsDisabled)
                .Include(t => t.TriggerFlowVersions)
                .ToListAsync();

            // Filter JSON metadata in memory
            var triggersToExecute = triggersQuery
                .Where(w =>
                {
                    var root = w.Metadata.RootElement;

                    var nextTriggerTime = root.TryGetProperty("NextTriggerTime", out var ntt)
                        ? ntt.GetDateTimeOffset()
                        : DateTimeOffset.MinValue;

                    var effectiveDate = root.TryGetProperty("EffectiveDate", out var ed)
                        ? ed.GetDateTimeOffset()
                        : DateTimeOffset.MinValue;

                    var hasEndDate = root.TryGetProperty("EndDate", out var endDateProp)
                        && endDateProp.ValueKind != JsonValueKind.Null;

                    var endDate = hasEndDate
                        ? endDateProp.GetDateTimeOffset()
                        : (DateTimeOffset?)null;

                    // Skip if not yet effective
                    if (effectiveDate > currentUtcTime)
                        return false;

                    // Skip if schedule has ended
                    if (endDate != null && endDate < currentUtcTime)
                        return false;

                    // Execute if:
                    // 1. Scheduled for current minute, OR
                    // 2. Missed execution (NextTriggerTime is already past)
                    return nextTriggerTime < endOfCurrentMinute;
                })
                .ToList();

            if (triggersToExecute.Any())
            {
                // Get all FlowVersionIds
                var flowVersionIds = triggersToExecute
                    .SelectMany(t => t.TriggerFlowVersions)
                    .Select(f => f.FlowVersionId)
                    .Distinct()
                    .ToList();

                // Get latest FlowVersionHistory per FlowVersionId
                var latestFlowVersionHistoryDict = await _workspaceInternalDbContext.FlowVersionHistories
                    .Where(w => flowVersionIds.Contains(w.FlowVersionId))
                    .GroupBy(g => g.FlowVersionId)
                    .Select(s => new
                    {
                        FlowVersionId = s.Key,
                        FlowVersionHistoryId = s
                            .OrderByDescending(o => o.CreatedOn)
                            .Select(s1 => (Guid?)s1.Id)
                            .FirstOrDefault()
                    })
                    .ToDictionaryAsync(x => x.FlowVersionId, x => x.FlowVersionHistoryId);

                // Process each trigger
                var createdJobs = new List<Job>();

                foreach (var trigger in triggersToExecute)
                {
                    // JSON serializer configuration
                    var jsonOptions = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
                    };

                    jsonOptions.Converters.Add(new JsonStringEnumConverter());

                    // Deserialize existing metadata into model
                    var triggerModel = System.Text.Json.JsonSerializer.Deserialize<TimeTriggerModel>(
                        trigger.Metadata.RootElement.GetRawText(),
                        jsonOptions);

                    foreach (var timeTriggerflowVersion in trigger.TriggerFlowVersions)
                    {
                        latestFlowVersionHistoryDict.TryGetValue(timeTriggerflowVersion.FlowVersionId, out Guid? latestFlowVersionHistoryId);

                        var jobToCreate = new Job()
                        {
                            Id = Guid.NewGuid(),
                            TenantId = timeTriggerflowVersion.TenantId,
                            FlowVersionId = timeTriggerflowVersion.FlowVersionId,
                            FlowVersionHistoryId = latestFlowVersionHistoryId,
                            TriggerType = TriggerTypesEnum.Time,
                            RefId = timeTriggerflowVersion.TriggerId,
                            Priority = JobPriorityEnum.Normal,
                            Status = JobStatusEnum.Created,
                            CreatedOn = currentUtcTime,
                        };

                        createdJobs.Add(jobToCreate);
                    }

                    // Update the trigger's last executed time and calculate the next trigger time
                    triggerModel.LastTriggeredTime = DateTimeOffset.UtcNow;
                    triggerModel.NextTriggerTime = CronScheduleUtil.ComputeNextTriggerUtc(
                        triggerModel.CronExpression,
                        triggerModel.EffectiveDate,
                        triggerModel.ExceptionHours,
                        triggerModel.ExceptionWeekdays,
                        triggerModel.ExceptionDates);

                    // Update metadata with latest subscription data
                    trigger.Metadata = JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(triggerModel, jsonOptions));

                    // Update the trigger record in the database
                    _workspaceInternalDbContext.Triggers.Update(trigger);
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

                // Now execute the jobs based on their IDs
                // Execute job commands for all created jobs
                if (createdJobs.Any())
                {
                    var jobIds = createdJobs.Select(s => s.Id).ToList();

                    // Log the job IDs
                    if (jobIds.Count != 0)
                        await _jobsExecutorService.ExecuteCommandByIdsAsync(jobIds);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during the trigger execution job.");
        }
    }
}