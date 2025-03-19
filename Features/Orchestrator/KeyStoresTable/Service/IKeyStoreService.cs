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
    /// <returns>A task representing the service response containing a list of configuration item details.</returns>
    Task<ServiceResponse<IEnumerable<KeyStoreDto>>> GetKeyStoresAsync();

    /// <summary>
    /// Fetches a configuration item by its unique identifier.
    /// </summary>
    /// <param name="KeyStoreId">The identifier of the configuration item to retrieve.</param>
    /// <returns>A task representing the service response containing the details of the configuration item.</returns>
    Task<ServiceResponse<KeyStoreDto>> GetKeyStoreByIdAsync(Guid KeyStoreId);

    /// <summary>
    /// Creates a new configuration item with the provided data.
    /// </summary>
    /// <param name="KeyStoreDto">The data needed to create the new configuration item.</param>
    /// <returns>A task representing the service response containing the details of the newly created configuration item.</returns>
    Task<ServiceResponse<KeyStoreDto>> InsertKeyStoreAsync(KeyStoreDto KeyStoreDto);

    /// <summary>
    /// Modifies an existing configuration item with the provided data.
    /// </summary>
    /// <param name="KeyStoreDto">The data required to update the configuration item.</param>
    /// <returns>A task representing the service response containing the updated configuration item details.</returns>
    Task<ServiceResponse<KeyStoreDto>> UpdateKeyStoreAsync(KeyStoreDto KeyStoreDto);

    /// <summary>
    /// Removes a configuration item by its identifier.
    /// </summary>
    /// <param name="KeyStoreId">The identifier of the configuration item to be deleted.</param>
    /// <returns>A task representing the service response indicating whether the configuration item was successfully deleted.</returns>
    Task<ServiceResponse<bool>> DeleteKeyStoreAsync(Guid KeyStoreId);

    /// <summary>
    /// Removes multiple configuration items by their identifiers.
    /// </summary>
    /// <param name="KeyStoreIds">The list of identifiers of the configuration items to delete.</param>
    /// <returns>A task representing the service response indicating whether the configuration items were successfully deleted.</returns>
    /// <remarks>
    /// This method is recommended for deleting multiple configuration items at once, reducing the number of server requests.
    /// </remarks>
    Task<ServiceResponse<bool>> DeleteKeyStoresAsync(IEnumerable<Guid> KeyStoreIds);
    
    /// <summary>
    /// Decrypts the value of an encrypted key store based on its ID.
    /// </summary>
    /// <param name="KeyStoreId">The unique identifier of the key store.</param>
    /// <returns>A response containing the decrypted value, or an error message if decryption fails.</returns>
    Task<ServiceResponse<string>> DecryptKeyStoreValueAsync(Guid KeyStoreId);
}