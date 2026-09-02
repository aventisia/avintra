using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using WorkspaceAPIs.Features.CloudConnectors.Camel.Helpers;
using WorkspaceAPIs.Features.CloudConnectors.Camel.Models;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel.Services;

/// <summary>
/// Generates Cloud Connector node config files for every Camel connector in the
/// harness catalog.
///
/// For each connector family a folder is created under
/// <c>ConfigFiles/Camel/&lt;Family&gt;/</c> and one <c>&lt;Action&gt;Connector.json</c>
/// file is written per supported operation (or a single generic node when the
/// schema has no operation enum). The generated files use the
/// <see cref="CamelConnectorConfig"/> shape so the generic
/// <see cref="CamelConnectorService"/> can resolve and invoke them.
///
/// Generation is idempotent: existing files are preserved (hand-maintained
/// schemas are never overwritten).
/// </summary>
public class CamelNodeGenerator
{
    private readonly ILogger<CamelNodeGenerator> _logger;
    private readonly IWebHostEnvironment _env;
    private readonly CamelCatalogClient _catalogClient;

    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public CamelNodeGenerator(
        ILogger<CamelNodeGenerator> logger,
        IWebHostEnvironment env,
        CamelCatalogClient catalogClient)
    {
        _logger = logger;
        _env = env;
        _catalogClient = catalogClient;
    }

