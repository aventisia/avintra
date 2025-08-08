namespace MLModelBuilderAPIs.Services;

public interface IGenerativeModelService
{
    /// <summary>
    /// Gets the model setup for a specific generative model using its unique ML model ID.
    /// </summary>
    /// <param name="mlModelId">The unique ID of the ML model to fetch the setup for.</param>
    /// <returns>A task that represents the asynchronous operation. It returns the model setup DTO for the specified ML model.</returns>
    Task<ServiceResponse<GenerativeModelDto>> GetSetupByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Updates the configuration for an generative model setup.
    /// </summary>
    /// <param name="modelSetupDto">The new setup configuration to be applied to the generative model.</param>
    /// <returns>A task that represents the asynchronous operation. It returns the updated model setup DTO.</returns>
    Task<ServiceResponse<GenerativeModelDto>> UpdateSetupAsync(GenerativeModelDto modelSetupDto);

    /// <summary>
    /// Updates the configuration of a generative model setup and executes the model with the new configuration.
    /// </summary>
    /// <param name="modelSetupDto">The new configuration to be applied to the generative model.</param>
    /// <param name="conversationId">An optional identifier for the conversation to associate with the model execution.</param>
    /// <returns>A task representing the asynchronous operation. It returns a service response containing the updated setup details.</returns>
    Task<ServiceResponse<string>> UpdateAndExecuteAsync(GenerativeModelDto modelSetupDto, Guid? conversationId);
}