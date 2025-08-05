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
    /// Executes the specified machine learning model using a large language model (LLM).
    /// This method triggers the execution of the model by providing the model's unique identifier.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model to be executed.</param>
    /// <returns>A task that represents the asynchronous operation. It returns a string response upon completion of the execution.</returns>
    Task<ServiceResponse<string>> ExecuteModelViaLLMAsync(Guid mlModelId);
}