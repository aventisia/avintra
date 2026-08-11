namespace WorkspaceAPIs.Services;

public interface INotificationHistoryService
{
    /// <summary>
    /// Retrieves a list of notification history rows for the current user, with optional filters.
    /// </summary>
    Task<ServiceResponse<NotificationHistoryListDto>> GetHistoryAsync(
        NotificationTypesEnum? type = null,
        NotificationSourceEnum? sourceType = null,
        bool? isRead = null,
        DateTimeOffset? from = null,
        DateTimeOffset? to = null);
}
