namespace MLModelBuilderAPIs.Services;

/// <summary>
/// Provides a contract for managing API keys related to machine learning models.
/// </summary>
public interface IAIModelService
{
    /// <summary>
    /// Retrieves a collection of AI models with an option to include unpublished models.
    /// </summary>
    /// <param name="includeUnpublish"> A flag indicating whether to include unpublished AI models in the result. Defaults to <c>false</c>. </param>
    /// <returns> A task that represents the asynchronous operation. The task result contains a ServiceResponse object with an enumeration of AIModelDto objects representing the available AI models, including unpublished models if specified.
    /// </returns>
    Task<ServiceResponse<IEnumerable<AIModelDto>>> GetAIModelsAsync(bool includeUnpublish);

    /// <summary>
    /// Searches for AI models based on a search key, with an option to include unpublished models.
    /// </summary>
    /// <param name="searchKey"> A string used to filter AI models by name or description. If the searchKey is null or empty, all models will be considered. </param>
    /// <param name="includeUnpublish"> A flag indicating whether to include unpublished AI models in the result. Defaults to <c>false</c>. </param>
    /// <returns> A task that represents the asynchronous operation. The task result contains a ServiceResponse object with an enumeration of AIModelDto objects representing the available AI models, including unpublished models if specified.
    /// </returns>
    Task<ServiceResponse<IEnumerable<AIModelDto>>> SearchAIModelsAsync(string searchKey, bool includeUnpublish);

    /// <summary>
    /// Retrieves the setup details for a specific AI model by its unique identifier.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the AI model.</param>
    /// <returns>
    /// A <see cref="ServiceResponse{T}"/> containing the setup data for the specified AI model,
    /// or an appropriate error message if not found.
    /// </returns>
    Task<ServiceResponse<object>> GetAIModelSetupByIdAsync(Guid mlModelId);

    /// <summary>
    /// Executes an AI model using LLM logic, based on the provided model content and configuration.
    /// </summary>
    /// <param name="requestDto">The request DTO containing the model ID and content to be processed.</param>
    /// <returns>A <see cref="ServiceResponse{T}"/> containing the result of the execution.</returns>
    Task<ServiceResponse<object>> ExecuteViaLLMAsync(ModelContentProcessingRequestDto modelContentProcessingRequestDto);
}