namespace WorkspaceAPIs.Services;

public class FlowBlockService : IFlowBlockService
{
    private readonly ILogger<FlowBlockService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public FlowBlockService(
        ILogger<FlowBlockService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Extract user ID from JWT claims in the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves a list of flow blocks based on the specified refId.
    public async Task<ServiceResponse<IEnumerable<FlowBlockDto>>> GetFlowBlocksByIdAsync(Guid? refId)
    {
        // Initialize the response object with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<FlowBlockDto>>
        {
            Data = null,
            Message = "Failed to retrieve flow blocks. Please try again."
        };

        try
        {
            // Fetch flow blocks based on the provided ref id:
            var flowBlocks = await _unitOfWork.FlowBlockRepo
                .GetByConditionAsync(w =>
                    (w.Type == AccessTypesEnum.Public && w.RefId == null) ||
                    (w.Type == AccessTypesEnum.AgentLevel && w.RefId == refId) ||
                    (w.Type == AccessTypesEnum.TenantLevel && w.RefId == _tenantId)
                )
                .ProjectToType<FlowBlockDto>()
                .ToListAsync();

            // If successful, set the retrieved data, success status, and success message
            serviceResponse.Data = flowBlocks;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow blocks retrieved successfully.";

            // Log the success and the number of flow blocks retrieved for debugging and tracking
            _logger.LogInformation($"Successfully retrieved {flowBlocks.Count()} flow blocks for refId: {refId}. ");
        }
        catch (Exception ex)
        {
            // Log the exception details with the stack trace if an error occurs
            _logger.LogError(ex, $"Error occurred while retrieving flow blocks for refId: {refId}.");

        }

        // Return the final response
        return serviceResponse;
    }

    // Retrieves a flow block by its unique identifier (flowBlockId).
    public async Task<ServiceResponse<FlowBlockDto>> GetFlowBlockByIdAsync(Guid flowBlockId)
    {
        // Initialize the response object with default failure state
        var serviceResponse = new ServiceResponse<FlowBlockDto>
        {
            Data = null,
            Message = "Failed to retrieve block. Please try again."
        };

        try
        {
            // Fetch the flow block based on the provided flowBlockId
            var flowBlock = await _unitOfWork.FlowBlockRepo
                .GetByConditionAsync(w => w.Id == flowBlockId)
                .SingleOrDefaultAsync();

            // If the flow block does not exist, log the information and return the failure response
            if (flowBlock == null)
            {
                _logger.LogInformation($"Flow block with Id {flowBlockId} not found.");
                serviceResponse.Message = "Flow block not found.";
                return serviceResponse;
            }

            // Map the flow block entity to FlowBlockDto
            serviceResponse.Data = flowBlock.Adapt<FlowBlockDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow block retrieved successfully.";

            // Log the successful retrieval of the flow block
            _logger.LogInformation($"Successfully retrieved flow block with Id {flowBlockId}");
        }
        catch (Exception ex)
        {
            // Log any exception that occurs during the operation
            _logger.LogError(ex, $"Error retrieving flow block with Id {flowBlockId}");
        }

        // Return the final response
        return serviceResponse;
    }

    // Inserts a new flow block into the database.
    public async Task<ServiceResponse<FlowBlockDto>> InsertFlowBlockAsync(FlowBlockDto flowBlockDto)
    {
        // Initialize the response object with default failure state

        var serviceResponse = new ServiceResponse<FlowBlockDto>
        {
            Data = null,
            Message = "Failed to insert flow block. Please try again."
        };

        try
        {
            // Validate conditions based on Type and RefId
            if ((flowBlockDto.Type == AccessTypesEnum.AgentLevel || flowBlockDto.Type == AccessTypesEnum.TenantLevel) &&
                (flowBlockDto.RefId == null || flowBlockDto.RefId == Guid.Empty))
            {
                // Log the validation error
                _logger.LogError($"Validation failed for FlowBlock. Type: {flowBlockDto.Type}, RefId: {flowBlockDto.RefId}. RefId cannot be null or empty for AgentLevel or TenantLevel types.");

                // Set the response message indicating the validation issue
                serviceResponse.Message = "RefId cannot be null or empty.";
                return serviceResponse;
            }

            // Fetch existing flow block by RefId and Name
            var flowBlock = await _unitOfWork.FlowBlockRepo
                .GetByConditionAsync(w => w.RefId == flowBlockDto.RefId && w.Name.ToLower() == flowBlockDto.Name.ToLower())
                .SingleOrDefaultAsync();

            // Check if a flow block already exists
            if (flowBlock != null)
            {
                // Log the error if a FlowBlock already exists with the given FlowId
                _logger.LogError($"A flow block with RefId {flowBlockDto.RefId} already exists. Cannot add duplicate flow block.");

                // Set the response message to inform the user about the duplication
                serviceResponse.Message = "A flow block with the given refId already exists.";
            }

            // Trim string properties to ensure no unwanted whitespace in the DTO
            flowBlockDto = TrimDtoStringPropsUtil.TrimDtoStringProps(flowBlockDto);

            // Map the DTO to the FlowBlock entity
            var newBlock = flowBlockDto.Adapt<FlowBlock>();

            // Set the user details for created and modified fields
            newBlock.CreatedByUserId = _userId;
            newBlock.LastModifiedByUserId = _userId;

            // Insert the new flow block into the repository
            await _unitOfWork.FlowBlockRepo.InsertAsync(newBlock);

            // Attempt to save the new flow block entity into the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save new flow block.");
                return serviceResponse;
            }

            // Set success data in the response
            serviceResponse.Data = newBlock.Adapt<FlowBlockDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow block added successfully.";

            // Log the success of the operation
            _logger.LogInformation($"Flow block added successfully for RefId {newBlock.RefId}. Created by UserId {newBlock.CreatedByUserId}.");
        }
        catch (Exception ex)
        {
            // Log any exception that occurs during the insert operation
            _logger.LogError(ex, "Exception occurred while adding a new flow block.");

        }

        // Return the final response
        return serviceResponse;
    }

