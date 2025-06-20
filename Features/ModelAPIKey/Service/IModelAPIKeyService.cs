namespace MLModelBuilderAPIs.Services;

/// <summary>
/// Provides a contract for managing API keys related to machine learning models.
/// </summary>
public interface IModelAPIKeyService
{
    /// <summary>
    /// Retrieves all API keys associated with the current user's models.
    /// </summary>
    /// <returns>A service response containing a list of API key DTOs.</returns>
    Task<ServiceResponse<IEnumerable<ModelAPIKeyDto>>> GetAPIKeysAsync();

    /// <summary>
    /// Creates and stores a new API key.
    /// </summary>
    /// <param name="modelAPIKeyDto">The API key details to be created.</param>
    /// <returns>A service response containing the created API key.</returns>
    Task<ServiceResponse<ModelAPIKeyDto>> GenerateAPIKeyAsync(ModelAPIKeyDto modelAPIKeyDto);

    /// <summary>
    /// Deletes a specific API key by its unique identifier.
    /// </summary>
    /// <param name="modelAPIKeyId">The unique ID of the API key to delete.</param>
    /// <returns>A service response indicating the result of the deletion.</returns>
    Task<ServiceResponse<bool>> DeleteAPIKeyAsync(Guid modelAPIKeyId);

    /// <summary>
    /// Retrieves an API key by its unique identifier.
    /// </summary>
    /// <param name="modelAPIKeyId">The unique ID of the API key.</param>
    /// <returns>A service response containing the API key details.</returns>
    Task<ServiceResponse<ModelAPIKeyDto>> GetAPIKeyByIdAsync(Guid modelAPIKeyId);

    /// <summary>
    /// Deletes multiple API keys using their unique identifiers.
    /// </summary>
    /// <param name="modelAPIKeyIds">A list of API key IDs to be deleted.</param>
    /// <returns>A service response indicating the success status of the operation.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleAPIKeysAsync([FromBody] List<Guid> modelAPIKeyIds);
}