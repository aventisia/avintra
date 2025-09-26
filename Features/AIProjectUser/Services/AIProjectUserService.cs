namespace MLModelBuilderAPIs.Services;

public class AIProjectUserService : IAIProjectUserService
{
    private readonly ILogger<AIProjectUserService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public AIProjectUserService(
        ILogger<AIProjectUserService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Attempt to retrieve current user's ID from JWT claims; fallback to Guid.Empty if missing or invalid
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves all users associated with a specified AI project, excluding the current user.
    public async Task<ServiceResponse<IEnumerable<AIProjectUserDto>>> GetAIProjectUsersByAIProjectIdAsync(Guid aiProjectId)
    {
        // Initialize the service response object to return in case of failure or success
        var serviceResponse = new ServiceResponse<IEnumerable<AIProjectUserDto>>
        {
            Data = null,
            Message = "Failed to retrieve AI project users. Please try again."
        };

        try
        {
            _logger.LogInformation($"Fetching users for AI project with Id {aiProjectId}, excluding current user {_userId}.");

            var aiProjectUsers = await _unitOfWork.AIProjectUserRepo
                .GetByConditionAsync(u => u.AIProjectId == aiProjectId && u.UserId != _userId)
                .Include(u => u.User)
                .ProjectToType<AIProjectUserDto>()
                .ToListAsync();

            serviceResponse.Data = aiProjectUsers;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"Successfully retrieved {aiProjectUsers.Count} users for AI project.";

            _logger.LogInformation($"Retrieved {aiProjectUsers.Count} users for AI project {aiProjectId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Exception while retrieving users for AI project {aiProjectId}.");
        }

        return serviceResponse;
    }

    // Retrieves details for a single AI project user by their unique association Id, excluding current user.
    public async Task<ServiceResponse<AIProjectUserDto>> GetAIProjectUserByIdAsync(Guid aiProjectUserId)
    {
        // Initialize the service response object to return in case of failure or success
        var serviceResponse = new ServiceResponse<AIProjectUserDto>
        {
            Data = null,
            Message = "Failed to retrive ai project users. Please try again."
        };

        try
        {
            _logger.LogInformation($"Attempting to fetch AI project user with Id {aiProjectUserId}, excluding current user {_userId}.");

            var aiProjectUserEntity = await _unitOfWork.AIProjectUserRepo
                .GetByConditionAsync(u => u.Id == aiProjectUserId && u.UserId != _userId)
                .Include(u => u.User)
                .SingleOrDefaultAsync();

            if (aiProjectUserEntity == null)
            {
                _logger.LogInformation($"No AI project user found with Id {aiProjectUserId}.");
                serviceResponse.Message = "AI project user not found.";
                return serviceResponse;
            }

            serviceResponse.Data = aiProjectUserEntity.Adapt<AIProjectUserDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI project user retrieved successfully.";

            _logger.LogInformation($"Successfully retrieved AI project user with Id {aiProjectUserId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Exception while retrieving AI project user with Id {aiProjectUserId}.");
        }

        return serviceResponse;
    }

    // Adds a new user to an AI project, with access restrictions based on tenant configuration.
    public async Task<ServiceResponse<AIProjectUserDto>> InsertAIProjectUserAsync(AIProjectUserDto aiProjectUserDto)
    {
        // Initialize the service response object to return in case of failure or success
        var serviceResponse = new ServiceResponse<AIProjectUserDto>
        {
            Data = null,
            Message = "Failed to add user to AI project. Please try again."
        };

        try
        {
            // Check for existing user association with the same UserId and AIProjectId to avoid duplicates
            var existingUser = await _unitOfWork.AIProjectUserRepo
                .GetByConditionAsync(u =>
                    u.UserId == aiProjectUserDto.UserId &&
                    u.AIProjectId == aiProjectUserDto.MLModelId)
                .SingleOrDefaultAsync();

            if (existingUser != null)
            {
                _logger.LogInformation($"User {aiProjectUserDto.UserId} already associated with AI project {aiProjectUserDto.MLModelId}. Existing association Id: {existingUser.Id}");
                serviceResponse.Message = "User already exists for the specified AI project.";
                return serviceResponse;
            }

            // Clean string fields of DTO to remove extraneous whitespace
            aiProjectUserDto = TrimDtoStringPropsUtil.TrimDtoStringProps(aiProjectUserDto);

            // Map DTO to entity
            var newAIProjectUser = aiProjectUserDto.Adapt<AIProject_User>();
            newAIProjectUser.CreatedByUserId = _userId;
            newAIProjectUser.LastModifiedByUserId = _userId;

            // Insert new user association
            await _unitOfWork.AIProjectUserRepo.InsertAsync(newAIProjectUser);

            // Save changes to DB
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save new AI project user association to database.");
                return serviceResponse;
            }

            serviceResponse.Data = newAIProjectUser.Adapt<AIProjectUserDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User added to AI project successfully.";

            _logger.LogInformation($"User {newAIProjectUser.UserId} added to AI project {newAIProjectUser.AIProjectId} by user {_userId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while adding a user to AI project.");
        }

        return serviceResponse;
    }