    /// <summary>
    /// Generates connector config files for all connectors in the catalog.
    /// Returns the number of files written.
    /// </summary>
    public async Task<int> GenerateAsync(CancellationToken cancellationToken = default)
    {
        var root = GetConfigRoot();

        // Every connector comes from the harness catalog — nothing is hardcoded.
        // When the catalog is empty (harness unreachable) no configs are generated.
        var written = 0;

        // Catalog-backed families.
        var catalog = await _catalogClient.GetCatalogAsync(cancellationToken);
        if (catalog.Count == 0)
        {
            _logger.LogWarning("Camel catalog is empty; skipping Camel catalog node generation.");
        }
        else
        {
            foreach (var (connector, schema) in catalog)
            {
                try
                {
                    written += GenerateForConnector(root, connector, schema);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error generating Camel nodes for connector '{Connector}'.", connector);
                }
            }
        }

        // 3. Regenerate the Camel connector mapping inside the "App Integrations"
        //    action-selector group from the generated connector configs so the
        //    frontend selector stays in lockstep with the recreated connectors.
        //    This always runs (even when the catalog is empty) so the scaffold
        //    families remain registered rather than disappearing while the
        //    harness is down. The dedicated "Apache Camel Connectors" group is
        //    removed.
        try
        {
            var mappingUpdated = RegenerateActionSelectorMapping(catalog);
            if (mappingUpdated)
            {
                _logger.LogInformation("Regenerated the Camel connector action-selector mapping under App Integrations.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to regenerate the Camel connector action-selector mapping.");
        }

        _logger.LogInformation("Generated {Written} Camel connector config files under {Root}.", written, root);
        return written;
    }

    /// <summary>
    /// Generates the config files for a single connector family. Returns the
    /// number of files written (0 when all already exist).
    /// </summary>
    private int GenerateForConnector(
        string root,
        string connector,
        CamelConnectorSchema schema)
    {
        var family = connector.ToLowerInvariant();
        var familyDisplay = CamelNodeNaming.ToFamilyDisplay(family);
        // Use the lowercase family name as the folder so the frontend mapping
        // `name` (Camel/&lt;family&gt;/&lt;Action&gt;Connector), the config-file
        // controller path, and the backend ResolveFamily all match
        // case-sensitively on Linux/Docker.
        var familyDir = Path.Combine(root, family);
        Directory.CreateDirectory(familyDir);

        var operations = schema.Operations();

        var written = 0;

        if (operations.Count == 0)
        {
            // No operation enum (catalog component without a hand-written
            // configurer): emit a single generic node.
            var action = CamelNodeNaming.ToActionName(family);
            if (string.IsNullOrWhiteSpace(action))
            {
                action = "Invoke";
            }
            if (WriteConfigFile(familyDir, family, familyDisplay, action, null, schema))
            {
                written++;
            }
            return written;
        }

        // Configuration fields always come from the harness family schema for
        // every connector (github/m365 included) — nothing is family-hardcoded.
        foreach (var operation in operations)
        {
            var action = CamelNodeNaming.ToActionName(operation);
            if (string.IsNullOrWhiteSpace(action))
            {
                continue;
            }
            if (WriteConfigFile(familyDir, family, familyDisplay, action, operation, schema))
            {
                written++;
            }
        }

        return written;
    }

    /// <summary>
    private bool WriteConfigFile(
        string familyDir,
        string family,
        string familyDisplay,
        string action,
        string? operation,
        CamelConnectorSchema schema)
    {
        var filePath = Path.Combine(familyDir, $"{action}Connector.json");
        if (System.IO.File.Exists(filePath))
        {
            _logger.LogDebug("Camel connector config already exists; skipping {Path}.", filePath);
            return false;
        }

        var config = BuildConfig(family, familyDisplay, action, operation, schema);
        var json = System.Text.Json.JsonSerializer.Serialize(config, SerializerOptions);
        System.IO.File.WriteAllText(filePath, json);
        _logger.LogInformation("Generated Camel connector config {Path}.", filePath);
        return true;
    }

    /// <summary>
    /// Builds a <see cref="CamelConnectorConfig"/> matching the existing
    /// <c>CamelConnectorConfig</c> shape.
    /// </summary>
    private static CamelConnectorConfig BuildConfig(
        string family,
        string familyDisplay,
        string action,
        string? operation,
        CamelConnectorSchema schema)
    {
        // For generic nodes (no operation enum) the action is derived from the
        // family itself, so the display name is just the family display
        // (e.g. "AWS S3") rather than "AWS S3 — AWS 2S3".
        var isGeneric = string.IsNullOrWhiteSpace(operation);
        var displayName = isGeneric
            ? familyDisplay
            : CamelNodeNaming.ToDisplayName(family, action);
        var description = isGeneric
            ? $"{familyDisplay} through the Camel connector."
            : CamelNodeNaming.ToDescription(family, action);
        var authType = InferAuthType(schema);
        var credentialFieldName = CredentialFieldName(family);

        var fields = new List<CamelConnectorField>();

        // Credential field (when the schema declares auth requirements).
        if (authType != "none")
        {
            fields.Add(new CamelConnectorField
            {
                Direction = "Input",
                Type = "credentials-select",
                Name = credentialFieldName,
                Label = $"{familyDisplay} Credential",
                Description = $"The {familyDisplay} credential used to authenticate API requests.",
                DefaultValue = "",
                Required = false,
            });
        }

        // Configuration fields (required first, then optional) are taken from the
        // harness family schema for every connector (github/m365 included): the
        // fields are never hardcoded per family.
        var configuration = schema.Configuration();
        if (configuration?.NestedProperties is { Count: > 0 } configProps)
        {
            var required = configuration.Required ?? new List<string>();
            foreach (var (name, prop) in configProps)
            {
                fields.Add(new CamelConnectorField
                {
                    Direction = "Input",
                    Type = MapFieldType(prop),
                    Name = name,
                    Label = ToLabel(name),
                    Description = prop.Description ?? $"Sets the {name} option.",
                    DefaultValue = prop.DefaultValue ?? "",
                    Required = required.Contains(name),
                    Camel = new CamelFieldMapping { Location = "property", Name = name },
                });
            }
        }

        // Payload field (request body as JSON).
        fields.Add(new CamelConnectorField
        {
            Direction = "Input",
            Type = "json-editor",
            Name = "payload",
            Label = "Payload",
            Description = "Request body as JSON (optional).",
            DefaultValue = "{}",
            Required = false,
            Camel = new CamelFieldMapping { Location = "property", Name = "payload" },
        });

        // Result output.
        fields.Add(new CamelConnectorField
        {
            Direction = "Output",
            Type = "config-panel-output",
            Name = "Result",
            Label = "Result",
            Description = "Returns the response data from the connector.",
            DefaultValue = new Dictionary<string, object> { ["value"] = "Result", ["enabled"] = true },
            Required = false,
        });

        return new CamelConnectorConfig
        {
            Name = displayName,
            Description = description,
            Version = "1.0.0",
            Author = "@aventisia",
            SupportedPlatforms = new List<string> { "cloud", "windows" },
            ErrorHandling = "standard",
            TestScreenType = "standard",
            Connector = new CamelConnectorMeta
            {
                Name = family,
                Operation = operation,
                AuthType = authType,
            },
            Credentials = new CamelCredentialsMeta
            {
                Required = authType != "none",
                FieldName = authType != "none" ? credentialFieldName : null,
                Type = authType != "none" ? "credentials-select" : null,
            },
            Fields = fields,
        };
    }

    /// <summary>
    /// Builds a single Camel action node for the action-selector mapping.
    /// </summary>
    private static JsonObject BuildActionNode(
        string family,
        string familyIcon,
        string action,
        string label,
        string description)
        => new()
        {
            ["type"] = "cloudConnectorNode",
            ["name"] = $"Camel/{family}/{action}Connector",
            ["label"] = label,
            ["description"] = description,
            ["docsLink"] = "https://docs.aventisia.com",
            ["icon"] = null,
            ["img"] = familyIcon,
            ["supportedPlatforms"] = new JsonArray("cloud", "windows"),
        };

    /// <summary>
    /// Infers the harness auth type from the schema's auth section.
    /// </summary>
    private static string InferAuthType(CamelConnectorSchema schema)
    {
        var auth = schema.Auth();
        if (auth?.NestedProperties is not { Count: > 0 } props)
        {
            return "none";
        }
        if (props.ContainsKey("token") || props.ContainsKey("accessToken") || props.ContainsKey("bearer"))
        {
            return "accessToken";
        }
        if (props.ContainsKey("apiKey"))
        {
            return "apiKey";
        }
        if (props.ContainsKey("username") || props.ContainsKey("password"))
        {
            return "basic";
        }
        if (props.ContainsKey("clientId") || props.ContainsKey("clientSecret"))
        {
            return "client_credentials";
        }
        return "none";
    }

    /// <summary>
    /// Returns the credential field name for a family, following the existing
    /// convention (<c>__CredentialName__&lt;Family&gt;</c>).
    /// </summary>
    private static string CredentialFieldName(string family)
    {
        var display = CamelNodeNaming.ToFamilyDisplay(family);
        return $"__CredentialName__{display.Replace(" ", string.Empty)}";
    }

    /// <summary>
    /// Maps a schema property type to a config-panel field type.
    /// </summary>
    private static string MapFieldType(CamelConnectorSchemaProperty prop)
    {
        if (prop.EnumValues is { Count: > 0 })
        {
            return "select";
        }
        return prop.Type switch
        {
            "boolean" => "switch",
            "integer" or "number" => "number",
            "array" => "json-editor",
            "object" => "json-editor",
            _ => "text",
        };
    }

    /// <summary>
    /// Converts a camelCase option name into a human-readable label.
    /// </summary>
    private static string ToLabel(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return name;
        }
        var sb = new System.Text.StringBuilder();
        for (var i = 0; i < name.Length; i++)
        {
            var c = name[i];
            if (i == 0)
            {
                sb.Append(char.ToUpperInvariant(c));
            }
            else if (char.IsUpper(c))
            {
                sb.Append(' ').Append(c);
            }
            else
            {
                sb.Append(c);
            }
        }
        return sb.ToString();
    }

