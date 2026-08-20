using System.IO;

namespace NodeLibrary.CloudConnectorNodes;

// Internal workflow node responsible for processing Speech-to-Text (STT) transcription requests. This node is intentionally hidden from the node selector.
public class ProcessSTTRequestNode : BaseNode
{
    // Reuse a single HttpClient instance for all requests to avoid socket exhaustion.
    private static readonly HttpClient _httpClient = new();

    [DisplayName("Model Configuration")]
    public required InArgument<JsonElement> ModelConfig { get; set; }

    [DisplayName("File")]
    public InArgument<string> Files { get; set; } = new InArgument<string>();

    [DisplayName("Result")]
    public OutArgument<JsonElement> Result { get; set; } = new OutArgument<JsonElement>();

    [DisplayName("Thread Messages")]
    public InArgument<string> ThreadMessages { get; set; } = new InArgument<string>();

    protected override async Task ExecuteAsync(INodeContext context)
    {
        try
        {
            // Retrieve all required inputs from the workflow execution context.
            var modelConfig = ModelConfig.Get(context);
            var files = Files.Get(context);
            var flowMetadata = FlowMetadata.Get(context) ?? throw new InvalidOperationException("Agent metadata is required");
            var callerContext = CallerContext.Get(context) ?? throw new InvalidOperationException("Caller context is required");

            // Resolve the application base URL from the caller context and construct the STT API endpoint.
            var baseUrl = callerContext.AppBaseUrl ?? throw new InvalidOperationException("App base URL is required");
            var apiUrl = $"{baseUrl}/llmpipeline/api/stt/transcribe";

            var threadMessages = ThreadMessages.Get(context);

            // Normalize the file reference into a format accepted by the STT service.
            var formattedFile = FormatFile(files!);

            // Ensure a valid file reference is available before sending the request.
            if (string.IsNullOrEmpty(formattedFile))
            {
                throw new ArgumentException(
                    "Files input is invalid or empty. Please provide a valid file reference.");
            }

            // Construct the request payload expected by the transcription service.
            var requestObj = new
            {
                provider = GetStringProperty(modelConfig, "provider"),
                model = GetStringProperty(modelConfig, "model"),
                input = formattedFile,
                is_byok_enabled = GetBoolProperty(modelConfig, "is_byok_enabled") ?? false,
                credential_name = GetStringProperty(modelConfig, "credential_name") ?? GetStringProperty(modelConfig, "credential_id") ?? Guid.Empty.ToString(),
                language = GetStringProperty(modelConfig, "language") ?? "en",
                stream = false,

                // Metadata used for tracking and auditing.
                ref_type = "Agent",
                ref_id = flowMetadata.Id,
                ref_name = flowMetadata.Name,
                action = "AgentExecution",
                agent_name = flowMetadata.Name,
            };

            var requestJson = JsonSerializer.Serialize(requestObj);

            using var request = new HttpRequestMessage(HttpMethod.Post, apiUrl);

            // Configure request headers.
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", callerContext.AccessToken);

            // Forward the execution environment so backend resources resolve in the same env.
            NodeHttpHeaders.ApplyEnvHeader(request, callerContext);

            // Attach the serialized JSON payload.
            request.Content = new StringContent(requestJson, Encoding.UTF8, "application/json");

            // Send the request to the STT service.
            var response = await _httpClient.SendAsync(request);

            // Throw an exception if the service returned a non-success status.
            response.EnsureSuccessStatusCode();

            // Read and parse the response.
            var responseContent = await response.Content.ReadAsStringAsync();
            using var responseDoc = JsonDocument.Parse(responseContent);

            // Store the transcription result in the workflow output.
            Result.Set(context, responseDoc.RootElement.Clone());

            StatusMessage.Set(context, "Request processed successfully.");
            IsSuccess.Set(context, true);
        }
        catch (Exception ex)
        {
            // Capture the root exception message and expose it to the workflow.
            StatusMessage.Set(context, $"Error: {ex.GetBaseException().Message}");
            IsSuccess.Set(context, false);
        }
    }

    // Retrieves a string property from a JsonElement.
    // Returns null if the property does not exist or the element is null.
    private static string? GetStringProperty(JsonElement element, string propertyName)
    {
        if (element.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
            return null;

        return element.TryGetProperty(propertyName, out var prop)
            ? prop.GetString()
            : null;
    }

    // Retrieves a boolean property from a JsonElement.
    // Returns null if the property is missing or not a boolean value.
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
    /// Converts a file reference into a format accepted by the Speech-to-Text service.
    ///
    /// Supported input formats:
    /// - Data URLs (returned unchanged)
    /// - HTTP/HTTPS URLs (returned unchanged)
    /// - Raw Base64 strings (wrapped in a Data URL)
    /// - Local file paths (read and converted to Base64 Data URLs)
    /// </summary>
    private string FormatFile(string fileReference)
    {
        // Ignore null, empty, or whitespace-only inputs.
        if (string.IsNullOrWhiteSpace(fileReference))
            return string.Empty;

        // Remove surrounding brackets and quotation marks that may
        // be introduced by workflow serialization.
        var value = fileReference.Trim().Trim('[', ']', '"');

        // Already a valid Data URL.
        if (value.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
            return value;

        // HTTP/HTTPS URLs can be forwarded directly to the backend.
        if (Uri.TryCreate(value, UriKind.Absolute, out var uri) &&
            (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
        {
            return value;
        }

        // Wrap raw Base64 content in a generic Data URL.
        if (IsBase64String(value))
            return $"data:application/octet-stream;base64,{value}";

        // Return an empty string if the local file does not exist.
        if (!File.Exists(value))
            return string.Empty;

        // Read the local file and encode it as a Base64 Data URL.
        var mimeType = GetMimeType(Path.GetExtension(value));
        var bytes = File.ReadAllBytes(value);

        return $"data:{mimeType};base64,{Convert.ToBase64String(bytes)}";
    }

    // Determines whether the supplied string is valid Base64.
    private static bool IsBase64String(string str)
    {
        if (string.IsNullOrWhiteSpace(str))
            return false;

        str = str.Trim();

        // Base64 strings must have a length that is a multiple of four.
        if (str.Length % 4 != 0)
            return false;

        try
        {
            Convert.FromBase64String(str);
            return true;
        }
        catch
        {
            return false;
        }
    }

    // Maps file extensions to their corresponding MIME types.
    // Returns "application/octet-stream" for unknown extensions.
    private static string GetMimeType(string fileExtension)
    {
        switch (fileExtension.ToLowerInvariant())
        {
            case ".txt": return "text/plain";
            case ".pdf": return "application/pdf";
            case ".doc": return "application/msword";
            case ".docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case ".xls": return "application/vnd.ms-excel";
            case ".xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case ".ppt": return "application/vnd.ms-powerpoint";
            case ".pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";

            case ".png": return "image/png";
            case ".jpg":
            case ".jpeg": return "image/jpeg";
            case ".gif": return "image/gif";
            case ".bmp": return "image/bmp";
            case ".tif":
            case ".tiff": return "image/tiff";

            case ".mp4": return "video/mp4";
            case ".webm": return "video/webm";

            case ".mp3": return "audio/mpeg";
            case ".wav": return "audio/wav";
            case ".ogg": return "audio/ogg";

            case ".zip": return "application/zip";
            case ".rar": return "application/x-rar-compressed";

            case ".csv": return "text/csv";
            case ".json": return "application/json";
            case ".xml": return "application/xml";

            default:
                return "application/octet-stream";
        }
    }
}