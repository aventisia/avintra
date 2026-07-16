namespace WorkspaceAPIs.Services;

public class QueueWorkItemService : IQueueWorkItemService
{
    private readonly ILogger<QueueWorkItemService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly string _username;
    private readonly IStringEncryptionService _stringEncryptionService;
    private readonly IQueueTransactionEventService _queueTransactionEventService;
    private static readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

    public QueueWorkItemService(
        ILogger<QueueWorkItemService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor, IStringEncryptionService stringEncryptionService, IQueueTransactionEventService queueTransactionEventService)
    {
        // Extract the user ID from the HTTP context (user's UID)
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _username = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? string.Empty;

        _logger = logger;
        _unitOfWork = unitOfWork;
        _stringEncryptionService = stringEncryptionService;
        _queueTransactionEventService = queueTransactionEventService;
    }

    // Retrieve all workitems for a specific queue
    public async Task<ServiceResponse<IEnumerable<QueueWorkItemDto>>> GetAllWorkItemsAsync(Guid queueId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<QueueWorkItemDto>>
        {
            Data = null,
            Message = "Failed to retrieve queue workitems. Please try again later."
        };

        try
        {
            // Query the workitems for the specified queue
            var queueWorkitems = await _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(w =>
                    w.QueueId == queueId
                )
                .Include(i => i.Queue)
                .OrderBy(o => o.CreatedOn)
                .AsNoTracking()
                .ToListAsync();

            // On success, populate the response with the data
            serviceResponse.Data = queueWorkitems.Adapt<IEnumerable<QueueWorkItemDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Successfully retrieved queue workitems.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching workitems for queue {QueueId}.", queueId);
        }

        return serviceResponse;
    }

