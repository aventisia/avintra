public class TriggerApiKeyService : ITriggerApiKeyService
{
    private readonly ILogger<TriggerApiKeyService> _logger;

    public TriggerApiKeyService(ILogger<TriggerApiKeyService> logger)
    {
        _logger = logger;
    }

    // Generates a secure API key.
    public async Task<ServiceResponse<string>> GenerateApiKeyAsync()
    {
        // Initialize default failure response
        var serviceResponse = new ServiceResponse<string>
        {
            Data = null,
            Message = "Failed to generate API key. Please try again."
        };

        try
        {
            // Generate a secure API key
            var apiKey = GenerateSecureApiKey();

            // update response
            serviceResponse.Data = apiKey;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "API key generated successfully.";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while generating API key.");
        }

        // Return the response (wrapped in Task for async consistency)
        return await Task.FromResult(serviceResponse);
    }

    // Regenerates a secure API key.
    public async Task<ServiceResponse<string>> RegenerateApiKeyAsync()
    {
        // Reuse the same generation logic
        return await GenerateApiKeyAsync();
    }

    // Generates a cryptographically secure random API key.
    private string GenerateSecureApiKey()
    {
        // Generate 32 random bytes (256 bits)
        var keyBytes = RandomNumberGenerator.GetBytes(32);

        // Convert to Base64 string
        var apiKey = Convert.ToBase64String(keyBytes);

        // Make it URL-safe
        return apiKey
            .Replace("+", "")
            .Replace("/", "")
            .Replace("=", "");
    }
}