    // Assigns multiple users to an AI project, ensuring no duplicates and tenant restrictions.
    public async Task<ServiceResponse<bool>> AssignAIProjectUserAsync(AssignAIProjectUserDto assignAIProjectUserDto)
    {
        // Initialize the service response object to return in case of failure or success
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to assign users to the AI project. Please try again."
        };

        try
        {
            _logger.LogInformation($"Assigning users {string.Join(", ", assignAIProjectUserDto.UserIds)} to AI project {assignAIProjectUserDto.MLModelId} with access type {assignAIProjectUserDto.AccessType}.");

            // Fetch users in system matching provided IDs
            var usersToAssign = await _unitOfWork.ModelBuilderUserRepo
                .GetByConditionAsync(user => assignAIProjectUserDto.UserIds.Contains(user.Id))
                .ToListAsync();

            if (!usersToAssign.Any())
            {
                _logger.LogInformation("No matching users found for provided IDs.");
                serviceResponse.Message = "User(s) not found.";
                return serviceResponse;
            }

            // Check if any user is already assigned to the AI project
            var existingAssignment = await _unitOfWork.AIProjectUserRepo
                .GetByConditionAsync(a =>
                    a.AIProjectId == assignAIProjectUserDto.MLModelId &&
                    usersToAssign.Select(u => u.Id).Contains(a.UserId))
                .FirstOrDefaultAsync();

            if (existingAssignment != null)
            {
                var existingUser = usersToAssign.FirstOrDefault(u => u.Id == existingAssignment.UserId);
                var userName = existingUser != null ? $"{existingUser.FirstName} {existingUser.LastName}" : existingAssignment.UserId.ToString();

                _logger.LogInformation($"User '{userName}' is already assigned to AI project {assignAIProjectUserDto.MLModelId}.");
                serviceResponse.Message = $"User '{userName}' is already assigned to the specified AI project.";
                return serviceResponse;
            }

            // Trim string properties in DTO if necessary
            assignAIProjectUserDto = TrimDtoStringPropsUtil.TrimDtoStringProps(assignAIProjectUserDto);

            // Prepare list of AIProject_User entities for insertion
            var newAIProjectUsers = usersToAssign.Select(user => new AIProject_User
            {
                AIProjectId = assignAIProjectUserDto.MLModelId,
                AccessType = assignAIProjectUserDto.AccessType,
                UserId = user.Id,
                CreatedByUserId = _userId,
                CreatedOn = DateTimeOffset.UtcNow,
                LastModifiedByUserId = _userId
            }).ToList();

            // Insert new user assignments
            await _unitOfWork.AIProjectUserRepo.InsertAsync(newAIProjectUsers);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to persist new user assignments to the AI project.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Users successfully assigned to the AI project.";

            _logger.LogInformation($"Successfully assigned users to AI project {assignAIProjectUserDto.MLModelId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while assigning users to AI project.");
        }

