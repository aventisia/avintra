namespace WorkspaceAPIs.Jobs;

/// <summary>
/// Startup background service that repairs time-trigger cron expressions and next-trigger times
/// stored before the scheduler honoured the trigger's configured timezone.
/// </summary>
public class BackfillTimeTriggerCronHostedService : BackgroundService
{
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
            var context = scope.ServiceProvider.GetRequiredService<WorkspaceInternalDbContext>();
            await RunBackfillAsync(context, stoppingToken);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled error during time trigger cron backfill.");
        }
    }

    private async Task RunBackfillAsync(WorkspaceInternalDbContext context, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting time trigger cron backfill.");

        var offset = 0;
        var updatedCount = 0;
        var skippedCount = 0;
        var batchCount = 0;

        do
        {
            cancellationToken.ThrowIfCancellationRequested();

            // IMPORTANT NOTE: each batch holds the scheduler tick's transaction-scoped lock so a tick never interleaves with its correction.
            await context.Database.ExecuteInTransactionAsync(async () =>
            {
                await context.Database.AcquireAdvisoryLockAsync(TimeTriggerMetadataHelpers.ExecutionLockKey);

                var triggers = await context.Triggers
                    .Where(t => t.TriggerType == TriggerTypesEnum.Time)
                    .OrderBy(t => t.CreatedOn)
                    .ThenBy(t => t.Id)
                    .Skip(offset)
                    .Take(BatchSize)
                    .ToListAsync(cancellationToken);

                foreach (var trigger in triggers)
                {
                    try
                    {
                        if (TimeTriggerMetadataHelpers.CorrectSchedule(trigger))
                            updatedCount++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to correct schedule for time trigger {TriggerId}. Skipping.", trigger.Id);
                        skippedCount++;
                    }
                }

                await context.SaveChangesAsync(cancellationToken);
                batchCount = triggers.Count;
            });

            offset += batchCount;
        }
        while (batchCount == BatchSize);

        _logger.LogInformation(
            "Time trigger cron backfill finished. Updated {UpdatedCount} rows, skipped {SkippedCount} rows.",
            updatedCount,
            skippedCount);
    }
}
