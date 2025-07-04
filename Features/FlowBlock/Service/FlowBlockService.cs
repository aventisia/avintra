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

    // Retrieves a list of blocks based on the specified flowId.
    public async Task<ServiceResponse<IEnumerable<FlowBlockDto>>> GetFlowBlocksByIdAsync(Guid? flowVersionId)
    {
        // Initialize the response object with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<FlowBlockDto>>
        {
            Data = null,
            Message = "Failed to retrieve blocks. Please try again."
        };

        try
        {
            // Fetch blocks based on the provided ref id:
            var flowBlocks = await _unitOfWork.FlowBlockRepo
                .GetByConditionAsync(w =>
                    w.FlowVersion.IsPublished &&
                    (
                        w.Type == AccessTypesEnum.Public ||
                        (w.Type == AccessTypesEnum.TenantLevel && w.TenantId == _tenantId) ||
                        (w.Type == AccessTypesEnum.AgentLevel && w.FlowVersionId == flowVersionId)
                    )
                )
                .Include(i => i.FlowVersion)
                .ProjectToType<FlowBlockDto>()
                .ToListAsync();

            // If successful, set the retrieved data, success status, and success message
            serviceResponse.Data = flowBlocks;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Blocks retrieved successfully.";

            // Log the success and the number of blocks retrieved for debugging and tracking
            _logger.LogInformation($"Successfully retrieved {flowBlocks.Count()} blocks for flowVersionId: {flowVersionId}. ");
        }
        catch (Exception ex)
        {
            // Log the exception details with the stack trace if an error occurs
            _logger.LogError(ex, $"Error occurred while retrieving blocks for flowVersionId: {flowVersionId}.");

        }

        // Return the final response
        return serviceResponse;
    }

    // Retrieves a block by its unique identifier (flowBlockId).
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
            // Fetch the block based on the provided flowBlockId
            var flowBlock = await _unitOfWork.FlowBlockRepo
                .GetByConditionAsync(w => w.Id == flowBlockId && w.FlowVersion.IsPublished)
                .Include(i => i.FlowVersion)
                .SingleOrDefaultAsync();

            // If the block does not exist, log the information and return the failure response
            if (flowBlock == null)
            {
                _logger.LogInformation($"block with Id {flowBlockId} not found.");
                serviceResponse.Message = "Block not found.";
                return serviceResponse;
            }

            // Map the block entity to FlowBlockDto
            serviceResponse.Data = flowBlock.Adapt<FlowBlockDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Block retrieved successfully.";

            // Log the successful retrieval of the block
            _logger.LogInformation($"Successfully retrieved block with Id {flowBlockId}");
        }
        catch (Exception ex)
        {
            // Log any exception that occurs during the operation
            _logger.LogError(ex, $"Error retrieving block with Id {flowBlockId}");
        }

        // Return the final response
        return serviceResponse;
    }

    // Inserts a new block into the database.
    public async Task<ServiceResponse<FlowBlockDto>> InsertFlowBlockAsync(FlowBlockDto flowBlockDto)
    {
        // Initialize the response object with default failure state

        var serviceResponse = new ServiceResponse<FlowBlockDto>
        {
            Data = null,
            Message = "Failed to insert block. Please try again."
        };

        try
        {
            // Fetch existing block by RefId and Name
            var flowBlock = await _unitOfWork.FlowBlockRepo
                .GetByConditionAsync(w => w.FlowVersionId == flowBlockDto.FlowVersionId && w.Name.ToLower() == flowBlockDto.Name.ToLower())
                .SingleOrDefaultAsync();

            // Check if a block already exists
            if (flowBlock != null)
            {
                // Log the error if a FlowBlock already exists with the given FlowId
                _logger.LogError($"A block with FlowVersionId {flowBlockDto.FlowVersionId} already exists. Cannot add duplicate block.");

                // Set the response message to inform the user about the duplication
                serviceResponse.Message = "A block with the given flowVersionId already exists.";
            }

            // Trim string properties to ensure no unwanted whitespace in the DTO
            flowBlockDto = TrimDtoStringPropsUtil.TrimDtoStringProps(flowBlockDto);

            // Map the DTO to the FlowBlock entity
            var newBlock = flowBlockDto.Adapt<FlowBlock>();

            // Set the user details for created and modified fields
            newBlock.CreatedByUserId = _userId;
            newBlock.LastModifiedByUserId = _userId;

            // Insert the new block into the repository
            await _unitOfWork.FlowBlockRepo.InsertAsync(newBlock);

            // Attempt to save the new block entity into the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save new block.");
                return serviceResponse;
            }

            // Set success data in the response
            serviceResponse.Data = newBlock.Adapt<FlowBlockDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Block added successfully.";

            // Log the success of the operation
            _logger.LogInformation($"Block added successfully for flowVersionId {newBlock.FlowVersionId}. Created by UserId {newBlock.CreatedByUserId}.");
        }
        catch (Exception ex)
        {
            // Log any exception that occurs during the insert operation
            _logger.LogError(ex, "Exception occurred while adding a new block.");

        }

        // Return the final response
        return serviceResponse;
    }

    // Updates the properties of an existing block in the database.
    public async Task<ServiceResponse<FlowBlockDto>> UpdateFlowBlockAsync(FlowBlockDto flowBlockDto)
    {
        // Initialize the response object with the default failure state
        var serviceResponse = new ServiceResponse<FlowBlockDto>
        {
            Data = null,
            Message = "Failed to update block. Please try again."
        };

        try
        {
            // Retrieve the existing block entity from the repository using the provided Id
            var flowBlock = await _unitOfWork.FlowBlockRepo
                .GetByConditionAsync(w => w.Id == flowBlockDto.Id && w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // If the block doesn't exist, return an appropriate response
            if (flowBlock == null)
            {
                _logger.LogInformation($"Block with Id {flowBlockDto.Id} not found.");
                serviceResponse.Message = "Block not found.";
                return serviceResponse;
            }

            // Validate flow name uniqueness
            var flowBlockAlreadyExists = await _unitOfWork.FlowBlockRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == flowBlockDto.Name.ToLower() &&
                    w.CreatedByUserId == _userId &&
                    w.Id != flowBlockDto.Id)
                .SingleOrDefaultAsync();

            // block already exists
            if (flowBlockAlreadyExists != null)
            {
                _logger.LogInformation($"Block name already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A Block with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim string properties of the DTO to remove unnecessary whitespace
            flowBlockDto = TrimDtoStringPropsUtil.TrimDtoStringProps(flowBlockDto);

            // Update the properties of the block with the provided data from the DTO
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
                _logger.LogWarning($"Failed to save update for block with Id {flowBlock.Id}");
                return serviceResponse;
            }

            // On successful save, return the updated block and set success message
            serviceResponse.Data = flowBlock.Adapt<FlowBlockDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Block updated successfully.";

            // Log the success with the updated block's Id
            _logger.LogInformation($"Block with Id {flowBlock.Id} updated successfully.");
        }
        catch (Exception ex)
        {
            // Log the exception in case of an error during the update process
            _logger.LogError(ex, $"Exception while updating block with Id {flowBlockDto.Id}");
        }

        // Return the final response
        return serviceResponse;
    }

    // Deletes a block from the database based on the provided block Id.
    public async Task<ServiceResponse<bool>> DeleteFlowBlockAsync(Guid flowBlockId)
    {
        // Initialize the response object with default failure state
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete block. Please try again."
        };

        try
        {
            // Retrieve the block entity from the repository based on the provided Id
            var flowBlock = await _unitOfWork.FlowBlockRepo
                .GetByConditionAsync(w => w.Id == flowBlockId && w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // If the block doesn't exist, log and return the appropriate failure message
            if (flowBlock == null)
            {
                _logger.LogInformation($"block with Id {flowBlockId} not found.");
                serviceResponse.Message = "block not found.";
                return serviceResponse;
            }

            // Delete the block from the repository
            _unitOfWork.FlowBlockRepo.Delete(flowBlock);

            // Attempt to save the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning($"Failed to save deletion of block with Id {flowBlockId}");
                return serviceResponse;
            }

            // On successful deletion, set success values in the response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Block deleted successfully.";

            // Log the successful deletion of the block
            _logger.LogInformation($"block with Id {flowBlockId} deleted successfully.");
        }
        catch (Exception ex)
        {
            // Log the exception details in case of an error during the deletion process
            _logger.LogError(ex, $"Error occurred while deleting block with Id {flowBlockId}");
        }

        // Return the final response
        return serviceResponse;
    }

    // Deletes multiple blocks from the database based on the provided list of block IDs.
    public async Task<ServiceResponse<bool>> DeleteMultipleFlowBlocksAsync(IEnumerable<Guid> flowBlockIds)
    {
        // Initialize the response object with default failure state
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete blocks. Please try again."
        };

        try
        {
            // Retrieve the list of blocks that match the provided block IDs
            var flowBlocks = await _unitOfWork.FlowBlockRepo
                .GetByConditionAsync(w => w.CreatedByUserId == _userId && flowBlockIds.Contains(w.Id))
                .ToListAsync();

            // If no blocks are found, log and return the appropriate failure message
            if (!flowBlocks.Any())
            {
                _logger.LogInformation("No blocks found for the provided IDs.");
                serviceResponse.Message = "No blocks found to delete.";
                return serviceResponse;
            }

            // Delete the matching blocks from the repository
            _unitOfWork.FlowBlockRepo.Delete(flowBlocks);

            // Attempt to save the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save multiple block deletions.");
                return serviceResponse;
            }

            // On successful deletion, set success values in the response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Blocks deleted successfully.";

            // Log the successful deletion with the count of deleted blocks
            _logger.LogInformation($"Deleted {flowBlocks.Count} block(s).");
        }
        catch (Exception ex)
        {
            // Log the exception details in case of an error during the deletion process
            _logger.LogError(ex, "Exception occurred while deleting multiple blocks.");
        }

        // Return the final response
        return serviceResponse;
    }
}
