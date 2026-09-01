namespace WorkspaceAPIs.Features.CloudConnectors.Camel;

/// <summary>
/// Loads the generated Camel connector config files
/// (<c>Features/CloudConnectors/ConfigFiles/Camel/&lt;Family&gt;/&lt;Action&gt;Connector.json</c>)
/// and resolves them by (family, action).
///
/// The config files are the single source of truth for the node schema AND the
/// <c>camel</c> metadata block the proxy uses to convert node fields into the
/// harness <c>ConnectorRequest</c> envelope. Resolving from the same JSON the
/// frontend renders guarantees the proxy always agrees with the canvas.
/// </summary>
public class CamelConnectorsConfigRepository
{
    private readonly ILogger<CamelConnectorsConfigRepository> _logger;
    private readonly IWebHostEnvironment _env;
    private readonly Dictionary<string, CamelConnectorConfig> _cache = new(StringComparer.OrdinalIgnoreCase);
    private readonly object _gate = new();

    public CamelConnectorsConfigRepository(
        ILogger<CamelConnectorsConfigRepository> logger,
        IWebHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    /// <summary>
    /// Resolves a connector config by family + action.
    /// Action is the PascalCase action segment ("RepositoryCreate"); the file is
    /// named <c>&lt;Action&gt;Connector.json</c> under the family folder.
    /// </summary>
    public CamelConnectorConfig? Get(string family, string action)
    {
        if (string.IsNullOrWhiteSpace(family) || string.IsNullOrWhiteSpace(action))
        {
            return null;
        }
        var key = $"{family}/{action}";
        lock (_gate)
        {
            if (_cache.TryGetValue(key, out var cached))
            {
                return cached;
            }
        }

        var path = ResolvePath(family, action);
        if (path == null || !System.IO.File.Exists(path))
        {
            _logger.LogWarning("Camel connector config not found for '{Family}/{Action}' (path {Path}).",
                family, action, path);
            return null;
        }

        try
        {
            var json = System.IO.File.ReadAllText(path);
            var config = System.Text.Json.JsonSerializer.Deserialize<CamelConnectorConfig>(
                json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (config == null)
            {
                return null;
            }
            lock (_gate)
            {
                _cache[key] = config;
            }
            return config;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse Camel connector config '{Family}/{Action}'.", family, action);
            return null;
        }
    }

    private string? ResolvePath(string family, string action)
    {
        // Check the legacy Camel/ root first, then the CamelV2/ root.
        var legacy = ResolvePathUnderRoot(family, action, "Camel");
        if (legacy != null && System.IO.File.Exists(legacy))
        {
            return legacy;
        }
        return ResolvePathUnderRoot(family, action, "CamelV2");
    }

    private string? ResolvePathUnderRoot(string family, string action, string rootName)
    {
        string root;
        try
        {
            root = Path.Combine(_env.ContentRootPath, "Features", "CloudConnectors", "ConfigFiles", rootName);
        }
        catch
        {
            // Fall back to the app base directory (published output).
            root = Path.Combine(AppContext.BaseDirectory, "Features", "CloudConnectors", "ConfigFiles", rootName);
        }
        return Path.Combine(root, family, $"{action}Connector.json");
    }
}
