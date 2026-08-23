namespace RunnerApp.Services;

/// <summary>
/// Platform-agnostic notification contract used by the runner to surface job lifecycle
/// events (start, completion, failure, abort) to the local user. Implementations can be
/// no-ops, Windows toast notifications, or future Linux/macOS variants.
/// </summary>
public interface INotificationService
{
    /// <summary>
    /// Show a notification that a job has started executing on this machine.
    /// </summary>
    void NotifyJobStarted(Guid jobId, string flowName);

    /// <summary>
    /// Show a notification that a job has reached a terminal state.
    /// </summary>
    /// <param name="status">Terminal status string, e.g. Completed, Failed, Aborted.</param>
    /// <param name="message">Optional detail message.</param>
    void NotifyJobFinished(Guid jobId, string flowName, string status, string? message = null);
}
