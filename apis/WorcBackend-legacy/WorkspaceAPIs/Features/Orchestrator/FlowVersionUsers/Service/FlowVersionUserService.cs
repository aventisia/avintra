namespace WorkspaceAPIs.Services;

public class FlowVersionUserService : IFlowVersionUserService
{
    private readonly ILogger<FlowVersionUserService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public FlowVersionUserService(
        ILogger<FlowVersionUserService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Extract current user id from http context (Fallback to empty guid if not available)
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    //Retrieves all flow versions associated with the current user.
    public async Task<ServiceResponse<IEnumerable<FlowVersionUserDto>>> GetMyFlowVersionsAsync()
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<FlowVersionUserDto>>
        {
            Data = null,
            Message = "Failed to retrieve your flow versions at this time."
        };

        try
        {
            // Fetch all flow versions linked to current user
            var flowVersionUsers = await _unitOfWork.FlowVersionUserRepo
                .GetByConditionAsync(w => w.UserId == _userId)
                .Include(i => i.FlowVersion)
                .ProjectToType<FlowVersionUserDto>()
                .ToListAsync();

            // Assign success response
            serviceResponse.Data = flowVersionUsers;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow versions retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log failure with context
            _logger.LogError(ex, $"[GetMyFlowVersions] Failed to fetch flow versions for user {_userId}");
        }

        return serviceResponse;
    }

    // Retrieves all users associated with a specific flow version.
    public async Task<ServiceResponse<IEnumerable<FlowVersionUserDto>>> GetFlowVersionUsersAsync(Guid flowVersionId)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<FlowVersionUserDto>>
        {
            Data = null,
            Message = "Failed to retrieve users for the selected flow version."
        };

        try
        {
            // Fetch users associated with given flow version
            var flowVersionUsers = await _unitOfWork.FlowVersionUserRepo
                .GetByConditionAsync(w => w.FlowVersionId == flowVersionId)
                .Include(i => i.User)
                .Include(i => i.FlowVersion)
                .ProjectToType<FlowVersionUserDto>()
                .ToListAsync();

            // Assign success response
            serviceResponse.Data = flowVersionUsers;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Users retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log failure with context
            _logger.LogError(ex, $"[GetFlowVersionUsers] Failed to fetch users for FlowVersion {flowVersionId}");
        }

