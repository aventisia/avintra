namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides operations for managing app secrets in a multi-tenant environment.
/// </summary>
public interface IAppSecretService
{
    /// <summary>
    /// Retrieves all app secrets in the system.
    /// </summary>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a collection of <see cref="AppSecretDto"/>.
    /// </returns>
    Task<ServiceResponse<IEnumerable<AppSecretDto>>> GetAllAppSecretsAsync();

    /// <summary>
    /// Checks if a app secret name is available (not already taken).
    /// </summary>
    /// <param name="checkAvailabilityDto">DTO containing the app secret name to check.</param>
    /// <returns>A service response indicating whether the name is available.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsAppSecretNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Retrieves app secrets formatted as selectable options, typically used in dropdowns.
    /// </summary>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a collection of <see cref="SelectOptionDto"/> representing available app secrets.
    /// </returns>
    Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetSelectableAppSecretOptionsAsync();

    /// <summary>
    /// Retrieves details of a specific app secret by its ID.
    /// </summary>
    /// <param name="appSecretId">The unique identifier of the app secret.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the <see cref="AppSecretDto"/> if found.
    /// </returns>
    Task<ServiceResponse<AppSecretDto>> GetAppSecretByIdAsync(Guid appSecretId);

    /// <summary>
    /// Creates a new app secret with the provided details.
    /// </summary>
    /// <param name="appSecretDto">The data required to create the new app secret.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the newly created <see cref="AppSecretDto"/>.
    /// </returns>
    Task<ServiceResponse<AppSecretDto>> CreateAppSecretAsync(AppSecretDto appSecretDto);

    /// <summary>
    /// Updates an existing app secret with the provided details.
    /// </summary>
    /// <param name="appSecretDto">The updated app secret data.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the updated <see cref="AppSecretDto"/>.
    /// </returns>
    Task<ServiceResponse<AppSecretDto>> UpdateAppSecretAsync(AppSecretDto appSecretDto);

    /// <summary>
    /// Deletes an app secret by its unique identifier.
    /// </summary>
    /// <param name="appSecretId">The ID of the app secret to delete.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result indicates whether the deletion was successful.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteAppSecretAsync(Guid appSecretId);

    /// <summary>
    /// Deletes multiple app secrets by their unique identifiers.
    /// </summary>
    /// <param name="appSecretIds">The list of app secret IDs to delete.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result indicates whether the batch deletion was successful.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteAppSecretsAsync(List<Guid> appSecretIds);
}