    // Retrieve all workitems for a specific queue using provided filter criteria
    public async Task<ServiceResponse<IEnumerable<QueueWorkItemDto>>> GetQueueWorkItemsAsync(QueueFilterRequestDto queueFilterRequestDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<QueueWorkItemDto>>
        {
            Data = null,
            Message = "Failed to retrieve queue workitems. Please try again later."
        };

        try
        {

            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(q =>
                    !string.IsNullOrEmpty(queueFilterRequestDto.QueueName)
                        ? q.Name.ToLower() == queueFilterRequestDto.QueueName.ToLower()
                        : q.Id == queueFilterRequestDto.QueueId)
                .FirstOrDefaultAsync();

            if (queue == null)
            {
                _logger.LogWarning("Queue not found for Queue ID: {QueueId}", queueFilterRequestDto.QueueId);
                serviceResponse.Message = "Queue not found.";
                return serviceResponse;
            }

            // Ensure thread safety while processing
            await _semaphore.WaitAsync();

            var workitems = await _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(w =>
                    w.QueueId == queue.Id &&
                    (queueFilterRequestDto.Status == null || w.Status == queueFilterRequestDto.Status)
                )
                .Include(i => i.Queue)
                .AsNoTracking()
                .ToListAsync();

            // Parse JSON payload once for each workitem
            var items = workitems
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
                items = items.Where(item =>
                {
                    foreach (var condition in queueFilterRequestDto.Conditions)
                    {
                        var fieldValue = item.Payload[condition.Field]?.ToString();
                        var compareValue = condition.Value;
                        var comparisonOperator = condition.ComparisonOperator?.Trim().ToLowerInvariant();

                        if (string.IsNullOrWhiteSpace(fieldValue))
                            return false;

                        bool match = comparisonOperator switch
                        {
                            // -------- STRING OPERATORS --------
                            "equalto" => string.Equals(fieldValue, compareValue, StringComparison.OrdinalIgnoreCase),
                            "notequalto" => !string.Equals(fieldValue, compareValue, StringComparison.OrdinalIgnoreCase),
                            "contains" => fieldValue.Contains(compareValue, StringComparison.OrdinalIgnoreCase),
                            "doesnotcontain" => !fieldValue.Contains(compareValue, StringComparison.OrdinalIgnoreCase),
                            "startswith" => fieldValue.StartsWith(compareValue, StringComparison.OrdinalIgnoreCase),
                            "endswith" => fieldValue.EndsWith(compareValue, StringComparison.OrdinalIgnoreCase),

                            // -------- NUMERIC OPERATORS --------
                            "greaterthan" => decimal.TryParse(fieldValue, out var number1) && decimal.TryParse(compareValue, out var number2) && number1 > number2,
                            "lessthan" => decimal.TryParse(fieldValue, out var number1) && decimal.TryParse(compareValue, out var number2) && number1 < number2,
                            "greaterthanorequal" => decimal.TryParse(fieldValue, out var number1) && decimal.TryParse(compareValue, out var number2) && number1 >= number2,
                            "lessthanorequal" => decimal.TryParse(fieldValue, out var number1) && decimal.TryParse(compareValue, out var number2) && number1 <= number2,

                            // -------- DATE OPERATORS --------
                            "dateafter" => DateTimeOffset.TryParse(fieldValue, out var date1) && DateTimeOffset.TryParse(compareValue, out var date2) && date1 > date2,
                            "datebefore" => DateTimeOffset.TryParse(fieldValue, out var date1) && DateTimeOffset.TryParse(compareValue, out var date2) && date1 < date2,
                            "dateonorafter" => DateTimeOffset.TryParse(fieldValue, out var date1) && DateTimeOffset.TryParse(compareValue, out var date2) && date1 >= date2,
                            "dateonorbefore" => DateTimeOffset.TryParse(fieldValue, out var date1) && DateTimeOffset.TryParse(compareValue, out var date2) && date1 <= date2,

                            "isnull" => string.IsNullOrWhiteSpace(fieldValue),
                            "isnotnull" => !string.IsNullOrWhiteSpace(fieldValue),
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

            IOrderedEnumerable<dynamic>? ordered = null;

            foreach (var sort in queueFilterRequestDto.QueuePriority)
            {
                // Func<dynamic, object?> keySelector = x => x.Payload[sort.Field]?.ToString();
                Func<dynamic, object?> keySelector = x =>
                {
                    var payloadObj = x.Payload as JObject;

                    var token = payloadObj?
                        .Properties()
                        .FirstOrDefault(p =>
                            string.Equals(p.Name, sort.Field, StringComparison.OrdinalIgnoreCase))
                        ?.Value;

                    if (token == null || token.Type == JTokenType.Null || token.Type == JTokenType.Undefined)
                        return null;

                    return token.Type switch
                    {
                        JTokenType.Integer => token.Value<long>(),
                        JTokenType.Float => token.Value<double>(),
                        JTokenType.Boolean => token.Value<bool>() ? 1 : 0,
                        JTokenType.Date => token.Value<DateTime>(),
                        JTokenType.String => token.Value<string>()?.ToLowerInvariant(),
                        JTokenType.Guid => token.Value<Guid>(),
                        JTokenType.Bytes => token.Value<byte[]>(),
                        JTokenType.Array => ((JArray)token).Count,
                        JTokenType.Object => token.ToString(Newtonsoft.Json.Formatting.None).ToLowerInvariant(),
                        _ => token.ToString()?.ToLowerInvariant()
                    };
                };

                if (ordered == null)
                {
                    ordered = sort.OrderBy.Equals("Ascending", StringComparison.OrdinalIgnoreCase)
                        ? items.OrderBy(keySelector)
                        : items.OrderByDescending(keySelector);
                }
                else
                {
                    ordered = sort.OrderBy.Equals("Ascending", StringComparison.OrdinalIgnoreCase)
                        ? ordered.ThenBy(keySelector)
                        : ordered.ThenByDescending(keySelector);
                }
            }

            var sorted = ordered ?? items.Cast<dynamic>();

            // Apply Skip
            if (queueFilterRequestDto.Skip > 0)
            {
                sorted = sorted.Skip(queueFilterRequestDto.Skip);
            }

            // Apply Top
            if (queueFilterRequestDto.Top > 0)
            {
                sorted = sorted.Take(queueFilterRequestDto.Top);
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

            // Deserialize the JSON back into a list of QueueWorkItemDto objects, This effectively creates a deep copy of the workitems
            var result = System.Text.Json.JsonSerializer.Deserialize<List<QueueTransaction>>(
                json,
                options
            );

            // Build success response
            serviceResponse.Data = result.Adapt<List<QueueWorkItemDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Successfully retrieved queue workitems.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while processing workitems for Queue ID: {QueueId}", queueFilterRequestDto?.QueueId);
        }
        finally
        {
            _semaphore.Release();
        }

        return serviceResponse;
    }

    // Retrieves and claims the next available work item from a specific queue
    public async Task<ServiceResponse<QueueWorkItemDto>> GetNextQueueWorkItemAsync(QueueFilterRequestDto queueFilterRequestDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<QueueWorkItemDto>
        {
            Data = null,
            Message = "Failed to retrieve the next work item. Please try again later."
        };

        try
        {
            // Retrieve the queue based on name or ID
            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w =>
                    !string.IsNullOrEmpty(queueFilterRequestDto.QueueName)
                        ? w.Name.ToLower() == queueFilterRequestDto.QueueName.ToLower()
                        : w.Id == queueFilterRequestDto.QueueId)
                .FirstOrDefaultAsync();

            if (queue == null)
            {
                _logger.LogWarning("Queue not found for Queue ID: {QueueId}", queueFilterRequestDto.QueueId);
                serviceResponse.Message = "Queue not found.";
                return serviceResponse;
            }

            // Ensure only one worker can claim a work item at a time
            await _semaphore.WaitAsync();

            try
            {
                // Retrieve pending work items from the queue
                var workItems = await _unitOfWork.QueueTransactionRepo
                    .GetByConditionAsync(w =>
                        w.QueueId == queue.Id &&
                        (queueFilterRequestDto.Status == null ||
                         w.Status == queueFilterRequestDto.Status))
                    .Include(w => w.Queue)
                    .ToListAsync();

                if (!workItems.Any())
                {
                    serviceResponse.Message = "No available work items found.";
                    return serviceResponse;
                }

                // Apply payload filtering logic
                var filteredItems = workItems
                    .Where(w => !string.IsNullOrWhiteSpace(w.PayloadData))
                    .Select(w => new
                    {
                        Transaction = w,
                        Payload = JObject.Parse(w.PayloadData!)
                    })
                    .ToList();

                if (queueFilterRequestDto.Conditions.Any())
                {
                    filteredItems = filteredItems.Where(item =>
                    {
                        foreach (var condition in queueFilterRequestDto.Conditions)
                        {
                            var fieldValue = item.Payload[condition.Field]?.ToString();
                            var compareValue = condition.Value;
                            var comparisonOperator = condition.ComparisonOperator?.Trim().ToLowerInvariant();

                            if (string.IsNullOrWhiteSpace(fieldValue))
                                return false;

                            bool isMatch = comparisonOperator switch
                            {
                                // -------- STRING OPERATORS --------
                                "equalto" => string.Equals(fieldValue, compareValue, StringComparison.OrdinalIgnoreCase),
                                "notequalto" => !string.Equals(fieldValue, compareValue, StringComparison.OrdinalIgnoreCase),
                                "contains" => fieldValue.Contains(compareValue, StringComparison.OrdinalIgnoreCase),
                                "doesnotcontain" => !fieldValue.Contains(compareValue, StringComparison.OrdinalIgnoreCase),
                                "startswith" => fieldValue.StartsWith(compareValue, StringComparison.OrdinalIgnoreCase),
                                "endswith" => fieldValue.EndsWith(compareValue, StringComparison.OrdinalIgnoreCase),

                                // -------- NUMERIC OPERATORS --------
                                "greaterthan" => decimal.TryParse(fieldValue, out var number1) && decimal.TryParse(compareValue, out var number2) && number1 > number2,
                                "lessthan" => decimal.TryParse(fieldValue, out var number1) && decimal.TryParse(compareValue, out var number2) && number1 < number2,
                                "greaterthanorequal" => decimal.TryParse(fieldValue, out var number1) && decimal.TryParse(compareValue, out var number2) && number1 >= number2,
                                "lessthanorequal" => decimal.TryParse(fieldValue, out var number1) && decimal.TryParse(compareValue, out var number2) && number1 <= number2,

                                // -------- DATE OPERATORS --------
                                "dateafter" => DateTimeOffset.TryParse(fieldValue, out var date1) && DateTimeOffset.TryParse(compareValue, out var date2) && date1 > date2,
                                "datebefore" => DateTimeOffset.TryParse(fieldValue, out var date1) && DateTimeOffset.TryParse(compareValue, out var date2) && date1 < date2,
                                "dateonorafter" => DateTimeOffset.TryParse(fieldValue, out var date1) && DateTimeOffset.TryParse(compareValue, out var date2) && date1 >= date2,
                                "dateonorbefore" => DateTimeOffset.TryParse(fieldValue, out var date1) && DateTimeOffset.TryParse(compareValue, out var date2) && date1 <= date2,

                                "isnull" => string.IsNullOrWhiteSpace(fieldValue),
                                "isnotnull" => !string.IsNullOrWhiteSpace(fieldValue),
                                _ => true
                            };
                            if (!isMatch)
                                return false;
                        }

                        return true;

                    }).ToList();
                }

                // Select the next work item based on queue priority order
                var nextWorkItem = filteredItems
                    .OrderByDescending(o => o.Transaction.CreatedOn)
                    .Select(s => s.Transaction)
                    .FirstOrDefault();

                if (nextWorkItem == null)
                {
                    serviceResponse.Message = "No work item matched the provided criteria.";
                    return serviceResponse;
                }

                if (nextWorkItem.Status == QueueTransactionStatusTypesEnum.Pending)
                {
                    // Update the work item status to indicate it has been assigned for processing
                    nextWorkItem.Status = QueueTransactionStatusTypesEnum.InProgress;

                    _unitOfWork.QueueTransactionRepo.Update(nextWorkItem);

                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogError(
                            "Failed to update status for claimed work item {WorkItemId}.",
                            nextWorkItem.Id);

                        return serviceResponse;
                    }
                    await _queueTransactionEventService.CreateQueueTransactionEventAsync(new QueueTransactionEventDto()
                    {
                        QueueTransactionId = nextWorkItem.Id,
                        EventType = QueueTransactionEventEnum.StatusChange,
                        Data = string.Empty,
                    });

                }

                serviceResponse.Data = nextWorkItem.Adapt<QueueWorkItemDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Next work item retrieved successfully.";
            }

            finally
            {
                _semaphore.Release();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error occurred while claiming next work item for Queue ID: {QueueId}",
                queueFilterRequestDto?.QueueId);
        }

        return serviceResponse;
    }

    // Retrieves a specific queue workitem by its ID.
    public async Task<ServiceResponse<QueueWorkItemDto>> GetQueueWorkItemByIdAsync(Guid queueWorkitemId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<QueueWorkItemDto>
        {
            Data = null,
            Message = "Failed to retrieve queue workitem. Please try again later."
        };

        try
        {
            // Retrieve the specific queue workitem including related data
            var queueWorkitem = await _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(w => w.Id == queueWorkitemId)
                .Include(i => i.Queue)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Check if the workitem was found
            if (queueWorkitem == null)
            {
                _logger.LogInformation("Queue workitem with ID {QueueWorkitemId} not found.", queueWorkitemId);
                serviceResponse.Message = "Queue workitem not found.";
                return serviceResponse;
            }

            // Map entity to DTO and update response
            serviceResponse.Data = queueWorkitem.Adapt<QueueWorkItemDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue workitems retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving the queue workitems with ID {QueueWorkitemId}.", queueWorkitemId);
        }

        return serviceResponse;
    }

    // Inserts a multiple new workitems into a specified queue, validating against the schema, enforcing uniqueness, and handling encryption if necessary.
    public async Task<ServiceResponse<QueueWorkItemDto>> InsertWorkItemsAsync(QueueWorkItemDto queueWorkItemDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<QueueWorkItemDto>
        {
            Data = null,
            Message = "Failed to add workitems. Please try again later."
        };

        try
        {
            // Retrieve the target queue (by ID or name)
            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w =>
                    string.IsNullOrEmpty(queueWorkItemDto.QueueName)
                        ? w.Id == queueWorkItemDto.QueueId
                        : w.Name.ToLower() == queueWorkItemDto.QueueName.ToLower()
                )
                .Include(i => i.QueueTransactions)
                .SingleOrDefaultAsync();

            if (queue == null)
            {
                _logger.LogWarning("Queue not found. QueueId: {QueueId}, QueueName: {QueueName}", queueWorkItemDto.QueueId, queueWorkItemDto.QueueName);
                serviceResponse.Message = "Specified queue does not exist.";
                return serviceResponse;
            }

            // Deserialize input schema from the queue definition
            var inputSchema = System.Text.Json.JsonSerializer.Deserialize<List<QueueSchemaDefinitionDto>>(
                queue.InputSchema ?? "[]",
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            ) ?? new List<QueueSchemaDefinitionDto>();

            // Collect existing unique keys for duplicate detection
            var existingUniqueKeys = new HashSet<string>();
            if (queue.QueueTransactions != null)
            {
                foreach (var workitem in queue.QueueTransactions)
                {
                    var payload = workitem.PayloadData;
                    if (string.IsNullOrWhiteSpace(payload))
                        continue;

                    if (queue.IsStoredEncrypted)
                    {
                        payload = _stringEncryptionService.DecryptString(workitem.PayloadData ?? string.Empty);
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
            }

            // Validate input: ensure WorkItemData is not null, empty, or whitespace
            if (string.IsNullOrWhiteSpace(queueWorkItemDto.WorkItemData))
            {
                serviceResponse.Message = "Invalid payload format. WorkItemData cannot be null or empty.";
                return serviceResponse;
            }

            JToken parsedToken;

            try
            {
                // Attempt to parse the input string as JSON.
                // This handles both JSON objects ({}) and arrays ([]).
                parsedToken = JToken.Parse(queueWorkItemDto.WorkItemData);
            }
            catch (JsonReaderException ex)
            {
                // Log the invalid JSON payload for debugging purposes
                _logger.LogError(ex, "Invalid JSON in WorkItemData: {Payload}", queueWorkItemDto.WorkItemData);

                serviceResponse.Message = "Invalid JSON format in WorkItemData.";
                return serviceResponse;
            }

            JArray dataArray;

            // If JSON is an array, use it directly
            if (parsedToken is JArray array)
            {
                dataArray = array;
                _logger.LogInformation("Found {Count} workitem(s) in the payload array.", dataArray.Count);
            }
            // If JSON is a single object, wrap it into an array for unified processing
            else if (parsedToken is JObject obj)
            {
                dataArray = new JArray(obj);
                _logger.LogInformation("Found 1 workitem in the payload.");
            }
            else
            {
                // If JSON is neither object nor array, reject the request
                serviceResponse.Message = "Invalid payload structure. Must be a JSON object or array.";
                return serviceResponse;
            }

            var enrichedPayloadData = new JArray(); // To hold validated/enriched payload
            var newWorkItems = new List<QueueTransaction>(); // To hold valid workitem entities
            var isValidationFailed = false;

            // Begin validating each workitem object
            foreach (var dataItem in dataArray)
            {
                var obj = dataItem as JObject;
                if (obj == null)
                {
                    _logger.LogWarning("Skipping invalid workitem object in payload.");
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
                        _logger.LogWarning("Duplicate workitem detected: {UniqueKey}", newUniqueKey);
                    }

                    // Add current key to set regardless
                    existingUniqueKeys.Add(newUniqueKey);
                }

                // Annotate object with validation result
                obj["Status"] = validationMessages.Any() ? "Failed" : "Success";
                obj["Remark"] = string.Join("; ", validationMessages);
                enrichedPayloadData.Add(obj);

                // Only prepare valid workitems for DB insertion
                if (!validationMessages.Any())
                {
                    var serializedPayload = JsonConvert.SerializeObject(dynamicObject, Formatting.Indented);

                    // Ensure CreatedBy is set
                    if (string.IsNullOrEmpty(queueWorkItemDto.CreatedBy))
                    {
                        queueWorkItemDto.CreatedBy = _username;
                    }

                    // Encrypt payload if queue is configured for encryption
                    if (queue.IsStoredEncrypted)
                    {
                        serializedPayload = _stringEncryptionService.EncryptString(serializedPayload);
                    }

                    // Map DTO to entity and populate fields
                    var newWorkItem = queueWorkItemDto.Adapt<QueueTransaction>();
                    newWorkItem.PayloadData = serializedPayload;
                    newWorkItem.QueueId = queue.Id;
                    newWorkItem.Status = QueueTransactionStatusTypesEnum.Pending;
                    newWorkItem.Description = queueWorkItemDto.Description;

                    newWorkItems.Add(newWorkItem);

                    _logger.LogInformation("Validated workitem prepared for insertion.");
                }
            }

            if (isValidationFailed)
            {
                // Set enriched payload with validation Status and Remark for each workitem
                queueWorkItemDto.WorkItemData = enrichedPayloadData.ToString(Formatting.Indented);

                // Set response status code and attach updated DTO to response
                serviceResponse.StatusCode = 409;
                serviceResponse.Data = queueWorkItemDto;
                serviceResponse.Message = "Some workitem failed validation. Check 'Status' and 'Remark' fields for details.";
                return serviceResponse;
            }

            // Insert if no validation errors
            if (newWorkItems.Any())
            {
                _logger.LogInformation("Inserting {Count} workitem(s) into the database...", newWorkItems.Count);
                await _unitOfWork.QueueTransactionRepo.InsertAsync(newWorkItems);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Database commit failed after inserting workitems into queue {QueueId}.", queueWorkItemDto.QueueId);
                    return serviceResponse;
                }
            }

            // Set response status code and attach updated DTO to response
            serviceResponse.StatusCode = 200;
            serviceResponse.Data = newWorkItems.FirstOrDefault().Adapt<QueueWorkItemDto>();
            serviceResponse.Message = "Work item validated and added successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while adding workitems to queue {QueueId}.", queueWorkItemDto.QueueId);
        }

        return serviceResponse;
    }

    // Updates the payload of an existing queue workitem, including validation, uniqueness checks, encryption handling, and database persistence.
    public async Task<ServiceResponse<QueueWorkItemDto>> UpdateWorkItemAsync(QueueWorkItemDto queueWorkItemDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<QueueWorkItemDto>
        {
            Data = null,
            Message = "Failed to update queue workitem. Please try again."
        };

        try
        {
            // Check if WorkItemData is null or starts with '{'
            if (!string.IsNullOrEmpty(queueWorkItemDto.WorkItemData) && !queueWorkItemDto.WorkItemData.TrimStart().StartsWith("{"))
            {
                serviceResponse.Message = "Invalid payload format. The data must start with '{' indicating a valid JSON object.";
                return serviceResponse;
            }

            // Retrieve the work item with its associated queue from the database (using AsNoTracking for performance)
            var queueWorkItem = await _unitOfWork.QueueTransactionRepo
               .GetByConditionAsync(w => w.Id == queueWorkItemDto.Id)
               .Include(i => i.Queue)
               .AsNoTracking()
               .SingleOrDefaultAsync();

            // If the work item does not exist, log the issue and return early with a failure message
            if (queueWorkItem == null)
            {
                _logger.LogWarning("Queue workitem ID {QueueWorkitemId} not found. Update aborted.", queueWorkItemDto.Id);
                serviceResponse.Message = "Queue workitem not found.";
                return serviceResponse;
            }

            var errors = new List<string>();

            // Check if the workitem data is not empty or null before proceeding
            if (!string.IsNullOrEmpty(queueWorkItemDto.WorkItemData))
            {
                // Retrieve the Queue object associated with the specified QueueId from the incoming DTO
                var queue = queueWorkItem.Queue;

                // Deserialize the queue's input schema; fall back to empty list if schema is invalid or null
                var inputSchema = System.Text.Json.JsonSerializer.Deserialize<List<QueueSchemaDefinitionDto>>(
                    queue.InputSchema ?? "[]",
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                ) ?? new List<QueueSchemaDefinitionDto>();

                // Generate a dynamic object based on the schema
                dynamic dynamicObject = CreateDynamicObjectFromSchema(inputSchema);

                // Parse the incoming payload; fall back to an empty object if null or malformed
                var data = Newtonsoft.Json.Linq.JObject.Parse(queueWorkItemDto.WorkItemData ?? "{}");

                // Extract existing unique keys from the queue's workitems to ensure uniqueness
                var existingUniqueKeys = new HashSet<string>();
                if (queue.QueueTransactions != null)
                {
                    foreach (var workitem in queue.QueueTransactions.Where(w => w.Id != queueWorkItem.Id).ToList())
                    {
                        var payload = workitem.PayloadData;
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
                        errors.Add("A workitem with the same unique field values already exists in the queue.");
                    }
                }

                // Serialize the validated dynamic object back to JSON
                queueWorkItemDto.WorkItemData = JsonConvert.SerializeObject(dynamicObject, Formatting.Indented);

                // Set the creator username if not already set
                if (string.IsNullOrEmpty(queueWorkItemDto.CreatedBy))
                {
                    queueWorkItemDto.CreatedBy = _username;
                }

                // Encrypt payload if required
                if (queue.IsStoredEncrypted)
                {
                    queueWorkItemDto.WorkItemData = _stringEncryptionService.EncryptString(queueWorkItemDto.WorkItemData ?? string.Empty);
                }
            }

            // If validation errors were found, return early
            if (errors.Any())
            {
                serviceResponse.Message = string.Join("; ", errors);
                _logger.LogWarning("Queue workitem update validation failed: {Errors}", serviceResponse.Message);
                return serviceResponse;
            }

            // Update the queue workitem entity with values from the DTO
            queueWorkItem.PayloadData = string.IsNullOrWhiteSpace(queueWorkItemDto.WorkItemData)
                ? queueWorkItem.PayloadData
                : queueWorkItemDto.WorkItemData;

            // Update the status only if the new status is provided
            if (queueWorkItemDto.Status.HasValue)
            {
                queueWorkItem.Status = queueWorkItemDto.Status.Value;
            }

            if (queueWorkItem.Description != queueWorkItemDto.Description)
            {
                queueWorkItem.Description = queueWorkItemDto.Description;
            }

            if (queueWorkItemDto.FileUrls != null)
            {
                queueWorkItem.FileUrls = queueWorkItemDto.FileUrls;
            }

            if (queueWorkItem.IsUserModified != queueWorkItemDto.IsUserModified)
            {
                queueWorkItem.IsUserModified = queueWorkItemDto.IsUserModified;
            }

            // Set the last modified timestamp
            queueWorkItem.LastModifiedOn = DateTimeOffset.UtcNow;

            // Mark the workitem as updated
            _unitOfWork.QueueTransactionRepo.Update(queueWorkItem);

            // Persist changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist workitem status update for ID {QueueWorkitemId}.", queueWorkItemDto.Id);
                return serviceResponse;
            }

            // Return successful response
            serviceResponse.Message = "Queue workitem updated successfully.";
            serviceResponse.Data = queueWorkItem.Adapt<QueueWorkItemDto>();
            serviceResponse.StatusCode = 200;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while updating workitem ID {QueueWorkitemId}.", queueWorkItemDto.Id);
        }

        return serviceResponse;
    }

