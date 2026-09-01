using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using WorkspaceAPIs.Features.CloudConnectors.CamelV2.Helpers;
using WorkspaceAPIs.Features.CloudConnectors.CamelV2.Models;
using WorkspaceAPIs.Features.CloudConnectors.CamelV2.Services;

namespace WorkspaceAPIs.Features.CloudConnectors.CamelV2.Services;

/// <summary>
/// Generates Cloud Connector node config files for every Camel connector in the
/// harness catalog.
///
/// For each connector family a folder is created under
/// <c>ConfigFiles/CamelV2/&lt;Family&gt;/</c> and one <c>&lt;Action&gt;Connector.json</c>
/// file is written per supported operation (or a single generic node when the
/// schema has no operation enum). The generated files match the existing
/// <c>CamelConnectorConfig</c> shape so the generic <c>CamelConnectorService</c>
/// can resolve and invoke them.
///
/// Generation is idempotent: existing files are preserved (hand-maintained
/// schemas are never overwritten).
/// </summary>
public class CamelV2NodeGenerator
{
    private readonly ILogger<CamelV2NodeGenerator> _logger;
    private readonly IWebHostEnvironment _env;
    private readonly CamelV2CatalogClient _catalogClient;

    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public CamelV2NodeGenerator(
        ILogger<CamelV2NodeGenerator> logger,
        IWebHostEnvironment env,
        CamelV2CatalogClient catalogClient)
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

        // 1. Scaffold families that are not present in the harness catalog but are
        //    expected to exist as CamelV2 connectors (idempotent: existing files
        //    are preserved).
        var written = GenerateScaffoldFamilies(root);

        // 2. Catalog-backed families.
        var catalog = await _catalogClient.GetCatalogAsync(cancellationToken);
        if (catalog.Count == 0)
        {
            _logger.LogWarning("Camel catalog is empty; skipping CamelV2 catalog node generation.");
            return written;
        }

        foreach (var (connector, schema) in catalog)
        {
            try
            {
                written += await GenerateForConnectorAsync(root, connector, schema, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating CamelV2 nodes for connector '{Connector}'.", connector);
            }
        }

        // 3. Regenerate the "Apache Camel Connectors" action-selector mapping from
        //    the generated connector configs so the frontend selector stays in
        //    lockstep with the recreated connectors.
        try
        {
            var mappingUpdated = RegenerateActionSelectorMapping();
            if (mappingUpdated)
            {
                _logger.LogInformation("Regenerated the Apache Camel Connectors action-selector mapping.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to regenerate the Apache Camel Connectors action-selector mapping.");
        }

        _logger.LogInformation("Generated {Written} CamelV2 connector config files under {Root}.", written, root);
        return written;
    }

    /// <summary>
    /// Generates the config files for a single connector family. Returns the
    /// number of files written (0 when all already exist).
    /// </summary>
    private async Task<int> GenerateForConnectorAsync(
        string root,
        string connector,
        CamelV2ConnectorSchema schema,
        CancellationToken cancellationToken)
    {
        var family = connector.ToLowerInvariant();
        var familyDisplay = CamelNodeNaming.ToFamilyDisplay(family);
        // Use the lowercase family name as the folder (e.g. "aws2-s3", "mongodb")
        // so the frontend mapping `name` (CamelV2/<family>/<Action>Connector), the
        // config-file controller path, and the backend ResolveFamily all match
        // case-sensitively on Linux/Docker. The display name is only used for the
        // config's human-readable `name` field.
        var familyDir = Path.Combine(root, family);
        Directory.CreateDirectory(familyDir);

        var operations = schema.Operations();

        // For connectors with per-operation schemas (github, m365) fetch them once
        // so each config exposes only the parameters relevant to its operation.
        IReadOnlyDictionary<string, CamelV2ConnectorSchema> operationSchemas =
            operations.Count > 0 && (family == "github" || family == "m365")
                ? await _catalogClient.GetOperationSchemasAsync(family, cancellationToken)
                : new Dictionary<string, CamelV2ConnectorSchema>();

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
            if (WriteConfigFile(familyDir, family, familyDisplay, action, null, schema, null))
            {
                written++;
            }
            return written;
        }

        foreach (var operation in operations)
        {
            var action = CamelNodeNaming.ToActionName(operation);
            if (string.IsNullOrWhiteSpace(action))
            {
                continue;
            }
            operationSchemas.TryGetValue(operation, out var operationSchema);
            if (WriteConfigFile(familyDir, family, familyDisplay, action, operation, schema, operationSchema))
            {
                written++;
            }
        }

        return written;
    }

