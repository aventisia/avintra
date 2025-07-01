namespace WorkspaceAPIs.Services;

public class FlowUserService : IFlowUserService
{
    private readonly ILogger<FlowUserService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public FlowUserService(
        ILogger<FlowUserService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Retrieve the current user's ID from the JWT claims in the HTTP context, fallback to empty Guid if missing
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves a list of users associated with a specific flow.
    public async Task<ServiceResponse<IEnumerable<FlowUserDto>>> GetFlowUsersByFlowIdAsync(Guid flowId)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<FlowUserDto>>
        {
            Data = null,
            Message = "Failed to retrieve users. Please try again."
        };

        try
        {
            // Fetch flow users linked to the given flowId
            var flowUsers = await _unitOfWork.FlowUserRepo
                .GetByConditionAsync(w => w.FlowId == flowId)
                .Include(i => i.User)
                .ProjectToType<FlowUserDto>()
                .ToListAsync();

            // Map data and prepare successful response
            serviceResponse.Data = flowUsers;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Users retrieved successfully";

            // Log success with details
            _logger.LogInformation($"Successfully retrieved {flowUsers.Count} users for flow with Id {flowId}");
        }
        catch (Exception ex)
        {
            // Log the exception with stack trace for debugging
            _logger.LogError(ex, $"Error occurred while retrieving users for flow with Id {flowId}");
        }

        // Return either success or failure response
        return serviceResponse;
    }

    // Retrieves a specific flow user by their unique identifier.
    public async Task<ServiceResponse<FlowUserDto>> GetFlowUserByIdAsync(Guid flowUserId)
    {
        // Initialize response object with default
        var serviceResponse = new ServiceResponse<FlowUserDto>
        {
            Data = null,
            Message = "Flow user not found."
        };

        try
        {
            // Attempt to find the flow user with the specified Id
            var flowUser = await _unitOfWork.FlowUserRepo
                .GetByConditionAsync(u => u.Id == flowUserId)
                .SingleOrDefaultAsync();

            // If not found, log and return default response
            if (flowUser == null)
            {
                _logger.LogInformation($"Flow user with Id {flowUserId} not found.");
                return serviceResponse;
            }

            // If found, map entity to DTO and update response
            serviceResponse.Data = flowUser.Adapt<FlowUserDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow user retrieved successfully.";

            // Log success
            _logger.LogInformation($"Successfully retrieved flow user with Id {flowUserId}.");
        }
        catch (Exception ex)
        {
            // Log exception details
            _logger.LogError(ex, $"Error occurred while retrieving flow user with Id {flowUserId}.");
        }

        // Return the final response object
        return serviceResponse;
    }

    // Adds a new user association to a flow.
    public async Task<ServiceResponse<FlowUserDto>> InsertFlowUserAsync(FlowUserDto flowUserDto)
    {
        // Initialize response indicating failure by default
        var serviceResponse = new ServiceResponse<FlowUserDto>
        {
            Data = null,
            Message = "Failed to add user to flow. Please try again."
        };

        try
        {
            // Clean string properties to remove leading/trailing whitespace
            flowUserDto = TrimDtoStringPropsUtil.TrimDtoStringProps(flowUserDto);

            // TODO: Add custom logic if needed

            // Map the DTO to the FlowUser entity model
            var newFlowUser = flowUserDto.Adapt<FlowUser>();
            newFlowUser.CreatedByUserId = _userId;
            newFlowUser.LastModifiedByUserId = _userId;

            // Insert the new entity in repository
            await _unitOfWork.FlowUserRepo.InsertAsync(newFlowUser);

            // Save changes to the database and verify success
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save the new flow user entity to the database.");
                return serviceResponse;
            }

            // Prepare successful response with inserted entity mapped back to DTO
            serviceResponse.Data = newFlowUser.Adapt<FlowUserDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User added to flow successfully";

            // Log the successful addition with user and flow info
            _logger.LogInformation($"User {newFlowUser.UserId} added to flow {newFlowUser.FlowId} successfully.");
        }
        catch (Exception ex)
        {
            // Log exception details
            _logger.LogError(ex, "Exception occurred while adding a user to flow.");
        }

