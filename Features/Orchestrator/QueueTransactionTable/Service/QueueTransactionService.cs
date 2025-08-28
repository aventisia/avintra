namespace WorkspaceAPIs.Services;

public class QueueTransactionService : IQueueTransactionService
{
    private readonly ILogger<QueueTransactionService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly string _username;
    private readonly IStringEncryptionService _stringEncryptionService;

    public QueueTransactionService(
        ILogger<QueueTransactionService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor, IStringEncryptionService stringEncryptionService)
    {
        // Extract the user ID from the HTTP context (user's UID)
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _username = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? string.Empty;

        _logger = logger;
        _unitOfWork = unitOfWork;
        _stringEncryptionService = stringEncryptionService;
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

    // Retrieve all transactions for a specific queue using provided filter criteria
    public async Task<ServiceResponse<IEnumerable<QueueTransactionDto>>> FindAllTransactionsAsync(FindQueueTransactionQuery queueTransactionQuery)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<QueueTransactionDto>>
        {
            Data = null,
            Message = "Failed to retrieve queue transactions. Please try again later."
        };

        try
        {
            Queue? queue = null;

            // Determine whether to search by queue name or ID
            if (!string.IsNullOrEmpty(queueTransactionQuery.QueueName))
            {
                queue = await _unitOfWork.QueueRepo
                    .GetByConditionAsync(q => q.Name.ToLower() == queueTransactionQuery.QueueName.ToLower())
                    .FirstOrDefaultAsync();

                _logger.LogInformation("Looking up queue by name: {QueueName}", queueTransactionQuery.QueueName);
            }
            else
            {
                queue = await _unitOfWork.QueueRepo
                    .GetByConditionAsync(q => q.Id == queueTransactionQuery.QueueId)
                    .FirstOrDefaultAsync();

                _logger.LogInformation("Looking up queue by ID: {QueueId}", queueTransactionQuery.QueueId);
            }

            // If queue not found, return with error
            if (queue == null)
            {
                serviceResponse.Message = "Queue not found with the specified identifier.";
                _logger.LogWarning("Queue not found for Name: {QueueName}, ID: {QueueId}", queueTransactionQuery.QueueName, queueTransactionQuery.QueueId);
                return serviceResponse;
            }

            // Build query for queue transactions
            var query = _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(t => t.QueueId == queue.Id);

            // Apply optional filters
            if (queueTransactionQuery.Status.HasValue)
            {
                query = query.Where(t => t.Status == queueTransactionQuery.Status.Value);
            }

            if (queueTransactionQuery.Date.HasValue)
            {
                query = query.Where(t => t.CreatedOn.Date == queueTransactionQuery.Date.Value.Date);
            }

            // if (queueTransactionQuery.Priority.HasValue)
            // {
            //     query = query.Where(t => t.Priority == queueTransactionQuery.Priority.Value);
            // }

            // Execute query
            var queueTransactions = await query
                .Include(t => t.Queue)
                .OrderBy(t => t.CreatedOn)
                .AsNoTracking()
                .ToListAsync();

            // Success response
            serviceResponse.Data = queueTransactions.Adapt<IEnumerable<QueueTransactionDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Successfully retrieved queue transactions.";

            _logger.LogInformation("Retrieved {Count} transactions for Queue ID: {QueueId}", queueTransactions.Count, queue.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching transactions for queue. Name: {QueueName}, ID: {QueueId}",
                queueTransactionQuery.QueueName, queueTransactionQuery.QueueId);
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

    // Inserts a multiple new transaction into a specified queue, validating against the schema, enforcing uniqueness, and handling encryption if necessary.
    public async Task<ServiceResponse<bool>> InsertMultipleTransactionsAsync(QueueTransactionDto queueTransactionDto)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to add transactions. Please try again later."
        };

        try
        {
            // Retrieve the queue by ID or name (case-insensitive), including its associated transactions
            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w =>
                    string.IsNullOrEmpty(queueTransactionDto.QueueName)
                        ? w.Id == queueTransactionDto.QueueId
                        : w.Name.ToLower() == queueTransactionDto.QueueName.ToLower()
                )
                .Include(i => i.QueueTransactions)
                .SingleOrDefaultAsync();

            if (queue == null)
            {
                _logger.LogWarning("Insert failed: Queue with ID {QueueId} was not found.", queueTransactionDto.QueueId);
                serviceResponse.Message = "Specified queue does not exist.";
                return serviceResponse;
            }

            _logger.LogInformation("Initiating transaction insertion into queue with ID {QueueId}.", queueTransactionDto.QueueId);

            // Deserialize the queue's input schema from JSON; use an empty list if schema is missing or invalid
            var inputSchema = System.Text.Json.JsonSerializer.Deserialize<List<QueueSchemaDefinitionDto>>(
                queue.InputSchema ?? "[]",
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            ) ?? new List<QueueSchemaDefinitionDto>();

            // Collect existing unique keys from stored transactions for duplicate detection
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

                    var keyParts = inputSchema
                        .Where(w => w.IsUsedForUniqueIdentifier)
                        .Select(s =>
                        {
                            obj.TryGetValue(s.Name, out var val);
                            return val?.ToString() ?? string.Empty;
                        });

                    var uniqueKey = string.Join("|", keyParts);
                    existingUniqueKeys.Add(uniqueKey);
                }
            }

            // List to store successful transactions
            var newTransactions = new List<QueueTransaction>();
            var errors = new List<string>();

            // Deserialize PayloadData as a list of objects
            var dataArray = Newtonsoft.Json.Linq.JArray.Parse(queueTransactionDto.PayloadData ?? "[]");

            // Iterate over each data entry in the PayloadData
            foreach (var dataItem in dataArray)
            {
                var obj = dataItem as Newtonsoft.Json.Linq.JObject;

                if (obj == null) continue;

                dynamic dynamicObject = CreateDynamicObjectFromSchema(inputSchema);

                var uniqueKeyParts = new List<string>();

                // To store the field names and values for the error message
                var uniqueFields = new List<string>();

                foreach (var field in inputSchema)
                {
                    // Now you can use TryGetValue on the JObject
                    var hasValue = obj.TryGetValue(field.Name, out var value) &&
                                   value != null &&
                                   !string.IsNullOrWhiteSpace(value.ToString());

                    // Validate required fields
                    if (field.IsRequired && !hasValue)
                    {
                        var label = string.IsNullOrWhiteSpace(field.Label) ? field.Name : field.Label;
                        errors.Add($"Missing required field: {label}");
                    }

                    // Build the new unique key if applicable
                    if (field.IsUsedForUniqueIdentifier && queue.IsUniqueReferencesEnforced && hasValue)
                    {
                        uniqueKeyParts.Add(value!.ToString()!);

                        // Add field name and value to the list
                        uniqueFields.Add($"{field.Name}: {value}");
                    }

                    // Populate the dynamic object with provided values
                    ((IDictionary<string, object>)dynamicObject)[field.Name] = value!;
                }

                // Check for duplicate unique key
                if (queue.IsUniqueReferencesEnforced && uniqueKeyParts.Any())
                {
                    var newUniqueKey = string.Join("|", uniqueKeyParts);

                    if (existingUniqueKeys.Contains(newUniqueKey, StringComparer.InvariantCultureIgnoreCase))
                    {
                        // Include the unique property names and their values in the error message
                        var uniqueFieldsStr = string.Join(", ", uniqueFields);
                        errors.Add($"A transaction with the same unique values already exists in the queue. Conflicting values: {uniqueFieldsStr}");
                        continue;
                    }
                    existingUniqueKeys.Add(newUniqueKey);
                }

                // Serialize the dynamic object back into JSON for PayloadData
                queueTransactionDto.PayloadData = JsonConvert.SerializeObject(dynamicObject, Formatting.Indented);

                // Assign the creator if not already provided
                if (string.IsNullOrEmpty(queueTransactionDto.CreatedBy))
                {
                    queueTransactionDto.CreatedBy = _username;
                }

                // Encrypt the payload if the queue requires secure storage
                if (queue.IsStoredEncrypted)
                {
                    queueTransactionDto.PayloadData = _stringEncryptionService.EncryptString(queueTransactionDto.PayloadData ?? string.Empty);
                }

                // Map the DTO to an entity for database insertion
                var newTransaction = queueTransactionDto.Adapt<QueueTransaction>();
                newTransaction.Status = QueueTransactionStatusTypesEnum.InProgress;
                newTransactions.Add(newTransaction);
            }

            if (newTransactions.Any())
            {            // Insert the new transaction
                await _unitOfWork.QueueTransactionRepo.InsertAsync(newTransactions);

                // Persist changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Database commit failed after inserting transactions into queue {QueueId}.", queueTransactionDto.QueueId);
                    return serviceResponse;
                }
            }
            // If we have errors, return them
            if (errors.Any())
            {
                serviceResponse.Message = string.Join("; ", errors);
                _logger.LogWarning("Transaction validation failed: {Errors}", serviceResponse.Message);
            }
            else
            {
                serviceResponse.Message = "Transactions added to the queue successfully.";
            }

            // Successful insertion
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            _logger.LogInformation("Successfully added transactions to queue {QueueId}.", queueTransactionDto.QueueId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while adding transactions to queue {QueueId}.", queueTransactionDto.QueueId);
        }

        return serviceResponse;
    }

    // Updates the status and payload of an existing queue transaction, including validation, uniqueness checks, encryption handling, and database persistence.
    public async Task<ServiceResponse<QueueTransactionDto>> UpdateTransactionStatusAsync(QueueTransactionDto queueTransactionDto)
    {
        var serviceResponse = new ServiceResponse<QueueTransactionDto>
        {
            Data = null,
            Message = "Failed to update queue transaction status. Please try again."
        };

        try
        {
            _logger.LogInformation("Initiating update for transaction ID {TransactionId}.", queueTransactionDto.Id);

            // Retrieve the transaction with its associated queue
            var queueTransaction = await _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(w => w.Id == queueTransactionDto.Id)
                .Include(i => i.Queue)
                .SingleOrDefaultAsync();

            if (queueTransaction == null)
            {
                _logger.LogWarning("Transaction ID {TransactionId} not found. Update aborted.", queueTransactionDto.Id);
                serviceResponse.Message = "Transaction not found.";
                return serviceResponse;
            }

            // Retrieve the full queue details including all transactions for uniqueness validation
            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.Id == queueTransaction.QueueId)
                .Include(i => i.QueueTransactions)
                .FirstOrDefaultAsync();

            if (queue == null)
            {
                _logger.LogWarning("Queue ID {QueueId} associated with transaction {TransactionId} not found.", queueTransaction.QueueId, queueTransactionDto.Id);
                serviceResponse.Message = "Associated queue not found.";
                return serviceResponse;
            }

            // Update the existing queue transaction entity with values from the DTO
            queueTransaction.Status = queueTransactionDto.Status;
            queueTransaction.LastModifiedOn = DateTimeOffset.UtcNow;

            // Mark the transaction as updated
            _unitOfWork.QueueTransactionRepo.Update(queueTransaction);

            // Persist changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist transaction status update for ID {TransactionId}.", queueTransactionDto.Id);
                return serviceResponse;
            }

            // Return successful response
            serviceResponse.Data = queueTransaction.Adapt<QueueTransactionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Transaction status updated successfully.";
            _logger.LogInformation("Transaction ID {TransactionId} successfully updated. New status: {Status}.", queueTransactionDto.Id, queueTransactionDto.Status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while updating transaction ID {TransactionId}.", queueTransactionDto.Id);
        }

        return serviceResponse;
    }

    // Updates the status and payload of an existing queue transaction, including validation, uniqueness checks, encryption handling, and database persistence.
    public async Task<ServiceResponse<QueueTransactionDto>> UpdateTransactionDataAsync(QueueTransactionDto queueTransactionDto)
    {
        var serviceResponse = new ServiceResponse<QueueTransactionDto>
        {
            Data = null,
            Message = "Failed to update queue transaction status. Please try again."
        };

        try
        {
            _logger.LogInformation("Initiating update for transaction ID {TransactionId}.", queueTransactionDto.Id);

            // Retrieve the transaction with its associated queue
            var queueTransaction = await _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(w => w.Id == queueTransactionDto.Id)
                .Include(i => i.Queue)
                .SingleOrDefaultAsync();

            if (queueTransaction == null)
            {
                _logger.LogWarning("Transaction ID {TransactionId} not found. Update aborted.", queueTransactionDto.Id);
                serviceResponse.Message = "Transaction not found.";
                return serviceResponse;
            }

            // Retrieve the full queue details including all transactions for uniqueness validation
            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.Id == queueTransaction.QueueId)
                .Include(i => i.QueueTransactions)
                .FirstOrDefaultAsync();

            if (queue == null)
            {
                _logger.LogWarning("Queue ID {QueueId} associated with transaction {TransactionId} not found.", queueTransaction.QueueId, queueTransactionDto.Id);
                serviceResponse.Message = "Associated queue not found.";
                return serviceResponse;
            }

            // Deserialize the queue's input schema; fall back to empty list if schema is invalid or null
            var inputSchema = System.Text.Json.JsonSerializer.Deserialize<List<QueueSchemaDefinitionDto>>(
                queue.InputSchema ?? "[]",
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            ) ?? new List<QueueSchemaDefinitionDto>();

            // Generate a dynamic object based on the schema
            dynamic dynamicObject = CreateDynamicObjectFromSchema(inputSchema);

            var errors = new List<string>();

            // Parse the incoming payload; fall back to an empty object if null or malformed
            var data = Newtonsoft.Json.Linq.JObject.Parse(queueTransactionDto.PayloadData ?? "{}");

            // Extract existing unique keys from the queue's transactions to ensure uniqueness
            var existingUniqueKeys = new HashSet<string>();
            if (queue.QueueTransactions != null)
            {
                foreach (var transaction in queue.QueueTransactions.Where(w => w.Id != queueTransaction.Id).ToList())
                {
                    var payload = transaction.PayloadData;
                    if (string.IsNullOrWhiteSpace(payload)) continue;

                    if (queue.IsStoredEncrypted)
                        payload = _stringEncryptionService.DecryptString(payload);

                    var obj = Newtonsoft.Json.Linq.JObject.Parse(payload);

                    var keyParts = inputSchema
                        .Where(w => w.IsUsedForUniqueIdentifier)
                        .Select(s =>
                        {
                            obj.TryGetValue(s.Name, out var val);
                            return val?.ToString() ?? string.Empty;
                        });

                    var uniqueKey = string.Join("|", keyParts);
                    existingUniqueKeys.Add(uniqueKey);
                }
            }

            // Construct the unique key from the incoming payload and validate fields
            var uniqueKeyParts = new List<string>();

            foreach (var field in inputSchema)
            {
                var hasValue = data.TryGetValue(field.Name, out var value) &&
                               value != null &&
                               !string.IsNullOrWhiteSpace(value.ToString());

                // Check for missing required fields
                if (field.IsRequired && !hasValue)
                {
                    var label = string.IsNullOrWhiteSpace(field.Label) ? field.Name : field.Label;
                    errors.Add($"Missing required field: {label}");
                }

                // Build the composite unique key
                if (field.IsUsedForUniqueIdentifier && queue.IsUniqueReferencesEnforced && hasValue)
                {
                    uniqueKeyParts.Add(value!.ToString()!);
                }

                // Populate the dynamic object with payload values
                ((IDictionary<string, object>)dynamicObject)[field.Name] = value!;
            }

            // Check if the constructed unique key already exists in the queue
            if (queue.IsUniqueReferencesEnforced && uniqueKeyParts.Any())
            {
                var newUniqueKey = string.Join("|", uniqueKeyParts);

                if (existingUniqueKeys.Contains(newUniqueKey, StringComparer.InvariantCultureIgnoreCase))
                {
                    errors.Add("A transaction with the same unique field values already exists in the queue.");
                }
            }

            // Serialize the validated dynamic object back to JSON
            queueTransactionDto.PayloadData = JsonConvert.SerializeObject(dynamicObject, Formatting.Indented);

            // Set the creator username if not already set
            if (string.IsNullOrEmpty(queueTransactionDto.CreatedBy))
            {
                queueTransactionDto.CreatedBy = _username;
            }

            // Encrypt payload if required
            if (queue.IsStoredEncrypted)
            {
                queueTransactionDto.PayloadData = _stringEncryptionService.EncryptString(queueTransactionDto.PayloadData ?? string.Empty);
            }

            // Update the existing queue transaction entity with values from the DTO
            queueTransaction.PayloadData = queueTransactionDto.PayloadData;
            queueTransaction.LastModifiedOn = DateTimeOffset.UtcNow;

            // Mark the transaction as updated
            _unitOfWork.QueueTransactionRepo.Update(queueTransaction);

            // Persist changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist transaction status update for ID {TransactionId}.", queueTransactionDto.Id);
                return serviceResponse;
            }

            // If validation errors were found, return early
            if (errors.Any())
            {
                serviceResponse.Message = string.Join("; ", errors);
                _logger.LogWarning("Transaction update validation failed: {Errors}", serviceResponse.Message);
                return serviceResponse;
            }
            else
            {
                serviceResponse.Message = "Transaction status updated successfully.";
            }
            // Return successful response
            serviceResponse.Data = queueTransaction.Adapt<QueueTransactionDto>();
            serviceResponse.StatusCode = 200;
            _logger.LogInformation("Transaction ID {TransactionId} successfully updated. New status: {Status}.", queueTransactionDto.Id, queueTransactionDto.Status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while updating transaction ID {TransactionId}.", queueTransactionDto.Id);
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

    // Method to create a dynamic object based on the schema
    private static dynamic CreateDynamicObjectFromSchema(List<QueueSchemaDefinitionDto> schema)
    {
        // Create a new dynamic object using ExpandoObject, which allows properties to be added at runtime.
        dynamic obj = new System.Dynamic.ExpandoObject();

        // Cast the ExpandoObject to an IDictionary to manipulate properties dynamically.
        var expandoDict = (IDictionary<string, object>)obj;

        // Iterate over each field in the provided schema.
        foreach (var field in schema)
        {
            // For each field, check the type and create the corresponding property with a default value.
            switch (field.Type.ToLower())
            {
                // If the type is string, initialize with an empty string.
                case "string":
                    expandoDict[field.Name] = string.Empty;
                    break;

                // If the type is int, initialize with 0.
                case "int":
                    expandoDict[field.Name] = 0;
                    break;

                // If the type is long, initialize with 0L.
                case "long":
                    expandoDict[field.Name] = 0L;
                    break;

                // If the type is short, initialize with (short)0.
                case "short":
                    expandoDict[field.Name] = (short)0;
                    break;

                // If the type is byte, initialize with (byte)0.
                case "byte":
                    expandoDict[field.Name] = (byte)0;
                    break;

                // If the type is decimal, initialize with 0m.
                case "decimal":
                    expandoDict[field.Name] = 0m;
                    break;

                // If the type is double, initialize with 0.0.
                case "double":
                    expandoDict[field.Name] = 0.0;
                    break;

                // If the type is float, initialize with 0f.
                case "float":
                    expandoDict[field.Name] = 0f;
                    break;

                // If the type is bool, initialize with false.
                case "bool":
                    expandoDict[field.Name] = false;
                    break;

                // If the type is char, initialize with '\0'.
                case "char":
                    expandoDict[field.Name] = '\0';
                    break;

                // If the type is DateTime, initialize with DateTime.MinValue.
                case "datetime":
                    expandoDict[field.Name] = DateTime.MinValue;
                    break;

                // If the type is Guid, initialize with Guid.Empty.
                case "guid":
                    expandoDict[field.Name] = Guid.Empty;
                    break;

                // If the type is TimeSpan, initialize with TimeSpan.Zero.
                case "timespan":
                    expandoDict[field.Name] = TimeSpan.Zero;
                    break;

                // If the type is object, initialize with null (since object can be any type).
                case "object":
                    expandoDict[field.Name] = new object();
                    break;

                // For unsupported types, initialize with null.
                default:
                    break;
            }
        }

        // Return the dynamically created object with properties based on the schema.
        return obj;
    }
}