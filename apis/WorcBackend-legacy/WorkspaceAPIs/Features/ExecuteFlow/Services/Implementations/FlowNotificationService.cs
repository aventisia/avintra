namespace WorkspaceAPIs.Services;

public class FlowNotificationService : IFlowNotificationService
{
    private readonly IHubContext<FlowExecutionHub> _hubContext;
    private readonly ILogger<FlowNotificationService> _logger;

    public FlowNotificationService(
        IHubContext<FlowExecutionHub> hubContext,
        ILogger<FlowNotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    /// <summary>
    /// Sends a job completion notification to the user who initiated the job.
    /// </summary>
    public async Task NotifyExecutionCompletedAsync(Guid userId, Guid jobId, JobStatusTypesEnum status, string? message = null)
    {
        try
        {
            var notification = new
            {
                JobId = jobId,
                Status = status.ToString(),
                Message = message ?? $"Job execution {status.ToString().ToLower()}",
                Timestamp = DateTimeOffset.UtcNow
            };

            // Send to the specific user's group
            await _hubContext.Clients
                .Group($"user_{userId}")
                .SendAsync("JobCompleted", notification);

            _logger.LogInformation(
                "Job completion notification sent to user {UserId} for job {JobId} with status {Status}",
                userId, jobId, status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to send job completion notification to user {UserId} for job {JobId}",
                userId, jobId);
        }
    }

    /// <summary>
    /// Sends a job progress update to the user who initiated the job.
    /// </summary>
    public async Task NotifyExecutionProgressAsync(Guid userId, Guid jobId, JobStatusTypesEnum status, string? message = null)
    {
        try
        {
            var notification = new
            {
                JobId = jobId,
                Status = status.ToString(),
                Message = message,
                Timestamp = DateTimeOffset.UtcNow
            };

            // Send to the specific user's group
            await _hubContext.Clients
                .Group($"user_{userId}")
                .SendAsync("JobProgress", notification);

            _logger.LogInformation(
                "Job progress notification sent to user {UserId} for job {JobId} with status {Status}",
                userId, jobId, status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to send job progress notification to user {UserId} for job {JobId}",
                userId, jobId);
        }
    }
}
