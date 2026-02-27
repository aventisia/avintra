namespace WorkspaceAPIs.Services;

public class FlowVersionHistoryService : IFlowVersionHistoryService
{
    private readonly ILogger<FlowVersionHistoryService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public FlowVersionHistoryService(
        ILogger<FlowVersionHistoryService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves all flow version history records for a specific flow version, ordered by creation date in descending order (latest first).
    public async Task<ServiceResponse<IEnumerable<FlowVersionHistoryDto>>> GetAllAsync(Guid flowVersionId)
    {
        // Initialize the service response with default failure values
        var serviceResponse = new ServiceResponse<IEnumerable<FlowVersionHistoryDto>>
        {
            Data = null,
            Message = "Unable to retrieve flow version history records. Please try again."
        };

        try
        {
            // Fetch all history records for the given flow version ID
            // Sort the results by CreatedOn in descending order to get the latest versions first
            var records = await _unitOfWork.FlowVersionHistoryRepo
                .GetByConditionAsync(w => w.FlowVersionId == flowVersionId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.Flow)
                .OrderByDescending(o => o.CreatedOn)
                .ToListAsync();

            // Map the entity list to DTOs for returning to the client
            serviceResponse.Data = records.Adapt<IEnumerable<FlowVersionHistoryDto>>();

            // Set successful status and message
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version history records retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An exception occurred while retrieving flow version history records.");
        }

        // Return the final service response, whether successful or failed
        return serviceResponse;
    }

    // Retrieves a specific flow version history record by its unique identifier.
    public async Task<ServiceResponse<FlowVersionHistoryDetailDto>> GetByIdAsync(Guid flowVersionHistoryId)
    {
        // Initialize the serviceResponse with default failure values
        var serviceResponse = new ServiceResponse<FlowVersionHistoryDetailDto>
        {
            StatusCode = 400,
            Message = "Failed to retrieve the flow version history detail. Please try again."
        };

        try
        {
            // Attempt to find the flow version history by its Id
            var flowVersionHistory = await _unitOfWork.FlowVersionHistoryRepo
                .GetByConditionAsync(w => w.Id == flowVersionHistoryId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.Flow)
                .SingleOrDefaultAsync();

            // Check if the flow version history detail was found
            if (flowVersionHistory == null)
            {
                serviceResponse.Message = "Flow version history detail not found.";
                return serviceResponse;
            }

            // Map the entity to a DTO to return
            serviceResponse.Data = flowVersionHistory.Adapt<FlowVersionHistoryDetailDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version history detail retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An exception occurred while retrieving flow version history detail with Id: {flowVersionHistoryId}");
        }

        // Return the final service response, whether successful or failed
        return serviceResponse;
    }

    // Creates a new flow version history record in the system.
    public async Task<ServiceResponse<FlowVersionHistoryDto>> InsertAsync(FlowVersionHistoryDto flowVersionHistoryDto)
    {
        // Initialize the service response with default failure values
        var serviceResponse = new ServiceResponse<FlowVersionHistoryDto>
        {
            StatusCode = 400,
            Message = "Failed to create flow version history record. Please try again."
        };

        try
        {
            // Trim DTO string properties to remove unnecessary whitespace
            flowVersionHistoryDto = TrimDtoStringPropsUtil.TrimDtoStringProps(flowVersionHistoryDto);

            // Map the incoming DTO to a FlowVersionHistory entity
            var flowVersionHistory = flowVersionHistoryDto.Adapt<FlowVersionHistory>();

            // Set audit information
            flowVersionHistory.CreatedByUserId = _userId;
            flowVersionHistory.CreatedOn = DateTimeOffset.UtcNow;

            // Insert the new record into the repository
            await _unitOfWork.FlowVersionHistoryRepo.InsertAsync(flowVersionHistory);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("SaveChanges failed while creating flow version history record.");
                return serviceResponse;
            }

            // Map the saved entity back to a DTO and set success status
            serviceResponse.Data = flowVersionHistory.Adapt<FlowVersionHistoryDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version history record created successfully.";
        }
        catch (Exception ex)
        {
            // Log any exception that occurs during insertion
            _logger.LogError(ex, "An exception occurred while creating flow version history record.");
        }

        // Return the service response
        return serviceResponse;
    }

    // Updates an existing flow version history record.
    public async Task<ServiceResponse<FlowVersionHistoryDto>> UpdateAsync(FlowVersionHistoryDto flowVersionHistoryDto)
    {
        // Initialize the service response with default failure values
        var serviceResponse = new ServiceResponse<FlowVersionHistoryDto>
        {
            StatusCode = 400,
            Message = "Failed to update flow version history record. Please try again."
        };

        try
        {
            // Retrieve the existing flow version history record from the repository
            var flowVersionHistory = await _unitOfWork.FlowVersionHistoryRepo
                .GetByConditionAsync(w => w.Id == flowVersionHistoryDto.Id)
                .SingleOrDefaultAsync();

            // If the record does not exist, return an appropriate message
            if (flowVersionHistory == null)
            {
                serviceResponse.Message = "Flow version history record not found.";
                return serviceResponse;
            }

            // Trim DTO string properties to remove unnecessary whitespace
            flowVersionHistoryDto = TrimDtoStringPropsUtil.TrimDtoStringProps(flowVersionHistoryDto);

            // Map updated values from the DTO to the entity
            flowVersionHistory = flowVersionHistoryDto.Adapt(flowVersionHistory);

            // Update the record in the repository
            _unitOfWork.FlowVersionHistoryRepo.Update(flowVersionHistory);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("SaveChanges failed while updating flow version history record.");
                return serviceResponse;
            }

            // Map the updated entity back to a DTO and set success status
            serviceResponse.Data = flowVersionHistory.Adapt<FlowVersionHistoryDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version history record updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An exception occurred while updating flow version history record with Id: {flowVersionHistoryDto.Id}");
        }

