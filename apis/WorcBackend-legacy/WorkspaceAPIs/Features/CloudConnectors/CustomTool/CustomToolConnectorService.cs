using System.Text;
using System.Text.Json;
using WorkspaceAPIs.Features.CloudConnectors;
using WorkspaceAPIs.Features.Tools.Helpers;

namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool;

/// <summary>
/// Executes custom tool operations .NET-native: resolves the tool and its flattened
/// OpenAPI operation from the <c>{toolName}.{operationId}</c> action (legacy
/// <c>{toolId}.{operationId}</c> references are still accepted), decrypts the vault
/// credential server-side, builds the HTTP request (path placeholders, query/header
/// parameters, JSON body) and proxies it to the tool's base URL.
///
/// Guardrails (Q10): http/https schemes only, 30-second timeout, 5 MB response cap.
/// Unverified tools are rejected at runtime even though they stay visible in the
/// selector (Q8).
/// </summary>
public class CustomToolConnectorService : ICustomToolConnectorService
{
    private static readonly TimeSpan RequestTimeout = TimeSpan.FromSeconds(30);
    private const long MaxResponseBytes = 5 * 1024 * 1024;

    private readonly ILogger<CustomToolConnectorService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ICloudConnectorsVaultService _cloudConnectorsVaultService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly Guid _currentUserId;

    public CustomToolConnectorService(
        ILogger<CustomToolConnectorService> logger,
        IUnitOfWork unitOfWork,
        IHttpClientFactory httpClientFactory,
        ICloudConnectorsVaultService cloudConnectorsVaultService,
        ICurrentTenantService currentTenantService,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _httpClientFactory = httpClientFactory;
        _cloudConnectorsVaultService = cloudConnectorsVaultService;
        _currentTenantService = currentTenantService;
        _currentUserId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

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
            // Step 1: Resolve the tool from the "{toolName}.{operationId}" action.
            // Names may contain dots, so every split candidate is tried until one
            // matches a real custom tool (legacy "{toolId}.{operationId}" included).
            var candidates = CustomToolActionHelpers.SplitActionCandidates(request.Action).ToList();
            if (candidates.Count == 0)
            {
                serviceResponse.Message = $"Invalid action '{request.Action}'. Expected the '{{toolName}}.{{operationId}}' format.";
                return serviceResponse;
            }

            var (tool, operationId) = await CustomToolActionHelpers.ResolveToolAsync(
                _unitOfWork.ToolRepo, _currentTenantService, request.Action);
            if (tool is null)
            {
                serviceResponse.Message = $"Custom tool '{candidates[0].ToolName}' was not found.";
                return serviceResponse;
            }

            // Step 2: Reject inactive/disabled tools within the current tenant/environment.
            if (!tool.IsActive || tool.IsDisabled)
            {
                serviceResponse.Message = $"Custom tool '{tool.Name}' is not active.";
                return serviceResponse;
            }

            // Step 3: Reject unverified tools at runtime (they remain visible in the selector).
            if (!tool.IsVerified)
            {
                serviceResponse.Message = $"Custom tool '{tool.Name}' is unverified. Test the tool before invoking it.";
                return serviceResponse;
            }

            // Step 4: Resolve the operation from the parsed schema.
            var operations = ToolOperationHelpers.ExtractOperations(tool.ParsedSchema);
            var operation = operations.FirstOrDefault(o =>
                string.Equals(o.OperationId, operationId, StringComparison.OrdinalIgnoreCase));

            if (operation is null)
            {
                serviceResponse.Message = $"Operation '{operationId}' was not found on custom tool '{tool.Name}'.";
                return serviceResponse;
            }

            if (string.IsNullOrWhiteSpace(operation.Method) || string.IsNullOrWhiteSpace(operation.Path))
            {
                serviceResponse.Message = $"Operation '{operationId}' has no HTTP method or path defined.";
                return serviceResponse;
            }

            // Step 5: Guardrail - only http/https base URLs are supported.
            var baseUrl = tool.BaseUrl?.Trim() ?? string.Empty;
            if (!Uri.TryCreate(baseUrl, UriKind.Absolute, out var baseUri) ||
                baseUri.Scheme is not ("http" or "https"))
            {
                serviceResponse.Message = $"Custom tool '{tool.Name}' has an invalid base URL. Only http/https are supported.";
                return serviceResponse;
            }

            // Step 6: Resolve + apply the vault credential (secrets never leave the server).
            var credentialHeaders = new Dictionary<string, string>();
            string? credentialQuery = null;
            var hasCredential = !string.IsNullOrWhiteSpace(request.CredentialName) || !string.IsNullOrWhiteSpace(tool.CredentialName);
            if (hasCredential)
            {
                var credentialName = request.CredentialName ?? tool.CredentialName!;
                var auth = await ResolveAuthenticationAsync(credentialName);
                if (!auth.IsSuccess)
                {
                    serviceResponse.Message = auth.ErrorMessage;
                    return serviceResponse;
                }

                foreach (var header in auth.Headers)
                {
                    credentialHeaders[header.Key] = header.Value;
                }

                credentialQuery = auth.Query;
            }

            // Step 7: Build the request URL and content from the operation definition.
            var payload = request.Payload ?? [];
            var (requestUrl, remainingPayload) = BuildRequestUrl(baseUri, operation, payload, credentialQuery);
            var (content, contentType) = BuildRequestContent(operation, remainingPayload);

            // Step 8: Send the proxied request under the guardrails.
            var (statusCode, responseText, responseError) = await SendAsync(operation.Method, requestUrl, credentialHeaders, content, contentType);
            if (responseError is not null)
            {
                serviceResponse.Message = responseError;
                return serviceResponse;
            }

            // Step 9: Parse the upstream response for the executor.
            serviceResponse.Data.Response = ParseResponseBody(responseText);
            serviceResponse.StatusCode = statusCode >= 200 && statusCode < 300 ? 200 : 502;
            serviceResponse.Message = statusCode >= 200 && statusCode < 300
                ? "Custom tool invoked successfully."
                : $"Upstream API responded with status code {statusCode}.";
            _logger.LogInformation(
                "Custom tool '{ToolName}' operation '{OperationId}' invoked with upstream status {StatusCode}.",
                tool.Name, operationId, statusCode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while invoking custom tool action {Action}.", request.Action);
            serviceResponse.StatusCode = 500;
            serviceResponse.Message = $"Error: {ex.Message}";
        }

        return serviceResponse;
    }

