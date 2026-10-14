namespace WorkspaceAPIs.Jobs;

/// <summary>
/// Startup background service that rebuilds time-trigger cron expressions and next-trigger times
/// after the scheduling model moved from UTC to the trigger's configured timezone.
/// </summary>
public class BackfillTimeTriggerCronHostedService : BackgroundService
{
    private const string AdvisoryLockKey = "workspace:backfill-time-trigger-cron";
    private const int BatchSize = 50;

    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<BackfillTimeTriggerCronHostedService> _logger;

    public BackfillTimeTriggerCronHostedService(
        IServiceProvider serviceProvider,
        ILogger<BackfillTimeTriggerCronHostedService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            await unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                await unitOfWork.AcquireAdvisoryLockAsync(AdvisoryLockKey);
                await RunBackfillAsync(scope.ServiceProvider, stoppingToken);
            });
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled error during time trigger cron backfill.");
        }
    }

    private async Task RunBackfillAsync(IServiceProvider scopeServices, CancellationToken cancellationToken)
    {
        var context = scopeServices.GetRequiredService<WorkspaceDbContext>();

        _logger.LogInformation("Starting time trigger cron backfill.");

        var offset = 0;
        var updatedCount = 0;
        var skippedCount = 0;

        while (true)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var triggers = await context.Triggers
                .IgnoreQueryFilters()
                .Where(t => t.TriggerType == TriggerTypesEnum.Time)
                .OrderBy(t => t.CreatedOn)
                .ThenBy(t => t.Id)
                .Skip(offset)
                .Take(BatchSize)
                .ToListAsync(cancellationToken);

            if (triggers.Count == 0)
                break;

            foreach (var trigger in triggers)
            {
                cancellationToken.ThrowIfCancellationRequested();

                var model = TryDeserializeModel(trigger);
                if (model == null)
                {
                    skippedCount++;
                    continue;
                }

                var rebuiltCron = CronScheduleUtil.BuildCronExpression(
                    model.Frequency,
                    model.Interval,
                    model.AtTime,
                    model.Weekdays,
                    model.MonthDays);

                var nextTriggerTime = CronScheduleUtil.ComputeNextTriggerUtc(
                    rebuiltCron,
                    model.EffectiveDate,
                    model.ExceptionHours,
                    model.ExceptionWeekdays,
                    model.ExceptionDates,
                    trigger.Timezone);

                var cronChanged = rebuiltCron != model.CronExpression;
                var nextChanged = nextTriggerTime != model.NextTriggerTime;

                if (!cronChanged && !nextChanged)
                    continue;

                if (cronChanged)
                    model.CronExpression = rebuiltCron;

                if (nextChanged)
                    model.NextTriggerTime = nextTriggerTime;

                trigger.Metadata = JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(model, TimeTriggerMetadataHelpers.JsonOptions));
                updatedCount++;
            }

            await context.SaveChangesAsync(cancellationToken);
            offset += triggers.Count;
        }

        _logger.LogInformation(
            "Time trigger cron backfill finished. Updated {UpdatedCount} rows, skipped {SkippedCount} rows.",
            updatedCount,
            skippedCount);
    }

    private TimeTriggerModel? TryDeserializeModel(Trigger trigger)
    {
        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<TimeTriggerModel>(
                trigger.Metadata.RootElement.GetRawText(),
                TimeTriggerMetadataHelpers.JsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse metadata for time trigger {TriggerId}. Skipping.", trigger.Id);
            return null;
        }
    }
}
