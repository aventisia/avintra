using System.IO;

namespace NodeLibrary.CloudConnectorNodes;

// This node is not visible in the node selector
public class ProcessConnectorRequestNode : BaseNode
{
    private static readonly HttpClient _httpClient = new();

    [DisplayName("Connector Provider")]
    public required InArgument<string> Provider { get; set; }

    [DisplayName("Connector Unique Name")]
    public required InArgument<string> Action { get; set; }

    [DisplayName("Credential Name")]
    public required InArgument<string> CredentialName { get; set; }

    [DisplayName("Connector Request Payload")]
    public required InArgument<string> Payload { get; set; }

    [DisplayName("Result")]
    public OutArgument<JsonElement> Result { get; set; } = new OutArgument<JsonElement>();

    protected override async Task ExecuteAsync(INodeContext context)
    {
        try
        {
            // IMPORTANT NOTE: the executor leaves an InArgument property null when the flow saved no
            // value for it, so the property itself must be null-checked before reading its value.
            var provider = Provider?.Get(context);
            var action = Action?.Get(context);
            var credentialName = CredentialName?.Get(context);

            if (string.IsNullOrWhiteSpace(provider) || string.IsNullOrWhiteSpace(action))
            {
                StatusMessage.Set(context, "Error: No connector provider or action is selected for this connector step.");
                IsSuccess.Set(context, false);
                return;
            }

            if (string.IsNullOrWhiteSpace(credentialName))
            {
                StatusMessage.Set(context, "Error: No credential is selected for this connector step.");
                IsSuccess.Set(context, false);
                return;
            }

            var payload = Payload.Get(context);
            var flowMetadata = FlowMetadata.Get(context) ?? throw new InvalidOperationException("Agent metadata is required");
            var callerContext = CallerContext.Get(context) ?? throw new InvalidOperationException("Caller context is required");

            var baseUrl = callerContext.AppBaseUrl ?? throw new InvalidOperationException("App base URL is required");
            // IMPORTANT NOTE: AppBaseUrl is configured as a bare host, so it must be made absolute here.
            var apiUrl = BuildApiUrl(baseUrl, provider);

            var requestObj = new
            {
                agentId = flowMetadata.Id,
                agentName = flowMetadata.Name,
                provider,
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

            // IMPORTANT NOTE: the adapter returns the failure reason as a plain-text body, which
            // EnsureSuccessStatusCode discarded, so the read must happen before the status check.
            if (!response.IsSuccessStatusCode)
            {
                StatusMessage.Set(context, ConnectorNodeErrors.BuildErrorStatus(response.StatusCode, responseContent));
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
            StatusMessage.Set(context, $"Error: {NodeLogHelper.ScrubSecretPatterns(ex.GetBaseException().Message)}");
            IsSuccess.Set(context, false);
        }
    }

    private static string BuildApiUrl(string baseUrl, string? provider)
    {
        var normalizedBaseUrl = baseUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                                baseUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase)
            ? baseUrl.TrimEnd('/')
            : $"https://{baseUrl.TrimEnd('/')}";
        return $"{normalizedBaseUrl}/workspace/api/cloud-connector/{provider?.ToLowerInvariant()}/invoke";
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