namespace WorkspaceAPIs.Services;

public class LLMProviderService : ILLMProviderService
{
    private readonly ILogger<LLMProviderService> _logger;
    private readonly Guid _userId;
    private readonly IAppSecretService _appSecretService;

    public LLMProviderService(
        ILogger<LLMProviderService> logger,
        IHttpContextAccessor httpContextAccessor,
        IAppSecretService appSecretService)
    {
        _logger = logger;
        _appSecretService = appSecretService;

        // Initialize the user ID by extracting it from the JWT claims in the HTTP context.
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Retrieves models based on the specified LLM provider type and credentials.
    public async Task<ServiceResponse<IEnumerable<SelectOption>>> GetAllModelsAsync(LLMProviderModelRequestDto requestDto)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOption>>
        {
            Data = null,
            Message = "Failed to retrieve models. Please try again later."
        };

        try
        {
            // Fetch the secret credentials associated with the provided CredentialId.
            var credential = await _appSecretService.GetAppSecretDetailAsync(requestDto.CredentialId);

            // If credentials are not valid, return the error message.
            if (credential.StatusCode != 200)
            {
                serviceResponse.Message = "Invalid credentials. Please verify the CredentialId and try again.";
                return serviceResponse;
            }

            // Default to an empty string if ApiKey is not found
            string apiKey = string.Empty;

            // Check if the credential data is a JObject
            if (credential?.Data?.Data is JObject data)
            {
                apiKey = data["ApiKey"]?.ToString() ?? string.Empty;
            }
            // Check if the credential data is a JsonElement
            else if (credential?.Data?.Data is JsonElement dataElement)
            {
                // Check if "ApiKey" exists in the JsonElement and try to extract its value
                if (dataElement.TryGetProperty("ApiKey", out JsonElement apiKeyElement))
                {
                    apiKey = apiKeyElement.GetString() ?? string.Empty;
                }
            }

            if (string.IsNullOrEmpty(apiKey))
            {
                serviceResponse.Message = "API Key is missing or invalid. Please check the credentials.";
                return serviceResponse;
            }

            // Initialize RestClient based on provider
            RestClient client;

            switch (requestDto.ProviderType)
            {
                case LLMProviderTypesEnum.OpenAI:
                    client = new RestClient("https://api.openai.com");
                    client.AddDefaultHeader("Authorization", $"Bearer {apiKey}");
                    serviceResponse = await GetModelsAsync(requestDto, client);
                    break;

                case LLMProviderTypesEnum.OpenRouter:
                    client = new RestClient("https://openrouter.ai/api");
                    client.AddDefaultHeader("Authorization", $"Bearer {apiKey}");
                    serviceResponse = await GetModelsAsync(requestDto, client);
                    break;

                case LLMProviderTypesEnum.Gemini:
                    client = new RestClient("https://generativelanguage.googleapis.com");
                    client.AddDefaultHeader("x-goog-api-key", apiKey);
                    serviceResponse = await GetModelsAsync(requestDto, client);
                    break;

                case LLMProviderTypesEnum.Anthropic:
                    client = new RestClient("https://api.anthropic.com");
                    client.AddDefaultHeader("x-api-key", apiKey);
                    client.AddDefaultHeader("anthropic-version", "2023-06-01");
                    serviceResponse = await GetModelsAsync(requestDto, client);
                    break;

                default:
                    serviceResponse.Message = "Provider type not supported.";
                    _logger.LogWarning("Unsupported provider type: {ProviderType}", requestDto.ProviderType);
                    break;
            }

            return serviceResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching models for user {UserId}.", _userId);
            serviceResponse.Message = "An error occurred while processing your request.";
            return serviceResponse;
        }
    }

    private async Task<ServiceResponse<IEnumerable<SelectOption>>> GetModelsAsync(LLMProviderModelRequestDto lLMProviderModelRequestDto, RestClient client)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOption>>();

