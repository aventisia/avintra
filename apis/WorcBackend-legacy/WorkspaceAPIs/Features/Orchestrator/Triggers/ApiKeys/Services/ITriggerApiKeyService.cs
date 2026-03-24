/// <summary>
/// Provides functionality for generating and managing API keys
/// specifically for trigger-based integrations (e.g., Webhook, Message Trigger).
/// </summary>
public interface ITriggerApiKeyService
{
    /// <summary>
    /// Generates a new secure API key for a trigger.
    /// </summary>
    /// <returns>
    /// A <see cref="ServiceResponse{T}"/> containing the generated API key.
    /// </returns>
    Task<ServiceResponse<string>> GenerateApiKeyAsync();

    /// <summary>
    /// Regenerates an API key for an existing trigger.
    /// </summary>
    /// <returns>
    /// A <see cref="ServiceResponse{T}"/> containing the newly generated API key.
    /// </returns>
    Task<ServiceResponse<string>> RegenerateApiKeyAsync();
}