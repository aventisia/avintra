using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using WorkspaceAPIs.Entities;
using WorkspaceAPIs.Enums;
using WorkspaceAPIs.Features.CloudConnectors.Camel.Helpers;
using WorkspaceAPIs.Features.CloudConnectors.Camel.Models;
using Microsoft.Extensions.Options;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel.Services;

/// <summary>
/// Shared JSON serializer options for generated Camel artifacts.
/// </summary>
public static class CamelSerializerOptions
{
    /// <summary>Options used when writing generated connector config files.</summary>
    public static JsonSerializerOptions Config { get; } = new()
    {
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    /// <summary>Options used when writing OpenAPI-shaped tool documents.</summary>
    public static JsonSerializerOptions OpenApi { get; } = new()
    {
        WriteIndented = true,
    };

    /// <summary>Options used when writing the action-selector mapping file.</summary>
    public static JsonSerializerOptions Selector { get; } = new()
    {
        WriteIndented = true,
    };
}

/// <summary>
/// Unified Apache Camel connector seeding workflow.
///
/// Loads the connector list from the local <c>CamelIntegrationCatalog.json</c>
/// (no API call is made to retrieve or verify the initial connector list),
/// filters out excluded connectors and Corsair-managed integrations, and
/// performs three actions in a single pass:
///   1. Creates/upserts a platform <see cref="Tool"/> for each connector.
///   2. Generates connector operation JSON files under
///      <c>ConfigFiles/Camel/&lt;Family&gt;/&lt;Action&gt;Connector.json</c>.
///   3. Regenerates the Camel section of the action-selector mapping.
///
/// Operations and properties (schema) are fetched dynamically from the Camel
/// harness API per connector and merged into the tool payload.
/// </summary>
public class CamelSeedingService : ICamelSeedingService
{
    private readonly ILogger<CamelSeedingService> _logger;
    private readonly IConfiguration _configuration;
    private readonly CamelCatalogClient _catalogClient;
    private readonly CamelConnectorCatalogRepository _catalogRepository;
    private readonly CorsairIntegrationCatalogRepository _corsairCatalogRepository;
    private readonly CamelConfigPaths _paths;

    public CamelSeedingService(
        ILogger<CamelSeedingService> logger,
        IConfiguration configuration,
        CamelCatalogClient catalogClient,
        CamelConnectorCatalogRepository catalogRepository,
        CorsairIntegrationCatalogRepository corsairCatalogRepository,
        CamelConfigPaths paths)
    {
        _logger = logger;
        _configuration = configuration;
        _catalogClient = catalogClient;
        _catalogRepository = catalogRepository;
        _corsairCatalogRepository = corsairCatalogRepository;
        _paths = paths;
    }

