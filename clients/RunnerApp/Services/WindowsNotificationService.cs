using Microsoft.Toolkit.Uwp.Notifications;

namespace RunnerApp.Services;

/// <summary>
/// Windows 10/11 toast notification implementation. Uses the Microsoft.Toolkit.Uwp.Notifications
/// package so it works from unpackaged console/service apps without needing a UWP app identity.
/// </summary>
public sealed class WindowsNotificationService : INotificationService
{
    private readonly string _appDisplayName;

    public WindowsNotificationService(string appDisplayName)
    {
        _appDisplayName = appDisplayName;
    }

    public void NotifyJobStarted(Guid jobId, string flowName)
    {
        try
        {
            new ToastContentBuilder()
                .AddText($"Job started: {flowName}")
                .AddText($"Job {ShortJobId(jobId)} is now running on this machine.")
                .AddAttributionText(_appDisplayName)
                .Show();
        }
        catch (Exception ex)
        {
            DebugLog.Warn($"Failed to show job-started toast: {ex.Message}");
        }
    }

    public void NotifyJobFinished(Guid jobId, string flowName, string status, string? message = null)
    {
        try
        {
            var (title, body) = status.ToLowerInvariant() switch
            {
                "completed" => ($"Job completed: {flowName}", $"Job {ShortJobId(jobId)} finished successfully."),
                "aborted" => ($"Job aborted: {flowName}", $"Job {ShortJobId(jobId)} was aborted. {message}"),
                _ => ($"Job failed: {flowName}", $"Job {ShortJobId(jobId)} failed. {message}")
            };

            new ToastContentBuilder()
                .AddText(title)
                .AddText(body.Trim())
                .AddAttributionText(_appDisplayName)
                .Show();
        }
        catch (Exception ex)
        {
            DebugLog.Warn($"Failed to show job-finished toast: {ex.Message}");
        }
    }

    private static string ShortJobId(Guid jobId) => jobId.ToString()[..8];
}
