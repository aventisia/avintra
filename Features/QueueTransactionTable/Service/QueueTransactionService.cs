namespace WorkspaceAPIs.Services;

public class QueueTransactionService : IQueueTransactionService
{
    private readonly ILogger<QueueTransactionService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public QueueTransactionService(
        ILogger<QueueTransactionService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Extract the user ID from the HTTP context (user's UID)
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieve all transactions for a specific queue
    public async Task<ServiceResponse<IEnumerable<QueueTransactionDto>>> GetAllTransactionsAsync(Guid queueId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<QueueTransactionDto>>
        {
            Data = null,
            Message = "Failed to retrieve queue transactions. Please try again later."
        };

        try
        {
            // Query the transactions for the specified queue
            var queueTransactions = await _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(t => t.QueueID == queueId)
                .Include(q => q.Queue)
                .OrderBy(o => o.CreatedOn)
                .AsNoTracking()
                .ToListAsync();

            // On success, populate the response with the data
            serviceResponse.Data = queueTransactions.Adapt<IEnumerable<QueueTransactionDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Successfully retrieved queue transactions.";
            _logger.LogInformation($"Successfully retrieved {queueTransactions.Count} transactions for queue {queueId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching transactions for queue {QueueId}.", queueId);
        }

        return serviceResponse;
    }

    // Add a new transaction (work item) to the queue
    public async Task<ServiceResponse<QueueTransactionDto>> InsertTransactionAsync(Guid queueId, QueueTransactionDto queueTransactionDto)
    {
        var response = new ServiceResponse<QueueTransactionDto>
        {
            Data = null,
            Message = "Failed to add the transaction. Please try again."
        };

        try
        {
            _logger.LogInformation("Attempting to add a new transaction to the queue.");

            // Check if a transaction with the specified queue I exists
            // var existingTransaction = await _unitOfWork.QueueTransactionRepo
            //     .GetByConditionAsync(t =>
            //         t.QueueID == queueId
            //     )
            //     .SingleOrDefaultAsync();

            // if (existingTransaction != null)
            // {
            //     _logger.LogWarning("Queue transaction {TransactionId} not found for status update.", queueTransactionDto.Id);
            //     response.Message = "Queue transaction already exists.";
            //     return response;
            // }

            // Map the DTO to an entity and set necessary properties
            var newTransaction = queueTransactionDto.Adapt<QueueTransaction>();
            newTransaction.CreatedByUserId = _userId;
            newTransaction.LastModifiedByUserId = _userId;

            // Insert the new transaction into the repository
            await _unitOfWork.QueueTransactionRepo.InsertAsync(newTransaction);

            // Commit the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save the new queue transaction.");
                return response;
            }

            // Successfully added the transaction
            response.Data = newTransaction.Adapt<QueueTransactionDto>();
            response.StatusCode = 200;
            response.Message = "Queue transaction successfully added.";
            _logger.LogInformation($"Successfully added a new transaction to queue {queueId} by user {_userId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while adding a transaction to queue {QueueId}.", queueId);
        }

        return response;
    }

    // Update the status of an existing transaction
    public async Task<ServiceResponse<QueueTransactionDto>> UpdateTransactionStatusAsync(QueueTransactionDto queueTransactionDto)
    {
        var serviceResponse = new ServiceResponse<QueueTransactionDto>
        {
            Data = null,
            Message = "Failed to update queue transaction status. Please try again."
        };

        try
        {
            _logger.LogInformation("Attempting to update the transaction status.");

            // Retrieve the transaction by ID
            var queueTransaction = await _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(t => t.Id == queueTransactionDto.Id)
                .SingleOrDefaultAsync();

            if (queueTransaction == null)
            {
                _logger.LogWarning("Transaction {TransactionId} not found for status update.", queueTransactionDto.Id);
                serviceResponse.Message = "Queue transaction not found.";
                return serviceResponse;
            }

            // Update the queue transaction
            queueTransactionDto.Adapt(queueTransaction);
            queueTransaction.LastModifiedByUserId = _userId;

            // Commit the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to commit changes while updating transaction status.");
                return serviceResponse;
            }

            // Successfully updated the transaction status
            serviceResponse.Data = queueTransaction.Adapt<QueueTransactionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue transaction status updated successfully.";
            _logger.LogInformation($"Transaction {queueTransactionDto.Id} status changed to {queueTransactionDto.Status}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating the status for transaction {TransactionId}.", queueTransactionDto.Id);
        }

        return serviceResponse;
    }

    // Delete a transaction (work item) from the queue
    public async Task<ServiceResponse<bool>> RemoveTransactionAsync(Guid transactionId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to remove queue transaction. Please try again."
        };

        try
        {
            _logger.LogInformation("Attempting to remove a transaction from the queue.");

            // Retrieve the transaction to be deleted
            var queueTransaction = await _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(t => t.Id == transactionId)
                .SingleOrDefaultAsync();

            if (queueTransaction == null)
            {
                _logger.LogWarning("Transaction {TransactionId} not found for deletion.", transactionId);
                serviceResponse.Message = "Queue transaction not found.";
                return serviceResponse;
            }

            // Delete the transaction from the queue
            _unitOfWork.QueueTransactionRepo.Delete(queueTransaction);

            // Commit the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to commit changes while removing transaction {TransactionId}.", transactionId);
                return serviceResponse;
            }

            // Successfully removed the transaction
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue transaction removed successfully.";
            _logger.LogInformation($"Successfully removed transaction {transactionId} from queue.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while removing transaction {TransactionId} from queue.", transactionId);
        }

        return serviceResponse;
    }
}