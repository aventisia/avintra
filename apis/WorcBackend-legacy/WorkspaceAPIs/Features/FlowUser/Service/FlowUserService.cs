namespace WorkspaceAPIs.Services;

public class FlowUserService : IFlowUserService
{
    private readonly ILogger<FlowUserService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public FlowUserService(
        ILogger<FlowUserService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Attempt to retrieve the user's ID and tenant ID from the JWT claims
        _userId = Guid.TryParse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid"), out var userId) ? userId : Guid.Empty;
        _tenantId = Guid.TryParse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid"), out var tenantId) ? tenantId : Guid.Empty;

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
                .GetByConditionAsync(w =>
                    w.Id == flowUserId && w.UserId != _userId
                )
                .Include(i => i.User)
                .SingleOrDefaultAsync();

            // If not found, log and return default response
            if (flowUser == null)
            {
                return serviceResponse;
            }

            // If found, map entity to DTO and update response
            serviceResponse.Data = flowUser.Adapt<FlowUserDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow user retrieved successfully.";
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
            // @rahmat, please confirm if this logic is still needed
            // Check if the tenant ID matches and return if true
            // if (_defaultTenantConfig.TenantId == _tenantId)
            // {
            //     // Tenant ID matches, so return with a message indicating access is not allowed
            //     serviceResponse.Message = "Access denied: You cannot add users to agent.";
            //     return serviceResponse;
            // }

            var flowUser = await _unitOfWork.FlowUserRepo
                .GetByConditionAsync(w =>
                    w.UserId == flowUserDto.UserId &&
                    w.FlowId == flowUserDto.FlowId
                )
                .SingleOrDefaultAsync();

            // Check if the flow user already exists based on UserId and FlowId
            if (flowUser != null)
            {
                // Set the message for the service response, indicating that the user already exists for the given flow
                serviceResponse.Message = "User already exists for the specified flow.";

                return serviceResponse;
            }

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
            // First DB call: Retrieve the flow user entity and its related flow (without including FlowUsers)
            var flowUser = await _unitOfWork.FlowUserRepo
                .GetByConditionAsync(w =>
                    w.Id == flowUserDto.Id &&
                    w.UserId != _userId
                )
                .SingleOrDefaultAsync();

            // Check if the flow user exists
            if (flowUser == null)
            {
                serviceResponse.Message = "User not found.";
                return serviceResponse;
            }

            // Retrieve FlowUsers for the Flow of the retrieved flowUser
            var flow = await _unitOfWork.FlowRepo.GetByConditionAsync(w =>
                w.Id == flowUser.FlowId
            )
            .Include(i => i.FlowUsers)
            .AsNoTracking()
            .SingleOrDefaultAsync();

            var flowUserAccess = flow.FlowUsers?.FirstOrDefault(w =>
                w.FlowId == flowUser.FlowId &&
                w.UserId == _userId &&
                w.Type == ProjectUserAccessEnum.Owner
            );

            // Check if the user has the required access (Owner/Edit)
            if (flow.CreatedByUserId != _userId && flowUserAccess == null)
            {
                _logger.LogWarning($"User {_userId} is not authorized to update the access.");
                serviceResponse.Message = "You don't have access to update the access.";
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
                .GetByConditionAsync(w =>
                    w.Id == flowUserId && w.UserId != _userId
                )
                .SingleOrDefaultAsync();

            // If flow user does not exist, return error response
            if (flowUser == null)
            {
                serviceResponse.Message = "User does not exist.";
                return serviceResponse;
            }

            // Retrieve FlowUsers for the Flow of the retrieved flowUser
            var flow = await _unitOfWork.FlowRepo.GetByConditionAsync(w =>
                w.Id == flowUser.FlowId
            )
            .Include(i => i.FlowUsers)
            .AsNoTracking()
            .SingleOrDefaultAsync();

            var flowUserAccess = flow.FlowUsers?.FirstOrDefault(w =>
                w.FlowId == flowUser.FlowId &&
                w.UserId == _userId &&
                w.Type == ProjectUserAccessEnum.Owner
            );

            // Check if the user has the required access (Owner/Edit)
            if (flow.CreatedByUserId != _userId && flowUserAccess == null)
            {
                _logger.LogWarning($"User {_userId} is not authorized to delete the access.");
                serviceResponse.Message = "You don't have access to delete the access.";
                return serviceResponse;
            }

            // Delete the flow user entity from the repository
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
                .GetByConditionAsync(w => flowUserIds.Contains(w.Id) && w.UserId != _userId)
                .ToListAsync();

            // If no users are found, log info and return response
            if (!flowUsers.Any())
            {
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
        }
        catch (Exception ex)
        {
            // Log the exception with stack trace
            _logger.LogError(ex, "Exception occurred while deleting multiple flow users.");
        }

        // Return the final response
        return serviceResponse;
    }

    // Removes a user's access from the specified flow, without deleting the user's data.
    public async Task<ServiceResponse<bool>> RemoveUserAccessFromFlowAsync(Guid flowId)
    {
        // Initialize a response indicating failure by default
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to revoke flow user access. Please try again."
        };

        try
        {
            // Fetch the user's flow association based on flowId and current user's ID
            var flowUser = await _unitOfWork.FlowUserRepo
                .GetByConditionAsync(w =>
                    w.FlowId == flowId && w.UserId == _userId
                )
                .SingleOrDefaultAsync();

            // If the user is not associated with the flow, return an error response
            if (flowUser == null)
            {
                serviceResponse.Message = "User is not associated with this flow.";
                return serviceResponse;
            }

            // Delete the flow user's access
            _unitOfWork.FlowUserRepo.Delete(flowUser);

            // Save changes and check the result
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning($"Failed to save changes after revoking access for flow user with Id {flowId}.");
                return serviceResponse;
            }

            // Successful response indicating that the access was revoked
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Access successfully removed from the flow.";
        }
        catch (Exception ex)
        {
            // Log the exception with relevant details
            _logger.LogError(ex, $"An error occurred while attempting to revoke access for flow user with Id {flowId}.");
        }

        // Return the final response indicating the success or failure of the operation
        return serviceResponse;
    }
}
