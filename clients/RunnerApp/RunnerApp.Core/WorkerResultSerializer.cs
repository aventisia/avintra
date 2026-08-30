using System.Text.Json;
using System.Text.Json.Serialization;
using ExecutorLibrary.FlowProcessor.Models;

namespace RunnerApp.Services;

/// <summary>
/// Serializes a worker's <see cref="FlowExecutionResult"/> to disk so the long-lived service
/// can read it back after the short-lived worker exits. This closes the loop for service+worker
/// executions: without it the service only sees the worker's process exit code and cannot report
/// per-node execution logs or a meaningful failed-node remark to the backend.
///
/// The file is written next to the per-job debug log under
/// %PROGRAMDATA%\Avintra\Runner\logs\jobs\{jobId}\result.json.
/// </summary>
public static class WorkerResultSerializer
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        WriteIndented = false,
    };

    private static string ResultFilePath(Guid jobId)
    {
        return Path.Combine(DebugLog.GetJobDirectory(jobId), "result.json");
    }

    /// <summary>
    /// Writes the execution result for the given job. Overwrites any previous result.
    /// </summary>
    public static async Task SaveAsync(Guid jobId, FlowExecutionResult result)
    {
        var path = ResultFilePath(jobId);
        var dir = Path.GetDirectoryName(path)!;
        Directory.CreateDirectory(dir);

        var dto = new WorkerResultDto
        {
            IsSuccess = result.IsSuccess,
            Status = result.Status.ToString(),
            StartTime = result.StartTime,
            EndTime = result.EndTime,
            ErrorMessage = result.ErrorMessage,
            NodeLogs = result.NodeLogs?.ToList() ?? new List<NodeExecutionLog>(),
        };

        await File.WriteAllTextAsync(path, JsonSerializer.Serialize(dto, JsonOptions));
    }

    /// <summary>
    /// Reads the execution result for the given job if it exists and is valid.
    /// Returns <c>null</c> when the file is missing or cannot be parsed.
    /// </summary>
    public static async Task<FlowExecutionResult?> LoadAsync(Guid jobId)
    {
        var path = ResultFilePath(jobId);
        if (!File.Exists(path))
            return null;

        try
        {
            var json = await File.ReadAllTextAsync(path);
            var dto = JsonSerializer.Deserialize<WorkerResultDto>(json, JsonOptions);
            if (dto is null)
                return null;

            if (!Enum.TryParse<FlowExecutionStatus>(dto.Status, true, out var status))
                status = dto.IsSuccess ? FlowExecutionStatus.Completed : FlowExecutionStatus.Failed;

            return new FlowExecutionResult
            {
                IsSuccess = dto.IsSuccess,
                Status = status,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                ErrorMessage = dto.ErrorMessage,
                NodeLogs = dto.NodeLogs ?? new List<NodeExecutionLog>(),
            };
        }
        catch
        {
            // Best-effort read; if the result file is corrupt we fall back to the process exit code.
            return null;
        }
    }

    /// <summary>
    /// Removes the result file for a job, if present.
    /// </summary>
    public static void Delete(Guid jobId)
    {
        var path = ResultFilePath(jobId);
        if (File.Exists(path))
        {
            try { File.Delete(path); }
            catch { /* best effort */ }
        }
    }

    private sealed class WorkerResultDto
    {
        public bool IsSuccess { get; set; }
        public string Status { get; set; } = "Completed";
        public DateTimeOffset StartTime { get; set; }
        public DateTimeOffset EndTime { get; set; }
        public string? ErrorMessage { get; set; }
        public List<NodeExecutionLog> NodeLogs { get; set; } = new();
    }
}
