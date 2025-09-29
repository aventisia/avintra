namespace MLModelBuilderAPIs.Services;

public class AIProjectApiKeyService : IAIProjectApiKeyService
{
    private readonly ILogger<AIProjectApiKeyService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly Guid _userId;

    public AIProjectApiKeyService(
        ILogger<AIProjectApiKeyService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _httpContextAccessor = httpContextAccessor;

        // Retrieve the user ID from the HTTP context claims. Default to empty GUID if not found
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Retrieves all API keys linked to a specific AI project for the current user.
    public async Task<ServiceResponse<IEnumerable<AIProjectApiKeyDto>>> GetApiKeysByAIProjectIdAsync(Guid aiProjectlId)
    {
        // Initialize response with default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<AIProjectApiKeyDto>>
        {
            Data = null,
            Message = "Failed to retrieve API keys. Please try again later."
        };

        try
        {
            _logger.LogInformation("Fetching API keys for user {UserId} and AI project {ModelId}", _userId, aiProjectlId);

            // Query API keys by AI project ID and the user, ordered by creation date
            var apiKeys = await _unitOfWork.AIProjectApiKeyRepo
                .GetByConditionAsync(key => key.AIProjectId == aiProjectlId)
                .OrderByDescending(key => key.CreatedOn)
                .Include(key => key.AIProject)
                .ProjectToType<AIProjectApiKeyDto>()
                .ToListAsync();

            // Set successful response data and message
            serviceResponse.Data = apiKeys;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "API keys retrieved successfully.";

            _logger.LogInformation("Retrieved {Count} API keys for user {UserId}", apiKeys.Count, _userId);
        }
        catch (Exception ex)
        {
            // Log error in case of exception
            _logger.LogError(ex, "Error occurred while retrieving API keys for user {UserId}", _userId);
        }

        return serviceResponse;
    }

    // Generates and stores a new API key for the authenticated user
    public async Task<ServiceResponse<AIProjectApiKeyDto>> GenerateApiKeyAsync(AIProjectApiKeyDto aiProjectApiKeyDto)
    {
        // Initialize response with default failure message
        var serviceResponse = new ServiceResponse<AIProjectApiKeyDto>
        {
            Data = null,
            Message = "Failed to generate API key. Please try again."
        };

        try
        {
            // Check if a duplicate API key with the same name exists for the AI project
            var existingApiKey = await _unitOfWork.AIProjectApiKeyRepo
                .GetByConditionAsync(w =>
                    w.AIProjectId == aiProjectApiKeyDto.MLModelId &&
                    w.Name.ToLower() == aiProjectApiKeyDto.Name.ToLower())
                .Include(key => key.AIProject)
                .SingleOrDefaultAsync();

            if (existingApiKey != null)
            {
                // Log a warning for the duplicate API key and return a failure response
                _logger.LogWarning("Duplicate API key name '{ApiKeyName}' found for AI project ID {ModelId} by user {UserId}",
                    aiProjectApiKeyDto.Name, aiProjectApiKeyDto.MLModelId, _userId);

                serviceResponse.Message = $"API key with name '{aiProjectApiKeyDto.Name}' already exists for this AI project model.";
                return serviceResponse;
            }

            // Log the process of generating a new API key for the model
            _logger.LogInformation("Generating new API key for user {UserId} for model {ModelId}", _userId, aiProjectApiKeyDto.MLModelId);

            // Clean string properties of incoming DTO to remove unwanted spaces or characters
            aiProjectApiKeyDto = TrimDtoStringPropsUtil.TrimDtoStringProps(aiProjectApiKeyDto);

            // Adapt the DTO to entity, generate a unique API key string, and assign metadata
            var newApiKeyEntity = aiProjectApiKeyDto.Adapt<AIProjectApiKey>();
            newApiKeyEntity.ApiKey = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
                .Replace("=", "")
                .Replace("+", "")
                .Replace("/", "");
            newApiKeyEntity.CreatedByUserId = _userId;
            newApiKeyEntity.LastModifiedByUserId = _userId;

            // Insert the new API key entity into the repository
            await _unitOfWork.AIProjectApiKeyRepo.InsertAsync(newApiKeyEntity);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                // Log failure to save and return failure response
                _logger.LogWarning("Failed to save new API key for user {UserId}", _userId);
                return serviceResponse;
            }

            // Map back the saved entity to DTO, explicitly including the generated API key value
            var createdApiKeyDto = newApiKeyEntity.Adapt<AIProjectApiKeyDto>();
            createdApiKeyDto.ApiKey = newApiKeyEntity.ApiKey;

            serviceResponse.Data = createdApiKeyDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "API key created successfully.";

            // Log the successful creation of the API key
            _logger.LogInformation("New API key successfully created for user {UserId}", _userId);
        }
        catch (Exception ex)
        {
            // Log error in case of exception
            _logger.LogError(ex, "Exception occurred while creating API key for user {UserId}", _userId);
        }

        return serviceResponse;
    }

