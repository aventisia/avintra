using WorkspaceAPIs.Features.Corsair;

namespace WorkspaceAPIs.Services;

public class VaultCredentialService : IVaultCredentialService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<VaultCredentialService> _logger;
    private readonly IStringEncryptionService _encryptionService;
    private readonly ICorsairSidecarService _corsairSidecarService;
    private readonly CorsairConfigRepository _corsairConfigRepository;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly Guid _userId;
    private readonly IResourceShareService _resourceShareService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IUserManagementGuardService _userManagementGuardService;
    public VaultCredentialService(
        IUnitOfWork unitOfWork,
        ILogger<VaultCredentialService> logger, IHttpContextAccessor
        httpContextAccessor,
        IStringEncryptionService encryptionService,
        IResourceShareService resourceShareService,
        ICurrentTenantService currentTenantService,
        IUserManagementGuardService userManagementGuardService,
        ICorsairSidecarService corsairSidecarService,
        EnvironmentConfig environmentConfig,
        CorsairConfigRepository corsairConfigRepository
    )
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _encryptionService = encryptionService;
        _corsairSidecarService = corsairSidecarService;
        _environmentConfig = environmentConfig;
        _corsairConfigRepository = corsairConfigRepository;

        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _resourceShareService = resourceShareService;
        _currentTenantService = currentTenantService;
        _userManagementGuardService = userManagementGuardService;
    }

    public async Task<ServiceResponse<IEnumerable<VaultCredentialDto>>> GetAllVaultCredentialsAsync(bool isPersonal)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<VaultCredentialDto>>
        {
            Data = null,
            Message = "Failed to fetch credentials. Please try again later."
        };

        try
        {
            List<VaultCredential> vaultCredentials = new();
            Dictionary<Guid, ResourceAccessTypeEnum>? resourceAccess = new();
            if (isPersonal)
            {
                vaultCredentials = await _unitOfWork.VaultCredentialRepo
                    .GetByConditionAsync(w => w.CreatedByUserId == _userId && w.EnvType == _currentTenantService.CurrentEnvType)
                    .OrderByDescending(w => w.CreatedOn)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .ToListAsync();
            }
            else
            {
                resourceAccess = await _resourceShareService.GetAccessibleResourcesWithAccessAsync(
                    _userId,
                    ResourceTypeEnum.VaultCredential,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                    }
                );

                vaultCredentials = await _unitOfWork.VaultCredentialRepo
                    .GetByConditionAsync(w =>
                        w.CreatedByUserId != _userId &&
                        w.EnvType == _currentTenantService.CurrentEnvType &&
                        (
                            w.IsTenantWideAccess ||
                            resourceAccess.Keys.Contains(w.Id)
                        )
                    )
                    .OrderByDescending(w => w.CreatedOn)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .ToListAsync();
            }

            var vaultCredentialData = vaultCredentials.Adapt<IEnumerable<VaultCredentialDto>>().ToList();

            vaultCredentialData.ForEach(fe =>
            {
                fe.AccessLevel = isPersonal
                    ? ResourceAccessTypeEnum.Owner
                    : resourceAccess.GetValueOrDefault(fe.Id, ResourceAccessTypeEnum.View);
            });

            var oauthStatusTasks = vaultCredentialData
                .Where(dto => MapVaultCredentialTypeToCorsairOAuthPlugin(dto.Type) is not null)
                .Select(async dto =>
                {
                    var plugin = MapVaultCredentialTypeToCorsairOAuthPlugin(dto.Type)!;
                    var status = await _corsairSidecarService.GetConnectionStatusAsync(dto.Id, plugin);
                    dto.OAuthConnected = status?.Connected ?? false;
                    dto.CorsairStatus = status?.Connected == true
                        ? "Connected"
                        : status?.State.Equals("expired", StringComparison.OrdinalIgnoreCase) == true
                            ? "Expired"
                            : status?.State.Contains("fail", StringComparison.OrdinalIgnoreCase) == true
                                ? "Failed"
                                : status is not null ? "Pending" : "Unknown";
                    dto.CorsairStatusReason = status?.State;
                })
                .ToList();

            await Task.WhenAll(oauthStatusTasks);

            serviceResponse.Data = vaultCredentialData;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credentials fetched successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching credentials.");
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<TrueFalseResultDto>> IsVaultCredentialNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check credential name availability. Please try again."
        };

        try
        {
            var vaultCredentialName = checkAvailabilityDto.UserInput?.Trim();

            if (string.IsNullOrWhiteSpace(vaultCredentialName))
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Credential name cannot be empty. Please provide a valid name.";
                return serviceResponse;
            }

            var existingVaultCredential = await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == vaultCredentialName.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync();

            if (existingVaultCredential != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = $"A credential with the name '{vaultCredentialName}' already exists. Please try a different name.";
                return serviceResponse;
            }

            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"Credential name '{vaultCredentialName}' is available.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while checking credential name availability.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<IEnumerable<SelectOption>>> GetSelectableVaultCredentialOptionsAsync(VaultCredentialTypesEnum? type)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOption>>
        {
            Data = null,
            Message = "Failed to fetch credentials list. Please try again later."
        };

        try
        {
            var accessibleSecretIds = await _resourceShareService.GetAccessibleResourceIdsAsync(
                _userId,
                ResourceTypeEnum.VaultCredential,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            var accessibleSecrets = await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w =>
                    w.EnvType == _currentTenantService.CurrentEnvType &&
                    (!type.HasValue || w.Type == type) &&
                    (w.IsTenantWideAccess || w.CreatedByUserId == _userId || accessibleSecretIds.Contains(w.Id))
                )
                .ToListAsync();

            serviceResponse.Data = accessibleSecrets.Adapt<IEnumerable<SelectOption>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credentials list fetched successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching credentials list options.");
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<VaultCredentialDto>> GetVaultCredentialByIdAsync(Guid vaultCredentialId)
    {
        var serviceResponse = new ServiceResponse<VaultCredentialDto>
        {
            Data = null,
            Message = "Unable to fetch the credential. Please try again later."
        };

        try
        {
            var vaultCredential = await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w => w.Id == vaultCredentialId && w.EnvType == _currentTenantService.CurrentEnvType)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            if (vaultCredential == null)
            {
                _logger.LogWarning("No credential found with ID: {VaultCredentialId}", vaultCredentialId);
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                vaultCredential.Id,
                ResourceTypeEnum.VaultCredential,
                vaultCredential.CreatedByUserId,
                vaultCredential.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canView)
            {
                _logger.LogWarning("User {UserId} is not authorized to view credential ID: {VaultCredentialId}", _userId, vaultCredentialId);
                serviceResponse.Message = "You do not have permission to view this credential.";
                return serviceResponse;
            }

            serviceResponse.Data = vaultCredential.Adapt<VaultCredentialDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credential retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching credential with ID: {VaultCredentialId}", vaultCredentialId);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<VaultCredentialDto>> GetVaultCredentialByNameAsync(string vaultCredentialName)
    {
        var serviceResponse = new ServiceResponse<VaultCredentialDto>
        {
            Data = null,
            Message = "Failed to retrieve the credential. Please try again later."
        };

        try
        {
            var vaultCredential = await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w =>
                    w.Name == vaultCredentialName &&
                    w.EnvType == _currentTenantService.CurrentEnvType)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            if (vaultCredential == null)
            {
                _logger.LogWarning("No credential found with name: {VaultCredentialName}", vaultCredentialName);
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                vaultCredential.Id,
                ResourceTypeEnum.VaultCredential,
                vaultCredential.CreatedByUserId,
                vaultCredential.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canView)
            {
                _logger.LogWarning(
                    "User {UserId} is not authorized to view credential name: {VaultCredentialName}",
                    _userId,
                    vaultCredentialName);

                serviceResponse.Message = "You do not have permission to view this credential.";
                return serviceResponse;
            }

            serviceResponse.Data = vaultCredential.Adapt<VaultCredentialDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credential retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "An error occurred while fetching credential with name: {VaultCredentialName}",
                vaultCredentialName);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<VaultCredentialDto>> CreateVaultCredentialAsync(VaultCredentialDto vaultCredentialDto)
    {
        var serviceResponse = new ServiceResponse<VaultCredentialDto>
        {
            Data = null,
            Message = "Failed to create credential. Please try again later."
        };

        try
        {
            var prodBlock = CreateResourceGuard.Validate<VaultCredentialDto>(
                _currentTenantService.CurrentEnvType,
                "credential");
            if (prodBlock != null)
            {
                return prodBlock;
            }

            vaultCredentialDto = TrimDtoStringPropsUtil.TrimDtoStringProps(vaultCredentialDto);

            var validateData = ValidateData(vaultCredentialDto.Type, vaultCredentialDto.Data);

            if (string.IsNullOrEmpty(validateData.SanitizedDataJson))
            {
                serviceResponse.Message = validateData.Remark;
                return serviceResponse;
            }

            var existingSecret = await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == vaultCredentialDto.Name.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            if (existingSecret != null)
            {
                _logger.LogWarning(
                    "Credential creation aborted. A credential named '{CredentialName}' already exists for tenant {TenantId} in environment {EnvType}.",
                    vaultCredentialDto.Name,
                    _currentTenantService.CurrentTenantId,
                    _currentTenantService.CurrentEnvType);
                serviceResponse.Message = $"A credential named '{vaultCredentialDto.Name}' already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            var newVaultCredential = vaultCredentialDto.Adapt<VaultCredential>();
            newVaultCredential.Data = validateData.SanitizedDataJson;
            newVaultCredential.CreatedByUserId = _userId;
            newVaultCredential.LastModifiedByUserId = _userId;
            newVaultCredential.EnvType = _currentTenantService.CurrentEnvType;

            await _unitOfWork.VaultCredentialRepo.InsertAsync(newVaultCredential);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save newly created credential: {VaultCredentialName}", vaultCredentialDto.Name);
                return serviceResponse;
            }

            foreach (var kv in validateData.EncryptedValues)
            {
                var newEncryptedValue = new EncryptedKeyValue
                {
                    Name = kv.Key,
                    Value = kv.Value,
                    VaultCredentialId = newVaultCredential.Id
                };
                await _unitOfWork.EncryptedKeyValueRepo.InsertAsync(newEncryptedValue);
            }

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to insert encrypted key-values for Credential ID: {VaultCredentialId}", vaultCredentialDto.Id);
                return serviceResponse;
            }

            if (!await _resourceShareService.AssignOwnerAsync(_userId, newVaultCredential.Id, ResourceTypeEnum.VaultCredential))
            {
                serviceResponse.Message = "Failed assigning ownership.";
                _logger.LogError("Failed to assign owner access for Credential ID: {VaultCredentialId}", vaultCredentialDto.Id);
                return serviceResponse;
            }

            await MirrorCredentialToCorsairAsync(newVaultCredential, validateData.EncryptedValues);

            await MirrorOAuthCredentialToCorsairAsync(newVaultCredential, validateData.EncryptedValues);

            serviceResponse.Data = newVaultCredential.Adapt<VaultCredentialDto>();

            if (MapVaultCredentialTypeToCorsairOAuthPlugin(newVaultCredential.Type) is not null)
            {
                var link = await _corsairSidecarService.CreateConnectLinkAsync(newVaultCredential.Id, MapVaultCredentialTypeToCorsairOAuthPlugin(newVaultCredential.Type)!);
                if (link != null)
                {
                    serviceResponse.Data.OAuthConnectUrl = link.ConnectUrl;
                }
            }

            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credential created successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while creating credential: {VaultCredentialName}", vaultCredentialDto.Name);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<VaultCredentialDto>> UpdateVaultCredentialAsync(VaultCredentialDto vaultCredentialDto)
    {
        var serviceResponse = new ServiceResponse<VaultCredentialDto>
        {
            Data = null,
            Message = "Failed to update credential. Please try again later."
        };

        try
        {
            var existingVaultCredential = await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w =>
                    string.IsNullOrEmpty(vaultCredentialDto.Name)
                        ? w.Id == vaultCredentialDto.Id
                        : w.Name.ToLower() == vaultCredentialDto.Name.ToLower() && w.EnvType == _currentTenantService.CurrentEnvType
                )
                .Include(i => i.EncryptedKeyValues)
                .SingleOrDefaultAsync();

            if (existingVaultCredential == null)
            {
                _logger.LogWarning("Update failed. No credential found with ID: {VaultCredentialId}", vaultCredentialDto.Id);
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            var prodUpdateBlock = ProdResourceUpdateGuard.Validate<VaultCredentialDto>(
                existingVaultCredential.EnvType,
                _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()),
                "credential");
            if (prodUpdateBlock != null)
            {
                return prodUpdateBlock;
            }

            var (canEdit, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                existingVaultCredential.Id,
                ResourceTypeEnum.VaultCredential,
                existingVaultCredential.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canEdit)
            {
                _logger.LogWarning("User {UserId} is not authorized to update credential ID: {VaultCredentialId}", _userId, vaultCredentialDto.Id);
                serviceResponse.Message = "You do not have access to update this credential.";
                return serviceResponse;
            }

            var duplicateSecret = await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == vaultCredentialDto.Name.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType &&
                    w.Id != vaultCredentialDto.Id)
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync();

            if (duplicateSecret != null)
            {
                _logger.LogWarning("Update failed. Credential with name '{VaultCredentialName}' already exists.", vaultCredentialDto.Name);
                serviceResponse.Message = $"A credential with the name '{vaultCredentialDto.Name}' already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            vaultCredentialDto = TrimDtoStringPropsUtil.TrimDtoStringProps(vaultCredentialDto);

            VaultCredentialValidationResult? validateData = null;

            var existingJson = JsonNode.Parse(existingVaultCredential.Data);
            var newJson = System.Text.Json.JsonSerializer.SerializeToNode(vaultCredentialDto.Data);
            bool isDataChanged = !JsonNode.DeepEquals(existingJson, newJson);

            var typeChanged = existingVaultCredential.Type != vaultCredentialDto.Type;
            var previousType = existingVaultCredential.Type;
            var needsRevalidation = isDataChanged || typeChanged;

            if (needsRevalidation)
            {
                validateData = ValidateData(vaultCredentialDto.Type, vaultCredentialDto.Data);

                if (string.IsNullOrEmpty(validateData.SanitizedDataJson))
                {
                    serviceResponse.Message = validateData.Remark;
                    return serviceResponse;
                }

                existingVaultCredential.Data = validateData.SanitizedDataJson;
            }

            if (vaultCredentialDto.IsDisabled.HasValue && existingVaultCredential.IsDisabled != vaultCredentialDto.IsDisabled.Value)
            {
                existingVaultCredential.IsDisabled = vaultCredentialDto.IsDisabled.Value;
            }

            if (existingVaultCredential.Description != vaultCredentialDto.Description)
            {
                existingVaultCredential.Description = vaultCredentialDto.Description;
            }

            if (existingVaultCredential.IsTenantWideAccess != vaultCredentialDto.IsTenantWideAccess)
            {
                existingVaultCredential.IsTenantWideAccess = vaultCredentialDto.IsTenantWideAccess;
            }

            if (typeChanged)
            {
                existingVaultCredential.Type = vaultCredentialDto.Type;
            }

            existingVaultCredential.LastModifiedByUserId = _userId;

            _unitOfWork.VaultCredentialRepo.Update(existingVaultCredential);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save updated credential: {VaultCredentialId}", vaultCredentialDto.Id);
                return serviceResponse;
            }

            if (needsRevalidation)
            {
                var existingKeyValues = existingVaultCredential.EncryptedKeyValues;

                var incomingKeys = validateData.EncryptedValues;

                var hasChanges = false;
                var keysToInsert = new List<EncryptedKeyValue>();

                foreach (var kv in incomingKeys)
                {
                    if (string.IsNullOrEmpty(kv.Value))
                        continue;

                    var existing = existingKeyValues?.FirstOrDefault(e => e.Name == kv.Key);
                    if (existing != null)
                    {
                        if (existing.Value != kv.Value)
                        {
                            existing.Value = kv.Value;
                            _unitOfWork.EncryptedKeyValueRepo.Update(existing);
                            hasChanges = true;
                        }
                    }
                    else
                    {
                        var newEncryptedValue = new EncryptedKeyValue
                        {
                            Name = kv.Key,
                            Value = kv.Value,
                            VaultCredentialId = existingVaultCredential.Id
                        };

                        keysToInsert.Add(newEncryptedValue);
                        hasChanges = true;
                    }
                }

                if (keysToInsert.Any())
                {
                    await _unitOfWork.EncryptedKeyValueRepo.InsertAsync(keysToInsert);
                }

                var keysToDelete = existingKeyValues?
                    .Where(e => e != null && !incomingKeys.ContainsKey(e.Name))
                    .ToList() ?? new List<EncryptedKeyValue>();

                if (keysToDelete.Any())
                {
                    _unitOfWork.EncryptedKeyValueRepo.Delete(keysToDelete);
                    hasChanges = true;
                }

                if (hasChanges)
                {
                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogError("Failed to update encrypted key-values for credential ID: {VaultCredentialId}", vaultCredentialDto.Id);
                        return serviceResponse;
                    }
                }
            }

            if (needsRevalidation && validateData != null)
            {
                if (typeChanged)
                {
                    await UnmirrorCredentialFromCorsairAsync(existingVaultCredential.Id, previousType);
                }

                await MirrorCredentialToCorsairAsync(existingVaultCredential, validateData.EncryptedValues);
                await MirrorOAuthCredentialToCorsairAsync(existingVaultCredential, validateData.EncryptedValues);
            }

            serviceResponse.Data = existingVaultCredential.Adapt<VaultCredentialDto>();

            if (MapVaultCredentialTypeToCorsairOAuthPlugin(existingVaultCredential.Type) is not null)
            {
                var link = await _corsairSidecarService.CreateConnectLinkAsync(existingVaultCredential.Id, MapVaultCredentialTypeToCorsairOAuthPlugin(existingVaultCredential.Type)!);
                if (link != null)
                {
                    serviceResponse.Data.OAuthConnectUrl = link.ConnectUrl;
                }
            }

            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credential updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating credential with ID: {VaultCredentialId}", vaultCredentialDto.Id);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<bool>> DeleteVaultCredentialAsync(Guid vaultCredentialId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete credential. Please try again later."
        };

        try
        {
            var vaultCredential = await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w => w.Id == vaultCredentialId && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            if (vaultCredential == null)
            {
                _logger.LogWarning("No credential found with ID: {VaultCredentialId}", vaultCredentialId);
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            var guardBlock = await DeleteResourceGuard.ValidateAsync(
                _unitOfWork.VaultCredentialRepo,
                vaultCredential.EnvType,
                vaultCredential.Name,
                w => w.Name.ToLower() == vaultCredential.Name.ToLower() &&
                     w.EnvType == ConfigureEnvironmentType.Prod &&
                     w.TenantId == vaultCredential.TenantId &&
                     w.SpaceId == vaultCredential.SpaceId,
                "credential");
            if (guardBlock != null)
            {
                return guardBlock;
            }

            var (canDelete, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                vaultCredential.Id,
                ResourceTypeEnum.VaultCredential,
                vaultCredential.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                }
            );

            if (!canDelete)
            {
                _logger.LogWarning("User {UserId} is not authorized to delete credential ID: {VaultCredentialId}", _userId, vaultCredentialId);
                serviceResponse.Message = "You do not have access to delete this credential.";
                return serviceResponse;
            }

            await _resourceShareService.DeleteResourceSharesAsync(vaultCredential.Id, ResourceTypeEnum.VaultCredential);

            _unitOfWork.VaultCredentialRepo.Delete(vaultCredential);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to delete credential with ID: {VaultCredentialId} due to database save error.", vaultCredentialId);
                return serviceResponse;
            }

            await UnmirrorCredentialFromCorsairAsync(vaultCredential.Id, vaultCredential.Type);

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credential deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while deleting credential with ID: {VaultCredentialId}", vaultCredentialId);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<int>> DeleteVaultCredentialsAsync(List<Guid> vaultCredentialIds)
    {
        var serviceResponse = new ServiceResponse<int>
        {
            Data = 0,
            Message = "Failed to delete credentials. Please try again later."
        };

        try
        {
            var vaultCredentials = await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w => vaultCredentialIds.Contains(w.Id) && w.EnvType == _currentTenantService.CurrentEnvType)
                .ToListAsync();

            if (vaultCredentials == null || vaultCredentials.Count == 0)
            {
                _logger.LogWarning("No credentials found for deletion.");
                serviceResponse.Message = "No credentials found to delete.";
                return serviceResponse;
            }
            var blockedNames = new List<string>();
            foreach (var vaultCredential in vaultCredentials)
            {
                var (canDelete, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                    _userId,
                    vaultCredential.Id,
                    ResourceTypeEnum.VaultCredential,
                    vaultCredential.CreatedByUserId,
                    false,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                    }
                );

                if (!canDelete)
                {
                    serviceResponse.Message = "You do not have access to delete one or more selected credentials.";
                    return serviceResponse;
                }

                var guardBlock = await DeleteResourceGuard.ValidateAsync(
                    _unitOfWork.VaultCredentialRepo,
                    vaultCredential.EnvType,
                    vaultCredential.Name,
                    w => w.Name.ToLower() == vaultCredential.Name.ToLower() &&
                         w.EnvType == ConfigureEnvironmentType.Prod &&
                         w.TenantId == vaultCredential.TenantId &&
                         w.SpaceId == vaultCredential.SpaceId,
                    "credential");
                if (guardBlock != null)
                {
                    blockedNames.Add(vaultCredential.Name);
                }
            }

            if (blockedNames.Count > 0)
            {
                serviceResponse.Message =
                    $"Cannot delete the following credential(s) because they are published (PROD) or have a same-name PROD version: {string.Join(", ", blockedNames)}";
                return serviceResponse;
            }

            await _resourceShareService.DeleteResourceSharesAsync(vaultCredentialIds, ResourceTypeEnum.VaultCredential);

            _unitOfWork.VaultCredentialRepo.Delete(vaultCredentials);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to commit bulk deletion of credentials.");
                return serviceResponse;
            }

            foreach (var vaultCredential in vaultCredentials)
            {
                await UnmirrorCredentialFromCorsairAsync(vaultCredential.Id, vaultCredential.Type);
            }

            serviceResponse.Data = vaultCredentials.Count;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credentials deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while bulk deleting credentials.");
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<VaultCredentialDto>> GetVaultCredentialDetailAsync(Guid vaultCredentialId)
    {
        var serviceResponse = new ServiceResponse<VaultCredentialDto>
        {
            Data = null,
            Message = "Unable to load credential. Please try again later.",
        };

        try
        {
            var vaultCredential = await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w => w.Id == vaultCredentialId && w.EnvType == _currentTenantService.CurrentEnvType)
                .AsNoTracking()
                .Include(i => i.EncryptedKeyValues)
                .SingleOrDefaultAsync();

            if (vaultCredential == null)
            {
                _logger.LogWarning("No credential found with ID: {VaultCredentialId}", vaultCredentialId);
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                vaultCredential.Id,
                ResourceTypeEnum.VaultCredential,
                vaultCredential.CreatedByUserId,
                vaultCredential.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canView)
            {
                _logger.LogWarning("User {UserId} is not authorized to view credential ID: {VaultCredentialId}", _userId, vaultCredentialId);
                serviceResponse.Message = "You do not have access to view this credential.";
                return serviceResponse;
            }

            var vaultCredentialDto = vaultCredential.Adapt<VaultCredentialDto>();

            var encryptedValues = vaultCredential.EncryptedKeyValues?.ToList();
            if (encryptedValues != null && encryptedValues.Any())
            {
                var decryptedMap = encryptedValues.ToDictionary(
                    kv => kv.Name,
                    kv => _encryptionService.DecryptString(kv.Value));

                vaultCredentialDto.Data = UpdateObjectProperties(vaultCredentialDto.Data, decryptedMap);
            }

            serviceResponse.Data = vaultCredentialDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credential retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving Credential with ID: {VaultCredentialId}", vaultCredentialId);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<VaultCredentialDto>> GetVaultCredentialDetailByNameAsync(string vaultCredentialName)
    {
        var serviceResponse = new ServiceResponse<VaultCredentialDto>
        {
            Data = null,
            Message = "Unable to load credential. Please try again later.",
        };
        try
        {
            if (string.IsNullOrWhiteSpace(vaultCredentialName))
            {
                serviceResponse.Message = "Credential name is required.";
                return serviceResponse;
            }

            var vaultCredentialCandidates = await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name == vaultCredentialName &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .AsNoTracking()
                .Include(i => i.EncryptedKeyValues)
                .IgnoreQueryFilters()
                .OrderBy(w => w.CreatedOn)
                .ToListAsync();

            var requestSpaceId = _currentTenantService.CurrentSpaceId == Guid.Empty
                ? (Guid?)null
                : _currentTenantService.CurrentSpaceId;
            var vaultCredential = vaultCredentialCandidates
                .OrderBy(w => w.SpaceId == requestSpaceId ? 0 : (w.SpaceId == null ? 1 : 2))
                .ThenBy(w => w.CreatedOn)
                .FirstOrDefault();

            if (vaultCredential == null)
            {
                _logger.LogWarning("No credential found with name: {VaultCredentialName}", vaultCredentialName);
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                vaultCredential.Id,
                ResourceTypeEnum.VaultCredential,
                vaultCredential.CreatedByUserId,
                vaultCredential.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canView)
            {
                _logger.LogWarning("User {UserId} is not authorized to view credential name: {VaultCredentialName}", _userId, vaultCredentialName);
                serviceResponse.Message = "You do not have access to view this credential.";
                return serviceResponse;
            }

            var vaultCredentialDto = vaultCredential.Adapt<VaultCredentialDto>();

            var encryptedValues = vaultCredential.EncryptedKeyValues?.ToList();
            if (encryptedValues != null && encryptedValues.Any())
            {
                var decryptedMap = encryptedValues.ToDictionary(
                    kv => kv.Name,
                    kv => _encryptionService.DecryptString(kv.Value));

                vaultCredentialDto.Data = UpdateObjectProperties(vaultCredentialDto.Data, decryptedMap);
            }

            serviceResponse.Data = vaultCredentialDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credential retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving Credential with name: {VaultCredentialName}", vaultCredentialName);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<CorsairCredentialTestResult>> TestCorsairCredentialAsync(Guid vaultCredentialId)
    {
        var serviceResponse = new ServiceResponse<CorsairCredentialTestResult>
        {
            Data = null,
            Message = "Connection test unavailable."
        };

        var vaultCredential = await _unitOfWork.VaultCredentialRepo
            .GetByConditionAsync(secret => secret.Id == vaultCredentialId)
            .SingleOrDefaultAsync();
        if (vaultCredential == null)
        {
            serviceResponse.Message = "Credential not found.";
            return serviceResponse;
        }

        var plugin = MapVaultCredentialTypeToCorsairPlugin(vaultCredential.Type);
        if (string.IsNullOrWhiteSpace(plugin))
        {
            serviceResponse.Message = "This credential is not mapped to Corsair.";
            return serviceResponse;
        }

        var result = await _corsairSidecarService.TestCredentialAsync(vaultCredential.Id, plugin);
        if (result == null)
        {
            return serviceResponse;
        }

        serviceResponse.Data = result;
        serviceResponse.StatusCode = 200;
        serviceResponse.Message = "Connection test completed.";
        return serviceResponse;
    }

    /// <summary>Mirrors a stored vault credential to the Corsair sidecar.</summary>
    public async Task<bool> SyncCredentialToCorsairAsync(Guid vaultCredentialId)
    {
        var vaultCredential = await _unitOfWork.VaultCredentialRepo
            .GetByConditionAsync(w => w.Id == vaultCredentialId)
            .IgnoreQueryFilters()
            .Include(i => i.EncryptedKeyValues)
            .FirstOrDefaultAsync();

        if (vaultCredential == null)
        {
            _logger.LogWarning("Corsair sync skipped: credential {VaultCredentialId} not found.", vaultCredentialId);
            return false;
        }

        var encryptedValues = (vaultCredential.EncryptedKeyValues ?? new List<EncryptedKeyValue>())
            .GroupBy(kv => kv.Name)
            .ToDictionary(group => group.Key, group => group.First().Value);

        var apiKeyMirrored = await MirrorCredentialToCorsairAsync(vaultCredential, encryptedValues);
        var oauthMirrored = await MirrorOAuthCredentialToCorsairAsync(vaultCredential, encryptedValues);
        return apiKeyMirrored && oauthMirrored;
    }

    /// <summary>Creates a Corsair OAuth connect link for a vault credential.</summary>
    public async Task<ServiceResponse<CorsairConnectLink>> CreateOAuthConnectLinkAsync(Guid vaultCredentialId)
    {
        var serviceResponse = new ServiceResponse<CorsairConnectLink>
        {
            Data = null,
            Message = "Failed to create OAuth connect link."
        };

        try
        {
            var vaultCredential = await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w => w.Id == vaultCredentialId)
                .SingleOrDefaultAsync();

            if (vaultCredential == null)
            {
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            var plugin = MapVaultCredentialTypeToCorsairOAuthPlugin(vaultCredential.Type);
            if (string.IsNullOrWhiteSpace(plugin))
            {
                serviceResponse.Message = "This credential type does not support OAuth connect.";
                return serviceResponse;
            }

            var link = await _corsairSidecarService.CreateConnectLinkAsync(vaultCredential.Id, plugin);
            if (link == null)
            {
                serviceResponse.Message = "Failed to create OAuth connect link.";
                return serviceResponse;
            }

            serviceResponse.Data = link;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OAuth connect link created successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating OAuth connect link for credential ID: {VaultCredentialId}", vaultCredentialId);
        }

        return serviceResponse;
    }

    /// <summary>Retrieves the Corsair OAuth connection status for a vault credential.</summary>
    public async Task<ServiceResponse<CorsairConnectionStatus>> GetOAuthConnectionStatusAsync(Guid vaultCredentialId)
    {
        var serviceResponse = new ServiceResponse<CorsairConnectionStatus>
        {
            Data = null,
            Message = "Failed to get OAuth connection status."
        };

        try
        {
            var vaultCredential = await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w => w.Id == vaultCredentialId)
                .SingleOrDefaultAsync();

            if (vaultCredential == null)
            {
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            var plugin = MapVaultCredentialTypeToCorsairOAuthPlugin(vaultCredential.Type);
            if (string.IsNullOrWhiteSpace(plugin))
            {
                serviceResponse.Message = "This credential type does not support OAuth connect.";
                return serviceResponse;
            }

            var status = await _corsairSidecarService.GetConnectionStatusAsync(vaultCredential.Id, plugin);
            if (status == null)
            {
                serviceResponse.Message = "Failed to get OAuth connection status.";
                return serviceResponse;
            }

            serviceResponse.Data = status;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OAuth connection status retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while getting OAuth connection status for credential ID: {VaultCredentialId}", vaultCredentialId);
        }

        return serviceResponse;
    }

    private VaultCredentialValidationResult ValidateData(VaultCredentialTypesEnum type, object data)
    {
        var validationResult = new VaultCredentialValidationResult();
        var sanitizedDataJson = string.Empty;

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() }

        };

        var rawJson = System.Text.Json.JsonSerializer.Serialize(data, jsonOptions);

        if (_corsairConfigRepository.GetPluginIdForVaultCredentialType(type.ToString()) is not null)
        {
            return ValidateGeneratedCorsairData(rawJson, jsonOptions);
        }

        switch (type)
        {
            case VaultCredentialTypesEnum.OpenAI:
                {
                    var openAiCredentials = System.Text.Json.JsonSerializer.Deserialize<OpenAICredentialsDto>(rawJson, jsonOptions);
                    if (openAiCredentials != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(openAiCredentials.ApiKey);
                        openAiCredentials.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(openAiCredentials, jsonOptions);
                    }
                    else
                        validationResult.Remark = "Invalid data: The input might be missing required fields or have incorrect data format";
                    break;
                }

            case VaultCredentialTypesEnum.AWS:
                {
                    var awsCredentials = System.Text.Json.JsonSerializer.Deserialize<AWSCredentialsDto>(rawJson, jsonOptions);
                    if (awsCredentials != null)
                    {
                        validationResult.EncryptedValues["SecretAccessKey"] = _encryptionService.EncryptString(awsCredentials.SecretAccessKey);
                        awsCredentials.SecretAccessKey = string.Empty; ;
                        if (awsCredentials.TemporarySecurityCredentials)
                        {
                            validationResult.EncryptedValues["SessionToken"] = _encryptionService.EncryptString(awsCredentials.SessionToken);
                            awsCredentials.SessionToken = string.Empty;
                        }

                        if (!awsCredentials.CustomEndpoints)
                        {
                            awsCredentials.RekognitionEndpoint = string.Empty;
                            awsCredentials.LambdaEndpoint = string.Empty;
                            awsCredentials.SnsEndpoint = string.Empty;
                            awsCredentials.SesEndpoint = string.Empty;
                            awsCredentials.SqsEndpoint = string.Empty;
                            awsCredentials.S3Endpoint = string.Empty;
                            awsCredentials.SsmEndpoint = string.Empty;
                        }
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(awsCredentials, jsonOptions);
                    }
                    break;
                }

            case VaultCredentialTypesEnum.Twilio:
                {
                    var twilioCredentials = System.Text.Json.JsonSerializer.Deserialize<TwilioCredentialsDto>(rawJson, jsonOptions);
                    if (twilioCredentials != null)
                    {
                        if (twilioCredentials.AuthType == nameof(AuthenticationType.ApiKey))
                        {
                            validationResult.EncryptedValues["ApiKeySid"] = _encryptionService.EncryptString(twilioCredentials.ApiKeySid);
                            validationResult.EncryptedValues["ApiKeySecret"] = _encryptionService.EncryptString(twilioCredentials.ApiKeySecret);
                            twilioCredentials.ApiKeySid = string.Empty;
                            twilioCredentials.ApiKeySecret = string.Empty;
                            twilioCredentials.AuthToken = string.Empty;
                        }
                        else
                        {
                            validationResult.EncryptedValues["AuthToken"] = _encryptionService.EncryptString(twilioCredentials.AuthToken);
                            twilioCredentials.AuthToken = string.Empty;
                            twilioCredentials.ApiKeySid = string.Empty;
                            twilioCredentials.ApiKeySecret = string.Empty;
                            twilioCredentials.AuthType = nameof(AuthenticationType.AuthToken);
                        }
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(twilioCredentials, jsonOptions);
                    }
                    break;
                }

            case VaultCredentialTypesEnum.SendGrid:
                {
                    var sendGridCredentials = System.Text.Json.JsonSerializer.Deserialize<SendGridCredentialsDto>(rawJson, jsonOptions);
                    if (sendGridCredentials != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(sendGridCredentials.ApiKey);
                        sendGridCredentials.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(sendGridCredentials, jsonOptions);
                    }
                    break;
                }

            case VaultCredentialTypesEnum.GitHub:
                {
                    var gitHubCredentials = System.Text.Json.JsonSerializer.Deserialize<GitHubCredentialsDto>(rawJson, jsonOptions);
                    if (gitHubCredentials != null)
                    {

                        validationResult.EncryptedValues["AccessToken"] = _encryptionService.EncryptString(gitHubCredentials.AccessToken);
                        gitHubCredentials.AccessToken = string.Empty;
                    
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(gitHubCredentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid GitHub credentials: required fields missing or format incorrect.";
                    }
                    break;
                }

            case VaultCredentialTypesEnum.M365:
                {
                    var m365Credentials = System.Text.Json.JsonSerializer.Deserialize<M365CredentialsDto>(rawJson, jsonOptions);
                    if (m365Credentials != null)
                    {

                        validationResult.EncryptedValues["ClientSecret"] = _encryptionService.EncryptString(m365Credentials.ClientSecret);
                        m365Credentials.ClientSecret = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(m365Credentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid M365 credentials: required fields missing or format incorrect.";
                    }
                    break;
                }

            case VaultCredentialTypesEnum.GeneralCredentials:
                {
                    var generalCredential = System.Text.Json.JsonSerializer.Deserialize<GeneralCredentialsDto>(rawJson, jsonOptions);
                    if (generalCredential != null)
                    {
                        validationResult.EncryptedValues["Username"] = _encryptionService.EncryptString(generalCredential.Username);
                        validationResult.EncryptedValues["Password"] = _encryptionService.EncryptString(generalCredential.Password);
                        generalCredential.Username = string.Empty;
                        generalCredential.Password = string.Empty;

                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(generalCredential, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid General credentials: required fields missing or format incorrect.";
                    }
                    break;
                }

            case VaultCredentialTypesEnum.Anthropic:
                {
                    var anthropicCredentials = System.Text.Json.JsonSerializer.Deserialize<AnthropicCredentialsDto>(rawJson, jsonOptions);
                    if (anthropicCredentials != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(anthropicCredentials.ApiKey);
                        anthropicCredentials.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(anthropicCredentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid Anthropic credentials: required fields missing or format incorrect.";
                    }
                    break;
                }

            case VaultCredentialTypesEnum.Ollama:
                {
                    var ollamaCredentials = System.Text.Json.JsonSerializer.Deserialize<OllamaCredentialsDto>(rawJson, jsonOptions);
                    if (ollamaCredentials != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(ollamaCredentials.ApiKey);
                        ollamaCredentials.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(ollamaCredentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid Ollama credentials: required fields missing or format incorrect.";
                    }
                    break;
                }

            case VaultCredentialTypesEnum.OllamaCloud:
                {
                    var ollamaCloudCredentials = System.Text.Json.JsonSerializer.Deserialize<OllamaCloudCredentialsDto>(rawJson, jsonOptions);
                    if (ollamaCloudCredentials != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(ollamaCloudCredentials.ApiKey);
                        ollamaCloudCredentials.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(ollamaCloudCredentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid Ollama Cloud credentials: required fields missing or format incorrect.";
                    }
                    break;
                }

            case VaultCredentialTypesEnum.GoogleGemini:
                {
                    var googleGeminiCredentials = System.Text.Json.JsonSerializer.Deserialize<GoogleGeminiCredentialsDto>(rawJson, jsonOptions);
                    if (googleGeminiCredentials != null)
                    {

                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(googleGeminiCredentials.ApiKey);
                        googleGeminiCredentials.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(googleGeminiCredentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid Google Gemini credentials: required fields missing or format incorrect.";
                    }
                    break;
                }

            case VaultCredentialTypesEnum.GoogleWorkspace:
                {
                    var googleWorkspaceCredentials = System.Text.Json.JsonSerializer.Deserialize<GoogleWorkspaceCredentialsDto>(rawJson, jsonOptions);
                    if (googleWorkspaceCredentials != null)
                    {

                        validationResult.EncryptedValues["ClientSecret"] = _encryptionService.EncryptString(googleWorkspaceCredentials.ClientSecret);
                        googleWorkspaceCredentials.ClientSecret = string.Empty;

                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(googleWorkspaceCredentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid Google Workspace credentials: required fields missing or format incorrect.";
                    }
                    break;

                }

            case VaultCredentialTypesEnum.AzureOpenAI:
                {
                    var azureOpenAiCredentials = System.Text.Json.JsonSerializer.Deserialize<AzureOpenAiCredentialsDto>(rawJson, jsonOptions);
                    if (azureOpenAiCredentials != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(azureOpenAiCredentials.ApiKey);
                        azureOpenAiCredentials.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(azureOpenAiCredentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid Azure Open AI credentials: required fields missing or format incorrect.";
                    }
                    break;
                }

            case VaultCredentialTypesEnum.ElevenLabs:
                {
                    var elevenLabsCredentials = System.Text.Json.JsonSerializer.Deserialize<ElevenLabsCredentialsDto>(rawJson, jsonOptions);
                    if (elevenLabsCredentials != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(elevenLabsCredentials.ApiKey);
                        elevenLabsCredentials.ApiKey = string.Empty;
                        sanitizedDataJson =
                            System.Text.Json.JsonSerializer.Serialize(elevenLabsCredentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid ElevenLabs credentials: required fields missing or format incorrect.";
                    }
                    break;
                }

            case VaultCredentialTypesEnum.OpenRouter:
                {
                    var openRouterCredentials = System.Text.Json.JsonSerializer.Deserialize<OpenRouterCredentialsDto>(rawJson, jsonOptions);
                    if (openRouterCredentials != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(openRouterCredentials.ApiKey);
                        openRouterCredentials.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(openRouterCredentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid OpenRouter credentials: required fields missing or format incorrect.";
                    }
                    break;
                }

            case VaultCredentialTypesEnum.AzureStorage:
                {
                    var azureStorageCredentials = System.Text.Json.JsonSerializer.Deserialize<AzureStorageCredentialsDto>(rawJson, jsonOptions);
                    if (azureStorageCredentials != null)
                    {
                        validationResult.EncryptedValues["Key"] = _encryptionService.EncryptString(azureStorageCredentials.Key);
                        azureStorageCredentials.Key = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(azureStorageCredentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid Azure Storage credentials: required fields missing or format incorrect.";
                    }
                    break;
                }

            case VaultCredentialTypesEnum.AzureBlobStorage:
                {
                    var azureBlobCredentials = System.Text.Json.JsonSerializer.Deserialize<AzureBolbStorageCredentialsDto>(rawJson, jsonOptions);
                    if (azureBlobCredentials != null)
                    {
                        validationResult.EncryptedValues["ConnectionString"] = _encryptionService.EncryptString(azureBlobCredentials.ConnectionString);
                        azureBlobCredentials.ConnectionString = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(azureBlobCredentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid connection string: required fields missing or format incorrect.";
                    }
                    break;
                }

            case VaultCredentialTypesEnum.ConnectionString:
                {
                    var postgresCredentials = System.Text.Json.JsonSerializer.Deserialize<ConnectionStringCredentialsDto>(rawJson, jsonOptions);
                    if (postgresCredentials != null)
                    {
                        validationResult.EncryptedValues["ConnectionString"] = _encryptionService.EncryptString(postgresCredentials.ConnectionString);
                        postgresCredentials.ConnectionString = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(postgresCredentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid PostgreSQL credentials: required fields are missing or format is incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Qdrant:
                {
                    var qdrantCredentials = System.Text.Json.JsonSerializer.Deserialize<QdrantCredentialsDto>(rawJson, jsonOptions);
                    if (qdrantCredentials != null && !string.IsNullOrWhiteSpace(qdrantCredentials.ApiKey))
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(qdrantCredentials.ApiKey);
                        qdrantCredentials.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(qdrantCredentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid Qdrant credentials: required fields are missing or format is incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.CustomApiTool:
                {
                    var credentials = System.Text.Json.JsonSerializer.Deserialize<CustomApiToolCredentialsDto>(rawJson, jsonOptions);

                    if (credentials?.Parameters?.Count > 0)
                    {
                        foreach (var key in credentials.Parameters.Keys.ToList())
                        {
                            var value = credentials.Parameters[key];

                            if (!string.IsNullOrWhiteSpace(value))
                            {
                                validationResult.EncryptedValues[key] = _encryptionService.EncryptString(value);

                                credentials.Parameters[key] = string.Empty;
                            }
                        }
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(credentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid Custom API Tool credentials: authentication parameters are missing or invalid.";
                    }
                    break;
                }

            case VaultCredentialTypesEnum.Groq:
                {
                    var groqCredentials = System.Text.Json.JsonSerializer.Deserialize<GroqCredentialsDto>(rawJson, jsonOptions);
                    if (groqCredentials != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(groqCredentials.ApiKey);
                        groqCredentials.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(groqCredentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid Groq credentials: required fields missing or format incorrect.";
                    }
                    break;
                }

            case VaultCredentialTypesEnum.Bedrock:
                {
                    var bedrockCredentials = System.Text.Json.JsonSerializer.Deserialize<BedrockCredentialsDto>(rawJson, jsonOptions);
                    if (bedrockCredentials != null)
                    {
                        validationResult.EncryptedValues["SecretAccessKey"] = _encryptionService.EncryptString(bedrockCredentials.SecretAccessKey);
                        bedrockCredentials.SecretAccessKey = string.Empty;

                        if (!string.IsNullOrWhiteSpace(bedrockCredentials.SessionToken))
                        {
                            validationResult.EncryptedValues["SessionToken"] = _encryptionService.EncryptString(bedrockCredentials.SessionToken);
                            bedrockCredentials.SessionToken = string.Empty;
                        }

                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(bedrockCredentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid Bedrock credentials: required fields missing or format incorrect.";
                    }
                    break;
                }

            case VaultCredentialTypesEnum.Mistral:
                {
                    var mistralCredentials = System.Text.Json.JsonSerializer.Deserialize<MistralCredentialsDto>(rawJson, jsonOptions);
                    if (mistralCredentials != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(mistralCredentials.ApiKey);
                        mistralCredentials.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(mistralCredentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid Mistral credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.A2a:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<A2aCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid a2a credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.A2aAgent:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<A2aAgentCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid a2a_agent credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Ai21:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<Ai21CredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid ai21 credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Ai21Chat:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<Ai21ChatCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid ai21_chat credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Aiml:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<AimlCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid aiml credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.AiohttpOpenai:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<AiohttpOpenaiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid aiohttp_openai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.AmazonNova:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<AmazonNovaCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["SecretAccessKey"] = _encryptionService.EncryptString(dto.SecretAccessKey);
                        dto.SecretAccessKey = string.Empty;
                        validationResult.EncryptedValues["SessionToken"] = _encryptionService.EncryptString(dto.SessionToken);
                        dto.SessionToken = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid amazon_nova credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.AnthropicText:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<AnthropicTextCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid anthropic_text credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Apertis:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<ApertisCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid apertis credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Assemblyai:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<AssemblyaiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid assemblyai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.AutoRouter:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<AutoRouterCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid auto_router credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.AwsPolly:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<AwsPollyCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["SecretAccessKey"] = _encryptionService.EncryptString(dto.SecretAccessKey);
                        dto.SecretAccessKey = string.Empty;
                        validationResult.EncryptedValues["SessionToken"] = _encryptionService.EncryptString(dto.SessionToken);
                        dto.SessionToken = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid aws_polly credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Azure:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<AzureCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid azure credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.AzureAi:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<AzureAiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid azure_ai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.AzureText:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<AzureTextCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid azure_text credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Baseten:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<BasetenCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid baseten credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.BedrockMantle:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<BedrockMantleCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["SecretAccessKey"] = _encryptionService.EncryptString(dto.SecretAccessKey);
                        dto.SecretAccessKey = string.Empty;
                        validationResult.EncryptedValues["SessionToken"] = _encryptionService.EncryptString(dto.SessionToken);
                        dto.SessionToken = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid bedrock_mantle credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.BlackForestLabs:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<BlackForestLabsCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid black_forest_labs credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Bytez:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<BytezCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid bytez credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Cerebras:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<CerebrasCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid cerebras credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.CharityEngine:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<CharityEngineCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid charity_engine credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Chatgpt:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<ChatgptCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid chatgpt credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Chutes:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<ChutesCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid chutes credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Clarifai:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<ClarifaiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid clarifai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Cloudflare:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<CloudflareCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid cloudflare credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Codestral:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<CodestralCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid codestral credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Cohere:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<CohereCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid cohere credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.CohereChat:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<CohereChatCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid cohere_chat credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Cometapi:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<CometapiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid cometapi credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Compactifai:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<CompactifaiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid compactifai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Cursor:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<CursorCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid cursor credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Custom:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<CustomCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid custom credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.CustomOpenai:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<CustomOpenaiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid custom_openai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Darkbloom:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<DarkbloomCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid darkbloom credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Dashscope:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<DashscopeCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid dashscope credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Databricks:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<DatabricksCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid databricks credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Datarobot:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<DatarobotCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid datarobot credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Deepgram:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<DeepgramCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid deepgram credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Deepinfra:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<DeepinfraCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid deepinfra credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Deepseek:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<DeepseekCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid deepseek credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.DockerModelRunner:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<DockerModelRunnerCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid docker_model_runner credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Dotprompt:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<DotpromptCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid dotprompt credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Empower:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<EmpowerCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid empower credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.FalAi:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<FalAiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid fal_ai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.FeatherlessAi:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<FeatherlessAiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid featherless_ai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.FireworksAi:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<FireworksAiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid fireworks_ai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Friendliai:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<FriendliaiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid friendliai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Galadriel:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<GaladrielCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid galadriel credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Gdc:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<GdcCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid gdc credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Gigachat:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<GigachatCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid gigachat credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.GithubCopilot:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<GithubCopilotCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid github_copilot credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.GradientAi:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<GradientAiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid gradient_ai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Helicone:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<HeliconeCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid helicone credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Heroku:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<HerokuCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid heroku credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.HostedVllm:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<HostedVllmCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid hosted_vllm credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Huggingface:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<HuggingfaceCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid huggingface credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Humanloop:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<HumanloopCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid humanloop credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Hyperbolic:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<HyperbolicCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid hyperbolic credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Inception:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<InceptionCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid inception credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Infinity:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<InfinityCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid infinity credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.JinaAi:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<JinaAiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid jina_ai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.LambdaAi:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<LambdaAiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid lambda_ai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Langflow:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<LangflowCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid langflow credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Langfuse:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<LangfuseCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid langfuse credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Langgraph:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<LanggraphCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid langgraph credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Lemonade:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<LemonadeCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid lemonade credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Libertai:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<LibertaiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid libertai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.LitellmAgent:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<LitellmAgentCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid litellm_agent credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.LitellmProxy:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<LitellmProxyCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid litellm_proxy credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Llamafile:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<LlamafileCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid llamafile credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.LmStudio:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<LmStudioCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid lm_studio credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Manus:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<ManusCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid manus credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Maritalk:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<MaritalkCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid maritalk credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Meta:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<MetaCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid meta credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.MetaLlama:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<MetaLlamaCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid meta_llama credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Milvus:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<MilvusCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid milvus credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Minimax:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<MinimaxCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid minimax credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Modelscope:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<ModelscopeCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid modelscope credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Moonshot:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<MoonshotCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid moonshot credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Morph:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<MorphCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid morph credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.NanoGpt:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<NanoGptCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid nano-gpt credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Nebius:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<NebiusCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid nebius credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Neosantara:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<NeosantaraCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid neosantara credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.NlpCloud:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<NlpCloudCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid nlp_cloud credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Novita:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<NovitaCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid novita credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Nscale:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<NscaleCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid nscale credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.NvidiaNim:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<NvidiaNimCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid nvidia_nim credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.NvidiaRiva:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<NvidiaRivaCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid nvidia_riva credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Oci:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<OciCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid oci credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.OllamaChat:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<OllamaChatCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid ollama_chat credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Oobabooga:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<OobaboogaCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid oobabooga credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.OpenaiLike:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<OpenaiLikeCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid openai_like credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Ovhcloud:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<OvhcloudCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid ovhcloud credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Parasail:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<ParasailCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid parasail credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Perplexity:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<PerplexityCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid perplexity credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Petals:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<PetalsCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid petals credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.PgVector:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<PgVectorCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid pg_vector credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Pinstripes:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<PinstripesCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid pinstripes credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Poe:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<PoeCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid poe credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Predibase:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<PredibaseCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid predibase credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Publicai:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<PublicaiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid publicai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Ragflow:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<RagflowCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid ragflow credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Recraft:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<RecraftCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid recraft credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Reducto:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<ReductoCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid reducto credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Replicate:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<ReplicateCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid replicate credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Runwayml:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<RunwaymlCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid runwayml credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.S3Vectors:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<S3VectorsCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid s3_vectors credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Sagemaker:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<SagemakerCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["SecretAccessKey"] = _encryptionService.EncryptString(dto.SecretAccessKey);
                        dto.SecretAccessKey = string.Empty;
                        validationResult.EncryptedValues["SessionToken"] = _encryptionService.EncryptString(dto.SessionToken);
                        dto.SessionToken = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid sagemaker credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.SagemakerChat:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<SagemakerChatCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["SecretAccessKey"] = _encryptionService.EncryptString(dto.SecretAccessKey);
                        dto.SecretAccessKey = string.Empty;
                        validationResult.EncryptedValues["SessionToken"] = _encryptionService.EncryptString(dto.SessionToken);
                        dto.SessionToken = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid sagemaker_chat credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.SagemakerNova:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<SagemakerNovaCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["SecretAccessKey"] = _encryptionService.EncryptString(dto.SecretAccessKey);
                        dto.SecretAccessKey = string.Empty;
                        validationResult.EncryptedValues["SessionToken"] = _encryptionService.EncryptString(dto.SessionToken);
                        dto.SessionToken = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid sagemaker_nova credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Sambanova:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<SambanovaCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid sambanova credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Sap:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<SapCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid sap credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Scaleway:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<ScalewayCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid scaleway credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Snowflake:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<SnowflakeCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid snowflake credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Soniox:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<SonioxCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid soniox credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Stability:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<StabilityCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid stability credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Synthetic:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<SyntheticCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid synthetic credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Tencent:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<TencentCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid tencent credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Tensormesh:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<TensormeshCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid tensormesh credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.TextCompletionCodestral:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<TextCompletionCodestralCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid text-completion-codestral credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.TextCompletionInception:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<TextCompletionInceptionCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid text-completion-inception credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.TextCompletionOpenai:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<TextCompletionOpenaiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid text-completion-openai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.TogetherAi:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<TogetherAiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid together_ai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Topaz:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<TopazCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid topaz credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Triton:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<TritonCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid triton credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.V0:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<V0CredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid v0 credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.VercelAiGateway:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<VercelAiGatewayCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid vercel_ai_gateway credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.VertexAi:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<VertexAiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ServiceAccountJson"] = _encryptionService.EncryptString(dto.ServiceAccountJson);
                        dto.ServiceAccountJson = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid vertex_ai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.VertexAiBeta:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<VertexAiBetaCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ServiceAccountJson"] = _encryptionService.EncryptString(dto.ServiceAccountJson);
                        dto.ServiceAccountJson = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid vertex_ai_beta credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Vllm:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<VllmCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid vllm credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Volcengine:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<VolcengineCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid volcengine credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Voyage:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<VoyageCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid voyage credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Wandb:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<WandbCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid wandb credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Watsonx:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<WatsonxCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid watsonx credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.WatsonxText:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<WatsonxTextCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid watsonx_text credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Xai:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<XaiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid xai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.XiaomiMimo:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<XiaomiMimoCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid xiaomi_mimo credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Xinference:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<XinferenceCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid xinference credentials: required fields missing or format incorrect.";
                    }
                    break;
                }
            case VaultCredentialTypesEnum.Zai:
                {
                    var dto = System.Text.Json.JsonSerializer.Deserialize<ZaiCredentialsDto>(rawJson, jsonOptions);
                    if (dto != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(dto.ApiKey);
                        dto.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(dto, jsonOptions);

                    }
                    else
                    {
                        validationResult.Remark = "Invalid zai credentials: required fields missing or format incorrect.";
                    }
                    break;
                }

            default:
                _logger.LogError("Unsupported credential type: {CredentialType}", type);
                validationResult.Remark = $"Unsupported credential type: {type}";
                break;
        }

        validationResult.SanitizedDataJson = sanitizedDataJson;

        return validationResult;
    }

    private VaultCredentialValidationResult ValidateGeneratedCorsairData(string rawJson, JsonSerializerOptions jsonOptions)
    {
        var result = new VaultCredentialValidationResult();
        using var document = System.Text.Json.JsonDocument.Parse(rawJson);
        if (document.RootElement.ValueKind != JsonValueKind.Object)
        {
            result.Remark = "Invalid Corsair credentials: expected an object.";
            return result;
        }

        var sanitized = new Dictionary<string, object?>();
        foreach (var property in document.RootElement.EnumerateObject())
        {
            if (property.Value.ValueKind == JsonValueKind.String)
            {
                var value = property.Value.GetString() ?? string.Empty;
                if (IsOAuthConfigurationField(property.Name))
                {
                    sanitized[property.Name] = value;
                }
                else
                {
                    if (value.Length > 0)
                    {
                        result.EncryptedValues[property.Name] = _encryptionService.EncryptString(value);
                    }
                    sanitized[property.Name] = string.Empty;
                }
            }
            else
            {
                sanitized[property.Name] = property.Value.Clone();
            }
        }

        if (result.EncryptedValues.Count == 0)
        {
            result.Remark = "Invalid Corsair credentials: at least one credential value is required.";
            return result;
        }

        result.SanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(sanitized, jsonOptions);
        return result;
    }

    private static bool IsOAuthConfigurationField(string fieldName)
    {
        var normalized = fieldName.Replace("_", string.Empty, StringComparison.Ordinal).ToLowerInvariant();
        return normalized is "clientid" or "oauthredirecturl" or "redirecturl";
    }

    /// <summary>
    /// Maps an <see cref="VaultCredentialTypesEnum"/> to the corresponding Corsair plugin identifier.
    /// Returns <c>null</c> when the type does not correspond to a Corsair-supported API-key plugin
    /// that is currently registered in the sidecar and verified.
    /// </summary>
    private string? MapVaultCredentialTypeToCorsairPlugin(VaultCredentialTypesEnum type)
    {
        return WorkspaceAPIs.Features.Corsair.CorsairPluginResolver.ResolveApiKeyPlugin(type, _corsairConfigRepository);
    }

    /// <summary>
    /// Maps an <see cref="VaultCredentialTypesEnum"/> to the corresponding Corsair OAuth plugin identifier.
    /// Returns <c>null</c> when the type does not correspond to a Corsair-supported OAuth plugin.
    /// </summary>
    /// <remarks>
    /// Explicit cases below are legacy aliases kept for clarity/back-compat. Any other OAuth-capable
    /// credential type falls back to <see cref="CorsairConfigRepository.GetOAuthPluginIdForVaultCredentialType"/>,
    /// so newly generated Corsair OAuth plugins work without a code change here.
    /// </remarks>
    private string? MapVaultCredentialTypeToCorsairOAuthPlugin(VaultCredentialTypesEnum type)
    {
        var mappedPlugin = type switch
        {
            VaultCredentialTypesEnum.M365 => "outlook",
            VaultCredentialTypesEnum.Teams => "teams",
            VaultCredentialTypesEnum.Onedrive => "onedrive",
            VaultCredentialTypesEnum.Sharepoint => "sharepoint",
            VaultCredentialTypesEnum.GoogleWorkspace => "gmail",
            _ => null
        };

        return mappedPlugin ?? _corsairConfigRepository.GetOAuthPluginIdForVaultCredentialType(type.ToString());
    }

    /// <summary>
    /// Returns the decrypted credential value that should be sent to the Corsair sidecar for the
    /// given plugin. Returns <c>null</c> when the plugin is unsupported or the expected key is missing.
    /// </summary>
    private static string? GetCorsairApiKeyForPlugin(string plugin, Dictionary<string, string> decryptedValues)
    {
        return plugin switch
        {
            "github" => GetFirstCredentialValue(decryptedValues, "AccessToken", "ApiKey"),
            "resend" => GetFirstCredentialValue(decryptedValues, "ApiKey", "AccessToken"),
            _ => GetFirstCredentialValue(decryptedValues, "ApiKey", "AccessToken", "ApiToken", "Token"),
        };
    }

    private static string? GetFirstCredentialValue(
        Dictionary<string, string> decryptedValues,
        params string[] keys)
    {
        foreach (var key in keys)
        {
            var value = decryptedValues.GetValueOrDefault(key);
            if (!string.IsNullOrWhiteSpace(value))
            {
                return value;
            }
        }

        return null;
    }

    /// <summary>
    /// Clears a previously mirrored credential from the Corsair sidecar.
    /// Best-effort: failures are logged but do not fail the delete operation.
    /// </summary>
    private async Task UnmirrorCredentialFromCorsairAsync(Guid vaultCredentialId, VaultCredentialTypesEnum type)
    {
        var plugin = MapVaultCredentialTypeToCorsairPlugin(type);
        var plugins = _corsairConfigRepository.GetPluginIdsForVaultCredentialType(type.ToString());
        if (string.IsNullOrWhiteSpace(plugin) && plugins.Count == 0)
        {
            return;
        }

        foreach (var pluginId in plugins.Count > 0 ? plugins : new[] { plugin! })
        {
            await _corsairSidecarService.DeleteCredentialAsync(vaultCredentialId, pluginId);
        }
    }

    /// <summary>
    /// Mirrors an API-key credential to the Corsair sidecar when the credential type maps to a supported plugin.
    /// In the create/update paths the mirror is best-effort (the returned value is ignored); publish treats a
    /// <c>false</c> result as a failure so it never persists an unusable Production clone.
    /// </summary>
    /// <returns><c>true</c> when nothing needed mirroring or every attempted mirror succeeded.</returns>
    private async Task<bool> MirrorCredentialToCorsairAsync(VaultCredential vaultCredential, Dictionary<string, string> encryptedValues)
    {
        var plugin = MapVaultCredentialTypeToCorsairPlugin(vaultCredential.Type);
        var plugins = _corsairConfigRepository.GetPluginIdsForVaultCredentialType(vaultCredential.Type.ToString());
        if (string.IsNullOrWhiteSpace(plugin) && plugins.Count == 0)
        {
            return true;
        }

        var decryptedValues = encryptedValues.ToDictionary(
            kv => kv.Key,
            kv => _encryptionService.DecryptString(kv.Value));

        if (decryptedValues.ContainsKey("ClientSecret"))
        {
            return true;
        }

        if (decryptedValues.Count == 0)
        {
            _logger.LogInformation(
                "Skipping Corsair mirror for credential {VaultCredentialId}: no credential values found for plugin {Plugin}.",
                vaultCredential.Id,
                plugin);
            return true;
        }

        var allMirrored = true;
        foreach (var pluginId in plugins.Count > 0 ? plugins : new[] { plugin! })
        {
            IReadOnlyDictionary<string, string>? credentials = pluginId == "twilio"
                ? BuildTwilioCredentials(vaultCredential, decryptedValues)
                : decryptedValues;

            if (credentials == null)
            {
                _logger.LogInformation(
                    "Skipping Corsair mirror for credential {VaultCredentialId}: plugin {Plugin} requires fields not present in this credential.",
                    vaultCredential.Id,
                    pluginId);
                continue;
            }

            if (!await _corsairSidecarService.MirrorCredentialAsync(vaultCredential.Id, pluginId, credentials))
            {
                allMirrored = false;
            }
        }

        return allMirrored;
    }

    /// <summary>
    /// Builds the field names the Corsair Twilio plugin expects ("key" for the Auth Token, "accountSid"
    /// for the account SID). Only the AccountSid+AuthToken auth mode is supported: the plugin always uses
    /// AccountSid as the Basic-auth username, which is not compatible with API Key SID+Secret credentials.
    /// </summary>
    private static IReadOnlyDictionary<string, string>? BuildTwilioCredentials(
        VaultCredential vaultCredential,
        Dictionary<string, string> decryptedValues)
    {
        var authToken = decryptedValues.GetValueOrDefault("AuthToken");
        var accountSid = GetSanitized(vaultCredential.Data, "AccountSid");
        if (string.IsNullOrWhiteSpace(authToken) || string.IsNullOrWhiteSpace(accountSid))
        {
            return null;
        }

        return new Dictionary<string, string> { ["key"] = authToken, ["accountSid"] = accountSid };
    }

    /// <summary>
    /// Mirrors an OAuth credential (ClientId + ClientSecret) to the Corsair sidecar as tenant-scoped
    /// integration keys when the credential type maps to a supported OAuth plugin.
    /// In the create/update paths the mirror is best-effort (the returned value is ignored); publish
    /// treats a <c>false</c> result as a failure so it never persists an unusable Production clone.
    /// </summary>
    /// <returns><c>true</c> when nothing needed mirroring or the integration keys were stored.</returns>
    private async Task<bool> MirrorOAuthCredentialToCorsairAsync(VaultCredential vaultCredential, Dictionary<string, string> encryptedValues)
    {
        var plugin = MapVaultCredentialTypeToCorsairOAuthPlugin(vaultCredential.Type);
        if (string.IsNullOrWhiteSpace(plugin))
        {
            return true;
        }

        var decryptedValues = encryptedValues.ToDictionary(
            kv => kv.Key,
            kv => _encryptionService.DecryptString(kv.Value));

        var clientSecret = decryptedValues.GetValueOrDefault("ClientSecret");
        if (string.IsNullOrWhiteSpace(clientSecret))
        {
            _logger.LogInformation(
                "Skipping Corsair OAuth mirror for credential {VaultCredentialId}: no client secret found for plugin {Plugin}.",
                vaultCredential.Id,
                plugin);
            return true;
        }

        var clientId = GetFirstCredentialValue(decryptedValues, "ClientID", "ClientId", "my_client_id")
            ?? GetSanitized(vaultCredential.Data, "ClientID")
            ?? GetSanitized(vaultCredential.Data, "ClientId")
            ?? GetSanitized(vaultCredential.Data, "my_client_id");
        var redirectUrl = _environmentConfig.CorsairRedirectUri;

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(redirectUrl))
        {
            _logger.LogInformation(
                "Skipping Corsair OAuth mirror for credential {VaultCredentialId}: missing client id or redirect url for plugin {Plugin}.",
                vaultCredential.Id,
                plugin);
            return true;
        }

        return await _corsairSidecarService.StoreIntegrationKeysAsync(
            vaultCredential.Id,
            plugin,
            clientId,
            clientSecret,
            redirectUrl);
    }

    /// <summary>
    /// Reads a top-level string property from a sanitized credential JSON payload.
    /// </summary>
    private static string? GetSanitized(string dataJson, string propertyName)
    {
        try
        {
            var node = JsonNode.Parse(dataJson)?.AsObject();
            var property = node?.FirstOrDefault(pair =>
                string.Equals(pair.Key, propertyName, StringComparison.OrdinalIgnoreCase));
            var value = property?.Value?.GetValue<string>();
            return string.IsNullOrWhiteSpace(value) ? null : value;
        }
        catch
        {
            return null;
        }
    }

    private object UpdateObjectProperties(object data, Dictionary<string, string> updatedProperties)
    {
        string jsonString = System.Text.Json.JsonSerializer.Serialize(data);

        var jsonObject = System.Text.Json.Nodes.JsonNode.Parse(jsonString)?.AsObject();
        if (jsonObject == null) return data;

        foreach (var kv in updatedProperties)
        {
            if (jsonObject["Parameters"] is JsonObject parameters && parameters.ContainsKey(kv.Key))
            {
                parameters[kv.Key] = kv.Value;
            }
            else if (jsonObject.ContainsKey(kv.Key))
            {
                jsonObject[kv.Key] = kv.Value;
            }
            else
            {
                jsonObject.Add(kv.Key, kv.Value);
            }
        }

        var updatedObject = System.Text.Json.JsonSerializer.Deserialize<object>(jsonObject.ToJsonString());

        return updatedObject ?? data;
    }
}
