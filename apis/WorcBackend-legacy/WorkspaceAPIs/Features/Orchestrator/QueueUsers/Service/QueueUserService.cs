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
    public async Task<ServiceResponse<IEnumerable<QueuesTableDto>>> GetMyQueuesAsync()
    {
        // Initialize the response with a default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<QueuesTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve your queues. Please try again later."
        };

        try
        {
            // Attempt to retrieve the list of users in the specified queue
            var queues = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.QueueUsers != null && w.QueueUsers.Any(a => a.UserId == _userId))
                .Include(i => i.QueueTransactions)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .ToListAsync();

            // On successful retrieval of queue users
            serviceResponse.Data = queues.Adapt<List<QueuesTableDto>>();
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