    // Retrieves a specific API key by its ID if it belongs to the current user
    public async Task<ServiceResponse<AIProjectApiKeyDto>> GetApiKeyByIdAsync(Guid aiProjectApiKeyId)
    {
        // Initialize response with failure defaults
        var serviceResponse = new ServiceResponse<AIProjectApiKeyDto>
        {
            Data = null,
            Message = "Failed to retrive Api key. Please try again"
        };

        try
        {
            // Log the attempt to fetch the API key
            _logger.LogInformation("Fetching API key with ID {AIProjectApiKeyId} for user {UserId}", aiProjectApiKeyId, _userId);

            // Retrieve the API key entity by ID including related user and AI project details
            var apiKeyEntity = await _unitOfWork.AIProjectApiKeyRepo
                .GetByConditionAsync(w => w.Id == aiProjectApiKeyId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.AIProject)
                .SingleOrDefaultAsync();

            if (apiKeyEntity == null)
            {
                // Log a warning if the API key is not found
                _logger.LogWarning("API key with ID {ApiKeyId} not found for user {UserId}", aiProjectApiKeyId, _userId);
                serviceResponse.Message = "API key not found.";
                return serviceResponse;
            }

            // Map entity to DTO and set successful response
            serviceResponse.Data = apiKeyEntity.Adapt<AIProjectApiKeyDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "API key retrieved successfully.";

            // Log successful retrieval of the API key
            _logger.LogInformation("Successfully retrieved API key {ApiKeyId} for user {UserId}", aiProjectApiKeyId, _userId);
        }
        catch (Exception ex)
        {
            // Log error if an exception occurs
            _logger.LogError(ex, "Error occurred while retrieving API key {ApiKeyId} for user {UserId}", aiProjectApiKeyId, _userId);
        }

        return serviceResponse;
    }

    // Updates an existing API key if it belongs to the current user
    public async Task<ServiceResponse<AIProjectApiKeyDto>> UpdateApiKeyAsync(AIProjectApiKeyDto aiProjectApiKeyDto)
    {
        var serviceResponse = new ServiceResponse<AIProjectApiKeyDto>
        {
            Data = null,
            Message = "Failed to update API key. Please try again later."
        };

        try
        {
            // Log the update process for the API key
            _logger.LogInformation("Starting update process for API key ID {ApiKeyId} by user {UserId}", aiProjectApiKeyDto.Id, _userId);

            // Retrieve the existing API key entity for the current user
            var existingApiKey = await _unitOfWork.AIProjectApiKeyRepo
                .GetByConditionAsync(key => key.Id == aiProjectApiKeyDto.Id && key.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            if (existingApiKey == null)
            {
                // Log a warning if no matching API key is found
                _logger.LogWarning("No existing API key found with ID {ApiKeyId} for user {UserId}", aiProjectApiKeyDto.Id, _userId);
                serviceResponse.Message = "API key not found for update.";
                return serviceResponse;
            }

            // Check for duplicate API key name under the same model to avoid name conflicts
            var duplicateApiKey = await _unitOfWork.AIProjectApiKeyRepo
                .GetByConditionAsync(w =>
                    w.Id != aiProjectApiKeyDto.Id &&
                    w.AIProjectId == aiProjectApiKeyDto.MLModelId &&
                    w.Name.ToLower() == aiProjectApiKeyDto.Name.ToLower())
                .SingleOrDefaultAsync();

            if (duplicateApiKey != null)
            {
                // Log a warning if a duplicate API key name is found
                _logger.LogWarning("Duplicate API key name '{ApiKeyName}' found for model ID {ModelId} during update by user {UserId}",
                    aiProjectApiKeyDto.Name, aiProjectApiKeyDto.MLModelId, _userId);

                serviceResponse.Message = $"Another API key with name '{aiProjectApiKeyDto.Name}' already exists for this AI project model.";
                return serviceResponse;
            }

            // Clean the incoming DTO to remove any unwanted spaces or characters
            aiProjectApiKeyDto = TrimDtoStringPropsUtil.TrimDtoStringProps(aiProjectApiKeyDto);

            // Map updated properties from DTO to entity
            aiProjectApiKeyDto.Adapt(existingApiKey);

            // Set metadata indicating the user who last modified the key
            existingApiKey.LastModifiedByUserId = _userId;

            // Update the repository with the modified entity
            _unitOfWork.AIProjectApiKeyRepo.Update(existingApiKey);

            // Save the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                // Log a failure to save changes
                _logger.LogWarning("Failed to save updated API key ID {ApiKeyId} for user {UserId}", aiProjectApiKeyDto.Id, _userId);
                return serviceResponse;
            }

            // Map the updated entity back to a DTO
            var updatedApiKeyDto = existingApiKey.Adapt<AIProjectApiKeyDto>();

            serviceResponse.Data = updatedApiKeyDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "API key updated successfully.";

            // Log success of the update
            _logger.LogInformation("API key ID {ApiKeyId} successfully updated by user {UserId}", aiProjectApiKeyDto.Id, _userId);
        }
        catch (Exception ex)
        {
            // Log error if an exception occurs
            _logger.LogError(ex, "Exception occurred while updating API key ID {ApiKeyId} for user {UserId}", aiProjectApiKeyDto.Id, _userId);
        }

        return serviceResponse;
    }

