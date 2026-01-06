namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines the service operations for managing Ollama models, including availability checks, 
/// CRUD (Create, Read, Update, Delete) operations, and bulk deletion of Ollama models.
/// </summary>
public interface IOllamaModelService
{
    /// <summary>
    /// Checks the availability of a specific Ollama model name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the model name and other relevant context to verify availability.</param>
    /// <returns>A ServiceResponse containing a TrueFalseResultDto indicating whether the model name is available.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsOllamaModelNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Retrieves all Ollama models.
    /// </summary>
    /// <returns>A ServiceResponse containing a collection of OllamaModelDto objects.</returns>
    Task<ServiceResponse<IEnumerable<OllamaModelDto>>> GetAllOllamaModelsAsync();

    /// <summary>
    /// Retrieves a specific Ollama model by its unique identifier.
    /// </summary>
    /// <param name="ollamaModelId">The unique identifier for the Ollama model.</param>
    /// <returns>A ServiceResponse containing the details of the specified Ollama model.</returns>
    Task<ServiceResponse<OllamaModelDto>> GetOllamaModelAsync(Guid ollamaModelId);

    /// <summary>
    /// Retrieves a specific Ollama model by its name.
    /// </summary>
    /// <param name="ollamaModelName">The name of the Ollama model.</param>
    /// <returns>A ServiceResponse containing the details of the specified Ollama model.</returns>
    Task<ServiceResponse<OllamaModelDto>> GetOllamaModelByNameAsync(string ollamaModelName);

    /// <summary>
    /// Inserts a new Ollama model into the system.
    /// </summary>
    /// <param name="ollamaModelDto">The DTO containing the Ollama model data to be added.</param>
    /// <returns>A ServiceResponse containing the details of the newly created Ollama model.</returns>
    Task<ServiceResponse<OllamaModelDto>> InsertOllamaModelAsync(OllamaModelDto ollamaModelDto);

    /// <summary>
    /// Updates an existing Ollama model in the system.
    /// </summary>
    /// <param name="ollamaModelDto">The DTO containing the updated Ollama model data.</param>
    /// <returns>A ServiceResponse containing the updated details of the Ollama model.</returns>
    Task<ServiceResponse<OllamaModelDto>> UpdateOllamaModelAsync(OllamaModelDto ollamaModelDto);

    /// <summary>
    /// Deletes a specific Ollama model by its unique identifier.
    /// </summary>
    /// <param name="ollamaModelId">The unique identifier of the Ollama model to be deleted.</param>
    /// <returns>A ServiceResponse indicating whether the deletion was successful or not.</returns>
    Task<ServiceResponse<bool>> DeleteOllamaModelAsync(Guid ollamaModelId);

    /// <summary>
    /// Deletes multiple Ollama models based on a list of unique identifiers.
    /// </summary>
    /// <param name="ollamaModelIds">The list of unique identifiers for the Ollama models to be deleted.</param>
    /// <returns>A ServiceResponse indicating the success or failure of the bulk deletion process.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleOllamaModelsAsync(IEnumerable<Guid> ollamaModelIds);

    /// <summary>
    /// Searches for Ollama models by their name, returning models that match the provided search term.
    /// </summary>
    /// <param name="modelName">The name (or part of the name) of the Ollama models to search for.</param>
    /// <returns>A ServiceResponse containing a collection of Ollama model DTOs that match the search term.</returns>
    Task<ServiceResponse<IEnumerable<OllamaModelDto>>> SearchOllamaModelsByNameAsync(string modelName);
}