    // Routes an existing work item to a specified destination queue.
    public async Task<ServiceResponse<bool>> RouteWorkItemAsync(RouteQueueWorkItemRequestDto routeQueueWorkItemRequestDto)
    {
        // Initialize the service response with a failure status.
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to move the work item. Please try again."
        };

        try
        {
            // Retrieve the work item to be moved, including its source queue information
            var workItem = await _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(w => w.Id == routeQueueWorkItemRequestDto.Id)
                .Include(i => i.Queue)
                .SingleOrDefaultAsync();

            if (workItem == null)
            {
                _logger.LogWarning("Work item {WorkItemId} was not found.", routeQueueWorkItemRequestDto.Id);
                serviceResponse.Message = "Work item not found.";
                return serviceResponse;
            }

            // Retrieve the destination queue and its existing transactions
            var destinationQueue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == routeQueueWorkItemRequestDto.QueueName.ToLower())
                .Include(i => i.QueueTransactions)
                .FirstOrDefaultAsync();

            if (destinationQueue == null)
            {
                _logger.LogWarning("Destination queue '{QueueName}' was not found.", routeQueueWorkItemRequestDto.QueueName);
                serviceResponse.Message = "Destination queue not found.";
                return serviceResponse;
            }

            // Load the destination queue schema used for validation
            var inputSchema = System.Text.Json.JsonSerializer.Deserialize<List<QueueSchemaDefinitionDto>>(
                destinationQueue.InputSchema ?? "[]",
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            ) ?? new List<QueueSchemaDefinitionDto>();

