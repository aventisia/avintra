namespace WorkspaceAPIs.Services;

public class QueueTableService : IQueueTableService
{
    private readonly ILogger<QueueTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public QueueTableService(
        ILogger<QueueTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IUploadFileService uploadFileService)
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
            Message = "Failed to retrive queues. Please try again"
        };

        try
        {
            // Get queues for the current user
            var queues = await _unitOfWork.QueueRepo
                .GetAllAsync()
                .OrderByDescending(o => o.CreatedOn)
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

    // Searches for queues by name
    public async Task<ServiceResponse<IEnumerable<QueuesTableDto>>> SearchQueuesAsync(string queueName)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<QueuesTableDto>>
        {
            Data = null,
            Message = "Failed to search queues. Please try again."
        };

        try
        {
            // Get queues by the name
            var queues = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.Name.ToLower() == queueName.ToLower())
                .OrderByDescending(o => o.CreatedOn)
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

            queuesTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(queuesTableDto);

            // Default mapping
            var newQueue = queuesTableDto.Adapt<Queue>();
            newQueue.CreatedByUserId = _userId;
            newQueue.LastModifiedByUserId = _userId;

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

            // Validate queue name uniqueness
            var queueAlreadyExists = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == queuesTableDto.Name.ToLower() &&
                    w.Id != queuesTableDto.Id
                )
                .FirstOrDefaultAsync();

            // Queue already exists
            if (queueAlreadyExists != null)
            {
                _logger.LogInformation("Queue name already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A queue with the same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto's string properties
            queuesTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(queuesTableDto);

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


    // Assigns multiple agents to an queue.
    public async Task<ServiceResponse<bool>> AssignAgentsAsync(Guid queueId, IEnumerable<Guid> agentIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to assign agents. Please try again."
        };

        try
        {
            // Check if queue IDs are unique.
            if (agentIds.Count() != agentIds.Distinct().Count())
            {
                _logger.LogInformation("Duplicate queue IDs detected.");
                serviceResponse.Message = "Queue IDs cannot contain duplicates.";
                return serviceResponse;
            }

            // Check if the queue exists and belongs to the current user.
            var queue = await _unitOfWork.QueueRepo
                        .GetByConditionAsync(w =>
                            w.Id == queueId && w.CreatedByUserId == _userId
                        )
                        .Include(a => a.QueueFlowVersions)
                        .FirstOrDefaultAsync();

            if (queue == null)
            {
                // If queue does not exist or does not belong to the current user, return failure.
                _logger.LogInformation("Queue not found.");
                serviceResponse.Message = "The queue does not exist.";
                return serviceResponse;
            }

            // Check if all provided queue IDs are valid and belong to the current user.
            var agents = await _unitOfWork.FlowVersionRepo
                        .GetByConditionAsync(w =>
                            agentIds.Contains(w.Id) && w.CreatedByUserId == _userId
                        )
                        .ToListAsync();

            var invalidAgnetIds = agentIds.Except(agents.Select(m => m.Id)).ToList();

            if (invalidAgnetIds.Any())
            {
                // If there are invalid queue IDs, return failure.
                _logger.LogInformation("Invalid queue IDs found: {InvalidAgnetIds}", string.Join(", ", invalidAgnetIds));
                serviceResponse.Message = $"The following queue IDs are invalid or do not belong to the user: {string.Join(", ", invalidAgnetIds)}";
                return serviceResponse;
            }

            // Identify agents that are already assigned to the queue.
            var existing = queue?.QueueFlowVersions?.ToList() ?? new List<QueueFlowVersion>();
            var existingIds = existing.Select(mf => mf.QueueId).ToList();

            // Identify new queue IDs that are not yet assigned to the queue.
            var newIds = agentIds.Except(existingIds).ToList();

            // Identify queue IDs that are no longer assigned and need to be removed.
            var removedIds = existingIds.Except(agentIds).ToList();

            // If no changes are made (no new agents, no agents to remove), inform the user.
            if (!newIds.Any() && !removedIds.Any())
            {
                _logger.LogInformation("No changes made; all provided agents are already assigned to the queue.");
                serviceResponse.Message = "No changes made to the queue assignments.";
                return serviceResponse;
            }

            // Create new QueueFlowVersion entries for agents not already assigned.
            var toAdd = newIds.Select(id => new QueueFlowVersion()
            {
                QueueId = id,
                FlowVersionId = queueId,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId
            }).ToList();

            // Remove existing QueuFlowVersion entries for agents that are no longer assigned.
            var toRemove = existing
                .Where(mf => removedIds.Contains(mf.QueueId))
                .ToList();

            // Begin the transaction to insert and remove data.
            if (toAdd.Any())
            {
                await _unitOfWork.QueueFlowVersionRepo.InsertAsync(toAdd);
            }

            if (toRemove.Any())
            {
                _unitOfWork.QueueFlowVersionRepo.Delete(toRemove);
            }

            // Attempt to save the changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                // If saving fails, log and return failure.
                _logger.LogInformation("Database save operation failed while assigning or updating agents.");
                serviceResponse.Message = "Failed to update agent assignments for the queue.";
                return serviceResponse;
            }

            // Return success with the count of newly assigned and removed agents.
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{newIds.Count} agents assigned and {removedIds.Count} agents removed from the queue.";
        }
        catch (Exception ex)
        {
            // Log any unexpected error.
            _logger.LogError(ex, "An unexpected error occurred while assigning agents.");
            return serviceResponse;
        }

        // Return the service response.
        return serviceResponse;
    }

    // Retrieve agent list
    public async Task<ServiceResponse<IEnumerable<AssignAgentQueueDto>>> GetAgentsAsync(Guid queueId)
    {
        // Initialize the response with a failed result
        var serviceResponse = new ServiceResponse<IEnumerable<AssignAgentQueueDto>>
        {
            Data = null,
            Message = "Failed to retrieve agents. Please try again."
        };

        try
        {
            // Check if the queue exists and belongs to the current user
            var queue = await _unitOfWork.QueueRepo
                                            .GetByConditionAsync(w =>
                                                w.Id == queueId &&
                                                w.CreatedByUserId == _userId)
                                            .Include(a => a.QueueFlowVersions)
                                            .FirstOrDefaultAsync();

            // Return an error if the queue doesn't exist
            if (queue == null)
            {
                _logger.LogInformation("Queue with ID {QueueId} not found for user {UserId}.", queueId, _userId);
                serviceResponse.Message = "The queue does not exist.";
                return serviceResponse;
            }

            // Retrieve all agents for the current user
            var agents = await _unitOfWork.FlowVersionRepo
                                            .GetByConditionAsync(w =>
                                                w.IsPublished &&
                                                w.CreatedByUserId == _userId)
                                            .Include(f => f.Flow)
                                            .ProjectToType<AssignAgentQueueDto>()
                                            .ToListAsync();

            // Set IsAssigned to true if the agent is already assigned to the queue
            agents.ForEach(a =>
            {
                a.IsAssigned = (queue.QueueFlowVersions ?? Enumerable.Empty<QueueFlowVersion>()).Any(mf => mf.FlowVersionId == a.Id);
                a.QueueId = queue.Id;
            });

            // Return the agents along with their assignment status
            serviceResponse.Data = agents;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Agents retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while retrieving agents for queue {QueueId}.", queueId);
            serviceResponse.Message = "An error occurred while retrieving agents from the queue.";
            return serviceResponse;
        }

        return serviceResponse;
    }

}
