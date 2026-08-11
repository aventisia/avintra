namespace WorkspaceAPIs.Services;

public interface INotificationService
{
    /// <summary>
    /// Retrieves a notification by its ID.
    /// </summary>
    Task<ServiceResponse<NotificationDto>> GetNotificationAsync(Guid id);

    /// <summary>
    /// Retrieves a list of notifications.
    /// </summary>
    Task<ServiceResponse<IEnumerable<NotificationDto>>> GetNotificationsAsync();

    /// <summary>
    /// Inserts a new notification.
    /// </summary>
    Task<ServiceResponse<NotificationDto>> InsertNotificationAsync(CreateNotificationDto createNotificationDto);

    /// <summary>
    /// Updates an existing notification. Only allowed while the notification has not been sent.
    /// </summary>
    Task<ServiceResponse<NotificationDto>> UpdateNotificationAsync(CreateNotificationDto createNotificationDto, Guid id);

    /// <summary>
    /// Deletes a notification by its ID. Only allowed while the notification has not been sent.
    /// </summary>
    Task<ServiceResponse<bool>> DeleteNotificationAsync(Guid id);

    /// <summary>
    /// Deletes multiple notifications by their IDs. Only allowed while the notifications have not been sent.
    /// </summary>
    Task<ServiceResponse<int>> DeleteMultipleNotificationsAsync(IEnumerable<Guid> ids);

    /// <summary>
    /// Retrieves the recipient users of a notification (used to prefill the edit form).
    /// </summary>
    Task<ServiceResponse<IEnumerable<AppUserBaseDto>>> GetNotificationRecipientsAsync(Guid id);
}
