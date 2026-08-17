namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines the operations for managing queue user configuration items.
/// </summary>
public interface IQueueUserService
{
    /// <summary>
    /// Fetches all users associated with a specific queue.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation, containing a list of user details for the specified queue.</returns>
    Task<ServiceResponse<IEnumerable<QueuesTableDto>>> GetMyQueuesAsync(DateTimeOffset? from = null, DateTimeOffset? to = null);

    /// <summary>
    /// Fetches the Agent-type queues the user has access to.
    /// </summary>
    /// <param name="from">Optional start of the closed-item date range.</param>
    /// <param name="to">Optional end of the closed-item date range.</param>
    /// <returns>A task representing the service response containing a list of accessible agent queues.</returns>
    Task<ServiceResponse<IEnumerable<QueuesTableDto>>> GetMyAgentQueuesAsync(DateTimeOffset? from = null, DateTimeOffset? to = null);

    /// <summary>
    /// Retrieves all queue users associated with a specific queue.
    /// </summary>
    /// <param name="queueId">The identifier of the queue to fetch associated queue users.</param>
    /// <returns>A task representing the service response containing a list of queue user details.</returns>
    Task<ServiceResponse<IEnumerable<QueueUserDto>>> GetQueueUsersAsync(Guid queueId);

    /// <summary>
    /// Fetches a queue user by its unique identifier.
    /// </summary>
    /// <param name="queueUserId">The identifier of the queue user to retrieve.</param>
    /// <returns>A task representing the service response containing the details of the queue user.</returns>
    Task<ServiceResponse<QueueUserDto>> GetQueueUserByIdAsync(Guid queueUserId);

    /// <summary>
    /// Creates a new queue user with the provided data.
    /// </summary>
    /// <param name="queueUserDto">The data needed to create the new queue user.</param>
    /// <returns>A task representing the service response containing the details of the newly created queue user.</returns>
    Task<ServiceResponse<QueueUserDto>> InsertQueueUserAsync(QueueUserDto queueUserDto);

    /// <summary>
    /// Updates an existing queue user with the provided data.
    /// </summary>
    /// <param name="queueUserDto">The data required to update the queue user.</param>
    /// <returns>A task representing the service response containing the updated queue user details.</returns>
    Task<ServiceResponse<QueueUserDto>> UpdateQueueUserAsync(QueueUserDto queueUserDto);

    /// <summary>
    /// Deletes a queue user by its unique identifier.
    /// </summary>
    /// <param name="queueUserId">The identifier of the queue user to delete.</param>
    /// <returns>A task representing the service response indicating whether the queue user was successfully deleted.</returns>
    Task<ServiceResponse<bool>> DeleteQueueUserAsync(Guid queueUserId);

    /// <summary>
    /// Deletes multiple queue users by their unique identifiers.
    /// </summary>
    /// <param name="queueUserIds">A list of identifiers for the queue users to delete.</param>
    /// <returns>A task representing the service response indicating whether the queue users were successfully deleted.</returns>
    /// <remarks>
    /// This method is recommended for deleting multiple queue users at once, reducing the number of server requests.
    /// </remarks>
    Task<ServiceResponse<bool>> DeleteQueueUsersAsync(IEnumerable<Guid> queueUserIds);
}