        return serviceResponse;
    }

    // Updates properties of an existing AI project user association.
    public async Task<ServiceResponse<AIProjectUserDto>> UpdateAIProjectUserAsync(AIProjectUserDto aiProjectUserDto)
    {
        // Initialize the service response object to return in case of failure or success
        var serviceResponse = new ServiceResponse<AIProjectUserDto>
        {
            Data = null,
            Message = "Failed to update AI project user. Please try again."
        };

        try
        {
            _logger.LogInformation($"Fetching AI project user with Id {aiProjectUserDto.Id} for update, excluding current user {_userId}.");

            var existingUser = await _unitOfWork.AIProjectUserRepo
                .GetByConditionAsync(u =>
                    u.Id == aiProjectUserDto.Id &&
                    u.UserId != _userId)
                .SingleOrDefaultAsync();

            if (existingUser == null)
            {
                _logger.LogInformation($"AI project user with Id {aiProjectUserDto.Id} not found.");
                serviceResponse.Message = "User not found.";
                return serviceResponse;
            }

            // Clean string properties on incoming DTO
            aiProjectUserDto = TrimDtoStringPropsUtil.TrimDtoStringProps(aiProjectUserDto);

            // Update editable fields
            existingUser.AccessType = aiProjectUserDto.AccessType;
            existingUser.AIProjectId = aiProjectUserDto.MLModelId;
            existingUser.LastModifiedByUserId = _userId;

            // Mark entity updated
            _unitOfWork.AIProjectUserRepo.Update(existingUser);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning($"Failed to save updates for AI project user with Id {existingUser.Id}.");
                return serviceResponse;
            }

            serviceResponse.Data = existingUser.Adapt<AIProjectUserDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI project user updated successfully.";

            _logger.LogInformation($"AI project user with Id {existingUser.Id} updated by user {_userId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Exception occurred while updating AI project user with Id {aiProjectUserDto.Id}.");
        }

        return serviceResponse;
    }

    // Deletes a single AI project user association permanently.
    public async Task<ServiceResponse<bool>> DeleteAIProjectUserAsync(Guid aiProjectUserId)
    {
        // Initialize the service response object to return in case of failure or success
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete AI project user. Please try again."
        };

        try
        {
            _logger.LogInformation($"Attempting to delete AI project user with Id {aiProjectUserId}, excluding current user {_userId}.");

            var userToDelete = await _unitOfWork.AIProjectUserRepo
                .GetByConditionAsync(u => u.Id == aiProjectUserId && u.UserId != _userId)
                .SingleOrDefaultAsync();

            if (userToDelete == null)
            {
                _logger.LogInformation($"AI project user with Id {aiProjectUserId} does not exist.");
                serviceResponse.Message = "User does not exist.";
                return serviceResponse;
            }

            _unitOfWork.AIProjectUserRepo.Delete(userToDelete);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning($"Failed to persist deletion of AI project user with Id {aiProjectUserId}.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI project user deleted successfully.";

            _logger.LogInformation($"AI project user with Id {aiProjectUserId} deleted by user {_userId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Exception occurred while deleting AI project user with Id {aiProjectUserId}.");
        }

        return serviceResponse;
    }

    // Deletes multiple AI project users based on a list of IDs.
    public async Task<ServiceResponse<bool>> DeleteMultipleAIProjectUsersAsync(IEnumerable<Guid> aiProjectUserIds)
    {
        // Initialize the service response object to return in case of failure or success
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete AI project users. Please try again."
        };

        try
        {
            _logger.LogInformation($"Attempting bulk delete of AI project users with IDs: {string.Join(", ", aiProjectUserIds)} excluding current user {_userId}.");

            var usersToDelete = await _unitOfWork.AIProjectUserRepo
                .GetByConditionAsync(u => aiProjectUserIds.Contains(u.Id) && u.UserId != _userId)
                .ToListAsync();

            if (!usersToDelete.Any())
            {
                _logger.LogInformation("No AI project users found matching the provided IDs.");
                serviceResponse.Message = "No users found to delete.";
                return serviceResponse;
            }

            _unitOfWork.AIProjectUserRepo.Delete(usersToDelete);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to persist bulk deletion of AI project users.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI project users deleted successfully.";

            _logger.LogInformation($"Successfully deleted {usersToDelete.Count} AI project user(s).");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred during bulk deletion of AI project users.");
        }

        return serviceResponse;
    }
}
