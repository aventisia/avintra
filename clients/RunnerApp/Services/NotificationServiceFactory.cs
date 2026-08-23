namespace RunnerApp.Services;

/// <summary>
/// Factory that creates the notification service for the runner. Windows 11 toast
/// notifications are enabled by default and can be disabled via configuration if needed.
/// </summary>
public static class NotificationServiceFactory
{
    /// <summary>
    /// Creates the notification service.
    /// </summary>
    /// <param name="enabled">When false, returns a no-op service.</param>
    public static INotificationService Create(bool enabled = true)
    {
        if (!enabled)
            return NullNotificationService.Instance;

        try
        {
            return new WindowsNotificationService("Avintra Runner");
        }
        catch (Exception ex)
        {
            DebugLog.Warn($"Could not initialize Windows toast notifications: {ex.Message}");
            return NullNotificationService.Instance;
        }
    }
}