    /// <summary>
    /// Recreates connector configs for the scaffold families (e.g. a2a, shell,
    /// hugging-face) that are NOT part of the harness catalog but are expected to
    /// appear in the connector library/action selector. Each scaffold is a
    /// credential-only config (matching the previous shape). Idempotent.
    /// </summary>
    private int GenerateScaffoldFamilies(string root)
    {
        var written = 0;
        foreach (var (family, displayName, credentialFieldName) in ScaffoldFamilies)
        {
            try
            {
                var familyDir = Path.Combine(root, family);
                Directory.CreateDirectory(familyDir);
                var action = CamelNodeNaming.ToActionName(family);
                if (string.IsNullOrWhiteSpace(action))
                {
                    action = "Invoke";
                }
                if (WriteScaffoldConfig(familyDir, family, displayName, credentialFieldName, action))
                {
                    written++;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating scaffold CamelV2 nodes for family '{Family}'.", family);
            }
        }
        if (ScaffoldFamilies.Length > 0)
        {
            _logger.LogInformation("Scaffold families checked: {Count} (idempotent).", ScaffoldFamilies.Length);
        }
        return written;
    }

    /// <summary>
    /// Non-catalog scaffold families, with the display name and the exact
    /// credential field name used by the existing connector configs (kept
    /// explicit so recreated files stay byte-identical to the hand-written ones).
    /// </summary>
    public static readonly (string Family, string DisplayName, string CredentialFieldName)[] ScaffoldFamilies =
    {
        ("a2a", "A2A", "__CredentialName__A2a"),
        ("camunda", "Camunda", "__CredentialName__Camunda"),
        ("clickhouse", "ClickHouse", "__CredentialName__Clickhouse"),
        ("datasonnet", "DataSonnet", "__CredentialName__Datasonnet"),
        ("dataweave", "DataWeave", "__CredentialName__Dataweave"),
        ("discord", "Discord", "__CredentialName__Discord"),
        ("duckdb", "DuckDB", "__CredentialName__Duckdb"),
        ("fory", "Fory", "__CredentialName__Fory"),
        ("groovy", "Groovy", "__CredentialName__Groovy"),
        ("gson", "Gson", "__CredentialName__Gson"),
        ("hugging-face", "Hugging Face", "__CredentialName__HuggingFace"),
        ("pgvector", "PGVector", "__CredentialName__Pgvector"),
        ("properties", "Properties", "__CredentialName__Properties"),
        ("shell", "Shell", "__CredentialName__Shell"),
    };

    /// <summary>
    /// Writes a credential-only scaffold config if it does not already exist.
    /// </summary>
    private bool WriteScaffoldConfig(
        string familyDir,
        string family,
        string displayName,
        string credentialFieldName,
        string action)
    {
        var filePath = Path.Combine(familyDir, $"{action}Connector.json");
        if (System.IO.File.Exists(filePath))
        {
            return false;
        }

        var config = new CamelV2ConnectorConfig
        {
            Name = displayName,
            Description = $"{displayName} through the CamelV2 connector.",
            Version = "1.0.0",
            Author = "@aventisia",
            SupportedPlatforms = new List<string> { "cloud", "windows" },
            ErrorHandling = "standard",
            TestScreenType = "standard",
            Connector = new CamelV2ConnectorMeta
            {
                Name = family,
                Operation = null,
                AuthType = "accessToken",
            },
            Credentials = new CamelV2CredentialsMeta
            {
                Required = true,
                FieldName = credentialFieldName,
                Type = "credentials-select",
            },
            Fields = new List<CamelV2ConnectorField>
            {
                new()
                {
                    Direction = "Input",
                    Type = "credentials-select",
                    Name = credentialFieldName,
                    Label = $"{displayName} Credential",
                    Description = $"The {displayName} credential used to authenticate API requests.",
                    DefaultValue = "",
                    Required = false,
                },
            },
        };

        var json = System.Text.Json.JsonSerializer.Serialize(config, SerializerOptions);
        System.IO.File.WriteAllText(filePath, json);
        _logger.LogInformation("Generated scaffold CamelV2 connector config {Path}.", filePath);
        return true;
    }

    /// <summary>
    /// Writes a single <c>&lt;Action&gt;Connector.json</c> file if it does not
    /// already exist. Returns true when a new file was written.
    /// </summary>
    private bool WriteConfigFile(
        string familyDir,
        string family,
        string familyDisplay,
        string action,
        string? operation,
        CamelV2ConnectorSchema schema,
        CamelV2ConnectorSchema? operationSchema)
    {
        var filePath = Path.Combine(familyDir, $"{action}Connector.json");
        if (System.IO.File.Exists(filePath))
        {
            _logger.LogDebug("CamelV2 connector config already exists; skipping {Path}.", filePath);
            return false;
        }

        var config = BuildConfig(family, familyDisplay, action, operation, schema, operationSchema);
        var json = System.Text.Json.JsonSerializer.Serialize(config, SerializerOptions);
        System.IO.File.WriteAllText(filePath, json);
        _logger.LogInformation("Generated CamelV2 connector config {Path}.", filePath);
        return true;
    }

    /// <summary>
    /// Builds a <see cref="CamelV2ConnectorConfig"/> matching the existing
    /// <c>CamelConnectorConfig</c> shape.
    /// </summary>
    private static CamelV2ConnectorConfig BuildConfig(
        string family,
        string familyDisplay,
        string action,
        string? operation,
        CamelV2ConnectorSchema schema,
        CamelV2ConnectorSchema? operationSchema)
    {
        // For generic nodes (no operation enum) the action is derived from the
        // family itself, so the display name is just the family display
        // (e.g. "AWS S3") rather than "AWS S3 — AWS 2S3".
        var isGeneric = string.IsNullOrWhiteSpace(operation);
        var displayName = isGeneric
            ? familyDisplay
            : CamelNodeNaming.ToDisplayName(family, action);
        var description = isGeneric
            ? $"{familyDisplay} through the CamelV2 connector."
            : CamelNodeNaming.ToDescription(family, action);
        var authType = InferAuthType(schema);
        var credentialFieldName = CredentialFieldName(family);

        var fields = new List<CamelV2ConnectorField>();

        // Credential field (when the schema declares auth requirements).
        if (authType != "none")
        {
            fields.Add(new CamelV2ConnectorField
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

        // Rich connectors (github/m365) expose a per-operation schema that lists
        // the exact parameters, query, and (for m365) input fields the harness
        // accepts for that operation. Emit only those fields (plus the family
        // infrastructure keys the configurers always read) so no unrelated
        // parameter is shown for the operation.
        if (operationSchema != null && !string.IsNullOrWhiteSpace(operation))
        {
            AddOperationFields(fields, family, operation, operationSchema, familyDisplay);
        }
        else
        {
            // Configuration fields (required first, then optional).
            var configuration = schema.Configuration();
            if (configuration?.NestedProperties is { Count: > 0 } configProps)
            {
                var required = configuration.Required ?? new List<string>();
                foreach (var (name, prop) in configProps)
                {
                    fields.Add(new CamelV2ConnectorField
                    {
                        Direction = "Input",
                        Type = MapFieldType(prop),
                        Name = name,
                        Label = ToLabel(name),
                        Description = prop.Description ?? $"Sets the {name} option.",
                        DefaultValue = prop.DefaultValue ?? "",
                        Required = required.Contains(name),
                        Camel = new CamelV2FieldMapping { Location = "property", Name = name },
                    });
                }
            }
        }

        // Payload field (request body as JSON).
        fields.Add(new CamelV2ConnectorField
        {
            Direction = "Input",
            Type = "json-editor",
            Name = "payload",
            Label = "Payload",
            Description = "Request body as JSON (optional).",
            DefaultValue = "{}",
            Required = false,
            Camel = new CamelV2FieldMapping { Location = "property", Name = "payload" },
        });

        // Result output.
        fields.Add(new CamelV2ConnectorField
        {
            Direction = "Output",
            Type = "config-panel-output",
            Name = "Result",
            Label = "Result",
            Description = "Returns the response data from the connector.",
            DefaultValue = new Dictionary<string, object> { ["value"] = "Result", ["enabled"] = true },
            Required = false,
        });

        return new CamelV2ConnectorConfig
        {
            Name = displayName,
            Description = description,
            Version = "1.0.0",
            Author = "@aventisia",
            SupportedPlatforms = new List<string> { "cloud", "windows" },
            ErrorHandling = "standard",
            TestScreenType = "standard",
            Connector = new CamelV2ConnectorMeta
            {
                Name = family,
                Operation = operation,
                AuthType = authType,
            },
            Credentials = new CamelV2CredentialsMeta
            {
                Required = authType != "none",
                FieldName = authType != "none" ? credentialFieldName : null,
                Type = authType != "none" ? "credentials-select" : null,
            },
            Fields = fields,
        };
    }

    /// <summary>
    /// Adds the fields declared by a per-operation schema: required
    /// <c>parameters</c>, optional <c>query</c>, and (m365) <c>inputFields</c>.
    /// Family infrastructure keys and harness-consumed (delegate) keys are
    /// always preserved so the config matches what the harness reads.
    /// </summary>
    private static void AddOperationFields(
        List<CamelV2ConnectorField> fields,
        string family,
        string operation,
        CamelV2ConnectorSchema operationSchema,
        string familyDisplay)
    {
        var added = new HashSet<string>();

        // Family infra/knob keys the github/m365 configurers/dispatchers read
        // for every operation (mirrors prune_rich_connector_fields.py).
        var familyKeys = family == "github"
            ? GITHUB_FAMILY_KEYS
            : M365_FAMILY_KEYS;
        foreach (var key in familyKeys)
        {
            if (added.Add(key))
            {
                fields.Add(TextField(key, optional: true));
            }
        }

        // Extra keys consumed by delegate services / local handlers. Value
        // indicates whether the harness throws when the key is missing.
        var delegateKeys = DelegateExtraKeys(operation);
        foreach (var (name, isRequired) in delegateKeys)
        {
            if (added.Add(name))
            {
                fields.Add(TextField(name, optional: !isRequired));
            }
        }

        var parameters = operationSchema.Parameters();
        var requiredParams = new HashSet<string>(parameters?.Required ?? new List<string>());
        if (parameters?.NestedProperties is { Count: > 0 } paramProps)
        {
            foreach (var (name, _) in paramProps)
            {
                if (added.Add(name))
                {
                    fields.Add(new CamelV2ConnectorField
                    {
                        Direction = "Input",
                        Type = "text",
                        Name = name,
                        Label = ToLabel(name),
                        Description = requiredParams.Contains(name) ? $"Required: {name}" : $"Optional: {name}",
                        DefaultValue = "",
                        Required = requiredParams.Contains(name),
                        Camel = new CamelV2FieldMapping { Location = "property", Name = name },
                    });
                }
            }
        }

        var query = operationSchema.Query();
        if (query?.NestedProperties is { Count: > 0 } queryProps)
        {
            foreach (var (name, _) in queryProps)
            {
                if (added.Add(name))
                {
                    fields.Add(TextField(name, optional: true));
                }
            }
        }

        var inputFields = operationSchema.InputFields();
        if (inputFields?.NestedProperties is { Count: > 0 } inputProps)
        {
            foreach (var (name, _) in inputProps)
            {
                if (added.Add(name))
                {
                    fields.Add(TextField(name, optional: true));
                }
            }
        }
    }

    private static readonly string[] GITHUB_FAMILY_KEYS =
        { "baseUrl", "service", "action", "contentType", "maxPages" };

    private static readonly string[] M365_FAMILY_KEYS =
    {
        "baseUrl", "service", "action", "tenantId", "clientId", "clientSecret",
        "scopes", "tokenUrl", "contentType", "maxPages", "autoPaginate",
    };

    /// <summary>
    /// Extra config keys consumed by delegate services / local handlers that the
    /// harness reads for a given operation even though the per-operation schema
    /// does not declare them. Mirrors prune_rich_connector_fields.py.
    /// </summary>
    private static IReadOnlyDictionary<string, bool> DelegateExtraKeys(string operation)
        => operation switch
        {
            "commit.list-files" => new Dictionary<string, bool> { ["owner"] = true, ["repo"] = true, ["ref"] = true },
            "file.delete" => new Dictionary<string, bool> { ["owner"] = true, ["repo"] = true, ["path"] = true, ["sha"] = false },
            "webhook.event.receive" => new Dictionary<string, bool> { ["event"] = false },
            "webhook.event.verify" => new Dictionary<string, bool> { ["event"] = false, ["signature"] = false },
            "webhook.event.route-event" => new Dictionary<string, bool> { ["event"] = false },
            "mail.send" => new Dictionary<string, bool> { ["messageId"] = false, ["saveToSentItems"] = false },
            "mailattachment.add" => new Dictionary<string, bool> { ["messageId"] = true },
            "calendarattendee.add" => new Dictionary<string, bool> { ["eventId"] = true },
            "calendarattendee.update" => new Dictionary<string, bool> { ["eventId"] = true },
            "calendarattendee.remove" => new Dictionary<string, bool> { ["eventId"] = true },
            "user.assign-license" => new Dictionary<string, bool> { ["addLicenses"] = false, ["removeLicenses"] = false },
            "user.remove-license" => new Dictionary<string, bool> { ["removeLicenses"] = false },
            "search.mail" or "search.files" or "search.sites" or "search.users" or "search.messages"
                => new Dictionary<string, bool> { ["q"] = false, ["from"] = false, ["size"] = false },
            "auth.get-token" => new Dictionary<string, bool> { ["tenantId"] = false, ["clientId"] = false, ["clientSecret"] = false, ["scopes"] = false, ["tokenUrl"] = false },
            "auth.refresh-token" => new Dictionary<string, bool> { ["tenantId"] = false, ["clientId"] = false, ["clientSecret"] = false, ["scopes"] = false, ["tokenUrl"] = false, ["refreshToken"] = false },
            "auth.authorization-code" => new Dictionary<string, bool> { ["tenantId"] = false, ["clientId"] = false, ["clientSecret"] = false, ["scopes"] = false, ["tokenUrl"] = false, ["authorizationCode"] = false, ["redirectUri"] = false },
            "auth.device-code-start" => new Dictionary<string, bool> { ["tenantId"] = false, ["clientId"] = false, ["clientSecret"] = false, ["scopes"] = false, ["tokenUrl"] = false },
            "auth.device-code-poll" => new Dictionary<string, bool> { ["tenantId"] = false, ["clientId"] = false, ["clientSecret"] = false, ["scopes"] = false, ["tokenUrl"] = false, ["deviceCode"] = false },
            "auth.on-behalf-of" => new Dictionary<string, bool> { ["tenantId"] = false, ["clientId"] = false, ["clientSecret"] = false, ["scopes"] = false, ["tokenUrl"] = false, ["assertion"] = false },
            _ => new Dictionary<string, bool>(),
        };

    private static CamelV2ConnectorField TextField(string name, bool optional)
        => new()
        {
            Direction = "Input",
            Type = "text",
            Name = name,
            Label = ToLabel(name),
            Description = optional ? $"Optional: {name}" : $"Required: {name}",
            DefaultValue = "",
            Required = !optional,
            Camel = new CamelV2FieldMapping { Location = "property", Name = name },
        };

    /// <summary>
    /// Infers the harness auth type from the schema's auth section.
    /// </summary>
    private static string InferAuthType(CamelV2ConnectorSchema schema)
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
    private static string MapFieldType(CamelV2SchemaProperty prop)
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
            return Path.Combine(_env.ContentRootPath, "Features", "CloudConnectors", "ConfigFiles", "CamelV2");
        }
        catch
        {
            return Path.Combine(AppContext.BaseDirectory, "Features", "CloudConnectors", "ConfigFiles", "CamelV2");
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
    /// Rebuilds the <c>Apache Camel Connectors</c> L1 group of the action-selector
    /// mapping from the generated connector config files under
    /// <c>ConfigFiles/CamelV2/&lt;Family&gt;/</c>.
    ///
    /// Each family folder becomes one L2 actionCategory; each <c>&lt;Action&gt;Connector.json</c>
    /// becomes a <c>CamelV2/&lt;family&gt;/&lt;Action&gt;Connector</c> action. The group is
    /// replaced wholesale (idempotent) so recreated connectors always appear under
    /// <c>Apache Camel Connectors</c> — never under <c>App Integrations</c>. Other L1
    /// groups (App Integrations, AI Integrations, ...) are left untouched.
    ///
    /// Returns true when the mapping file was rewritten.
    /// </summary>
    private bool RegenerateActionSelectorMapping()
    {
        var selectorPath = GetSelectorPath();
        if (!System.IO.File.Exists(selectorPath))
        {
            _logger.LogWarning("Action-selector mapping not found at {Path}; skipping mapping regeneration.", selectorPath);
            return false;
        }

        var root = GetConfigRoot();
        var categories = new List<JsonObject>();

        foreach (var familyDir in Directory.GetDirectories(root))
        {
            var family = Path.GetFileName(familyDir);
            if (string.IsNullOrWhiteSpace(family))
            {
                continue;
            }

            var familyDisplay = CamelNodeNaming.ToFamilyDisplay(family);
            var familyIcon = CamelNodeNaming.ToFamilyIcon(family);
            var actions = new JsonArray();

            foreach (var configFile in Directory.GetFiles(familyDir, "*Connector.json"))
            {
                var fileName = Path.GetFileName(configFile);
                var action = fileName.EndsWith("Connector.json", StringComparison.Ordinal)
                    ? fileName[..^"Connector.json".Length]
                    : fileName;
                if (string.IsNullOrWhiteSpace(action))
                {
                    continue;
                }

                var label = action;
                var description = $"{action} through the {familyDisplay} connector.";
                try
                {
                    var config = System.Text.Json.JsonSerializer.Deserialize<CamelV2ConnectorConfig>(
                        System.IO.File.ReadAllText(configFile));
                    if (config != null)
                    {
                        if (!string.IsNullOrWhiteSpace(config.Name))
                        {
                            label = config.Name;
                        }
                        if (!string.IsNullOrWhiteSpace(config.Description))
                        {
                            description = config.Description;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogDebug(ex, "Could not read connector config {Path}; using derived label.", configFile);
                }

                actions.Add(new JsonObject
                {
                    ["type"] = "cloudConnectorNode",
                    ["name"] = $"CamelV2/{family}/{action}Connector",
                    ["label"] = label,
                    ["description"] = description,
                    ["docsLink"] = "https://docs.aventisia.com",
                    ["icon"] = null,
                    ["img"] = familyIcon,
                    ["supportedPlatforms"] = new JsonArray("cloud", "windows"),
                });
            }

            if (actions.Count == 0)
            {
                continue;
            }

            categories.Add(new JsonObject
            {
                ["label"] = familyDisplay,
                ["description"] = $"{familyDisplay} through the CamelV2 connector.",
                ["icon"] = null,
                ["img"] = familyIcon,
                ["listType"] = null,
                ["actions"] = actions,
            });
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

        JsonObject? camelGroup = null;
        foreach (var node in selector)
        {
            if (node is JsonObject obj && string.Equals(obj["label"]?.GetValue<string>(), "Apache Camel Connectors", StringComparison.Ordinal))
            {
                camelGroup = obj;
                break;
            }
        }

        if (camelGroup is null)
        {
            camelGroup = new JsonObject
            {
                ["label"] = "Apache Camel Connectors",
                ["description"] = "Connect Apache Camel with external systems and services.",
                ["icon"] = "IntegrationIcon",
                ["img"] = "/brand-img/camel.svg",
            };
            selector.Add(camelGroup);
        }

        camelGroup["actionCategories"] = new JsonArray(categories.ToArray());

        var json = selector.ToJsonString(new JsonSerializerOptions { WriteIndented = true });
        System.IO.File.WriteAllText(selectorPath, json);
        _logger.LogInformation("Regenerated {Count} Apache Camel Connectors action categories in {Path}.",
            categories.Count, selectorPath);
        return true;
    }
}

// ---------------------------------------------------------------------------
// Local DTOs mirroring the existing CamelConnectorConfig shape. These are kept
// local to the generator so it does not depend on the Camel/ feature's DTOs.
// ---------------------------------------------------------------------------

/// <summary>Deserialized/serialized shape of a generated CamelV2 connector config file.</summary>
public class CamelV2ConnectorConfig
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("version")]
    public string? Version { get; set; }

    [JsonPropertyName("author")]
    public string? Author { get; set; }

    [JsonPropertyName("supportedPlatforms")]
    public List<string>? SupportedPlatforms { get; set; }

    [JsonPropertyName("errorHandling")]
    public string? ErrorHandling { get; set; }

    [JsonPropertyName("testScreenType")]
    public string? TestScreenType { get; set; }

    [JsonPropertyName("connector")]
    public CamelV2ConnectorMeta? Connector { get; set; }

    [JsonPropertyName("credentials")]
    public CamelV2CredentialsMeta? Credentials { get; set; }

    [JsonPropertyName("fields")]
    public List<CamelV2ConnectorField> Fields { get; set; } = new();
}

/// <summary>Connector identity and authentication type.</summary>
public class CamelV2ConnectorMeta
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("operation")]
    public string? Operation { get; set; }

    [JsonPropertyName("authType")]
    public string? AuthType { get; set; }
}

/// <summary>Credential requirement for the connector operation.</summary>
public class CamelV2CredentialsMeta
{
    [JsonPropertyName("required")]
    public bool Required { get; set; }

    [JsonPropertyName("fieldName")]
    public string? FieldName { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }
}

/// <summary>A single property/credential/output field in a CamelV2 connector config.</summary>
public class CamelV2ConnectorField
{
    [JsonPropertyName("direction")]
    public string? Direction { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("label")]
    public string? Label { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("required")]
    public bool Required { get; set; }

    [JsonPropertyName("defaultValue")]
    public object? DefaultValue { get; set; }

    [JsonPropertyName("camel")]
    public CamelV2FieldMapping? Camel { get; set; }
}

/// <summary>Where and under what name a field value is sent to the harness.</summary>
public class CamelV2FieldMapping
{
    [JsonPropertyName("location")]
    public string? Location { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }
}
