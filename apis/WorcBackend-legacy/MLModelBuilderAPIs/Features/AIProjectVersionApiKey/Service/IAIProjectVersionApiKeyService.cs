namespace MLModelBuilderAPIs.Services;

/// <summary>
/// Defines the contract for managing API keys associated with AI project versions, 
/// including operations for creation, retrieval, update, and deletion.
/// </summary>
public interface IAIProjectVersionApiKeyService
{
    /// <summary>
    /// Retrieves all API keys associated with a specific AI project version for the current user.
    /// </summary>
    /// <param name="aiProjectVersionId">The unique identifier of the AI project version.</param>
    /// <returns>A service response containing a list of API key DTOs.</returns>
    Task<ServiceResponse<IEnumerable<AIProjectVersionApiKeyDto>>> GetApiKeysByAIProjectVersionIdAsync(Guid aiProjectVersionId);

    /// <summary>
    /// Generates and saves a new API key for the specified AI project version.
    /// </summary>
    /// <param name="aiProjectVersionApiKeyDto">The DTO containing the details of the API key to be created.</param>
    /// <returns>A service response containing the created API key.</returns>
    Task<ServiceResponse<AIProjectVersionApiKeyDto>> GenerateApiKeyAsync(AIProjectVersionApiKeyDto aiProjectVersionApiKeyDto);

    /// <summary>
    /// Updates an existing API key for the current user.
    /// </summary>
    /// <param name="aiProjectVersionApiKeyDto">The DTO containing the updated API key information.</param>
    /// <returns>A service response containing the updated API key DTO.</returns>
    Task<ServiceResponse<AIProjectVersionApiKeyDto>> UpdateApiKeyAsync(AIProjectVersionApiKeyDto aiProjectVersionApiKeyDto);

    /// <summary>
    /// Deletes an API key by its unique identifier.
    /// </summary>
    /// <param name="aiProjectVersionApiKeyId">The unique identifier of the API key to be deleted.</param>
    /// <returns>A service response indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteApiKeyAsync(Guid aiProjectVersionApiKeyId);

    /// <summary>
    /// Retrieves a specific API key by its unique identifier.
    /// </summary>
    /// <param name="aiProjectVersionApiKeyId">The unique identifier of the API key to retrieve.</param>
    /// <returns>A service response containing the requested API key details.</returns>
    Task<ServiceResponse<AIProjectVersionApiKeyDto>> GetApiKeyByIdAsync(Guid aiProjectVersionApiKeyId);

    /// <summary>
    /// Deletes multiple API keys based on a list of their unique identifiers.
    /// </summary>
    /// <param name="aiProjectVersionApiKeyIds">A list of API key IDs to delete.</param>
    /// <returns>A service response indicating the result of the bulk deletion operation.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleApiKeysAsync([FromBody] List<Guid> aiProjectVersionApiKeyIds);
}