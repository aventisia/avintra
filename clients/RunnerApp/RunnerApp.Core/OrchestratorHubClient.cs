using System.Globalization;

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
        ILogger<OrchestratorHubClient> logger,
        string? usernameOverride = null)
    {
        // The backend reads the client identity from the query string (OrchestratorHub.OnConnectedAsync),
        // not from headers, so the identity is passed as query parameters.
        var query = System.Web.HttpUtility.ParseQueryString(string.Empty);
        query["clientType"] = "AvintraMachine";
        query["osId"] = MachineIdentity.OsId;

        // Service mode runs as LocalSystem and may not have an interactive session, so the
        // interactive username fallback would return the machine account (e.g. THINKPAD$).
        // To keep the hub identity stable and aligned with the machine registration, callers
        // can override the username. If not provided, fall back to the interactive username.
        var hubUsername = !string.IsNullOrWhiteSpace(usernameOverride)
            ? usernameOverride
            : MachineIdentity.Username;
        query["username"] = hubUsername;

        query["appVersion"] = MachineIdentity.AppVersion;

        // The machine name is always built from the service account so it matches the DB record.
        var operatingSystem = OperatingSystem.IsWindows() ? "windows" : "linux";
        var machineName = $"[{MachineIdentity.ServiceAccountUsername.Trim().ToLowerInvariant()}]_{operatingSystem}_{MachineIdentity.OsId.Trim().ToLowerInvariant()}";
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

        // Register the trigger_agent handler for both string (JSON) and object payloads.
        // The server sends ExecutionCommandDto as a JSON object; the client may receive it
        // either as a pre-serialized string or as a JsonElement depending on the protocol
        // framing, so accept object and stringify it ourselves.
        _connection.On<object>("trigger_agent", raw =>
        {
            var rawJson = raw?.ToString() ?? string.Empty;
            OnTriggerAgentReceived(rawJson);
        });

        _connection.Closed += OnConnectionClosed;
        _connection.Reconnected += OnReconnected;

        _logger.LogInformation("Connecting to OrchestratorHub at {HubUrl}...", _hubUrl);
        DebugLog.Info($"Connecting to OrchestratorHub at {_hubUrl}");
        await _connection.StartAsync(ct);
        _logger.LogInformation(
            "Connected to OrchestratorHub as machine {OsId}/{Username}.",
            MachineIdentity.OsId,
            MachineIdentity.Username);
        DebugLog.Info($"Connected to OrchestratorHub as machine {MachineIdentity.OsId}/{MachineIdentity.Username}");
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
        // Log every incoming trigger_agent call before parsing so we can diagnose
        // delivery issues even when the payload shape is unexpected.
        _logger.LogInformation("trigger_agent raw payload received: {RawJson}", rawJson);
        DebugLog.Info($"trigger_agent raw payload received: {rawJson}");

        try
        {
            using var doc = JsonDocument.Parse(rawJson);
            var root = doc.RootElement;

            // The backend's default SignalR JSON protocol serializes enum values as
            // integers and property names as camelCase. Tolerate both numeric/string
            // command values and both camelCase/PascalCase property names.
            var commandText = GetCommandText(root, "command", "Command");
            var jobId = GetGuid(root, "jobId", "JobId");
            var agentId = GetGuid(root, "agentId", "AgentId");
            var tenantId = GetGuid(root, "tenantId", "TenantId");

            var command = commandText switch
            {
                "0" or "Initiate" => ExecutorCommand.Initiate,
                "3" or "Abort" => ExecutorCommand.Abort,
                "4" or "Pause" => ExecutorCommand.Pause,
                "5" or "Resume" => ExecutorCommand.Resume,
                "10" or "Killed" => ExecutorCommand.Killed,
                _ => ExecutorCommand.Unknown
            };

            _logger.LogInformation(
                "Received command {Command} for job {JobId}, agent {AgentId}.",
                command, jobId, agentId);

            DebugLog.Info($"trigger_agent parsed: command={commandText}, jobId={jobId}, agentId={agentId}, tenantId={tenantId}");

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
            DebugLog.Error($"Failed to parse trigger_agent payload: {rawJson}", ex);
        }
    }

    private static string? GetCommandText(JsonElement element, string camelName, string pascalName)
    {
        if (TryGetProperty(element, camelName, pascalName, out var prop))
        {
            if (prop.ValueKind == JsonValueKind.Number && prop.TryGetInt32(out var intValue))
                return intValue.ToString(CultureInfo.InvariantCulture);

            return prop.GetString();
        }
        return null;
    }

    private static bool TryGetProperty(JsonElement element, string camelName, string pascalName, out JsonElement property)
    {
        if (element.TryGetProperty(camelName, out property))
            return true;
        if (element.TryGetProperty(pascalName, out property))
            return true;
        return false;
    }

    private static Guid GetGuid(JsonElement element, string camelName, string pascalName)
    {
        if (TryGetProperty(element, camelName, pascalName, out var prop) && prop.TryGetGuid(out var guid))
            return guid;
        return Guid.Empty;
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