            // Build a collection of unique identifiers already present in the destination queue
            var existingUniqueKeys = new HashSet<string>(StringComparer.InvariantCultureIgnoreCase);

            foreach (var queueTransaction in destinationQueue.QueueTransactions ?? [])
            {
                var payload = queueTransaction.PayloadData ?? string.Empty;

                if (destinationQueue.IsStoredEncrypted)
                {
                    payload = _stringEncryptionService.DecryptString(payload);
                }

                var obj = JObject.Parse(payload);

                var key = string.Join("|",
                    inputSchema
                        .Where(w => w.IsUsedForUniqueIdentifier)
                        .Select(s => obj[s.Name]?.ToString() ?? string.Empty));

                existingUniqueKeys.Add(key);
            }

            // Ensure the work item contains payload data
            if (string.IsNullOrWhiteSpace(workItem.PayloadData))
            {
                serviceResponse.Message = "Work item payload is empty.";
                return serviceResponse;
            }

            // Parse the work item payload as a JSON object and wrap it in an array for validation
            var payloadArray = new JArray(JObject.Parse(workItem.PayloadData));

            // var movedItems = new List<QueueTransaction>();
            var hasErrors = false;

            // Validate and transform the payload
            foreach (var item in payloadArray)
            {
                var obj = item as JObject;

                if (obj == null)
                {
                    continue;
                }

                var errors = new List<string>();
                dynamic dynamicObject = CreateDynamicObjectFromSchema(inputSchema);

                var uniqueParts = new List<string>();

                foreach (var field in inputSchema)
                {
                    var value = obj[field.Name];

                    // Validate required fields
                    if (field.IsRequired &&
                        (value == null || string.IsNullOrWhiteSpace(value.ToString())))
                    {
                        errors.Add($"Missing required field: {field.Name}");
                        hasErrors = true;
                        _logger.LogWarning("Validation failed for work item {WorkItemId}. Missing required field '{FieldName}'.", workItem.Id, field.Name);
                    }

                    // Collect unique identifier values for duplicate detection
                    if (field.IsUsedForUniqueIdentifier &&
                        destinationQueue.IsUniqueReferencesEnforced)
                    {
                        uniqueParts.Add(value?.ToString() ?? string.Empty);
                    }

                    ((IDictionary<string, object>)dynamicObject)[field.Name] = value!;
                }

                // Verify the work item does not already exist in the destination queue
                if (destinationQueue.IsUniqueReferencesEnforced)
                {
                    var key = string.Join("|", uniqueParts);

                    if (existingUniqueKeys.Contains(key))
                    {
                        hasErrors = true;
                        _logger.LogWarning("Duplicate work item detected while moving work item {WorkItemId}. Unique key: {UniqueKey}", workItem.Id, key);
                    }

                    existingUniqueKeys.Add(key);
                }

                if (!errors.Any())
                {
                    var serializedPayload = JsonConvert.SerializeObject(dynamicObject);

                    if (destinationQueue.IsStoredEncrypted)
                    {
                        serializedPayload = _stringEncryptionService.EncryptString(serializedPayload);
                    }

                    // Update payload only if schema transformation modifies the data
                    workItem.PayloadData = serializedPayload;
                }
            }

