using System.IO;

namespace NodeLibrary.CloudConnectorNodes;

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

    [DisplayName("Knowledge Base Configuration")]
    public InArgument<JsonElement> KbConfig { get; set; } = new InArgument<JsonElement>();

    [DisplayName("Skills Configuration")]
    public InArgument<JsonElement> SkillsConfig { get; set; } = new InArgument<JsonElement>();

    [DisplayName("Output JSON Schema")]
    public InArgument<JsonElement> JsonSchema { get; set; } = new InArgument<JsonElement>();

    [DisplayName("Memory Configuration")]
    public InArgument<JsonElement> MemoryConfig { get; set; } = new InArgument<JsonElement>();

    [DisplayName("Tools Configuration")]
    public InArgument<JsonElement> ToolsConfig { get; set; } = new InArgument<JsonElement>();

    [DisplayName("Default Actions Configuration")]
    public InArgument<JsonElement> RecommendedActionsConfig { get; set; } = new InArgument<JsonElement>();

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
            var inputPrompt = Prompt.Get(context);
            var filesList = Files.Get(context);
            var kbConfig = KbConfig.Get(context);
            var skillsConfig = SkillsConfig.Get(context);
            var jsonSchema = JsonSchema.Get(context);
            var memoryConfig = MemoryConfig.Get(context);
            var toolsConfig = ToolsConfig.Get(context);
            var recommendedActionsConfig = RecommendedActionsConfig.Get(context);
            var flowMetadata = FlowMetadata.Get(context) ?? throw new InvalidOperationException("Agent metadata is required");
            var callerContext = CallerContext.Get(context) ?? throw new InvalidOperationException("Caller context is required");
            var threadMessages = ThreadMessages.Get(context);
            var userInput = UserInput.Get(context);

            var formattedFilesList = FormatFilesList(filesList ?? new List<string>());

            if (filesList != null && formattedFilesList?.Count != filesList.Count)
                throw new FileNotFoundException("One or more files in the provided Files List were not found.");

            var kbNames = GetStringArrayProperty(kbConfig, "knowledgeBase");
            var hasKbNames = kbNames is { Count: > 0 };
            var topK = hasKbNames ? (GetIntProperty(kbConfig, "numberOfChunks") ?? 5) : (int?)null;

            var skillNames = GetStringArrayProperty(skillsConfig, "skills");
            var hasSkillNames = skillNames is { Count: > 0 };

            // Get agent configuration values for dynamic actions and follow-up message generation.
            var enableDynamicActions = GetBoolProperty(recommendedActionsConfig, "enableDynamicActions");
            var followUpMessagePrompt = GetStringProperty(recommendedActionsConfig, "followUpMessagePrompt");

            // Build the LLM pipeline API endpoint using the application base URL from the caller context.
            var baseUrl = callerContext.AppBaseUrl ?? throw new InvalidOperationException("App base URL is required");
            var apiUrl = $"{baseUrl}/llmpipeline/api/v2/llm/generate";

            // Create the LLM input payload using conversation history when available,
            // otherwise using the standalone prompt with optional follow-up instructions.
            object inputPayload = BuildInputPayload(inputPrompt, threadMessages, userInput, followUpMessagePrompt);

            var resolvedJsonSchema = FormatJsonSchema(jsonSchema, modelConfig);

            var requestObj = new
            {
                provider = GetStringProperty(modelConfig, "provider"),
                model = GetStringProperty(modelConfig, "model"),
                input = inputPayload,
                files = formattedFilesList,
                is_json_output = GetBoolProperty(modelConfig, "is_json_output") ?? false,
                json_schema = resolvedJsonSchema,
                max_output_tokens = GetLongProperty(modelConfig, "max_output_tokens") ?? 0L,
                is_byok_enabled = GetBoolProperty(modelConfig, "is_byok_enabled") ?? false,
                // Canonical key is credential_name; legacy flows may still carry a credential_id (back-compat).
                credential_name = ReadCredentialProperty(modelConfig),
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
                skill_names = hasSkillNames ? skillNames : null,
                tool_config = toolsConfig.ValueKind == JsonValueKind.Object ? toolsConfig.Deserialize<Dictionary<string, object>>() : null,
                is_chat_agent = enableDynamicActions == null ? false : true,
                generate_followup_messages = enableDynamicActions ?? false,
            };

            var requestJson = JsonSerializer.Serialize(requestObj);

            using var request = new HttpRequestMessage(HttpMethod.Post, apiUrl);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", callerContext.AccessToken);
            NodeHttpHeaders.ApplyEnvHeader(request, callerContext);
            request.Content = new StringContent(requestJson, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();

            using var responseDoc = JsonDocument.Parse(responseContent);
            Result.Set(context, NormalizeJsonOutput(responseDoc.RootElement.Clone(), GetBoolProperty(modelConfig, "is_json_output") ?? false));
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

    /// <summary>
    /// Resolves the JSON schema to send to the LLM pipeline.
    ///
    /// The dedicated JsonSchema node input may arrive in one of these shapes:
    ///   1. A bare JSON schema string, e.g. {"type":"array","items":...}
    ///      (JsonElement.ValueKind == String) — the value is the schema text.
    ///   2. An object wrapping the schema under a "value" key (json-editor field).
    ///   3. An object wrapping the schema under a "json_schema" key.
    ///   4. The schema itself as a JSON object, e.g. {"type":"array","items":...}
    ///      (JsonElement.ValueKind == Object with a "type" property).
    ///   5. Legacy: a "json_schema" key embedded inside the ModelConfig object.
    ///
    /// The schema is returned as a string so it can be forwarded verbatim to the API.
    /// </summary>
    private static string? FormatJsonSchema(JsonElement jsonSchema, JsonElement modelConfig)
    {
        // Case 1: the JsonElement is itself the schema text (a JSON string).
        if (jsonSchema.ValueKind == JsonValueKind.String)
        {
            var direct = jsonSchema.GetString();
            if (!string.IsNullOrWhiteSpace(direct))
            {
                return direct;
            }
        }

        // Case 2: schema wrapped under a "value" key.
        var schemaFromValue = GetStringProperty(jsonSchema, "value");
        if (!string.IsNullOrWhiteSpace(schemaFromValue))
        {
            return schemaFromValue;
        }

        // Case 3: schema wrapped under a "json_schema" key.
        var raw = GetStringProperty(jsonSchema, "json_schema");
        if (!string.IsNullOrWhiteSpace(raw))
        {
            return raw;
        }

        // Case 4: the JsonElement is the schema object itself (has a "type" key).
        if (jsonSchema.ValueKind == JsonValueKind.Object &&
            jsonSchema.TryGetProperty("type", out var typeProp) &&
            typeProp.ValueKind == JsonValueKind.String &&
            !string.IsNullOrWhiteSpace(typeProp.GetString()))
        {
            return jsonSchema.GetRawText();
        }

        // Case 5 (legacy): a "json_schema" key embedded inside the ModelConfig.
        return GetStringProperty(modelConfig, "json_schema");
    }

    // Reads a credential reference from a config object. Accepts the canonical
    // "credential_name" key and the legacy "credential_id" key (Q12 back-compat).
    private static string? ReadCredentialProperty(JsonElement element)
    {
        var canonical = GetStringProperty(element, "credential_name");
        if (!string.IsNullOrWhiteSpace(canonical)) return canonical;
        return GetStringProperty(element, "credential_id");
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

    /// <summary>
    /// The LLM pipeline returns the model answer in the response's "output" property as a
    /// JSON-encoded string (double-encoded) whenever is_json_output is enabled. Downstream
    /// expression resolution (DynamicExpresso dot-notation, e.g. {{result.output.supplier_name}})
    /// treats that member as a plain string, so property access fails. This method parses the
    /// "output" string back into a structured JSON object (or array) and replaces it in place,
    /// keeping the rest of the response shape (provider, model, status, usage, ...) untouched.
    /// When the output is not JSON-shaped, or is_json_output is disabled, the response is returned
    /// unchanged.
    /// </summary>
    private static JsonElement NormalizeJsonOutput(JsonElement root, bool isJsonOutput)
    {
        if (!isJsonOutput || root.ValueKind != JsonValueKind.Object)
        {
            return root;
        }

        if (!root.TryGetProperty("output", out var outputProp) ||
            outputProp.ValueKind != JsonValueKind.String)
        {
            return root;
        }

        var rawOutput = outputProp.GetString();
        if (string.IsNullOrWhiteSpace(rawOutput))
        {
            return root;
        }

        JsonElement parsed;
        try
        {
            using var parsedDoc = JsonDocument.Parse(rawOutput);
            parsed = parsedDoc.RootElement.Clone();
        }
        catch (JsonException)
        {
            // The output string is not valid JSON (e.g. plain text) — leave the response unchanged.
            return root;
        }

        var outputDictionary = root.EnumerateObject()
            .ToDictionary(p => p.Name, p => p.Value.Clone(), StringComparer.OrdinalIgnoreCase);
        outputDictionary["output"] = parsed;
        return JsonDocument.Parse(JsonSerializer.Serialize(outputDictionary)).RootElement.Clone();
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

    /// <summary>
    /// Builds the input payload for the LLM request.
    /// Chat mode: when ThreadMessages is provided, builds a list of {role, content} messages with the current UserInput appended.
    /// Prompt mode: when only Prompt is provided, returns the prompt string directly.
    /// </summary>

    /// <summary>
    /// Builds the input payload for the LLM request.
    /// When conversation history is available, creates a chat-style message list containing follow-up instructions, agent instructions, previous messages, and the current user input.
    /// When no conversation history is provided, returns the input prompt directly as a string.
    /// </summary>
    private static object BuildInputPayload(string? inputPrompt, string? threadMessages, string? userInput, string? followUpMessagePrompt)
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
                            messages.Add(new
                            {
                                role,
                                content
                            });
                        }
                    }
                }
            }
            catch
            {
                // If parsing fails, fall through to prompt mode
            }

            // If we have a valid prompt, add it as a system message at the beginning
            if (!string.IsNullOrWhiteSpace(inputPrompt))
            {
                messages.Insert(0, new { role = "system", content = inputPrompt });
            }

            // If we have a valid default prompt, add it as a system message at the beginning
            if (!string.IsNullOrWhiteSpace(followUpMessagePrompt))
            {
                messages.Insert(string.IsNullOrWhiteSpace(inputPrompt) ? 0 : 1, new { role = "system", content = followUpMessagePrompt });
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
        return inputPrompt ?? string.Empty;
    }

    /// <summary>
    /// Formats a list of file references into a normalized list of strings.
    /// Supported inputs:
    /// - Data URLs (returned as-is)
    /// - HTTP/HTTPS URLs (returned as-is)
    /// - Raw Base64 strings (converted to Data URLs)
    /// - Local file paths (read and converted to Data URLs)
    /// </summary>
    private List<string> FormatFilesList(List<string> filesList)
    {
        var result = new List<string>();

        // Return null when no file references are provided.
        if (filesList == null || filesList.Count == 0)
            return result;

        // If file is remote file with http/https or data URI, return as is
        if (filesList.All(f => f.StartsWith("http://") || f.StartsWith("https://") || f.StartsWith("data:")))
            return filesList;

        foreach (var file in filesList)
        {
            // Ignore empty or whitespace-only entries.
            if (string.IsNullOrWhiteSpace(file))
                continue;

            // Sanitize the file path
            var sanitizedPath = file.Trim();

            // If remote file with http/https or data URI, add as is
            if (sanitizedPath.StartsWith("http://") || sanitizedPath.StartsWith("https://") || sanitizedPath.StartsWith("data:"))
            {
                result.Add(sanitizedPath);
                continue;
            }

            // Otherwise, treat as file path - validate file existence
            sanitizedPath = file.Trim('[').Trim(']').Trim('"').Trim();
            if (!File.Exists(sanitizedPath))
                continue;

            // Read file and convert to data URI format
            var fileBytes = File.ReadAllBytes(sanitizedPath);
            var fileBase64 = Convert.ToBase64String(fileBytes);
            var dataUri = $"data:{GetMimeType(Path.GetExtension(sanitizedPath))};base64,{fileBase64}";
            result.Add(dataUri);
        }

        return result;
    }

    private static string GetMimeType(string fileExtension)
    {
        switch (fileExtension.ToLower())
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
            case ".tiff":
            case ".tif": return "image/tiff";
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
            default: return "application/octet-stream";
        }
    }
}