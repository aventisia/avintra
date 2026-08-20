namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines the operations for managing configuration items.
/// </summary>
public interface IVaultService
{
    /// <summary>
    /// Checks the availability of a vault name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the vault name to check.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> object with a <see cref="TrueFalseResultDto"/> indicating whether the vault name is available or not.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsVaultNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Fetches all configuration items associated with the current user.
    /// <param name="isPersonal"> If <c>true</c>, returns only personal vaults. If <c>false</c>, returns only shared vaults. </param>
    /// </summary>
    /// <returns>A task representing the service response containing a list of configuration item details.</returns>
    Task<ServiceResponse<IEnumerable<VaultDto>>> GetVaultsAsync(bool isPersonal);

    /// <summary>
    /// Fetches a configuration item by its unique identifier.
    /// </summary>
    /// <param name="vaultId">The identifier of the configuration item to retrieve.</param>
    /// <returns>A task representing the service response containing the details of the configuration item.</returns>
    Task<ServiceResponse<VaultDto>> GetVaultByIdAsync(Guid vaultId);

    /// <summary>
    /// Fetches a configuration item by its name within the current environment and tenant.
    /// </summary>
    /// <param name="vaultName">The name of the configuration item to retrieve.</param>
    /// <returns>A task representing the service response containing the details of the configuration item.</returns>
    Task<ServiceResponse<VaultDto>> GetVaultByNameAsync(string vaultName);

    /// <summary>
    /// Creates a new configuration item with the provided data.
    /// </summary>
    /// <param name="vaultDto">The data needed to create the new configuration item.</param>
    /// <returns>A task representing the service response containing the details of the newly created configuration item.</returns>
    Task<ServiceResponse<VaultDto>> InsertVaultAsync(VaultDto vaultDto);

    /// <summary>
    /// Modifies an existing configuration item with the provided data.
    /// </summary>
    /// <param name="vaultDto">The data required to update the configuration item.</param>
    /// <returns>A task representing the service response containing the updated configuration item details.</returns>
    Task<ServiceResponse<VaultDto>> UpdateVaultAsync(VaultDto vaultDto);

    /// <summary>
    /// Removes a configuration item by its identifier.
    /// </summary>
    /// <param name="vaultId">The identifier of the configuration item to be deleted.</param>
    /// <returns>A task representing the service response indicating whether the configuration item was successfully deleted.</returns>
    Task<ServiceResponse<bool>> DeleteVaultAsync(Guid vaultId);

    /// <summary>
    /// Removes multiple configuration items by their identifiers.
    /// </summary>
    /// <param name="vaultIds">The list of identifiers of the configuration items to delete.</param>
    /// <returns>A task representing the service response indicating whether the configuration items were successfully deleted.</returns>
    /// <remarks>
    /// This method is recommended for deleting multiple configuration items at once, reducing the number of server requests.
    /// </remarks>
    Task<ServiceResponse<bool>> DeleteVaultsAsync(IEnumerable<Guid> vaultIds);

    /// <summary>
    /// Retrieves the decrypted values (username and password) of an encrypted vault using its ID.
    /// </summary>
    /// <param name="vaultId">The unique identifier of the vault.</param>
    /// <returns>A response containing the decrypted vault data as a <see cref="VaultDto"/>, or an error message if the decryption process fails.</returns>
    Task<ServiceResponse<VaultDto>> RetrieveDecryptedVaultValueAsync(Guid vaultId);

    /// <summary>
    /// Retrieves the decrypted values (username and password) of an encrypted vault using its name within the current environment.
    /// </summary>
    /// <param name="vaultName">The name of the vault.</param>
    /// <returns>A response containing the decrypted vault data as a <see cref="VaultDto"/>, or an error message if the decryption process fails.</returns>
    Task<ServiceResponse<VaultDto>> RetrieveDecryptedVaultValueByNameAsync(string vaultName);
}
