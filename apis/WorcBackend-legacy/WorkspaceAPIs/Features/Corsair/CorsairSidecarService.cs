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
        var apiKey = environmentConfig.CorsairApiKey;

        if (!string.IsNullOrEmpty(sidecarUrl))
        {
            _httpClient.BaseAddress = new Uri(sidecarUrl.TrimEnd('/'));
        }

        if (!string.IsNullOrEmpty(apiKey))
        {
            _httpClient.DefaultRequestHeaders.Add("X-Corsair-Api-Key", apiKey);
        }
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CorsairToolDescriptor>> GetToolsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync("/api/corsair/tools", cancellationToken);
            response.EnsureSuccessStatusCode();

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            var payload = await System.Text.Json.JsonSerializer.DeserializeAsync<CorsairToolsResponse>(stream, JsonSerializerOptions.Web, cancellationToken);
            return payload?.Tools ?? [];
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch tools from Corsair sidecar at {BaseAddress}.", _httpClient.BaseAddress);
            return [];
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

    private sealed class CorsairToolsResponse
    {
        [JsonPropertyName("tools")]
        public List<CorsairToolDescriptor> Tools { get; set; } = [];
    }
}
