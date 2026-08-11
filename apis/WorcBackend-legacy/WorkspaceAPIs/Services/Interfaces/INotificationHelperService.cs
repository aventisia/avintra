namespace WorkspaceAPIs.Services;

public interface INotificationHelperService
{
    /// <summary>
    /// Adds the specified users to the notification. SaveAsync required separately.
    /// </summary>
    /// <param name="notificationId">The ID of the notification.</param>
    /// <param name="userIds">The IDs of the users to be added.</param>
    /// <returns>A boolean value indicating whether the operation was successful.</returns>
    Task<bool> AddNotificationUsers(Guid notificationId, List<Guid> userIds);

    /// <summary>
    /// Adds the specified users to the notification, explicitly assigning the tenant of the
    /// NotificationUser rows. Used by the Super Admin flow where a single notification is
    /// delivered to users across multiple tenants. SaveAsync required separately.
    /// </summary>
    /// <param name="notificationId">The ID of the notification.</param>
    /// <param name="tenantId">The tenant to stamp on the NotificationUser rows.</param>
    /// <param name="userIds">The IDs of the users to be added.</param>
    /// <returns>A boolean value indicating whether the operation was successful.</returns>
    Task<bool> AddNotificationUsers(Guid notificationId, Guid tenantId, List<Guid> userIds);

    /// <summary>
    /// Updates the users associated with a notification. SaveAsync required separately.
    /// </summary>
    /// <param name="notificationId">The ID of the notification.</param>
    /// <param name="userIds">The IDs of the users to associate with the notification.</param>
    /// <returns>A boolean indicating whether the update was successful.</returns>
    Task<bool> UpdateNotificationUsers(Guid notificationId, List<Guid> userIds);
}