    // Updates the properties of an existing flow block in the database.
    public async Task<ServiceResponse<FlowBlockDto>> UpdateFlowBlockAsync(FlowBlockDto flowBlockDto)
    {
        // Initialize the response object with the default failure state
        var serviceResponse = new ServiceResponse<FlowBlockDto>
        {
            Data = null,
            Message = "Failed to update flow block. Please try again."
        };

        try
        {
            // Validate conditions based on Type and RefId
            if ((flowBlockDto.Type == AccessTypesEnum.AgentLevel || flowBlockDto.Type == AccessTypesEnum.TenantLevel) &&
                (flowBlockDto.RefId == null || flowBlockDto.RefId == Guid.Empty))
            {
                // Log the validation error
                _logger.LogError($"Validation failed for FlowBlock. Type: {flowBlockDto.Type}, RefId: {flowBlockDto.RefId}. RefId cannot be null or empty for AgentLevel or TenantLevel types.");

                // Set the response message indicating the validation issue
                serviceResponse.Message = "RefId cannot be null or empty.";
                return serviceResponse;
            }

            // Retrieve the existing flow block entity from the repository using the provided Id
            var flowBlock = await _unitOfWork.FlowBlockRepo
                .GetByConditionAsync(w => w.Id == flowBlockDto.Id && w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // If the flow block doesn't exist, return an appropriate response
            if (flowBlock == null)
            {
                _logger.LogInformation($"Flow block with Id {flowBlockDto.Id} not found.");
                serviceResponse.Message = "Flow block not found.";
                return serviceResponse;
            }

            // Trim string properties of the DTO to remove unnecessary whitespace
            flowBlockDto = TrimDtoStringPropsUtil.TrimDtoStringProps(flowBlockDto);

            // Update the properties of the flow block with the provided data from the DTO
            flowBlock.Name = flowBlockDto.Name;
            flowBlock.Description = flowBlockDto.Description;
            flowBlock.Type = flowBlockDto.Type;
            flowBlock.ReactFlowObject = flowBlockDto.ReactFlowObject;
            flowBlock.FlowVariablesObject = flowBlockDto.FlowVariablesObject;
            flowBlock.InputOutputObject = flowBlockDto.InputOutputObject;
            flowBlock.LastModifiedByUserId = _userId;

            // Mark the entity as updated in the repository
            _unitOfWork.FlowBlockRepo.Update(flowBlock);

            // Attempt to save the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning($"Failed to save update for flow block with Id {flowBlock.Id}");
                return serviceResponse;
            }

            // On successful save, return the updated flow block and set success message
            serviceResponse.Data = flowBlock.Adapt<FlowBlockDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow block updated successfully.";

            // Log the success with the updated flow block's Id
            _logger.LogInformation($"Flow block with Id {flowBlock.Id} updated successfully.");
        }
        catch (Exception ex)
        {
            // Log the exception in case of an error during the update process
            _logger.LogError(ex, $"Exception while updating flow block with Id {flowBlockDto.Id}");
        }

        // Return the final response
        return serviceResponse;
    }

