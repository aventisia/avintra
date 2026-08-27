namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides operations for managing app secrets in a multi-tenant environment.
/// </summary>
public interface IAppSecretService
{
    /// <summary>
    /// Retrieves all app secrets in the system.
    /// </summary>
    /// <param name="isPersonal"> If <c>true</c>, returns only personal secrets. If <c>false</c>, returns only shared secrets. </param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a collection of <see cref="AppSecretDto"/>.
    /// </returns>
    Task<ServiceResponse<IEnumerable<AppSecretDto>>> GetAllAppSecretsAsync(bool isPersonal);

    /// <summary>
    /// Checks if a app secret name is available (not already taken).
    /// </summary>
    /// <param name="checkAvailabilityDto">DTO containing the app secret name to check.</param>
    /// <returns>A service response indicating whether the name is available.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsAppSecretNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Retrieves app secrets formatted as selectable options, typically used in dropdowns.
    /// </summary>
    /// <param name="type"> An optional <see cref="AppSecretTypesEnum"/> value to filter the secrets by type. If not provided, all secret types are included. </param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a collection of <see cref="SelectOption"/> representing available app secrets.
    /// </returns>
    Task<ServiceResponse<IEnumerable<SelectOption>>> GetSelectableAppSecretOptionsAsync(AppSecretTypesEnum? type);

    /// <summary>
    /// Retrieves details of a specific app secret by its ID.
    /// </summary>
    /// <param name="appSecretId">The unique identifier of the app secret.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the <see cref="AppSecretDto"/> if found.
    /// </returns>
    Task<ServiceResponse<AppSecretDto>> GetAppSecretByIdAsync(Guid appSecretId);

    /// <summary>
    /// Retrieves details of a specific app secret by its name.
    /// </summary>
    /// <param name="appSecretName">The name of the app secret.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the <see cref="AppSecretDto"/> if found.
    /// </returns>
    Task<ServiceResponse<AppSecretDto>> GetAppSecretByNameAsync(string appSecretName);

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

    /// <summary>
    /// Retrieves the details of a specific App Secret by its unique identifier.
    /// </summary>
    /// <param name="appSecretId">The unique identifier of the App Secret.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{AppSecretDto}"/> with the App Secret details.
    /// </returns>
    Task<ServiceResponse<AppSecretDto>> GetAppSecretDetailAsync(Guid appSecretId);

    /// <summary>
    /// Retrieves the details (with decrypted key-value pairs) of a specific App Secret by its name within the current environment.
    /// </summary>
    /// <param name="appSecretName">The name of the App Secret.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{AppSecretDto}"/> with the App Secret details.
    /// </returns>
    Task<ServiceResponse<AppSecretDto>> GetAppSecretDetailByNameAsync(string appSecretName);

    /// <summary>
    /// Mints a Corsair OAuth connect link for an App Secret so the user can complete consent.
    /// </summary>
    /// <param name="appSecretId">The App Secret Id (used as the Corsair tenant).</param>
    /// <returns>A service response containing the connect URL.</returns>
    Task<ServiceResponse<CorsairConnectLink>> CreateOAuthConnectLinkAsync(Guid appSecretId);

    /// <summary>
    /// Checks the Corsair OAuth connection status for an App Secret.
    /// </summary>
    /// <param name="appSecretId">The App Secret Id (used as the Corsair tenant).</param>
    /// <returns>A service response containing the connection status.</returns>
    Task<ServiceResponse<CorsairConnectionStatus>> GetOAuthConnectionStatusAsync(Guid appSecretId);
}
