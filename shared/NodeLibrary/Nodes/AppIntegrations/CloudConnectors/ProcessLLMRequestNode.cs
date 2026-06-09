using System.IO;

namespace NodeLibrary.AppIntegrations.CloudConnectors;

// This node is not visible in the node selector
public class ProcessLLMRequestNode : BaseNode
{
    private static readonly HttpClient _httpClient = new();

    [DisplayName("Model Configuration")]
    public required InArgument<JsonElement> ModelConfig { get; set; }

    [DisplayName("Prompt")]
    public required InArgument<string> Prompt { get; set; }

    [DisplayName("Files List")]
    public InArgument<List<string>> Files { get; set; } = new InArgument<List<string>>();

    public InArgument<JsonElement> KbConfig { get; set; } = new InArgument<JsonElement>();

    public InArgument<JsonElement> MemoryConfig { get; set; } = new InArgument<JsonElement>();

    public InArgument<JsonElement> ToolsConfig { get; set; } = new InArgument<JsonElement>();

    [DisplayName("Result")]
    public OutArgument<JsonElement> Result { get; set; } = new OutArgument<JsonElement>();

    [DisplayName("Thread Messages")]
    public InArgument<string> ThreadMessages { get; set; } = new InArgument<string>();

    [DisplayName("User Input")]
    public InArgument<string> UserInput { get; set; } = new InArgument<string>();