    /// <summary>
    /// Resolves the config root directory (content root, falling back to the app
    /// base directory for published output).
    /// </summary>
    private string GetConfigRoot()
    {
        try
        {
            return Path.Combine(_env.ContentRootPath, "Features", "CloudConnectors", "ConfigFiles", "Camel");
        }
        catch
        {
            return Path.Combine(AppContext.BaseDirectory, "Features", "CloudConnectors", "ConfigFiles", "Camel");
        }
    }

    /// <summary>
    /// Resolves the action-selector mapping file path (content root, falling back
    /// to the app base directory for published output).
    /// </summary>
    private string GetSelectorPath()
    {
        try
        {
            return Path.Combine(_env.ContentRootPath, "Features", "CloudConnectors", "ConfigFiles", "CloudConnectorActionSelectorMappingFile.json");
        }
        catch
        {
            return Path.Combine(AppContext.BaseDirectory, "Features", "CloudConnectors", "ConfigFiles", "CloudConnectorActionSelectorMappingFile.json");
        }
    }

    /// <summary>
    /// Rebuilds the Camel connector mapping inside the <c>App Integrations</c>
    /// L1 group of the action-selector mapping, driven directly by the harness
    /// catalog (<c>GET /api/connectors/schemas</c>) rather than a scan of the
    /// generated config files on disk. This guarantees every connector is mapped
    /// even when the config files have not been written yet (fresh checkout,
    /// after a clean, or right after startup).
    ///
    /// Each connector family becomes one L2 actionCategory; each supported
    /// operation becomes a <c>Camel/&lt;family&gt;/&lt;Action&gt;Connector</c> action (a
    /// single generic <c>Invoke</c> action for families without an operation
    /// enum). The generated categories are merged into <c>App Integrations</c>
    /// (existing hand-coded L2 categories such as Azure/Email/SendGrid/Twilio
    /// are preserved), and the dedicated <c>Apache Camel Connectors</c> L1 group
    /// is removed. Other L1 groups (AI Integrations, ...) are left untouched.
    ///
    /// Returns true when the mapping file was rewritten.
    /// </summary>
    private bool RegenerateActionSelectorMapping(
        IReadOnlyDictionary<string, CamelConnectorSchema> catalog)
    {
        var selectorPath = GetSelectorPath();
        if (!System.IO.File.Exists(selectorPath))
        {
            _logger.LogWarning("Action-selector mapping not found at {Path}; skipping mapping regeneration.", selectorPath);
            return false;
        }

        var categories = new List<JsonObject>();

        foreach (var (connector, schema) in catalog)
        {
            try
            {
                var family = connector.ToLowerInvariant();
                var familyDisplay = CamelNodeNaming.ToFamilyDisplay(family);
                var familyIcon = CamelNodeNaming.ToFamilyIcon(family);
                var actions = new JsonArray();

                var operations = schema.Operations();
                if (operations.Count == 0)
                {
                    // No operation enum: emit a single generic action, mirroring the
                    // config generation (BuildConfig).
                    var action = CamelNodeNaming.ToActionName(family);
                    if (string.IsNullOrWhiteSpace(action))
                    {
                        action = "Invoke";
                    }
                    actions.Add(BuildActionNode(
                        family, familyIcon, action,
                        familyDisplay, $"{familyDisplay} through the Camel connector."));
                }
                else
                {
                    foreach (var operation in operations)
                    {
                        var action = CamelNodeNaming.ToActionName(operation);
                        if (string.IsNullOrWhiteSpace(action))
                        {
                            continue;
                        }
                        actions.Add(BuildActionNode(
                            family, familyIcon, action,
                            CamelNodeNaming.ToDisplayName(family, action),
                            CamelNodeNaming.ToDescription(family, action)));
                    }
                }

                if (actions.Count == 0)
                {
                    continue;
                }

                categories.Add(new JsonObject
                {
                    ["label"] = familyDisplay,
                    ["description"] = $"{familyDisplay} through the Camel connector.",
                    ["icon"] = null,
                    ["img"] = familyIcon,
                    ["listType"] = null,
                    ["actions"] = actions,
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to build action-selector mapping for Camel connector '{Connector}'.", connector);
            }
        }

        // Sort L2 categories alphabetically by label (matches frontend behaviour).
        categories.Sort((a, b) => string.Compare(
            a["label"]?.GetValue<string>(), b["label"]?.GetValue<string>(), StringComparison.OrdinalIgnoreCase));

        var selector = JsonNode.Parse(System.IO.File.ReadAllText(selectorPath)) as JsonArray;
        if (selector is null)
        {
            _logger.LogWarning("Action-selector mapping is not a JSON array; skipping mapping regeneration.");
            return false;
        }

        // Remove the dedicated "Apache Camel Connectors" L1 group. Its generated
        // categories are now placed under "App Integrations" instead.
        selector.RemoveAll(node =>
            node is JsonObject obj
            && string.Equals(obj["label"]?.GetValue<string>(), "Apache Camel Connectors", StringComparison.Ordinal));

        // Find (or create) the "App Integrations" L1 group.
        JsonObject? appIntegrationsGroup = null;
        foreach (var node in selector)
        {
            if (node is JsonObject obj && string.Equals(obj["label"]?.GetValue<string>(), "App Integrations", StringComparison.Ordinal))
            {
                appIntegrationsGroup = obj;
                break;
            }
        }

        if (appIntegrationsGroup is null)
        {
            appIntegrationsGroup = new JsonObject
            {
                ["label"] = "App Integrations",
                ["description"] = "Seamlessly integrate with apps and services such as Twilio, Slack, and more",
                ["icon"] = "AppIntegrationsIcon",
                ["img"] = null,
            };
            selector.Add(appIntegrationsGroup);
        }

        // Merge the generated Camel categories into App Integrations, preserving
        // any existing hand-coded L2 categories (Azure, Email, SendGrid, Twilio,
        // M365*, ...). For a colliding L2 label the generated actions are appended
        // to the existing category's action list, de-duplicated by action name.
        var existingCategories = appIntegrationsGroup["actionCategories"] as JsonArray ?? new JsonArray();
        foreach (var generated in categories)
        {
            var label = generated["label"]?.GetValue<string>();
            JsonObject? existing = null;
            foreach (var node in existingCategories)
            {
                if (node is JsonObject obj && string.Equals(obj["label"]?.GetValue<string>(), label, StringComparison.Ordinal))
                {
                    existing = obj;
                    break;
                }
            }

            if (existing is null)
            {
                existingCategories.Add(generated);
                continue;
            }

            // Merge actions into the existing category (dedupe by name). Each
            // generated action node is already parented to `generated`'s own
            // actions array, so it MUST be deep-cloned before re-attaching;
            // reusing the node throws "The node already has a parent" on a
            // display-name collision (e.g. catalog twilio vs hand-coded Twilio).
            var mergedActions = existing["actions"] as JsonArray ?? new JsonArray();
            var generatedActions = generated["actions"] as JsonArray ?? new JsonArray();
            foreach (var actionNode in generatedActions)
            {
                var actionName = actionNode?["name"]?.GetValue<string>();
                var alreadyExists = mergedActions.Any(a =>
                    a?["name"]?.GetValue<string>() == actionName);
                if (!alreadyExists)
                {
                    mergedActions.Add(actionNode?.DeepClone());
                }
            }
            existing["actions"] = mergedActions;
        }
        appIntegrationsGroup["actionCategories"] = existingCategories;

        var json = selector.ToJsonString(new JsonSerializerOptions { WriteIndented = true });
        System.IO.File.WriteAllText(selectorPath, json);
        _logger.LogInformation("Regenerated {Count} Camel connector action categories under App Integrations in {Path}.",
            categories.Count, selectorPath);
        return true;
    }
}
