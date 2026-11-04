namespace WorkspaceAPIs.Jobs;

[DisallowConcurrentExecution]
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

    public async Task Execute(IJobExecutionContext jobExecutionContext)
    {
        try
        {
            var currentUtcTime = DateTimeOffset.UtcNow;

            if (_environmentConfig.OnPremExecutionDisabled)
            {
                _logger.LogError("Execution is currently disabled in this environment. Job processing cannot be performed.");
                return;
            }

            var createdJobIds = new List<Guid>();

            await _workspaceInternalDbContext.Database.ExecuteInTransactionAsync(async () =>
            {
                // IMPORTANT NOTE: serializes ticks across API instances; a waiter re-reads the advanced NextTriggerTime and skips.
                await _workspaceInternalDbContext.Database.AcquireAdvisoryLockAsync("time-trigger-execution");
                createdJobIds = await CreateDueJobsAsync(currentUtcTime);
            });

            // IMPORTANT NOTE: dispatch only after commit; the dispatcher reads the jobs back from the database.
            if (createdJobIds.Count != 0)
                await _jobsExecutorService.ExecuteCommandByIdsAsync(createdJobIds);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during the trigger execution job.");
        }
    }

    private async Task<List<Guid>> CreateDueJobsAsync(DateTimeOffset currentUtcTime)
    {
        var endOfCurrentMinute = new DateTimeOffset(
            currentUtcTime.Year,
            currentUtcTime.Month,
            currentUtcTime.Day,
            currentUtcTime.Hour,
            currentUtcTime.Minute,
            0,
            TimeSpan.Zero).AddMinutes(1);

        var activeTriggers = await _workspaceInternalDbContext.Triggers
            .Where(w => w.TriggerType == TriggerTypesEnum.Time && !w.IsDisabled)
            .Include(t => t.TriggerFlowVersions)
                .ThenInclude(tfv => tfv.FlowVersion)
                    .ThenInclude(fv => fv.Flow)
            .ToListAsync();

        var dueTriggers = activeTriggers
            .Where(w => IsDue(w.Metadata.RootElement, currentUtcTime, endOfCurrentMinute))
            .ToList();

        if (dueTriggers.Count == 0)
            return [];

        var dueFlowVersionIds = dueTriggers
            .SelectMany(t => t.TriggerFlowVersions)
            .Select(f => f.FlowVersionId)
            .Distinct()
            .OrderBy(id => id)
            .ToList();

        foreach (var flowVersionId in dueFlowVersionIds)
            await _workspaceInternalDbContext.Database.AcquireAdvisoryLockAsync(FlowVersionHistoryHelpers.HistoryLockKey(flowVersionId));

        var latestFlowVersionHistoryIds = await GetLatestFlowVersionHistoryIdsAsync(dueTriggers);

        var createdJobs = new List<Job>();

        foreach (var trigger in dueTriggers)
        {
            foreach (var triggerFlowVersion in trigger.TriggerFlowVersions)
            {
                // Skip invalid entries
                if (triggerFlowVersion.FlowVersion == null)
                {
                    _logger.LogWarning("Skipping invalid FlowVersionId for trigger {TriggerId}.", trigger.Id);
                    continue;
                }

                latestFlowVersionHistoryIds.TryGetValue(triggerFlowVersion.FlowVersionId, out Guid? latestFlowVersionHistoryId);

                createdJobs.Add(new Job()
                {
                    Id = Guid.NewGuid(),
                    TenantId = triggerFlowVersion.TenantId,
                    SpaceId = triggerFlowVersion.FlowVersion?.SpaceId ?? triggerFlowVersion.FlowVersion?.Flow?.SpaceId ?? trigger.SpaceId,
                    FlowVersionId = triggerFlowVersion.FlowVersionId,
                    FlowVersionHistoryId = latestFlowVersionHistoryId,
                    TriggerType = TriggerTypesEnum.Time,
                    RefId = triggerFlowVersion.TriggerId,
                    Priority = JobPriorityEnum.Normal,
                    Status = JobStatusEnum.Created,
                });
            }

            AdvanceSchedule(trigger, currentUtcTime);
            _workspaceInternalDbContext.Triggers.Update(trigger);
        }

        await _workspaceInternalDbContext.Jobs.AddRangeAsync(createdJobs);
        await _workspaceInternalDbContext.SaveChangesAsync();

        return createdJobs.Select(s => s.Id).ToList();
    }

    private static bool IsDue(JsonElement metadata, DateTimeOffset currentUtcTime, DateTimeOffset endOfCurrentMinute)
    {
        var nextTriggerTime = metadata.TryGetProperty("NextTriggerTime", out var ntt)
            ? ntt.GetDateTimeOffset()
            : DateTimeOffset.MinValue;

        var effectiveDate = metadata.TryGetProperty("EffectiveDate", out var ed)
            ? ed.GetDateTimeOffset()
            : DateTimeOffset.MinValue;

        var endDate = metadata.TryGetProperty("EndDate", out var endDateProp) && endDateProp.ValueKind != JsonValueKind.Null
            ? endDateProp.GetDateTimeOffset()
            : (DateTimeOffset?)null;

        var isWithinSchedule = effectiveDate <= currentUtcTime && (endDate == null || endDate >= currentUtcTime);

        return isWithinSchedule && nextTriggerTime < endOfCurrentMinute;
    }

    private Task<Dictionary<Guid, Guid?>> GetLatestFlowVersionHistoryIdsAsync(List<Trigger> triggers)
    {
        var flowVersionIds = triggers
            .SelectMany(t => t.TriggerFlowVersions)
            .Select(f => f.FlowVersionId)
            .Distinct()
            .ToList();

        return _workspaceInternalDbContext.FlowVersionHistories
            .Where(w => flowVersionIds.Contains(w.FlowVersionId))
            .GroupBy(g => g.FlowVersionId)
            .Select(s => new
            {
                FlowVersionId = s.Key,
                FlowVersionHistoryId = s
                    .OrderByDescending(o => o.CreatedOn)
                    .ThenByDescending(o => o.Id)
                    .Select(s1 => (Guid?)s1.Id)
                    .FirstOrDefault()
            })
            .ToDictionaryAsync(x => x.FlowVersionId, x => x.FlowVersionHistoryId);
    }

    private static void AdvanceSchedule(Trigger trigger, DateTimeOffset currentUtcTime)
    {
        var triggerModel = System.Text.Json.JsonSerializer.Deserialize<TimeTriggerModel>(
            trigger.Metadata.RootElement.GetRawText(),
            TimeTriggerMetadataHelpers.JsonOptions);

        triggerModel.LastTriggeredTime = currentUtcTime;
        triggerModel.NextTriggerTime = CronScheduleUtil.ComputeNextTriggerUtc(
            triggerModel.CronExpression,
            triggerModel.EffectiveDate,
            triggerModel.ExceptionHours,
            triggerModel.ExceptionWeekdays,
            triggerModel.ExceptionDates,
            trigger.Timezone);

        trigger.Metadata = JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(triggerModel, TimeTriggerMetadataHelpers.JsonOptions));
    }
}
