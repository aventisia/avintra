namespace WorkspaceAPIs.Services;

public class QueueTransactionService : IQueueTransactionService
{
    private readonly ILogger<QueueTransactionService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly string _username;
    private readonly string _displayName;
    private readonly IStringEncryptionService _stringEncryptionService;
    private static readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

    public QueueTransactionService(
        ILogger<QueueTransactionService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor, IStringEncryptionService stringEncryptionService)
    {
        // Extract the user ID from the HTTP context (user's UID)
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _username = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? string.Empty;
        _displayName = GetDisplayName(httpContextAccessor.HttpContext?.User);

        _logger = logger;
        _unitOfWork = unitOfWork;
        _stringEncryptionService = stringEncryptionService;
    }

    // Returns the user's display name (First Name + Last Name) from the "name" claim,
    // falling back to the username/email if the claim is missing.
    private static string GetDisplayName(System.Security.Claims.ClaimsPrincipal? user)
    {
        // The JWT "name" claim is mapped to ClaimTypes.Name by the default inbound
        // claim type map, so check both the mapped type and the raw short name.
        var name = user?.FindFirstValue(System.Security.Claims.ClaimTypes.Name)
                   ?? user?.FindFirstValue("name");
        if (!string.IsNullOrWhiteSpace(name)) return name;

        return user?.FindFirstValue("uname") ?? string.Empty;
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
    public async Task<ServiceResponse<IEnumerable<QueueTransactionDto>>> GetQueueTransactionItemsAsync(QueueFilterRequestDto queueFilterRequestDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<QueueTransactionDto>>
        {
            Data = null,
            Message = "Failed to retrieve queue transactions. Please try again later."
        };

        try
        {
            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.Id == queueFilterRequestDto.QueueId)
                .FirstOrDefaultAsync();

            if (queue == null)
            {
                _logger.LogWarning("Queue not found for Queue ID: {QueueId}", queueFilterRequestDto.QueueId);
                serviceResponse.Message = "Queue not found.";
                return serviceResponse;
            }

            // Ensure thread safety while processing
            await _semaphore.WaitAsync();

            var transactions = await _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(w => w.QueueId == queue.Id)
                .Include(i => i.Queue)
                .AsNoTracking()
                .ToListAsync();

            // Parse JSON payload once for each transaction
            var items = transactions
                .Where(w => !string.IsNullOrWhiteSpace(w.PayloadData))
                .Select(w => new
                {
                    Transaction = w,
                    Payload = JObject.Parse(w.PayloadData!)
                })
                .ToList();

            // Apply dynamic filters in memory
            if (queueFilterRequestDto.Conditions.Any())
            {
                _logger.LogInformation("Applying {Count} filter conditions...", queueFilterRequestDto.Conditions.Count);

                items = items.Where(item =>
                {
                    foreach (var condition in queueFilterRequestDto.Conditions)
                    {
                        var fieldValue = item.Payload[condition.Field]?.ToString();
                        var compareValue = condition.Value;

                        if (string.IsNullOrWhiteSpace(fieldValue))
                            return false;

                        bool match = condition.ComparisonOperator switch
                        {
                            // -------- STRING OPERATORS --------
                            "EqualTo" => fieldValue == compareValue,
                            "NotEqualTo" => fieldValue != compareValue,
                            "Contains" => fieldValue.Contains(compareValue, StringComparison.OrdinalIgnoreCase),
                            "DoesNotContain" => !fieldValue.Contains(compareValue, StringComparison.OrdinalIgnoreCase),
                            "StartsWith" => fieldValue.StartsWith(compareValue, StringComparison.OrdinalIgnoreCase),
                            "EndsWith" => fieldValue.EndsWith(compareValue, StringComparison.OrdinalIgnoreCase),

                            // -------- NUMERIC OPERATORS --------
                            "GreaterThan" => decimal.TryParse(fieldValue, out var number1) && decimal.TryParse(compareValue, out var number2) && number1 > number2,
                            "LessThan" => decimal.TryParse(fieldValue, out var number1) && decimal.TryParse(compareValue, out var number2) && number1 < number2,
                            "GreaterThanOrEqual" => decimal.TryParse(fieldValue, out var number1) && decimal.TryParse(compareValue, out var number2) && number1 >= number2,
                            "LessThanOrEqual" => decimal.TryParse(fieldValue, out var number1) && decimal.TryParse(compareValue, out var number2) && number1 <= number2,

                            // -------- DATE OPERATORS --------
                            "DateAfter" => DateTimeOffset.TryParse(fieldValue, out var date1) && DateTimeOffset.TryParse(compareValue, out var date2) && date1 > date2,
                            "DateBefore" => DateTimeOffset.TryParse(fieldValue, out var date1) && DateTimeOffset.TryParse(compareValue, out var date2) && date1 < date2,
                            "DateOnOrAfter" => DateTimeOffset.TryParse(fieldValue, out var date1) && DateTimeOffset.TryParse(compareValue, out var date2) && date1 >= date2,
                            "DateOnOrBefore" => DateTimeOffset.TryParse(fieldValue, out var date1) && DateTimeOffset.TryParse(compareValue, out var date2) && date1 <= date2,

                            "IsNull" => string.IsNullOrWhiteSpace(fieldValue),
                            "IsNotNull" => !string.IsNullOrWhiteSpace(fieldValue),
                            _ => true
                        };

                        if (!match)
                        {
                            return false;
                        }
                    }

                    return true;
                }).ToList();
            }

            IEnumerable<dynamic> sorted = items;

            // Apply dynamic sorting
            if (queueFilterRequestDto.QueuePriority.Any())
            {
                _logger.LogInformation("Applying sorting priorities...");

                foreach (var sort in queueFilterRequestDto.QueuePriority)
                {
                    sorted = sort.OrderBy.Equals("Ascending", StringComparison.OrdinalIgnoreCase)
                        ? sorted.OrderBy(o => o.Payload[sort.Field]?.ToString())
                        : sorted.OrderByDescending(o => o.Payload[sort.Field]?.ToString());
                }
            }
            // Configure JSON serialization options
            var options = new JsonSerializerOptions
            {
                ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve,
                WriteIndented = false
            };

            // Serialize only the Transaction property from the sorted collection into JSON
            var json = System.Text.Json.JsonSerializer.Serialize(
                sorted.Select(s => s.Transaction),
                options
            );

            // Deserialize the JSON back into a list of QueueTransactionDto objects, This effectively creates a deep copy of the transactions
            var result = System.Text.Json.JsonSerializer.Deserialize<List<QueueTransactionDto>>(
                json,
                options
            );

            // Build success response
            serviceResponse.Data = result;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Successfully retrieved queue transactions.";

            _logger.LogInformation("Completed successfully. Returning {Count} transactions for Queue ID: {QueueId}", result.Count, queue.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while processing transactions for Queue ID: {QueueId}", queueFilterRequestDto?.QueueId);
        }
        finally
        {
            _semaphore.Release();
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
    public async Task<ServiceResponse<QueueTransactionDto>> InsertMultipleTransactionsAsync(QueueTransactionDto queueTransactionDto)
    {
        var serviceResponse = new ServiceResponse<QueueTransactionDto>
        {
            Data = null,
            Message = "Failed to add transactions. Please try again later."
        };

        try
        {
            _logger.LogInformation("Starting transaction insertion process...");

            // Retrieve the target queue (by ID or name)
            _logger.LogInformation("Retrieving queue information for processing...");
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
                _logger.LogWarning("Queue not found. QueueId: {QueueId}, QueueName: {QueueName}", queueTransactionDto.QueueId, queueTransactionDto.QueueName);
                serviceResponse.Message = "Specified queue does not exist.";
                return serviceResponse;
            }

            _logger.LogInformation("Queue found (ID: {QueueId}). Proceeding with validation and insertion...", queue.Id);

            // Deserialize input schema from the queue definition
            _logger.LogInformation("Deserializing queue input schema...");
            var inputSchema = System.Text.Json.JsonSerializer.Deserialize<List<QueueSchemaDefinitionDto>>(
                queue.InputSchema ?? "[]",
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            ) ?? new List<QueueSchemaDefinitionDto>();
            _logger.LogInformation("Schema contains {Count} field definitions.", inputSchema.Count);

            // Collect existing unique keys for duplicate detection
            var existingUniqueKeys = new HashSet<string>();
            if (queue.QueueTransactions != null)
            {
                _logger.LogInformation("Collecting existing unique keys for duplicate validation...");
                foreach (var transaction in queue.QueueTransactions)
                {
                    var payload = transaction.PayloadData;
                    if (string.IsNullOrWhiteSpace(payload))
                        continue;

                    if (queue.IsStoredEncrypted)
                    {
                        payload = _stringEncryptionService.DecryptString(transaction.PayloadData ?? string.Empty);
                    }

                    var obj = JObject.Parse(payload);
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
                _logger.LogInformation("Collected {Count} existing unique keys.", existingUniqueKeys.Count);
            }

            // Parse incoming payload data (array of transaction objects)
            _logger.LogInformation("Parsing incoming payload data...");
            var dataArray = JArray.Parse(queueTransactionDto.PayloadData ?? "[]");
            _logger.LogInformation("Found {Count} transaction(s) in the payload.", dataArray.Count);

            var enrichedPayloadData = new JArray(); // To hold validated/enriched payload
            var newTransactions = new List<QueueTransaction>(); // To hold valid transaction entities
            var isValidationFailed = false;

            // Begin validating each transaction object
            foreach (var dataItem in dataArray)
            {
                var obj = dataItem as JObject;
                if (obj == null)
                {
                    _logger.LogWarning("Skipping invalid transaction object in payload.");
                    continue;
                }

                var validationMessages = new List<string>();
                dynamic dynamicObject = CreateDynamicObjectFromSchema(inputSchema);

                var uniqueKeyParts = new List<string>();
                var uniqueFields = new List<string>();

                // Field-level validation based on schema
                foreach (var field in inputSchema)
                {
                    var hasValue = obj.TryGetValue(field.Name, out var value) &&
                                   value != null &&
                                   !string.IsNullOrWhiteSpace(value.ToString());

                    // Check required fields
                    if (field.IsRequired && !hasValue)
                    {
                        isValidationFailed = true;
                        var label = string.IsNullOrWhiteSpace(field.Label) ? field.Name : field.Label;
                        validationMessages.Add($"Missing required field: {label}");
                        _logger.LogWarning("Validation failed: Required field '{Field}' is missing.", field.Name);
                    }

                    // Collect unique key parts for duplication check
                    if (field.IsUsedForUniqueIdentifier && queue.IsUniqueReferencesEnforced && hasValue)
                    {
                        uniqueKeyParts.Add(value.ToString());
                        uniqueFields.Add($"{field.Name}: {value}");
                    }

                    // Populate the dynamic object
                    ((IDictionary<string, object>)dynamicObject)[field.Name] = value!;
                }

                // Duplicate check
                if (queue.IsUniqueReferencesEnforced && uniqueKeyParts.Any())
                {
                    var newUniqueKey = string.Join("|", uniqueKeyParts);
                    if (existingUniqueKeys.Contains(newUniqueKey, StringComparer.InvariantCultureIgnoreCase))
                    {
                        isValidationFailed = true;
                        var uniqueFieldsStr = string.Join(", ", uniqueFields);
                        validationMessages.Add($"Duplicate entry detected for: {uniqueFieldsStr}");
                        _logger.LogWarning("Duplicate transaction detected: {UniqueKey}", newUniqueKey);
                    }

                    // Add current key to set regardless
                    existingUniqueKeys.Add(newUniqueKey);
                }

                // Annotate object with validation result
                obj["Status"] = validationMessages.Any() ? "Failed" : "Success";
                obj["Remark"] = string.Join("; ", validationMessages);
                enrichedPayloadData.Add(obj);

                // Only prepare valid transactions for DB insertion
                if (!validationMessages.Any())
                {
                    var serializedPayload = JsonConvert.SerializeObject(dynamicObject, Formatting.Indented);

                    // Ensure CreatedBy is set
                    if (string.IsNullOrEmpty(queueTransactionDto.CreatedBy))
                    {
                        queueTransactionDto.CreatedBy = _username;
                    }

                    // Encrypt payload if queue is configured for encryption
                    if (queue.IsStoredEncrypted)
                    {
                        serializedPayload = _stringEncryptionService.EncryptString(serializedPayload);
                    }

                    // Map DTO to entity and populate fields
                    var newTransaction = queueTransactionDto.Adapt<QueueTransaction>();
                    newTransaction.PayloadData = serializedPayload;
                    newTransaction.Status = QueueTransactionStatusTypesEnum.Pending.ToString();

                    newTransactions.Add(newTransaction);

                    _logger.LogInformation("Validated transaction prepared for insertion.");
                }
            }

            if (isValidationFailed)
            {
                // Set enriched payload with validation Status and Remark for each transaction
                queueTransactionDto.PayloadData = enrichedPayloadData.ToString(Formatting.Indented);

                // Set response status code and attach updated DTO to response
                serviceResponse.StatusCode = 409;
                serviceResponse.Data = queueTransactionDto;
                serviceResponse.Message = "Some transactions failed validation. Check 'Status' and 'Remark' fields for details.";
                _logger.LogWarning("Transaction processing completed with validation errors. Returning enriched payload with remarks.");

                return serviceResponse;
            }

            // Insert if no validation errors
            if (newTransactions.Any())
            {
                _logger.LogInformation("Inserting {Count} transaction(s) into the database...", newTransactions.Count);
                await _unitOfWork.QueueTransactionRepo.InsertAsync(newTransactions);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Database commit failed after inserting transactions into queue {QueueId}.", queueTransactionDto.QueueId);
                    return serviceResponse;
                }
            }
            else
            {
                // No work items were produced (empty payload, all items skipped, etc.).
                // Surface a meaningful error instead of a false "success" message.
                _logger.LogWarning("No work items were added to queue {QueueId}: payload contained no valid items.", queueTransactionDto.QueueId);
                serviceResponse.Message = "No work items were added. The uploaded file contained no valid items to insert.";
                return serviceResponse;
            }

            // Set response status code and attach updated DTO to response
            serviceResponse.StatusCode = 200;
            serviceResponse.Data = queueTransactionDto;
            serviceResponse.Message = $"Transaction validated and added successfully. {newTransactions.Count} work item(s) added to the queue.";
            _logger.LogInformation("Transaction processing completed successfully. All transactions inserted into queue {QueueId}.", queueTransactionDto.QueueId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while adding transactions to queue {QueueId}.", queueTransactionDto.QueueId);
        }

        return serviceResponse;
    }

    // Updates the status an existing queue transaction.
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

            // Update the existing queue transaction entity with values from the DTO
            queueTransaction.Status = queueTransactionDto.Status;
            queueTransaction.LastModifiedOn = DateTimeOffset.UtcNow;

            // Record who claimed the work item when it moves into InProgress.
            if (queueTransactionDto.Status == QueueTransactionStatusTypesEnum.InProgress.ToString())
            {
                queueTransaction.Assignee = _displayName;
            }

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

    // Updates the payload of an existing queue transaction, including validation, uniqueness checks, encryption handling, and database persistence.
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

            var queue = queueTransaction.Queue;

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

            // Update queue transaction details only when values are changed
            if (queueTransaction.PayloadData != queueTransactionDto.PayloadData)
            {
                queueTransaction.PayloadData = queueTransactionDto.PayloadData;
            }

            if (queueTransactionDto.FileUrls != null)
            {
                queueTransaction.FileUrls = queueTransactionDto.FileUrls;
            }

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