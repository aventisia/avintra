namespace WorkspaceAPIs.Services;

public class WorkspaceUserService : IWorkspaceUserService
{
    private readonly ILogger<WorkspaceUserService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserManagementGuardService _userManagementGuardService;
    private readonly Guid _userId;
    private readonly string _userName;
    private readonly Guid _tenantId;

    public WorkspaceUserService(
        ILogger<WorkspaceUserService> logger,
        IUnitOfWork unitOfWork,
        IUserManagementGuardService userManagementGuardService,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _userName = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? "Unknown";
        _tenantId = Guid.TryParse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid"), out var tenantId) ? tenantId : Guid.Empty;

        _logger = logger;
        _unitOfWork = unitOfWork;
        _userManagementGuardService = userManagementGuardService;
    }

    // Retrieves a workspace user by its ID.
    public async Task<ServiceResponse<WorkspaceUserDto>> GetWorkspaceUserAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<WorkspaceUserDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Same user can only see its own record
            if (_userId != id)
            {
                _logger.LogInformation($"User {_userName} is not authorized to see record for Id {id}");
                serviceResponse.Message = "You are not authorized to see this record";
                return serviceResponse;
            }

            // Try to get user
            var workspaceUser = await _unitOfWork.WorkspaceUserRepo
                                        .GetByConditionAsync(w => w.Id == id)
                                        .SingleOrDefaultAsync();

