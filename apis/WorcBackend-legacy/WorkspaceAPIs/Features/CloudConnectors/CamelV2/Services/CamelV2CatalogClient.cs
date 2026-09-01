using System.Text.Json;
using AspNetToolkit.Config;
using WorkspaceAPIs.Features.CloudConnectors.CamelV2.Models;

namespace WorkspaceAPIs.Features.CloudConnectors.CamelV2.Services;

/// <summary>
/// HTTP client for the Camel harness catalog endpoints.
///
/// Fetches the full connector catalog from
/// <c>GET {CamelApiBaseUrl}/api/connectors/schemas</c> (all ~350 components) or
/// a single connector from <c>GET {CamelApiBaseUrl}/api/connectors/{connector}/schema</c>.
/// Results are cached in memory so the seeder/generator/controller share one view
/// of the catalog without hammering the harness.
/// </summary>
public class CamelV2CatalogClient
{
    private readonly ILogger<CamelV2CatalogClient> _logger;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly IHttpClientFactory _httpClientFactory;

    private readonly object _gate = new();
    private Dictionary<string, CamelV2ConnectorSchema>? _cache;
    private DateTimeOffset _cacheTime = DateTimeOffset.MinValue;
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(15);
    private readonly Dictionary<string, IReadOnlyDictionary<string, CamelV2ConnectorSchema>> _opSchemaCache = new();

    public CamelV2CatalogClient(
        ILogger<CamelV2CatalogClient> logger,
        EnvironmentConfig environmentConfig,
        IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _environmentConfig = environmentConfig;
        _httpClientFactory = httpClientFactory;
    }

    /// <summary>
    /// Returns the full connector catalog (connector name → schema), fetching and
    /// caching it on first use. Returns an empty dictionary when the harness is
    /// unreachable.
    /// </summary>
    public async Task<IReadOnlyDictionary<string, CamelV2ConnectorSchema>> GetCatalogAsync(
        CancellationToken cancellationToken = default)
    {
        lock (_gate)
        {
            if (_cache != null && DateTimeOffset.UtcNow - _cacheTime < CacheTtl)
            {
                return _cache;
            }
        }

        var baseUrl = _environmentConfig.CamelApiBaseUrl?.TrimEnd('/');
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            _logger.LogWarning("Camel API base URL is not configured; cannot fetch connector catalog.");
            return new Dictionary<string, CamelV2ConnectorSchema>();
        }

        var url = $"{baseUrl}/api/connectors/schemas";
        try
        {
            using var client = _httpClientFactory.CreateClient("CamelConnectors");
            using var response = await client.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Camel harness returned {Status} for catalog at {Url}.", response.StatusCode, url);
                return new Dictionary<string, CamelV2ConnectorSchema>();
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var catalog = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, CamelV2ConnectorSchema>>(
                json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (catalog == null)
            {
                _logger.LogWarning("Camel harness returned an empty catalog at {Url}.", url);
                return new Dictionary<string, CamelV2ConnectorSchema>();
            }

            lock (_gate)
            {
                _cache = catalog;
                _cacheTime = DateTimeOffset.UtcNow;
            }

            _logger.LogInformation("Fetched {Count} Camel connectors from the harness catalog.", catalog.Count);
            return catalog;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Camel connector catalog from {Url}.", url);
            return new Dictionary<string, CamelV2ConnectorSchema>();
        }
    }

    /// <summary>
    /// Returns the schema for a single connector, or null when unknown/unreachable.
    /// </summary>
    public async Task<CamelV2ConnectorSchema?> GetConnectorAsync(
        string connector,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(connector))
        {
            return null;
        }

        var catalog = await GetCatalogAsync(cancellationToken);
        if (catalog.TryGetValue(connector.ToLowerInvariant(), out var schema))
        {
            return schema;
        }

        // Fall back to the per-connector endpoint (e.g. after a harness restart).
        var baseUrl = _environmentConfig.CamelApiBaseUrl?.TrimEnd('/');
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return null;
        }

        var url = $"{baseUrl}/api/connectors/{connector}/schema";
        try
        {
            using var client = _httpClientFactory.CreateClient("CamelConnectors");
            using var response = await client.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }
            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            return System.Text.Json.JsonSerializer.Deserialize<CamelV2ConnectorSchema>(
                json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Camel connector schema for '{Connector}'.", connector);
            return null;
        }
    }

    /// <summary>
    /// Returns the per-operation schema for a connector, or null when the harness
    /// does not expose one (most catalog components have a single family schema).
    /// Fetched from <c>GET {CamelApiBaseUrl}/api/connectors/{connector}/operations/{operation}/schema</c>.
    /// </summary>
    public async Task<CamelV2ConnectorSchema?> GetOperationSchemaAsync(
        string connector,
        string operation,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(connector) || string.IsNullOrWhiteSpace(operation))
        {
            return null;
        }

        var baseUrl = _environmentConfig.CamelApiBaseUrl?.TrimEnd('/');
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return null;
        }

        var url = $"{baseUrl}/api/connectors/{Uri.EscapeDataString(connector)}/operations/{Uri.EscapeDataString(operation)}/schema";
        try
        {
            using var client = _httpClientFactory.CreateClient("CamelConnectors");
            using var response = await client.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }
            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            return System.Text.Json.JsonSerializer.Deserialize<CamelV2ConnectorSchema>(
                json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Camel per-operation schema for '{Connector}/{Operation}'.",
                connector, operation);
            return null;
        }
    }

    /// <summary>
    /// Fetches the per-operation schemas for every operation a connector exposes.
    /// Returns an empty dictionary when the connector has no operation enum or the
    /// harness cannot be reached.
    /// </summary>
    public async Task<IReadOnlyDictionary<string, CamelV2ConnectorSchema>> GetOperationSchemasAsync(
        string connector,
        CancellationToken cancellationToken = default)
    {
        var key = connector.ToLowerInvariant();
        lock (_gate)
        {
            if (_opSchemaCache.TryGetValue(key, out var cached))
            {
                return cached;
            }
        }

        var familySchema = await GetConnectorAsync(connector, cancellationToken);
        if (familySchema is null)
        {
            return new Dictionary<string, CamelV2ConnectorSchema>();
        }

        var operations = familySchema.Operations();
        if (operations.Count == 0)
        {
            return new Dictionary<string, CamelV2ConnectorSchema>();
        }

        var result = new Dictionary<string, CamelV2ConnectorSchema>();
        foreach (var operation in operations)
        {
            var opSchema = await GetOperationSchemaAsync(connector, operation, cancellationToken);
            if (opSchema != null)
            {
                result[operation] = opSchema;
            }
        }

        lock (_gate)
        {
            _opSchemaCache[key] = result;
        }
        return result;
    }

    /// <summary>Clears the in-memory catalog cache (used by the refresh endpoint).</summary>
    public void InvalidateCache()
    {
        lock (_gate)
        {
            _cache = null;
            _cacheTime = DateTimeOffset.MinValue;
            _opSchemaCache.Clear();
        }
    }
}
