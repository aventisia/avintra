using System.Reflection;
using System.Text.Json;
using WorkspaceAPIs.Features.CloudConnectors.Camel.Models;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel.Services;

/// <summary>
/// Loads the local Apache Camel connector catalog from
/// <c>Features/CloudConnectors/Camel/Helpers/CamelIntegrationCatalog.json</c>.
/// The file is read from disk when present, and falls back to an embedded
/// resource for published output. Results are cached in memory so the seeder
/// and any controllers share one view of the catalog without re-parsing the file.
/// </summary>
public class CamelConnectorCatalogRepository
{
    private readonly ILogger<CamelConnectorCatalogRepository> _logger;
    private readonly IWebHostEnvironment _env;

    private readonly object _gate = new();
    private IReadOnlyDictionary<string, CamelConnectorCatalogEntry>? _cache;
    private DateTimeOffset _cacheTime = DateTimeOffset.MinValue;
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(15);

    private const string FileName = "CamelIntegrationCatalog.json";
    private const string RelativePath = "Features/CloudConnectors/Camel/Helpers/" + FileName;

    public CamelConnectorCatalogRepository(
        ILogger<CamelConnectorCatalogRepository> logger,
        IWebHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    /// <summary>
    /// Returns the local connector catalog keyed by lower-case connector name.
    /// Returns an empty dictionary when the catalog file is missing or empty.
    /// </summary>
    public IReadOnlyDictionary<string, CamelConnectorCatalogEntry> GetCatalog()
    {
        lock (_gate)
        {
            if (_cache != null && DateTimeOffset.UtcNow - _cacheTime < CacheTtl)
            {
                return _cache;
            }
        }

        var catalog = LoadCatalog();

        lock (_gate)
        {
            _cache = catalog;
            _cacheTime = DateTimeOffset.UtcNow;
        }

        return catalog;
    }

    /// <summary>
    /// Returns a single catalog entry by connector name, or null when not found.
    /// Lookup is case-insensitive.
    /// </summary>
    public CamelConnectorCatalogEntry? GetEntry(string connectorName)
    {
        if (string.IsNullOrWhiteSpace(connectorName))
        {
            return null;
        }

        var catalog = GetCatalog();
        return catalog.TryGetValue(connectorName.ToLowerInvariant(), out var entry) ? entry : null;
    }

    /// <summary>
    /// Clears the in-memory cache so the next read re-parses the file.
    /// </summary>
    public void InvalidateCache()
    {
        lock (_gate)
        {
            _cache = null;
            _cacheTime = DateTimeOffset.MinValue;
        }
    }

    private IReadOnlyDictionary<string, CamelConnectorCatalogEntry> LoadCatalog()
    {
        var json = ReadCatalogJson();
        if (string.IsNullOrWhiteSpace(json))
        {
            _logger.LogInformation("Local Camel connector catalog file is missing or empty; returning empty catalog.");
            return new Dictionary<string, CamelConnectorCatalogEntry>();
        }

        try
        {
            var entries = System.Text.Json.JsonSerializer.Deserialize<List<CamelConnectorCatalogEntry>>(
                json,
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (entries is null || entries.Count == 0)
            {
                _logger.LogInformation("Local Camel connector catalog file deserialized to an empty list.");
                return new Dictionary<string, CamelConnectorCatalogEntry>();
            }

            var catalog = entries
                .Where(e => !string.IsNullOrWhiteSpace(e.Name))
                .ToDictionary(
                    e => e.Name.ToLowerInvariant(),
                    e => e,
                    StringComparer.OrdinalIgnoreCase);

            _logger.LogInformation("Loaded {Count} entries from local Camel connector catalog.", catalog.Count);
            return catalog;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse local Camel connector catalog.");
            return new Dictionary<string, CamelConnectorCatalogEntry>();
        }
    }

    private string? ReadCatalogJson()
    {
        // Prefer the on-disk file in the source tree / content root.
        var filePath = ResolveFilePath();
        if (!string.IsNullOrEmpty(filePath) && System.IO.File.Exists(filePath))
        {
            try
            {
                return System.IO.File.ReadAllText(filePath);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to read local Camel connector catalog from {Path}; falling back to embedded resource.", filePath);
            }
        }

        // Fall back to an embedded resource for published output.
        return ReadEmbeddedResource();
    }

    private string? ResolveFilePath()
    {
        try
        {
            return Path.Combine(_env.ContentRootPath, RelativePath);
        }
        catch
        {
            return null;
        }
    }

    private string? ReadEmbeddedResource()
    {
        try
        {
            var assembly = Assembly.GetExecutingAssembly();
            var resourceName = assembly.GetManifestResourceNames()
                .FirstOrDefault(n => n.EndsWith(FileName, StringComparison.OrdinalIgnoreCase));

            if (resourceName is null)
            {
                return null;
            }

            using var stream = assembly.GetManifestResourceStream(resourceName);
            if (stream is null)
            {
                return null;
            }

            using var reader = new StreamReader(stream);
            return reader.ReadToEnd();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to read embedded Camel connector catalog.");
            return null;
        }
    }
}
