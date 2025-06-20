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

    // Fetches all API keys created by the current user.
    public async Task<ServiceResponse<IEnumerable<ModelAPIKeyDto>>> GetAPIKeysAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<ModelAPIKeyDto>>
        {
            Data = null,
            Message = "Unable to fetch API keys. Please try again later."
        };

        try
        {
            _logger.LogInformation("Fetching API keys for user {UserId}", _userId);

            var modelApiKeys = await _unitOfWork.ModelAPIKeyRepo
                .GetByConditionAsync(w => w.CreatedByUserId == _userId)
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

            var newModelApiKey = apiKeyDto.Adapt<ModelAPIKey>();
            newModelApiKey.ApiKey = Guid.NewGuid().ToString();
            newModelApiKey.CreatedByUserId = _userId;
            newModelApiKey.LastModifiedByUserId = _userId;

            await _unitOfWork.ModelAPIKeyRepo.InsertAsync(newModelApiKey);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to persist new API key for user {UserId}", _userId);
                return serviceResponse;
            }

            serviceResponse.Data = newModelApiKey.Adapt<ModelAPIKeyDto>();
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