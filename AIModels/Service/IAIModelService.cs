namespace MLModelBuilderAPIs.Services;

/// <summary>
/// Provides a contract for managing API keys related to machine learning models.
/// </summary>
public interface IAIModelService
{
    /// <summary>
    /// Retrieves a collection of AI models.
    /// </summary>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result contains a ServiceResponse object 
    /// with an enumeration of AIModelDto objects, which represent the available AI models.
    /// </returns>
    Task<ServiceResponse<IEnumerable<AIModelDto>>> GetAIModelsAsync();

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
    /// Executes an AI model using a large language model (LLM) based on the provided input request.
    /// </summary>
    /// <param name="extractRequestDto">The request payload containing the model ID and relevant input data.</param>
    /// <returns>
    /// A <see cref="ServiceResponse{T}"/> containing the execution result of the AI model,
    /// or an appropriate error message if execution fails.
    /// </returns>
    Task<ServiceResponse<object>> ExecuteViaLLMAsync(ExtractRequestDto extractRequestDto);

    /// <summary>
    /// Add a new document records to the system using the provided metadata.
    /// </summary>
    /// <param name="request">The request containing document metadata and related details.</param>
    /// <returns>
    /// A task representing the asynchronous operation, containing a service response with the result of the save action.
    /// </returns>
    Task<ServiceResponse<object>> AddDocumentRecordAsync(AddDocumentRequestDto request);
}