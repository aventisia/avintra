namespace WorkspaceAPIs.Services;

public interface IUnreadNotificationService
{
    /// <summary>
    /// Retrieves a list of unread notifications asynchronously.
    /// </summary>
    /// <returns>A service response with a collection of unread notification DTOs.</returns>
    Task<ServiceResponse<IEnumerable<UnreadNotificationDto>>> GetUnreadNotificationsAsync();

    /// <summary>
    /// Marks a notification as read asynchronously.
    /// </summary>
    /// <param name="id">The ID of the notification to mark as read.</param>
    /// <returns>A result indicating whether the operation was successful or not.</returns>
    Task<ServiceResponse<bool>> MarkNotificationAsReadAsync(Guid id);
}