namespace WorkspaceAPIs.Services;

public interface IWebhookCallbackService
{
    /// <summary>
    /// Sends the job execution result to the callback URL configured on the webhook trigger, if any.
    /// This is a fire-and-forget call — errors are logged but not re-thrown.
    /// </summary>
    Task SendCallbackAsync(Job job);
}
