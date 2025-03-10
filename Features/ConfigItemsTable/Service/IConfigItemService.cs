namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines the operations for managing configuration items.
/// </summary>
public interface IConfigItemService
{
    /// <summary>
    /// Checks the availability of a config item name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the config item name to check.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> object with a <see cref="TrueFalseResultDto"/> indicating whether the config item name is available or not.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsConfigItemNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Fetches all configuration items associated with the current user.
    /// </summary>
    /// <returns>A task representing the service response containing a list of configuration item details.</returns>
    Task<ServiceResponse<IEnumerable<ConfigItemDto>>> GetConfigItemsAsync();

    /// <summary>
    /// Fetches a configuration item by its unique identifier.
    /// </summary>
    /// <param name="configItemId">The identifier of the configuration item to retrieve.</param>
    /// <returns>A task representing the service response containing the details of the configuration item.</returns>
    Task<ServiceResponse<ConfigItemDto>> GetConfigItemByIdAsync(Guid configItemId);

    /// <summary>
    /// Creates a new configuration item with the provided data.
    /// </summary>
    /// <param name="configItemDto">The data needed to create the new configuration item.</param>
    /// <returns>A task representing the service response containing the details of the newly created configuration item.</returns>
    Task<ServiceResponse<ConfigItemDto>> InsertConfigItemAsync(ConfigItemDto configItemDto);

    /// <summary>
    /// Modifies an existing configuration item with the provided data.
    /// </summary>
    /// <param name="configItemDto">The data required to update the configuration item.</param>
    /// <returns>A task representing the service response containing the updated configuration item details.</returns>
    Task<ServiceResponse<ConfigItemDto>> UpdateConfigItemAsync(ConfigItemDto configItemDto);

    /// <summary>
    /// Removes a configuration item by its identifier.
    /// </summary>
    /// <param name="configItemId">The identifier of the configuration item to be deleted.</param>
    /// <returns>A task representing the service response indicating whether the configuration item was successfully deleted.</returns>
    Task<ServiceResponse<bool>> DeleteConfigItemAsync(Guid configItemId);

    /// <summary>
    /// Removes multiple configuration items by their identifiers.
    /// </summary>
    /// <param name="configItemIds">The list of identifiers of the configuration items to delete.</param>
    /// <returns>A task representing the service response indicating whether the configuration items were successfully deleted.</returns>
    /// <remarks>
    /// This method is recommended for deleting multiple configuration items at once, reducing the number of server requests.
    /// </remarks>
    Task<ServiceResponse<bool>> DeleteConfigItemsAsync(IEnumerable<Guid> configItemIds);
    
    /// <summary>
    /// Decrypts the value of an encrypted config item based on its ID.
    /// </summary>
    /// <param name="configItemId">The unique identifier of the config item.</param>
    /// <returns>A response containing the decrypted value, or an error message if decryption fails.</returns>
    Task<ServiceResponse<string>> DecryptConfigItemValueAsync(Guid configItemId);
}