    /// <summary>
    /// Runs the unified seeding workflow. Returns the number of connectors
    /// seeded (tools + config files + mapping entries).
    /// </summary>
    public async Task<int> SeedAsync(
        WorkspaceDbContext dbContext,
        CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        var seeded = 0;
        var generatedFiles = 0;

        // The connector list is sourced entirely from the local
        // CamelIntegrationCatalog.json. No API call is made to retrieve or
        // verify the initial connector list.
        var localCatalog = _catalogRepository.GetCatalog();
        if (localCatalog.Count == 0)
        {
            _logger.LogWarning("Local Camel connector catalog is empty; skipping Camel seeding.");
            return 0;
        }

        var harnessOperations = new Dictionary<string, IReadOnlyList<string>>(StringComparer.OrdinalIgnoreCase);

        foreach (var catalogEntry in localCatalog.Values)
        {
            var connector = catalogEntry.Name;
            if (string.IsNullOrWhiteSpace(connector))
            {
                continue;
            }

            if (IsExcluded(connector))
            {
                _logger.LogDebug("Skipping excluded Camel connector '{Connector}'.", connector);
                continue;
            }

            try
            {
                var displayLabel = catalogEntry.GetDisplayLabel();
                var description = catalogEntry.GetDescription();
                var credentialName = string.IsNullOrEmpty(catalogEntry.CredentialName) ? ResolveCredentialName(catalogEntry, connector) : catalogEntry.CredentialName;

                var schema = await _catalogClient.GetConnectorAsync(connector, cancellationToken);
                var apiOperations = await _catalogClient.GetConnectorOperationsAsync(connector, cancellationToken);

                // Operations are fetched dynamically from the harness API only;
                // the local catalog's operations list is not used.
                var operationNames = apiOperations
                    .Select(o => o.Id)
                    .Where(id => !string.IsNullOrWhiteSpace(id))
                    .OfType<string>()
                    .ToList();

                // Record the harness operation list so the mapping regenerator
                // builds actions that match the generated config files exactly.
                harnessOperations[connector] = operationNames;

                // 1. Upsert platform tool.
                await UpsertToolAsync(dbContext, connector, displayLabel, description, schema, now, cancellationToken);

                // 2. Generate connector operation JSON files.
                generatedFiles += GenerateConnectorFiles(
                    connector,
                    displayLabel,
                    description,
                    credentialName,
                    catalogEntry,
                    schema,
                    operationNames);

                seeded++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding Camel connector '{Connector}'.", connector);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        // 3. Regenerate the action-selector mapping from the local catalog.
        var mappingRegenerator = new CamelMappingRegenerator(_paths, _logger, IsExcluded);
        await mappingRegenerator.RegenerateAsync(localCatalog, harnessOperations);

        _logger.LogInformation(
            "Seeded {Seeded} Camel connectors ({GeneratedFiles} config files) into ai_Tools.",
            seeded, generatedFiles);

        return seeded;
    }

    /// <summary>
    /// Determines whether a connector is excluded from the seeding workflow.
    /// A connector is excluded when it appears in the configured exclusion list
    /// or when it is already covered by a Corsair integration in
    /// <c>CorsairIntegrationCatalog.json</c>.
    /// </summary>
    private bool IsExcluded(string connector)
    {
        if (string.IsNullOrWhiteSpace(connector))
        {
            return true;
        }

        var corsairPluginIds = _corsairCatalogRepository.GetPluginIds();
        if (corsairPluginIds.Contains(connector))
        {
            _logger.LogDebug("Skipping Camel connector '{Connector}' because it is already covered by a Corsair integration.", connector);
            return true;
        }

        return false;
    }

    /// <summary>
    /// Resolves the credential field name for a connector family.
    /// </summary>
    private static string ResolveCredentialName(CamelConnectorCatalogEntry? catalogEntry, string connector)
    {
        var display = catalogEntry?.GetDisplayLabel() ?? CamelNodeNaming.ToFamilyDisplay(connector);
        return $"__CredentialName__{display.Replace(" ", string.Empty)}";
    }

    /// <summary>
    /// Creates or updates the platform <see cref="Tool"/> for a connector.
    /// Matching is performed by deterministic id first, then by tool name.
    /// </summary>
    private async Task UpsertToolAsync(
        WorkspaceDbContext dbContext,
        string connector,
        string displayLabel,
        string description,
        CamelConnectorSchema? schema,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var toolId = DeterministicGuid("camel-tool-" + connector);
        var toolName = displayLabel;
        var baseUrl = ResolveBaseUrl(connector);
        var authType = InferToolAuthenticationType(schema);
        var openApi = BuildOpenApiDocument(connector, schema, baseUrl, description, displayLabel);
        var openApiJson = openApi.ToJsonString(CamelSerializerOptions.OpenApi);
        var parsedSchema = JsonDocument.Parse(openApiJson);

        var existing = await dbContext.Tools
            .Where(w => w.Type == ComponentTypeEnum.Platform)
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(f => f.Id == toolId, cancellationToken);

        if (existing is null)
        {
            existing = await dbContext.Tools
                .Where(w => w.Type == ComponentTypeEnum.Platform)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(f => f.Name == toolName, cancellationToken);
        }

        if (existing is null)
        {
            var tool = new Tool
            {
                Id = toolId,
                TenantId = Guid.Empty,
                SpaceId = null,
                EnvType = ConfigureEnvironmentType.Dev,
                Name = toolName,
                Description = description,
                Type = ComponentTypeEnum.Platform,
                BaseUrl = baseUrl,
                OpenApiSpec = openApiJson,
                ParsedSchema = parsedSchema,
                AuthenticationType = authType,
                IsTenantWideAccess = true,
                IsActive = true,
                IsVerified = true,
                CreatedOn = now,
                LastModifiedOn = now,
            };
            await dbContext.Tools.AddAsync(tool, cancellationToken);
        }
        else
        {
            existing.Name = toolName;
            existing.Description = description;
            existing.TenantId = Guid.Empty;
            existing.BaseUrl = baseUrl;
            existing.OpenApiSpec = openApiJson;
            existing.ParsedSchema = parsedSchema;
            existing.AuthenticationType = authType;
            existing.IsTenantWideAccess = true;
            existing.IsActive = true;
            existing.IsVerified = true;
            existing.LastModifiedOn = now;
        }
    }

    /// <summary>
    /// Generates the config files for a single connector family. Returns the
    /// number of files written (0 when all already exist).
    /// </summary>
    private int GenerateConnectorFiles(
        string connector,
        string displayLabel,
        string description,
        string credentialName,
        CamelConnectorCatalogEntry? catalogEntry,
        CamelConnectorSchema? schema,
        List<string> operationNames)
    {
        var family = connector.ToLowerInvariant();
        var familyDir = _paths.FamilyDirectory(family);
        Directory.CreateDirectory(familyDir);

        var written = 0;

        if (operationNames.Count == 0)
        {
            var action = CamelNodeNaming.ToActionName(family) ?? "Invoke";
            if (WriteConfigFile(familyDir, family, displayLabel, action, null, credentialName, catalogEntry, schema))
            {
                written++;
            }
            return written;
        }

        foreach (var operation in operationNames)
        {
            var action = CamelNodeNaming.ToActionName(operation);
            if (string.IsNullOrWhiteSpace(action))
            {
                continue;
            }
            if (WriteConfigFile(familyDir, family, displayLabel, action, operation, credentialName, catalogEntry, schema))
            {
                written++;
            }
        }

        return written;
    }

    /// <summary>
    /// Writes a single connector config file when it does not already exist.
    /// </summary>
    private bool WriteConfigFile(
        string familyDir,
        string family,
        string familyDisplay,
        string action,
        string? operation,
        string credentialName,
        CamelConnectorCatalogEntry? catalogEntry,
        CamelConnectorSchema? schema)
    {
        var filePath = Path.Combine(familyDir, $"{action}Connector.json");
        if (System.IO.File.Exists(filePath))
        {
            _logger.LogDebug("Camel connector config already exists; skipping {Path}.", filePath);
            return false;
        }

        var config = BuildConfig(family, familyDisplay, action, operation, credentialName, catalogEntry, schema);
        var json = System.Text.Json.JsonSerializer.Serialize(config, CamelSerializerOptions.Config);
        System.IO.File.WriteAllText(filePath, json);
        _logger.LogInformation("Generated Camel connector config {Path}.", filePath);
        return true;
    }

    /// <summary>
    /// Builds a <see cref="CamelConnectorConfig"/> for a connector operation.
    /// </summary>
    private static CamelConnectorConfig BuildConfig(
        string family,
        string familyDisplay,
        string action,
        string? operation,
        string credentialName,
        CamelConnectorCatalogEntry? catalogEntry,
        CamelConnectorSchema? schema)
    {
        var isGeneric = string.IsNullOrWhiteSpace(operation);
        var displayName = isGeneric
            ? familyDisplay
            : CamelNodeNaming.ToDisplayName(family, action);
        var description = isGeneric
            ? (catalogEntry?.GetDescription() ?? $"{familyDisplay} through the Camel connector.")
            : CamelNodeNaming.ToDescription(family, action);

        // Prefer the auth type inferred from the harness schema (authoritative:
        // e.g. sql/jdbc declare database auth via required url/username). Fall
        // back to the catalog's declared auth type only when the schema does
        // not classify one. "Not applicable" from the catalog means no auth.
        var schemaAuthType = InferAuthType(schema);
        var catalogAuthType = NormalizeAuthType(catalogEntry?.GetPrimaryAuthType());
        var authType = schemaAuthType != "none"
            ? schemaAuthType
            : catalogAuthType;

        var fields = new List<CamelConnectorField>();

        if (authType != "none")
        {
            fields.Add(new CamelConnectorField
            {
                Direction = "Input",
                Type = "credentials-select",
                Name = credentialName,
                Label = $"{familyDisplay} Credential",
                Description = $"The {familyDisplay} credential used to authenticate API requests.",
                DefaultValue = "",
                Required = false,
            });
        }

        var configuration = schema?.Configuration();
        if (configuration?.NestedProperties is { Count: > 0 } configProps)
        {
            var required = configuration.Required ?? new List<string>();
            foreach (var (name, prop) in configProps)
            {
                var fieldType = MapFieldType(prop, name);
                // SQL query fields render as a SQL-aware code editor. The field
                // name carries a "_sql" suffix so the frontend derives the
                // editor language from the suffix after the last underscore,
                // while the camel mapping keeps the harness property name.
                var fieldName = fieldType == "code-editor" ? $"{name}_sql" : name;
                fields.Add(new CamelConnectorField
                {
                    Direction = "Input",
                    Type = fieldType,
                    Name = fieldName,
                    Label = ToLabel(name),
                    Description = prop.Description ?? $"Sets the {name} option.",
                    DefaultValue = prop.DefaultValue ?? "",
                    Required = required.Contains(name),
                    Camel = new CamelFieldMapping { Location = "property", Name = name },
                });
            }
        }

        fields.Add(new CamelConnectorField
        {
            Direction = "Input",
            Type = "json-editor",
            Name = "payload",
            Label = "Payload",
            Description = "Request body as JSON (optional).",
            DefaultValue = "{}",
            Required = false,
            Camel = new CamelFieldMapping { Location = "body", Name = "payload" },
        });

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

        var availableProperties = new List<string>
        {
            "title",
            "description",
            "icon",
            "label",
            "syntax",
            "authTypes",
            "supportLevel",
        };

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
                CredentialName = credentialName,
            },
            Credentials = new CamelCredentialsMeta
            {
                Required = authType != "none",
                FieldName = authType != "none" ? credentialName : null,
                Type = authType != "none" ? "credentials-select" : null,
            },
            Fields = fields,
            Comment = new CamelConnectorConfigComment
            {
                Connector = family,
                AvailableProperties = availableProperties,
                Note = $"Connector metadata sourced from CamelIntegrationCatalog.json for connector '{family}'. Available catalog properties: {string.Join(", ", availableProperties)}.",
            },
        };
    }



