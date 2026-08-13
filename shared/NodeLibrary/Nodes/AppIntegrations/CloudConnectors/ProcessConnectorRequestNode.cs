using System.IO;

namespace NodeLibrary.AppIntegrations.CloudConnectors;

// This node is not visible in the node selector
public class ProcessConnectorRequestNode : BaseNode
{
    private static readonly HttpClient _httpClient = new();

    [DisplayName("Connector Provider")]
    public required InArgument<string> Provider { get; set; }

    [DisplayName("Connector Unique Name")]
    public required InArgument<string> Action { get; set; }

    [DisplayName("Credential Id")]
    public required InArgument<string> CredentialId { get; set; }

    [DisplayName("Connector Request Payload")]
    public required InArgument<string> Payload { get; set; }

    [DisplayName("Result")]
    public OutArgument<JsonElement> Result { get; set; } = new OutArgument<JsonElement>();

    protected override async Task ExecuteAsync(INodeContext context)
    {
        try
        {
            var provider = Provider.Get(context);
            var action = Action.Get(context);
            var credentialId = CredentialId.Get(context);
            var payload = Payload.Get(context);
            var flowMetadata = FlowMetadata.Get(context) ?? throw new InvalidOperationException("Agent metadata is required");
            var callerContext = CallerContext.Get(context) ?? throw new InvalidOperationException("Caller context is required");

            var baseUrl = callerContext.AppBaseUrl ?? throw new InvalidOperationException("App base URL is required");
            var apiUrl = $"{baseUrl}/workspace/api/cloud-connector/{provider?.ToLower()}/invoke";

            var requestObj = new
            {
                agentId = flowMetadata.Id,
                agentName = flowMetadata.Name,
                provider,
                action,
                credentialId,
                payload = ParsePayload(payload) // Parse the payload string into camelCase JSON only if it's a valid JSON, otherwise send as string
            };

            var requestJson = JsonSerializer.Serialize(requestObj);

            using var request = new HttpRequestMessage(HttpMethod.Post, apiUrl);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", callerContext.AccessToken);
            request.Content = new StringContent(requestJson, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();

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