namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines the service operations for managing OnPrem models, including availability checks, 
/// CRUD (Create, Read, Update, Delete) operations, and bulk deletion of OnPrem models.
/// </summary>
public interface IOnPremModelService
{
    /// <summary>
    /// Checks the availability of a specific OnPrem model name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the model name and other relevant context to verify availability.</param>
    /// <returns>A ServiceResponse containing a TrueFalseResultDto indicating whether the model name is available.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsOnPremModelNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Retrieves all OnPrem models.
    /// </summary>
    /// <returns>A ServiceResponse containing a collection of OnPremModelDto objects.</returns>
    Task<ServiceResponse<IEnumerable<OnPremModelDto>>> GetAllOnPremModelsAsync();
    /// <summary>
    /// Retrieves the list of models available from an Ollama provider at the given base URL.
    /// </summary>
    /// <param name="providerUrl">The base URL of the Ollama API.</param>
    /// <returns>A ServiceResponse containing a collection of OllamaModelDto objects.</returns>
    Task<ServiceResponse<IEnumerable<OllamaModelDto>>> GetOllamaModelsAsync(string providerUrl);
    /// <summary>
    /// Retrieves a specific OnPrem model by its unique identifier.
    /// </summary>
    /// <param name="onPremModelId">The unique identifier for the OnPrem model.</param>
    /// <returns>A ServiceResponse containing the details of the specified OnPrem model.</returns>
    Task<ServiceResponse<OnPremModelDto>> GetOnPremModelAsync(Guid onPremModelId);

    /// <summary>
    /// Retrieves a specific OnPrem model by its name.
    /// </summary>
    /// <param name="onPremModelName">The name of the OnPrem model.</param>
    /// <returns>A ServiceResponse containing the details of the specifiedOnPrem model.</returns>
    Task<ServiceResponse<OnPremModelDto>> GetOnPremModelByNameAsync(string onPremModelName);

    /// <summary>
    /// Inserts a new OnPrem model into the system.
    /// </summary>
    /// <param name="onPremModelDto">The DTO containing the OnPrem model data to be added.</param>
    /// <returns>A ServiceResponse containing the details of the newly created OnPrem model.</returns>
    Task<ServiceResponse<OnPremModelDto>> InsertOnPremModelAsync(OnPremModelDto onPremModelDto);

    /// <summary>
    /// Updates an existing OnPrem model in the system.
    /// </summary>
    /// <param name="onPremModelDto">The DTO containing the updated OnPrem model data.</param>
    /// <returns>A ServiceResponse containing the updated details of the OnPrem model.</returns>
    Task<ServiceResponse<OnPremModelDto>> UpdateOnPremModelAsync(OnPremModelDto onPremModelDto);

    /// <summary>
    /// Deletes a specific OnPrem model by its unique identifier.
    /// </summary>
    /// <param name="onPremModelId">The unique identifier of the OnPrem model to be deleted.</param>
    /// <returns>A ServiceResponse indicating whether the deletion was successful or not.</returns>
    Task<ServiceResponse<bool>> DeleteOnPremModelAsync(Guid onPremModelId);

    /// <summary>
    /// Deletes multiple OnPrem models based on a list of unique identifiers.
    /// </summary>
    /// <param name="onPremModelIds">The list of unique identifiers for the OnPrem models to be deleted.</param>
    /// <returns>A ServiceResponse indicating the success or failure of the bulk deletion process.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleOnPremModelsAsync(IEnumerable<Guid> onPremModelIds);

    /// <summary>
    /// Searches for OnPrem models by their name, returning models that match the provided search term.
    /// </summary>
    /// <param name="modelName">The name (or part of the name) of the OnPrem models to search for.</param>
    /// <returns>A ServiceResponse containing a collection of OnPrem model DTOs that match the search term.</returns>
    Task<ServiceResponse<IEnumerable<OnPremModelDto>>> SearchOnPremModelsByNameAsync(string modelName);

    /// <summary>
    /// Syncs on-prem models with an external provider (e.g., Ollama), updating or adding models as needed.
    /// </summary>
    /// <param name="syncOnPremModelsDto">The DTO containing the provider type and base URL for syncing models.</param>
    /// <returns>A ServiceResponse indicating whether the sync was successful.</returns>
    Task<ServiceResponse<bool>> SyncAllOnPremModelsAsync(SyncOnPremModelsDto syncOnPremModelsDto);
}