    /// <summary>
    /// Builds an OpenAPI-shaped document for a catalog connector.
    /// </summary>
    private static JsonObject BuildOpenApiDocument(
        string connector,
        CamelConnectorSchema? schema,
        string baseUrl,
        string description,
        string displayLabel)
    {
        var operationsArray = new JsonArray();
        var paths = new JsonObject();

        var doc = new JsonObject
        {
            ["openapi"] = "3.0.1",
            ["info"] = new JsonObject
            {
                ["title"] = $"Camel {connector} connector",
                ["version"] = "1.0.0",
                ["description"] = description,
            },
            ["servers"] = new JsonArray
            {
                new JsonObject { ["url"] = baseUrl },
            },
            ["operations"] = operationsArray,
            ["paths"] = paths,
        };

        var parameters = new JsonArray();
        var configuration = schema?.Configuration();
        if (configuration?.NestedProperties is { Count: > 0 } configProps)
        {
            var required = configuration.Required ?? new List<string>();
            foreach (var (name, _) in configProps)
            {
                parameters.Add(new JsonObject
                {
                    ["name"] = name,
                    ["in"] = "query",
                    ["required"] = required.Contains(name),
                    ["schema"] = new JsonObject { ["type"] = "string" },
                });
            }
        }

        var operations = schema?.Operations();
        if (operations is null || operations.Count == 0)
        {
            var action = CamelNodeNaming.ToActionName(connector) ?? "invoke";
            AddOpenApiOperation(paths, operationsArray, "/invoke", "POST", action, $"Invoke {displayLabel}", parameters);
            return doc;
        }

        foreach (var operation in operations)
        {
            var clonedParameters = (parameters.DeepClone() as JsonArray) ?? new JsonArray();
            AddOpenApiOperation(paths, operationsArray, "/invoke", "POST", operation, operation, clonedParameters);
        }

        return doc;
    }

