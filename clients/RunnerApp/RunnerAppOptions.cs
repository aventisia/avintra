namespace RunnerApp;

public class RunnerAppOptions
{
    // Backend API base URL. Required for all modes.
    public string AppBaseUrl { get; set; } = string.Empty;

    // JWT bearer token used for console (single-job) execution.
    public string AccessToken { get; set; } = string.Empty;

    // Optional tenant API key used by the Windows service for long-lived registration.
    public string ApiKey { get; set; } = string.Empty;

    // Tenant ID used together with the API key (X-TENANT-ID header).
    public string TenantId { get; set; } = string.Empty;

    // Linked workspace username used together with the API key.
    public string LinkedUsername { get; set; } = string.Empty;

    // Local Tauri WebSocket server port. Used only in local (non-service) mode to push node
    // progress and receive abort/pause/resume control messages. 0 means "not connected".
    public int WebsocketPort { get; set; }

    // When running the Windows service continuously, a fixed JobId is not required.
    // When set, the service executes only that job and exits (used for console/manual runs).
    public Guid? JobId { get; set; }

    // TODO: not required since osId can be get by the RunnerApp itself
    public string OsId { get; set; } = MachineIdentity.OsId;

    // TODO: not required since operating system's Username can be get by the RunnerApp itself
    public string Username { get; set; } = MachineIdentity.Username;

    /// <summary>
    /// True when running as the long-lived Windows service (tenant apiKey + tenantId present):
    /// machine registration + server SignalR over the backend OrchestratorHub. False for local
    /// single-shot execution of an unpublished, under-development flow, where progress and
    /// control travel over the local Tauri WebSocket.
    /// </summary>
    public bool IsServiceMode => !string.IsNullOrWhiteSpace(ApiKey) && !string.IsNullOrWhiteSpace(TenantId);
}
