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

    // When running the Windows service continuously, a fixed JobId is not required.
    // When set, the service executes only that job and exits (used for console/manual runs).
    public Guid? JobId { get; set; }

    public string OsId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string AppVersion { get; set; } = "1.0.0";

    public bool IsServiceMode => !string.IsNullOrWhiteSpace(ApiKey) && !string.IsNullOrWhiteSpace(TenantId);
}