        // Return the service response with success
        return serviceResponse;
    }

    // Updates an existing user association in a flow.
    public async Task<ServiceResponse<FlowUserDto>> UpdateFlowUserAsync(FlowUserDto flowUserDto)
    {
        // Initialize response to failure state by default
        var serviceResponse = new ServiceResponse<FlowUserDto>
        {
            Data = null,
            Message = "Failed to update flow user. Please try again."
        };

        try
        {
            // Retrieve existing flow user entity by Id
            var flowUser = await _unitOfWork.FlowUserRepo
                .GetByConditionAsync(u => u.Id == flowUserDto.Id)
                .SingleOrDefaultAsync();

            // Check if the flow user exists
            if (flowUser == null)
            {
                _logger.LogInformation($"Flow user with Id {flowUserDto.Id} not found for update.");
                serviceResponse.Message = "User not found.";
                return serviceResponse;
            }

            // Clean string properties on incoming DTO
            flowUserDto = TrimDtoStringPropsUtil.TrimDtoStringProps(flowUserDto);

            // TODO: Add custom logic if needed

            // Update entity properties from DTO (typically only editable fields)
            flowUser.Type = flowUserDto.Type;
            flowUser.FlowId = flowUserDto.FlowId;
            flowUser.LastModifiedByUserId = _userId;

            // Mark entity as updated in repository
            _unitOfWork.FlowUserRepo.Update(flowUser);

            // Save changes and check result
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning($"Failed to save updates for flow user with Id {flowUser.Id}.");
                return serviceResponse;
            }

            // Prepare successful response
            serviceResponse.Data = flowUser.Adapt<FlowUserDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow user updated successfully.";

            _logger.LogInformation($"Flow user with Id {flowUser.Id} updated successfully.");
        }
        catch (Exception ex)
        {
            // Log exception details
            _logger.LogError(ex, $"Exception occurred while updating flow user with Id {flowUserDto.Id}.");
        }

        // Return service response
        return serviceResponse;
    }

    // Deletes a user association from a flow permanently.
    public async Task<ServiceResponse<bool>> DeleteFlowUserAsync(Guid flowUserId)
    {
        // Initialize response indicating failure by default
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete flow user. Please try again."
        };

        try
        {
            // Retrieve the flow user entity by Id
            var flowUser = await _unitOfWork.FlowUserRepo
                .GetByConditionAsync(u => u.Id == flowUserId)
                .SingleOrDefaultAsync();

            // If flow user does not exist, return error response
            if (flowUser == null)
            {
                _logger.LogInformation($"Flow user with Id {flowUserId} does not exist.");
                serviceResponse.Message = "User does not exist.";
                return serviceResponse;
            }

            // Delete the entity from repository
            _unitOfWork.FlowUserRepo.Delete(flowUser);

            // Save changes and check result
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning($"Failed to save changes after deleting flow user with Id {flowUserId}.");
                return serviceResponse;
            }

            // Success response with true data
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow user deleted successfully.";

            _logger.LogInformation($"Flow user with Id {flowUserId} deleted successfully.");
        }
        catch (Exception ex)
        {
            // Log exception details
            _logger.LogError(ex, $"Exception occurred while deleting flow user with Id {flowUserId}.");
        }

        // Return response indicating success
        return serviceResponse;
    }

    // Deletes multiple flow users by a list of their unique identifiers.
    public async Task<ServiceResponse<bool>> DeleteMultipleFlowUsersAsync(IEnumerable<Guid> flowUserIds)
    {
        // Initialize response object with default failure message
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete flow users. Please try again."
        };

        try
        {
            // Fetch all flow users matching the given list of Ids
            var flowUsers = await _unitOfWork.FlowUserRepo
                .GetByConditionAsync(w => flowUserIds.Contains(w.Id))
                .ToListAsync();

            // If no users are found, log info and return response
            if (!flowUsers.Any())
            {
                _logger.LogInformation("No flow users found matching the provided IDs.");
                serviceResponse.Message = "No users found to delete.";
                return serviceResponse;
            }

            // Delete all found users using repository's bulk delete method
            _unitOfWork.FlowUserRepo.Delete(flowUsers);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save deletion of multiple flow users.");
                return serviceResponse;
            }

            // Set success values in response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow users deleted successfully.";

            // Log the number of users deleted
            _logger.LogInformation($"Successfully deleted {flowUsers.Count} flow user(s).");
        }
        catch (Exception ex)
        {
            // Log the exception with stack trace
            _logger.LogError(ex, "Exception occurred while deleting multiple flow users.");
        }

        // Return the final response
        return serviceResponse;
    }
}
