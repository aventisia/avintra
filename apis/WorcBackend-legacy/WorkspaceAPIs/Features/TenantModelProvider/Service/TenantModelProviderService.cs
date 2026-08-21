namespace WorkspaceAPIs.Services;

/// <summary>
/// Manages tenant-scoped model provider configurations, including retrieval,
/// upsert (create/update) and deletion of provider+credential+enabled-model records.
/// </summary>
public class TenantModelProviderService : ITenantModelProviderService
{
    private readonly ILogger<TenantModelProviderService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly Guid _tenantId;
    private readonly ICurrentTenantService _currentTenantService;

    // Constructor for dependency injection.
    public TenantModelProviderService(
        ILogger<TenantModelProviderService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;

        // Initialize the user ID from the JWT claims in the HTTP context.
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        // Initialize the tenant ID from the JWT claims in the HTTP context.
        _tenantId = Guid.TryParse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid"), out var tenantId) ? tenantId : Guid.Empty;
    }

    // Method to retrieve all model provider configurations for the current tenant.
    public async Task<ServiceResponse<IEnumerable<TenantModelProviderDto>>> GetAllModelProvidersAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<TenantModelProviderDto>>
        {
            Data = null,
            Message = "Failed to retrieve model providers. Please try again later."
        };

        try
        {
            var modelProviders = await _unitOfWork.TenantModelProviderRepo
                .GetByConditionAsync(w => w.TenantId == _tenantId)
                .AsNoTracking()
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderBy(o => o.ProviderType)
                .ProjectToType<TenantModelProviderDto>()
                .ToListAsync();

            serviceResponse.Data = modelProviders;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Model providers retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving model providers for tenant {TenantId}.", _tenantId);
        }

