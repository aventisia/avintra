namespace MLModelBuilderAPIs.Services;

public class MLModelUserService : IMLModelUserService
{
    private readonly ILogger<MLModelUserService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly DefaultTenantConfig _defaultTenantConfig;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public MLModelUserService(
        ILogger<MLModelUserService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        DefaultTenantConfig defaultTenantConfig)
    {
        // Attempt to retrieve the user's ID and tenant ID from the JWT claims
        _userId = Guid.TryParse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid"), out var userId) ? userId : Guid.Empty;
        _tenantId = Guid.TryParse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid"), out var tenantId) ? tenantId : Guid.Empty;

        _logger = logger;
        _unitOfWork = unitOfWork;
        _defaultTenantConfig = defaultTenantConfig;
    }

    // Retrieves a list of users associated with a specific ML model.
    public async Task<ServiceResponse<IEnumerable<MLModelUserDto>>> GetMLModelUsersByMLModelIdAsync(Guid mlModelId)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<MLModelUserDto>>
        {
            Data = null,
            Message = "Failed to retrieve users. Please try again."
        };

        try
        {
            // Fetch ML model users linked to the given ML model Id
            var mlModelUsers = await _unitOfWork.MLModelUserRepo
                .GetByConditionAsync(w => w.MLModelId == mlModelId && w.UserId != _userId)
                .Include(i => i.User)
                .ProjectToType<MLModelUserDto>()
                .ToListAsync();

            // Map data and prepare successful response
            serviceResponse.Data = mlModelUsers;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Users retrieved successfully";

            // Log success with details
            _logger.LogInformation($"Successfully retrieved {mlModelUsers.Count} users for ML model with Id {mlModelId}");
        }
        catch (Exception ex)
        {
            // Log the exception with stack trace for debugging
            _logger.LogError(ex, $"Error occurred while retrieving users for ML model with Id {mlModelId}");
        }

