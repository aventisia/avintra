namespace RunnerApp.Services;

public class OrchestratorHubClient : IOrchestratorHubClient
{
    private readonly string _hubUrl;
    private readonly string _accessToken;
    private readonly ILogger<OrchestratorHubClient> _logger;
    private HubConnection? _connection;
    private bool _disposed;

    public OrchestratorHubClient(
        string appBaseUrl,
        string accessToken,
        ILogger<OrchestratorHubClient> logger)
    {
        // The backend reads the client identity from the query string (OrchestratorHub.OnConnectedAsync),
        // not from headers, so the identity is passed as query parameters.
        var query = System.Web.HttpUtility.ParseQueryString(string.Empty);
        query["clientType"] = "AvintraMachine";
        query["osId"] = MachineIdentity.OsId;
        query["username"] = MachineIdentity.Username;
        query["hostname"] = MachineIdentity.Hostname;
        query["appVersion"] = MachineIdentity.AppVersion;
        // Mirror the backend's MachinesTableHelpers.BuildMachineName format so the presence
        // layer can validate the sent name against the DB record:
        //   [hostname]_os_osid
        var operatingSystem = OperatingSystem.IsWindows() ? "windows" : "linux";
        var machineName = $"[{MachineIdentity.Hostname.Trim().ToLowerInvariant()}]_{operatingSystem}_{MachineIdentity.OsId.Trim().ToLowerInvariant()}";
        query["machineName"] = machineName;

        _hubUrl = $"{appBaseUrl.TrimEnd('/')}/workspace/api/orchestrator-hub?{query}";
        _accessToken = accessToken;
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
        _logger.LogInformation(
            "Connected to OrchestratorHub as machine {OsId}/{Username}.",
            MachineIdentity.OsId,
            MachineIdentity.Username);
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

    private void OnTriggerAgentReceived(string rawJobId)
    {
        try
        {
            if (!Guid.TryParse(rawJobId, out var jobId))
            {
                _logger.LogError("Failed to parse trigger_agent job id: {RawJobId}", rawJobId);
                return;
            }

            _logger.LogInformation(
                "Received command Initiate for job {JobId}.",
                jobId);

            CommandReceived?.Invoke(this, new ExecutorCommandReceivedEventArgs
            {
                Command = ExecutorCommand.Initiate,
                JobId = jobId,
                AgentId = Guid.Empty,
                TenantId = Guid.Empty
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to handle trigger_agent job id: {RawJobId}", rawJobId);
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