    // Deletes a flow block from the database based on the provided flow block Id.
    public async Task<ServiceResponse<bool>> DeleteFlowBlockAsync(Guid flowBlockId)
    {
        // Initialize the response object with default failure state
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete flow block. Please try again."
        };

        try
        {
            // Retrieve the flow block entity from the repository based on the provided Id
            var flowBlock = await _unitOfWork.FlowBlockRepo
                .GetByConditionAsync(w => w.Id == flowBlockId && w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // If the flow block doesn't exist, log and return the appropriate failure message
            if (flowBlock == null)
            {
                _logger.LogInformation($"Flow block with Id {flowBlockId} not found.");
                serviceResponse.Message = "Flow block not found.";
                return serviceResponse;
            }

            // Delete the flow block from the repository
            _unitOfWork.FlowBlockRepo.Delete(flowBlock);

            // Attempt to save the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning($"Failed to save deletion of flow block with Id {flowBlockId}");
                return serviceResponse;
            }

            // On successful deletion, set success values in the response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow block deleted successfully.";

            // Log the successful deletion of the flow block
            _logger.LogInformation($"Flow block with Id {flowBlockId} deleted successfully.");
        }
        catch (Exception ex)
        {
            // Log the exception details in case of an error during the deletion process
            _logger.LogError(ex, $"Error occurred while deleting flow block with Id {flowBlockId}");
        }

        // Return the final response
        return serviceResponse;
    }

    // Deletes multiple flow blocks from the database based on the provided list of flow block IDs.
    public async Task<ServiceResponse<bool>> DeleteMultipleFlowBlocksAsync(IEnumerable<Guid> flowBlockIds)
    {
        // Initialize the response object with default failure state
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete flow blocks. Please try again."
        };

        try
        {
            // Retrieve the list of flow blocks that match the provided flow block IDs
            var flowBlocks = await _unitOfWork.FlowBlockRepo
                .GetByConditionAsync(w => w.CreatedByUserId == _userId && flowBlockIds.Contains(w.Id))
                .ToListAsync();

            // If no flow blocks are found, log and return the appropriate failure message
            if (!flowBlocks.Any())
            {
                _logger.LogInformation("No flow blocks found for the provided IDs.");
                serviceResponse.Message = "No blocks found to delete.";
                return serviceResponse;
            }

            // Delete the matching flow blocks from the repository
            _unitOfWork.FlowBlockRepo.Delete(flowBlocks);

            // Attempt to save the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save multiple flow block deletions.");
                return serviceResponse;
            }

            // On successful deletion, set success values in the response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow blocks deleted successfully.";

            // Log the successful deletion with the count of deleted flow blocks
            _logger.LogInformation($"Deleted {flowBlocks.Count} flow block(s).");
        }
        catch (Exception ex)
        {
            // Log the exception details in case of an error during the deletion process
            _logger.LogError(ex, "Exception occurred while deleting multiple flow blocks.");
        }

        // Return the final response
        return serviceResponse;
    }
}
