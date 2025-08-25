namespace WorkspaceAPIs.Services;

public class QueueTransactionService : IQueueTransactionService
{
    private readonly ILogger<QueueTransactionService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly string _username;
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
        _username = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? string.Empty;

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
                    w.QueueId == queueId
                )
                .Include(i => i.Queue)
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
            // Retrieve queue with related transactions from the database
            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.Id == queueTransactionDto.QueueId)
                .Include(i => i.QueueTransactions)
                .SingleOrDefaultAsync();

            if (queue == null)
            {
                _logger.LogWarning("Queue not found for QueueId {QueueId}.", queueTransactionDto.QueueId);
                response.Message = "Queue not found.";
                return response;
            }

            _logger.LogInformation("Attempting to add a new transaction to the queue.");

            // Deserialize schema from JSON (case-insensitive), fallback to empty list if null/invalid
            var inputSchema = System.Text.Json.JsonSerializer.Deserialize<List<QueueSchemaDefinitionDto>>(
                queue.InputSchema ?? "[]",
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            ) ?? new List<QueueSchemaDefinitionDto>();

            var errors = new List<string>();

            // Parse incoming payload to JObject; fallback to empty JObject if null or empty
            var data = Newtonsoft.Json.Linq.JObject.Parse(queueTransactionDto.PayloadData ?? "{}");

            // Use HashSet to efficiently store existing unique keys and allow fast lookup for duplicates
            var existingUniqueKeys = new HashSet<string>();

            if (queue.QueueTransactions != null)
            {
                foreach (var transaction in queue.QueueTransactions)
                {
                    var payload = transaction.PayloadData;
                    if (string.IsNullOrWhiteSpace(payload))
                        continue;

                    if (queue.IsStoredEncrypted)
                        payload = _stringEncryptionService.DecryptString(transaction.PayloadData ?? string.Empty);

                    var obj = Newtonsoft.Json.Linq.JObject.Parse(payload);

                    // Build composite unique key based on fields flagged as unique in schema
                    var keyParts = inputSchema
                        .Where(w => w.IsUsedForUniqueData)
                        .Select(s =>
                        {
                            obj.TryGetValue(s.Name, out var val);
                            return val?.ToString() ?? string.Empty;
                        });

                    var uniqueKey = string.Join("|", keyParts);

                    existingUniqueKeys.Add(uniqueKey);
                }
            }

            // Validate incoming payload: required fields and uniqueness
            var uniqueKeyParts = new List<string>();

            foreach (var field in inputSchema)
            {
                var hasValue = data.TryGetValue(field.Name, out var value) && value != null && !string.IsNullOrWhiteSpace(value.ToString());

                // Check required fields and report errors if missing or empty
                if (field.IsRequired && !hasValue)
                {
                    var label = string.IsNullOrWhiteSpace(field.Label) ? field.Name : field.Label;
                    errors.Add($"Missing or empty required field: {label}");
                }

                // Collect parts for composite unique key if the field is marked unique and has a value
                if (field.IsUsedForUniqueData && hasValue)
                {
                    uniqueKeyParts.Add(value!.ToString()!);
                }
            }

            // Check if the new unique key already exists
            if (uniqueKeyParts.Any())
            {
                var newUniqueKey = string.Join("|", uniqueKeyParts);

                if (existingUniqueKeys.Contains(newUniqueKey))
                {
                    errors.Add("A transaction with the same unique field values already exists.");
                }
            }

            // Return accumulated errors immediately to avoid unnecessary processing
            if (errors.Any())
            {
                response.Message = string.Join("; ", errors);
                return response;
            }

            // Set created by if missing
            if (string.IsNullOrEmpty(queueTransactionDto.CreatedBy))
            {
                queueTransactionDto.CreatedBy = _username;
            }

            // Encrypt payload if queue requires encrypted storage
            if (queue.IsStoredEncrypted)
            {
                queueTransactionDto.PayloadData = _stringEncryptionService.EncryptString(queueTransactionDto.PayloadData ?? string.Empty);
            }

            // Map DTO to entity for persistence
            var newTransaction = queueTransactionDto.Adapt<QueueTransaction>();

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
                .SingleOrDefaultAsync();

            if (queueTransaction == null)
            {
                _logger.LogWarning("Transaction {TransactionId} not found for status update.", queueTransactionDto.Id);
                response.Message = "Queue transaction not found.";
                return response;
            }


            _logger.LogInformation("Attempting to add a new transaction to the queue.");

            // Deserialize schema from JSON (case-insensitive), fallback to empty list if null/invalid
            var inputSchema = System.Text.Json.JsonSerializer.Deserialize<List<QueueSchemaDefinitionDto>>(
                queueTransaction.Queue.InputSchema ?? "[]",
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            ) ?? new List<QueueSchemaDefinitionDto>();

            var errors = new List<string>();

            // Parse incoming payload to JObject; fallback to empty JObject if null or empty
            var data = Newtonsoft.Json.Linq.JObject.Parse(queueTransactionDto.PayloadData ?? "{}");

            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.Id == queueTransaction.QueueId)
                .AsNoTracking()
                .Include(i => i.QueueTransactions)
                .FirstOrDefaultAsync();

            // Use HashSet to efficiently store existing unique keys and allow fast lookup for duplicates
            var existingUniqueKeys = new HashSet<string>();

            if (queue.QueueTransactions != null)
            {
                foreach (var transaction in queue.QueueTransactions)
                {
                    var payload = transaction.PayloadData;
                    if (string.IsNullOrWhiteSpace(payload))
                        continue;

                    if (queue.IsStoredEncrypted)
                        payload = _stringEncryptionService.DecryptString(transaction.PayloadData ?? string.Empty);

                    var obj = Newtonsoft.Json.Linq.JObject.Parse(payload);

                    // Build composite unique key based on fields flagged as unique in schema
                    var keyParts = inputSchema
                        .Where(w => w.IsUsedForUniqueData)
                        .Select(s =>
                        {
                            obj.TryGetValue(s.Name, out var val);
                            return val?.ToString() ?? string.Empty;
                        });

                    var uniqueKey = string.Join("|", keyParts);

                    existingUniqueKeys.Add(uniqueKey);
                }
            }

            // Validate incoming payload: required fields and uniqueness
            var uniqueKeyParts = new List<string>();

            foreach (var field in inputSchema)
            {
                var hasValue = data.TryGetValue(field.Name, out var value) && value != null && !string.IsNullOrWhiteSpace(value.ToString());

                // Check required fields and report errors if missing or empty
                if (field.IsRequired && !hasValue)
                {
                    var label = string.IsNullOrWhiteSpace(field.Label) ? field.Name : field.Label;
                    errors.Add($"Missing or empty required field: {label}");
                }

                // Collect parts for composite unique key if the field is marked unique and has a value
                if (field.IsUsedForUniqueData && hasValue)
                {
                    uniqueKeyParts.Add(value!.ToString()!);
                }
            }

            // Check if the new unique key already exists
            if (uniqueKeyParts.Any())
            {
                var newUniqueKey = string.Join("|", uniqueKeyParts);

                if (existingUniqueKeys.Contains(newUniqueKey))
                {
                    errors.Add("A transaction with the same unique field values already exists.");
                }
            }

            // Return accumulated errors immediately to avoid unnecessary processing
            if (errors.Any())
            {
                response.Message = string.Join("; ", errors);
                return response;
            }

            // Set created by if missing
            if (string.IsNullOrEmpty(queueTransactionDto.CreatedBy))
            {
                queueTransactionDto.CreatedBy = _username;
            }

            // Encrypt payload if queue requires encrypted storage
            if (queueTransaction.Queue.IsStoredEncrypted)
            {
                queueTransactionDto.PayloadData = _stringEncryptionService.EncryptString(queueTransactionDto.PayloadData ?? string.Empty);
            }

            // Update the queue transaction
            queueTransactionDto.Adapt(queueTransaction);
            queueTransaction.LastModifiedOn = DateTimeOffset.UtcNow;

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