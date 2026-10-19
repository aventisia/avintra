using System.IO;
using System.Net;

namespace NodeLibrary.CloudConnectorNodes;

/// <summary>
/// Executes a custom tool operation through the Workspace API custom-tool adapter.
/// </summary>
public class ProcessCustomToolRequestNode : BaseNode
{
    private static readonly HttpClient _httpClient = new(new SocketsHttpHandler
    {
        AllowAutoRedirect = false
    })
    {
        // IMPORTANT NOTE: the adapter enforces a 30-second upstream timeout, so this client waits longer to let it report the timeout.
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
            // IMPORTANT NOTE: AppBaseUrl is configured as a bare host, so it must be made absolute here.
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
                payload = ParsePayload(payload)
            };

            var requestJson = JsonSerializer.Serialize(requestObj);

            using var request = new HttpRequestMessage(HttpMethod.Post, apiUrl);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", callerContext.AccessToken);
            NodeHttpHeaders.ApplyEnvHeader(request, callerContext);
            request.Content = new StringContent(requestJson, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();

            // IMPORTANT NOTE: non-2xx responses carry a plain-text message, not the response envelope.
            if (!response.IsSuccessStatusCode)
            {
                StatusMessage.Set(context, BuildErrorStatus(response.StatusCode, responseContent));
                IsSuccess.Set(context, false);
                return;
            }

            using var responseDoc = JsonDocument.Parse(responseContent);
            var responseRoot = responseDoc.RootElement;

            var isUpstreamSuccess = true;
            if (responseRoot.TryGetProperty("data", out var dataEl))
            {
                Result.Set(context, dataEl.Clone());
                isUpstreamSuccess = !(dataEl.ValueKind == JsonValueKind.Object &&
                                      dataEl.TryGetProperty("success", out var successEl) &&
                                      successEl.ValueKind == JsonValueKind.False);
            }

            var statusCode = responseRoot.TryGetProperty("statusCode", out var scEl) ? scEl.GetInt32() : 0;
            var message = responseRoot.TryGetProperty("message", out var msgEl) ? msgEl.GetString() : string.Empty;

            StatusMessage.Set(context, $"{statusCode}:{message}");
            IsSuccess.Set(context, statusCode == 200 && isUpstreamSuccess);
        }
        catch (Exception ex)
        {
            StatusMessage.Set(context, $"Error: {ex.GetBaseException().Message}");
            IsSuccess.Set(context, false);
        }
    }

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

    private static object? ParsePayload(string? payloadString)
    {
        if (string.IsNullOrWhiteSpace(payloadString))
            return new Dictionary<string, object?>();

        try
        {
            using var doc = JsonDocument.Parse(payloadString);
            return doc.RootElement.Clone();
        }
        catch
        {
            return null;
        }
    }
}
