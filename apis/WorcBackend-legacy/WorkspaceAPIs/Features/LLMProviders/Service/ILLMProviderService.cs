namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines the service operations for managing LLM (Large Language Model) provider models,
/// including availability checks, CRUD (Create, Read, Update, Delete) operations, and bulk deletion of LLM models.
/// </summary>
public interface ILLMProviderService
{
    /// <summary>
    /// Retrieves all LLM provider models.
    /// </summary>
    /// <param name="request">The request object containing provider-specific model data.</param>
    /// <returns>A ServiceResponse containing a collection of SelectOption objects representing the available models.</returns>
    Task<ServiceResponse<IEnumerable<SelectOption>>> GetAllModelsAsync(LLMProviderModelRequestDto request);
}
