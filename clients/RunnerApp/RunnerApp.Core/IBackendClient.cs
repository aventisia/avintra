namespace RunnerApp.Services;

public interface IBackendClient
{
    Task<ExecutionGraphDto?> GetExecutionGraphAsync(Guid jobId, CancellationToken ct = default);
    Task<IReadOnlyDictionary<string, string>> FetchConfigKeyValuePairsAsync(IEnumerable<string> keys, CancellationToken ct = default);
    Task StartJobAsync(Guid jobId, CancellationToken ct = default);
    Task CloseJobAsync(Guid jobId, FlowExecutionStatus status, List<NodeExecutionLog> logs, string? remarks = null, CancellationToken ct = default);

    /// <summary>
    /// Uploads a batch of node execution logs for a running job so logs survive a crash
    /// and accumulate in the log view before the job closes. The backend deduplicates
    /// against the close payload by (NodeExecutionId, RetryAttempt).
    /// </summary>
    Task InsertNodeExecutionLogsAsync(Guid jobId, IReadOnlyList<NodeExecutionLog> logs, CancellationToken ct = default);
    Task<MachineRegistrationResult?> RegisterMachineAsync(string operatingSystem, string osId, string username, string hostname, CancellationToken ct = default);
    Task<MachineRegistrationResult?> RegisterMachineWithApiKeyAsync(string operatingSystem, string osId, string username, string hostname, string tenantId, string apiKey, string linkedUsername, CancellationToken ct = default);

    /// <summary>
    /// Fetches the next Created job assigned to this machine from the backend.
    /// Returns the job ID if one exists, or null when there are no pending jobs.
    /// </summary>
    Task<Guid?> GetNextPendingJobAsync(Guid machineId, CancellationToken ct = default);
}

public record MachineRegistrationResult(Guid MachineId, string Jwt, DateTimeOffset ExpiresOn);
