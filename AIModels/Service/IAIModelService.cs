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
}
