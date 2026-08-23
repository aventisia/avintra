namespace RunnerApp.Services;

/// <summary>
/// No-op fallback used on platforms without a notification implementation or when
/// notifications are disabled.
/// </summary>
public sealed class NullNotificationService : INotificationService
{
    public static INotificationService Instance { get; } = new NullNotificationService();

    public void NotifyJobStarted(Guid jobId, string flowName)
    {
        // Intentionally no-op.
    }

    public void NotifyJobFinished(Guid jobId, string flowName, string status, string? message = null)
    {
        // Intentionally no-op.
    }
}
