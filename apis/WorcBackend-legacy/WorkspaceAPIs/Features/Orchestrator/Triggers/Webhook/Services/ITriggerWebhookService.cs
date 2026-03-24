/// <summary>
/// Provides functionality for processing webhook requests
/// and triggering job execution based on incoming events.
/// </summary>
public interface ITriggerWebhookService
{
    /// <summary>
    /// Creates a job based on the provided trigger identifier received from a webhook.
    /// </summary>
    /// <param name="triggerId">
    /// The unique identifier of the message trigger.
    /// </param>
    /// <returns>
    /// A <see cref="ServiceResponse{T}"/> indicating whether the job was created successfully.
    /// </returns>
    Task<ServiceResponse<bool>> CreateJobByTriggerIdAsync(string triggerId);
}