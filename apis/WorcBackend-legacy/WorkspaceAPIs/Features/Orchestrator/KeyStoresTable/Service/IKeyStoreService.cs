namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines the operations for managing configuration items.
/// </summary>
public interface IKeyStoreService
{
    /// <summary>
    /// Checks the availability of a key store name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the key store name to check.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> object with a <see cref="TrueFalseResultDto"/> indicating whether the key store name is available or not.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsKeyStoreNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Fetches all configuration items associated with the current user.
    /// </summary>
    /// <param name="isPersonal"> If <c>true</c>, returns only personal keystores. If <c>false</c>, returns only shared keystores. </param>
    /// <returns>A task representing the service response containing a list of configuration item details.</returns>
    Task<ServiceResponse<IEnumerable<KeyStoreDto>>> GetKeyStoresAsync(bool isPersonal);

    /// <summary>
    /// Fetch config key-value pairs for a list of keys (full list if no keys provided)
    /// </summary>
    /// <param name="keys">The list of keys for which to fetch values.</param>
    /// <returns>A task representing the service response containing a list of key-value pairs.</returns>
    Task<ServiceResponse<IEnumerable<ConfigKeyValueDto>>> FetchConfigKeyValuePairsAsync(IEnumerable<string>? keys);

    /// <summary>
    /// Fetches a configuration item by its unique identifier.
    /// </summary>
    /// <param name="keyStoreId">The identifier of the configuration item to retrieve.</param>
    /// <returns>A task representing the service response containing the details of the configuration item.</returns>
    Task<ServiceResponse<KeyStoreDto>> GetKeyStoreByIdAsync(Guid keyStoreId);

    /// <summary>
    /// Creates a new configuration item with the provided data.
    /// </summary>
    /// <param name="keyStoreDto">The data needed to create the new configuration item.</param>
    /// <returns>A task representing the service response containing the details of the newly created configuration item.</returns>
    Task<ServiceResponse<KeyStoreDto>> InsertKeyStoreAsync(KeyStoreDto keyStoreDto);

    /// <summary>
    /// Modifies an existing configuration item with the provided data.
    /// </summary>
    /// <param name="keyStoreDto">The data required to update the configuration item.</param>
    /// <returns>A task representing the service response containing the updated configuration item details.</returns>
    Task<ServiceResponse<KeyStoreDto>> UpdateKeyStoreAsync(KeyStoreDto keyStoreDto);

    /// <summary>
    /// Removes a configuration item by its identifier.
    /// </summary>
    /// <param name="keyStoreId">The identifier of the configuration item to be deleted.</param>
    /// <returns>A task representing the service response indicating whether the configuration item was successfully deleted.</returns>
    Task<ServiceResponse<bool>> DeleteKeyStoreAsync(Guid keyStoreId);

    /// <summary>
    /// Removes multiple configuration items by their identifiers.
    /// </summary>
    /// <param name="keyStoreIds">The list of identifiers of the configuration items to delete.</param>
    /// <returns>A task representing the service response indicating whether the configuration items were successfully deleted.</returns>
    /// <remarks>
    /// This method is recommended for deleting multiple configuration items at once, reducing the number of server requests.
    /// </remarks>
    Task<ServiceResponse<bool>> DeleteKeyStoresAsync(IEnumerable<Guid> keyStoreIds);

    /// <summary>
    /// Decrypts the value of an encrypted key store based on its ID.
    /// </summary>
    /// <param name="keyStoreId">The unique identifier of the key store.</param>
    /// <returns>A response containing the decrypted value, or an error message if decryption fails.</returns>
    Task<ServiceResponse<string>> DecryptKeyStoreValueAsync(Guid keyStoreId);
}