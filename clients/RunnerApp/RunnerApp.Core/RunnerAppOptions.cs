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

    /// <summary>
    /// Set by the --worker command-line flag. A worker is a short-lived per-job executor process
    /// spawned by the service (or, in future, by another launcher). It executes exactly one job,
    /// reports progress/completion to the backend, and exits.
    /// </summary>
    public bool IsWorkerMode { get; set; }

    /// <summary>
    /// Who launched the worker: "service" (Windows service), "studio" (Tauri desktop app),
    /// or "cli" (command line). Used to decide whether to connect to the local Tauri WebSocket,
    /// which only makes sense when launched from Studio.
    /// </summary>
    public string Launcher { get; set; } = "cli";

    /// <summary>
    /// When true the worker runs in the service's own non-interactive session (session 0) and
    /// must suppress all UI. The default is false, meaning the service launches the worker into
    /// the active interactive user session so MessageBox/Office dialogs can appear.
    /// </summary>
    public bool Unattended { get; set; }

    /// <summary>
    /// True when running as the long-lived Windows service (tenant apiKey + tenantId + linkedUsername present):
    /// machine registration + server SignalR over the backend OrchestratorHub. False for local
    /// single-shot execution of an unpublished, under-development flow, where progress and
    /// control travel over the local Tauri WebSocket.
    /// </summary>
    public bool IsServiceMode =>
        !string.IsNullOrWhiteSpace(ApiKey) &&
        !string.IsNullOrWhiteSpace(TenantId) &&
        !string.IsNullOrWhiteSpace(LinkedUsername);
}
