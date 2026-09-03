using System.IO;
using System.Net;

namespace NodeLibrary.CloudConnectorNodes;

// This node is not visible in the node selector; it is the runtime node that
// executes a Corsair plugin operation. It calls the Workspace API Corsair
// adapter, which resolves the Vault credential, enforces authorization, and
// invokes the Corsair sidecar with a short-lived bound JWT.
public class ProcessCorsairRequestNode : BaseNode
{
    private static readonly HttpClient _httpClient = new()
    {
        Timeout = TimeSpan.FromSeconds(30)
    };

    [DisplayName("Corsair Plugin")]
    public required InArgument<string> Plugin { get; set; }

    [DisplayName("Corsair Action")]
    public required InArgument<string> Action { get; set; }

    [DisplayName("Credential Name")]
    public required InArgument<string> CredentialName { get; set; }

    [DisplayName("Corsair Request Payload")]
    public required InArgument<string> Payload { get; set; }

    [DisplayName("Result")]
    public OutArgument<JsonElement> Result { get; set; } = new OutArgument<JsonElement>();

    protected override async Task ExecuteAsync(INodeContext context)
    {
        try
        {
            var plugin = Plugin.Get(context);
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
            var apiUrl = $"{normalizedBaseUrl}/workspace/api/corsair/invoke";

            var requestObj = new
            {
                agentId = flowMetadata.Id,
                agentName = flowMetadata.Name,
                plugin,
                action,
                credentialName,
                payload = ParsePayload(payload) // Parse the payload string into camelCase JSON only if it's a valid JSON, otherwise send as string
            };

            var requestJson = JsonSerializer.Serialize(requestObj);

            using var request = new HttpRequestMessage(HttpMethod.Post, apiUrl);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", callerContext.AccessToken);
            NodeHttpHeaders.ApplyEnvHeader(request, callerContext);
            request.Content = new StringContent(requestJson, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();

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

    private static string BuildErrorStatus(HttpStatusCode statusCode, string responseContent)
    {
        try
        {
            using var document = JsonDocument.Parse(responseContent);
            var root = document.RootElement;
            var error = GetString(root, "error") ?? GetNestedString(root, "data", "error");
            var details = GetString(root, "details") ?? GetNestedString(root, "data", "details");
            var message = GetString(root, "message");
            var detail = string.Join("; ", new[] { error, details, message }.Where(value => !string.IsNullOrWhiteSpace(value)).Distinct());
            return string.IsNullOrWhiteSpace(detail)
                ? $"Error: Corsair request failed with HTTP {(int)statusCode} ({statusCode})."
                : $"Error: Corsair request failed with HTTP {(int)statusCode} ({statusCode}): {detail}";
        }
        catch (JsonException)
        {
            return $"Error: Corsair request failed with HTTP {(int)statusCode} ({statusCode}).";
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

    private static object? ParsePayload(string? payloadString)
    {
        if (string.IsNullOrWhiteSpace(payloadString))
            return new Dictionary<string, object?>();

        try
        {
            var doc = JsonDocument.Parse(payloadString);
            return ConvertToCamelCase(doc.RootElement);
        }
        catch
        {
            return payloadString; // fallback: send as string if not valid JSON
        }
    }

    private static object? ConvertToCamelCase(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.Object => element.EnumerateObject().ToDictionary(
                p => char.ToLowerInvariant(p.Name[0]) + p.Name[1..],
                p => ConvertToCamelCase(p.Value)),
            JsonValueKind.Array => element.EnumerateArray().Select(ConvertToCamelCase).ToList(),
            JsonValueKind.String => (object?)element.GetString(),
            JsonValueKind.Number => element.TryGetInt64(out var l) ? l : element.GetDouble(),
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            _ => null
        };
    }
}
