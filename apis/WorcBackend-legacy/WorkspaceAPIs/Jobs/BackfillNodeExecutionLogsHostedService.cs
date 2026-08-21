using System.IO.Compression;
using System.Text;
using System.Text.Json;
using ExecutorLibrary.FlowProcessor.Models;
using Microsoft.EntityFrameworkCore;
using WorkspaceAPIs.Helpers;

namespace WorkspaceAPIs.Jobs;

/// <summary>
/// Background hosted service that backfills legacy NodeExecutionLogs JSON from worc_Jobs
/// into per-node ws_NodeExecutionLogs rows with compressed payloads.
/// Runs once at startup and performs batched, idempotent processing.
/// </summary>
public class BackfillNodeExecutionLogsHostedService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<BackfillNodeExecutionLogsHostedService> _logger;

    public BackfillNodeExecutionLogsHostedService(IServiceProvider serviceProvider, ILogger<BackfillNodeExecutionLogsHostedService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _ = Task.Run(() => RunBackfillAsync(cancellationToken), cancellationToken);
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    private async Task RunBackfillAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<WorkspaceDbContext>();

            var processedCount = 0;
            var insertedLogCount = 0;
            const int batchSize = 25;

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();

                var jobsWithLogs = await context.Jobs
                    .IgnoreQueryFilters()
                    .Where(j => !string.IsNullOrEmpty(j.NodeExecutionLogsLegacy))
                    .Where(j => !context.JobNodeExecutionLogs.Any(n => n.JobId == j.Id))
                    .OrderBy(j => j.CreatedOn)
                    .Take(batchSize)
                    .Select(j => new { j.Id, j.TenantId, LegacyLogs = j.NodeExecutionLogsLegacy })
                    .ToListAsync(cancellationToken);

                if (jobsWithLogs.Count == 0)
                    break;

                foreach (var job in jobsWithLogs)
                {
                    cancellationToken.ThrowIfCancellationRequested();

                    if (string.IsNullOrWhiteSpace(job.LegacyLogs))
                        continue;

                    List<NodeExecutionLog>? logs;
                    try
                    {
                        logs = System.Text.Json.JsonSerializer.Deserialize<List<NodeExecutionLog>>(job.LegacyLogs);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to parse NodeExecutionLogs for Job {JobId}. Inserting sentinel to skip.", job.Id);
                        context.JobNodeExecutionLogs.Add(new JobNodeExecutionLog
                        {
                            Id = Guid.NewGuid(),
                            JobId = job.Id,
                            TenantId = job.TenantId,
                            NodeExecutionId = string.Empty,
                            RetryAttempt = 0,
                            IsSuccess = false,
                            ExecutedAt = DateTimeOffset.UtcNow
                        });
                        processedCount++;
                        continue;
                    }

                    if (logs == null || logs.Count == 0)
                    {
                        context.JobNodeExecutionLogs.Add(new JobNodeExecutionLog
                        {
                            Id = Guid.NewGuid(),
                            JobId = job.Id,
                            TenantId = job.TenantId,
                            NodeExecutionId = string.Empty,
                            RetryAttempt = 0,
                            IsSuccess = false,
                            ExecutedAt = DateTimeOffset.UtcNow
                        });
                        processedCount++;
                        continue;
                    }

                    var entities = logs.Select(log => MapSharedLogToEntity(log, job.Id, job.TenantId)).ToList();
                    await context.JobNodeExecutionLogs.AddRangeAsync(entities, cancellationToken);

                    insertedLogCount += entities.Count;
                    processedCount++;
                }

                await context.SaveChangesAsync(cancellationToken);
            }
        }
        catch (OperationCanceledException)
        {
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled error during NodeExecutionLogs backfill.");
        }
    }

    private static JobNodeExecutionLog MapSharedLogToEntity(NodeExecutionLog log, Guid jobId, Guid tenantId)
    {
        var inputsJson = System.Text.Json.JsonSerializer.Serialize(log.Inputs);
        var outputsJson = System.Text.Json.JsonSerializer.Serialize(log.Outputs);

        return new JobNodeExecutionLog
        {
            Id = Guid.NewGuid(),
            JobId = jobId,
            TenantId = tenantId,
            NodeExecutionId = log.UniqueNodeId,
            RetryAttempt = 0,
            NodeId = log.NodeId,
            NodeDisplayName = log.NodeName,
            NodeUniqueName = log.NodeUniqueName,
            IsSuccess = log.IsSuccess,
            Duration = log.Duration,
            InputsJsonCompressed = NodeExecutionLogCompressionHelpers.CompressJson(inputsJson),
            OutputsJsonCompressed = NodeExecutionLogCompressionHelpers.CompressJson(outputsJson),
            InputsJsonLength = inputsJson.Length,
            OutputsJsonLength = outputsJson.Length,
            ExecutedAt = DateTimeOffset.UtcNow
        };
    }
}
