using System.Reflection;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel.Services;

/// <summary>
/// Loads the Corsair integration catalog from
/// <c>Features/CloudConnectors/Camel/Helpers/CorsairIntegrationCatalog.json</c>
/// and exposes the set of <c>pluginId</c> values. These identifiers are used
/// to exclude any Apache Camel connector whose family name conflicts with a
/// Corsair-managed integration, so the same integration is not seeded twice.
/// </summary>
public class CorsairIntegrationCatalogRepository
{
    private readonly ILogger<CorsairIntegrationCatalogRepository> _logger;
    private readonly IWebHostEnvironment _env;

    private readonly object _gate = new();
    private IReadOnlySet<string>? _pluginIdCache;
    private IReadOnlyDictionary<string, string>? _iconCache;
    private DateTimeOffset _cacheTime = DateTimeOffset.MinValue;
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(15);

    private const string FileName = "CorsairIntegrationCatalog.json";
    private const string RelativePath = "Features/CloudConnectors/Camel/Helpers/" + FileName;

    public CorsairIntegrationCatalogRepository(
        ILogger<CorsairIntegrationCatalogRepository> logger,
        IWebHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    /// <summary>
    /// Returns all plugin IDs from the Corsair integration catalog as a
    /// case-insensitive set. Returns an empty set when the file is missing
    /// or empty.
    /// </summary>
    public IReadOnlySet<string> GetPluginIds()
    {
        EnsureLoaded();
        return _pluginIdCache ?? new HashSet<string>(StringComparer.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Returns the <c>icon</c> path for the integration whose
    /// <c>pluginId</c> matches <paramref name="connector">/</paramref>
    /// (case-insensitive), or null when not found.
    /// </summary>
    public string? GetIcon(string connector)
    {
        EnsureLoaded();
        if (string.IsNullOrWhiteSpace(connector))
        {
            return null;
        }

        var key = connector.ToLowerInvariant();
        return _iconCache?.TryGetValue(key, out var icon) == true ? icon : null;
    }

    /// <summary>
    /// Returns the icon map keyed by plugin id, alias plugin ids, and provider
    /// name. Callers normalize the keys before matching tool names.
    /// </summary>
    public IReadOnlyDictionary<string, string> GetIconMap()
    {
        EnsureLoaded();
        return _iconCache ?? new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Clears the in-memory cache so the next read re-parses the file.
    /// </summary>
    public void InvalidateCache()
    {
        lock (_gate)
        {
            _pluginIdCache = null;
            _iconCache = null;
            _cacheTime = DateTimeOffset.MinValue;
        }
    }

    private void EnsureLoaded()
    {
        lock (_gate)
        {
            if (_pluginIdCache != null && _iconCache != null
                && DateTimeOffset.UtcNow - _cacheTime < CacheTtl)
            {
                return;
            }
        }

        var (pluginIds, icons) = LoadCatalog();

        lock (_gate)
        {
            _pluginIdCache = pluginIds;
            _iconCache = icons;
            _cacheTime = DateTimeOffset.UtcNow;
        }
    }

    private (IReadOnlySet<string> PluginIds, IReadOnlyDictionary<string, string> Icons) LoadCatalog()
    {
        var json = ReadCatalogJson();
        if (string.IsNullOrWhiteSpace(json))
        {
            _logger.LogInformation("Corsair integration catalog file is missing or empty; returning empty exclusion set and icon map.");
            return (new HashSet<string>(StringComparer.OrdinalIgnoreCase),
                new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase));
        }

        try
        {
            using var document = System.Text.Json.JsonDocument.Parse(json);
            if (document.RootElement.ValueKind != System.Text.Json.JsonValueKind.Array)
            {
                _logger.LogWarning("Corsair integration catalog root is not a JSON array.");
                return (new HashSet<string>(StringComparer.OrdinalIgnoreCase),
                    new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase));
            }

            var pluginIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var icons = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var element in document.RootElement.EnumerateArray())
            {
                if (element.TryGetProperty("pluginId", out var pluginIdProperty)
                    && pluginIdProperty.ValueKind == System.Text.Json.JsonValueKind.String)
                {
                    var pluginId = pluginIdProperty.GetString()?.Trim();
                    if (!string.IsNullOrWhiteSpace(pluginId))
                    {
                        pluginIds.Add(pluginId);

                        if (element.TryGetProperty("icon", out var iconProperty)
                            && iconProperty.ValueKind == System.Text.Json.JsonValueKind.String)
                        {
                            var icon = iconProperty.GetString()?.Trim();
                            if (!string.IsNullOrWhiteSpace(icon))
                            {
                                // Index by plugin id, alias plugin ids, and provider name so a
                                // tool can be matched regardless of how its name was stored.
                                icons[pluginId.ToLowerInvariant()] = icon;

                                if (element.TryGetProperty("pluginIds", out var aliasesProperty)
                                    && aliasesProperty.ValueKind == System.Text.Json.JsonValueKind.Array)
                                {
                                    foreach (var aliasElement in aliasesProperty.EnumerateArray())
                                    {
                                        if (aliasElement.ValueKind != System.Text.Json.JsonValueKind.String)
                                        {
                                            continue;
                                        }

                                        var alias = aliasElement.GetString()?.Trim();
                                        if (!string.IsNullOrWhiteSpace(alias))
                                        {
                                            icons[alias.ToLowerInvariant()] = icon;
                                        }
                                    }
                                }

                                if (element.TryGetProperty("providerName", out var providerProperty)
                                    && providerProperty.ValueKind == System.Text.Json.JsonValueKind.String)
                                {
                                    var providerName = providerProperty.GetString()?.Trim();
                                    if (!string.IsNullOrWhiteSpace(providerName))
                                    {
                                        icons[providerName.ToLowerInvariant()] = icon;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            _logger.LogInformation("Loaded {Count} plugin IDs and {IconCount} icons from Corsair integration catalog.", pluginIds.Count, icons.Count);
            return (pluginIds, icons);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse Corsair integration catalog.");
            return (new HashSet<string>(StringComparer.OrdinalIgnoreCase),
                new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase));
        }
    }

    private string? ReadCatalogJson()
    {
        var filePath = ResolveFilePath();
        if (!string.IsNullOrEmpty(filePath) && System.IO.File.Exists(filePath))
        {
            try
            {
                return System.IO.File.ReadAllText(filePath);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to read Corsair integration catalog from {Path}; falling back to embedded resource.", filePath);
            }
        }

        return ReadEmbeddedResource();
    }

    private string? ResolveFilePath()
    {
        try
        {
            return Path.Combine(_env.ContentRootPath, RelativePath);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to resolve Corsair integration catalog path.");
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
            _logger.LogWarning(ex, "Failed to read embedded Corsair integration catalog.");
            return null;
        }
    }
}
