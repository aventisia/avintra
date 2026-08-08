using System.Text.Json;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.Logging;

namespace RunnerApp.Services;

public class OrchestratorHubClient : IOrchestratorHubClient
{
    private readonly string _hubUrl;
    private readonly string _accessToken;
    private readonly string _osId;
    private readonly string _username;
    private readonly string _appVersion;
    private readonly ILogger<OrchestratorHubClient> _logger;
    private HubConnection? _connection;
    private bool _disposed;

    public OrchestratorHubClient(
        string appBaseUrl,
        string accessToken,
        string osId,
        string username,
        string appVersion,
        ILogger<OrchestratorHubClient> logger)
    {
        // The backend reads the client identity from the query string (OrchestratorHub.OnConnectedAsync),
        // not from headers, so the identity is passed as query parameters.
        var query = System.Web.HttpUtility.ParseQueryString(string.Empty);
        query["clientType"] = "AvintraMachine";
        query["osId"] = osId;
        query["username"] = username;
        query["appVersion"] = appVersion;

        _hubUrl = $"{appBaseUrl.TrimEnd('/')}/orchestrator-hub?{query}";
        _accessToken = accessToken;
        _osId = osId;
        _username = username;
        _appVersion = appVersion;
        _logger = logger;
    }

    public event EventHandler<ExecutorCommandReceivedEventArgs>? CommandReceived;
    public event EventHandler<string>? Disconnected;
    public event EventHandler? Reconnected;

    public HubConnectionState ConnectionState => _connection?.State ?? HubConnectionState.Disconnected;

    public async Task ConnectAsync(CancellationToken ct = default)
    {
        _connection = new HubConnectionBuilder()
            .WithUrl(_hubUrl, options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(_accessToken)!;
                options.Headers["Authorization"] = $"Bearer {_accessToken}";
            })
            .WithAutomaticReconnect(new RetryPolicy())
            .Build();

        _connection.On<string>("trigger_agent", OnTriggerAgentReceived);

        _connection.Closed += OnConnectionClosed;
        _connection.Reconnected += OnReconnected;

        _logger.LogInformation("Connecting to OrchestratorHub at {HubUrl}...", _hubUrl);
        await _connection.StartAsync(ct);
        _logger.LogInformation("Connected to OrchestratorHub as machine {OsId}/{Username}.", _osId, _username);
    }

    public async Task DisconnectAsync()
    {
        if (_connection is not null)
        {
            await _connection.StopAsync();
            await _connection.DisposeAsync();
            _connection = null;
        }
    }

    public async Task ReportProgressAsync(Guid jobId, string message, CancellationToken ct = default)
    {
        if (_connection?.State == HubConnectionState.Connected)
        {
            try
            {
                await _connection.InvokeAsync("ReportProgress", jobId, message, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to report progress for job {JobId}.", jobId);
            }
        }
    }

    public async Task ReportCompletionAsync(Guid jobId, string status, string? message = null, CancellationToken ct = default)
    {
        if (_connection?.State == HubConnectionState.Connected)
        {
            try
            {
                await _connection.InvokeAsync("ReportCompletion", jobId, status, message, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to report completion for job {JobId}.", jobId);
            }
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_disposed) return;
        _disposed = true;
        await DisconnectAsync();
        GC.SuppressFinalize(this);
    }

    private void OnTriggerAgentReceived(string rawJson)
    {
        try
        {
            using var doc = JsonDocument.Parse(rawJson);
            var root = doc.RootElement;

            var commandText = root.GetProperty("command").GetString() ?? "Unknown";
            var jobId = root.GetProperty("jobId").GetGuid();
            var agentId = root.GetProperty("agentId").GetGuid();
            var tenantId = root.GetProperty("tenantId").GetGuid();

            var command = commandText switch
            {
                "Initiate" => ExecutorCommand.Initiate,
                "Abort" => ExecutorCommand.Abort,
                "Pause" => ExecutorCommand.Pause,
                "Resume" => ExecutorCommand.Resume,
                "Killed" => ExecutorCommand.Killed,
                _ => ExecutorCommand.Unknown
            };

            _logger.LogInformation(
                "Received command {Command} for job {JobId}, agent {AgentId}.",
                command, jobId, agentId);

            CommandReceived?.Invoke(this, new ExecutorCommandReceivedEventArgs
            {
                Command = command,
                JobId = jobId,
                AgentId = agentId,
                TenantId = tenantId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse trigger_agent payload: {RawJson}", rawJson);
        }
    }

    private async Task OnConnectionClosed(Exception? exception)
    {
        _logger.LogWarning(exception, "OrchestratorHub connection closed.");
        Disconnected?.Invoke(this, exception?.Message ?? "Connection closed");
        await Task.CompletedTask;
    }

    private async Task OnReconnected(string? connectionId)
    {
        _logger.LogInformation("Reconnected to OrchestratorHub with connection {ConnectionId}.", connectionId);
        Reconnected?.Invoke(this, EventArgs.Empty);
        await Task.CompletedTask;
    }

    private class RetryPolicy : IRetryPolicy
    {
        public TimeSpan? NextRetryDelay(RetryContext retryContext)
        {
            if (retryContext.PreviousRetryCount >= 10)
                return null;

            var delay = TimeSpan.FromSeconds(Math.Min(30, Math.Pow(2, retryContext.PreviousRetryCount)));
            return delay;
        }
    }
}
