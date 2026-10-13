using WorkspaceAPIs.Features.TenantModelProvider.Helpers;

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

    public TenantModelProviderService(
        ILogger<TenantModelProviderService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;

        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _tenantId = Guid.TryParse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid"), out var tenantId) ? tenantId : Guid.Empty;
    }

    /// <summary>
    /// Retrieves all model provider configurations for the current tenant.
    /// </summary>
    public async Task<ServiceResponse<IEnumerable<TenantModelProviderDto>>> GetAllModelProvidersAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<TenantModelProviderDto>>
        {
            Data = null,
            Message = "Failed to retrieve model providers. Please try again later."
        };

        try
        {
            var providerEntities = await _unitOfWork.TenantModelProviderRepo
                .GetByConditionAsync(w => w.TenantId == _tenantId)
                .AsNoTracking()
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderBy(o => o.ProviderType)
                .ToListAsync();

            var modelProviders = providerEntities.Adapt<List<TenantModelProviderDto>>();

            await PopulateCredentialNamesAsync(modelProviders);

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

    /// <summary>
    /// Retrieves a model provider configuration by its identifier.
    /// </summary>
    public async Task<ServiceResponse<TenantModelProviderDto>> GetModelProviderByIdAsync(Guid modelProviderId)
    {
        var serviceResponse = new ServiceResponse<TenantModelProviderDto>
        {
            Data = null,
            Message = "Failed to retrieve model provider. Please try again later."
        };

        try
        {
            var providerEntity = await _unitOfWork.TenantModelProviderRepo
                .GetByConditionAsync(w => w.Id == modelProviderId && w.TenantId == _tenantId)
                .AsNoTracking()
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .FirstOrDefaultAsync();

            if (providerEntity == null)
            {
                serviceResponse.Message = "Model provider configuration not found.";
                serviceResponse.StatusCode = 404;
                return serviceResponse;
            }

            var modelProvider = providerEntity.Adapt<TenantModelProviderDto>();

            await PopulateCredentialNamesAsync(new[] { modelProvider });

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

    /// <summary>
    /// Retrieves the enabled models across the current tenant's providers, optionally filtered by provider and capability.
    /// </summary>
    public async Task<ServiceResponse<IEnumerable<TenantEnabledModelDto>>> GetEnabledModelsAsync(LLMProviderTypesEnum? providerType, ModelCapabilityEnum? capability)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<TenantEnabledModelDto>>
        {
            Data = null,
            Message = "Failed to retrieve enabled models. Please try again later."
        };

        try
        {
            var providers = await _unitOfWork.TenantModelProviderRepo
                .GetByConditionAsync(w => w.TenantId == _tenantId
                    && !w.IsDisabled
                    && (providerType == null || w.ProviderType == providerType))
                .AsNoTracking()
                .ToListAsync();

            var enabledModels = providers.SelectMany(GetProviderEnabledModels).ToList();

            if (capability.HasValue)
            {
                enabledModels = enabledModels
                    .Where(m => IsCapabilityMatch(m.Capability, capability.Value))
                    .ToList();
            }

            serviceResponse.Data = enabledModels
                .GroupBy(m => new { m.ProviderType, m.ModelId, m.Capability })
                .Select(g => g.First())
                .OrderBy(m => m.ProviderType)
                .ThenBy(m => m.ModelId)
                .ToList();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Enabled models retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving enabled models for tenant {TenantId}.", _tenantId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Creates or updates a model provider configuration for the current tenant.
    /// </summary>
    public async Task<ServiceResponse<TenantModelProviderDto>> UpsertModelProviderAsync(TenantModelProviderDto modelProviderDto)
    {
        var serviceResponse = new ServiceResponse<TenantModelProviderDto>
        {
            Data = null,
            Message = "Failed to save model provider. Please try again."
        };

        try
        {
            modelProviderDto.EnabledModelIds = (modelProviderDto.EnabledModelIds ?? new List<string>())
                .Where(w => !string.IsNullOrWhiteSpace(w))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (modelProviderDto.EnabledModels != null)
            {
                modelProviderDto.EnabledModels = NormalizeEnabledModels(modelProviderDto.EnabledModels);
            }
            else
            {
                modelProviderDto.EnabledModels = modelProviderDto.EnabledModelIds
                    .Select(id => new EnabledModelDto { ModelId = id.Trim(), Capability = null })
                    .ToList();
            }

            modelProviderDto.EnabledModelIds = modelProviderDto.EnabledModels
                .Select(m => m.ModelId)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (!string.IsNullOrWhiteSpace(modelProviderDto.CredentialName))
            {
                modelProviderDto.CredentialId = await ResolveCredentialIdAsync(modelProviderDto.CredentialName, modelProviderDto.CredentialId);
            }

            var existingProvider = await _unitOfWork.TenantModelProviderRepo
                .GetByConditionAsync(w => w.ProviderType == modelProviderDto.ProviderType && w.TenantId == _tenantId)
                .FirstOrDefaultAsync();

            if (existingProvider == null)
            {
                var newProvider = modelProviderDto.Adapt<TenantModelProvider>();
                newProvider.TenantId = _tenantId;
                newProvider.CreatedByUserId = _userId;
                newProvider.LastModifiedByUserId = _userId;
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
                existingProvider.CredentialId = modelProviderDto.CredentialId;
                existingProvider.ProviderUrl = modelProviderDto.ProviderUrl;
                existingProvider.EnabledModelIds = modelProviderDto.EnabledModelIds;
                if (modelProviderDto.EnabledModels != null)
                {
                    existingProvider.EnabledModels = modelProviderDto.EnabledModels
                        .Select(m => new EnabledModel { ModelId = m.ModelId, Capability = m.Capability?.ToString() })
                        .ToList();
                }
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

    /// <summary>
    /// Deletes a model provider configuration by its identifier.
    /// </summary>
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

    private static List<EnabledModelDto> NormalizeEnabledModels(IEnumerable<EnabledModelDto> enabledModels)
    {
        return enabledModels
            .Where(m => !string.IsNullOrWhiteSpace(m.ModelId))
            .Select(m => new EnabledModelDto { ModelId = m.ModelId.Trim(), Capability = m.Capability })
            .GroupBy(m => m.ModelId, StringComparer.OrdinalIgnoreCase)
            .SelectMany(GetDistinctCapabilityEntries)
            .ToList();
    }

    private static IEnumerable<EnabledModelDto> GetDistinctCapabilityEntries(IGrouping<string, EnabledModelDto> modelsByModelId)
    {
        var capabilityModels = modelsByModelId
            .Where(m => m.Capability != null)
            .GroupBy(m => m.Capability)
            .Select(g => g.First())
            .ToList();

        return capabilityModels.Count > 0 ? capabilityModels : modelsByModelId.Take(1);
    }

    private static bool IsCapabilityMatch(ModelCapabilityEnum? modelCapability, ModelCapabilityEnum requestedCapability)
    {
        // IMPORTANT NOTE: Legacy enabled models have no capability; they default to Text.
        return modelCapability == requestedCapability
            || (requestedCapability == ModelCapabilityEnum.Text && modelCapability == null);
    }

    private async Task<Guid?> ResolveCredentialIdAsync(string? credentialName, Guid? existingCredentialId)
    {
        if (string.IsNullOrWhiteSpace(credentialName))
            return existingCredentialId;

        var credential = await _unitOfWork.VaultCredentialRepo
            .GetByConditionAsync(w => w.Name == credentialName && w.EnvType == _currentTenantService.CurrentEnvType)
            .FirstOrDefaultAsync();

        return credential?.Id ?? existingCredentialId;
    }

    private async Task PopulateCredentialNamesAsync(IEnumerable<TenantModelProviderDto> providers)
    {
        var credentialIds = providers
            .Select(p => p.CredentialId)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .Distinct()
            .ToList();

        if (credentialIds.Count == 0) return;

        var credentials = await _unitOfWork.VaultCredentialRepo
            .GetByConditionAsync(w => credentialIds.Contains(w.Id) && w.EnvType == _currentTenantService.CurrentEnvType)
            .Select(w => new { w.Id, w.Name })
            .ToListAsync();

        var nameById = credentials.ToDictionary(c => c.Id, c => c.Name);

        foreach (var provider in providers)
        {
            if (provider.CredentialId.HasValue && nameById.TryGetValue(provider.CredentialId.Value, out var name))
            {
                provider.CredentialName = name;
            }
        }
    }

    private static IEnumerable<TenantEnabledModelDto> GetProviderEnabledModels(TenantModelProvider provider)
    {
        var capabilityModels = (provider.EnabledModels ?? new List<EnabledModel>())
            .Where(m => !string.IsNullOrWhiteSpace(m.ModelId))
            .Select(m => new TenantEnabledModelDto
            {
                ProviderType = provider.ProviderType,
                ModelId = m.ModelId.Trim(),
                Capability = EnabledModelHelpers.ParseCapability(m.Capability)
            });

        return capabilityModels;
    }
}
