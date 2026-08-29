using System.Text.Json.Nodes;

namespace WorkspaceAPIs.Features.CloudConnectors.LLMProvider;

public class LLMProviderConnectorsService : ILLMProviderConnectorsService
{
    private readonly ILogger<LLMProviderConnectorsService> _logger;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly ICloudConnectorsVaultService _cloudConnectorsVaultService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly string _jwt;

    public LLMProviderConnectorsService(
        ILogger<LLMProviderConnectorsService> logger,
        EnvironmentConfig environmentConfig,
        ICloudConnectorsVaultService cloudConnectorsVaultService,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _environmentConfig = environmentConfig;
        _cloudConnectorsVaultService = cloudConnectorsVaultService;
        _httpContextAccessor = httpContextAccessor;

        _jwt = httpContextAccessor.HttpContext?.Request.Cookies["AccessToken"] ?? httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString().Replace("Bearer ", "") ?? "";

    }

    public async Task<ServiceResponse<CloudConnectorResDto>> InvokeCloudConnectorAsync(CloudConnectorReqDto cloudConnectorReqDto)
    {
        var serviceResponse = new ServiceResponse<CloudConnectorResDto>
        {
            Data = new CloudConnectorResDto
            {
                Response = null,
                Provider = cloudConnectorReqDto.Provider,
                Action = cloudConnectorReqDto.Action
            },
            StatusCode = 400
        };
        try
        {
            // Get open Ai Credentials
            var openAiCredentials = await GetOpenAICredentialsAsync(cloudConnectorReqDto.CredentialName);
            if (openAiCredentials == null)
            {
                _logger.LogError("Failed to obtain Open AI credentials for Credential Name: {CredentialName}", cloudConnectorReqDto.CredentialName);
                serviceResponse.Message = "Open Ai credentials not found";
                return serviceResponse;
            }

            string payloadJson;
            try
            {
                payloadJson = System.Text.Json.JsonSerializer.Serialize(cloudConnectorReqDto.Payload);
            }
            catch (Exception ex)
            {
                serviceResponse.Message = $"Failed to serialize payload: {ex.Message}";
                return serviceResponse;
            }

            // Extract provider from CloudConnectorReqDto (string)
            string? providerStr = cloudConnectorReqDto.Provider?.Trim();

            // Parse to enum
            if (!Enum.TryParse<LLMProviderEnum>(providerStr, true, out LLMProviderEnum provider))
            {
                _logger.LogError("Invalid provider specified: {Provider}", providerStr);
                serviceResponse.Message = $"Unsupported provider: {providerStr}. Valid values: OpenAI, Ollama, DeepInfra.";
                serviceResponse.StatusCode = 400;
                return serviceResponse;
            }

            // Parse Payload as JSON Document
            using var requestDoc = JsonDocument.Parse(payloadJson);
            var root = requestDoc.RootElement;

            // Extract fields from payload

            // Required
            string model = root.GetProperty("model").GetString() ?? "gpt-4o-mini";

            // Input: Union[str, List[LLMMessage]]
            object inputMessages;
            if (root.TryGetProperty("input", out var inputElement))
            {
                if (inputElement.ValueKind == JsonValueKind.String)
                {
                    inputMessages = new[]
                    {
                    new { role = "user", content = inputElement.GetString() }
                };
                }
                else if (inputElement.ValueKind == JsonValueKind.Array)
                {
                    inputMessages = inputElement;
                }
                else
                {
                    serviceResponse.Message = "Invalid 'input' format. Expected string or array.";
                    return serviceResponse;
                }
            }
            else
            {
                serviceResponse.Message = "'input' field is required in payload.";
                return serviceResponse;
            }

            // Optional Fields 
            bool isJsonOutput = root.TryGetProperty("is_json_output", out var jsonOutProp) ? jsonOutProp.GetBoolean() : false;
            string? jsonSchema = root.TryGetProperty("json_schema", out var schemaProp) ? schemaProp.GetString() : null;
            int? maxOutputTokens = root.TryGetProperty("max_output_tokens", out var maxTokensProp) ? maxTokensProp.GetInt32() : null;
            bool isByokEnabled = root.TryGetProperty("is_byok_enabled", out var byokProp) ? byokProp.GetBoolean() : false;
            float temperature = root.TryGetProperty("temperature", out var tempProp) ? tempProp.GetSingle() : 1.0f;
            float topP = root.TryGetProperty("top_p", out var topPProp) ? topPProp.GetSingle() : 1.0f;
            bool stream = root.TryGetProperty("stream", out var streamProp) ? streamProp.GetBoolean() : false;

            // Files (List of base64-encoded strings)
            List<string>? files = null;
            if (root.TryGetProperty("files", out var filesProp) && filesProp.ValueKind == JsonValueKind.Array)
            {
                files = new List<string>();
                foreach (var file in filesProp.EnumerateArray())
                {
                    if (file.ValueKind == JsonValueKind.String)
                    {
                        files.Add(file.GetString() ?? string.Empty);
                    }
                }
            }

            // credential_name (if passed in payload, override or echo back) - now carries the credential NAME
            string? payloadCredentialName = ReadCredentialName(root) ?? cloudConnectorReqDto.CredentialName;

            // Build FINAL Payload for Internal LLM Pipeline API
            var llmPipelinePayload = new Dictionary<string, object?>
            {
                ["provider"] = provider.ToString().ToLowerInvariant(),
                ["model"] = model,
                ["input"] = inputMessages,
                ["files"] = files ?? new List<string>(),
                ["is_json_output"] = isJsonOutput,
                ["json_schema"] = jsonSchema,
                ["max_output_tokens"] = maxOutputTokens,
                ["is_byok_enabled"] = isByokEnabled,
                ["credential_name"] = payloadCredentialName ?? string.Empty,
                ["temperature"] = temperature,
                ["top_p"] = topP,
                ["stream"] = stream
            };

            // call open AI Api 
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _jwt);
            // Forward the current space so llmpipeline attributes LLM credit usage
            // to the correct space instead of defaulting to Central.
            var spaceIdHeader = _httpContextAccessor.HttpContext?.Request.Headers["X-Space-Id"];
            if (Guid.TryParse(spaceIdHeader.ToString(), out var spaceId) && spaceId != Guid.Empty)
            {
                httpClient.DefaultRequestHeaders.Add("X-Space-Id", spaceId.ToString());
            }
            string endpoint = $"{_environmentConfig.LlmPipelineApiBaseUrl}/api/v2/llm/generate";

            var jsonContent = new StringContent(
                System.Text.Json.JsonSerializer.Serialize(llmPipelinePayload), Encoding.UTF8, "application/json");

            using var response = await httpClient.PostAsync(endpoint, jsonContent);
            string responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"LLM Pipeline API error: {response.StatusCode} - {responseBody}");
            }

            // Parse Response using JsonNode 
            JsonNode? apiResponseNode = JsonNode.Parse(responseBody);

            if (apiResponseNode == null)
            {
                throw new InvalidOperationException("Failed to parse LLM pipeline response.");
            }

            var finalResponse = new JsonObject
            {
                ["provider"] = provider.ToString().ToLowerInvariant(),
                ["credential_name"] = payloadCredentialName ?? string.Empty,
                ["created_on"] = DateTime.UtcNow.ToString("o"),
                ["action"] = cloudConnectorReqDto.Action
            };

            if (apiResponseNode is JsonObject apiResponseObj)
            {
                foreach (var prop in apiResponseObj)
                {
                    finalResponse[prop.Key] = prop.Value != null
                    ? JsonNode.Parse(System.Text.Json.JsonSerializer.Serialize(prop.Value)) : null;
                }

            }
            else
            {
                serviceResponse.Message = "LLM pipeline response is not a JSON object.";
                serviceResponse.StatusCode = 502;
                return serviceResponse;
            }

            // Return Success
            serviceResponse.Data.Response = finalResponse;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Llm provider connector invoked successfully";
            return serviceResponse;

        }
        //The requested operation requires an element of type 'Number', but the target element has type 'String'.
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while invoking open Ai connector.");
            serviceResponse.StatusCode = 500;
            serviceResponse.Message = $"Error: {ex.Message}";
            serviceResponse.Data.Response = $"Error: {ex.Message}";
        }
        return serviceResponse;
    }
    // Get openAi apikey from the vault credential name.
    private async Task<(string ApiKey, string? Organization)?> GetOpenAICredentialsAsync(string credentialName)
    {
        var vaultCredential = await _cloudConnectorsVaultService.GetCredentialFromVaultAsync(credentialName);
        if (vaultCredential == null)
        {
            _logger.LogWarning("Vault credential not found for Name: {CredentialName}", credentialName);
            return null;
        }

        if (vaultCredential.Data == null || !vaultCredential.Data.TryGetValue("ApiKey", out var apiKeyValue) ||
             apiKeyValue == null)
        {
            _logger.LogWarning("No 'ApiKey' found in vault credential Data for Name: {CredentialName}", credentialName);
            return null;
        }
        string? apiKey = apiKeyValue.ToString();

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("ApiKey is null or whitespace for credential Name: {CredentialName}", credentialName);
            return null;
        }
        string? organization = vaultCredential.Data.TryGetValue("Organization", out var orgObj)
         ? orgObj as string : null;

        return (apiKey, organization);
    }

    // Reads a credential reference from a JSON payload. Accepts the canonical
    // "credential_name" key and the legacy "credential_id" key (Q12 back-compat).
    private static string? ReadCredentialName(JsonElement root)
    {
        if (root.TryGetProperty("credential_name", out var nameProp))
        {
            var name = nameProp.GetString();
            if (!string.IsNullOrWhiteSpace(name)) return name;
        }
        return null;
    }
}
