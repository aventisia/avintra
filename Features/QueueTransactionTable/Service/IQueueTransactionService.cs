namespace WorkspaceAPIs.Services;

public interface IQueueTransactionService
{
    /// <summary>
    /// Retrieve all transactions associated with a specific queue.
    /// </summary>
    /// <param name="queueId">The unique identifier of the queue</param>
    /// <returns>A collection of transactions related to the specified queue</returns>
    Task<ServiceResponse<IEnumerable<QueueTransactionDto>>> GetAllTransactionsAsync(Guid? queueId);

    /// <summary>
    /// Create a new work item within the queue.
    /// </summary>
    /// <param name="queueTransactionDto">Details of the transaction to be added</param>
    /// <returns>The transaction that was successfully added to the queue</returns>
    Task<ServiceResponse<QueueTransactionDto>> InsertTransactionAsync(QueueTransactionDto queueTransactionDto);

    /// <summary>
    /// Modify the status of an existing transaction (e.g., Pending → In Progress → Completed/Failed).
    /// </summary>
    /// <param name="queueTransactionDto">The updated transaction details, including the new status</param>
    /// <returns>The updated transaction after status change</returns>
    Task<ServiceResponse<QueueTransactionDto>> UpdateTransactionStatusAsync(QueueTransactionDto queueTransactionDto);

    /// <summary>
    /// Delete a transaction (work item) from the queue.
    /// </summary>
    /// <param name="transactionId">The unique identifier of the transaction to be deleted</param>
    /// <returns>True if the transaction was successfully deleted, otherwise false</returns>
    Task<ServiceResponse<bool>> RemoveTransactionAsync(Guid transactionId);
}