        return serviceResponse;
    }

    // Retrieves a specific flow version user by its unique identifier.
    public async Task<ServiceResponse<FlowVersionUserDto>> GetFlowVersionUserByIdAsync(Guid flowVersionUserId)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<FlowVersionUserDto>
        {
            Data = null,
            Message = "Failed to retrieve the requested user. Please try again"
        };

        try
        {
            // Fetch single user by id
            var flowVersionUser = await _unitOfWork.FlowVersionUserRepo
                .GetByConditionAsync(w => w.Id == flowVersionUserId)
                .Include(i => i.User)
                .Include(i => i.FlowVersion)
                .ProjectToType<FlowVersionUserDto>()
                .SingleOrDefaultAsync();

            // Assign success response
            serviceResponse.Data = flowVersionUser;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log failure with context
            _logger.LogError(ex, $"[GetFlowVersionUserById] Failed to fetch user with Id {flowVersionUserId}");
        }

        return serviceResponse;
    }

    //Creates a new flow version user mapping.
    public async Task<ServiceResponse<FlowVersionUserDto>> InsertFlowVersionUserAsync(FlowVersionUserDto flowVersionUserDto)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<FlowVersionUserDto>
        {
            Data = null,
            Message = "Failed to create flow version user. Please try again."
        };

        try
        {
            // Fetch FlowVersion (only published versions are allowed)
            var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.Id == flowVersionUserDto.FlowVersionId &&
                    // w.Flow.Type == FlowTypesEnum.ChatAgent &&
                    w.IsPublished
                )
                .FirstOrDefaultAsync();

            if (flowVersion == null)
            {
                _logger.LogError("FlowVersion not found. FlowVersionId: {FlowVersionId}", flowVersionUserDto.FlowVersionId);
                serviceResponse.Message = "Flow version not found.";
                return serviceResponse;
            }

            // Handle assignment to all users (Tenant-wide access)
            if (flowVersionUserDto.IsAssignedToAllUsers)
            {
                // Enable tenant-wide access if not already enabled
                if (!flowVersion.IsTenantWideAccess)
                {
                    flowVersion.IsTenantWideAccess = true;
                    flowVersion.LastModifiedByUserId = _userId;

                    // Update FlowVersion
                    _unitOfWork.FlowVersionRepo.Update(flowVersion);
                }

                // Verify persistence
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("[InsertFlowVersionUser] Failed to persist tenant-wide access update.");
                    return serviceResponse;
                }

                // No user mapping needed when assigned to all users
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Flow version assigned to all users successfully.";
                return serviceResponse;
            }
            else
            {
                // If previously tenant-wide, disable it (FIXED BUG: was setting true again)
                if (flowVersion.IsTenantWideAccess)
                {
                    flowVersion.IsTenantWideAccess = false;
                    flowVersion.LastModifiedByUserId = _userId;

                    // Update FlowVersion
                    _unitOfWork.FlowVersionRepo.Update(flowVersion);

                    // Verify persistence
                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogError("[InsertFlowVersionUser] Failed to update tenant-wide access.");
                        return serviceResponse;
                    }

                    // If no specific user provided, just revoke tenant-wide access and return success
                    if (flowVersionUserDto.UserId == Guid.Empty)
                    {
                        serviceResponse.StatusCode = 200;
                        serviceResponse.Message = "Flow version revoked from tenant-wide access successfully.";
                        return serviceResponse;
                    }
                }

                // Check if mapping already exists to prevent duplicates
                var existingFlowVersionUser = await _unitOfWork.FlowVersionUserRepo
                    .GetByConditionAsync(w =>
                        w.FlowVersionId == flowVersionUserDto.FlowVersionId &&
                        w.UserId == flowVersionUserDto.UserId)
                    .FirstOrDefaultAsync();

                // Validate duplicate condition
                if (existingFlowVersionUser != null)
                {
                    serviceResponse.StatusCode = 409;
                    serviceResponse.Message = "Flow version user already exists.";
                    return serviceResponse;
                }

                // Fetch WorkspaceUser (validate user exists in workspace)
                var workspaceUser = await _unitOfWork.WorkspaceUserRepo
                    .GetByConditionAsync(w => w.Id == flowVersionUserDto.UserId)
                    .FirstOrDefaultAsync();

                if (workspaceUser == null)
                {
                    _logger.LogError("WorkspaceUser not found. UserId: {UserId}", flowVersionUserDto.UserId);
                    serviceResponse.Message = "Workspace user not found.";
                    return serviceResponse;
                }

                // Map dto to entity and assign audit fields
                var flowVersionUser = flowVersionUserDto.Adapt<FlowVersionUser>();

                // Insert new record
                await _unitOfWork.FlowVersionUserRepo.InsertAsync(flowVersionUser);

                // Verify persistence (includes both FlowVersion update + insert if any)
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("[InsertFlowVersionUser] Failed to persist new flow version user.");
                    return serviceResponse;
                }

                serviceResponse.Data = flowVersionUser.Adapt<FlowVersionUserDto>();
            }

            // Assign success response
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version user created successfully.";
        }
        catch (Exception ex)
        {
            // Log failure with context
            _logger.LogError(ex, $"[InsertFlowVersionUser] Error while creating user for FlowVersion {flowVersionUserDto.FlowVersionId}");
        }

        return serviceResponse;
    }

    // Creates multiple flow version user mappings while avoiding duplicates.
    public async Task<ServiceResponse<IEnumerable<FlowVersionUserDto>>> BulkInsertFlowVersionUsersAsync(IEnumerable<FlowVersionUserDto> flowVersionUserDtos)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<FlowVersionUserDto>>
        {
            Data = null,
            Message = "Faield to create flow version users. Please try again."
        };

        try
        {
            // Validate input collection
            if (flowVersionUserDtos == null || !flowVersionUserDtos.Any())
            {
                _logger.LogWarning("[BulkInsertFlowVersionUsers] Empty input received.");
                serviceResponse.Message = "No users provided.";
                return serviceResponse;
            }

            // Extract unique identifiers for duplicate validation
            var flowVersionIds = flowVersionUserDtos.Select(x => x.FlowVersionId).Distinct().ToList();
            var userIds = flowVersionUserDtos.Select(x => x.UserId).Distinct().ToList();

            // Fetch existing records from database
            var existingFlowUsers = await _unitOfWork.FlowVersionUserRepo
                .GetByConditionAsync(w =>
                    flowVersionIds.Contains(w.FlowVersionId) &&
                    userIds.Contains(w.UserId))
                .Select(s => new { s.FlowVersionId, s.UserId })
                .ToListAsync();

            // Filter out already existing mappings
            var newFlowVersionUserDtos = flowVersionUserDtos
                .Where(w => !existingFlowUsers.Any(flowVersionUser =>
                    flowVersionUser.FlowVersionId == w.FlowVersionId &&
                    flowVersionUser.UserId == w.UserId))
                .ToList();

            // Check if nothing new to insert
            if (!newFlowVersionUserDtos.Any())
            {
                _logger.LogWarning("[BulkInsertFlowVersionUsers] All records already exist.");
                serviceResponse.Message = "All flow veriosn users already exist.";
                return serviceResponse;
            }

            // Map dto list to entity list and assign audit fields
            var newFlowVersionUsers = newFlowVersionUserDtos.Select(d =>
            {
                var flowVersionUser = d.Adapt<FlowVersionUser>();
                return flowVersionUser;
            }).ToList();

            // Insert new records
            await _unitOfWork.FlowVersionUserRepo.InsertAsync(newFlowVersionUsers);

            // Verify persistence
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("[BulkInsertFlowVersionUsers] Failed to persist bulk insert operation.");
                return serviceResponse;
            }

            // Assign success response
            serviceResponse.Data = newFlowVersionUsers.Adapt<List<FlowVersionUserDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{newFlowVersionUsers.Count} flow veriosn users created successfully.";
        }
        catch (Exception ex)
        {
            // Log failure with context
            _logger.LogError(ex, "[BulkInsertFlowVersionUsers] Unexpected error during bulk insert.");
        }

        return serviceResponse;
    }

    // Updates an existing flow version user mapping.
    public async Task<ServiceResponse<FlowVersionUserDto>> UpdateFlowVersionUserAsync(FlowVersionUserDto flowVersionUserDto)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<FlowVersionUserDto>
        {
            Data = null,
            Message = "Failed to update flow version user. Please try again."
        };

        try
        {
            // Fetch existing entity by id
            var flowVersionUser = await _unitOfWork.FlowVersionUserRepo
                .GetByConditionAsync(w => w.Id == flowVersionUserDto.Id)
                .SingleOrDefaultAsync();

            // Validate existence
            if (flowVersionUser == null)
            {
                serviceResponse.Message = "Flow version user not found.";
                return serviceResponse;
            }

            // Map updated values to entity
            flowVersionUserDto.Adapt(flowVersionUser);

            // Mark entity as updated
            _unitOfWork.FlowVersionUserRepo.Update(flowVersionUser);

            // Verify persistence
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"[UpdateFlowVersionUser] Failed to persist update for Id {flowVersionUserDto.Id}");
                return serviceResponse;
            }

            // Assign success response
            serviceResponse.Data = flowVersionUser.Adapt<FlowVersionUserDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version user updated successfully.";
        }
        catch (Exception ex)
        {
            // Log failure with context
            _logger.LogError(ex, $"[UpdateFlowVersionUser] Error updating user with Id {flowVersionUserDto.Id}");
        }

        return serviceResponse;
    }

    // Deletes a specific flow version user by id.
    public async Task<ServiceResponse<bool>> DeleteFlowVersionUserAsync(Guid flowVersionUserId)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete flow version user. Please try again."
        };

        try
        {
            // Fetch entity by id
            var flowVersionUser = await _unitOfWork.FlowVersionUserRepo
                .GetByConditionAsync(x => x.Id == flowVersionUserId)
                .SingleOrDefaultAsync();

            // Validate existence
            if (flowVersionUser == null)
            {
                serviceResponse.Message = "User not found.";
                return serviceResponse;
            }

            // Delete entity
            _unitOfWork.FlowVersionUserRepo.Delete(flowVersionUser);

            // Verify persistence
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"[DeleteFlowVersionUser] Failed to persist delete for Id {flowVersionUserId}");
                return serviceResponse;
            }

            // Assign success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version user deleted successfully.";
        }
        catch (Exception ex)
        {
            // Log failure with context
            _logger.LogError(ex, $"[DeleteFlowVersionUser] Error deleting user with Id {flowVersionUserId}");
        }

        return serviceResponse;
    }

    // Deletes multiple flow version users by their ids.
    public async Task<ServiceResponse<bool>> DeleteFlowVersionUsersAsync(IEnumerable<Guid> flowVersionUserIds)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete flow version users. Please try again."
        };

        try
        {
            // Fetch matching records from database
            var flowVersionUsers = await _unitOfWork.FlowVersionUserRepo
                .GetByConditionAsync(w => flowVersionUserIds.Contains(w.Id))
                .ToListAsync();

            // Validate existence
            if (!flowVersionUsers.Any())
            {
                serviceResponse.Message = "No flow version users found.";
                return serviceResponse;
            }

            // Delete records
            _unitOfWork.FlowVersionUserRepo.Delete(flowVersionUsers);

            // Verify persistence
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("[DeleteFlowVersionUsers] Failed to persist bulk delete operation.");
                return serviceResponse;
            }

            // Assign success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{flowVersionUsers.Count} flow version users deleted.";
        }
        catch (Exception ex)
        {
            // Log failure with context
            _logger.LogError(ex, "[DeleteFlowVersionUsers] Unexpected error during bulk delete.");
        }

        return serviceResponse;
    }
}