    private static void AddOpenApiOperation(
        JsonObject paths,
        JsonArray operationsArray,
        string pathTemplate,
        string method,
        string operationId,
        string summary,
        JsonArray? parameters)
    {
        parameters ??= new JsonArray();
        operationsArray.Add(new JsonObject
        {
            ["operationId"] = operationId,
            ["method"] = method.ToUpperInvariant(),
            ["path"] = string.IsNullOrWhiteSpace(pathTemplate) ? "/invoke" : pathTemplate,
            ["summary"] = summary,
            ["parameters"] = parameters,
        });

        var pathKey = string.IsNullOrWhiteSpace(pathTemplate) ? "/invoke" : pathTemplate;
        var methodKey = method.ToLowerInvariant();

        if (!paths.TryGetPropertyValue(pathKey, out var pathNode) || pathNode is not JsonObject pathObj)
        {
            pathObj = new JsonObject();
            paths[pathKey] = pathObj;
        }

        if (pathObj.ContainsKey(methodKey))
        {
            return;
        }

        pathObj[methodKey] = new JsonObject
        {
            ["operationId"] = operationId,
            ["summary"] = summary,
            ["parameters"] = parameters.DeepClone(),
        };
    }

    /// <summary>
    /// Resolves the tool base URL from configuration or falls back to the
    /// harness base URL.
    /// </summary>
    private string ResolveBaseUrl(string connector)
    {
        var configured = _configuration[$"CamelTools:BaseUrls:{connector}"];
        if (!string.IsNullOrWhiteSpace(configured))
        {
            return configured.TrimEnd('/');
        }
        return _configuration["EnvironmentConfig:CamelApiBaseUrl"]?.TrimEnd('/') ?? string.Empty;
    }

