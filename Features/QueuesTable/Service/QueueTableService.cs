namespace WorkspaceAPIs.Services;

public class QueueTableService : IQueueTableService
{
    private readonly ILogger<QueueTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public QueueTableService(
        ILogger<QueueTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Checks the availability of a queue name.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsQueueNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check queue name availability. Please try again"
        };

        try
        {
            // Validate queue uniqueness
            var queueAlreadyExists = await _unitOfWork.QueueRepo
                                                     .GetByConditionAsync(w =>
                                                        w.CreatedByUserId == _userId &&
                                                        w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
                                                     .FirstOrDefaultAsync();

            // Queue already exists
            if (queueAlreadyExists != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "A queue with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue name is available";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Fetches all queues with optional filters
    public async Task<ServiceResponse<IEnumerable<QueuesTableDto>>> GetAllQueuesAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<QueuesTableDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Get queues for the current user
            var queues = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.CreatedByUserId == _userId)
                .OrderByDescending(w => w.CreatedOn)
                .ProjectToType<QueuesTableDto>()
                .ToListAsync();

            // Task successful
            serviceResponse.Data = queues;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queues retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Fetches the details of a specific queue by its ID
    public async Task<ServiceResponse<QueuesTableDto>> GetQueueByIdAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<QueuesTableDto>
        {
            Data = null,
            StatusCode = 400,
            Message = "Queue not found"
        };

        try
        {
            // Get the specific queue
            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.Id == id && w.CreatedByUserId == _userId)
                .FirstOrDefaultAsync();

            // Check if queue exists
            if (queue == null)
            {
                serviceResponse.Message = "Queue not found";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = queue.Adapt<QueuesTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Creates a new queue
    public async Task<ServiceResponse<QueuesTableDto>> InsertQueueAsync(QueuesTableDto queuesTableDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<QueuesTableDto>
        {
            Data = null,
            Message = "Failed to create queue. Please try again"
        };

        try
        {
            // Validate queue uniqueness
            var queueAlreadyExists = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.Name.ToLower() == queuesTableDto.Name.ToLower() && w.CreatedByUserId == _userId)
                .FirstOrDefaultAsync();

            // Queue already exists
            if (queueAlreadyExists != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A queue with the same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Default mapping
            var newQueue = queuesTableDto.Adapt<Queue>();
            newQueue.CreatedByUserId = _userId;

            // Insert queue
            await _unitOfWork.QueueRepo.InsertAsync(newQueue);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while creating a new queue");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newQueue.Adapt<QueuesTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates an existing queue
    public async Task<ServiceResponse<QueuesTableDto>> UpdateQueueAsync(QueuesTableDto queuesTableDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<QueuesTableDto>
        {
            Data = null,
            Message = "Failed to update queue. Please try again"
        };

        try
        {
            // Validate queue existence
            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.Id == queuesTableDto.Id && w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // Queue does not exist
            if (queue == null)
            {
                serviceResponse.Message = "Queue does not exist";
                return serviceResponse;
            }

            // Update queue
            queuesTableDto.Adapt(queue);
            queue.LastModifiedByUserId = _userId;
            queue.LastModifiedOn = DateTimeOffset.UtcNow;

            _unitOfWork.QueueRepo.Update(queue);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating queue");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = queue.Adapt<QueuesTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes a specific queue by its ID
    public async Task<ServiceResponse<bool>> DeleteQueueAsync(Guid queueId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete queue. Please try again"
        };

        try
        {
            // Validate queue existence
            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.Id == queueId && w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // Queue does not exist
            if (queue == null)
            {
                serviceResponse.Message = "Queue does not exist";
                return serviceResponse;
            }

            // Delete queue
            _unitOfWork.QueueRepo.Delete(queue);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting queue");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes multiple queues by their IDs.
    public async Task<ServiceResponse<bool>> DeleteQueuesAsync(List<Guid> queueIds)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete queues. Please try again"
        };

        try
        {
            // Validate flows existence
            var queues = await _unitOfWork.QueueRepo
                                            .GetByConditionAsync(w =>
                                                w.CreatedByUserId == _userId &&
                                                queueIds.Contains(w.Id))
                                            .ToListAsync();

            // Flows do not exist
            if (queues.Count == 0)
            {
                _logger.LogInformation($"Queues do not exist");
                serviceResponse.Message = "Queues do not exist";
                return serviceResponse;
            }

            // TODO: Check queues relationship with other entities

            // Delete queues
            _unitOfWork.QueueRepo.Delete(queues);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting queues");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{queueIds.Count} queues deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}