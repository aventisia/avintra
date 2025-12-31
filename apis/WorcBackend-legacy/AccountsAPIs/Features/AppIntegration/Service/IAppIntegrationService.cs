namespace AccountsAPIs.Services;

/// <summary>
/// Provides operations for managing app integrations in a multi-tenant environment.
/// </summary>
public interface IAppIntegrationService
{
    /// <summary>
    /// Retrieves all app integrations in the system.
    /// </summary>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a collection of <see cref="AppIntegrationDto"/>.
    /// </returns>
    Task<ServiceResponse<IEnumerable<AppIntegrationDto>>> GetAllAppIntegrationsAsync();

    /// <summary>
    /// Retrieves details of a specific app integration by its ID.
    /// </summary>
    /// <param name="appIntegrationId">The unique identifier of the app integration.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the <see cref="AppIntegrationDto"/> if found.
    /// </returns>
    Task<ServiceResponse<AppIntegrationDto>> GetAppIntegrationByIdAsync(Guid appIntegrationId);

    /// <summary>
    /// Creates a new app integration with the provided details.
    /// </summary>
    /// <param name="appIntegrationDto">The data required to create the new app integration.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the newly created <see cref="AppIntegrationDto"/>.
    /// </returns>
    Task<ServiceResponse<AppIntegrationDto>> CreateAppIntegrationAsync(AppIntegrationDto appIntegrationDto);

    /// <summary>
    /// Updates an existing app integration with the provided details.
    /// </summary>
    /// <param name="appIntegrationDto">The updated app integration data.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the updated <see cref="AppIntegrationDto"/>.
    /// </returns>
    Task<ServiceResponse<AppIntegrationDto>> UpdateAppIntegrationAsync(AppIntegrationDto appIntegrationDto);

    /// <summary>
    /// Deletes an app integration by its unique identifier.
    /// </summary>
    /// <param name="appIntegrationId">The ID of the app integration to delete.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result indicates whether the deletion was successful.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteAppIntegrationAsync(Guid appIntegrationId);

    /// <summary>
    /// Deletes multiple app integrations by their unique identifiers.
    /// </summary>
    /// <param name="appIntegrationIds">The list of app integration IDs to delete.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result indicates whether the batch deletion was successful.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteAppIntegrationsAsync(List<Guid> appIntegrationIds);
}