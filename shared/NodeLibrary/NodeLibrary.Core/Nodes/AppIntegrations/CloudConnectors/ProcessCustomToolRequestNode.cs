using System.IO;
using System.Net;

namespace NodeLibrary.CloudConnectorNodes;

// This node is not visible in the node selector; it is the runtime node that
// executes a custom tool operation. It calls the Workspace API custom-tool
// adapter, which resolves the tool, its operation and its Vault credential
// server-side, builds the outbound HTTP request and proxies it to the tool's
// base URL. The executor's cloudConnectorNode preprocessing routes
// "CustomTool/{toolName}.{operationId}" nodes here.
public class ProcessCustomToolRequestNode : BaseNode
{
    private static readonly HttpClient _httpClient = new()
    {
        // The adapter enforces its own 30-second upstream timeout, so the client
        // waits longer to let the adapter report the timeout instead of failing
        // the node with an opaque cancellation.
        Timeout = TimeSpan.FromSeconds(60)
    };

    [DisplayName("Custom Tool Action")]
    public required InArgument<string> Action { get; set; }

    [DisplayName("Credential Name")]
    public required InArgument<string> CredentialName { get; set; }

    [DisplayName("Custom Tool Request Payload")]
    public required InArgument<string> Payload { get; set; }

    [DisplayName("Result")]
    public OutArgument<JsonElement> Result { get; set; } = new OutArgument<JsonElement>();

    protected override async Task ExecuteAsync(INodeContext context)
    {
        try
        {
            var action = Action.Get(context);
            var credentialName = CredentialName.Get(context);
            var payload = Payload.Get(context);
            var flowMetadata = FlowMetadata.Get(context) ?? throw new InvalidOperationException("Agent metadata is required");
            var callerContext = CallerContext.Get(context) ?? throw new InvalidOperationException("Caller context is required");

            var baseUrl = callerContext.AppBaseUrl ?? throw new InvalidOperationException("App base URL is required");
            // EnvironmentConfig.AppBaseUrl is typically just a host (e.g. "avintra.aventisia.com"),
            // so ensure we have an absolute HTTPS URI before calling the backend.
            var normalizedBaseUrl = baseUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                                    baseUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase)
                ? baseUrl.TrimEnd('/')
                : $"https://{baseUrl.TrimEnd('/')}";
            var apiUrl = $"{normalizedBaseUrl}/workspace/api/cloud-connector/custom-tool/invoke";

            var requestObj = new
            {
                agentId = flowMetadata.Id,
                agentName = flowMetadata.Name,
                provider = "customtool",
                action = action ?? string.Empty,
                credentialName = credentialName ?? string.Empty,
                payload = ParsePayload(payload) // Parse the envelope into JSON when valid, else send the raw string
            };

            var requestJson = JsonSerializer.Serialize(requestObj);

            using var request = new HttpRequestMessage(HttpMethod.Post, apiUrl);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", callerContext.AccessToken);
            NodeHttpHeaders.ApplyEnvHeader(request, callerContext);
            request.Content = new StringContent(requestJson, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();

            // Non-2xx responses carry a plain-text message (BaseApiController), so surface
            // that instead of an opaque transport failure.
            if (!response.IsSuccessStatusCode)
            {
                StatusMessage.Set(context, BuildErrorStatus(response.StatusCode, responseContent));
                IsSuccess.Set(context, false);
                return;
            }

            using var responseDoc = JsonDocument.Parse(responseContent);
            var responseRoot = responseDoc.RootElement;

            if (responseRoot.TryGetProperty("data", out var dataEl))
                Result.Set(context, dataEl.Clone());

            var statusCode = responseRoot.TryGetProperty("statusCode", out var scEl) ? scEl.GetInt32() : 0;
            var message = responseRoot.TryGetProperty("message", out var msgEl) ? msgEl.GetString() : string.Empty;

            StatusMessage.Set(context, $"{statusCode}:{message}");
            IsSuccess.Set(context, statusCode == 200);
        }
        catch (Exception ex)
        {
            StatusMessage.Set(context, $"Error: {ex.GetBaseException().Message}");
            IsSuccess.Set(context, false);
        }
    }

    /// <summary>
    /// Builds a readable failure message, preferring the service-response message
    /// (or error/details when present) and falling back to the raw response text.
    /// </summary>
    private static string BuildErrorStatus(HttpStatusCode statusCode, string responseContent)
    {
        var detail = ExtractErrorDetail(responseContent);
        return string.IsNullOrWhiteSpace(detail)
            ? $"Error: Custom tool request failed with HTTP {(int)statusCode} ({statusCode})."
            : $"Error: Custom tool request failed with HTTP {(int)statusCode} ({statusCode}): {detail}";
    }

    private static string? ExtractErrorDetail(string responseContent)
    {
        if (string.IsNullOrWhiteSpace(responseContent))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(responseContent);
            var root = document.RootElement;
            var error = GetString(root, "error") ?? GetNestedString(root, "data", "error");
            var details = GetString(root, "details") ?? GetNestedString(root, "data", "details");
            var message = GetString(root, "message");
            var detail = string.Join("; ", new[] { error, details, message }.Where(value => !string.IsNullOrWhiteSpace(value)).Distinct());
            return string.IsNullOrWhiteSpace(detail) ? null : detail;
        }
        catch (JsonException)
        {
            // Error responses are plain text, not JSON.
            return responseContent.Trim();
        }
    }

    private static string? GetString(JsonElement element, string propertyName) =>
        element.TryGetProperty(propertyName, out var property) && property.ValueKind == JsonValueKind.String
            ? property.GetString()
            : null;

    private static string? GetNestedString(JsonElement element, string parentName, string propertyName) =>
        element.TryGetProperty(parentName, out var parent) && parent.ValueKind == JsonValueKind.Object
            ? GetString(parent, propertyName)
            : null;

    /// <summary>
    /// Parses the executor-built payload envelope, preserving key casing exactly:
    /// the DCP JSON editors let the user author the headers, parameter names and
    /// request body verbatim, and upstream APIs treat body/parameter names as
    /// case-sensitive. Invalid JSON falls back to the raw string.
    /// </summary>
    private static object? ParsePayload(string? payloadString)
    {
        if (string.IsNullOrWhiteSpace(payloadString))
            return new Dictionary<string, object?>();

        try
        {
            var doc = JsonDocument.Parse(payloadString);
            return doc.RootElement.Clone(); // preserve author casing
        }
        catch
        {
            return payloadString; // fallback: send as string if not valid JSON
        }
    }
}