    /// <summary>
    /// Resolves the decrypted vault credential into concrete HTTP authentication
    /// headers (or a query parameter) for the CustomApiTool credential conventions.
    /// </summary>
    private async Task<CustomToolAuthResult> ResolveAuthenticationAsync(string credentialName)
    {
        var vaultCredential = await _cloudConnectorsVaultService.GetCredentialFromVaultAsync(credentialName);
        if (vaultCredential is null)
        {
            return CustomToolAuthResult.Failure($"Credential '{credentialName}' was not found or is disabled.");
        }

        // The CustomApiTool vault payload nests auth values under "Parameters"
        // (sanitized on create; decrypted values merge back into that object).
        var parameters = GetCredentialParameters(vaultCredential.Data);
        var authType = ResolveAuthType(vaultCredential.Data);

        var headers = new Dictionary<string, string>();
        string? query = null;
        switch (authType)
        {
            case ToolAuthenticationTypeEnum.Bearer:
                {
                    var token = GetString(parameters, "token");
                    if (string.IsNullOrWhiteSpace(token))
                    {
                        return CustomToolAuthResult.Failure($"Credential '{credentialName}' has no 'token' value.");
                    }

                    headers["Authorization"] = $"Bearer {token}";
                    break;
                }

            case ToolAuthenticationTypeEnum.Basic:
                {
                    var username = GetString(parameters, "username");
                    var password = GetString(parameters, "password");
                    if (string.IsNullOrWhiteSpace(username))
                    {
                        return CustomToolAuthResult.Failure($"Credential '{credentialName}' has no 'username' value.");
                    }

                    var encoded = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{password}"));
                    headers["Authorization"] = $"Basic {encoded}";
                    break;
                }

            case ToolAuthenticationTypeEnum.ApiKeyHeader:
                {
                    var headerName = GetString(parameters, "headerName");
                    var apiKey = GetString(parameters, "apiKey");
                    if (string.IsNullOrWhiteSpace(headerName) || string.IsNullOrWhiteSpace(apiKey))
                    {
                        return CustomToolAuthResult.Failure($"Credential '{credentialName}' has no 'headerName'/'apiKey' values.");
                    }

                    headers[headerName] = apiKey!;
                    break;
                }

            case ToolAuthenticationTypeEnum.ApiKeyQuery:
                {
                    var parameterName = GetString(parameters, "parameterName");
                    var apiKey = GetString(parameters, "apiKey");
                    if (string.IsNullOrWhiteSpace(parameterName) || string.IsNullOrWhiteSpace(apiKey))
                    {
                        return CustomToolAuthResult.Failure($"Credential '{credentialName}' has no 'parameterName'/'apiKey' values.");
                    }

                    query = $"{Uri.EscapeDataString(parameterName!)}={Uri.EscapeDataString(apiKey!)}";
                    break;
                }

            default:
                {
                    return CustomToolAuthResult.Failure(
                        $"Credential '{credentialName}' has an unsupported authentication type '{authType}'.");
                }
        }

        return CustomToolAuthResult.Succeeded(headers, query);
    }