    // Deletes an API key by ID if it belongs to the current user
    public async Task<ServiceResponse<bool>> DeleteApiKeyAsync(Guid aiProjectApiKeyId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete the API key. Please try again."
        };

        try
        {
            // Log the attempt to delete the API key
            _logger.LogInformation("User {UserId} attempting to delete API key ID {ApiKeyId}", _userId, aiProjectApiKeyId);

            // Retrieve the API key entity by ID if it belongs to the current user
            var ApiKeyToDelete = await _unitOfWork.AIProjectApiKeyRepo
                .GetByConditionAsync(key => key.Id == aiProjectApiKeyId && key.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            if (ApiKeyToDelete == null)
            {
                // Log a warning if the API key is not found or not owned by the user
                _logger.LogWarning("API key ID {ApiKeyId} not found or not owned by user {UserId}", aiProjectApiKeyId, _userId);
                serviceResponse.Message = "API key not found or not accessible.";
                return serviceResponse;
            }

            // Delete the API key entity from the repository
            _unitOfWork.AIProjectApiKeyRepo.Delete(ApiKeyToDelete);

            // Persist the deletion in the database
            if (!await _unitOfWork.SaveAsync())
            {
                // Log failure to delete and return response
                _logger.LogWarning("Failed to delete API key ID {ApiKeyId} from database for user {UserId}", aiProjectApiKeyId, _userId);
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "API key deleted successfully.";

            // Log the successful deletion
            _logger.LogInformation("API key ID {ApiKeyId} successfully deleted by user {UserId}", aiProjectApiKeyId, _userId);
        }
        catch (Exception ex)
        {
            // Log error during deletion
            _logger.LogError(ex, "Error occurred while deleting API key ID {ApiKeyId} for user {UserId}", aiProjectApiKeyId, _userId);
        }

        return serviceResponse;
    }

    // Bulk delete multiple API keys by their IDs if they belong to the current user
    public async Task<ServiceResponse<bool>> DeleteMultipleApiKeysAsync([FromBody] List<Guid> aiProjectApiKeyIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete API keys. Please try again."
        };

        try
        {
            // Log the attempt for bulk deletion
            _logger.LogInformation("User {UserId} attempting to bulk delete {Count} API keys", _userId, aiProjectApiKeyIds.Count);

            // Fetch all API keys matching provided IDs and owned by the user
            var apiKeysToDelete = await _unitOfWork.AIProjectApiKeyRepo
                .GetByConditionAsync(key => aiProjectApiKeyIds.Contains(key.Id) && key.CreatedByUserId == _userId)
                .ToListAsync();

            if (!apiKeysToDelete.Any())
            {
                // Log a warning if no keys are found to delete
                _logger.LogWarning("No API keys found to delete matching provided IDs for user {UserId}", _userId);
                serviceResponse.Message = "No API keys found to delete.";
                return serviceResponse;
            }

            // Perform the bulk delete
            _unitOfWork.AIProjectApiKeyRepo.Delete(apiKeysToDelete);

            // Persist the bulk deletion in the database
            if (!await _unitOfWork.SaveAsync())
            {
                // Log an error if bulk delete fails
                _logger.LogError("Failed to persist bulk API key deletion for user {UserId}", _userId);
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{apiKeysToDelete.Count} API key(s) deleted successfully.";

            // Log the success of the bulk deletion
            _logger.LogInformation("User {UserId} successfully deleted {Count} API keys", _userId, apiKeysToDelete.Count);
        }
        catch (Exception ex)
        {
            // Log an error if an exception occurs during bulk deletion
            _logger.LogError(ex, "Error occurred during bulk API key deletion for user {UserId}", _userId);
        }

        return serviceResponse;
    }
}
