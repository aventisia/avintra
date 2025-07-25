using MLModelBuilderAPIs.DTOs;

namespace MLModelBuilderAPIs.Services;

public class ModelBuilderUserService : IModelBuilderUserService
{
    private readonly ILogger<ModelBuilderUserService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserManagementGuardService _userManagementGuardService;
     private readonly DefaultTenantConfig _defaultTenantConfig;
    private readonly Guid _userId;
    private readonly string _userName;
    private readonly Guid _tenantId;

    public ModelBuilderUserService(
        ILogger<ModelBuilderUserService> logger,
        IUnitOfWork unitOfWork,
        IUserManagementGuardService userManagementGuardService,
        IHttpContextAccessor httpContextAccessor,
        DefaultTenantConfig defaultTenantConfig)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _userName = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? "Unknown";
        _tenantId = Guid.TryParse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid"), out var tenantId) ? tenantId : Guid.Empty;

        _logger = logger;
        _unitOfWork = unitOfWork;
        _userManagementGuardService = userManagementGuardService;
        _defaultTenantConfig = defaultTenantConfig;
    }

    // Retrieves a model builder user by its ID.
    public async Task<ServiceResponse<ModelBuilderUserDto>> GetModelBuilderUserAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<ModelBuilderUserDto>
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
            var user = await _unitOfWork.ModelBuilderUserRepo
                                        .GetByConditionAsync(w => w.Id == id)
                                        .SingleOrDefaultAsync();

            // WU doesn't exist
            if (user == null)
            {
                _logger.LogInformation($"Model builder user not found for Id {id}");
                serviceResponse.Message = "User does not exist";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = user.Adapt<ModelBuilderUserDto>();
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

    // Insert new Model builder user record if does not exist already
    public async Task<ServiceResponse<ModelBuilderUserDto>> InsertModelBuilderUserAsync(ModelBuilderUserDto modelBuilderUserDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<ModelBuilderUserDto>
        {
            Data = null,
            Message = "Failed to insert user. Please try again"
        };

        try
        {
            // Request is not allowed to manage user
            if (!_userManagementGuardService.IsAllowedToManageOtherDbUser(modelBuilderUserDto.Id))
            {
                // Message is already logged in IsAllowedToManageUser method
                serviceResponse.Message = "You're not allowed to manage user";
                return serviceResponse;
            }

            // Check if user is already present basis UserId
            var userIdAlreadyExists = await _unitOfWork.ModelBuilderUserRepo
                                        .GetByConditionAsync(w => w.Id == modelBuilderUserDto.Id)
                                        .FirstOrDefaultAsync();

            // User already exists with same UserId
            if (userIdAlreadyExists != null)
            {
                _logger.LogInformation($"Model builder user already exists with same UserId");
                serviceResponse.Data = userIdAlreadyExists.Adapt<ModelBuilderUserDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "User already exists with same UserId. No need to insert again";
                return serviceResponse;
            }

            // Validate user uniqueness basis UserName
            var userNameAlreadyExists = await _unitOfWork.ModelBuilderUserRepo
                                        .GetByConditionAsync(w => w.UserName.ToLower() == modelBuilderUserDto.UserName.ToLower())
                                        .FirstOrDefaultAsync();

            // User already exists with same UserName
            if (userNameAlreadyExists != null)
            {
                _logger.LogInformation($"Model builder user already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A user with same UserName already exists. Please enter a unique UserName";
                return serviceResponse;
            }

            // Trim dto' string props
            modelBuilderUserDto = TrimDtoStringPropsUtil.TrimDtoStringProps(modelBuilderUserDto);

            // Default mapping
            var newUser = modelBuilderUserDto.Adapt<ModelBuilderUser>();

            // Additional Mapping
            // TODO: UPDATE ADDITIONAL MAPPING ONCE ENTITY IS FORMED

            // Insert user
            await _unitOfWork.ModelBuilderUserRepo.InsertAsync(newUser);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new model builder user");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newUser.Adapt<ModelBuilderUserDto>();
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

    // Updates an existing model builder user.
    public async Task<ServiceResponse<ModelBuilderUserDto>> UpdateModelBuilderUserAsync(ModelBuilderUserDto modelBuilderUserDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<ModelBuilderUserDto>
        {
            Data = null,
            Message = "Failed to update user. Please try again"
        };

        try
        {
            // Request is not allowed to manage user
            if (!_userManagementGuardService.IsAllowedToManageOtherDbUser(modelBuilderUserDto.Id))
            {
                // Message is already logged in IsAllowedToManageUser method
                serviceResponse.Message = "You're not allowed to manage user";
                return serviceResponse;
            }

            // Validate user existence
            var user = await _unitOfWork.ModelBuilderUserRepo
                                        .GetByConditionAsync(w => w.Id == modelBuilderUserDto.Id)
                                        .SingleOrDefaultAsync();

            // User does not exist
            if (user == null)
            {
                _logger.LogInformation($"Model builder user does not exist");
                serviceResponse.Message = "User does not exist";
                return serviceResponse;
            }

            // Validate user uniqueness
            var userAlreadyExists = await _unitOfWork.ModelBuilderUserRepo
                                        .GetByConditionAsync(w =>
                                            w.UserName.ToLower() == modelBuilderUserDto.UserName.ToLower() &&
                                            w.Id != modelBuilderUserDto.Id)
                                        .FirstOrDefaultAsync();

            // User already exists
            if (userAlreadyExists != null)
            {
                _logger.LogInformation($"Model builder user already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A user with same UserName already exists. Please enter a unique UserName";
                return serviceResponse;
            }

            // Trim dto' string props
            modelBuilderUserDto = TrimDtoStringPropsUtil.TrimDtoStringProps(modelBuilderUserDto);

            // Default mapping
            modelBuilderUserDto.Adapt(user);

            // Additional Mapping
            // TODO: UPDATE ADDITIONAL MAPPING ONCE ENTITY IS FORMED

            // Update user
            _unitOfWork.ModelBuilderUserRepo.Update(user);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating Model builder user");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = user.Adapt<ModelBuilderUserDto>();
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

    // Deletes a model builder user by its ID.
    public async Task<ServiceResponse<bool>> DeleteModelBuilderUserAsync(Guid id)
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
            var user = await _unitOfWork.ModelBuilderUserRepo
                                        .GetByConditionAsync(w => w.Id == id)
                                        .SingleOrDefaultAsync();

            // User does not exist
            if (user == null)
            {
                _logger.LogInformation($"Model builder user does not exist");
                serviceResponse.Message = "User does not exist";
                return serviceResponse;
            }

            // TODO: Check relationship with other entities

            // Delete user
            _unitOfWork.ModelBuilderUserRepo.Delete(user);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting Model builder user");
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

    // Searches model builder users whose first name, last name, or username contains the given search key.
    public async Task<ServiceResponse<IEnumerable<ModelBuilderUserDto>>> SearchModelBuilderUserAsync(string searchKey)
    {
        // Initialize the response with a default "Bad Request" status
        var serviceResponse = new ServiceResponse<IEnumerable<ModelBuilderUserDto>>
        {
            Data = null,
            Message = "Failed to search user. Please try again."
        };

        try
        {
            // Validate that the search key is not null or empty
            if (string.IsNullOrWhiteSpace(searchKey))
            {
                _logger.LogWarning("Model builder user search failed: search key was empty or null.");
                serviceResponse.Message = "Search key cannot be empty.";
                return serviceResponse;
            }

            _logger.LogInformation("User '{User}' initiated a model builder user search with key: '{SearchKey}'", _userName, searchKey);

            List<ModelBuilderUserDto>? modelBuilderUsers = new List<ModelBuilderUserDto>();

            // Check if the tenant ID matches and return if true
            if (_defaultTenantConfig.TenantId == _tenantId)
            {
                // Tenant ID matches, so return with a message indicating access is not allowed
                serviceResponse.Message = "Access denied: You cannot add users to agent.";
                return serviceResponse;
            }
            else
            {
                // Search model builder users by FirstName, LastName, or UserName
                modelBuilderUsers = await _unitOfWork.ModelBuilderUserRepo
                    .GetByConditionAsync(w =>
                        w.Id != _userId &&
                        (
                            w.FirstName.ToLower().Contains(searchKey.ToLower()) ||
                            w.LastName.ToLower().Contains(searchKey.ToLower()) ||
                            w.UserName.ToLower().Contains(searchKey.ToLower())
                        )
                    )
                    .ProjectToType<ModelBuilderUserDto>()
                    .ToListAsync();
            }

            // Update and return the successful response
            serviceResponse.Data = modelBuilderUsers;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"Search completed. {modelBuilderUsers.Count} user(s) found.";
            _logger.LogInformation("model builder user search succeeded for key '{SearchKey}'. Total matches: {Count}.", searchKey, modelBuilderUsers.Count);
        }
        catch (Exception ex)
        {
            // Log unexpected error and return error response
            _logger.LogError(ex, "Error occurred while searching model builder users with key '{SearchKey}'", searchKey);
        }

        return serviceResponse;
    }
}