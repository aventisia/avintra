namespace MLModelBuilderAPIs.Services;

public class AIProjectVersionApiKeyService : IAIProjectVersionApiKeyService
{
    private readonly ILogger<AIProjectVersionApiKeyService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly Guid _userId;

    public AIProjectVersionApiKeyService(
        ILogger<AIProjectVersionApiKeyService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _httpContextAccessor = httpContextAccessor;

        // Retrieve the user ID from the HTTP context claims. 
        // If not found, default to an empty GUID.
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("uid");
        _userId = Guid.TryParse(userIdClaim, out var parsedUserId) ? parsedUserId : Guid.Empty;
        _logger.LogInformation("Initialized AIProjectVersionApiKeyService for user {UserId}", _userId);
    }

    // Retrieves all API keys linked to a specific AI project version for the current user.
    public async Task<ServiceResponse<IEnumerable<AIProjectVersionApiKeyDto>>> GetApiKeysByAIProjectVersionIdAsync(Guid aiProjectVersionId)
    {
        // Initialize response object with failure default.
        var serviceResponse = new ServiceResponse<IEnumerable<AIProjectVersionApiKeyDto>>
        {
            Data = null,
            Message = "Failed to retrieve API keys. Please try again later."
        };

        try
        {
            _logger.LogInformation("Fetching API keys for user {UserId} and AI project version {ModelId}", _userId, aiProjectVersionId);

            // Query the repository for API keys matching the AI project version ID.
            // Include related AIProjectVersion and AIProject for richer data.
            var apiKeysQuery = _unitOfWork.AIProjectVersionApiKeyRepo
                .GetByConditionAsync(key => key.AIProjectVersionId == aiProjectVersionId)
                .OrderByDescending(key => key.CreatedOn)
                .Include(i => i.AIProjectVersion)
                .ThenInclude(i2 => i2.AIProject);

            // Execute the query and project results to DTO.
            var apiKeys = await apiKeysQuery
                .ProjectToType<AIProjectVersionApiKeyDto>()
                .ToListAsync();

            // Assign retrieved API keys to response data with success status.
            serviceResponse.Data = apiKeys;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "API keys retrieved successfully.";

            _logger.LogInformation("Retrieved {Count} API keys for user {UserId}", apiKeys.Count, _userId);
        }
        catch (Exception ex)
        {
            // Log the exception details for troubleshooting.
            _logger.LogError(ex, "Error occurred while retrieving API keys for user {UserId}", _userId);
        }

        return serviceResponse;
    }

    // Generates and stores a new API key for the authenticated user
    public async Task<ServiceResponse<AIProjectVersionApiKeyDto>> GenerateApiKeyAsync(AIProjectVersionApiKeyDto aiProjectVersionApiKeyDto)
    {
        // Initialize the service response with failure message by default
        var serviceResponse = new ServiceResponse<AIProjectVersionApiKeyDto>
        {
            Data = null,
            Message = "Failed to generate API key. Please try again."
        };

        try
        {
            // Check if an API key with the same name already exists for the given AI project version.
            var existingApiKeyQuery = _unitOfWork.AIProjectVersionApiKeyRepo
                .GetByConditionAsync(w =>
                    w.AIProjectVersionId == aiProjectVersionApiKeyDto.AIProjectVersionId &&
                    w.Name.ToLower() == aiProjectVersionApiKeyDto.Name.ToLower())
                .Include(i => i.AIProjectVersion)
                .ThenInclude(i2 => i2.AIProject);

            var existingApiKey = await existingApiKeyQuery.SingleOrDefaultAsync();

            if (existingApiKey != null)
            {
                // Log the duplicate detection with warning level.
                _logger.LogWarning("Duplicate API key name '{ApiKeyName}' found for AI project version ID {ModelId} by user {UserId}",
                    aiProjectVersionApiKeyDto.Name, aiProjectVersionApiKeyDto.AIProjectVersionId, _userId);

                serviceResponse.Message = $"API key with name '{aiProjectVersionApiKeyDto.Name}' already exists for this AI project version.";
                return serviceResponse;
            }

            _logger.LogInformation("Generating new API key for user {UserId} for AI project version {ModelId}", _userId, aiProjectVersionApiKeyDto.AIProjectVersionId);

            // Sanitize string properties in DTO (trim whitespace etc.)
            aiProjectVersionApiKeyDto = TrimDtoStringPropsUtil.TrimDtoStringProps(aiProjectVersionApiKeyDto);

            // Map DTO to entity type AIProjectVersionApiKey.
            var newApiKeyEntity = aiProjectVersionApiKeyDto.Adapt<AIProjectVersionApiKey>();

            // Generate a unique API key string, using base64-encoded GUID without special characters.
            newApiKeyEntity.ApiKey = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
                .Replace("=", "")
                .Replace("+", "")
                .Replace("/", "");

            // Set metadata fields for audit tracking.
            newApiKeyEntity.CreatedByUserId = _userId;
            newApiKeyEntity.LastModifiedByUserId = _userId;

            // Insert the new entity into the repository.
            await _unitOfWork.AIProjectVersionApiKeyRepo.InsertAsync(newApiKeyEntity);

            // Persist changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save new API key for user {UserId}", _userId);
                return serviceResponse;
            }

            // Map the saved entity back to DTO including the generated API key value.
            var createdApiKeyDto = newApiKeyEntity.Adapt<AIProjectVersionApiKeyDto>();
            createdApiKeyDto.ApiKey = newApiKeyEntity.ApiKey;

            serviceResponse.Data = createdApiKeyDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "API key created successfully.";

            _logger.LogInformation("New API key successfully created for user {UserId}", _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while creating API key for user {UserId}", _userId);
        }

        return serviceResponse;
    }