    /// <summary>
    /// Reads the decrypted "Parameters" object of a CustomApiTool credential.
    /// </summary>
    private static Dictionary<string, string> GetCredentialParameters(Dictionary<string, object> data)
    {
        var parameters = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        if (!data.TryGetValue("Parameters", out var parametersValue) || parametersValue is null)
        {
            return parameters;
        }

        // Decrypted values arrive as JsonElement-backed objects; normalize to strings.
        if (parametersValue is JsonElement parametersElement && parametersElement.ValueKind == JsonValueKind.Object)
        {
            foreach (var property in parametersElement.EnumerateObject())
            {
                parameters[property.Name] = property.Value.ToString() ?? string.Empty;
            }
        }
        else if (parametersValue is Dictionary<string, object> parametersDict)
        {
            foreach (var kvp in parametersDict)
            {
                parameters[kvp.Key] = kvp.Value?.ToString() ?? string.Empty;
            }
        }

        return parameters;
    }

    /// <summary>
    /// Resolves the credential's authentication type from the "Type" key, accepting
    /// both the enum-name string ("Bearer") and numeric encodings.
    /// </summary>
    private static ToolAuthenticationTypeEnum ResolveAuthType(Dictionary<string, object> data)
    {
        if (!data.TryGetValue("Type", out var typeValue) || typeValue is null)
        {
            return ToolAuthenticationTypeEnum.None;
        }

        if (typeValue is JsonElement typeElement)
        {
            if (typeElement.ValueKind == JsonValueKind.String &&
                Enum.TryParse<ToolAuthenticationTypeEnum>(typeElement.GetString(), ignoreCase: true, out var parsed))
            {
                return parsed;
            }

            if (typeElement.ValueKind == JsonValueKind.Number && typeElement.TryGetInt32(out var numeric))
            {
                return (ToolAuthenticationTypeEnum)numeric;
            }
        }

        return Enum.TryParse<ToolAuthenticationTypeEnum>(typeValue.ToString(), ignoreCase: true, out var fallback)
            ? fallback
            : ToolAuthenticationTypeEnum.None;
    }

