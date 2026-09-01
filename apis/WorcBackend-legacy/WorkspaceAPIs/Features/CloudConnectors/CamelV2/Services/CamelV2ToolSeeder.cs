using System.Text.Json;
using System.Text.Json.Nodes;
using AspNetToolkit.Enums;
using WorkspaceAPIs.Entities;
using WorkspaceAPIs.Enums;
using WorkspaceAPIs.Features.CloudConnectors.CamelV2.Helpers;
using WorkspaceAPIs.Features.CloudConnectors.CamelV2.Models;
using WorkspaceAPIs.Features.CloudConnectors.CamelV2.Services;

namespace WorkspaceAPIs.Features.CloudConnectors.CamelV2.Services;

/// <summary>
/// Seeds every Apache Camel connector (and the non-catalog scaffold families)
/// into the <c>ws_Tools</c> table as a platform tool.
///
/// Connectors are fetched from the harness catalog
/// (<c>GET /api/connectors/schemas</c>). Each connector becomes one
/// <see cref="Tool"/> row matched by a deterministic id so re-seeding is
/// idempotent.
///
/// The stored <c>OpenApiSpec</c>/<c>ParsedSchema</c> is an OpenAPI-shaped
/// document whose <c>paths</c> section enumerates every supported operation
/// (operationId + HTTP method + path + parameters), so downstream consumers
/// (the Tools UI operation list and LLM custom-tool loader) can enumerate the
/// connector's operations. Per-operation schemas are used for rich connectors
/// (github, m365); a single generic operation entry is emitted for catalog
/// components without an operation enum.
/// </summary>
public class CamelV2ToolSeeder
{
    private readonly ILogger<CamelV2ToolSeeder> _logger;
    private readonly IConfiguration _configuration;
    private readonly CamelV2CatalogClient _catalogClient;

    public CamelV2ToolSeeder(
        ILogger<CamelV2ToolSeeder> logger,
        IConfiguration configuration,
        CamelV2CatalogClient catalogClient)
    {
        _logger = logger;
        _configuration = configuration;
        _catalogClient = catalogClient;
    }

