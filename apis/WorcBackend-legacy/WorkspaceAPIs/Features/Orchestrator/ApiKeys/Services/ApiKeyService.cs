namespace WorkspaceAPIs.Services;

public class ApiKeyService : IApiKeyService
{
    private readonly ILogger<ApiKeyService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly WorkspaceInternalDbContext _internalDbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ApiKeyService(
        ILogger<ApiKeyService> logger,
        IUnitOfWork unitOfWork,
        WorkspaceInternalDbContext internalDbContext,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _internalDbContext = internalDbContext;
        _httpContextAccessor = httpContextAccessor;
    }

    // Resolves the current user ID from the JWT claims in the HTTP context (Guid.Empty when unauthenticated).
    private Guid GetCurrentUserId()
    {
        return Guid.Parse(_httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Retrieves list of API keys.
    public async Task<ServiceResponse<IEnumerable<ApiKeyDto>>> GetApiKeysAsync()
    {
        var serviceResponse = ServiceResponse<IEnumerable<ApiKeyDto>>.Create("Failed to retrieve API keys.", 500);

        try
        {
            var apiKeys = await _unitOfWork.ApiKeyRepo
                .GetAllAsync()
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderByDescending(o => o.CreatedOn)
                .AsNoTracking()
                .ToListAsync();

            serviceResponse.Update("API keys retrieved.", 200, apiKeys.Adapt<List<ApiKeyDto>>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving API keys.");
        }

        return serviceResponse;
    }

    // Retrieves an API key by its ID.
    public async Task<ServiceResponse<ApiKeyDto>> GetApiKeyAsync(Guid apiKeyId)
    {
        var serviceResponse = ServiceResponse<ApiKeyDto>.Create("Failed to retrieve API key.", 500);

        try
        {
            var apiKey = await _unitOfWork.ApiKeyRepo
                .GetByConditionAsync(k => k.Id == apiKeyId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            if (apiKey == null)
            {
                return serviceResponse.Update("API key not found.", 404);
            }

            serviceResponse.Update("API key retrieved.", 200, apiKey.Adapt<ApiKeyDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving API key {ApiKeyId}.", apiKeyId);
        }

        return serviceResponse;
    }

    // Creates a new API key.
    public async Task<ServiceResponse<CreateApiKeyResDto>> CreateApiKeyAsync(CreateApiKeyReqDto createApiKeyReqDto)
    {
        var serviceResponse = ServiceResponse<CreateApiKeyResDto>.Create("Failed to create API key.", 500);

        try
        {
            // Normalize DTO string properties before duplicate checks
            createApiKeyReqDto = TrimDtoStringPropsUtil.TrimDtoStringProps(createApiKeyReqDto);

            // Validate expiration date is in the future
            if (createApiKeyReqDto.ExpiresAt.HasValue && createApiKeyReqDto.ExpiresAt.Value <= DateTimeOffset.UtcNow)
            {
                return serviceResponse.Update("Expiration date must be in the future.", 400);
            }

            // Duplicate name check
            var existing = await _unitOfWork.ApiKeyRepo
                .GetByConditionAsync(k => k.Name.ToLower() == createApiKeyReqDto.Name.ToLower())
                .FirstOrDefaultAsync();

            if (existing != null)
            {
                return serviceResponse.Update("API key name already exists.", 409);
            }

            // Generate a secure API key scoped to the current tenant.
            var plainApiKey = ApiKeyHelpers.GenerateApiKey();
            var keyHash = ApiKeyHelpers.HashApiKey(plainApiKey);

            var apiKey = createApiKeyReqDto.Adapt<ApiKey>();
            apiKey.KeyHash = keyHash;
            apiKey.KeyPrefix = ApiKeyHelpers.BuildKeyPrefix(plainApiKey);
            apiKey.CreatedByUserId = GetCurrentUserId();
            apiKey.LastModifiedByUserId = GetCurrentUserId();

            await _unitOfWork.ApiKeyRepo.InsertAsync(apiKey);
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database save failed while creating API key '{Name}'.", createApiKeyReqDto.Name);
                return serviceResponse;
            }

            var responseDto = apiKey.Adapt<CreateApiKeyResDto>();
            responseDto.PlainApiKey = plainApiKey;

            serviceResponse.Update("API key created.", 200, responseDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating API key '{Name}'.", createApiKeyReqDto.Name);
        }

        return serviceResponse;
    }

    // Updates an existing API key.
    public async Task<ServiceResponse<ApiKeyDto>> UpdateApiKeyAsync(UpdateApiKeyDto updateApiKeyDto)
    {
        var serviceResponse = ServiceResponse<ApiKeyDto>.Create("Failed to update API key.", 500);

        try
        {
            var apiKey = await _unitOfWork.ApiKeyRepo
                .GetByConditionAsync(k => k.Id == updateApiKeyDto.Id)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .SingleOrDefaultAsync();

            if (apiKey == null)
            {
                return serviceResponse.Update("API key not found.", 404);
            }

            // Reject editing a revoked API key; revocation is permanent.
            if (apiKey.IsRevoked)
            {
                return serviceResponse.Update("Revoked API key cannot be edited.", 400);
            }

            // Normalize DTO string properties before duplicate checks
            updateApiKeyDto = TrimDtoStringPropsUtil.TrimDtoStringProps(updateApiKeyDto);

            // Validate expiration date is in the future
            if (updateApiKeyDto.ExpiresAt.HasValue && updateApiKeyDto.ExpiresAt.Value <= DateTimeOffset.UtcNow)
            {
                return serviceResponse.Update("Expiration date must be in the future.", 400);
            }

            // Duplicate name check among other keys
            var duplicate = await _unitOfWork.ApiKeyRepo
                .GetByConditionAsync(k =>
                    k.Name.ToLower() == updateApiKeyDto.Name.ToLower() &&
                    k.Id != updateApiKeyDto.Id)
                .FirstOrDefaultAsync();

            if (duplicate != null)
            {
                return serviceResponse.Update("API key name already exists.", 409);
            }

            apiKey = updateApiKeyDto.Adapt(apiKey);
            apiKey.LastModifiedByUserId = GetCurrentUserId();

            _unitOfWork.ApiKeyRepo.Update(apiKey);
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database save failed while updating API key '{Name}'.", updateApiKeyDto.Name);
                return serviceResponse;
            }

            var dto = apiKey.Adapt<ApiKeyDto>();
            serviceResponse.Update("API key updated.", 200, dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating API key {ApiKeyId}.", updateApiKeyDto.Id);
        }

        return serviceResponse;
    }

    // Deletes an existing API key.
    public async Task<ServiceResponse<bool>> DeleteApiKeyAsync(Guid apiKeyId)
    {
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete API key.", 500);

        try
        {
            var apiKey = await _unitOfWork.ApiKeyRepo
                .GetByConditionAsync(k => k.Id == apiKeyId)
                .SingleOrDefaultAsync();

            if (apiKey == null)
            {
                return serviceResponse.Update("API key not found.", 404);
            }

            _unitOfWork.ApiKeyRepo.Delete(apiKey);
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database save failed while deleting API key {ApiKeyId}.", apiKeyId);
                return serviceResponse;
            }

            serviceResponse.Update("API key deleted.", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting API key {ApiKeyId}.", apiKeyId);
        }

        return serviceResponse;
    }

    // Deletes multiple API keys by their IDs.
    public async Task<ServiceResponse<int>> DeleteMultipleApiKeysAsync(IEnumerable<Guid> apiKeyIds)
    {
        var serviceResponse = ServiceResponse<int>.Create("Failed to delete API keys.", 500);

        try
        {
            var apiKeys = await _unitOfWork.ApiKeyRepo
                .GetByConditionAsync(k => apiKeyIds.Contains(k.Id))
                .ToListAsync();

            if (apiKeys.Count == 0)
            {
                return serviceResponse.Update("API keys not found.", 404);
            }

            _unitOfWork.ApiKeyRepo.Delete(apiKeys);
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database save failed while deleting multiple API keys.");
                return serviceResponse;
            }

            serviceResponse.Update($"{apiKeys.Count} API key(s) deleted.", 200, apiKeys.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting multiple API keys.");
        }

        return serviceResponse;
    }
}
