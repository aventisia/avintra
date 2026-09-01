using System.Net.Http.Json;
using System.Text.Json;
using AspNetToolkit.Config;
using WorkspaceAPIs.Features.CloudConnectors.Camel;
using WorkspaceAPIs.Features.CloudConnectors.CamelV2.Models;

namespace WorkspaceAPIs.Features.CloudConnectors.CamelV2.Services;

/// <summary>
/// Generic, catalog-driven Apache Camel connector service (CamelV2).
///
/// Invocation flow:
///   1. Try to resolve a connector config via <see cref="CamelConnectorsConfigRepository"/>
///      (which now checks both <c>ConfigFiles/Camel/</c> and <c>ConfigFiles/CamelV2/</c>).
///      When found, delegate to the existing <see cref="CamelConnectorService"/>.
///   2. Otherwise fall back to a schema-driven invocation: build the structured
///      harness request <c>{ connector, operation, authentication, parameters,
///      query, headers, body, properties }</c> directly from the payload and the
///      connector schema, and POST it to <c>/api/connectors/execute</c>.
///
/// This makes the service work for every connector in the harness catalog,
/// including components without a hand-written config file.
/// </summary>
public class CamelV2ConnectorService : ICamelV2ConnectorService
{
    private readonly ILogger<CamelV2ConnectorService> _logger;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly CamelConnectorsConfigRepository _configRepository;
    private readonly CamelConnectorService _camelConnectorService;
    private readonly CamelV2CatalogClient _catalogClient;
    private readonly CamelV2ToolSeeder _toolSeeder;
    private readonly CamelV2NodeGenerator _nodeGenerator;

    public CamelV2ConnectorService(
        ILogger<CamelV2ConnectorService> logger,
        EnvironmentConfig environmentConfig,
        IHttpClientFactory httpClientFactory,
        CamelConnectorsConfigRepository configRepository,
        CamelConnectorService camelConnectorService,
        CamelV2CatalogClient catalogClient,
        CamelV2ToolSeeder toolSeeder,
        CamelV2NodeGenerator nodeGenerator)
    {
        _logger = logger;
        _environmentConfig = environmentConfig;
        _httpClientFactory = httpClientFactory;
        _configRepository = configRepository;
        _camelConnectorService = camelConnectorService;
        _catalogClient = catalogClient;
        _toolSeeder = toolSeeder;
        _nodeGenerator = nodeGenerator;
    }

    /// <inheritdoc />
    public async Task<ServiceResponse<CloudConnectorResDto>> InvokeAsync(CloudConnectorReqDto request)
    {
        var family = ResolveFamily(request.Provider);
        var action = request.Action;

        // 1. Prefer the config-driven path (existing CamelConnectorService).
        var config = _configRepository.Get(family, action);
        if (config?.Connector != null && !string.IsNullOrWhiteSpace(config.Connector.Name))
        {
            return await _camelConnectorService.InvokeAsync(request);
        }

        // 2. Schema-driven fallback for catalog components without a config file.
        return await InvokeFromSchemaAsync(request, family, action);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyDictionary<string, CamelV2ConnectorSchema>> GetCatalogAsync(
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
    public async Task<int> RefreshAsync(
        WorkspaceDbContext dbContext,
        CancellationToken cancellationToken = default)
    {
        _catalogClient.InvalidateCache();
        var seeded = await _toolSeeder.SeedAsync(dbContext, cancellationToken);
        var generated = await _nodeGenerator.GenerateAsync(cancellationToken);
        _logger.LogInformation("CamelV2 refresh complete: {Seeded} tools seeded, {Generated} node configs generated.",
            seeded, generated);
        return generated;
    }

    // ---------------------------------------------------------------------
    // Schema-driven invocation
    // ---------------------------------------------------------------------

    private async Task<ServiceResponse<CloudConnectorResDto>> InvokeFromSchemaAsync(
        CloudConnectorReqDto request,
        string family,
        string action)
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
            var schema = await _catalogClient.GetConnectorAsync(family);
            if (schema == null)
            {
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = $"No Camel connector schema found for '{request.Provider}/{action}'.";
                serviceResponse.Data.Response = serviceResponse.Message;
                return serviceResponse;
            }

            var operation = ResolveOperation(schema, action, request.Payload);
            if (string.IsNullOrWhiteSpace(operation))
            {
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = $"Unable to resolve a Camel operation for '{request.Provider}/{action}'.";
                serviceResponse.Data.Response = serviceResponse.Message;
                return serviceResponse;
            }

            var structuredRequest = BuildStructuredRequest(family, operation, request);

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

            _logger.LogInformation("CamelV2 Request Endpoint: {Url}", url);
            _logger.LogInformation("CamelV2 Request Body (sanitized): {Body}", SanitizeForLog(structuredRequest));

            using var response = await client.SendAsync(httpRequest);
            var responseBody = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("CamelV2 Response Status: {Status}", (int)response.StatusCode);
            _logger.LogInformation("CamelV2 Response Body: {Body}", responseBody);

            if (!response.IsSuccessStatusCode)
            {
                serviceResponse.StatusCode = (int)response.StatusCode;
                serviceResponse.Message = $"Camel connector '{family}' returned {response.StatusCode}.";
                serviceResponse.Data.Response = TryParseError(responseBody) ?? responseBody;
                return serviceResponse;
            }

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
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while invoking CamelV2 connector '{Provider}/{Action}'.",
                request.Provider, request.Action);
            serviceResponse.StatusCode = 500;
            serviceResponse.Message = $"Error: {ex.GetBaseException().Message}";
            serviceResponse.Data.Response = serviceResponse.Message;
            return serviceResponse;
        }
    }

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

    private static string? ResolveOperation(
        CamelV2ConnectorSchema schema,
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

    /// <summary>
    /// Builds the structured harness request from the payload. All payload keys
    /// are mapped to <c>properties</c> (the generic location), except the
    /// well-known <c>operation</c> key.
    /// </summary>
    private static Dictionary<string, object?> BuildStructuredRequest(
        string connector,
        string operation,
        CloudConnectorReqDto request)
    {
        var properties = new Dictionary<string, object?>();
        foreach (var kv in request.Payload ?? new Dictionary<string, object>())
        {
            if (string.Equals(kv.Key, "operation", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }
            properties[kv.Key] = kv.Value;
        }

        return new Dictionary<string, object?>
        {
            ["connector"] = connector,
            ["operation"] = operation,
            ["authentication"] = null,
            ["parameters"] = null,
            ["query"] = null,
            ["headers"] = null,
            ["body"] = null,
            ["properties"] = properties.Count > 0 ? properties : null,
        };
    }

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
