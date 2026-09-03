using System.Text.Json;
using AspNetToolkit.Config;
using WorkspaceAPIs.Features.CloudConnectors.Camel.Models;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel.Services;

/// <summary>
/// HTTP client for the Camel harness catalog endpoints.
///
/// Fetches the full connector catalog from
/// <c>GET {CamelApiBaseUrl}/api/connectors/schemas</c> (all ~350 components) or
/// a single connector from <c>GET {CamelApiBaseUrl}/api/connectors/{connector}/schema</c>.
/// Also exposes the connector list (<c>GET /api/connectors/</c>) and per-connector
/// operations list (<c>GET /api/connectors/{connector}/operations</c>) used by
/// the unified seeding workflow.
/// Results are cached in memory so the seeder/generator/controller share one view
/// of the catalog without hammering the harness.
/// </summary>
public class CamelCatalogClient
{
    private readonly ILogger<CamelCatalogClient> _logger;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly IHttpClientFactory _httpClientFactory;

    private readonly object _gate = new();
    private Dictionary<string, CamelConnectorSchema>? _cache;
    private DateTimeOffset _cacheTime = DateTimeOffset.MinValue;
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(15);

    private List<CamelConnectorListItem>? _listCache;
    private DateTimeOffset _listCacheTime = DateTimeOffset.MinValue;

    private readonly object _operationsGate = new();
    private readonly Dictionary<string, List<CamelConnectorOperationItem>> _operationsCache = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<string, DateTimeOffset> _operationsCacheTime = new(StringComparer.OrdinalIgnoreCase);

