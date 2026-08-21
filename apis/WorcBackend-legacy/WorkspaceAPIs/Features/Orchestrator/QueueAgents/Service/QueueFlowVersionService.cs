namespace WorkspaceAPIs.Services;

public class QueueFlowVersionService : IQueueFlowVersionService
{
    private readonly ILogger<QueueFlowVersionService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public QueueFlowVersionService(
        ILogger<QueueFlowVersionService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Extract the user ID from the HTTP context. Default to Guid.Empty if the user is not found.
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Fetches all queue flow versions for a specific Queue
    public async Task<ServiceResponse<IEnumerable<QueueFlowVersionDto>>> GetQueueFlowVersionsAsync(Guid queueId)
    {
        // Initialize serviceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<QueueFlowVersionDto>>
        {
            Data = null,
            Message = "Failed to retrieve queue flow versions. Please try again."
        };

        try
        {
            // Attempt to fetch queue flow versions by queueId and order by creation date
            var queueFlowVersions = await _unitOfWork.QueueFlowVersionRepo
                .GetByConditionAsync(w => w.QueueId == queueId)
                .OrderByDescending(q => q.CreatedOn)
                .Include(i => i.Queue)
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.Flow)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .ProjectToType<QueueFlowVersionDto>()
                .ToListAsync();

            // Successfully retrieved queue flow versions
            serviceResponse.Data = queueFlowVersions;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue flow versions retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error retrieving queue flow versions for Queue ID: {queueId}. Exception: {ex.Message}");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Fetch a specific queue flow version by its ID
    public async Task<ServiceResponse<QueueFlowVersionDto>> GetQueueFlowVersionByIdAsync(Guid queueFlowVersionId)
    {
        // Initialize serviceResponse with failed response
        var serviceResponse = new ServiceResponse<QueueFlowVersionDto>
        {
            Data = null,
            Message = "Failed to retrieve the queue flow version. Please try again."
        };

        try
        {
            // Attempt to fetch queue flow version by ID
            var queueFlowVersion = await _unitOfWork.QueueFlowVersionRepo
                .GetByConditionAsync(w => w.Id == queueFlowVersionId)
                .Include(i => i.Queue)
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.Flow)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .ProjectToType<QueueFlowVersionDto>()
                .SingleOrDefaultAsync();

            // Successfully retrieved the queue flow version
            serviceResponse.Data = queueFlowVersion;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue flow version retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error retrieving queue flow version with ID: {queueFlowVersionId}. Exception: {ex.Message}");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Insert a new queue flow version for a Queue
    public async Task<ServiceResponse<QueueFlowVersionDto>> InsertQueueFlowVersionAsync(QueueFlowVersionDto queueFlowVersionDto)
    {
        // Initialize serviceResponse with failed response
        var serviceResponse = new ServiceResponse<QueueFlowVersionDto>
        {
            Data = null,
            Message = "Failed to add the queue flow version. Please try again."
        };

        try
        {
            // Check if the queue flow version already exists for the same queue and flow version
            var existingQueueFlowVersion = await _unitOfWork.QueueFlowVersionRepo
                .GetByConditionAsync(w =>
                    w.QueueId == queueFlowVersionDto.QueueId &&
                    w.FlowVersionId == queueFlowVersionDto.FlowVersionId
                )
                .FirstOrDefaultAsync();

            if (existingQueueFlowVersion != null)
            {
                // If the queue flow version exists, return a conflict response
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "This flow version is already associated with this queue.";
                return serviceResponse;
            }

            // Trim string properties in the DTO to avoid unexpected characters or whitespace
            queueFlowVersionDto = TrimDtoStringPropsUtil.TrimDtoStringProps(queueFlowVersionDto);

            // Map the DTO to a QueueFlowVersion entity and set user-related properties
            var newQueueFlowVersion = queueFlowVersionDto.Adapt<QueueFlowVersion>();
            newQueueFlowVersion.CreatedByUserId = _userId;
            newQueueFlowVersion.LastModifiedByUserId = _userId;

            // Insert the new queue flow version into the repository
            await _unitOfWork.QueueFlowVersionRepo.InsertAsync(newQueueFlowVersion);

            // Ensure changes are saved
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Return the created queue flow version in the response
            serviceResponse.Data = newQueueFlowVersion.Adapt<QueueFlowVersionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue flow version created successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creating queue flow version for FlowVersion ID: {queueFlowVersionDto.FlowVersionId} and Queue ID: {queueFlowVersionDto.QueueId}. Exception: {ex.Message}");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Update an existing queue flow version
    public async Task<ServiceResponse<QueueFlowVersionDto>> UpdateQueueFlowVersionAsync(QueueFlowVersionDto queueFlowVersionDto)
    {
        // Initialize serviceResponse with failed response
        var serviceResponse = new ServiceResponse<QueueFlowVersionDto>
        {
            Data = null,
            Message = "Failed to update the queue flow version. Please try again."
        };

        try
        {
            // Fetch the existing queue flow version to be updated
            var queueFlowVersion = await _unitOfWork.QueueFlowVersionRepo
                .GetByConditionAsync(q => q.Id == queueFlowVersionDto.Id)
                .SingleOrDefaultAsync();

            if (queueFlowVersion == null)
            {
                // If the queue flow version doesn't exist, return an error message
                serviceResponse.Message = "Queue flow version does not exist.";
                return serviceResponse;
            }

            // Update the properties from the DTO
            queueFlowVersionDto.Adapt(queueFlowVersion);

            // Update the queue flow version in the repository
            _unitOfWork.QueueFlowVersionRepo.Update(queueFlowVersion);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Return the updated queue flow version in the response
            serviceResponse.Data = queueFlowVersion.Adapt<QueueFlowVersionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue flow version updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating queue flow version with ID: {queueFlowVersionDto.Id}. Exception: {ex.Message}");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Delete a queue flow version by its ID
    public async Task<ServiceResponse<bool>> DeleteQueueFlowVersionAsync(Guid queueFlowVersionId)
    {
        // Initialize serviceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to remove the queue flow version. Please try again."
        };

        try
        {
            // Fetch the queue flow version to be removed
            var queueFlowVersion = await _unitOfWork.QueueFlowVersionRepo
                .GetByConditionAsync(q => q.Id == queueFlowVersionId && q.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            if (queueFlowVersion == null)
            {
                // If the queue flow version doesn't exist, return an error message
                serviceResponse.Message = "Queue flow version does not exist.";
                return serviceResponse;
            }

            // Delete the queue flow version from the repository
            _unitOfWork.QueueFlowVersionRepo.Delete(queueFlowVersion);

            // Ensure changes are saved
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Return success message
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue flow version removed successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error removing queue flow version with ID: {queueFlowVersionId}. Exception: {ex.Message}");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Delete multiple queue flow versions by their IDs
    public async Task<ServiceResponse<bool>> DeleteQueueFlowVersionsAsync(IEnumerable<Guid> queueFlowVersionIds)
    {
        // Initialize serviceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to remove the queue flow versions. Please try again."
        };

        try
        {
            // Fetch the queue flow versions to be removed
            var queueFlowVersions = await _unitOfWork.QueueFlowVersionRepo
                .GetByConditionAsync(q => q.CreatedByUserId == _userId && queueFlowVersionIds.Contains(q.Id))
                .ToListAsync();

            if (queueFlowVersions.Count == 0)
            {
                // If no queue flow versions are found, return an error message
                serviceResponse.Message = "Queue flow versions do not exist.";
                return serviceResponse;
            }

            // Delete the queue flow versions from the repository
            _unitOfWork.QueueFlowVersionRepo.Delete(queueFlowVersions);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Return a success message with the count of removed versions
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{queueFlowVersionIds.Count()} queue flow versions removed successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error removing queue flow versions. Exception: {ex.Message}");
            return serviceResponse;
        }

        return serviceResponse;
    }
}
