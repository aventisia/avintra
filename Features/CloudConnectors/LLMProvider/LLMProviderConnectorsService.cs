namespace WorkspaceAPIs.Features.CloudConnectors.LLMProvider;

public class LLMProviderConnectorsService : ILLMProviderConnectorsService
{
    private readonly ILogger<LLMProviderConnectorsService> _logger;
    private readonly IM365ConnectorsService _m365ConnectorsService;
    private readonly ICloudConnectorsVaultService _cloudConnectorsVaultService;

    public LLMProviderConnectorsService(
        ILogger<LLMProviderConnectorsService> logger,
        IM365ConnectorsService m365ConnectorsService, ICloudConnectorsVaultService cloudConnectorsVaultService)
    {
        _logger = logger;
        _m365ConnectorsService = m365ConnectorsService;
        _cloudConnectorsVaultService = cloudConnectorsVaultService;

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
            var openAiCredentials = await GetOpenAICredentialsAsync(cloudConnectorReqDto.CredentialId);
            if (openAiCredentials == null)
            {
                _logger.LogError("Failed to obtain Open AI credentials for Credential ID: {CredentialId}", cloudConnectorReqDto.CredentialId);
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

            // Parse Payload as JSON Document
            using var requestDoc = JsonDocument.Parse(payloadJson);
            var root = requestDoc.RootElement;

            // Extract fields from payload
            string? model = root.GetProperty("model").GetString() ?? "gpt-4o";
            string? LLMMessage = root.GetProperty("LLMMessage").GetString();
            List<string>? files = null;
            if (root.TryGetProperty("files", out var filesProp) && filesProp.ValueKind == JsonValueKind.Array)
            {
                files = new List<string>();
                foreach (var file in filesProp.EnumerateArray())
                {
                    if (file.ValueKind == JsonValueKind.String)
                    {
                        files.Add(file.GetString());
                    }
                }
            }
            bool isJsonOutput = root.TryGetProperty("is_json_output", out var jsonOutProp) ? jsonOutProp.GetBoolean() : false;
            bool stream = root.TryGetProperty("stream", out var streamProp) ? streamProp.GetBoolean() : false;
            float temperature = root.TryGetProperty("temperature", out var tempProp) ? tempProp.GetSingle() : 1.0f;
            float top_p = root.TryGetProperty("top_p", out var topPProp) ? topPProp.GetSingle() : 1.0f;
            int? max_output_tokens = root.TryGetProperty("max_output_tokens", out var maxTokensProp) ? maxTokensProp.GetInt32() : null;
            string? jsonSchema = root.TryGetProperty("json_schema", out var schemaProp)? schemaProp.GetString(): null;
            bool isByokEnabled = root.TryGetProperty("is_byok_enabled", out var byokProp) ? byokProp.GetBoolean(): false;
            string? payloadCredentialId = root.TryGetProperty("credential_id", out var credIdProp) ? credIdProp.GetString(): null;

            // 'input' (string or array of LLMMessage) 
            object messages;
            if (root.TryGetProperty("input", out var inputElement))
            {
                if (inputElement.ValueKind == JsonValueKind.String)
                {
                    messages = new[]
                    {
                    new { role = "user", content = inputElement.GetString() }
                };
                }
                else if (inputElement.ValueKind == JsonValueKind.Array)
                {
                    messages = inputElement;
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

            // Build OpenAI Request Payload 
            var openAiPayload = new Dictionary<string, object>
            {
                ["model"] = model,
                ["LLMMessage"] = messages,
            };
            // Handle the open ai request body optional property 
            if (temperature != 1.0f) openAiPayload["temperature"] = temperature;
            if (top_p != 1.0f) openAiPayload["top_p"] = top_p;
            if ( max_output_tokens.HasValue) openAiPayload["max_tokens"] =  max_output_tokens.Value;
            if (isJsonOutput)
                openAiPayload["response_format"] = new { type = "json_object" };

            openAiPayload["stream"] = stream;

            // call open AI Api 
            using var httpClient = new HttpClient();
            
            // Task success
            
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while invoking open Ai connector.");
            serviceResponse.StatusCode = 500;
            serviceResponse.Message = $"Error: {ex.Message}";
            serviceResponse.Data.Response = $"Error: {ex.Message}";
        }
        return serviceResponse;
    }

    // Get openAi apikey from the vault credential id.
    private async Task<(string ApiKey, string? Organization)?> GetOpenAICredentialsAsync(Guid credentialId)
    {
        var vaultCredential = await _cloudConnectorsVaultService.GetCredentialFromVaultAsync(credentialId);
        if (vaultCredential == null)
        {
            _logger.LogWarning("Vault credential not found for ID: {CredentialId}", credentialId);
            return null;
        }

        if (vaultCredential.Data == null || !vaultCredential.Data.TryGetValue("ApiKey", out var apiKeyValue) ||
             apiKeyValue == null)
        {
            _logger.LogWarning("No 'ApiKey' found in vault credential Data for ID: {CredentialId}", credentialId);
            return null;
        }
        string? apiKey = apiKeyValue.ToString();

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("ApiKey is null or whitespace for credential ID: {CredentialId}", credentialId);
            return null;
        }
        string? organization = vaultCredential.Data.TryGetValue("Organization", out var orgObj)
         ? orgObj as string : null;

        return (apiKey, organization);
    }

}
