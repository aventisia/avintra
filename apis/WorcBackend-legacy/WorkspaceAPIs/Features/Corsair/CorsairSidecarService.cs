using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using AspNetToolkit.Config;

namespace WorkspaceAPIs.Services;

/// <summary>
/// Implements the Corsair sidecar client using a named <see cref="HttpClient"/>.
/// </summary>
public sealed class CorsairSidecarService : ICorsairSidecarService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<CorsairSidecarService> _logger;

    public CorsairSidecarService(IHttpClientFactory httpClientFactory, EnvironmentConfig environmentConfig, ILogger<CorsairSidecarService> logger)
    {
        _httpClient = httpClientFactory.CreateClient("Corsair");
        _logger = logger;

        var sidecarUrl = environmentConfig.CorsairSidecarUrl;

        if (!string.IsNullOrEmpty(sidecarUrl))
        {
            _httpClient.BaseAddress = new Uri(sidecarUrl.TrimEnd('/'));
        }
    }

    /// <inheritdoc />
    public async Task<bool> MirrorCredentialAsync(Guid connectionId, string plugin, string apiKey, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(plugin) || string.IsNullOrWhiteSpace(apiKey))
        {
            return false;
        }

        try
        {
            var body = new
            {
                connectionId = connectionId.ToString(),
                plugin = plugin.ToLowerInvariant(),
                apiKey
            };

            var json = System.Text.Json.JsonSerializer.Serialize(body, JsonSerializerOptions.Web);
            using var content = new StringContent(json, Encoding.UTF8, MediaTypeHeaderValue.Parse("application/json"));
            var response = await _httpClient.PostAsync("/credentials", content, cancellationToken);
            response.EnsureSuccessStatusCode();

            _logger.LogInformation(
                "Mirrored credential {ConnectionId} for plugin {Plugin} to Corsair sidecar.",
                connectionId,
                plugin);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to mirror credential {ConnectionId} for plugin {Plugin} to Corsair sidecar.",
                connectionId,
                plugin);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<bool> DeleteCredentialAsync(Guid connectionId, string plugin, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(plugin))
        {
            return false;
        }

        try
        {
            var body = new
            {
                connectionId = connectionId.ToString(),
                plugin = plugin.ToLowerInvariant()
            };

            var json = System.Text.Json.JsonSerializer.Serialize(body, JsonSerializerOptions.Web);
            using var content = new StringContent(json, Encoding.UTF8, MediaTypeHeaderValue.Parse("application/json"));
            var response = await _httpClient.SendAsync(new HttpRequestMessage(HttpMethod.Delete, "/credentials") { Content = content }, cancellationToken);
            response.EnsureSuccessStatusCode();

            _logger.LogInformation(
                "Deleted mirrored credential {ConnectionId} for plugin {Plugin} from Corsair sidecar.",
                connectionId,
                plugin);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to delete mirrored credential {ConnectionId} for plugin {Plugin} from Corsair sidecar.",
                connectionId,
                plugin);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<bool> StoreIntegrationKeysAsync(Guid connectionId, string plugin, string clientId, string clientSecret, string redirectUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(plugin) || string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret) || string.IsNullOrWhiteSpace(redirectUrl))
        {
            return false;
        }

        try
        {
            var body = new
            {
                plugin = plugin.ToLowerInvariant(),
                tenantId = connectionId.ToString(),
                clientId,
                clientSecret,
                redirectUrl
            };

            var json = System.Text.Json.JsonSerializer.Serialize(body, JsonSerializerOptions.Web);
            using var content = new StringContent(json, Encoding.UTF8, MediaTypeHeaderValue.Parse("application/json"));
            var response = await _httpClient.PostAsync("/integration-keys", content, cancellationToken);
            response.EnsureSuccessStatusCode();

            _logger.LogInformation(
                "Stored OAuth integration keys for plugin {Plugin} tenant {ConnectionId} in Corsair sidecar.",
                plugin,
                connectionId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to store OAuth integration keys for plugin {Plugin} tenant {ConnectionId} in Corsair sidecar.",
                plugin,
                connectionId);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<CorsairConnectLink?> CreateConnectLinkAsync(Guid connectionId, string plugin, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(plugin))
        {
            return null;
        }

        try
        {
            var body = new
            {
                tenantId = connectionId.ToString(),
                plugin = plugin.ToLowerInvariant()
            };

            var json = System.Text.Json.JsonSerializer.Serialize(body, JsonSerializerOptions.Web);
            using var content = new StringContent(json, Encoding.UTF8, MediaTypeHeaderValue.Parse("application/json"));
            var response = await _httpClient.PostAsync("/connect/link", content, cancellationToken);
            var rawBody = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogInformation(
                "Corsair /connect/link status {Status} body: {Body}",
                (int)response.StatusCode,
                rawBody);
            response.EnsureSuccessStatusCode();

            var payload = System.Text.Json.JsonSerializer.Deserialize<CorsairConnectLinkResponse>(rawBody, JsonSerializerOptions.Web);
            if (payload is null || string.IsNullOrWhiteSpace(payload.ConnectUrl))
            {
                _logger.LogWarning(
                    "Corsair /connect/link returned no connectUrl for plugin {Plugin} tenant {ConnectionId}. Payload: {Payload}",
                    plugin,
                    connectionId,
                    rawBody);
                return null;
            }

            return new CorsairConnectLink
            {
                Plugin = payload.Plugin,
                ConnectionId = connectionId,
                ConnectUrl = payload.ConnectUrl,
                ExpiresAt = payload.ExpiresAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to create connect link for plugin {Plugin} tenant {ConnectionId} in Corsair sidecar.",
                plugin,
                connectionId);
            return null;
        }
    }

    /// <inheritdoc />
    public async Task<CorsairConnectionStatus?> GetConnectionStatusAsync(Guid connectionId, string plugin, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(plugin))
        {
            return null;
        }

        try
        {
            var body = new
            {
                tenantId = connectionId.ToString(),
                plugin = plugin.ToLowerInvariant()
            };

            var json = System.Text.Json.JsonSerializer.Serialize(body, JsonSerializerOptions.Web);
            using var content = new StringContent(json, Encoding.UTF8, MediaTypeHeaderValue.Parse("application/json"));
            var response = await _httpClient.PostAsync("/connect/status", content, cancellationToken);
            response.EnsureSuccessStatusCode();

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            var payload = await System.Text.Json.JsonSerializer.DeserializeAsync<CorsairConnectionStatusResponse>(stream, JsonSerializerOptions.Web, cancellationToken);
            if (payload is null)
            {
                return null;
            }

            return new CorsairConnectionStatus
            {
                Plugin = payload.Plugin,
                ConnectionId = connectionId,
                State = payload.State,
                Connected = payload.Connected
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to get connection status for plugin {Plugin} tenant {ConnectionId} from Corsair sidecar.",
                plugin,
                connectionId);
            return null;
        }
    }

    /// <inheritdoc />
    public async Task<CorsairInvokeResult> InvokeAsync(Guid connectionId, string plugin, string action, object? payload, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(plugin) || string.IsNullOrWhiteSpace(action))
        {
            return new CorsairInvokeResult { Success = false, Error = "plugin and action are required" };
        }

        try
        {
            // The sidecar is backend-only and private to the deployment network.
            // This service is the authorization boundary: the caller has already
            // been authenticated and authorized (Vault credential + resource-share)
            // before reaching this point, so no sidecar auth is required.
            var body = new
            {
                connectionId = connectionId.ToString(),
                plugin = plugin.ToLowerInvariant(),
                action,
                payload = payload ?? new { }
            };

            var json = System.Text.Json.JsonSerializer.Serialize(body, JsonSerializerOptions.Web);
            using var content = new StringContent(json, Encoding.UTF8, MediaTypeHeaderValue.Parse("application/json"));
            using var request = new HttpRequestMessage(HttpMethod.Post, "/corsair/invoke")
            {
                Content = content
            };

            var response = await _httpClient.SendAsync(request, cancellationToken);
            var rawBody = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Corsair /corsair/invoke status {Status} for plugin {Plugin} action {Action} tenant {ConnectionId}. Body: {Body}",
                    (int)response.StatusCode,
                    plugin,
                    action,
                    connectionId,
                    rawBody);
            }

            var payloadResult = System.Text.Json.JsonSerializer.Deserialize<CorsairInvokeResponse>(rawBody, JsonSerializerOptions.Web);
            if (payloadResult is null)
            {
                return new CorsairInvokeResult { Success = false, Error = "Empty response from Corsair sidecar" };
            }

            return new CorsairInvokeResult
            {
                Success = payloadResult.Success,
                Data = payloadResult.Data,
                Error = payloadResult.Error,
                Details = payloadResult.Details,
                NeedsConnect = payloadResult.NeedsConnect,
                Plugin = payloadResult.Plugin,
                AuthType = payloadResult.AuthType,
                ApprovalRequired = payloadResult.ApprovalRequired,
                Message = payloadResult.Message
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to invoke Corsair plugin {Plugin} action {Action} tenant {ConnectionId}.",
                plugin,
                action,
                connectionId);
            return new CorsairInvokeResult { Success = false, Error = ex.Message };
        }
    }

    private sealed class CorsairConnectLinkResponse
    {
        [JsonPropertyName("plugin")]
        public string Plugin { get; set; } = string.Empty;

        [JsonPropertyName("connectUrl")]
        public string ConnectUrl { get; set; } = string.Empty;

        [JsonPropertyName("expiresAt")]
        public DateTimeOffset? ExpiresAt { get; set; }
    }

    private sealed class CorsairConnectionStatusResponse
    {
        [JsonPropertyName("plugin")]
        public string Plugin { get; set; } = string.Empty;

        [JsonPropertyName("state")]
        public string State { get; set; } = string.Empty;

        [JsonPropertyName("connected")]
        public bool Connected { get; set; }
    }

    private sealed class CorsairInvokeResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("data")]
        public object? Data { get; set; }

        [JsonPropertyName("error")]
        public string? Error { get; set; }

        [JsonPropertyName("details")]
        public string? Details { get; set; }

        [JsonPropertyName("needsConnect")]
        public bool NeedsConnect { get; set; }

        [JsonPropertyName("plugin")]
        public string? Plugin { get; set; }

        [JsonPropertyName("authType")]
        public string? AuthType { get; set; }

        [JsonPropertyName("approvalRequired")]
        public bool ApprovalRequired { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }
    }
}