        try
        {
            // Define the API endpoint based on the provider type
            // Select models endpoint based on provider
            string endpoint = lLMProviderModelRequestDto.ProviderType switch
            {
                LLMProviderTypesEnum.OpenAI => "v1/models",
                LLMProviderTypesEnum.OpenRouter =>
                    string.IsNullOrWhiteSpace(lLMProviderModelRequestDto.OutputModalities)
                        ? "v1/models?output_modalities=all"
                        : $"v1/models?output_modalities={lLMProviderModelRequestDto.OutputModalities.ToLower()}",
                LLMProviderTypesEnum.Gemini => "v1beta/models",
                LLMProviderTypesEnum.Anthropic => "v1/models",
                _ => throw new NotImplementedException("Unsupported provider")
            };

            // Create GET request
            var request = new RestRequest(endpoint, Method.Get);

            // Call provider API
            var response = await client.ExecuteAsync(request);

            // Validate response
            if (!response.IsSuccessful || string.IsNullOrWhiteSpace(response.Content))
            {
                serviceResponse.Message = $"Failed to retrieve models from {lLMProviderModelRequestDto.ProviderType}. Status: {response.StatusCode}";
                return serviceResponse;
            }

            // Log success
            _logger.LogInformation("Successfully retrieved models from {Provider} API.", lLMProviderModelRequestDto.ProviderType);

            // Parse JSON response body
            JObject jsonResponse = JObject.Parse(response.Content);

            // Extract data based on provider type
            IEnumerable<JToken>? dataArray = lLMProviderModelRequestDto.ProviderType switch
            {
                LLMProviderTypesEnum.OpenAI => jsonResponse["data"]?.ToArray(),
                LLMProviderTypesEnum.Gemini => jsonResponse["models"]?.ToArray(),
                LLMProviderTypesEnum.OpenRouter => jsonResponse["data"]?.ToArray(),
                LLMProviderTypesEnum.Anthropic => jsonResponse["data"]?.ToArray(),
                _ => throw new NotImplementedException($"No data extraction logic defined for {lLMProviderModelRequestDto.ProviderType}")
            };

            if (dataArray == null || !dataArray.Any())
            {
                serviceResponse.Message = "No models found in the response.";
                return serviceResponse;
            }

            // Extract model IDs
            var modelItems = dataArray.Select(item => new
            {
                Raw = item,
                Id = item["id"]?.ToString() ?? string.Empty
            });

            // Map to DTO and sort
            var selectOptions = modelItems
                .Select(x => MapToSelectOptionDto(x.Raw, lLMProviderModelRequestDto.ProviderType))
                .OrderBy(o => o.Label)
                .ToList();

            // Check if the request is specifically asking for embedding models
            if (lLMProviderModelRequestDto.OutputModalities?.Equals("Embeddings", StringComparison.OrdinalIgnoreCase) == true)
            {
                selectOptions = selectOptions
                    .Where(w => !string.IsNullOrEmpty(w.Value) &&
                            (w.Value.Contains("embed", StringComparison.OrdinalIgnoreCase) ||
                                w.Value.Contains("embedding", StringComparison.OrdinalIgnoreCase)))
                    .OrderBy(o => o.Label)
                    .ToList();
            }

            // Set the service response data and message
            serviceResponse.Data = selectOptions;
            serviceResponse.Message = $"Successfully retrieved models from {lLMProviderModelRequestDto.ProviderType} API.";
            serviceResponse.StatusCode = 200;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching models from {ProviderType} API for user {UserId}.", lLMProviderModelRequestDto.ProviderType, _userId);
        }

        return serviceResponse;
    }

    // General method to map a JToken to SelectOption based on the provider type
    private SelectOption MapToSelectOptionDto(JToken item, LLMProviderTypesEnum providerType)
    {
        var value = providerType switch
        {
            LLMProviderTypesEnum.OpenAI => RemovePrefix(item["id"]?.ToString() ?? string.Empty),
            LLMProviderTypesEnum.Gemini => RemovePrefix(item["name"]?.ToString() ?? string.Empty),
            LLMProviderTypesEnum.OpenRouter => item["canonical_slug"]?.ToString(),
            LLMProviderTypesEnum.Anthropic =>
                $"{item["id"]?.ToString()}/{item["max_tokens"]?.ToString()}",
            _ => throw new NotImplementedException($"No value extraction logic defined for {providerType}")
        };

        var label = providerType switch
        {
            LLMProviderTypesEnum.OpenAI => RemovePrefix(item["id"]?.ToString() ?? string.Empty),
            LLMProviderTypesEnum.Gemini => item["displayName"]?.ToString(),
            LLMProviderTypesEnum.OpenRouter => item["name"]?.ToString(),
            LLMProviderTypesEnum.Anthropic => item["display_name"]?.ToString(),
            _ => throw new NotImplementedException($"No label extraction logic defined for {providerType}")
        };

        var description = providerType switch
        {
            LLMProviderTypesEnum.OpenAI => $"Owned by {item["owned_by"]?.ToString()}",
            LLMProviderTypesEnum.Gemini => item["description"]?.ToString(),
            LLMProviderTypesEnum.OpenRouter => item["description"]?.ToString(),
            LLMProviderTypesEnum.Anthropic => item["display_name"]?.ToString(),
            _ => throw new NotImplementedException($"No description extraction logic defined for {providerType}")
        };

        return new SelectOption
        {
            Value = value ?? string.Empty,
            Label = label ?? string.Empty,
            Description = description
        };
    }
    // Helper method to remove the prefix before the first "/" if it exists
    private string RemovePrefix(string value)
    {
        if (!string.IsNullOrEmpty(value) && value.Contains("/"))
        {
            // Find the first occurrence of "/"
            int index = value.IndexOf("/");

            // Remove everything before and including the first "/"
            return value.Substring(index + 1);
        }

        return value; // Return the original value if no "/" is found
    }
}