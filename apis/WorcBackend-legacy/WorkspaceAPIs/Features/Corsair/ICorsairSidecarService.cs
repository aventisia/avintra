namespace WorkspaceAPIs.Services;

/// <summary>
/// Client for the Corsair sidecar used to mirror API-key credentials and invoke plugin operations.
/// </summary>
public interface ICorsairSidecarService
{
    /// <summary>
    /// Mirrors an API-key credential into the Corsair sidecar.
    /// </summary>
    /// <param name="connectionId">Stable connection handle (AppSecret Id).</param>
    /// <param name="plugin">Target plugin identifier.</param>
    /// <param name="credentials">Decrypted credential fields to store.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns><c>true</c> when the sidecar acknowledged the mirror.</returns>
    Task<bool> MirrorCredentialAsync(Guid connectionId, string plugin, IReadOnlyDictionary<string, string> credentials, CancellationToken cancellationToken = default);

    Task<CorsairCredentialTestResult?> TestCredentialAsync(Guid connectionId, string plugin, CancellationToken cancellationToken = default);

    /// <summary>
    /// Clears a mirrored API-key credential from the Corsair sidecar.
    /// </summary>
    /// <param name="connectionId">Stable connection handle (AppSecret Id).</param>
    /// <param name="plugin">Target plugin identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns><c>true</c> when the sidecar acknowledged the delete.</returns>
    Task<bool> DeleteCredentialAsync(Guid connectionId, string plugin, CancellationToken cancellationToken = default);

    /// <summary>
    /// Stores tenant-scoped OAuth integration keys (client_id, client_secret, redirect_url)
    /// for a plugin in the Corsair sidecar.
    /// </summary>
    /// <param name="connectionId">Stable connection handle (AppSecret Id) used as the Corsair tenant.</param>
    /// <param name="plugin">Target plugin identifier.</param>
    /// <param name="clientId">OAuth client id.</param>
    /// <param name="clientSecret">OAuth client secret.</param>
    /// <param name="redirectUrl">Platform-managed OAuth redirect URL.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns><c>true</c> when the sidecar acknowledged the keys.</returns>
    Task<bool> StoreIntegrationKeysAsync(Guid connectionId, string plugin, string clientId, string clientSecret, string redirectUrl, CancellationToken cancellationToken = default);

    /// <summary>
    /// Mints a connect link for a tenant/plugin so the user can complete OAuth consent.
    /// </summary>
    /// <param name="connectionId">Stable connection handle (AppSecret Id) used as the Corsair tenant.</param>
    /// <param name="plugin">Target plugin identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The connect URL and expiry, or <c>null</c> on failure.</returns>
    Task<CorsairConnectLink?> CreateConnectLinkAsync(Guid connectionId, string plugin, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks whether a tenant has connected a plugin (OAuth consent completed).
    /// </summary>
    /// <param name="connectionId">Stable connection handle (AppSecret Id) used as the Corsair tenant.</param>
    /// <param name="plugin">Target plugin identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The connection status, or <c>null</c> on failure.</returns>
    Task<CorsairConnectionStatus?> GetConnectionStatusAsync(Guid connectionId, string plugin, CancellationToken cancellationToken = default);

    /// <summary>
    /// Invokes a Corsair plugin operation using a stored credential.
    /// </summary>
    /// <param name="connectionId">Stable connection handle (AppSecret Id) used as the Corsair tenant.</param>
    /// <param name="plugin">Target plugin identifier.</param>
    /// <param name="action">Dotted operation path, e.g. "github.issues.create".</param>
    /// <param name="payload">Operation payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The invocation result.</returns>
    Task<CorsairInvokeResult> InvokeAsync(Guid connectionId, string plugin, string action, object? payload, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks whether the Corsair sidecar is reachable and healthy.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The sidecar health status and the configured sidecar URL.</returns>
    Task<CorsairHealthResult> GetHealthAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Proxies the browser-facing OAuth consent page. The provider redirects the
    /// browser here with a signed <c>state</c>; the sidecar resolves it to the
    /// provider's authorization URL and redirects the browser onward.
    /// </summary>
    /// <param name="state">Signed connect state from the minted connect link.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The provider OAuth authorization URL to redirect the browser to.</returns>
    Task<string?> ResolveConnectAsync(string state, CancellationToken cancellationToken = default);

    /// <summary>
    /// Proxies the provider OAuth callback. The provider redirects the browser
    /// here with <c>code</c> + <c>state</c>; the sidecar exchanges the code for
    /// tokens, stores them per tenant, and returns the redirect URL that sends
    /// the browser back to the workspace app with the result.
    /// </summary>
    /// <param name="code">OAuth authorization code.</param>
    /// <param name="state">Signed connect state.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The workspace-app redirect URL (success or error), or <c>null</c> on failure.</returns>
    Task<string?> ProcessOAuthCallbackAsync(string code, string state, CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of invoking a Corsair plugin operation.
/// </summary>
public sealed class CorsairInvokeResult
{
    public bool Success { get; set; }
    public object? Data { get; set; }
    public string? Error { get; set; }
    public string? Details { get; set; }
    public bool NeedsConnect { get; set; }
    public string? Plugin { get; set; }
    public string? AuthType { get; set; }
    public bool ApprovalRequired { get; set; }
    public string? Message { get; set; }
    public string? ErrorType { get; set; }
    public bool Retryable { get; set; }
    public long? RetryAfterMs { get; set; }
}

/// <summary>
/// Result of minting a Corsair connect link.
/// </summary>
public sealed class CorsairConnectLink
{
    public string Plugin { get; set; } = string.Empty;
    public Guid ConnectionId { get; set; }
    public string ConnectUrl { get; set; } = string.Empty;
    public DateTimeOffset? ExpiresAt { get; set; }
}

/// <summary>
/// Connection status for a Corsair plugin/tenant.
/// </summary>
public sealed class CorsairConnectionStatus
{
    public string Plugin { get; set; } = string.Empty;
    public Guid ConnectionId { get; set; }
    public string State { get; set; } = string.Empty;
    public bool Connected { get; set; }
}

public sealed class CorsairCredentialTestResult
{
    public string Status { get; set; } = "Unknown";
    public string? Reason { get; set; }
}

/// <summary>
/// Health status of the Corsair sidecar as seen from the Workspace API.
/// </summary>
public sealed class CorsairHealthResult
{
    /// <summary>Sidecar-reported status ("ok") or "unreachable" when the call failed.</summary>
    public string Status { get; set; } = "Unknown";

    /// <summary>The configured sidecar base URL (CORSAIR_API_BASE_URL).</summary>
    public string SidecarUrl { get; set; } = string.Empty;

    /// <summary>Human-readable detail, e.g. the exception message when unreachable.</summary>
    public string? Reason { get; set; }
}
