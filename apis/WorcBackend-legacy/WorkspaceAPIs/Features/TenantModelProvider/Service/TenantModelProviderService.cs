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
            var providerEntities = await _unitOfWork.TenantModelProviderRepo
                .GetByConditionAsync(w => w.TenantId == _tenantId)
                .AsNoTracking()
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderBy(o => o.ProviderType)
                .ToListAsync();

            var modelProviders = providerEntities.Adapt<List<TenantModelProviderDto>>();

            // Resolve each stored credential Id to its display name so the Agent
            // Builder can pre-select the previously chosen credential.
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

            // Resolve the stored credential Id to its display name so the Agent
            // Builder can pre-select the currently configured credential.
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
                    .Where(m => m.Capability == capability.Value
                        || (capability.Value == ModelCapabilityEnum.Text && m.Capability == null))
                    .ToList();
            }

            serviceResponse.Data = enabledModels
                .GroupBy(m => new { m.ProviderType, m.ModelId, m.Capability })
                .Select(g => g.First())
                .OrderBy(m => m.ProviderType)
                .ThenBy(m => m.ModelId)
                .DistinctBy(d=> d.ModelId)
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

            if (modelProviderDto.EnabledModels != null)
            {
                modelProviderDto.EnabledModels = modelProviderDto.EnabledModels
                    .Where(m => !string.IsNullOrWhiteSpace(m.ModelId))
                    .Select(m => new EnabledModelDto { ModelId = m.ModelId.Trim(), Capability = m.Capability })
                    .GroupBy(m => m.ModelId, StringComparer.OrdinalIgnoreCase)
                    .Select(g => g.Last())
                    .ToList();

                modelProviderDto.EnabledModelIds = modelProviderDto.EnabledModels
                    .Select(m => m.ModelId)
                    .ToList();
            }

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
                if (modelProviderDto.EnabledModels != null)
                {
                    existingProvider.EnabledModels = modelProviderDto.EnabledModels
                        .Select(m => new EnabledModel { ModelId = m.ModelId, Capability = m.Capability?.ToString() })
                        .ToList();
                }
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

        var credential = await _unitOfWork.VaultCredentialRepo
            .GetByConditionAsync(w => w.Name == credentialName && w.EnvType == _currentTenantService.CurrentEnvType)
            .FirstOrDefaultAsync();

        return credential?.Id ?? existingCredentialId;
    }

    // Resolves the stored CredentialId of each provider to its display name,
    // populating the DTO's CredentialName so the Agent Builder can show and
    // pre-select the currently configured credential.
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
