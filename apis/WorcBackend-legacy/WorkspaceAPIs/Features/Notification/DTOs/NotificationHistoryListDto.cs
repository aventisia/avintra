namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a list of notification history rows for the current user.
/// </summary>
public class NotificationHistoryListDto
{
    /// <summary>
    /// Gets or sets the list of notification history records.
    /// </summary>
    public IEnumerable<NotificationHistoryDto> Items { get; set; } = [];
}