        return serviceResponse;
    }

    // Method to retrieve a model provider configuration by its identifier.
    public async Task<ServiceResponse<TenantModelProviderDto>> GetModelProviderByIdAsync(Guid modelProviderId)
    {
        var serviceResponse = new ServiceResponse<TenantModelProviderDto>
        {
            Data = null,
            Message = "Failed to retrieve model provider. Please try again later."
        };

        try
        {
            var modelProvider = await _unitOfWork.TenantModelProviderRepo
                .GetByConditionAsync(w => w.Id == modelProviderId && w.TenantId == _tenantId)
                .AsNoTracking()
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .ProjectToType<TenantModelProviderDto>()
                .FirstOrDefaultAsync();

            if (modelProvider == null)
            {
                serviceResponse.Message = "Model provider configuration not found.";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            serviceResponse.Data = modelProvider;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Model provider retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving model provider {ModelProviderId} for tenant {TenantId}.", modelProviderId, _tenantId);
        }

        return serviceResponse;
    }

    // Method to create or update a model provider configuration for the current tenant.
    public async Task<ServiceResponse<TenantModelProviderDto>> UpsertModelProviderAsync(TenantModelProviderDto modelProviderDto)
    {
        var serviceResponse = new ServiceResponse<TenantModelProviderDto>
        {
            Data = null,
            Message = "Failed to save model provider. Please try again."
        };

        try
        {
            // Normalize enabled model identifiers.
            modelProviderDto.EnabledModelIds = (modelProviderDto.EnabledModelIds ?? new List<string>())
                .Where(w => !string.IsNullOrWhiteSpace(w))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            // Resolve the credential name to its ID (entity keeps the ID per name-based Agent Builder).
            if (!string.IsNullOrWhiteSpace(modelProviderDto.CredentialName))
            {
                modelProviderDto.CredentialId = await ResolveCredentialIdAsync(modelProviderDto.CredentialName, modelProviderDto.CredentialId);
            }

            // Look for an existing configuration for the same provider within this tenant.
            var existingProvider = await _unitOfWork.TenantModelProviderRepo
                .GetByConditionAsync(w => w.ProviderType == modelProviderDto.ProviderType && w.TenantId == _tenantId)
                .FirstOrDefaultAsync();

            if (existingProvider == null)
            {
                // Create a new configuration record.
                var newProvider = modelProviderDto.Adapt<TenantModelProvider>();
                newProvider.TenantId = _tenantId;
                newProvider.CreatedByUserId = _userId;
                newProvider.LastModifiedByUserId = _userId;
                // Honor the disable/enable toggle when explicitly provided.
                if (modelProviderDto.IsDisabled.HasValue)
                {
                    newProvider.IsDisabled = modelProviderDto.IsDisabled.Value;
                }
                await _unitOfWork.TenantModelProviderRepo.InsertAsync(newProvider);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save changes when inserting model provider {ProviderType} for tenant {TenantId}.", modelProviderDto.ProviderType, _tenantId);
                    return serviceResponse;
                }

                modelProviderDto.Id = newProvider.Id;
                modelProviderDto.CreatedOn = newProvider.CreatedOn;
                modelProviderDto.LastModifiedOn = newProvider.LastModifiedOn;
                serviceResponse.Data = modelProviderDto;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Model provider created successfully.";
            }
            else
            {
                // Update the existing configuration.
                existingProvider.CredentialId = modelProviderDto.CredentialId;
                existingProvider.ProviderUrl = modelProviderDto.ProviderUrl;
                existingProvider.EnabledModelIds = modelProviderDto.EnabledModelIds;
                // Honor the disable/enable toggle when explicitly provided; otherwise preserve current state.
                if (modelProviderDto.IsDisabled.HasValue)
                {
                    existingProvider.IsDisabled = modelProviderDto.IsDisabled.Value;
                }
                existingProvider.LastModifiedByUserId = _userId;
                existingProvider.LastModifiedOn = DateTimeOffset.UtcNow;

                _unitOfWork.TenantModelProviderRepo.Update(existingProvider);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save changes when updating model provider {ProviderType} for tenant {TenantId}.", modelProviderDto.ProviderType, _tenantId);
                    return serviceResponse;
                }

                modelProviderDto.Id = existingProvider.Id;
                modelProviderDto.CreatedOn = existingProvider.CreatedOn;
                modelProviderDto.LastModifiedOn = existingProvider.LastModifiedOn;
                serviceResponse.Data = modelProviderDto;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Model provider updated successfully.";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while saving model provider {ProviderType} for tenant {TenantId}.", modelProviderDto.ProviderType, _tenantId);
        }

        return serviceResponse;
    }

    // Method to delete a model provider configuration by its identifier.
    public async Task<ServiceResponse<bool>> DeleteModelProviderAsync(Guid modelProviderId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete model provider. Please try again."
        };

        try
        {
            var modelProvider = await _unitOfWork.TenantModelProviderRepo
                .GetByConditionAsync(w => w.Id == modelProviderId && w.TenantId == _tenantId)
                .FirstOrDefaultAsync();

            if (modelProvider == null)
            {
                serviceResponse.Message = "Model provider configuration not found.";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            _unitOfWork.TenantModelProviderRepo.Delete(modelProvider);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes when deleting model provider {ModelProviderId} for tenant {TenantId}.", modelProviderId, _tenantId);
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Model provider deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting model provider {ModelProviderId} for tenant {TenantId}.", modelProviderId, _tenantId);
        }

        return serviceResponse;
    }

    // Resolves a credential NAME to its entity ID. If a name is supplied it takes precedence;
    // otherwise the explicitly provided ID is returned unchanged.
    private async Task<Guid?> ResolveCredentialIdAsync(string? credentialName, Guid? existingCredentialId)
    {
        if (string.IsNullOrWhiteSpace(credentialName))
            return existingCredentialId;

        var credential = await _unitOfWork.AppSecretRepo
            .GetByConditionAsync(w => w.Name == credentialName && w.EnvType == _currentTenantService.CurrentEnvType)
            .FirstOrDefaultAsync();

        return credential?.Id ?? existingCredentialId;
    }
}
