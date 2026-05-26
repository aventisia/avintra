namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines a service for managing queue operations.
/// </summary>
public interface IQueueTableService
{

    /// Checks the availability of a queue name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the queue name to check.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> object with a <see cref="TrueFalseResultDto"/> indicating whether the queue name is available or not.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsQueueNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Retrieves all queues.
    /// </summary>
    /// <param name="isPersonal"> If <c>true</c>, returns only personal queues. If <c>false</c>, returns only shared queues. </param>
    /// <returns>The task result containing the service response with a list of queue details.</returns>
    Task<ServiceResponse<IEnumerable<QueuesTableDto>>> GetAllQueuesAsync(bool isPersonal);

    /// <summary>
    /// Searches for queues by name.
    /// </summary>
    /// <param name="queueName"> Search keyword. </param>
    /// <param name="isPersonal"> If <c>true</c>, returns only personal queues. If <c>false</c>, returns only shared queues. </param>
    /// <returns>A task with the service response containing matching queues.</returns>
    Task<ServiceResponse<IEnumerable<QueuesTableDto>>> SearchQueuesAsync(string queueName, bool isPersonal);

    /// <summary>
    /// Retrieves the details of a specific queue by its unique identifier.
    /// </summary>
    /// <param name="id">The ID of the queue to fetch.</param>
    /// <returns>The task result containing the service response with the details of the requested queue.</returns>
    Task<ServiceResponse<QueuesTableDto>> GetQueueByIdAsync(Guid id);

    /// <summary>
    /// Creates a new queue with the specified details.
    /// </summary>
    /// <param name="queuesTableDto">The data used to create the new queue.</param>
    /// <returns>The task result containing the service response with the details of the created queue.</returns>
    Task<ServiceResponse<QueuesTableDto>> InsertQueueAsync(QueuesTableDto queuesTableDto);

    /// <summary>
    /// Updates an existing queue with the provided details.
    /// </summary>
    /// <param name="queuesTableDto">The data used to update the queue.</param>
    /// <returns>The task result containing the service response with the updated queue details.</returns>
    Task<ServiceResponse<QueuesTableDto>> UpdateQueueAsync(QueuesTableDto queuesTableDto);

    /// <summary>
    /// Deletes a queue by its unique identifier.
    /// </summary>
    /// <param name="queueId">The ID of the queue to delete.</param>
    /// <returns>The task result containing the service response indicating whether the queue was successfully deleted.</returns>
    Task<ServiceResponse<bool>> DeleteQueueAsync(Guid queueId);

    /// <summary>
    /// Deletes multiple queues by their IDs.
    /// </summary>
    /// <param name="queueIds">The IDs of the queues to delete.</param>
    /// <returns>The task result contains the service response indicating whether the queues were successfully deleted.</returns>
    /// <remarks>
    /// It is recommended to use this method to delete multiple queues at once to reduce the number of requests to the server.
    /// </remarks>
    Task<ServiceResponse<bool>> DeleteQueuesAsync(List<Guid> queueIds);

    /// <summary>
    /// Assign a set of agents to a specified queue.
    /// </summary>
    /// <param name="queueId">The ID of the queue to whom the agents will be assigned.</param>
    /// <param name="agentIds">A collection of agent IDs to be assigned to the queue.</param>
    /// <returns>A service response indicating whether the operation was successful.</returns>
    Task<ServiceResponse<bool>> AssignAgentsAsync(Guid queueId, IEnumerable<Guid> agentIds);

    /// <summary>
    /// Fetch all agents currently assigned to a specified queue.
    /// </summary>
    /// <param name="queueId">The ID of the queue whose assigned agents are to be retrieved.</param>
    /// <returns>A service response containing a list of agents assigned to the queue.</returns>
    Task<ServiceResponse<IEnumerable<AssignAgentQueueDto>>> GetAgentsAsync(Guid queueId);

    /// <summary>
    /// Assign a set of users to a specified queue.
    /// </summary>
    /// <param name="queueId">The ID of the queue to whom the users will be assigned.</param>
    /// <param name="userIds">A collection of user IDs to be assigned to the queue.</param>
    /// <returns>A service response indicating whether the operation was successful.</returns>
    Task<ServiceResponse<bool>> AssignUsersAsync(Guid queueId, IEnumerable<Guid> userIds);

    /// <summary>
    /// Fetch all users currently assigned to a specified queue.
    /// </summary>
    /// <param name="queueId">The ID of the queue whose assigned users are to be retrieved.</param>
    /// <returns>A service response containing a list of users assigned to the queue.</returns>
    Task<ServiceResponse<IEnumerable<AssignUserQueueDto>>> GetUsersAsync(Guid queueId);
}