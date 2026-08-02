namespace WorkspaceAPIs.Services;

/// <summary>
/// Service interface for managing tenant API keys, including creation, rotation, and revocation.
/// </summary>
public interface IApiKeyService
{
    /// <summary>
    /// Retrieves a list of API keys for the current tenant.
    /// </summary>
    /// <returns>A service response containing the collection of API key records.</returns>
    Task<ServiceResponse<IEnumerable<ApiKeyDto>>> GetApiKeysAsync();

    /// <summary>
    /// Retrieves a single API key by its identifier.
    /// </summary>
    /// <param name="apiKeyId">The unique identifier of the API key.</param>
    /// <returns>A service response containing the API key details.</returns>
    Task<ServiceResponse<ApiKeyDto>> GetApiKeyAsync(Guid apiKeyId);

    /// <summary>
    /// Creates a new API key. The plain key is returned only in this response.
    /// </summary>
    /// <param name="createApiKeyReqDto">The details for the new API key.</param>
    /// <returns>A service response containing the created API key, including the plain key.</returns>
    Task<ServiceResponse<CreateApiKeyResDto>> CreateApiKeyAsync(CreateApiKeyReqDto createApiKeyReqDto);

    /// <summary>
    /// Updates an existing API key's metadata. Does not rotate the key.
    /// </summary>
    /// <param name="updateApiKeyDto">The updated API key details.</param>
    /// <returns>A service response containing the updated API key record.</returns>
    Task<ServiceResponse<ApiKeyDto>> UpdateApiKeyAsync(UpdateApiKeyDto updateApiKeyDto);

    /// <summary>
    /// Deletes a single API key by its identifier.
    /// </summary>
    /// <param name="apiKeyId">The unique identifier of the API key to delete.</param>
    /// <returns>A service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteApiKeyAsync(Guid apiKeyId);

    /// <summary>
    /// Deletes multiple API keys by their identifiers.
    /// </summary>
    /// <param name="apiKeyIds">The collection of API key identifiers to delete.</param>
    /// <returns>A service response containing the number of API keys deleted.</returns>
    Task<ServiceResponse<int>> DeleteMultipleApiKeysAsync(IEnumerable<Guid> apiKeyIds);

}
