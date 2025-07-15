namespace MLModelBuilderAPIs.Services;

public interface IConversationModelService
{
    /// <summary>
    /// Gets the model setup for a specific conversation model using its unique ML model ID.
    /// </summary>
    /// <param name="mlModelId">The unique ID of the ML model to fetch the setup for.</param>
    /// <returns>A task that represents the asynchronous operation. It returns the model setup DTO for the specified ML model.</returns>
    Task<ServiceResponse<ConversationModelDto>> GetSetupByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Updates the configuration for an conversation model setup.
    /// </summary>
    /// <param name="modelSetupDto">The new setup configuration to be applied to the conversation model.</param>
    /// <returns>A task that represents the asynchronous operation. It returns the updated model setup DTO.</returns>
    Task<ServiceResponse<ConversationModelDto>> UpdateSetupAsync(ConversationModelDto modelSetupDto);
}