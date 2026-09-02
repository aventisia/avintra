using System.Net.Http.Json;
using System.Text.Json;
using AspNetToolkit.Config;
using WorkspaceAPIs.Features.CloudConnectors.Camel.Models;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel.Services;

/// <summary>
/// Single, generic Apache Camel connector service.
///
/// This is the consolidated implementation (previously split between the
/// config-driven <c>CamelConnectorService</c> and the catalog-driven
/// <c>CamelV2ConnectorService</c>). It works for every Camel connector family:
///   <list type="number">
///     <item>
///       <description>
///         Config-driven path: loads the generated connector config JSON (the
///         single source of truth) under <c>ConfigFiles/Camel/&lt;Family&gt;/</c>,
///         validates the request, retrieves and decodes the credential, maps
///         user-provided field values to the appropriate Camel request locations
///         using each field's <c>camel</c> block, and builds a generic structured
///         request sent to the harness <c>/api/connectors/execute</c>.
///       </description>
///     </item>
///     <item>
///       <description>
///         Schema-driven fallback: for catalog components without a config file,
///         resolve the operation from the harness schema and build the same
///         structured request directly from the payload.
///       </description>
///     </item>
///   </list>
///
/// No connector-specific request-building logic lives here — everything is driven
/// by the connector configuration and/or the harness catalog schema.
/// </summary>
public class CamelConnectorService : ICamelConnectorService
{
    private readonly ILogger<CamelConnectorService> _logger;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly ICloudConnectorsVaultService _cloudConnectorsVaultService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly CamelConnectorsConfigRepository _configRepository;
    private readonly CamelCatalogClient _catalogClient;

    public CamelConnectorService(
        ILogger<CamelConnectorService> logger,
        EnvironmentConfig environmentConfig,
        ICloudConnectorsVaultService cloudConnectorsVaultService,
        IHttpClientFactory httpClientFactory,
        CamelConnectorsConfigRepository configRepository,
        CamelCatalogClient catalogClient)
    {
        _logger = logger;
        _environmentConfig = environmentConfig;
        _cloudConnectorsVaultService = cloudConnectorsVaultService;
        _httpClientFactory = httpClientFactory;
        _configRepository = configRepository;
        _catalogClient = catalogClient;
    }

