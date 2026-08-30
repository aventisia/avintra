namespace RunnerApp.Services;

public enum ExecutorCommand
{
    Initiate,
    Abort,
    Pause,
    Resume,
    Killed,
    Unknown
}

public class ExecutorCommandReceivedEventArgs : EventArgs
{
    public required ExecutorCommand Command { get; init; }
    public required Guid JobId { get; init; }
    public required Guid AgentId { get; init; }
    public required Guid TenantId { get; init; }
}

public interface IOrchestratorHubClient : IAsyncDisposable
{
    event EventHandler<ExecutorCommandReceivedEventArgs>? CommandReceived;
    event EventHandler<string>? Disconnected;
    event EventHandler? Reconnected;

    HubConnectionState ConnectionState { get; }
    Task ConnectAsync(CancellationToken ct = default);
    Task DisconnectAsync();
    Task ReportProgressAsync(Guid jobId, string message, CancellationToken ct = default);
    Task ReportCompletionAsync(Guid jobId, string status, string? message = null, CancellationToken ct = default);
}
