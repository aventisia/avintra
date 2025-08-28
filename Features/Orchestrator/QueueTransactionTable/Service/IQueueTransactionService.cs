namespace WorkspaceAPIs.Services;

public interface IQueueTransactionService
{
    /// <summary>
    /// Retrieve all transactions associated with a specific queue.
    /// </summary>
    /// <param name="queueId">The unique identifier of the queue</param>
    /// <returns>A collection of transactions related to the specified queue</returns>
    Task<ServiceResponse<IEnumerable<QueueTransactionDto>>> GetAllTransactionsAsync(Guid queueId);

    /// <summary>
    /// Retrieves the details of a specific queue transaction by its unique identifier.
    /// </summary>
    /// <param name="queueTransactionId">The ID of the queue transaction to fetch.</param>
    /// <returns>The task result containing the service response with the details of the requested queue transaction.</returns>
    Task<ServiceResponse<QueueTransactionDto>> GetQueueTransactionByIdAsync(Guid queueTransactionId);

    /// <summary>
    /// Inserts multiple transactions into the queue.
    /// </summary>
    /// <param name="queueTransactionDto">Details of the transactions to be added to the queue (PayloadData contains a list of transactions)</param>
    /// <returns>A service response indicating whether the transactions were successfully inserted</returns>
    Task<ServiceResponse<bool>> InsertMultipleTransactionsAsync(QueueTransactionDto queueTransactionDto);
    
    /// <summary>
    /// Modify the status of an existing transaction (e.g., Pending → In Progress → Completed/Failed).
    /// </summary>
    /// <param name="queueTransactionDto">The updated transaction details, including the new status</param>
    /// <returns>The updated transaction after status change</returns>
    Task<ServiceResponse<QueueTransactionDto>> UpdateTransactionStatusAsync(QueueTransactionDto queueTransactionDto);

    /// <summary>
    /// Modify the payload data of an existing transaction.
    /// </summary>
    /// <param name="queueTransactionDto">The updated transaction details, including the new status</param>
    /// <returns>The updated transaction after status change</returns>
    Task<ServiceResponse<QueueTransactionDto>> UpdateTransactionDataAsync(QueueTransactionDto queueTransactionDto);

    /// <summary>
    /// Delete a transaction (work item) from the queue.
    /// </summary>
    /// <param name="transactionId">The unique identifier of the transaction to be deleted</param>
    /// <returns>True if the transaction was successfully deleted, otherwise false</returns>
    Task<ServiceResponse<bool>> RemoveTransactionAsync(Guid transactionId);

    /// <summary>
    /// Deletes multiple queue transactions by their IDs.
    /// </summary>
    /// <param name="queueTransactionIds">The IDs of the queue transactions to delete.</param>
    /// <returns>The task result contains the service response indicating whether the queue transactions were successfully deleted.</returns>
    /// <remarks>
    /// It is recommended to use this method to delete multiple queue transactions at once to reduce the number of requests to the server.
    /// </remarks>
    Task<ServiceResponse<bool>> DeleteQueueTransactionsAsync(List<Guid> queueTransactionIds);
}