    /// <summary>
    /// Reads a non-empty string from the credential parameters.
    /// </summary>
    private static string? GetString(Dictionary<string, string> parameters, string key) =>
        parameters.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value) ? value : null;

    /// <summary>
    /// Builds the request URL: substitutes path placeholders, appends query
    /// parameters from the payload, and appends the credential's API-key query
    /// when applicable. Returns the payload entries that were not consumed by the
    /// URL (i.e. the body candidates).
    /// </summary>
    private static (string RequestUrl, Dictionary<string, object> RemainingPayload) BuildRequestUrl(
        Uri baseUri,
        UsableToolOperationDto operation,
        Dictionary<string, object> payload,
        string? credentialQuery)
    {
        var remaining = new Dictionary<string, object>(payload, StringComparer.OrdinalIgnoreCase);

        // Path placeholders come from the path template, not just the declared params.
        var resolvedPath = operation.Path!.TrimStart('/');
        foreach (var placeholder in ExtractPathPlaceholders(operation.Path))
        {
            if (remaining.TryGetValue(placeholder, out var value))
            {
                resolvedPath = resolvedPath.Replace(
                    $"{{{placeholder}}}",
                    Uri.EscapeDataString(value?.ToString() ?? string.Empty));
                remaining.Remove(placeholder);
            }
        }

        var query = System.Web.HttpUtility.ParseQueryString(string.Empty);
        foreach (var parameter in operation.Parameters ?? [])
        {
            if (!string.Equals(parameter.In, "query", StringComparison.OrdinalIgnoreCase) ||
                string.IsNullOrWhiteSpace(parameter.Name) ||
                !remaining.TryGetValue(parameter.Name, out var queryValue))
            {
                continue;
            }

            query[parameter.Name] = queryValue?.ToString() ?? string.Empty;
            remaining.Remove(parameter.Name);
        }

        if (!string.IsNullOrEmpty(credentialQuery))
        {
            var separatorIndex = credentialQuery!.IndexOf('=');
            var name = credentialQuery[..separatorIndex];
            var value = credentialQuery[(separatorIndex + 1)..];
            query[name] = value;
        }

        var pathAndQuery = resolvedPath;
        var queryString = query.ToString();
        if (!string.IsNullOrEmpty(queryString))
        {
            pathAndQuery = $"{pathAndQuery}?{queryString}";
        }

        return ($"{baseUri.GetLeftPart(UriPartial.Authority).TrimEnd('/')}/{pathAndQuery}", remaining);
    }

    /// <summary>
    /// Extracts the <c>{placeholder}</c> tokens from a path template.
    /// </summary>
    private static List<string> ExtractPathPlaceholders(string path)
    {
        var placeholders = new List<string>();
        foreach (System.Text.RegularExpressions.Match match in
            System.Text.RegularExpressions.Regex.Matches(path, "\\{([^/{}]+)\\}"))
        {
            placeholders.Add(match.Groups[1].Value);
        }

        return placeholders;
    }

    /// <summary>
    /// Builds the request body for methods that support one. Body properties are
    /// collected from the payload by the flattened requestBody schema; when the
    /// operation declares no body schema, every unconsumed payload entry is sent
    /// as the JSON body so free-form specs still work.
    /// </summary>
    private static (string? Content, string ContentType) BuildRequestContent(
        UsableToolOperationDto operation,
        Dictionary<string, object> remainingPayload)
    {
        var method = operation.Method!.ToUpperInvariant();
        var supportsBody = method is "POST" or "PUT" or "PATCH";
        if (!supportsBody)
        {
            return (null, "application/json");
        }

        var bodyProperties = operation.RequestBody?.Properties?
            .Where(p => !string.IsNullOrWhiteSpace(p.Name))
            .Select(p => p.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase) ?? [];

        var bodyObject = new Dictionary<string, object>();
        foreach (var kvp in remainingPayload)
        {
            // With a declared schema only schema properties belong in the body;
            // without one everything unconsumed is forwarded.
            if (bodyProperties.Count == 0 || bodyProperties.Contains(kvp.Key))
            {
                bodyObject[kvp.Key] = kvp.Value;
            }
        }

        if (bodyObject.Count == 0)
        {
            return (null, "application/json");
        }

        return (System.Text.Json.JsonSerializer.Serialize(bodyObject), operation.RequestBody?.ContentType ?? "application/json");
    }

    /// <summary>
    /// Sends the proxied request under the guardrails: 30-second timeout and a
    /// 5 MB response cap. Returns the upstream status code, raw body text and an
    /// error message when the call could not be completed.
    /// </summary>
    private async Task<(int StatusCode, string Body, string? Error)> SendAsync(
        string method,
        string requestUrl,
        Dictionary<string, string> headers,
        string? content,
        string contentType)
    {
        // The default factory client is used; the 30-second guardrail (Q10) is
        // enforced per-request via the cancellation token source below.
        var httpClient = _httpClientFactory.CreateClient();

        using var request = new HttpRequestMessage(new HttpMethod(method), requestUrl);
        foreach (var header in headers)
        {
            request.Headers.TryAddWithoutValidation(header.Key, header.Value);
        }

        if (content is not null)
        {
            request.Content = new StringContent(content, Encoding.UTF8, contentType);
        }

        using var timeoutCancellationTokenSource = new CancellationTokenSource(RequestTimeout);

        HttpResponseMessage response;
        try
        {
            response = await httpClient.SendAsync(request, timeoutCancellationTokenSource.Token);
        }
        catch (OperationCanceledException) when (timeoutCancellationTokenSource.IsCancellationRequested)
        {
            return (0, string.Empty, "The upstream API request timed out after 30 seconds.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "The upstream API request failed for {Url}.", requestUrl);
            return (0, string.Empty, $"The upstream API request failed: {ex.Message}");
        }

        // Enforce the response size cap without buffering beyond it.
        await using var responseStream = await response.Content.ReadAsStreamAsync(timeoutCancellationTokenSource.Token);
        var buffer = new System.IO.MemoryStream();
        await responseStream.CopyToAsync(buffer, (int)(MaxResponseBytes + 1), timeoutCancellationTokenSource.Token);
        if (buffer.Length > MaxResponseBytes)
        {
            return (0, string.Empty, "The upstream API response exceeded the 5 MB limit.");
        }

        var body = Encoding.UTF8.GetString(buffer.ToArray());
        return ((int)response.StatusCode, body, null);
    }

    /// <summary>
    /// Parses the upstream body into JSON when possible so the flow engine receives
    /// a queryable object; otherwise the raw text is returned.
    /// </summary>
    private static object? ParseResponseBody(string responseText)
    {
        if (string.IsNullOrWhiteSpace(responseText))
        {
            return null;
        }

        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<object>(responseText);
        }
        catch (System.Text.Json.JsonException)
        {
            return responseText;
        }
    }

    /// <summary>
    /// Authentication resolution outcome for a custom tool credential.
    /// </summary>
    private sealed class CustomToolAuthResult
    {
        public bool IsSuccess { get; private init; }
        public string? ErrorMessage { get; private init; }
        public Dictionary<string, string> Headers { get; private init; } = [];
        public string? Query { get; private init; }

        public static CustomToolAuthResult Succeeded(Dictionary<string, string> headers, string? query) => new()
        {
            IsSuccess = true,
            Headers = headers,
            Query = query,
        };

        public static CustomToolAuthResult Failure(string errorMessage) => new()
        {
            IsSuccess = false,
            ErrorMessage = errorMessage,
        };
    }
}