            // Stop processing if validation fails
            if (hasErrors)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Work item validation failed. The work item was not moved.";

                return serviceResponse;
            }

            // Update the existing work item to point to the destination queue
            workItem.QueueId = destinationQueue.Id;
            workItem.Queue = null;
            
            // Mark the existing work item as updated
            _unitOfWork.QueueTransactionRepo.Update(workItem);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError(
                    "Failed to save changes while moving work item {WorkItemId} to queue '{DestinationQueue}'.",
                    workItem.Id,
                    destinationQueue.Name);
                serviceResponse.Data = false;
                return serviceResponse;
            }

            await _queueTransactionEventService.CreateQueueTransactionEventAsync(new QueueTransactionEventDto()
            {
                QueueTransactionId = workItem.Id,
                EventType = QueueTransactionEventEnum.QueueTransactionRouted,
                Data = destinationQueue.Name,
            });

            serviceResponse.StatusCode = 200;
            serviceResponse.Data = true;
            serviceResponse.Message = "Work item moved successfully.";

            return serviceResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "An error occurred while moving work item {WorkItemId} to queue '{DestinationQueue}'.",
                routeQueueWorkItemRequestDto.Id,
                routeQueueWorkItemRequestDto.QueueName);
        }

        return serviceResponse;
    }

    // Delete a workitem from the queue
    public async Task<ServiceResponse<bool>> RemoveWorkItemAsync(Guid workitemId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to remove queue workitem. Please try again."
        };

        try
        {
            // Retrieve the workitem to be deleted
            var queueWorkItem = await _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(w => w.Id == workitemId)
                .SingleOrDefaultAsync();

            if (queueWorkItem == null)
            {
                _logger.LogWarning("Queue Workitem Id {QueueWorkitemId} not found for deletion.", workitemId);
                serviceResponse.Message = "Queue workitem not found.";
                return serviceResponse;
            }

            // Delete the workitem from the queue
            _unitOfWork.QueueTransactionRepo.Delete(queueWorkItem);

            // Commit the changes to the database
            if (!await _unitOfWork.SaveAsync())

            {
                _logger.LogError("Failed to commit changes while removing workitem {QueueWorkitemId}.", workitemId);
                return serviceResponse;
            }

            // Successfully removed the workitem
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue workitem removed successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while removing workitem {QueueWorkitemId} from queue.", workitemId);
        }

        return serviceResponse;
    }

    // Deletes multiple queue workitems based on provided IDs.
    public async Task<ServiceResponse<bool>> DeleteQueueWorkItemsAsync(List<Guid> queueWorkitemIds)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Unable to delete queue workitems. Please try again."
        };

        try
        {
            // Fetch queue workitems that match the provided IDs
            var queueWorkitems = await _unitOfWork.QueueTransactionRepo
                                                     .GetByConditionAsync(w => queueWorkitemIds.Contains(w.Id))
                                                     .ToListAsync();

            // If no matching workitems are found, return early
            if (queueWorkitems.Count == 0)
            {
                _logger.LogInformation("No matching queue workitems found for deletion.");
                serviceResponse.Message = "No queue workitems found for the given IDs.";
                return serviceResponse;
            }

            // Perform deletion
            _unitOfWork.QueueTransactionRepo.Delete(queueWorkitems);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save changes to the database after attempting to delete queue workitems.");
                return serviceResponse;
            }

            // Deletion was successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{queueWorkitems.Count} queue workitems(s) successfully deleted.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An exception occurred while deleting queue workitems.");
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