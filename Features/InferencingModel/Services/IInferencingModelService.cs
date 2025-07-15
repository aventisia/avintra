namespace MLModelBuilderAPIs.Services;

public interface IInferencingModelService
{
    /// <summary>
    /// Gets the model setup for a specific inferencing model using its unique ML model ID.
    /// </summary>
    /// <param name="mlModelId">The unique ID of the ML model to fetch the setup for.</param>
    /// <returns>A task that represents the asynchronous operation. It returns the model setup DTO for the specified ML model.</returns>
    Task<ServiceResponse<InferencingModelDto>> GetSetupByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Updates the configuration for an inferencing model setup.
    /// </summary>
    /// <param name="modelSetupDto">The new setup configuration to be applied to the inferencing model.</param>
    /// <returns>A task that represents the asynchronous operation. It returns the updated model setup DTO.</returns>
    Task<ServiceResponse<InferencingModelDto>> UpdateSetupAsync(InferencingModelDto modelSetupDto);

    /// <summary>
    /// Executes a request against a Large Language Model (LLM) using the provided model execution request data.
    /// </summary>
    /// <param name="modelExecutionRequestDto">The model execution request containing the input parameters for the LLM.</param>
    /// <returns>
    /// A task that represents the asynchronous operation, containing a <see cref="ServiceResponse{ExtractionResponseDto}"/> 
    /// with the extraction result from the LLM.
    /// </returns>
    Task<ServiceResponse<InferencingModelResponseDto>> ExecuteLLMByFileIdsAsync(ModelExecutionRequestDto modelExecutionRequestDto);
}