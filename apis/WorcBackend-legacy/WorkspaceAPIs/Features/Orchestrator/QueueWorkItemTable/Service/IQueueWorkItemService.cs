namespace WorkspaceAPIs.Services;

public interface IQueueWorkItemService
{
    /// <summary>
    /// Retrieve all work items associated with a specific queue.
    /// </summary>
    /// <param name="queueId">The unique identifier of the queue</param>
    /// <returns>A collection of work items related to the specified queue</returns>
    Task<ServiceResponse<IEnumerable<QueueWorkItemDto>>> GetAllWorkItemsAsync(Guid queueId);

    /// <summary>
    /// Retrieves a list of queue work items based on the specified filter request.
    /// </summary>
    /// <param name="queueFilterRequestDto">The filter request used to filter queue work items, including sorting and conditions.</param>
    /// <returns>The task result contains the service response with a list of filtered queue work items.</returns>
    /// <remarks>
    /// Use this method to get queue work items that match specific filter criteria, such as sorting and conditions.
    /// </remarks>
    Task<ServiceResponse<IEnumerable<QueueWorkItemDto>>> GetQueueWorkItemsAsync(QueueFilterRequestDto queueFilterRequestDto);

    /// <summary>
    /// Retrieves the next available work item from the specified queue and updates its status to indicate processing.
    /// </summary>
    /// <param name="queueFilterRequestDto">The filter criteria used to identify the target queue and determine the next work item to be retrieved.</param>
    /// <returns>A task containing the service response with the retrieved queue work item.</returns>
    /// <remarks>This method selects the next eligible work item based on the provided filter criteria, claims the item for processing, and updates its status accordingly.</remarks>
    Task<ServiceResponse<QueueWorkItemDto>> GetNextQueueWorkItemAsync(QueueFilterRequestDto queueFilterRequestDto);

    /// <summary>
    /// Retrieves the details of a specific queue work item by its unique identifier.
    /// </summary>
    /// <param name="queueWorkItemId">The ID of the queue work item to fetch.</param>
    /// <returns>The task result containing the service response with the details of the requested queue work item.</returns>
    Task<ServiceResponse<QueueWorkItemDto>> GetQueueWorkItemByIdAsync(Guid queueWorkItemId);

    /// <summary>
    /// Inserts single/multiple work items into the queue. Rejects the request with 409 when a retry would exceed the queue's MaximumRetryAttempts (0 means unbounded).
    /// </summary>
    /// <param name="queueWorkItemDto">Details of the work items to be added to the queue (PayloadData contains a list of work items)</param>
    /// <returns>A service response indicating whether the work items were successfully inserted</returns>
    Task<ServiceResponse<QueueWorkItemDto>> InsertWorkItemsAsync(QueueWorkItemDto queueWorkItemDto);

    /// <summary>
    /// Modify the payload data of an existing work item.
    /// </summary>
    /// <param name="queueWorkItemDto">The updated work item details, including the new status</param>
    /// <returns>The updated work item after payload data change</returns>
    Task<ServiceResponse<QueueWorkItemDto>> UpdateWorkItemAsync(QueueWorkItemDto queueWorkItemDto);

    /// <summary>
    /// Routes an existing work item to a specified destination queue.
    /// </summary>
    /// <param name="routeQueueWorkItemRequestDto"> Contains the work item identifier and the destination queue information. </param>
    /// <returns>
    /// A response indicating whether the work item was successfully route.
    /// </returns>
    Task<ServiceResponse<bool>> RouteWorkItemAsync(RouteQueueWorkItemRequestDto routeQueueWorkItemRequestDto);

    /// <summary>
    /// Delete a work item from the queue.
    /// </summary>
    /// <param name="workItemId">The unique identifier of the work item to be deleted</param>
    /// <returns>True if the work item was successfully deleted, otherwise false</returns>
    Task<ServiceResponse<bool>> RemoveWorkItemAsync(Guid workItemId);

    /// <summary>
    /// Deletes multiple queue work items by their IDs.
    /// </summary>
    /// <param name="queueWorkItemIds">The IDs of the queue work items to delete.</param>
    /// <returns>The task result contains the service response indicating whether the queue work items were successfully deleted.</returns>
    /// <remarks>
    /// It is recommended to use this method to delete multiple queue work items at once to reduce the number of requests to the server.
    /// </remarks>
    Task<ServiceResponse<bool>> DeleteQueueWorkItemsAsync(List<Guid> queueWorkItemIds);
}
