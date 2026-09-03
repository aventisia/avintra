namespace WorkspaceAPIs.Features.CloudConnectors.Camel.Helpers;

/// <summary>
/// Resolves standard paths under <c>Features/CloudConnectors</c>. Both the
/// source content root and the published app base directory are tried so the
/// same helpers work in development and production.
/// </summary>
public sealed class CamelConfigPaths
{
    private readonly IWebHostEnvironment _env;

    public CamelConfigPaths(IWebHostEnvironment env)
    {
        _env = env;
    }

    /// <summary>Root directory for generated Camel connector config files.</summary>
    public string ConfigFilesRoot => Resolve("ConfigFiles", "Camel");

    /// <summary>Path to the action-selector mapping file.</summary>
    public string ActionSelectorMapping => Resolve("ConfigFiles", "CloudConnectorActionSelectorMappingFile.json");

    /// <summary>
    /// Resolves the family directory that contains a connector's action JSON
    /// files.
    /// </summary>
    public string FamilyDirectory(string family)
    {
        return Path.Combine(ConfigFilesRoot, family.ToLowerInvariant());
    }

    /// <summary>
    /// Resolves the full path for a connector action config file.
    /// </summary>
    public string ActionConfigFile(string family, string action)
    {
        return Path.Combine(FamilyDirectory(family), $"{action}Connector.json");
    }

    /// <summary>
    /// Resolves the path to the curated Camel action mapping JSON.
    /// </summary>
    public string ActionMapping => Resolve("Camel", "Helpers", "CamelActionMapping.json");

    /// <summary>
    /// Resolves a path relative to the CloudConnectors feature folder.
    /// </summary>
    public string Resolve(params string[] parts)
    {
        try
        {
            return Path.Combine(_env.ContentRootPath, "Features", "CloudConnectors", Path.Combine(parts));
        }
        catch
        {
            return Path.Combine(AppContext.BaseDirectory, "Features", "CloudConnectors", Path.Combine(parts));
        }
    }
}