        // Return either success or failure response
        return serviceResponse;
    }

    // Retrieves a specific ML model user by their unique identifier.
    public async Task<ServiceResponse<MLModelUserDto>> GetMLModelUserByIdAsync(Guid mlModelUserId)
    {
        // Initialize response object with default
        var serviceResponse = new ServiceResponse<MLModelUserDto>
        {
            Data = null,
            Message = "ML model user not found."
        };

        try
        {
            // Attempt to find the ML model user with the specified Id
            var mlModelUser = await _unitOfWork.MLModelUserRepo
                .GetByConditionAsync(w =>
                    w.Id == mlModelUserId && w.UserId != _userId
                )
                .Include(i => i.User)
                .SingleOrDefaultAsync();

            // If not found, log and return default response
            if (mlModelUser == null)
            {
                _logger.LogInformation($"ML model user with Id {mlModelUserId} not found.");
                return serviceResponse;
            }

            // If found, map entity to DTO and update response
            serviceResponse.Data = mlModelUser.Adapt<MLModelUserDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML model user retrieved successfully.";

            // Log success
            _logger.LogInformation($"Successfully retrieved ML model user with Id {mlModelUserId}.");
        }
        catch (Exception ex)
        {
            // Log exception details
            _logger.LogError(ex, $"Error occurred while retrieving ML model user with Id {mlModelUserId}.");
        }

        // Return the final response object
        return serviceResponse;
    }

    // Adds a new user association to an ML model.
    public async Task<ServiceResponse<MLModelUserDto>> InsertMLModelUserAsync(MLModelUserDto mlModelUserDto)
    {
        // Initialize response indicating failure by default
        var serviceResponse = new ServiceResponse<MLModelUserDto>
        {
            Data = null,
            Message = "Failed to add user to ML model. Please try again."
        };

        try
        {
            // Check if the tenant ID matches and return if true
            if (_defaultTenantConfig.TenantId == _tenantId)
            {
                // Tenant ID matches, so return with a message indicating access is not allowed
                serviceResponse.Message = "Access denied: You cannot add users to the ML model.";
                return serviceResponse;
            }

            var mlModelUser = await _unitOfWork.MLModelUserRepo
                .GetByConditionAsync(w =>
                    w.UserId == mlModelUserDto.UserId &&
                    w.MLModelId == mlModelUserDto.MLModelId
                )
                .SingleOrDefaultAsync();

            // Check if the ML model user already exists based on UserId and MLModelId
            if (mlModelUser != null)
            {
                // Log that the ML model user exists and provide the ML model user details (including the Id)
                _logger.LogInformation($"Attempted to update ML model user with UserId {mlModelUserDto.UserId} and MLModelId {mlModelUserDto.MLModelId}. User already exists. MLModelUser ID: {mlModelUser.Id}");

                // Set the message for the service response, indicating that the user already exists for the given ML model
                serviceResponse.Message = "User already exists for the specified ML model.";

                return serviceResponse;
            }

            // Clean string properties to remove leading/trailing whitespace
            mlModelUserDto = TrimDtoStringPropsUtil.TrimDtoStringProps(mlModelUserDto);

            // TODO: Add custom logic if needed

            // Map the DTO to the MLModelUser entity model
            var newMLModelUser = mlModelUserDto.Adapt<MLModelUser>();
            newMLModelUser.CreatedByUserId = _userId;
            newMLModelUser.LastModifiedByUserId = _userId;

            // Insert the new entity in repository
            await _unitOfWork.MLModelUserRepo.InsertAsync(newMLModelUser);

            // Save changes to the database and verify success
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save the new ML model user entity to the database.");
                return serviceResponse;
            }

            // Prepare successful response with inserted entity mapped back to DTO
            serviceResponse.Data = newMLModelUser.Adapt<MLModelUserDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User added to ML model successfully";

            // Log the successful addition with user and ML model info
            _logger.LogInformation($"User {newMLModelUser.UserId} added to ML model {newMLModelUser.MLModelId} successfully.");
        }
        catch (Exception ex)
        {
            // Log exception details
            _logger.LogError(ex, "Exception occurred while adding a user to ML model.");
        }

        // Return the service response with success
        return serviceResponse;
    }


    // Assigns one or more users to a machine learning model.
    public async Task<ServiceResponse<bool>> AssignMLModelUserAsync(AssignMLModelUserDto assignMLModelUserDto)
    {
        // Initialize a default failure response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to assign users to the ML model. Please try again."
        };

        try
        {
            // Prevent access if the current tenant is the default tenant
            if (_defaultTenantConfig.TenantId == _tenantId)
            {
                serviceResponse.Message = "Access denied: You are not permitted to assign users to this ML model.";
                return serviceResponse;
            }

            // Retrieve users from the system that match the provided UserIds
            var modelBuilderUsers = await _unitOfWork.ModelBuilderUserRepo
                .GetByConditionAsync(user => assignMLModelUserDto.UserIds.Contains(user.Id))
                .ToListAsync();

            // If no matching users were found, return an appropriate message
            if (!modelBuilderUsers.Any())
            {
                _logger.LogInformation("None of the provided user IDs were found in the system.");
                serviceResponse.Message = "User not found.";
                return serviceResponse;
            }

            // Check if any of the found users are already assigned to the specified ML model
            var existingMLModelUser = await _unitOfWork.MLModelUserRepo
                .GetByConditionAsync(entry =>
                    entry.MLModelId == assignMLModelUserDto.MLModelId &&
                    modelBuilderUsers.Select(u => u.Id).Contains(entry.UserId)
                )
                .FirstOrDefaultAsync();

            if (existingMLModelUser != null)
            {
                // If a user is already assigned, retrieve their name (or fallback to ID)
                var existingUser = modelBuilderUsers.FirstOrDefault(u => u.Id == existingMLModelUser.UserId);
                var existingUserName = existingUser != null
                    ? $"{existingUser.FirstName} {existingUser.LastName}"
                    : existingMLModelUser.UserId.ToString();

                _logger.LogInformation($"User '{existingUserName}' is already assigned to ML model {assignMLModelUserDto.MLModelId}.");
                serviceResponse.Message = $"User '{existingUserName}' is already assigned to the specified ML model.";
                return serviceResponse;
            }

            // Clean up string properties in the DTO (e.g., trim whitespace)
            assignMLModelUserDto = TrimDtoStringPropsUtil.TrimDtoStringProps(assignMLModelUserDto);

            // Create a list of MLModelUser entities to be inserted, one for each user
            var newMLModelUsers = modelBuilderUsers.Select(user => new MLModelUser
            {
                MLModelId = assignMLModelUserDto.MLModelId,
                AccessType = assignMLModelUserDto.AccessType,
                UserId = user.Id,
                CreatedByUserId = _userId,
                CreatedOn = DateTimeOffset.UtcNow,
                LastModifiedByUserId = _userId
            }).ToList();

            // Insert the new users into the repository
            await _unitOfWork.MLModelUserRepo.InsertAsync(newMLModelUsers);

            // Persist the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save the newly assigned ML model users to the database.");
                return serviceResponse;
            }

            // Update the response to indicate success
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Users successfully assigned to the ML model.";

            // Log success for audit/tracking purposes
            _logger.LogInformation($"Users assigned to ML model {assignMLModelUserDto.MLModelId} successfully.");
        }
        catch (Exception ex)
        {
            // Log any unexpected errors
            _logger.LogError(ex, "An error occurred while assigning users to the ML model.");
        }

        // Return the final response
        return serviceResponse;
    }

    // Updates an existing user association in an ML model.
    public async Task<ServiceResponse<MLModelUserDto>> UpdateMLModelUserAsync(MLModelUserDto mlModelUserDto)
    {
        // Initialize response to failure state by default
        var serviceResponse = new ServiceResponse<MLModelUserDto>
        {
            Data = null,
            Message = "Failed to update ML model user. Please try again."
        };

        try
        {
            // First DB call: Retrieve the ML model user entity
            var mlModelUser = await _unitOfWork.MLModelUserRepo
                .GetByConditionAsync(w =>
                    w.Id == mlModelUserDto.Id &&
                    w.UserId != _userId
                )
                .SingleOrDefaultAsync();

            // Check if the ML model user exists
            if (mlModelUser == null)
            {
                _logger.LogInformation($"ML model user with Id {mlModelUserDto.Id} not found for update.");
                serviceResponse.Message = "User not found.";
                return serviceResponse;
            }

            // Clean string properties on incoming DTO
            mlModelUserDto = TrimDtoStringPropsUtil.TrimDtoStringProps(mlModelUserDto);

            // TODO: Add custom logic if needed

            // Update entity properties from DTO (typically only editable fields)
            mlModelUser.AccessType = mlModelUserDto.AccessType;
            mlModelUser.MLModelId = mlModelUserDto.MLModelId;
            mlModelUser.LastModifiedByUserId = _userId;

            // Mark entity as updated in repository
            _unitOfWork.MLModelUserRepo.Update(mlModelUser);

            // Save changes and check result
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning($"Failed to save updates for ML model user with Id {mlModelUser.Id}.");
                return serviceResponse;
            }

            // Prepare successful response
            serviceResponse.Data = mlModelUser.Adapt<MLModelUserDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML model user updated successfully.";

            _logger.LogInformation($"ML model user with Id {mlModelUser.Id} updated successfully.");
        }
        catch (Exception ex)
        {
            // Log exception details
            _logger.LogError(ex, $"Exception occurred while updating ML model user with Id {mlModelUserDto.Id}.");
        }

        // Return service response
        return serviceResponse;
    }

    // Deletes a user association from an ML model permanently.
    public async Task<ServiceResponse<bool>> DeleteMLModelUserAsync(Guid mlModelUserId)
    {
        // Initialize response indicating failure by default
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete ML model user. Please try again."
        };

        try
        {
            // Retrieve the ML model user entity by Id
            var mlModelUser = await _unitOfWork.MLModelUserRepo
                .GetByConditionAsync(w =>
                    w.Id == mlModelUserId && w.UserId != _userId
                )
                .SingleOrDefaultAsync();

            // If ML model user does not exist, return error response
            if (mlModelUser == null)
            {
                _logger.LogInformation($"ML model user with Id {mlModelUserId} does not exist.");
                serviceResponse.Message = "User does not exist.";
                return serviceResponse;
            }

            // Delete the ML model user entity from the repository
            _unitOfWork.MLModelUserRepo.Delete(mlModelUser);

            // Save changes and check result
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning($"Failed to save changes after deleting ML model user with Id {mlModelUserId}.");
                return serviceResponse;
            }

            // Success response with true data
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML model user deleted successfully.";

            _logger.LogInformation($"ML model user with Id {mlModelUserId} deleted successfully.");
        }
        catch (Exception ex)
        {
            // Log exception details
            _logger.LogError(ex, $"Exception occurred while deleting ML model user with Id {mlModelUserId}.");
        }

        // Return response indicating success
        return serviceResponse;
    }

    // Deletes multiple ML model users by a list of their unique identifiers.
    public async Task<ServiceResponse<bool>> DeleteMultipleMLModelUsersAsync(IEnumerable<Guid> mlModelUserIds)
    {
        // Initialize response object with default failure message
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete ML model users. Please try again."
        };

        try
        {
            // Fetch all ML model users matching the given list of Ids
            var mlModelUsers = await _unitOfWork.MLModelUserRepo
                .GetByConditionAsync(w => mlModelUserIds.Contains(w.Id) && w.UserId != _userId)
                .ToListAsync();

            // If no users are found, log info and return response
            if (!mlModelUsers.Any())
            {
                _logger.LogInformation("No ML model users found matching the provided IDs.");
                serviceResponse.Message = "No users found to delete.";
                return serviceResponse;
            }

            // Delete all found users using repository's bulk delete method
            _unitOfWork.MLModelUserRepo.Delete(mlModelUsers);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save deletion of multiple ML model users.");
                return serviceResponse;
            }

            // Set success values in response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML model users deleted successfully.";

            // Log the number of users deleted
            _logger.LogInformation($"Successfully deleted {mlModelUsers.Count} ML model user(s).");
        }
        catch (Exception ex)
        {
            // Log the exception with stack trace
            _logger.LogError(ex, "Exception occurred while deleting multiple ML model users.");
        }

        // Return the final response
        return serviceResponse;
    }
}