        // Return the service response
        return serviceResponse;
    }

    // Deletes a single flow version history record by its unique identifier.
    public async Task<ServiceResponse<bool>> DeleteByIdAsync(Guid flowVersionHistoryId)
    {
        // Initialize the service response with default failure values
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete flow version history record. Please try again."
        };

        try
        {
            // Attempt to retrieve the flow version history record by Id
            var flowVersionHistory = await _unitOfWork.FlowVersionHistoryRepo
                .GetByConditionAsync(w => w.Id == flowVersionHistoryId)
                .SingleOrDefaultAsync();

            // If the record does not exist, return a message
            if (flowVersionHistory == null)
            {
                serviceResponse.Message = "Flow version history record not found.";
                return serviceResponse;
            }

            // Delete the retrieved record
            _unitOfWork.FlowVersionHistoryRepo.Delete(flowVersionHistory);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning($"SaveChanges failed while deleting flow version history record with Id: {flowVersionHistoryId}");
                return serviceResponse;
            }

            // Set successful status and message
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version history record deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An exception occurred while deleting flow version history record with Id: {flowVersionHistoryId}");
        }

        // Return the final service response
        return serviceResponse;
    }

    // Deletes multiple flow version history records using their unique identifiers.
    public async Task<ServiceResponse<bool>> DeleteMultipleAsync(IEnumerable<Guid> flowVersionHistoryIds)
    {
        // Initialize the service response with default failure values
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Unable to delete flow version history records. Please try again."
        };

        try
        {
            // Retrieve all records matching the provided identifiers
            var flowVersionHistories = await _unitOfWork.FlowVersionHistoryRepo
                .GetByConditionAsync(w => flowVersionHistoryIds.Contains(w.Id))
                .ToListAsync();

            // If no records found, return a message
            if (!flowVersionHistories.Any())
            {
                serviceResponse.Message = "No matching flow version history records found.";
                return serviceResponse;
            }

            // Delete all retrieved records
            _unitOfWork.FlowVersionHistoryRepo.Delete(flowVersionHistories);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("SaveChanges failed while deleting multiple flow version history records.");
                return serviceResponse;
            }

            // Set successful status and message
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version history records deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An exception occurred while deleting multiple flow version history records.");
        }

        // Return the final service response
        return serviceResponse;
    }

    public async Task<ServiceResponse<bool>> CreateHistoryIfReactFlowChangedAsync(FlowVersion flowVersion, FlowSilentUpdateDto flowSilentUpdateDto)
    {
        // Initialize the service response with default values (no changes detected)
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "No changes detected in React flow."
        };

        try
        {
            // Helper method: Normalize JSON string for accurate comparison
            // Converts null/empty strings to "{}" and serializes JSON in a consistent format
            string NormalizeJson(string? json)
            {
                if (string.IsNullOrWhiteSpace(json))
                    return "{}";

                using var doc = JsonDocument.Parse(json);
                return System.Text.Json.JsonSerializer.Serialize(doc.RootElement);
            }

            // Compare existing and new ReactFlow JSON after normalization
            bool hasChanged = NormalizeJson(flowVersion.ReactFlowObject) != NormalizeJson(flowSilentUpdateDto.ReactFlowObject);

            // Exit early if no changes detected
            if (!hasChanged)
            {
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "React flow content has not changed. No history record created.";
                return serviceResponse;
            }

            // Create a new FlowVersionHistory record using the OLD values
            // This preserves the previous state before any changes, which is crucial for versioning
            var flowVersionHistory = new FlowVersionHistory
            {
                FlowVersionId = flowVersion.Id,
                ReactFlowObject = flowSilentUpdateDto.ReactFlowObject,
                FlowVariablesObject = flowSilentUpdateDto.FlowVariablesObject,
                InputOutputObject = flowSilentUpdateDto.InputOutputObject,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
                CreatedOn = DateTimeOffset.UtcNow
            };

            // Insert the new history record into the repository
            await _unitOfWork.FlowVersionHistoryRepo.InsertAsync(flowVersionHistory);

            // Save changes to the database and check for failure
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("SaveChanges failed while inserting flow version history record.");
                return serviceResponse;
            }

            // Fetch all history records for this FlowVersion, ordered by newest first
            var flowVersionHistories = await _unitOfWork.FlowVersionHistoryRepo
                .GetByConditionAsync(x => x.FlowVersionId == flowVersion.Id)
                .OrderByDescending(x => x.CreatedOn)
                .AsNoTracking()
                .ToListAsync();

            // Keep only the latest 100 history records to avoid excessive data growth
            if (flowVersionHistories.Count > 100)
            {
                var historiesToDelete = flowVersionHistories.Skip(100).ToList();

                _unitOfWork.FlowVersionHistoryRepo.Delete(historiesToDelete);

                // Save changes after deleting old records and check for failure
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("SaveChanges failed while deleting old flow version history records.");
                    return serviceResponse;
                }
            }

            // Successfully created a new history record
            serviceResponse.StatusCode = 200;
            serviceResponse.Data = true;
            serviceResponse.Message = "Flow version history record created successfully.";

            return serviceResponse;
        }
        catch (Exception ex)
        {
            // Log any unexpected exceptions
            _logger.LogError(ex, $"Error occurred while creating history for FlowVersionId: {flowVersion.Id}");
            return serviceResponse;
        }
    }
}