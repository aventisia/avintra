namespace WorkspaceAPIs.Features.Corsair;

/// <summary>
/// Loads the generated Corsair config files
/// (<c>Features/CloudConnectors/ConfigFiles/Corsair/&lt;Plugin&gt;/&lt;Action&gt;Connector.json</c>)
/// and the separate <c>CorsairActionMap.json</c> that maps node names to the
/// exact sidecar invocation metadata.
///
/// The config files are the single source of truth for the node schema shown in
/// Studio. The action map is the single source of truth for the dotted sidecar
/// operation, so the backend never reconstructs it from a display name.
/// </summary>
public class CorsairConfigRepository
{
    private readonly ILogger<CorsairConfigRepository> _logger;
    private readonly IWebHostEnvironment _env;
    private readonly Dictionary<string, CorsairConnectorConfig> _configCache = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<string, CorsairActionInvocation> _invocationCache = new(StringComparer.OrdinalIgnoreCase);
    private readonly object _gate = new();

    public CorsairConfigRepository(
        ILogger<CorsairConfigRepository> logger,
        IWebHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    /// <summary>
    /// Resolves a Corsair config by plugin + action.
    /// <paramref name="action"/> is the PascalCase action segment used in the
    /// node name (e.g. "ApiIssuesList"); the file is named
    /// <c>&lt;Action&gt;Connector.json</c> under the plugin folder.
    /// </summary>
    public CorsairConnectorConfig? GetConfig(string plugin, string action)
    {
        if (string.IsNullOrWhiteSpace(plugin) || string.IsNullOrWhiteSpace(action))
        {
            return null;
        }
        var key = $"{plugin}/{action}";
        lock (_gate)
        {
            if (_configCache.TryGetValue(key, out var cached))
            {
                return cached;
            }
        }

        var path = ResolveConfigPath(plugin, action);
        if (path == null || !System.IO.File.Exists(path))
        {
            _logger.LogWarning("Corsair config not found for '{Plugin}/{Action}' (path {Path}).",
                plugin, action, path);
            return null;
        }

        try
        {
            // Read outside the lock to avoid blocking concurrent lookups during file I/O.
            var json = System.IO.File.ReadAllText(path);
            var config = System.Text.Json.JsonSerializer.Deserialize<CorsairConnectorConfig>(
                json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (config == null)
            {
                return null;
            }
            lock (_gate)
            {
                _configCache[key] = config;
            }
            return config;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse Corsair config '{Plugin}/{Action}'.", plugin, action);
            return null;
        }
    }

    /// <summary>
    /// Resolves the dotted sidecar action and invocation metadata for a node name.
    /// <paramref name="nodeName"/> is the full Studio node name, e.g.
    /// "Corsair/Github/ApiIssuesListConnector".
    /// </summary>
    public CorsairActionInvocation? GetInvocation(string nodeName)
    {
        if (string.IsNullOrWhiteSpace(nodeName))
        {
            return null;
        }

        lock (_gate)
        {
            if (_invocationCache.TryGetValue(nodeName, out var cached))
            {
                return cached;
            }
        }

        var mapPath = ResolveActionMapPath();
        if (mapPath == null || !System.IO.File.Exists(mapPath))
        {
            _logger.LogWarning("Corsair action map not found at {Path}.", mapPath);
            return null;
        }

        try
        {
            // Read outside the lock to avoid blocking concurrent lookups during file I/O.
            var json = System.IO.File.ReadAllText(mapPath);
            var map = System.Text.Json.JsonSerializer.Deserialize<List<CorsairActionInvocation>>(
                json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (map == null)
            {
                return null;
            }

            var invocation = map.FirstOrDefault(i =>
                string.Equals(i.NodeName, nodeName, StringComparison.OrdinalIgnoreCase));
            if (invocation == null)
            {
                _logger.LogWarning("No Corsair invocation metadata found for node '{NodeName}'.", nodeName);
                return null;
            }

            lock (_gate)
            {
                _invocationCache[nodeName] = invocation;
            }
            return invocation;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse Corsair action map.");
            return null;
        }
    }

    private string? ResolveConfigPath(string plugin, string action)
    {
        string root;
        try
        {
            root = Path.Combine(_env.ContentRootPath, "Features", "CloudConnectors", "ConfigFiles", "Corsair");
        }
        catch
        {
            // Fall back to the app base directory (published output).
            root = Path.Combine(AppContext.BaseDirectory, "Features", "CloudConnectors", "ConfigFiles", "Corsair");
        }
        var pluginDir = char.ToUpperInvariant(plugin[0]) + plugin[1..];
        // The generated file is named "<Action>Connector.json" (Cloud Connector convention).
        var actionSegment = action.EndsWith("Connector", StringComparison.OrdinalIgnoreCase)
            ? action
            : action + "Connector";
        return Path.Combine(root, pluginDir, $"{actionSegment}.json");
    }

    private string? ResolveActionMapPath()
    {
        try
        {
            return Path.Combine(_env.ContentRootPath, "Features", "CloudConnectors", "ConfigFiles", "CorsairActionMap.json");
        }
        catch
        {
            return Path.Combine(AppContext.BaseDirectory, "Features", "CloudConnectors", "ConfigFiles", "CorsairActionMap.json");
        }
    }
}