    /// <summary>
    /// Seeds all Camel connectors from the harness catalog (plus the scaffold
    /// families) into <c>ws_Tools</c>. Returns the number of tools upserted.
    /// </summary>
    public async Task<int> SeedAsync(
        WorkspaceDbContext dbContext,
        CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        var seeded = 0;

        var catalog = await _catalogClient.GetCatalogAsync(cancellationToken);
        if (catalog.Count == 0)
        {
            _logger.LogWarning("Camel catalog is empty; skipping CamelV2 tool seeding.");
        }
        else
        {
            foreach (var (connector, schema) in catalog)
            {
                try
                {
                    var toolId = DeterministicGuid("camelv2-tool-" + connector);
                    var toolName = CamelNodeNaming.ToFamilyDisplay(connector);
                    var baseUrl = ResolveBaseUrl(connector);
                    var authType = InferAuthenticationType(schema);
                    var openApi = await BuildOpenApiDocumentAsync(connector, schema, baseUrl, cancellationToken);
                    var openApiJson = openApi.ToJsonString(new JsonSerializerOptions { WriteIndented = true });
                    var parsedSchema = JsonDocument.Parse(openApiJson);

                    var existing = await dbContext.Tools
                        .Where(w => w.Type == ComponentTypeEnum.Platform)
                        .IgnoreQueryFilters()
                        .FirstOrDefaultAsync(f => f.Name == toolName, cancellationToken);
                    
                    if (existing is null)
                    {
                        var tool = new Tool
                        {
                            Id = toolId,
                            TenantId = Guid.Empty, // Platform tools are not tenant-scoped
                            SpaceId = null, // Central space
                            EnvType = ConfigureEnvironmentType.Dev,
                            Name = toolName,
                            Description = $"Apache Camel {connector} connector (platform tool, seeded from the Camel harness catalog).",
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
                        existing.Description = $"Apache Camel {connector} connector (platform tool, seeded from the Camel harness catalog).";
                        existing.TenantId = Guid.Empty; // Platform tools are not tenant-scoped
                        existing.BaseUrl = baseUrl;
                        existing.OpenApiSpec = openApiJson;
                        existing.ParsedSchema = parsedSchema;
                        existing.AuthenticationType = authType;
                        existing.IsTenantWideAccess = true;
                        existing.IsActive = true;
                        existing.IsVerified = true;
                        existing.LastModifiedOn = now;
                    }

                    seeded++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error seeding CamelV2 tool for connector '{Connector}'.", connector);
                }
            }
        }

        // Scaffold families (not in the harness catalog) are also part of the
        // connector library, so they get seeded too.
        foreach (var (family, displayName, credentialFieldName) in CamelV2NodeGenerator.ScaffoldFamilies)
        {
            try
            {
                var toolId = DeterministicGuid("camelv2-tool-" + family);
                var toolName = displayName;
                var baseUrl = ResolveBaseUrl(family);
                var openApi = BuildScaffoldOpenApiDocument(family, displayName, baseUrl);
                var openApiJson = openApi.ToJsonString(new JsonSerializerOptions { WriteIndented = true });
                var parsedSchema = JsonDocument.Parse(openApiJson);

                var existing = await dbContext.Tools
                    .Where(w => w.Type == ComponentTypeEnum.Platform)
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(f => f.Name == toolName, cancellationToken);

                if (existing is null)
                {
                    var tool = new Tool
                    {
                        Id = toolId,
                        TenantId = Guid.Empty, // Platform tools are not tenant-scoped
                        SpaceId = null, // Central space
                        EnvType = ConfigureEnvironmentType.Dev,
                        Name = toolName,
                        Description = $"Apache Camel {displayName} connector (platform tool).",
                        Type = ComponentTypeEnum.Platform,
                        BaseUrl = baseUrl,
                        OpenApiSpec = openApiJson,
                        ParsedSchema = parsedSchema,
                        CredentialName = credentialFieldName,
                        AuthenticationType = ToolAuthenticationTypeEnum.Bearer,
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
                    existing.Description = $"Apache Camel {displayName} connector (platform tool).";
                    existing.TenantId = Guid.Empty; // Platform tools are not tenant-scoped
                    existing.BaseUrl = baseUrl;
                    existing.OpenApiSpec = openApiJson;
                    existing.ParsedSchema = parsedSchema;
                    existing.CredentialName = credentialFieldName;
                    existing.AuthenticationType = ToolAuthenticationTypeEnum.Bearer;
                    existing.IsTenantWideAccess = true;
                    existing.IsActive = true;
                    existing.IsVerified = true;
                    existing.LastModifiedOn = now;
                }

                seeded++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding scaffold CamelV2 tool for family '{Family}'.", family);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Seeded {Seeded} CamelV2 platform tools (catalog + scaffold) into ws_Tools.", seeded);
        return seeded;
    }

    /// <summary>
    /// Builds an OpenAPI-shaped document for a catalog connector. It carries two
    /// representations of the connector's operations so every consumer can
    /// enumerate them without loss:
    ///   - <c>operations</c>: a flat array of <c>{operationId, method, path,
    ///     summary, parameters}</c>. This is the PRIMARY representation used by
    ///     the Tools UI (<c>normalizeToolOperations</c> reads <c>operations</c>
    ///     first) and is collision-free (multiple operations may share a path +
    ///     HTTP method, e.g. github repository.update/archive).
    ///   - <c>paths</c>: a standard OpenAPI <c>paths</c> map for compatibility.
    ///     When two operations map to the same path+method the first is kept and
    ///     the rest remain available via the <c>operations</c> array.
    /// </summary>
    private async Task<JsonObject> BuildOpenApiDocumentAsync(
        string connector,
        CamelV2ConnectorSchema schema,
        string baseUrl,
        CancellationToken cancellationToken)
    {
        var familyDisplay = CamelNodeNaming.ToFamilyDisplay(connector);
        var operationsArray = new JsonArray();
        var paths = new JsonObject();

        var doc = new JsonObject
        {
            ["openapi"] = "3.0.1",
            ["info"] = new JsonObject
            {
                ["title"] = $"Camel {connector} connector",
                ["version"] = "1.0.0",
                ["description"] = schema.Description ?? $"{familyDisplay} Apache Camel connector.",
            },
            ["servers"] = new JsonArray
            {
                new JsonObject { ["url"] = baseUrl },
            },
            ["operations"] = operationsArray,
            ["paths"] = paths,
        };

        var operations = schema.Operations();

        if (operations.Count == 0)
        {
            var action = CamelNodeNaming.ToActionName(connector);
            if (string.IsNullOrWhiteSpace(action))
            {
                action = "invoke";
            }
            AddOperation(doc, paths, operationsArray, "/invoke", "POST", action, "Invoke " + familyDisplay, null);
            return doc;
        }

        // Rich connectors expose per-operation schemas with method/path/params.
        var operationSchemas = (connector.Equals("github", StringComparison.OrdinalIgnoreCase)
            || connector.Equals("m365", StringComparison.OrdinalIgnoreCase))
            ? await _catalogClient.GetOperationSchemasAsync(connector, cancellationToken)
            : new Dictionary<string, CamelV2ConnectorSchema>();

        foreach (var operation in operations)
        {
            var pathTemplate = "/invoke";
            var method = "POST";
            var parameters = new JsonArray();

            if (operationSchemas.TryGetValue(operation, out var opSchema))
            {
                var methodProp = opSchema.Method()?.DefaultValue ?? "POST";
                var pathProp = opSchema.Path()?.DefaultValue;
                if (!string.IsNullOrWhiteSpace(pathProp))
                {
                    pathTemplate = pathProp;
                }
                method = methodProp;

                var paramProps = opSchema.Parameters();
                if (paramProps?.NestedProperties is { Count: > 0 } pp)
                {
                    var required = new HashSet<string>(paramProps.Required ?? new List<string>());
                    foreach (var (name, _) in pp)
                    {
                        parameters.Add(new JsonObject
                        {
                            ["name"] = name,
                            ["in"] = "path",
                            ["required"] = required.Contains(name),
                            ["schema"] = new JsonObject { ["type"] = "string" },
                        });
                    }
                }
                var queryProps = opSchema.Query();
                if (queryProps?.NestedProperties is { Count: > 0 } qp)
                {
                    foreach (var (name, _) in qp)
                    {
                        parameters.Add(new JsonObject
                        {
                            ["name"] = name,
                            ["in"] = "query",
                            ["required"] = false,
                            ["schema"] = new JsonObject { ["type"] = "string" },
                        });
                    }
                }
                var inputProps = opSchema.InputFields();
                if (inputProps?.NestedProperties is { Count: > 0 } ip)
                {
                    foreach (var (name, _) in ip)
                    {
                        parameters.Add(new JsonObject
                        {
                            ["name"] = name,
                            ["in"] = "query",
                            ["required"] = false,
                            ["schema"] = new JsonObject { ["type"] = "string" },
                        });
                    }
                }
            }

            AddOperation(doc, paths, operationsArray, pathTemplate, method, operation, operation, parameters);
        }

        return doc;
    }

    /// <summary>
    /// Appends an operation to the flat <c>operations</c> array (always), and to
    /// the OpenAPI <c>paths</c> map (only when the path+method is not already
    /// taken, so the map stays a valid OpenAPI document).
    /// </summary>
    private static void AddOperation(
        JsonObject doc,
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

        // Only the first operation for a given path+method is placed in the map;
        // the rest remain fully available in the operations array.
        if (pathObj.ContainsKey(methodKey))
        {
            return;
        }

        pathObj[methodKey] = new JsonObject
        {
            ["operationId"] = operationId,
            ["summary"] = summary,
            // DeepClone so the same JsonNode isn't re-parented: it is already
            // attached to the operation entry above, and a System.Text.Json.Nodes
            // node can only have one parent ("The node already has a parent").
            ["parameters"] = parameters.DeepClone(),
        };
    }

    /// <summary>
    /// Builds the OpenAPI document for a scaffold family (a single generic
    /// <c>invoke</c> operation).
    /// </summary>
    private static JsonObject BuildScaffoldOpenApiDocument(string family, string displayName, string baseUrl)
    {
        var operationsArray = new JsonArray();
        var paths = new JsonObject();
        var doc = new JsonObject
        {
            ["openapi"] = "3.0.1",
            ["info"] = new JsonObject
            {
                ["title"] = $"Camel {displayName} connector",
                ["version"] = "1.0.0",
            },
            ["servers"] = new JsonArray
            {
                new JsonObject { ["url"] = baseUrl },
            },
            ["operations"] = operationsArray,
            ["paths"] = paths,
        };
        AddOperation(doc, paths, operationsArray, "/invoke", "POST", "invoke", $"Invoke {displayName}", null);
        return doc;
    }

    /// <summary>
    /// Resolves the tool base URL from <c>CamelTools:BaseUrls:&lt;connector&gt;</c>,
    /// falling back to the harness base URL.
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

    /// <summary>
    /// Infers the <see cref="ToolAuthenticationTypeEnum"/> from the connector
    /// schema's auth section. Rules:
    ///   - <c>token</c>/<c>accessToken</c>/<c>bearer</c> → <see cref="ToolAuthenticationTypeEnum.Bearer"/>
    ///   - <c>username</c>/<c>password</c> → <see cref="ToolAuthenticationTypeEnum.Basic"/>
    ///   - <c>apiKey</c> → <see cref="ToolAuthenticationTypeEnum.ApiKeyHeader"/>
    ///   - otherwise → <see cref="ToolAuthenticationTypeEnum.None"/>
    /// </summary>
    private static ToolAuthenticationTypeEnum InferAuthenticationType(CamelV2ConnectorSchema schema)
    {
        var auth = schema.Auth();
        if (auth?.NestedProperties is not { Count: > 0 } props)
        {
            return ToolAuthenticationTypeEnum.None;
        }

        if (props.ContainsKey("token") || props.ContainsKey("accessToken") || props.ContainsKey("bearer"))
        {
            return ToolAuthenticationTypeEnum.Bearer;
        }
        if (props.ContainsKey("apiKey"))
        {
            return ToolAuthenticationTypeEnum.ApiKeyHeader;
        }
        if (props.ContainsKey("username") || props.ContainsKey("password"))
        {
            return ToolAuthenticationTypeEnum.Basic;
        }
        return ToolAuthenticationTypeEnum.None;
    }

    /// <summary>
    /// Generates a deterministic GUID from a connector name so the same connector
    /// always maps to the same primary key across environments and re-seeds.
    /// </summary>
    private static Guid DeterministicGuid(string input)
    {
        using var md5 = System.Security.Cryptography.MD5.Create();
        var hash = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}
