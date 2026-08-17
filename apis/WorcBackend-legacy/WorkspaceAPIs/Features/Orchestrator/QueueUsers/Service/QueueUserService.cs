namespace WorkspaceAPIs.Services;

public class QueueUserService : IQueueUserService
{
    private readonly ILogger<QueueUserService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public QueueUserService(
        ILogger<QueueUserService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Extract the user ID from the HTTP context. Default to Guid.Empty if the user is not found.
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves the queues that the user is associated with
    public async Task<ServiceResponse<IEnumerable<QueuesTableDto>>> GetMyQueuesAsync(DateTimeOffset? from = null, DateTimeOffset? to = null)
    {
        // Initialize the response with a default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<QueuesTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve your queues. Please try again later."
        };

        try
        {
            // A user can be associated with a queue in two ways:
            //   1. A legacy QueueUser record (created when the queue is created or
            //      via the older "assign users" flow).
            //   2. A ResourceShare record (created by the "Share" feature).
            // The Assist > Queues screen must show queues from BOTH sources, otherwise
            // users assigned via Share won't see the queue. The Queue entity's global
            // space query filter still applies, so only queues in the currently
            // selected space are returned.
            var sharedQueueIds = await _unitOfWork.ResourceShareRepo
                .GetByConditionAsync(w =>
                    w.UserId == _userId &&
                    w.ResourceType == ResourceTypeEnum.Queue)
                .Select(s => s.ResourceId)
                .ToListAsync();

            var queues = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w =>
                    w.Type == QueueTypesEnum.User &&
                    (
                        (w.QueueUsers != null && w.QueueUsers.Any(a => a.UserId == _userId)) ||
                        sharedQueueIds.Contains(w.Id)
                    ))
                .Include(i => i.QueueTransactions)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .ToListAsync();

            // Map to DTOs, then override the completed count and average processing
            // time to reflect only items closed within the requested date range.
            var queueDtoList = queues.Adapt<List<QueuesTableDto>>();

            // Normalize the range to whole days (UTC). When not provided, default
            // to today. The frontend sends full timestamps, so we snap `from` to
            // the start of its day and `to` to the end of its day.
            var rangeFrom = (from ?? DateTimeOffset.UtcNow).Date;
            var rangeTo = (to ?? DateTimeOffset.UtcNow).Date.AddDays(1).AddTicks(-1);

            foreach (var dto in queueDtoList)
            {
                var queue = queues.FirstOrDefault(q => q.Id == dto.Id);
                if (queue?.QueueTransactions == null) continue;

                // A "closed" item is one that is no longer active: Completed, Failed,
                // or any disposition status (e.g. Approved, Contracted, Meetings).
                var closedInRange = queue.QueueTransactions
                    .Where(c =>
                        c.Status != QueueTransactionStatusTypesEnum.Pending.ToString() &&
                        c.Status != QueueTransactionStatusTypesEnum.InProgress.ToString() &&
                        c.LastModifiedOn >= rangeFrom &&
                        c.LastModifiedOn <= rangeTo)
                    .ToList();

                dto.Completed = closedInRange.Count;
                dto.AverageProcessingTimeSeconds = closedInRange.Count > 0
                    ? closedInRange.Average(c => (c.LastModifiedOn - c.CreatedOn).TotalSeconds)
                    : 0;
            }

            // On successful retrieval of queue users
            serviceResponse.Data = queueDtoList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queues retrieved successfully.";
            _logger.LogInformation($"Fetched {queues.Count} users for User ID: {_userId}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"An error occurred while retrieving your queues for User ID: {_userId}. Exception: {ex.Message}");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves the Agent-type queues that the user has access to.
    // A user can access an agent queue via a legacy QueueUser record or a
    // ResourceShare record, mirroring GetMyQueuesAsync but for Agent queues.
    public async Task<ServiceResponse<IEnumerable<QueuesTableDto>>> GetMyAgentQueuesAsync(DateTimeOffset? from = null, DateTimeOffset? to = null)
    {
        // Initialize the response with a default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<QueuesTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve your agent queues. Please try again later."
        };

        try
        {
            // A user can be associated with an agent queue in the same two ways
            // as user queues: a legacy QueueUser record or a ResourceShare record.
            var sharedQueueIds = await _unitOfWork.ResourceShareRepo
                .GetByConditionAsync(w =>
                    w.UserId == _userId &&
                    w.ResourceType == ResourceTypeEnum.Queue)
                .Select(s => s.ResourceId)
                .ToListAsync();

            var queues = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w =>
                    w.Type == QueueTypesEnum.Agent &&
                    (
                        (w.QueueUsers != null && w.QueueUsers.Any(a => a.UserId == _userId)) ||
                        sharedQueueIds.Contains(w.Id)
                    ))
                .Include(i => i.QueueTransactions)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .ToListAsync();

            // Map to DTOs, then override the completed count and average processing
            // time to reflect only items closed within the requested date range.
            var queueDtoList = queues.Adapt<List<QueuesTableDto>>();

            // Normalize the range to whole days (UTC). When not provided, default
            // to today. The frontend sends full timestamps, so we snap `from` to
            // the start of its day and `to` to the end of its day.
            var rangeFrom = (from ?? DateTimeOffset.UtcNow).Date;
            var rangeTo = (to ?? DateTimeOffset.UtcNow).Date.AddDays(1).AddTicks(-1);

            foreach (var dto in queueDtoList)
            {
                var queue = queues.FirstOrDefault(q => q.Id == dto.Id);
                if (queue?.QueueTransactions == null) continue;

                // A "closed" item is one that is no longer active: Completed, Failed,
                // or any disposition status (e.g. Approved, Contracted, Meetings).
                var closedInRange = queue.QueueTransactions
                    .Where(c =>
                        c.Status != QueueTransactionStatusTypesEnum.Pending.ToString() &&
                        c.Status != QueueTransactionStatusTypesEnum.InProgress.ToString() &&
                        c.LastModifiedOn >= rangeFrom &&
                        c.LastModifiedOn <= rangeTo)
                    .ToList();

                dto.Completed = closedInRange.Count;
                dto.AverageProcessingTimeSeconds = closedInRange.Count > 0
                    ? closedInRange.Average(c => (c.LastModifiedOn - c.CreatedOn).TotalSeconds)
                    : 0;
            }

            // On successful retrieval
            serviceResponse.Data = queueDtoList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Agent queues retrieved successfully.";
            _logger.LogInformation($"Fetched {queues.Count} agent queues for User ID: {_userId}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"An error occurred while retrieving your agent queues for User ID: {_userId}. Exception: {ex.Message}");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Fetches all queue users for a specific Queue
    public async Task<ServiceResponse<IEnumerable<QueueUserDto>>> GetQueueUsersAsync(Guid queueId)
    {
        // Initialize serviceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<QueueUserDto>>
        {
            Data = null,
            Message = "Failed to retrieve queue users. Please try again."
        };

        try
        {
            // Attempt to fetch queue users by queueId and order by creation date
            var queueUsers = await _unitOfWork.QueueUserRepo
                .GetByConditionAsync(w => w.QueueId == queueId)
                .OrderByDescending(q => q.CreatedOn)
                .Include(i => i.Queue)
                .Include(i => i.User)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .ProjectToType<QueueUserDto>()
                .ToListAsync();

            // Successfully retrieved queue users
            serviceResponse.Data = queueUsers;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue users retrieved successfully.";
            _logger.LogInformation($"Successfully retrieved {queueUsers.Count} queue users for Queue ID: {queueId}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error retrieving queue users for Queue ID: {queueId}. Exception: {ex.Message}");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Fetch a specific queue user by their ID
    public async Task<ServiceResponse<QueueUserDto>> GetQueueUserByIdAsync(Guid queueUserId)
    {
        // Initialize serviceResponse with failed response
        var serviceResponse = new ServiceResponse<QueueUserDto>
        {
            Data = null,
            Message = "Failed to retrieve the queue user. Please try again."
        };

        try
        {
            // Attempt to fetch queue user by ID
            var queueUser = await _unitOfWork.QueueUserRepo
                .GetByConditionAsync(w => w.Id == queueUserId)
                .Include(i => i.Queue)
                .Include(i => i.User)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .ProjectToType<QueueUserDto>()
                .SingleOrDefaultAsync();

            // Successfully retrieved the queue user
            serviceResponse.Data = queueUser;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue user retrieved successfully.";
            _logger.LogInformation($"Successfully retrieved queue user with ID: {queueUserId}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error retrieving queue user with ID: {queueUserId}. Exception: {ex.Message}");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Insert a new queue user for a Queue
    public async Task<ServiceResponse<QueueUserDto>> InsertQueueUserAsync(QueueUserDto queueUserDto)
    {
        // Initialize serviceResponse with failed response
        var serviceResponse = new ServiceResponse<QueueUserDto>
        {
            Data = null,
            Message = "Failed to add the queue user. Please try again."
        };

        try
        {
            // Check if the queue user already exists for the same queue and user
            var existingQueueUser = await _unitOfWork.QueueUserRepo
                .GetByConditionAsync(w =>
                    w.QueueId == queueUserDto.QueueId &&
                    w.UserId == queueUserDto.UserId
                )
                .FirstOrDefaultAsync();

            if (existingQueueUser != null)
            {
                // If the queue user exists, return a conflict response
                _logger.LogInformation($"queue user already exists for User ID: {queueUserDto.UserId} and Queue ID: {queueUserDto.QueueId}");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "This user is already associated with this queue.";
                return serviceResponse;
            }

            // Trim string properties in the DTO to avoid unexpected characters or whitespace
            queueUserDto = TrimDtoStringPropsUtil.TrimDtoStringProps(queueUserDto);

            // Map the DTO to a QueueUser entity and set user-related properties
            var newQueueUser = queueUserDto.Adapt<QueueUser>();
            newQueueUser.TenantId = _tenantId;
            newQueueUser.CreatedByUserId = _userId;
            newQueueUser.LastModifiedByUserId = _userId;

            // Insert the new queue user into the repository
            await _unitOfWork.QueueUserRepo.InsertAsync(newQueueUser);

            // Ensure changes are saved
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while inserting new queue user.");
                return serviceResponse;
            }

            // Return the created queue user in the response
            serviceResponse.Data = newQueueUser.Adapt<QueueUserDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue user created successfully.";
            _logger.LogInformation($"queue user with User ID: {queueUserDto.UserId} successfully created for Queue ID: {queueUserDto.QueueId}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creating queue user for User ID: {queueUserDto.UserId} and Queue ID: {queueUserDto.QueueId}. Exception: {ex.Message}");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Update an existing queue user 
    public async Task<ServiceResponse<QueueUserDto>> UpdateQueueUserAsync(QueueUserDto queueUserDto)
    {
        // Initialize serviceResponse with failed response
        var serviceResponse = new ServiceResponse<QueueUserDto>
        {
            Data = null,
            Message = "Failed to update the queue user. Please try again."
        };

        try
        {
            // Fetch the existing queue user to be updated
            var queueUser = await _unitOfWork.QueueUserRepo
                .GetByConditionAsync(q => q.Id == queueUserDto.Id)
                .SingleOrDefaultAsync();

            if (queueUser == null)
            {
                // If the queue user doesn't exist, return an error message
                _logger.LogInformation($"queue user with ID: {queueUserDto.Id} not found for User ID: {_userId}");
                serviceResponse.Message = "queue user does not exist.";
                return serviceResponse;
            }

            // Update the properties from the DTO
            queueUserDto.Adapt(queueUser);

            // Update the queue user in the repository
            _unitOfWork.QueueUserRepo.Update(queueUser);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation($"Failed to save changes while updating queue user with ID: {queueUserDto.Id}");
                return serviceResponse;
            }

            // Return the updated queue user in the response
            serviceResponse.Data = queueUser.Adapt<QueueUserDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue user updated successfully.";
            _logger.LogInformation($"queue user with ID: {queueUserDto.Id} updated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating queue user with ID: {queueUserDto.Id}. Exception: {ex.Message}");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Delete a queue user by their ID
    public async Task<ServiceResponse<bool>> DeleteQueueUserAsync(Guid queueUserId)
    {
        // Initialize serviceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to remove the queue user. Please try again."
        };

        try
        {
            // Fetch the queue user to be removed
            var queueUser = await _unitOfWork.QueueUserRepo
                .GetByConditionAsync(q => q.Id == queueUserId && q.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            if (queueUser == null)
            {
                // If the queue user doesn't exist, return an error message
                _logger.LogInformation($"queue user with ID: {queueUserId} not found for User ID: {_userId}");
                serviceResponse.Message = "queue user does not exist.";
                return serviceResponse;
            }

            // Delete the queue user from the repository
            _unitOfWork.QueueUserRepo.Delete(queueUser);

            // Ensure changes are saved
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation($"Failed to save changes while removing queue user with ID: {queueUserId}");
                return serviceResponse;
            }

            // Return success message
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "queue user removed successfully.";
            _logger.LogInformation($"queue user with ID: {queueUserId} removed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error removing queue user with ID: {queueUserId}. Exception: {ex.Message}");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Delete multiple queue users by their IDs
    public async Task<ServiceResponse<bool>> DeleteQueueUsersAsync(IEnumerable<Guid> queueUserIds)
    {
        // Initialize serviceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to remove the queue users. Please try again."
        };

        try
        {
            // Fetch the queue users to be removed
            var queueUsers = await _unitOfWork.QueueUserRepo
                .GetByConditionAsync(q => q.CreatedByUserId == _userId && queueUserIds.Contains(q.Id))
                .ToListAsync();

            if (queueUsers.Count == 0)
            {
                // If no queue users are found, return an error message
                _logger.LogInformation("No queue users found to remove.");
                serviceResponse.Message = "Queue users do not exist.";
                return serviceResponse;
            }

            // Delete the queue users from the repository
            _unitOfWork.QueueUserRepo.Delete(queueUsers);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while removeing queue users.");
                return serviceResponse;
            }

            // Return a success message with the count of removed users
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{queueUserIds.Count()} queue users removed successfully.";
            _logger.LogInformation($"{queueUserIds.Count()} queue users removed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error removing queue users. Exception: {ex.Message}");
            return serviceResponse;
        }

        return serviceResponse;
    }
}
