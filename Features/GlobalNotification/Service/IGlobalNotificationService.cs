namespace WorkspaceAPIs.Services;

/// <summary>
/// Represents a service for managing global notifications.
/// </summary>
/// <remarks>
/// Only mannualy added notification will be managed by this service.
/// </remarks>
public interface IGlobalNotificationService
{
    /// <summary>
    /// Retrieves a global notification by its ID.
    /// </summary>
    /// <param name="id">The ID of the global notification to retrieve.</param>
    /// <returns>The task result contains the service response with the retrieved global notification.</returns>
    Task<ServiceResponse<GlobalNotificationDto>> GetGlobalNotificationAsync(Guid id);

    /// <summary>
    /// Retrieves list of global notifications.
    /// </summary>
    /// <returns>The task result contains the service response with the list of global notifications.</returns>
    Task<ServiceResponse<IEnumerable<GlobalNotificationDto>>> GetGlobalNotificationsAsync();

    /// <summary>
    /// Inserts a new global notification.
    /// </summary>
    /// <param name="globalNotificationDto">The DTO containing the data for the new global notification.</param>
    /// <returns>The task result contains the service response with the inserted global notification.</returns>
    Task<ServiceResponse<GlobalNotificationDto>> InsertGlobalNotificationAsync(GlobalNotificationDto globalNotificationDto);

    /// <summary>
    /// Updates an existing global notification. This operation is only allowed within 10 minutes of creation.
    /// </summary>
    /// <param name="globalNotificationDto">The DTO containing the updated data for the global notification.</param>
    /// <returns>The task result contains the service response with the updated global notification.</returns>
    Task<ServiceResponse<GlobalNotificationDto>> UpdateGlobalNotificationAsync(GlobalNotificationDto globalNotificationDto);

    /// <summary>
    /// Deletes a global notification by its ID. This operation is only allowed within 10 minutes of creation.
    /// </summary>
    /// <param name="id">The ID of the global notification to delete.</param>
    /// <returns>The task result contains the service response indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteGlobalNotificationAsync(Guid id);
}
