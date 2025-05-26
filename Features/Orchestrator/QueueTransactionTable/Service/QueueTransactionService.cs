namespace WorkspaceAPIs.Services;

public class QueueTransactionService : IQueueTransactionService
{
    private readonly ILogger<QueueTransactionService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly IStringEncryptionService _stringEncryptionService;
    private readonly FileUploadConfig _fileUploadConfig;

    public QueueTransactionService(
        ILogger<QueueTransactionService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor, IStringEncryptionService stringEncryptionService,
        FileUploadConfig fileUploadConfig)
    {
        // Extract the user ID from the HTTP context (user's UID)
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _stringEncryptionService = stringEncryptionService;
        _fileUploadConfig = fileUploadConfig;
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
                .GetByConditionAsync(w =>
                    w.QueueId == queueId && w.CreatedByUserId == _userId
                )
                .Include(i => i.Queue)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
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

    // Retrieves a specific queue transaction by its ID.
    public async Task<ServiceResponse<QueueTransactionDto>> GetQueueTransactionByIdAsync(Guid queueTransactionId)
    {
        var serviceResponse = new ServiceResponse<QueueTransactionDto>
        {
            Data = null,
            Message = "Failed to retrieve queue transaction. Please try again later."
        };

        try
        {
            // Retrieve the specific queue transaction including related data
            var queueTransaction = await _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(w => w.Id == queueTransactionId)
                .Include(i => i.Queue)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            // Check if the transaction was found
            if (queueTransaction == null)
            {
                _logger.LogInformation("Queue transaction with ID {QueueTransactionId} not found.", queueTransactionId);
                serviceResponse.Message = "Queue transaction not found.";
                return serviceResponse;
            }

            // Map entity to DTO and update response
            serviceResponse.Data = queueTransaction.Adapt<QueueTransactionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue transaction retrieved successfully.";

            _logger.LogInformation("Queue transaction with ID {QueueTransactionId} retrieved successfully.", queueTransactionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving the queue transaction with ID {QueueTransactionId}.", queueTransactionId);
        }

        return serviceResponse;
    }


    // Retrieves a specific queue transaction by its ID.
    public async Task<ServiceResponse<QueueTransactionDto>> GetQueueWorkItemByQueueIdAsync(Guid queueId)
    {
        var serviceResponse = new ServiceResponse<QueueTransactionDto>
        {
            Data = null,
            Message = "Failed to retrieve queue work item. Please try again later."
        };

        try
        {
            // Retrieve the specific queue transaction including related data
            var queueTransaction = await _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(w => w.QueueId == queueId)
                .Include(i => i.Queue)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            // Check if the transaction was found
            if (queueTransaction == null)
            {
                _logger.LogInformation("Queue work item with Q ID {QueueId} not found.", queueId);
                serviceResponse.Message = "Queue transaction not found.";
                return serviceResponse;
            }

            // Map entity to DTO and update response
            serviceResponse.Data = queueTransaction.Adapt<QueueTransactionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue work item retrieved successfully.";

            _logger.LogInformation("Queue work item with Q ID {QueueId} retrieved successfully.", queueId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving the queue work item with Q ID {QueueId}.", queueId);
        }

        return serviceResponse;
    }

    // Add a new transaction (work item) to the queue
    public async Task<ServiceResponse<QueueTransactionDto>> InsertTransactionAsync(QueueTransactionDto queueTransactionDto)
    {
        var response = new ServiceResponse<QueueTransactionDto>
        {
            Data = null,
            Message = "Failed to add the transaction. Please try again."
        };

        try
        {
            var queue = await _unitOfWork.QueueRepo.GetByConditionAsync(w => w.Id == queueTransactionDto.QueueId).SingleOrDefaultAsync();

            if (queue == null)
            {
                _logger.LogWarning("Queue not found for QueueId {QueueId}.", queueTransactionDto.QueueId);
                response.Message = "Queue not found.";
                return response;
            }

            _logger.LogInformation("Attempting to add a new transaction to the queue.");

            //TODO: Add here validation to check uniqueness
            // Check if a transaction with the specified queue I exists
            // var existingTransaction = await _unitOfWork.QueueTransactionRepo
            //     .GetByConditionAsync(w =>
            //         w.QueueID == queueTransactionDto.QueueId
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

            if (string.IsNullOrWhiteSpace(queue.SpecificDataSchemaPath))
            {
                _logger.LogWarning("specific data for queue work not found for QueueId {QueueId}.", queueTransactionDto.QueueId);
                response.Message = $"specific data for queue work not found for QueueId {queueTransactionDto.QueueId}.";
                return response;
            }

            var inputJson = await File.ReadAllTextAsync(Path.Combine(_fileUploadConfig.UploadDirectory, queue.SpecificDataSchemaPath));
            if (string.IsNullOrWhiteSpace(inputJson))
            {
                _logger.LogWarning("specific data for queue work not found for QueueId {QueueId}.", queueTransactionDto.QueueId);
                response.Message = $"specific data for queue work not found for QueueId {queueTransactionDto.QueueId}.";
                return response;
            }

            if (!string.IsNullOrWhiteSpace(queueTransactionDto.PayloadData))
            {
                // Validate object
                var isValidArray = inputJson.ValidateJsonArrayWithFromShema(queueTransactionDto.PayloadData, out var errors);

                if (errors.Count > 0 || !isValidArray)
                {
                    _logger.LogWarning("errors occured while validating the work items array for QueueId {QueueId}. errors {Errors}.", queueTransactionDto.QueueId, string.Join(", ", errors));
                    response.Message = $"errors occured while validating the work items array for QueueId {queueTransactionDto.QueueId}.errors {string.Join(", ", errors)}";
                    return response;
                }

                if (queue.IsUniqueReferencesEnforced && !queueTransactionDto.PayloadData.AreJsonObjectsUnique(out var duplicates))
                {
                    _logger.LogWarning("duplicate work items are not allowed for QueueId {QueueId}. errors {Errors}.", queueTransactionDto.QueueId, string.Join(", ", duplicates.Select(k => $"{k.Key} found {k.Value} time(s)")));
                    response.Message = $"duplicate work items are not allowed for QueueId {queueTransactionDto.QueueId}.errors {string.Join(", ", duplicates.Select(k => $"{k.Key} found {k.Value} time(s)"))}";
                    return response;
                }

                if (queue.IsStoredEncrypted)
                {
                    newTransaction.PayloadData = _stringEncryptionService.EncryptString(queueTransactionDto.PayloadData);
                }
            }


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
            _logger.LogInformation($"Successfully added a new transaction to queue {queueTransactionDto.QueueId} by user {_userId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while adding a transaction to queue {QueueId}.", queueTransactionDto.QueueId);
        }

        return response;
    }

    // Update the status of an existing transaction
    public async Task<ServiceResponse<QueueTransactionDto>> UpdateTransactionStatusAsync(QueueTransactionDto queueTransactionDto)
    {
        var response = new ServiceResponse<QueueTransactionDto>
        {
            Data = null,
            Message = "Failed to update queue transaction status. Please try again."
        };

        try
        {
            _logger.LogInformation("Attempting to update the transaction status.");

            // Retrieve the transaction by ID
            var queueTransaction = await _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(w => w.Id == queueTransactionDto.Id)
                .Include(i => i.Queue)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .SingleOrDefaultAsync();

            if (queueTransaction == null)
            {
                _logger.LogWarning("Transaction {TransactionId} not found for status update.", queueTransactionDto.Id);
                response.Message = "Queue transaction not found.";
                return response;
            }


            if (string.IsNullOrWhiteSpace(queueTransaction.Queue.SpecificDataSchemaPath))
            {
                _logger.LogWarning("specific data for queue work not found for QueueId {QueueId}.", queueTransactionDto.QueueId);
                response.Message = $"specific data for queue work not found for QueueId {queueTransactionDto.QueueId}.";
                return response;
            }

            var inputJson = await File.ReadAllTextAsync(Path.Combine(_fileUploadConfig.UploadDirectory, queueTransaction.Queue.SpecificDataSchemaPath));
            if (string.IsNullOrWhiteSpace(inputJson))
            {
                _logger.LogWarning("specific data for queue work not found for QueueId {QueueId}.", queueTransactionDto.QueueId);
                response.Message = $"specific data for queue work not found for QueueId {queueTransactionDto.QueueId}.";
                return response;
            }


            var queuePayloadData = queueTransaction.Queue.IsStoredEncrypted ? _stringEncryptionService.DecryptString(queueTransaction.PayloadData) : queueTransaction.PayloadData;
            if (!string.IsNullOrWhiteSpace(queueTransactionDto.PayloadData))
            {
                // Validate object
                var isValidArray = inputJson.ValidateJsonArrayWithFromShema(queueTransactionDto.PayloadData, out var errors);

                if (errors.Count > 0 || !isValidArray)
                {
                    _logger.LogWarning("errors occured while validating the work items array for QueueId {QueueId}. errors {Errors}.", queueTransactionDto.QueueId, string.Join(", ", errors));
                    response.Message = $"errors occured while validating the work items array for QueueId {queueTransactionDto.QueueId}.errors {string.Join(", ", errors)}";
                    return response;
                }

                if (string.IsNullOrWhiteSpace(queuePayloadData))
                {
                    queuePayloadData = queueTransactionDto.PayloadData;
                }
                else
                {
                    var mergedPayloadData = inputJson.ValidateAndJoinJsonArrays(queueTransactionDto.PayloadData, queuePayloadData, out var combinedErrors);

                    if (combinedErrors.Count > 0 || string.IsNullOrWhiteSpace(mergedPayloadData))
                    {
                        _logger.LogWarning("errors occured while merging and validating the work items array for QueueId {QueueId}. errors {Errors}.", queueTransactionDto.QueueId, string.Join(", ", combinedErrors));
                        response.Message = $"errors occured while merging and validating the work items array for QueueId {queueTransactionDto.QueueId}.errors {string.Join(", ", combinedErrors)}";
                        return response;
                    }
                    queuePayloadData = queueTransaction.Queue.IsStoredEncrypted ? _stringEncryptionService.EncryptString(mergedPayloadData) : mergedPayloadData;
                }

                if (queueTransaction.Queue.IsUniqueReferencesEnforced && !queueTransactionDto.PayloadData.AreJsonObjectsUnique(out var duplicates))
                {
                    _logger.LogWarning("duplicate work items are not allowed for QueueId {QueueId}. errors {Errors}.", queueTransactionDto.QueueId, string.Join(", ", duplicates.Select(k => $"{k.Key} found {k.Value} time(s)")));
                    response.Message = $"duplicate work items are not allowed for QueueId {queueTransactionDto.QueueId}.errors {string.Join(", ", duplicates.Select(k => $"{k.Key} found {k.Value} time(s)"))}";
                    return response;
                }
            }


            // Update the queue transaction
            queueTransactionDto.Adapt(queueTransaction);
            queueTransaction.LastModifiedByUserId = _userId;
            queueTransaction.PayloadData = _stringEncryptionService.EncryptString(queuePayloadData);

            _unitOfWork.QueueTransactionRepo.Update(queueTransaction);

            // Commit the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to commit changes while updating transaction status.");
                return response;
            }

            // Successfully updated the transaction status
            response.Data = queueTransaction.Adapt<QueueTransactionDto>();
            response.StatusCode = 200;
            response.Message = "Queue transaction status updated successfully.";
            _logger.LogInformation($"Transaction {queueTransactionDto.Id} status changed to {queueTransactionDto.Status}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating the status for transaction {TransactionId}.", queueTransactionDto.Id);
        }

        return response;
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
                .GetByConditionAsync(w => w.Id == transactionId)
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

    // Deletes multiple queue transactions based on provided IDs.
    public async Task<ServiceResponse<bool>> DeleteQueueTransactionsAsync(List<Guid> queueTransactionIds)
    {
        // Initialize the response as a failed operation by default
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Unable to delete queue transactions. Please try again."
        };

        try
        {
            // Fetch queue transactions that match the provided IDs
            var queueTransactions = await _unitOfWork.QueueTransactionRepo
                                                     .GetByConditionAsync(w => queueTransactionIds.Contains(w.Id))
                                                     .ToListAsync();

            // If no matching transactions are found, return early
            if (queueTransactions.Count == 0)
            {
                _logger.LogInformation("No matching queue transactions found for deletion.");
                serviceResponse.Message = "No queue transactions found for the given IDs.";
                return serviceResponse;
            }

            // Perform deletion
            _unitOfWork.QueueTransactionRepo.Delete(queueTransactions);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save changes to the database after attempting to delete queue transactions.");
                return serviceResponse;
            }

            // Deletion was successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{queueTransactions.Count} queue transaction(s) successfully deleted.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An exception occurred while deleting queue transactions.");
        }

        return serviceResponse;
    }
}