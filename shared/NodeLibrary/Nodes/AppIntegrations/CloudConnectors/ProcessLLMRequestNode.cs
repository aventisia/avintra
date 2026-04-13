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

    protected override async Task ExecuteAsync(INodeContext context)
    {
        try
        {
            var modelConfig = ModelConfig.Get(context);
            var prompt = Prompt.Get(context);
            var filesList = Files.Get(context);
            var kbConfig = KbConfig.Get(context);
            var accessToken = AccessToken.Get(context);
            var agentId = AgentId.Get(context);
            var agentName = AgentName.Get(context);

            var formattedFilesList = FormatFilesList(filesList);

            if (filesList != null && formattedFilesList?.Count != filesList.Count)
                throw new FileNotFoundException("One or more files in the provided Files List were not found.");

            var baseUrl = Environment.GetEnvironmentVariable("APP_BASE_URL");
            var apiUrl = $"https://{baseUrl}/llmpipeline/api/llm/generate";
            var kbNames = GetStringArrayProperty(kbConfig, "knowledgeBase");
            var hasKbNames = kbNames is { Count: > 0 };
            var topK = hasKbNames ? (GetIntProperty(kbConfig, "numberOfChunks") ?? 5) : (int?)null;

            var requestObj = new
            {
                provider = GetStringProperty(modelConfig, "provider"),
                model = GetStringProperty(modelConfig, "model"),
                input = prompt ?? string.Empty,
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
                ref_id = agentId,
                ref_name = agentName,
                action = "AgentExecution",
                agent_name = agentName,
                kb_names = hasKbNames ? kbNames : null,
                top_k = topK,
            };

            var requestJson = JsonSerializer.Serialize(requestObj);

            using var request = new HttpRequestMessage(HttpMethod.Post, apiUrl);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
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

    private static List<object>? FormatFilesList(List<string>? filesList)
    {
        if (filesList == null || filesList.Count == 0)
            return null;

        if (filesList.All(f => f.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
                            || f.StartsWith("https://", StringComparison.OrdinalIgnoreCase)))
            return filesList.Cast<object>().ToList();

        var result = new List<object>();
        foreach (var filePathOrBase64 in filesList)
        {
            if (IsBase64String(filePathOrBase64))
            {
                result.Add(filePathOrBase64);
                continue;
            }

            var sanitizedPath = filePathOrBase64.Trim('[').Trim(']').Trim('"').Trim();
            if (!File.Exists(sanitizedPath))
                continue;

            var fileBytes = File.ReadAllBytes(sanitizedPath);
            result.Add(new
            {
                mime_type = GetMimeType(Path.GetExtension(sanitizedPath)),
                encoded_content = Convert.ToBase64String(fileBytes)
            });
        }
        return result;
    }

    private static bool IsBase64String(string str)
    {
        if (string.IsNullOrWhiteSpace(str))
            return false;

        str = str.Trim();

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

    private static string GetMimeType(string fileExtension) => fileExtension.ToLowerInvariant() switch
    {
        ".txt" => "text/plain",
        ".pdf" => "application/pdf",
        ".doc" => "application/msword",
        ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xls" => "application/vnd.ms-excel",
        ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".ppt" => "application/vnd.ms-powerpoint",
        ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".png" => "image/png",
        ".jpg" or ".jpeg" => "image/jpeg",
        ".gif" => "image/gif",
        ".bmp" => "image/bmp",
        ".tiff" or ".tif" => "image/tiff",
        ".mp4" => "video/mp4",
        ".webm" => "video/webm",
        ".mp3" => "audio/mpeg",
        ".wav" => "audio/wav",
        ".ogg" => "audio/ogg",
        ".zip" => "application/zip",
        ".rar" => "application/x-rar-compressed",
        ".csv" => "text/csv",
        ".json" => "application/json",
        ".xml" => "application/xml",
        _ => "application/octet-stream"
    };
}