    // Retrieves a specific API key by its ID
    public async Task<ServiceResponse<AIProjectVersionApiKeyDto>> GetApiKeyByIdAsync(Guid aiProjectVersionApiKeyId)
    {
        // Initialize response with failure defaults.
        var serviceResponse = new ServiceResponse<AIProjectVersionApiKeyDto>
        {
            Data = null,
            Message = "Failed to retrieve API key. Please try again."
        };

        try
        {
            _logger.LogInformation("Fetching API key with ID {ApiKeyId} for user {UserId}", aiProjectVersionApiKeyId, _userId);

            // Query repository to get API key entity by ID, including related user and project info.
            var apiKeyEntity = await _unitOfWork.AIProjectVersionApiKeyRepo
                .GetByConditionAsync(w => w.Id == aiProjectVersionApiKeyId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.AIProjectVersion)
                .ThenInclude(i2 => i2.AIProject)
                .SingleOrDefaultAsync();

            if (apiKeyEntity == null)
            {
                _logger.LogWarning("API key with ID {ApiKeyId} not found for user {UserId}", aiProjectVersionApiKeyId, _userId);
                serviceResponse.Message = "API key not found.";
                return serviceResponse;
            }

            serviceResponse.Data = apiKeyEntity.Adapt<AIProjectVersionApiKeyDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "API key retrieved successfully.";

            _logger.LogInformation("Successfully retrieved API key {ApiKeyId} for user {UserId}", aiProjectVersionApiKeyId, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving API key {ApiKeyId} for user {UserId}", aiProjectVersionApiKeyId, _userId);
        }

        return serviceResponse;
    }

    // Updates an existing API key if it belongs to the current user
    public async Task<ServiceResponse<AIProjectVersionApiKeyDto>> UpdateApiKeyAsync(AIProjectVersionApiKeyDto aiProjectVersionApiKeyDto)
    {
        // Initialize response object with failure default message.
        var serviceResponse = new ServiceResponse<AIProjectVersionApiKeyDto>
        {
            Data = null,
            Message = "Failed to update API key. Please try again later."
        };

        try
        {
            _logger.LogInformation("Starting update for API key ID {ApiKeyId} by user {UserId}", aiProjectVersionApiKeyDto.Id, _userId);

            // Retrieve existing API key entity for the current user.
            var existingApiKey = await _unitOfWork.AIProjectVersionApiKeyRepo
                .GetByConditionAsync(key => key.Id == aiProjectVersionApiKeyDto.Id && key.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            if (existingApiKey == null)
            {
                _logger.LogWarning("API key ID {ApiKeyId} not found for update by user {UserId}", aiProjectVersionApiKeyDto.Id, _userId);
                serviceResponse.Message = "API key not found for update.";
                return serviceResponse;
            }

            // Check if another API key with the same name exists under the same AI project version.
            var duplicateApiKey = await _unitOfWork.AIProjectVersionApiKeyRepo
                .GetByConditionAsync(w =>
                    w.Id != aiProjectVersionApiKeyDto.Id &&
                    w.AIProjectVersionId == aiProjectVersionApiKeyDto.AIProjectVersionId &&
                    w.Name.ToLower() == aiProjectVersionApiKeyDto.Name.ToLower())
                .SingleOrDefaultAsync();

            if (duplicateApiKey != null)
            {
                _logger.LogWarning("Duplicate API key name '{ApiKeyName}' found during update for AI project version ID {ModelId} by user {UserId}",
                    aiProjectVersionApiKeyDto.Name, aiProjectVersionApiKeyDto.AIProjectVersionId, _userId);
                serviceResponse.Message = $"Another API key with name '{aiProjectVersionApiKeyDto.Name}' already exists for this AI project version.";
                return serviceResponse;
            }

            // Clean string properties in the DTO.
            aiProjectVersionApiKeyDto = TrimDtoStringPropsUtil.TrimDtoStringProps(aiProjectVersionApiKeyDto);

            // Map changes from DTO to the existing entity.
            aiProjectVersionApiKeyDto.Adapt(existingApiKey);

            // Update last modified metadata.
            existingApiKey.LastModifiedByUserId = _userId;

            // Mark the entity as updated.
            _unitOfWork.AIProjectVersionApiKeyRepo.Update(existingApiKey);

            // Save changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save updated API key ID {ApiKeyId} for user {UserId}", aiProjectVersionApiKeyDto.Id, _userId);
                return serviceResponse;
            }

            // Map updated entity back to DTO for response.
            var updatedApiKeyDto = existingApiKey.Adapt<AIProjectVersionApiKeyDto>();

            serviceResponse.Data = updatedApiKeyDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "API key updated successfully.";

            _logger.LogInformation("API key ID {ApiKeyId} successfully updated by user {UserId}", aiProjectVersionApiKeyDto.Id, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while updating API key ID {ApiKeyId} for user {UserId}", aiProjectVersionApiKeyDto.Id, _userId);
        }

        return serviceResponse;
    }

    // Deletes an API key by ID if owned by the current user
    public async Task<ServiceResponse<bool>> DeleteApiKeyAsync(Guid aiProjectVersionApiKeyId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete the API key. Please try again."
        };

        try
        {
            _logger.LogInformation("User {UserId} attempting to delete API key ID {ApiKeyId}", _userId, aiProjectVersionApiKeyId);

            // Retrieve the API key for deletion if owned by user.
            var apiKeyToDelete = await _unitOfWork.AIProjectVersionApiKeyRepo
                .GetByConditionAsync(key => key.Id == aiProjectVersionApiKeyId && key.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            if (apiKeyToDelete == null)
            {
                _logger.LogWarning("API key ID {ApiKeyId} not found or not owned by user {UserId}", aiProjectVersionApiKeyId, _userId);
                serviceResponse.Message = "API key not found or not accessible.";
                return serviceResponse;
            }

            // Delete the entity from the repository.
            _unitOfWork.AIProjectVersionApiKeyRepo.Delete(apiKeyToDelete);

            // Persist the deletion to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to delete API key ID {ApiKeyId} from database for user {UserId}", aiProjectVersionApiKeyId, _userId);
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "API key deleted successfully.";

            _logger.LogInformation("API key ID {ApiKeyId} successfully deleted by user {UserId}", aiProjectVersionApiKeyId, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting API key ID {ApiKeyId} for user {UserId}", aiProjectVersionApiKeyId, _userId);
        }

        return serviceResponse;
    }

    // Bulk deletes multiple API keys owned by the current user
    public async Task<ServiceResponse<bool>> DeleteMultipleApiKeysAsync([FromBody] List<Guid> aiProjectVersionApiKeyIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete API keys. Please try again."
        };

        try
        {
            _logger.LogInformation("User {UserId} attempting to bulk delete {Count} API keys", _userId, aiProjectVersionApiKeyIds.Count);

            // Retrieve all API keys owned by the user matching the list of IDs.
            var apiKeysToDelete = await _unitOfWork.AIProjectVersionApiKeyRepo
                .GetByConditionAsync(key => aiProjectVersionApiKeyIds.Contains(key.Id) && key.CreatedByUserId == _userId)
                .ToListAsync();

            if (!apiKeysToDelete.Any())
            {
                _logger.LogWarning("No API keys found to delete matching provided IDs for user {UserId}", _userId);
                serviceResponse.Message = "No API keys found to delete.";
                return serviceResponse;
            }

            // Perform the bulk delete operation.
            _unitOfWork.AIProjectVersionApiKeyRepo.Delete(apiKeysToDelete);

            // Save changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist bulk API key deletion for user {UserId}", _userId);
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{apiKeysToDelete.Count} API key(s) deleted successfully.";

            _logger.LogInformation("User {UserId} successfully deleted {Count} API keys", _userId, apiKeysToDelete.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during bulk API key deletion for user {UserId}", _userId);
        }

        return serviceResponse;
    }
}