    protected override async Task ExecuteAsync(INodeContext context)
    {
        try
        {
            var modelConfig = ModelConfig.Get(context);
            var prompt = Prompt.Get(context);
            var filesList = Files.Get(context);
            var kbConfig = KbConfig.Get(context);
            var flowMetadata = FlowMetadata.Get(context) ?? throw new InvalidOperationException("Agent metadata is required");
            var callerContext = CallerContext.Get(context) ?? throw new InvalidOperationException("Caller context is required");
            var threadMessages = ThreadMessages.Get(context);
            var userInput = UserInput.Get(context);

            var formattedFilesList = FormatFilesList(filesList);

            if (filesList != null && formattedFilesList?.Count != filesList.Count)
                throw new FileNotFoundException("One or more files in the provided Files List were not found.");

            var baseUrl = AppConfigHelper.ResolveAppBaseUrl();
            var apiUrl = $"https://{baseUrl}/llmpipeline/api/llm/generate";
            var kbNames = GetStringArrayProperty(kbConfig, "knowledgeBase");
            var hasKbNames = kbNames is { Count: > 0 };
            var topK = hasKbNames ? (GetIntProperty(kbConfig, "numberOfChunks") ?? 5) : (int?)null;

            // Determine the input format: chat mode (list of messages) or prompt mode (string)
            object inputPayload = BuildInputPayload(prompt, threadMessages, userInput);

            var requestObj = new
            {
                provider = GetStringProperty(modelConfig, "provider"),
                model = GetStringProperty(modelConfig, "model"),
                input = inputPayload,
                files = formattedFilesList,
                is_json_output = GetBoolProperty(modelConfig, "is_json_output") ?? false,
                json_schema = GetStringProperty(modelConfig, "json_schema"),
                max_output_tokens = GetLongProperty(modelConfig, "max_output_tokens") ?? 0L,
                is_byok_enabled = GetBoolProperty(modelConfig, "is_byok_enabled") ?? false,
                credential_id = GetStringProperty(modelConfig, "credential_id") ?? Guid.Empty.ToString(),
                temperature = GetDoubleProperty(modelConfig, "temperature") ?? 1.0,
                top_p = GetDoubleProperty(modelConfig, "top_p") ?? 1.0,
                stream = false,
                ref_type = "Agent",
                ref_id = flowMetadata.Id,
                ref_name = flowMetadata.Name,
                action = "AgentExecution",
                agent_name = flowMetadata.Name,
                kb_names = hasKbNames ? kbNames : null,
                top_k = topK,
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
            Result.Set(context, responseDoc.RootElement.Clone());
            StatusMessage.Set(context, "Request processed successfully.");
            IsSuccess.Set(context, true);
        }
        catch (Exception ex)
        {
            StatusMessage.Set(context, $"Error: {ex.GetBaseException().Message}");
            IsSuccess.Set(context, false);
        }
    }

    private static string? GetStringProperty(JsonElement element, string propertyName)
    {
        if (element.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
            return null;
        return element.TryGetProperty(propertyName, out var prop) ? prop.GetString() : null;
    }

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

    private static long? GetLongProperty(JsonElement element, string propertyName)
    {
        if (element.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
            return null;

        if (!element.TryGetProperty(propertyName, out var prop))
            return null;

        return prop.ValueKind switch
        {
            JsonValueKind.Number when prop.TryGetInt64(out var val) => val,
            JsonValueKind.String when long.TryParse(prop.GetString(), out var val) => val,
            JsonValueKind.Null or JsonValueKind.Undefined => null,
            _ => null,
        };
    }

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

    private static int? GetIntProperty(JsonElement element, string propertyName)
    {
        if (element.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
            return null;

        if (!element.TryGetProperty(propertyName, out var prop))
            return null;

        return prop.ValueKind switch
        {
            JsonValueKind.Number when prop.TryGetInt32(out var val) => val,
            JsonValueKind.String when int.TryParse(prop.GetString(), out var val) => val,
            JsonValueKind.Null or JsonValueKind.Undefined => null,
            _ => null,
        };
    }

    private static List<string>? GetStringArrayProperty(JsonElement element, string propertyName)
    {
        if (element.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
            return null;

        if (!element.TryGetProperty(propertyName, out var prop))
            return null;

        if (prop.ValueKind == JsonValueKind.Array)
        {
            var values = prop.EnumerateArray()
                .Where(item => item.ValueKind == JsonValueKind.String)
                .Select(item => item.GetString()?.Trim())
                .Where(item => !string.IsNullOrWhiteSpace(item))
                .Cast<string>()
                .ToList();

            return values.Count > 0 ? values : null;
        }

        if (prop.ValueKind == JsonValueKind.String)
        {
            var rawValue = prop.GetString();
            if (string.IsNullOrWhiteSpace(rawValue))
                return null;

            var values = rawValue
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(item => item.Trim())
                .Where(item => !string.IsNullOrWhiteSpace(item))
                .ToList();

            return values.Count > 0 ? values : null;
        }

        return null;
    }

    // Normalizes a list of file references into a string-only format.
    private List<string> FormatFilesList(List<string>? filesList)
    {
        var result = new List<string>();

        // Return null when no file references are provided.
        if (filesList == null || filesList.Count == 0)
            return result;

        foreach (var file in filesList)
        {
            // Ignore empty or whitespace-only entries.
            if (string.IsNullOrWhiteSpace(file))
                continue;

            var value = file.Trim();

            // Preserve supported file reference formats:
            // - Remote URLs (http/https)
            // - Data URIs (base64-encoded content)
            // - Local file URIs (file://)
            if (value.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                value.StartsWith("https://", StringComparison.OrdinalIgnoreCase) ||
                value.StartsWith("data:", StringComparison.OrdinalIgnoreCase) ||
                value.StartsWith("file://", StringComparison.OrdinalIgnoreCase))
            {
                result.Add(value);
                continue;
            }

            // Preserve any other value and allow downstream validation
            // or processing to determine whether it is a valid file reference.
            result.Add(value);
        }

        return result;
    }

    /// <summary>
    /// Builds the input payload for the LLM request.
    /// Chat mode: when ThreadMessages is provided, builds a list of {role, content} messages with the current UserInput appended.
    /// Prompt mode: when only Prompt is provided, returns the prompt string directly.
    /// </summary>
    private static object BuildInputPayload(string? prompt, string? threadMessages, string? userInput)
    {
        // Chat mode: ThreadMessages is a JSON array of {role, content} objects
        if (!string.IsNullOrWhiteSpace(threadMessages))
        {
            var messages = new List<object>();

            try
            {
                using var doc = JsonDocument.Parse(threadMessages);
                if (doc.RootElement.ValueKind == JsonValueKind.Array)
                {
                    foreach (var element in doc.RootElement.EnumerateArray())
                    {
                        var role = element.TryGetProperty("role", out var roleProp) ? roleProp.GetString() : null;
                        var content = element.TryGetProperty("content", out var contentProp) ? contentProp.GetString() : null;

                        if (!string.IsNullOrWhiteSpace(role) && !string.IsNullOrWhiteSpace(content))
                        {
                            messages.Add(new { role, content });
                        }
                    }
                }
            }
            catch
            {
                // If parsing fails, fall through to prompt mode
            }

            // If we have a valid prompt, add it as a system message at the beginning
            if (!string.IsNullOrWhiteSpace(prompt))
            {
                messages.Insert(0, new { role = "system", content = prompt });
            }

            // Append the current user input as the latest user message
            if (!string.IsNullOrWhiteSpace(userInput))
            {
                messages.Add(new { role = "user", content = userInput });
            }

            if (messages.Count > 0)
            {
                return messages;
            }
        }

        // Prompt mode: return the prompt string directly
        return prompt ?? string.Empty;
    }
}