    private static ToolAuthenticationTypeEnum InferToolAuthenticationType(CamelConnectorSchema? schema)
        => schema.AuthKind() switch
        {
            CamelAuthKind.Token => ToolAuthenticationTypeEnum.Bearer,
            CamelAuthKind.ApiKey => ToolAuthenticationTypeEnum.ApiKeyHeader,
            CamelAuthKind.Basic => ToolAuthenticationTypeEnum.Basic,
            _ => ToolAuthenticationTypeEnum.None,
        };

    private static string InferAuthType(CamelConnectorSchema? schema)
        => schema.AuthKind() switch
        {
            CamelAuthKind.Token => "accessToken",
            CamelAuthKind.ApiKey => "apiKey",
            CamelAuthKind.Basic => "basic",
            CamelAuthKind.ClientCredentials => "client_credentials",
            CamelAuthKind.Database => "database",
            _ => "none",
        };

    /// <summary>
    /// Normalizes a catalog-declared auth type into the harness auth vocabulary
    /// consumed by <see cref="CamelConnectorService.BuildAuthAsync"/>. The
    /// catalog uses display labels ("Basic Auth", "Bearer Token", ...) that are
    /// not valid harness auth types, so they are mapped here. "Not applicable" /
    /// "None" / empty map to "none" (no credential required).
    /// </summary>
    private static string NormalizeAuthType(string? authType)
    {
        if (string.IsNullOrWhiteSpace(authType))
        {
            return "none";
        }
        var normalized = authType.Trim();
        return normalized.ToLowerInvariant() switch
        {
            "not applicable" or "none" or "ssl/certificate" => "none",
            "basic auth" or "basic" => "basic",
            "bearer token" or "bearer" => "accessToken",
            "api key" or "apikey" => "apiKey",
            "oauth2" or "oauth" => "oauth2",
            "connection string" or "database" or "db" => "database",
            "aws access/secret key" or "aws" => "aws",
            "service account/json key" or "gcp" => "gcp",
            _ => normalized,
        };
    }

    private static string MapFieldType(CamelConnectorSchemaProperty prop, string name)
    {
        if (prop.EnumValues is { Count: > 0 })
        {
            return "select";
        }

        // SQL query fields render as a SQL-aware code editor. The field name
        // carries a "_sql" suffix so the frontend derives the editor language
        // from the suffix after the last underscore (see CodeEditorField).
        if (string.Equals(name, "query", StringComparison.OrdinalIgnoreCase))
        {
            return "code-editor";
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

    private static string ToLabel(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return name;
        }

        var sb = new StringBuilder();
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

    private static Guid DeterministicGuid(string input)
    {
        using var md5 = System.Security.Cryptography.MD5.Create();
        var hash = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}
