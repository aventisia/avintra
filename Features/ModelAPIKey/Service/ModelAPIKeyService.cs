namespace MLModelBuilderAPIs.Services;


public class ModelAPIKeyService : IModelAPIKeyService
{
    private readonly ILogger<ModelAPIKeyService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly Guid _userId;

    public ModelAPIKeyService(
        ILogger<ModelAPIKeyService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _httpContextAccessor = httpContextAccessor;

        // Retrieve the user ID from the HTTP context claims
        _userId = Guid.Parse(
            httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString()
        );
    }

    // Retrieves all API keys linked to the specified machine learning model for the current user.
    public async Task<ServiceResponse<IEnumerable<ModelAPIKeyDto>>> GetAPIKeysByModelIdAsync(Guid mlModelId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<ModelAPIKeyDto>>
        {
            Data = null,
            Message = "Failed to retrieve API keys. Please try again later."
        };

        try
        {
            _logger.LogInformation("Fetching API keys for user {UserId}", _userId);

            var modelApiKeys = await _unitOfWork.ModelAPIKeyRepo
                .GetByConditionAsync(w => w.MLModelId == mlModelId && w.CreatedByUserId == _userId)
                .OrderByDescending(o => o.CreatedOn)
                .Include(i => i.MLModel)
                .ProjectToType<ModelAPIKeyDto>()
                .ToListAsync();

            serviceResponse.Data = modelApiKeys;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "API keys retrieved successfully.";

            _logger.LogInformation("Retrieved {Count} API keys for user {UserId}", modelApiKeys.Count, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving API keys for user {UserId}", _userId);
        }

        return serviceResponse;
    }

    // Creates and stores a new API key for the authenticated user.
    public async Task<ServiceResponse<ModelAPIKeyDto>> GenerateAPIKeyAsync(ModelAPIKeyDto apiKeyDto)
    {
        var serviceResponse = new ServiceResponse<ModelAPIKeyDto>
        {
            Data = null,
            Message = "Failed to generate API key. Please try again later."
        };

        try
        {
            _logger.LogInformation("Generating new API key for user {UserId}", _userId);

            // Trim dto' string props
            apiKeyDto = TrimDtoStringPropsUtil.TrimDtoStringProps(apiKeyDto);

            var newModelApiKey = apiKeyDto.Adapt<ModelAPIKey>();
            newModelApiKey.ApiKey = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Replace("=", "").Replace("+", "").Replace("/", "");
            newModelApiKey.CreatedByUserId = _userId;
            newModelApiKey.LastModifiedByUserId = _userId;

            await _unitOfWork.ModelAPIKeyRepo.InsertAsync(newModelApiKey);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to persist new API key for user {UserId}", _userId);
                return serviceResponse;
            }

            // Map the persisted entity to a DTO for returning to the client
            var modelApiKeyDto = newModelApiKey.Adapt<ModelAPIKeyDto>();

            // Explicitly set the API key value in the DTO
            modelApiKeyDto.ApiKey = newModelApiKey.ApiKey;

            serviceResponse.Data = modelApiKeyDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "API key created successfully.";

            _logger.LogInformation("API key successfully created for user {UserId}", _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating API key for user {UserId}", _userId);
        }

        return serviceResponse;
    }

    // Retrieves a specific API key by ID if owned by the current user.
    public async Task<ServiceResponse<ModelAPIKeyDto>> GetAPIKeyByIdAsync(Guid modelApiKeyId)
    {
        var serviceResponse = new ServiceResponse<ModelAPIKeyDto> { StatusCode = 400 };

        try
        {
            _logger.LogInformation("Fetching API key with ID {ApiKeyId} for user {UserId}", modelApiKeyId, _userId);

            var modelApiKey = await _unitOfWork.ModelAPIKeyRepo
                .GetByConditionAsync(w => w.Id == modelApiKeyId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.MLModel)
                .SingleOrDefaultAsync();

            if (modelApiKey == null)
            {
                _logger.LogWarning("No API key found with ID {ApiKeyId} for user {UserId}", modelApiKeyId, _userId);
                serviceResponse.Message = "API key not found.";
                return serviceResponse;
            }

            serviceResponse.Data = modelApiKey.Adapt<ModelAPIKeyDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "API key retrieved successfully.";

            _logger.LogInformation("Successfully retrieved API key {ApiKeyId}", modelApiKeyId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving API key {ApiKeyId} for user {UserId}", modelApiKeyId, _userId);
        }

        return serviceResponse;
    }

    // Updates the API key for the authenticated user.
    public async Task<ServiceResponse<ModelAPIKeyDto>> UpdateAPIKeyAsync(ModelAPIKeyDto apiKeyDto)
    {
        var serviceResponse = new ServiceResponse<ModelAPIKeyDto>
        {
            Data = null,
            Message = "Failed to update API key. Please try again later."
        };

        try
        {
            // Log the start of the API key update process
            _logger.LogInformation("Updating API key for user {UserId}", _userId);

            // Retrieve the existing API key from the repository
            var existingModelApiKey = await _unitOfWork.ModelAPIKeyRepo
                .GetByConditionAsync(w => w.Id == apiKeyDto.Id && w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            if (existingModelApiKey == null)
            {
                // If no existing API key is found, log and return a response indicating failure
                _logger.LogWarning("No existing API key found for user {UserId}", _userId);
                serviceResponse.Message = "No existing API key found to update.";
                return serviceResponse;
            }

            // Trim any extra spaces from the string properties in the DTO
            apiKeyDto = TrimDtoStringPropsUtil.TrimDtoStringProps(apiKeyDto);

            // Map the updated DTO values to the existing model
            apiKeyDto.Adapt(existingModelApiKey);

            // Set the current user as the one who modified the API key
            existingModelApiKey.LastModifiedByUserId = _userId;

            // Update the API key in the repository
            _unitOfWork.ModelAPIKeyRepo.Update(existingModelApiKey);

            // Persist changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                // Log a warning if saving fails and return the service response
                _logger.LogWarning("Failed to persist updated API key for user {UserId}", _userId);
                return serviceResponse;
            }

            // Map the updated entity to a DTO to return to the client
            apiKeyDto = existingModelApiKey.Adapt<ModelAPIKeyDto>();

            // Return the updated API key DTO with success status
            serviceResponse.Data = apiKeyDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "API key updated successfully.";

            // Log successful update
            _logger.LogInformation("API key successfully updated for user {UserId}", _userId);
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during the update process
            _logger.LogError(ex, "Error updating API key for user {UserId}", _userId);
        }

        return serviceResponse;
    }

    // Deletes a specific API key by ID if it belongs to the current user.
    public async Task<ServiceResponse<bool>> DeleteAPIKeyAsync(Guid modelApiKeyId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete the API key. Please try again."
        };

        try
        {
            _logger.LogInformation("Attempting to delete API key {ApiKeyId} for user {UserId}", modelApiKeyId, _userId);

            var modelApiKey = await _unitOfWork.ModelAPIKeyRepo
                .GetByConditionAsync(w => w.Id == modelApiKeyId)
                .SingleOrDefaultAsync();

            if (modelApiKey == null)
            {
                _logger.LogWarning("API key {ApiKeyId} not found for user {UserId}", modelApiKeyId, _userId);
                serviceResponse.Message = "API key not found.";
                return serviceResponse;
            }

            _unitOfWork.ModelAPIKeyRepo.Delete(modelApiKey);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to delete API key {ApiKeyId} from the database", modelApiKeyId);
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "API key deleted successfully.";

            _logger.LogInformation("Successfully deleted API key {ApiKeyId}", modelApiKeyId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting API key {ApiKeyId} for user {UserId}", modelApiKeyId, _userId);
        }

        return serviceResponse;
    }

    // Deletes multiple API keys by their IDs if they belong to the current user.
    public async Task<ServiceResponse<bool>> DeleteMultipleAPIKeysAsync([FromBody] List<Guid> modelApiKeyIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete API keys. Please try again."
        };

        try
        {
            _logger.LogInformation("Attempting to delete {Count} API keys for user {UserId}", modelApiKeyIds.Count, _userId);

            var modelApiKeysToDelete = await _unitOfWork.ModelAPIKeyRepo
                .GetByConditionAsync(w => modelApiKeyIds.Contains(w.Id) && w.CreatedByUserId == _userId)
                .ToListAsync();

            if (!modelApiKeysToDelete.Any())
            {
                _logger.LogWarning("No API keys found matching the provided IDs for user {UserId}", _userId);
                serviceResponse.Message = "No API keys found to delete.";
                return serviceResponse;
            }

            _unitOfWork.ModelAPIKeyRepo.Delete(modelApiKeysToDelete);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist deletion of API keys for user {UserId}", _userId);
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{modelApiKeysToDelete.Count} API key(s) deleted successfully.";

            _logger.LogInformation("Successfully deleted {Count} API keys for user {UserId}", modelApiKeysToDelete.Count, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during bulk API key deletion for user {UserId}", _userId);
        }

        return serviceResponse;
    }
}