    /// <inheritdoc />
    public async Task<ServiceResponse<CloudConnectorResDto>> InvokeAsync(CloudConnectorReqDto request)
    {
        var serviceResponse = new ServiceResponse<CloudConnectorResDto>
        {
            Data = new CloudConnectorResDto
            {
                Response = null,
                Provider = request.Provider,
                Action = request.Action
            },
            StatusCode = 400
        };

        try
        {
            var family = ResolveFamily(request.Provider);
            var action = request.Action;
            var payload = request.Payload ?? new Dictionary<string, object>();

            // 1. Prefer the config-driven path (generated config file).
            var config = _configRepository.Get(family, action);
            if (config?.Connector != null && !string.IsNullOrWhiteSpace(config.Connector.Name))
            {
                return await InvokeFromConfigAsync(request, family, action, payload, config);
            }

            // 2. Schema-driven fallback for catalog components without a config file.
            return await InvokeFromSchemaAsync(request, family, action, payload);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while invoking Camel connector '{Provider}/{Action}'.",
                request.Provider, request.Action);
            serviceResponse.StatusCode = 500;
            serviceResponse.Message = $"Error: {ex.GetBaseException().Message}";
            serviceResponse.Data.Response = serviceResponse.Message;
            return serviceResponse;
        }
    }

    /// <inheritdoc />
    public async Task<IReadOnlyDictionary<string, CamelConnectorSchema>> GetCatalogAsync(
        CancellationToken cancellationToken = default)
    {
        return await _catalogClient.GetCatalogAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<string>> GetOperationsAsync(
        string connector,
        CancellationToken cancellationToken = default)
    {
        var schema = await _catalogClient.GetConnectorAsync(connector, cancellationToken);
        return schema?.Operations() ?? Array.Empty<string>();
    }

    /// <inheritdoc />
    public async Task<int> RefreshCatalogAsync(CancellationToken cancellationToken = default)
    {
        _catalogClient.InvalidateCache();
        var catalog = await _catalogClient.GetCatalogAsync(cancellationToken);
        _logger.LogInformation("Camel catalog refresh complete: {Count} connectors.", catalog.Count);
        return catalog.Count;
    }

    // ---------------------------------------------------------------------
    // Config-driven invocation
    // ---------------------------------------------------------------------

    private async Task<ServiceResponse<CloudConnectorResDto>> InvokeFromConfigAsync(
        CloudConnectorReqDto request,
        string family,
        string action,
        Dictionary<string, object> payload,
        CamelConnectorConfig config)
    {
        var serviceResponse = new ServiceResponse<CloudConnectorResDto>
        {
            Data = new CloudConnectorResDto { Response = null, Provider = request.Provider, Action = request.Action },
            StatusCode = 400
        };

        var connectorMeta = config.Connector!;

        // 1. Resolve the harness operation.
        var operation = ResolveOperation(connectorMeta, family, action, payload);
        if (string.IsNullOrWhiteSpace(operation))
        {
            serviceResponse.Message = $"Unable to resolve a Camel operation for '{request.Provider}/{action}'.";
            serviceResponse.Data.Response = serviceResponse.Message;
            return serviceResponse;
        }

        // 2. Validate required fields.
        var validationError = ValidateRequiredFields(config, payload);
        if (validationError != null)
        {
            serviceResponse.Message = validationError;
            serviceResponse.Data.Response = validationError;
            return serviceResponse;
        }

        // 3. Retrieve + decode the credential (if required by the config).
        var credentialName = ResolveCredentialName(config, request, payload);
        var auth = await BuildAuthAsync(connectorMeta.AuthType, credentialName, payload);
        if (!auth.IsSuccess)
        {
            serviceResponse.StatusCode = auth.StatusCode;
            serviceResponse.Message = auth.ErrorMessage ?? $"Authentication setup failed for Camel connector '{family}'.";
            serviceResponse.Data.Response = serviceResponse.Message;
            return serviceResponse;
        }

        // 4. Map fields based on their camel.location and build the generic request.
        var structuredRequest = BuildStructuredRequest(connectorMeta.Name!, operation, auth, credentialName, config, payload);

        return await SendToHarnessAsync(family, structuredRequest);
    }

    // ---------------------------------------------------------------------
    // Schema-driven invocation
    // ---------------------------------------------------------------------

    private async Task<ServiceResponse<CloudConnectorResDto>> InvokeFromSchemaAsync(
        CloudConnectorReqDto request,
        string family,
        string action,
        Dictionary<string, object> payload)
    {
        var serviceResponse = new ServiceResponse<CloudConnectorResDto>
        {
            Data = new CloudConnectorResDto { Response = null, Provider = request.Provider, Action = request.Action },
            StatusCode = 400
        };

        try
        {
            var schema = await _catalogClient.GetConnectorAsync(family);
            if (schema == null)
            {
                serviceResponse.Message = $"No Camel connector schema found for '{request.Provider}/{action}'.";
                serviceResponse.Data.Response = serviceResponse.Message;
                return serviceResponse;
            }

            var operation = ResolveOperationFromSchema(schema, action, payload);
            if (string.IsNullOrWhiteSpace(operation))
            {
                serviceResponse.Message = $"Unable to resolve a Camel operation for '{request.Provider}/{action}'.";
                serviceResponse.Data.Response = serviceResponse.Message;
                return serviceResponse;
            }

            // Schema-driven requests carry no per-field camel mapping, so all
            // payload keys are treated as connector properties. Authentication is
            // resolved from the request credential when present.
            var structuredRequest = await BuildSchemaStructuredRequest(family, operation, request, payload);

            return await SendToHarnessAsync(family, structuredRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while invoking Camel connector '{Provider}/{Action}' via schema.",
                request.Provider, request.Action);
            serviceResponse.StatusCode = 500;
            serviceResponse.Message = $"Error: {ex.GetBaseException().Message}";
            serviceResponse.Data.Response = serviceResponse.Message;
            return serviceResponse;
        }
    }

    // ---------------------------------------------------------------------
    // Shared harness call + response normalization
    // ---------------------------------------------------------------------

    private async Task<ServiceResponse<CloudConnectorResDto>> SendToHarnessAsync(
        string family,
        Dictionary<string, object?> structuredRequest)
    {
        var serviceResponse = new ServiceResponse<CloudConnectorResDto>
        {
            Data = new CloudConnectorResDto
            {
                Response = null,
                Provider = family,
                Action = structuredRequest.TryGetValue("operation", out var op) ? op?.ToString() ?? string.Empty : string.Empty
            },
            StatusCode = 400
        };

        var camelBaseUrl = _environmentConfig.CamelApiBaseUrl?.TrimEnd('/');
        if (string.IsNullOrWhiteSpace(camelBaseUrl))
        {
            serviceResponse.StatusCode = 500;
            serviceResponse.Message = "Camel API base URL is not configured.";
            serviceResponse.Data.Response = serviceResponse.Message;
            return serviceResponse;
        }

        var url = $"{camelBaseUrl}/api/connectors/execute";
        using var client = _httpClientFactory.CreateClient("CamelConnectors");
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = JsonContent.Create(structuredRequest, new System.Net.Http.Headers.MediaTypeHeaderValue("application/json"))
        };

        _logger.LogInformation("Camel Request Endpoint: {Url}", url);
        _logger.LogInformation("Camel Request Body (sanitized): {Body}", SanitizeForLog(structuredRequest));

        using var response = await client.SendAsync(httpRequest);
        var responseBody = await response.Content.ReadAsStringAsync();

        _logger.LogInformation("Camel Response Status: {Status}", (int)response.StatusCode);
        _logger.LogInformation("Camel Response Body: {Body}", responseBody);

        if (!response.IsSuccessStatusCode)
        {
            serviceResponse.StatusCode = (int)response.StatusCode;
            serviceResponse.Message = $"Camel connector '{family}' returned {response.StatusCode}.";
            serviceResponse.Data.Response = TryParseError(responseBody) ?? responseBody;
            return serviceResponse;
        }

        // Normalize the harness response { success, connector, operation, data, error }.
        using var doc = JsonDocument.Parse(responseBody);
        var root = doc.RootElement;

        var success = root.TryGetProperty("success", out var successEl)
            ? successEl.GetBoolean()
            : true;

        if (!success)
        {
            object? error = root.TryGetProperty("error", out var errorEl) ? (object?)errorEl.Clone() : null;
            var message = error != null && error is JsonElement errEl && errEl.ValueKind == JsonValueKind.Object
                && errEl.TryGetProperty("message", out var msgEl)
                ? msgEl.GetString()
                : error?.ToString() ?? $"Camel connector '{family}' reported a failure.";

            serviceResponse.StatusCode = 502;
            serviceResponse.Message = message;
            serviceResponse.Data.Response = error;
            return serviceResponse;
        }

        object? data = root.TryGetProperty("data", out var dataEl) ? (object?)dataEl.Clone() : null;
        serviceResponse.StatusCode = 200;
        serviceResponse.Message = $"Camel connector '{family}' invoked successfully.";
        serviceResponse.Data.Response = data;
        return serviceResponse;
    }

    // ---------------------------------------------------------------------
    // Family / operation resolution
    // ---------------------------------------------------------------------

    /// <summary>
    /// Resolves the Camel family from the provider. The NodeExecutor sends the
    /// provider as the mapping-file path segment (e.g. "Camel/Github"), while
    /// direct callers may send the bare family ("github").
    /// </summary>
    private static string ResolveFamily(string? provider)
    {
        if (string.IsNullOrWhiteSpace(provider))
        {
            return string.Empty;
        }
        var segments = provider.Split('/', StringSplitOptions.RemoveEmptyEntries);
        var last = segments.Length > 0 ? segments[^1] : provider;
        return last.ToLowerInvariant();
    }

    private string? ResolveOperation(
        CamelConnectorMeta connectorMeta,
        string family,
        string action,
        Dictionary<string, object> payload)
    {
        if (!string.IsNullOrWhiteSpace(connectorMeta.Operation))
        {
            return connectorMeta.Operation;
        }

        if (payload.TryGetValue("operation", out var opObj) && opObj != null)
        {
            return opObj.ToString();
        }

        var mapping = LoadActionMapping();
        if (mapping != null &&
            mapping.TryGetValue(family, out var familyMap) &&
            familyMap is Dictionary<string, object?> fam &&
            fam.TryGetValue(action, out var mapped) &&
            mapped is string op &&
            !string.IsNullOrWhiteSpace(op))
        {
            return op;
        }

        return string.IsNullOrWhiteSpace(action) ? null : action;
    }

    private static string? ResolveOperationFromSchema(
        CamelConnectorSchema schema,
        string action,
        Dictionary<string, object> payload)
    {
        // 1. Explicit operation in the payload.
        if (payload.TryGetValue("operation", out var opObj) && opObj != null)
        {
            return opObj.ToString();
        }

        // 2. The action name may already be the dotted operation (e.g. "repository.list").
        if (action.Contains('.'))
        {
            return action;
        }

        // 3. Match the action against the schema's operation enum.
        var operations = schema.Operations();
        if (operations.Count > 0)
        {
            var normalized = action.ToLowerInvariant();
            var match = operations.FirstOrDefault(o =>
                string.Equals(o, normalized, StringComparison.OrdinalIgnoreCase)
                || string.Equals(o.Replace(".", string.Empty), normalized.Replace(".", string.Empty), StringComparison.OrdinalIgnoreCase));
            if (match != null)
            {
                return match;
            }
        }

        // 4. Fall back to the action itself.
        return string.IsNullOrWhiteSpace(action) ? null : action;
    }

    private static Dictionary<string, object?>? _actionMappingCache;
    private static readonly object _actionMappingGate = new();

    private Dictionary<string, object?>? LoadActionMapping()
    {
        lock (_actionMappingGate)
        {
            if (_actionMappingCache != null)
            {
                return _actionMappingCache;
            }
            try
            {
                var path = Path.Combine(
                    AppContext.BaseDirectory,
                    "Features", "CloudConnectors", "Camel", "Helpers", "CamelActionMapping.json");
                if (!System.IO.File.Exists(path))
                {
                    _logger.LogWarning("CamelActionMapping.json not found at {Path}.", path);
                    _actionMappingCache = new Dictionary<string, object?>();
                    return null;
                }
                var json = System.IO.File.ReadAllText(path);
                _actionMappingCache = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object?>>(json);
                return _actionMappingCache;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load Camel action mapping.");
                _actionMappingCache = new Dictionary<string, object?>();
                return null;
            }
        }
    }

    // ---------------------------------------------------------------------
    // Validation
    // ---------------------------------------------------------------------

    private static string? ValidateRequiredFields(CamelConnectorConfig config, Dictionary<string, object> payload)
    {
        foreach (var field in config.Fields)
        {
            if (field.Direction != "Input" || !field.Required)
            {
                continue;
            }
            if (field.Type == "credentials-select")
            {
                continue; // credential presence is validated separately
            }
            if (!HasValue(payload, field.Name))
            {
                return $"Field '{field.Name}' is required for connector '{config.Connector?.Name}'.";
            }
        }
        return null;
    }

    private static bool HasValue(Dictionary<string, object> payload, string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return false;
        }
        foreach (var kv in payload)
        {
            if (string.Equals(kv.Key, name, StringComparison.OrdinalIgnoreCase) && kv.Value != null)
            {
                var s = Convert.ToString(kv.Value);
                return !string.IsNullOrWhiteSpace(s);
            }
        }
        return false;
    }

    // ---------------------------------------------------------------------
    // Credential handling
    // ---------------------------------------------------------------------

    private static string? ResolveCredentialName(
        CamelConnectorConfig config,
        CloudConnectorReqDto request,
        Dictionary<string, object> payload)
    {
        // Prefer the explicit credential name on the request.
        if (!string.IsNullOrWhiteSpace(request.CredentialName))
        {
            return request.CredentialName;
        }

        // Fall back to the credentials field value in the payload.
        var fieldName = config.Credentials?.FieldName;
        if (!string.IsNullOrWhiteSpace(fieldName))
        {
            foreach (var kv in payload)
            {
                if (string.Equals(kv.Key, fieldName, StringComparison.OrdinalIgnoreCase) && kv.Value != null)
                {
                    var value = Convert.ToString(kv.Value);
                    if (!string.IsNullOrWhiteSpace(value))
                    {
                        return value;
                    }
                }
            }
        }
        return null;
    }

    private async Task<CamelAuthResult> BuildAuthAsync(
        string? authType,
        string? credentialName,
        Dictionary<string, object> payload)
    {
        var normalized = string.IsNullOrWhiteSpace(authType) ? "none" : authType.ToLowerInvariant();

        if (normalized is "none" or "")
        {
            return CamelAuthResult.None();
        }

        var credential = await GetCredentialAsync(credentialName);
        if (credential == null)
        {
            return CamelCredentialHelpers.MissingCredential(credentialName ?? "unknown", credentialName);
        }

        return normalized switch
        {
            "accesstoken" or "access_token" or "pat" => CamelCredentialHelpers.AccessToken(credential),
            "basic" => CamelCredentialHelpers.Basic(credential, payload, credentialName ?? "unknown"),
            "database" or "db" => CamelCredentialHelpers.Database(credential, payload, credentialName ?? "unknown"),
            "clientcredentials" or "client_credentials" => CamelCredentialHelpers.ClientCredentials(credential),
            _ => CamelAuthResult.Failure(400, $"Unsupported authentication type '{authType}' for Camel connector.")
        };
    }

    private async Task<VaultCredentialObj?> GetCredentialAsync(string? credentialName)
    {
        if (string.IsNullOrWhiteSpace(credentialName))
        {
            return null;
        }
        return await _cloudConnectorsVaultService.GetCredentialFromVaultAsync(credentialName);
    }

    // ---------------------------------------------------------------------
    // Structured request building
    // ---------------------------------------------------------------------

    /// <summary>
    /// Builds the generic structured request sent to the harness:
    /// { connector, operation, parameters, query, headers, body, properties, authentication }.
    /// Field values are mapped by each field's <c>camel.location</c>.
    /// </summary>
    private static Dictionary<string, object?> BuildStructuredRequest(
        string connector,
        string operation,
        CamelAuthResult auth,
        string? credentialName,
        CamelConnectorConfig config,
        Dictionary<string, object> payload)
    {
        var parameters = new Dictionary<string, object?>();
        var query = new Dictionary<string, object?>();
        var headers = new Dictionary<string, object?>();
        var properties = new Dictionary<string, object?>();
        var bodyFields = new Dictionary<string, object?>();

        foreach (var field in config.Fields)
        {
            if (field.Direction != "Input" || field.Camel == null)
            {
                continue;
            }
            if (field.Type == "credentials-select")
            {
                continue;
            }

            var value = GetPayloadValue(payload, field.Name);
            if (value == null || IsEmptyValue(value))
            {
                continue; // optional fields are omitted when not provided
            }

            var location = field.Camel.Location?.ToLowerInvariant();
            var camelName = field.Camel.Name ?? field.Name ?? throw new InvalidOperationException($"Camel field name is missing for field '{field.Label ?? "unknown"}'.");
            switch (location)
            {
                case "path":
                case "parameter":
                    parameters[camelName] = value;
                    break;
                case "query":
                    query[camelName] = value;
                    break;
                case "header":
                    headers[camelName] = value;
                    break;
                case "body":
                    bodyFields[camelName] = value;
                    break;
                case "property":
                    properties[camelName] = value;
                    break;
                default:
                    // Unknown location: treat as a property so the value is not lost.
                    properties[camelName] = value;
                    break;
            }
        }

        object? body = null;
        if (bodyFields.Count == 1)
        {
            body = bodyFields.Values.First();
        }
        else if (bodyFields.Count > 1)
        {
            body = bodyFields;
        }

        return new Dictionary<string, object?>
        {
            ["connector"] = connector,
            ["operation"] = operation,
            ["parameters"] = parameters.Count > 0 ? parameters : null,
            ["query"] = query.Count > 0 ? query : null,
            ["headers"] = headers.Count > 0 ? headers : null,
            ["body"] = body,
            ["properties"] = properties.Count > 0 ? properties : null,
            ["authentication"] = BuildAuthentication(auth, credentialName),
        };
    }

    /// <summary>
    /// Builds the structured request for the schema-driven fallback. All payload
    /// keys except the well-known <c>operation</c> key are mapped to
    /// <c>properties</c> (the generic location). Authentication is attached from
    /// the request credential when provided.
    /// </summary>
    private async Task<Dictionary<string, object?>> BuildSchemaStructuredRequest(
        string connector,
        string operation,
        CloudConnectorReqDto request,
        Dictionary<string, object> payload)
    {
        var properties = new Dictionary<string, object?>();
        foreach (var kv in payload)
        {
            if (string.Equals(kv.Key, "operation", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }
            properties[kv.Key] = kv.Value;
        }

        // Resolve auth from the request credential if present (no config to infer
        // the auth type, so use the access-token convention when a credential name
        // is supplied).
        Dictionary<string, object?>? authentication = null;
        if (!string.IsNullOrWhiteSpace(request.CredentialName))
        {
            var credential = await GetCredentialAsync(request.CredentialName);
            if (credential != null)
            {
                var auth = CamelCredentialHelpers.AccessToken(credential);
                if (auth.IsSuccess)
                {
                    authentication = (Dictionary<string, object?>?)BuildAuthentication(auth, request.CredentialName);
                }
            }
        }

        return new Dictionary<string, object?>
        {
            ["connector"] = connector,
            ["operation"] = operation,
            ["parameters"] = null,
            ["query"] = null,
            ["headers"] = null,
            ["body"] = null,
            ["properties"] = properties.Count > 0 ? properties : null,
            ["authentication"] = authentication,
        };
    }

    /// <summary>
    /// Converts the flat auth result into the structured
    /// <c>authentication: { type, credential: { name, value } }</c> block consumed
    /// by the harness <c>POST /api/connectors/execute</c> endpoint (see the
    /// harness <c>CamelRequestBuilder</c>). The credential value is the decoded
    /// credential object (never logged).
    /// </summary>
    private static object? BuildAuthentication(CamelAuthResult auth, string? credentialName)
    {
        if (auth.Auth == null)
        {
            return null;
        }

        var type = auth.Auth.TryGetValue("type", out var typeObj) ? typeObj?.ToString() : null;
        if (string.IsNullOrWhiteSpace(type) || type == "none")
        {
            return null;
        }

        // The credential value is the decoded credential object (never logged).
        var value = new Dictionary<string, object?>();
        foreach (var kv in auth.Auth)
        {
            if (kv.Key == "type")
            {
                continue;
            }
            value[kv.Key] = kv.Value;
        }

        return new Dictionary<string, object?>
        {
            ["type"] = type,
            ["credential"] = new Dictionary<string, object?>
            {
                ["name"] = credentialName,
                ["value"] = value
            }
        };
    }

    private static object? GetPayloadValue(Dictionary<string, object> payload, string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return null;
        }
        foreach (var kv in payload)
        {
            if (string.Equals(kv.Key, name, StringComparison.OrdinalIgnoreCase))
            {
                return kv.Value;
            }
        }
        return null;
    }

    private static bool IsEmptyValue(object value)
    {
        if (value == null)
        {
            return true;
        }
        if (value is string s)
        {
            return string.IsNullOrWhiteSpace(s);
        }
        if (value is JsonElement el)
        {
            return el.ValueKind == JsonValueKind.Null
                || (el.ValueKind == JsonValueKind.String && string.IsNullOrWhiteSpace(el.GetString()));
        }
        return false;
    }

    // ---------------------------------------------------------------------
    // Logging / error helpers
    // ---------------------------------------------------------------------

    /// <summary>
    /// Produces a log-safe representation of the request, replacing any
    /// credential values with a placeholder. Raw credentials must never be
    /// written to application logs.
    /// </summary>
    private static string SanitizeForLog(Dictionary<string, object?> request)
    {
        try
        {
            var copy = new Dictionary<string, object?>(request);
            if (copy.TryGetValue("authentication", out var authObj) && authObj is Dictionary<string, object?> auth)
            {
                copy["authentication"] = new Dictionary<string, object?>
                {
                    ["type"] = auth.TryGetValue("type", out var t) ? t : null,
                    ["credential"] = "[REDACTED]"
                };
            }
            return System.Text.Json.JsonSerializer.Serialize(copy);
        }
        catch
        {
            return "[unable to serialize request]";
        }
    }

    private static string? TryParseError(string responseBody)
    {
        try
        {
            using var doc = JsonDocument.Parse(responseBody);
            var root = doc.RootElement;
            if (root.TryGetProperty("error", out var err))
            {
                if (err.ValueKind == JsonValueKind.Object && err.TryGetProperty("message", out var msg))
                {
                    return msg.GetString();
                }
                return err.GetString();
            }
        }
        catch
        {
            // ignore
        }
        return null;
    }
}
