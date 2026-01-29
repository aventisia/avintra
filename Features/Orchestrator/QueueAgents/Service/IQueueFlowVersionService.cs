namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines the operations for managing queue flow version configuration items.
/// </summary>
public interface IQueueFlowVersionService
{
    /// <summary>
    /// Retrieves all queue flow versions associated with a specific queue.
    /// </summary>
    /// <param name="queueId">The identifier of the queue to fetch associated queue flow versions.</param>
    /// <returns>A task representing the service response containing a list of queue flow version details.</returns>
    Task<ServiceResponse<IEnumerable<QueueFlowVersionDto>>> GetQueueFlowVersionsAsync(Guid queueId);

    /// <summary>
    /// Fetches a queue flow version by its unique identifier.
    /// </summary>
    /// <param name="queueFlowVersionId">The identifier of the queue flow version to retrieve.</param>
    /// <returns>A task representing the service response containing the details of the queue flow version.</returns>
    Task<ServiceResponse<QueueFlowVersionDto>> GetQueueFlowVersionByIdAsync(Guid queueFlowVersionId);

    /// <summary>
    /// Creates a new queue flow version with the provided data.
    /// </summary>
    /// <param name="queueFlowVersionDto">The data needed to create the new queue flow version.</param>
    /// <returns>A task representing the service response containing the details of the newly created queue flow version.</returns>
    Task<ServiceResponse<QueueFlowVersionDto>> InsertQueueFlowVersionAsync(QueueFlowVersionDto queueFlowVersionDto);

    /// <summary>
    /// Updates an existing queue flow version with the provided data.
    /// </summary>
    /// <param name="queueFlowVersionDto">The data required to update the queue flow version.</param>
    /// <returns>A task representing the service response containing the updated queue flow version details.</returns>
    Task<ServiceResponse<QueueFlowVersionDto>> UpdateQueueFlowVersionAsync(QueueFlowVersionDto queueFlowVersionDto);

    /// <summary>
    /// Deletes a queue flow version by its unique identifier.
    /// </summary>
    /// <param name="queueFlowVersionId">The identifier of the queue flow version to delete.</param>
    /// <returns>A task representing the service response indicating whether the queue flow version was successfully deleted.</returns>
    Task<ServiceResponse<bool>> DeleteQueueFlowVersionAsync(Guid queueFlowVersionId);

    /// <summary>
    /// Deletes multiple queue flow versions by their unique identifiers.
    /// </summary>
    /// <param name="queueFlowVersionIds">A list of identifiers for the queue flow versions to delete.</param>
    /// <returns>A task representing the service response indicating whether the queue flow versions were successfully deleted.</returns>
    /// <remarks>
    /// This method is recommended for deleting multiple queue flow versions at once, reducing the number of server requests.
    /// </remarks>
    Task<ServiceResponse<bool>> DeleteQueueFlowVersionsAsync(IEnumerable<Guid> queueFlowVersionIds);
}