            // WU doesn't exist
            if (workspaceUser == null)
            {
                serviceResponse.Message = "User does not exist";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = workspaceUser.Adapt<WorkspaceUserDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Insert new workspace record if does not exist already
    public async Task<ServiceResponse<WorkspaceUserDto>> InsertWorkspaceUserAsync(WorkspaceUserDto workspaceUserDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<WorkspaceUserDto>
        {
            Data = null,
            Message = "Failed to insert user. Please try again"
        };

        try
        {
            // Request is not allowed to manage user
            if (!_userManagementGuardService.IsAllowedToManageOtherDbUser(workspaceUserDto.Id))
            {
                // Message is already logged in IsAllowedToManageUser method
                serviceResponse.Message = "You're not allowed to manage user";
                return serviceResponse;
            }

            // Check if user is already present basis UserId
            var userIdAlreadyExists = await _unitOfWork.WorkspaceUserRepo
                                        .GetByConditionAsync(w => w.Id == workspaceUserDto.Id)
                                        .FirstOrDefaultAsync();

            // User already exists with same UserId
            if (userIdAlreadyExists != null)
            {
                serviceResponse.Data = userIdAlreadyExists.Adapt<WorkspaceUserDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "User already exists with same UserId. No need to insert again";
                return serviceResponse;
            }

            // Validate user uniqueness basis UserName
            var userNameAlreadyExists = await _unitOfWork.WorkspaceUserRepo
                                        .GetByConditionAsync(w => w.UserName.ToLower() == workspaceUserDto.UserName.ToLower())
                                        .FirstOrDefaultAsync();

            // User already exists with same UserName
            if (userNameAlreadyExists != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A user with same UserName already exists. Please enter a unique UserName";
                return serviceResponse;
            }

            // Trim dto' string props
            workspaceUserDto = TrimDtoStringPropsUtil.TrimDtoStringProps(workspaceUserDto);

            // Default mapping
            var newWorkspaceUser = workspaceUserDto.Adapt<WorkspaceUser>();

            // Additional Mapping
            // TODO: UPDATE ADDITIONAL MAPPING ONCE ENTITY IS FORMED

            // Insert user
            await _unitOfWork.WorkspaceUserRepo.InsertAsync(newWorkspaceUser);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newWorkspaceUser.Adapt<WorkspaceUserDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates an existing workspace user.
    public async Task<ServiceResponse<WorkspaceUserDto>> UpdateWorkspaceUserAsync(WorkspaceUserDto workspaceUserDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<WorkspaceUserDto>
        {
            Data = null,
            Message = "Failed to update user. Please try again"
        };

        try
        {
            // Request is not allowed to manage user
            if (!_userManagementGuardService.IsAllowedToManageOtherDbUser(workspaceUserDto.Id))
            {
                // Message is already logged in IsAllowedToManageUser method
                serviceResponse.Message = "You're not allowed to manage user";
                return serviceResponse;
            }

            // Validate user existence
            var workspaceUser = await _unitOfWork.WorkspaceUserRepo
                                        .GetByConditionAsync(w => w.Id == workspaceUserDto.Id)
                                        .SingleOrDefaultAsync();

            // User does not exist
            if (workspaceUser == null)
            {
                serviceResponse.Message = "User does not exist";
                return serviceResponse;
            }

            // Validate user uniqueness
            var userAlreadyExists = await _unitOfWork.WorkspaceUserRepo
                                        .GetByConditionAsync(w =>
                                            w.UserName.ToLower() == workspaceUserDto.UserName.ToLower() &&
                                            w.Id != workspaceUserDto.Id)
                                        .FirstOrDefaultAsync();

            // User already exists
            if (userAlreadyExists != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A user with same UserName already exists. Please enter a unique UserName";
                return serviceResponse;
            }

            // Trim dto' string props
            workspaceUserDto = TrimDtoStringPropsUtil.TrimDtoStringProps(workspaceUserDto);

            // Default mapping
            workspaceUserDto.Adapt(workspaceUser);

            // Additional Mapping
            // TODO: UPDATE ADDITIONAL MAPPING ONCE ENTITY IS FORMED

            // Update user
            _unitOfWork.WorkspaceUserRepo.Update(workspaceUser);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = workspaceUser.Adapt<WorkspaceUserDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes a workspace user by its ID.
    public async Task<ServiceResponse<bool>> DeleteWorkspaceUserAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete user. Please try again"
        };

        try
        {
            // Request is not allowed to manage user
            if (!_userManagementGuardService.IsAllowedToManageOtherDbUser(id))
            {
                // Message is already logged in IsAllowedToManageUser method
                serviceResponse.Message = "You're not allowed to manage user";
                return serviceResponse;
            }

            // Validate user existence
            var workspaceUser = await _unitOfWork.WorkspaceUserRepo
                                        .GetByConditionAsync(w => w.Id == id)
                                        .SingleOrDefaultAsync();

            // User does not exist
            if (workspaceUser == null)
            {
                serviceResponse.Message = "User does not exist";
                return serviceResponse;
            }

            // TODO: Check relationship with other entities

            // Delete user
            _unitOfWork.WorkspaceUserRepo.Delete(workspaceUser);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Searches workspace users whose first name, last name, or username contains the given search key.
    public async Task<ServiceResponse<IEnumerable<WorkspaceUserDto>>> SearchWorkspaceUserAsync(string searchKey, bool includeCurrentUser)
    {
        // Initialize the response with a default "Bad Request" status
        var serviceResponse = new ServiceResponse<IEnumerable<WorkspaceUserDto>>
        {
            Data = null,
            Message = "Failed to search user. Please try again."
        };

        try
        {
            // Validate that the search key is not null or empty
            if (string.IsNullOrWhiteSpace(searchKey))
            {
                _logger.LogWarning("Workspace user search failed: search key was empty or null.");
                serviceResponse.Message = "Search key cannot be empty.";
                return serviceResponse;
            }

            List<WorkspaceUserDto>? workspaceUsers = new List<WorkspaceUserDto>();

            // @rahmat, please confirm if this logic is still needed
            // Check if the tenant ID matches and return if true
            // if (_defaultTenantConfig.TenantId == _tenantId)
            // {
            //     // Tenant ID matches, so return with a message indicating access is not allowed
            //     serviceResponse.Message = "Access denied: You cannot add users to agent.";
            //     return serviceResponse;
            // }
            // else
            // {
            // }

            // Search workspace users by FirstName, LastName, or UserName
            workspaceUsers = await _unitOfWork.WorkspaceUserRepo
            .GetByConditionAsync(w =>
                w.TenantId == _tenantId &&
                (includeCurrentUser || w.Id != _userId) &&
                (
                    w.FirstName.ToLower().Contains(searchKey.ToLower()) ||
                    w.LastName.ToLower().Contains(searchKey.ToLower()) ||
                    w.UserName.ToLower().Contains(searchKey.ToLower())
                )
            )
            .ProjectToType<WorkspaceUserDto>()
            .ToListAsync();

            // Update and return the successful response
            serviceResponse.Data = workspaceUsers;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"Search completed. {workspaceUsers.Count} user(s) found.";
        }
        catch (Exception ex)
        {
            // Log unexpected error and return error response
            _logger.LogError(ex, "Error occurred while searching workspace users with key '{SearchKey}'", searchKey);
        }

        return serviceResponse;
    }
}