    public CamelCatalogClient(
        ILogger<CamelCatalogClient> logger,
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
    public async Task<IReadOnlyDictionary<string, CamelConnectorSchema>> GetCatalogAsync(
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
            return new Dictionary<string, CamelConnectorSchema>();
        }

        var url = $"{baseUrl}/api/connectors/schemas";
        try
        {
            using var client = _httpClientFactory.CreateClient("CamelConnectors");
            using var response = await client.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Camel harness returned {Status} for catalog at {Url}.", response.StatusCode, url);
                return new Dictionary<string, CamelConnectorSchema>();
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var catalog = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, CamelConnectorSchema>>(
                json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (catalog == null)
            {
                _logger.LogWarning("Camel harness returned an empty catalog at {Url}.", url);
                return new Dictionary<string, CamelConnectorSchema>();
            }

            // The schemas endpoint carries a generic "Request payload for the
            // Camel connector harness" description for every connector. Merge in
            // the authoritative Apache Camel component descriptions from
            // GET /api/connectors/ so consumers (action-selector mapping, node
            // configs) use the real component description instead of hardcoded /
            // generic prose.
            await MergeComponentDescriptionsAsync(catalog, baseUrl, cancellationToken);

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
            return new Dictionary<string, CamelConnectorSchema>();
        }
    }

    /// <summary>
    /// Fetches <c>GET /api/connectors/</c> (the authoritative Apache Camel
    /// component list with the real component description) and overwrites each
    /// schema's generic description with the component description. Best-effort:
    /// never fails the catalog load when the extra endpoint is unreachable.
    /// </summary>
    private async Task MergeComponentDescriptionsAsync(
        Dictionary<string, CamelConnectorSchema> catalog,
        string baseUrl,
        CancellationToken cancellationToken)
    {
        try
        {
            using var client = _httpClientFactory.CreateClient("CamelConnectors");
            using var response = await client.GetAsync($"{baseUrl}/api/connectors/", cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Camel harness returned {Status} for the connector list; component descriptions not merged.", response.StatusCode);
                return;
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var items = System.Text.Json.JsonSerializer.Deserialize<List<CamelConnectorListItem>>(
                json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (items is null)
            {
                return;
            }

            var merged = 0;
            foreach (var item in items)
            {
                if (string.IsNullOrWhiteSpace(item.Id) || string.IsNullOrWhiteSpace(item.Description))
                {
                    continue;
                }
                if (catalog.TryGetValue(item.Id.ToLowerInvariant(), out var schema))
                {
                    schema.Description = item.Description.Trim();
                    merged++;
                }
            }

            if (merged > 0)
            {
                _logger.LogInformation("Merged Apache Camel component descriptions for {Count} connectors.", merged);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to merge Apache Camel component descriptions from the harness connector list.");
        }
    }

    /// <summary>
    /// Returns the schema for a single connector, or null when unknown/unreachable.
    /// </summary>
    public async Task<CamelConnectorSchema?> GetConnectorAsync(
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
            return System.Text.Json.JsonSerializer.Deserialize<CamelConnectorSchema>(
                json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Camel connector schema for '{Connector}'.", connector);
            return null;
        }
    }

    /// <summary>
    /// Returns the connector list from <c>GET /api/connectors/</c>, caching it
    /// in memory. Returns an empty list when the harness is unreachable.
    /// </summary>
    public async Task<IReadOnlyList<CamelConnectorListItem>> GetConnectorListAsync(
        CancellationToken cancellationToken = default)
    {
        lock (_gate)
        {
            if (_listCache != null && DateTimeOffset.UtcNow - _listCacheTime < CacheTtl)
            {
                return _listCache;
            }
        }

        var baseUrl = _environmentConfig.CamelApiBaseUrl?.TrimEnd('/');
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            _logger.LogWarning("Camel API base URL is not configured; cannot fetch connector list.");
            return new List<CamelConnectorListItem>();
        }

        var url = $"{baseUrl}/api/connectors/";
        try
        {
            using var client = _httpClientFactory.CreateClient("CamelConnectors");
            using var response = await client.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Camel harness returned {Status} for connector list at {Url}.", response.StatusCode, url);
                return new List<CamelConnectorListItem>();
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var items = System.Text.Json.JsonSerializer.Deserialize<List<CamelConnectorListItem>>(
                json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            var list = items ?? new List<CamelConnectorListItem>();

            lock (_gate)
            {
                _listCache = list;
                _listCacheTime = DateTimeOffset.UtcNow;
            }

            _logger.LogInformation("Fetched {Count} connectors from the Camel harness list endpoint.", list.Count);
            return list;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Camel connector list from {Url}.", url);
            return new List<CamelConnectorListItem>();
        }
    }

    /// <summary>
    /// Returns the operation list for a single connector from
    /// <c>GET /api/connectors/{connector}/operations</c>, caching it per
    /// connector. Returns an empty list when the harness is unreachable or the
    /// connector has no declared operations.
    /// </summary>
    public async Task<IReadOnlyList<CamelConnectorOperationItem>> GetConnectorOperationsAsync(
        string connector,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(connector))
        {
            return new List<CamelConnectorOperationItem>();
        }

        var key = connector.ToLowerInvariant();
        lock (_operationsGate)
        {
            if (_operationsCache.TryGetValue(key, out var cached)
                && DateTimeOffset.UtcNow - _operationsCacheTime[key] < CacheTtl)
            {
                return cached;
            }
        }

        var baseUrl = _environmentConfig.CamelApiBaseUrl?.TrimEnd('/');
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            _logger.LogWarning("Camel API base URL is not configured; cannot fetch operations for '{Connector}'.", connector);
            return new List<CamelConnectorOperationItem>();
        }

        var url = $"{baseUrl}/api/connectors/{connector}/operations";
        try
        {
            using var client = _httpClientFactory.CreateClient("CamelConnectors");
            using var response = await client.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Camel harness returned {Status} for operations at {Url}.", response.StatusCode, url);
                return new List<CamelConnectorOperationItem>();
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var items = System.Text.Json.JsonSerializer.Deserialize<List<CamelConnectorOperationItem>>(
                json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            var list = items ?? new List<CamelConnectorOperationItem>();

            lock (_operationsGate)
            {
                _operationsCache[key] = list;
                _operationsCacheTime[key] = DateTimeOffset.UtcNow;
            }

            _logger.LogDebug("Fetched {Count} operations for Camel connector '{Connector}'.", list.Count, connector);
            return list;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch operations for Camel connector '{Connector}' from {Url}.", connector, url);
            return new List<CamelConnectorOperationItem>();
        }
    }

    /// <summary>Clears the in-memory catalog cache (used by the refresh endpoint).</summary>
    public void InvalidateCache()
    {
        lock (_gate)
        {
            _cache = null;
            _cacheTime = DateTimeOffset.MinValue;
            _listCache = null;
            _listCacheTime = DateTimeOffset.MinValue;
        }

        lock (_operationsGate)
        {
            _operationsCache.Clear();
            _operationsCacheTime.Clear();
        }
    }
}
