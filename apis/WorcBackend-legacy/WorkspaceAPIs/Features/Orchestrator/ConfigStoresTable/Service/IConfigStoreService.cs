namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines the operations for managing configuration items.
/// </summary>
public interface IConfigStoreService
{
    /// <summary>
    /// Checks the availability of a config store name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the config store name to check.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> object with a <see cref="TrueFalseResultDto"/> indicating whether the config store name is available or not.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsConfigStoreNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Fetches all configuration items associated with the current user.
    /// </summary>
    /// <param name="isPersonal"> If <c>true</c>, returns only personal config stores. If <c>false</c>, returns only shared config stores. </param>
    /// <returns>A task representing the service response containing a list of configuration item details.</returns>
    Task<ServiceResponse<IEnumerable<ConfigStoreDto>>> GetConfigStoresAsync(bool isPersonal);

    /// <summary>
    /// Fetch config key-value pairs for a list of keys (full list if no keys provided)
    /// </summary>
    /// <param name="keys">The list of keys for which to fetch values.</param>
    /// <returns>A task representing the service response containing a list of key-value pairs.</returns>
    Task<ServiceResponse<IEnumerable<ConfigKeyValueDto>>> FetchConfigKeyValuePairsAsync(IEnumerable<string>? keys);

    /// <summary>
    /// Fetches a configuration item by its unique identifier.
    /// </summary>
    /// <param name="configStoreId">The identifier of the configuration item to retrieve.</param>
    /// <returns>A task representing the service response containing the details of the configuration item.</returns>
    Task<ServiceResponse<ConfigStoreDto>> GetConfigStoreByIdAsync(Guid configStoreId);

    /// <summary>
    /// Fetches a config store by its name.
    /// </summary>
    /// <param name="configStoreName">The name of the config store to retrieve.</param>
    /// <returns>A task representing the service response containing the details of the config store.</returns>
    Task<ServiceResponse<ConfigStoreDto>> GetConfigStoreByNameAsync(string configStoreName);

    /// <summary>
    /// Creates a new configuration item with the provided data.
    /// </summary>
    /// <param name="configStoreDto">The data needed to create the new configuration item.</param>
    /// <returns>A task representing the service response containing the details of the newly created configuration item.</returns>
    Task<ServiceResponse<ConfigStoreDto>> InsertConfigStoreAsync(ConfigStoreDto configStoreDto);

    /// <summary>
    /// Modifies an existing configuration item with the provided data.
    /// </summary>
    /// <param name="configStoreDto">The data required to update the configuration item.</param>
    /// <returns>A task representing the service response containing the updated configuration item details.</returns>
    Task<ServiceResponse<ConfigStoreDto>> UpdateConfigStoreAsync(ConfigStoreDto configStoreDto);

    /// <summary>
    /// Removes a configuration item by its identifier.
    /// </summary>
    /// <param name="configStoreId">The identifier of the configuration item to be deleted.</param>
    /// <returns>A task representing the service response indicating whether the configuration item was successfully deleted.</returns>
    Task<ServiceResponse<bool>> DeleteConfigStoreAsync(Guid configStoreId);

    /// <summary>
    /// Removes multiple configuration items by their identifiers.
    /// </summary>
    /// <param name="configStoreIds">The list of identifiers of the configuration items to delete.</param>
    /// <returns>A task representing the service response indicating whether the configuration items were successfully deleted.</returns>
    /// <remarks>
    /// This method is recommended for deleting multiple configuration items at once, reducing the number of server requests.
    /// </remarks>
    Task<ServiceResponse<bool>> DeleteConfigStoresAsync(IEnumerable<Guid> configStoreIds);

    /// <summary>
    /// Decrypts the value of an encrypted config store based on its ID.
    /// </summary>
    /// <param name="configStoreId">The unique identifier of the config store.</param>
    /// <returns>A response containing the decrypted value, or an error message if decryption fails.</returns>
    Task<ServiceResponse<string>> DecryptConfigStoreValueAsync(Guid configStoreId);

    /// <summary>
    /// Decrypts the value of an encrypted config store by its name within the current environment.
    /// </summary>
    /// <param name="configStoreName">The name of the config store to decrypt.</param>
    /// <returns>The task result contains the service response with the decrypted value.</returns>
    Task<ServiceResponse<string>> DecryptConfigStoreValueByNameAsync(string configStoreName);
}