using System.Reflection;
using System.Text;

namespace WorkspaceAPIs.Features.CloudConnectors.CamelV2.Services;

/// <summary>
/// Ensures the Cloud-Connector mapping files exist on disk at startup.
///
/// The following artifacts are NOT derivable from the harness catalog at
/// runtime (they are curated: hand-coded selector groups, family labels/icons,
/// operation->action name spellings), so they are embedded in the assembly and
/// restored verbatim when missing:
///   - <c>ConfigFiles/CloudConnectorActionSelectorMappingFile.json</c> (node selector)
///   - <c>CamelV2/Helpers/CamelActionMapping.json</c> (action -> operation mapping)
///   - <c>CamelV2/openapi/github.openapi.json</c>
///   - <c>CamelV2/openapi/m365.openapi.json</c>
///
/// Restoration is idempotent: existing files are never overwritten, so the
/// committed on-disk files remain the source of truth once present.
/// </summary>
public class CamelV2MappingFilesGenerator
{
    private readonly ILogger<CamelV2MappingFilesGenerator> _logger;
    private readonly IWebHostEnvironment _env;

    public CamelV2MappingFilesGenerator(
        ILogger<CamelV2MappingFilesGenerator> logger,
        IWebHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    /// <summary>
    /// List of (embedded-resource logical name, relative path under
    /// <c>Features/CloudConnectors</c>) pairs to restore when missing.
    /// </summary>
    private static readonly (string ResourceName, string RelativePath)[] MappingFiles =
    {
        ("CloudConnectorActionSelectorMappingFile.json", Path.Combine("ConfigFiles", "CloudConnectorActionSelectorMappingFile.json")),
        ("CamelV2.CamelActionMapping.json", Path.Combine("CamelV2", "Helpers", "CamelActionMapping.json")),
        ("CamelV2.openapi.github.openapi.json", Path.Combine("CamelV2", "openapi", "github.openapi.json")),
        ("CamelV2.openapi.m365.openapi.json", Path.Combine("CamelV2", "openapi", "m365.openapi.json")),
    };

    /// <summary>
    /// Restores any missing mapping files from embedded resources. Returns the
    /// number of files written (0 when all already exist).
    /// </summary>
    public int RestoreMissing()
    {
        var configRoot = GetConfigRoot();
        var restored = 0;

        foreach (var (resourceName, relativePath) in MappingFiles)
        {
            var targetPath = Path.Combine(configRoot, relativePath);
            if (System.IO.File.Exists(targetPath))
            {
                continue;
            }

            try
            {
                var content = ReadEmbeddedResource(resourceName);
                if (content is null)
                {
                    continue;
                }

                var directory = Path.GetDirectoryName(targetPath);
                if (!string.IsNullOrEmpty(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                // Write the embedded bytes verbatim (the committed source file is
                // already the canonical LF + 2-space-indent, no-BOM form).
                System.IO.File.WriteAllText(targetPath, content, new UTF8Encoding(encoderShouldEmitUTF8Identifier: false));
                _logger.LogInformation("Restored Cloud-Connector mapping file {Path}.", targetPath);
                restored++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to restore Cloud-Connector mapping file {Path}.", targetPath);
            }
        }

        if (restored > 0)
        {
            _logger.LogInformation("Cloud-Connector mapping file restore complete: {Restored} file(s) restored.", restored);
        }

        return restored;
    }

    /// <summary>
    /// Resolves the <c>Features/CloudConnectors</c> root (content root, falling
    /// back to the app base directory for published output).
    /// </summary>
    private string GetConfigRoot()
    {
        try
        {
            return Path.Combine(
                _env.ContentRootPath,
                "Features", "CloudConnectors");
        }
        catch
        {
            return Path.Combine(
                AppContext.BaseDirectory,
                "Features", "CloudConnectors");
        }
    }

    private static string? ReadEmbeddedResource(string logicalName)
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = assembly
            .GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith("." + logicalName, StringComparison.OrdinalIgnoreCase)
                || n.Equals(logicalName, StringComparison.OrdinalIgnoreCase));

        if (resourceName is null)
        {
            // Fall back to a fully-qualified logical-name lookup.
            resourceName = assembly.GetManifestResourceNames()
                .FirstOrDefault(n => n.Contains(logicalName, StringComparison.OrdinalIgnoreCase));
        }

        if (resourceName is null)
        {
            return null;
        }

        using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream is null)
        {
            return null;
        }

        using var reader = new StreamReader(stream, Encoding.UTF8);
        return reader.ReadToEnd();
    }
}
