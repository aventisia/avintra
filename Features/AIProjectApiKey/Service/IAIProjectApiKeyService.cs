namespace MLModelBuilderAPIs.Services;

/// <summary>
/// Defines the contract for managing Api keys associated with AI projects, 
/// including operations for creation, retrieval, update, and deletion.
/// </summary>
public interface IAIProjectApiKeyService
{
    /// <summary>
    /// Retrieves all Api keys associated with a specific AI project for the current user.
    /// </summary>
    /// <param name="aiProjectId">The unique identifier of the AI project.</param>
    /// <returns>A service response containing a list of Api key DTOs.</returns>
    Task<ServiceResponse<IEnumerable<AIProjectApiKeyDto>>> GetApiKeysByAIProjectIdAsync(Guid aiProjectId);

    /// <summary>
    /// Generates and saves a new Api key for the specified AI project.
    /// </summary>
    /// <param name="aiProjectApiKeyDto">The DTO containing the details of the Api key to be created.</param>
    /// <returns>A service response containing the created Api key.</returns>
    Task<ServiceResponse<AIProjectApiKeyDto>> GenerateApiKeyAsync(AIProjectApiKeyDto aiProjectApiKeyDto);

    /// <summary>
    /// Updates an existing Api key for the current user.
    /// </summary>
    /// <param name="aiProjectApiKeyDto">The DTO containing the updated Api key information.</param>
    /// <returns>A service response containing the updated Api key DTO.</returns>
    Task<ServiceResponse<AIProjectApiKeyDto>> UpdateApiKeyAsync(AIProjectApiKeyDto aiProjectApiKeyDto);

    /// <summary>
    /// Deletes an Api key by its unique identifier.
    /// </summary>
    /// <param name="aiProjectApiKeyId">The unique identifier of the Api key to be deleted.</param>
    /// <returns>A service response indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteApiKeyAsync(Guid aiProjectApiKeyId);

    /// <summary>
    /// Retrieves a specific Api key by its unique identifier.
    /// </summary>
    /// <param name="aiProjectApiKeyId">The unique identifier of the Api key to retrieve.</param>
    /// <returns>A service response containing the requested Api key details.</returns>
    Task<ServiceResponse<AIProjectApiKeyDto>> GetApiKeyByIdAsync(Guid aiProjectApiKeyId);

    /// <summary>
    /// Deletes multiple Api keys based on a list of their unique identifiers.
    /// </summary>
    /// <param name="aiProjectApiKeyIds">A list of Api key IDs to delete.</param>
    /// <returns>A service response indicating the result of the bulk deletion operation.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleApiKeysAsync([FromBody] List<Guid> aiProjectApiKeyIds);
}
