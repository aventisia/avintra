namespace WorkspaceAPIs.Services;

public interface IQueueTransactionEventService
{
    /// <summary>
    /// Retrieves all events associated with the specified queue transaction.
    /// </summary>
    /// <param name="queueTransactionId">The unique identifier of the queue transaction.</param>
    /// <returns>
    /// A service response containing the collection of events associated with the specified queue transaction.
    /// </returns>
    Task<ServiceResponse<IEnumerable<QueueTransactionEventDto>>> GetQueueTransactionEventsAsync(Guid queueTransactionId);

    /// <summary>
    /// Retrieves the details of a specific queue transaction event by its unique identifier.
    /// </summary>
    /// <param name="queueTransactionEventId">The unique identifier of the queue transaction event.</param>
    /// <returns>
    /// A service response containing the details of the requested queue transaction event.
    /// </returns>
    Task<ServiceResponse<QueueTransactionEventDto>> GetQueueTransactionEventByIdAsync(Guid queueTransactionEventId);

    /// <summary>
    /// Creates a new event for a queue transaction.
    /// </summary>
    /// <param name="queueTransactionEventDto">
    /// The details of the queue transaction event to be created.
    /// </param>
    /// <returns>
    /// A service response containing the newly created queue transaction event.
    /// </returns>
    Task<ServiceResponse<QueueTransactionEventDto>> CreateQueueTransactionEventAsync(QueueTransactionEventDto queueTransactionEventDto);

    /// <summary>
    /// Updates an existing queue transaction event.
    /// </summary>
    /// <param name="queueTransactionEventDto">
    /// The updated details of the queue transaction event.
    /// </param>
    /// <returns>
    /// A service response containing the updated queue transaction event.
    /// </returns>
    Task<ServiceResponse<QueueTransactionEventDto>> UpdateQueueTransactionEventAsync(QueueTransactionEventDto queueTransactionEventDto);

    /// <summary>
    /// Deletes a queue transaction event.
    /// </summary>
    /// <param name="queueTransactionEventId">
    /// The unique identifier of the queue transaction event to delete.
    /// </param>
    /// <returns>
    /// A service response indicating whether the queue transaction event was successfully deleted.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteQueueTransactionEventAsync(Guid queueTransactionEventId);

    /// <summary>
    /// Deletes multiple queue transaction events by their unique identifiers.
    /// </summary>
    /// <param name="queueTransactionEventIds">
    /// The collection of queue transaction event identifiers to delete.
    /// </param>
    /// <returns>
    /// A service response indicating whether the queue transaction events were successfully deleted.
    /// </returns>
    /// <remarks>
    /// This method is intended for bulk deletion to reduce the number of requests sent to the server.
    /// </remarks>
    Task<ServiceResponse<bool>> DeleteQueueTransactionEventsAsync(List<Guid> queueTransactionEventIds);
}