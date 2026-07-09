namespace WorkspaceAPIs.Services;

public interface IExecutionNotificationService
{
    /// <summary>
    /// Sends a job completion notification to the user who initiated the job.
    /// </summary>
    /// <param name="userId">The ID of the user to notify.</param>
    /// <param name="jobId">The ID of the completed job.</param>
    /// <param name="status">The final status of the job.</param>
    /// <param name="message">Optional message to include with the notification.</param>
    Task NotifyExecutionCompletedAsync(Guid userId, Guid jobId, JobStatusEnum status, string? message = null);

    /// <summary>
    /// Sends a job progress update to the user who initiated the job.
    /// </summary>
    /// <param name="userId">The ID of the user to notify.</param>
    /// <param name="jobId">The ID of the job.</param>
    /// <param name="status">The current status of the job.</param>
    /// <param name="message">Optional progress message.</param>
    Task NotifyExecutionProgressAsync(Guid userId, Guid jobId, JobStatusEnum status, string? message = null);
}
