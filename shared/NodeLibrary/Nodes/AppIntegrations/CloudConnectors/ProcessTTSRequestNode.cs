using System.IO;

namespace NodeLibrary.AppIntegrations.CloudConnectors;

// Internal workflow node responsible for processing Text-to-Speech (TTS) synthesis requests. This node is intentionally hidden from the node selector.
public class ProcessTTSRequestNode : BaseNode
{
    // Reuse a single HttpClient instance to efficiently send HTTP requests.
    private static readonly HttpClient _httpClient = new();

    [DisplayName("Model Configuration")]
    public required InArgument<JsonElement> ModelConfig { get; set; }

    [DisplayName("Voice Configuration")]
    public required InArgument<JsonElement> VoiceConfig { get; set; }

    [DisplayName("Input Text")]
    public InArgument<string> InputText { get; set; } = new InArgument<string>();

    [DisplayName("Result")]
    public OutArgument<JsonElement> Result { get; set; } = new OutArgument<JsonElement>();

    [DisplayName("Thread Messages")]
    public InArgument<string> ThreadMessages { get; set; } = new InArgument<string>();

    protected override async Task ExecuteAsync(INodeContext context)
    {
        try
        {
            // Resolve the application base URL and construct the TTS API endpoint.
            var baseUrl = AppConfigHelper.ResolveAppBaseUrl();
            var apiUrl = $"https://{baseUrl}/llmpipeline/api/tts/synthesize";

            // Retrieve the workflow inputs required to process the request.
            var modelConfig = ModelConfig.Get(context);
            var inputText = InputText.Get(context);
            var voiceConfig = VoiceConfig.Get(context);

            var flowMetadata = FlowMetadata.Get(context) ?? throw new InvalidOperationException("Agent metadata is required");
            var callerContext = CallerContext.Get(context) ?? throw new InvalidOperationException("Caller context is required");
            var threadMessages = ThreadMessages.Get(context);

            // Construct the request payload expected by the TTS service.
            var requestObj = new
            {
                provider = GetStringProperty(modelConfig, "provider"),
                model = GetStringProperty(modelConfig, "model"),
                input = inputText,
                is_byok_enabled = GetBoolProperty(modelConfig, "is_byok_enabled") ?? false,
                credential_id = GetStringProperty(modelConfig, "credential_id") ?? Guid.Empty.ToString(),
                stream = false,

                // Voice synthesis settings.
                voice_id = GetStringProperty(voiceConfig, "voice") ?? "",
                language = GetStringProperty(voiceConfig, "language") ?? "",
                speed = GetDoubleProperty(voiceConfig, "speed") ?? 1.0,
                pitch = GetDoubleProperty(voiceConfig, "pitch") ?? 1.0,

                // Metadata used for request tracking and auditing.
                ref_type = "Agent",
                ref_id = flowMetadata.Id,
                ref_name = flowMetadata.Name,
                action = "AgentExecution",
                agent_name = flowMetadata.Name
            };

            var requestJson = JsonSerializer.Serialize(requestObj);

            using var request = new HttpRequestMessage(HttpMethod.Post, apiUrl);

            // Configure the request headers.
            request.Headers.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json"));

            request.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", callerContext.AccessToken);

            // Attach the serialized JSON payload.
            request.Content = new StringContent(
                requestJson,
                Encoding.UTF8,
                "application/json");

            // Submit the synthesis request to the backend service.
            var response = await _httpClient.SendAsync(request);

            // Throw an exception if the service returns an unsuccessful response.
            response.EnsureSuccessStatusCode();

            // Read and parse the service response.
            var responseContent = await response.Content.ReadAsStringAsync();

            using var responseDoc = JsonDocument.Parse(responseContent);

            // Store the synthesized result in the workflow output.
            Result.Set(context, responseDoc.RootElement.Clone());

            StatusMessage.Set(context, "Request processed successfully.");
            IsSuccess.Set(context, true);
        }
        catch (Exception ex)
        {
            // Expose the root cause of the failure to the workflow.
            StatusMessage.Set(context, $"Error: {ex.GetBaseException().Message}");
            IsSuccess.Set(context, false);
        }
    }

    /// <summary>
    /// Retrieves a string property from a <see cref="JsonElement"/>.
    /// Returns null if the property is missing or the element is null.
    /// </summary>
    private static string? GetStringProperty(JsonElement element, string propertyName)
    {
        if (element.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
            return null;

        return element.TryGetProperty(propertyName, out var prop)
            ? prop.GetString()
            : null;
    }

    /// <summary>
    /// Retrieves a boolean property from a <see cref="JsonElement"/>.
    /// Returns null if the property is missing or is not a boolean.
    /// </summary>
    private static bool? GetBoolProperty(JsonElement element, string propertyName)
    {
        if (element.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
            return null;

        if (!element.TryGetProperty(propertyName, out var prop))
            return null;

        return prop.ValueKind switch
        {
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            _ => null
        };
    }

    /// <summary>
    /// Retrieves a numeric property from a <see cref="JsonElement"/>.
    /// Supports both JSON numbers and numeric strings.
    /// Returns null if the property is missing or cannot be parsed.
    /// </summary>
    private static double? GetDoubleProperty(JsonElement element, string propertyName)
    {
        if (element.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
            return null;

        if (!element.TryGetProperty(propertyName, out var prop))
            return null;

        return prop.ValueKind switch
        {
            JsonValueKind.Number when prop.TryGetDouble(out var val) => val,
            JsonValueKind.String when double.TryParse(prop.GetString(), out var val) => val,
            JsonValueKind.Null or JsonValueKind.Undefined => null,
            _ => null,
        };
    }
}