using WorkspaceAPIs.Features.Corsair;

namespace WorkspaceAPIs.Services;

public class AppSecretService : IAppSecretService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AppSecretService> _logger;
    private readonly IStringEncryptionService _encryptionService;
    private readonly ICorsairSidecarService _corsairSidecarService;
    private readonly CorsairConfigRepository _corsairConfigRepository;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly Guid _userId;
    private readonly IResourceShareService _resourceShareService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IUserManagementGuardService _userManagementGuardService;
    public AppSecretService(
        IUnitOfWork unitOfWork,
        ILogger<AppSecretService> logger, IHttpContextAccessor
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

    public async Task<ServiceResponse<IEnumerable<AppSecretDto>>> GetAllAppSecretsAsync(bool isPersonal)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<AppSecretDto>>
        {
            Data = null,
            Message = "Failed to fetch credentials. Please try again later."
        };

        try
        {
            List<AppSecret> appSecrets = new();
            Dictionary<Guid, ResourceAccessTypeEnum>? resourceAccess = new();
            if (isPersonal)
            {
                appSecrets = await _unitOfWork.AppSecretRepo
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
                    ResourceTypeEnum.AppSecret,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                    }
                );

                appSecrets = await _unitOfWork.AppSecretRepo
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

            var appSecretData = appSecrets.Adapt<IEnumerable<AppSecretDto>>().ToList();

            appSecretData.ForEach(fe =>
            {
                fe.AccessLevel = isPersonal
                    ? ResourceAccessTypeEnum.Owner
                    : resourceAccess.GetValueOrDefault(fe.Id, ResourceAccessTypeEnum.View);
            });

            var oauthStatusTasks = appSecretData
                .Where(dto => MapAppSecretTypeToCorsairOAuthPlugin(dto.Type) is not null)
                .Select(async dto =>
                {
                    var plugin = MapAppSecretTypeToCorsairOAuthPlugin(dto.Type)!;
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

            serviceResponse.Data = appSecretData;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credentials fetched successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching credentials.");
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<TrueFalseResultDto>> IsAppSecretNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check credential name availability. Please try again."
        };

        try
        {
            var appSecretName = checkAvailabilityDto.UserInput?.Trim();

            if (string.IsNullOrWhiteSpace(appSecretName))
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Credential name cannot be empty. Please provide a valid name.";
                return serviceResponse;
            }

            var existingAppSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == appSecretName.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync();

            if (existingAppSecret != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = $"A credential with the name '{appSecretName}' already exists. Please try a different name.";
                return serviceResponse;
            }

            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"Credential name '{appSecretName}' is available.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while checking credential name availability.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<IEnumerable<SelectOption>>> GetSelectableAppSecretOptionsAsync(AppSecretTypesEnum? type)
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
                ResourceTypeEnum.AppSecret,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            var accessibleSecrets = await _unitOfWork.AppSecretRepo
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

    public async Task<ServiceResponse<AppSecretDto>> GetAppSecretByIdAsync(Guid appSecretId)
    {
        var serviceResponse = new ServiceResponse<AppSecretDto>
        {
            Data = null,
            Message = "Unable to fetch the credential. Please try again later."
        };

        try
        {
            var appSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Id == appSecretId && w.EnvType == _currentTenantService.CurrentEnvType)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            if (appSecret == null)
            {
                _logger.LogWarning("No credential found with ID: {AppSecretId}", appSecretId);
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                appSecret.Id,
                ResourceTypeEnum.AppSecret,
                appSecret.CreatedByUserId,
                appSecret.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canView)
            {
                _logger.LogWarning("User {UserId} is not authorized to view credential ID: {AppSecretId}", _userId, appSecretId);
                serviceResponse.Message = "You do not have permission to view this credential.";
                return serviceResponse;
            }

            serviceResponse.Data = appSecret.Adapt<AppSecretDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credential retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching credential with ID: {AppSecretId}", appSecretId);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<AppSecretDto>> GetAppSecretByNameAsync(string appSecretName)
    {
        var serviceResponse = new ServiceResponse<AppSecretDto>
        {
            Data = null,
            Message = "Failed to retrieve the credential. Please try again later."
        };

        try
        {
            var appSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w =>
                    w.Name == appSecretName &&
                    w.EnvType == _currentTenantService.CurrentEnvType)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            if (appSecret == null)
            {
                _logger.LogWarning("No credential found with name: {AppSecretName}", appSecretName);
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                appSecret.Id,
                ResourceTypeEnum.AppSecret,
                appSecret.CreatedByUserId,
                appSecret.IsTenantWideAccess,
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
                    "User {UserId} is not authorized to view credential name: {AppSecretName}",
                    _userId,
                    appSecretName);

                serviceResponse.Message = "You do not have permission to view this credential.";
                return serviceResponse;
            }

            serviceResponse.Data = appSecret.Adapt<AppSecretDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credential retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "An error occurred while fetching credential with name: {AppSecretName}",
                appSecretName);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<AppSecretDto>> CreateAppSecretAsync(AppSecretDto appSecretDto)
    {
        var serviceResponse = new ServiceResponse<AppSecretDto>
        {
            Data = null,
            Message = "Failed to create credential. Please try again later."
        };

        try
        {
            var prodBlock = CreateResourceGuard.Validate<AppSecretDto>(
                _currentTenantService.CurrentEnvType,
                "credential");
            if (prodBlock != null)
            {
                return prodBlock;
            }

            appSecretDto = TrimDtoStringPropsUtil.TrimDtoStringProps(appSecretDto);

            var validateData = ValidateData(appSecretDto.Type, appSecretDto.Data);

            if (string.IsNullOrEmpty(validateData.SanitizedDataJson))
            {
                serviceResponse.Message = validateData.Remark;
                return serviceResponse;
            }

            var existingSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == appSecretDto.Name.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            if (existingSecret != null)
            {
                _logger.LogWarning(
                    "Credential creation aborted. A credential named '{CredentialName}' already exists for tenant {TenantId} in environment {EnvType}.",
                    appSecretDto.Name,
                    _currentTenantService.CurrentTenantId,
                    _currentTenantService.CurrentEnvType);
                serviceResponse.Message = $"A credential named '{appSecretDto.Name}' already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            var newAppSecret = appSecretDto.Adapt<AppSecret>();
            newAppSecret.Data = validateData.SanitizedDataJson;
            newAppSecret.CreatedByUserId = _userId;
            newAppSecret.LastModifiedByUserId = _userId;
            newAppSecret.EnvType = _currentTenantService.CurrentEnvType;

            await _unitOfWork.AppSecretRepo.InsertAsync(newAppSecret);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save newly created credential: {AppSecretName}", appSecretDto.Name);
                return serviceResponse;
            }

            foreach (var kv in validateData.EncryptedValues)
            {
                var newEncryptedValue = new EncryptedKeyValue
                {
                    Name = kv.Key,
                    Value = kv.Value,
                    AppSecretId = newAppSecret.Id
                };
                await _unitOfWork.EncryptedKeyValueRepo.InsertAsync(newEncryptedValue);
            }

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to insert encrypted key-values for Credential ID: {AppSecretId}", appSecretDto.Id);
                return serviceResponse;
            }

            if (!await _resourceShareService.AssignOwnerAsync(_userId, newAppSecret.Id, ResourceTypeEnum.AppSecret))
            {
                serviceResponse.Message = "Failed assigning ownership.";
                _logger.LogError("Failed to assign owner access for Credential ID: {AppSecretId}", appSecretDto.Id);
                return serviceResponse;
            }

            await MirrorCredentialToCorsairAsync(newAppSecret, validateData.EncryptedValues);

            await MirrorOAuthCredentialToCorsairAsync(newAppSecret, validateData.EncryptedValues);

            serviceResponse.Data = newAppSecret.Adapt<AppSecretDto>();

            if (MapAppSecretTypeToCorsairOAuthPlugin(newAppSecret.Type) is not null)
            {
                var link = await _corsairSidecarService.CreateConnectLinkAsync(newAppSecret.Id, MapAppSecretTypeToCorsairOAuthPlugin(newAppSecret.Type)!);
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
            _logger.LogError(ex, "An unexpected error occurred while creating credential: {AppSecretName}", appSecretDto.Name);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<AppSecretDto>> UpdateAppSecretAsync(AppSecretDto appSecretDto)
    {
        var serviceResponse = new ServiceResponse<AppSecretDto>
        {
            Data = null,
            Message = "Failed to update credential. Please try again later."
        };

        try
        {
            var existingAppSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w =>
                    string.IsNullOrEmpty(appSecretDto.Name)
                        ? w.Id == appSecretDto.Id
                        : w.Name.ToLower() == appSecretDto.Name.ToLower() && w.EnvType == _currentTenantService.CurrentEnvType
                )
                .Include(i => i.EncryptedKeyValues)
                .SingleOrDefaultAsync();

            if (existingAppSecret == null)
            {
                _logger.LogWarning("Update failed. No credential found with ID: {AppSecretId}", appSecretDto.Id);
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            var prodUpdateBlock = ProdResourceUpdateGuard.Validate<AppSecretDto>(
                existingAppSecret.EnvType,
                _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()),
                "credential");
            if (prodUpdateBlock != null)
            {
                return prodUpdateBlock;
            }

            var (canEdit, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                existingAppSecret.Id,
                ResourceTypeEnum.AppSecret,
                existingAppSecret.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canEdit)
            {
                _logger.LogWarning("User {UserId} is not authorized to update credential ID: {AppSecretId}", _userId, appSecretDto.Id);
                serviceResponse.Message = "You do not have access to update this credential.";
                return serviceResponse;
            }

            var duplicateSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == appSecretDto.Name.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType &&
                    w.Id != appSecretDto.Id)
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync();

            if (duplicateSecret != null)
            {
                _logger.LogWarning("Update failed. Credential with name '{AppSecretName}' already exists.", appSecretDto.Name);
                serviceResponse.Message = $"A credential with the name '{appSecretDto.Name}' already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            appSecretDto = TrimDtoStringPropsUtil.TrimDtoStringProps(appSecretDto);

            CredentialValidationResult? validateData = null;

            var existingJson = JsonNode.Parse(existingAppSecret.Data);
            var newJson = System.Text.Json.JsonSerializer.SerializeToNode(appSecretDto.Data);
            bool isDataChanged = !JsonNode.DeepEquals(existingJson, newJson);

            var typeChanged = existingAppSecret.Type != appSecretDto.Type;
            var previousType = existingAppSecret.Type;
            var needsRevalidation = isDataChanged || typeChanged;

            if (needsRevalidation)
            {
                validateData = ValidateData(appSecretDto.Type, appSecretDto.Data);

                if (string.IsNullOrEmpty(validateData.SanitizedDataJson))
                {
                    serviceResponse.Message = validateData.Remark;
                    return serviceResponse;
                }

                existingAppSecret.Data = validateData.SanitizedDataJson;
            }

            if (appSecretDto.IsDisabled.HasValue && existingAppSecret.IsDisabled != appSecretDto.IsDisabled.Value)
            {
                existingAppSecret.IsDisabled = appSecretDto.IsDisabled.Value;
            }

            if (existingAppSecret.Description != appSecretDto.Description)
            {
                existingAppSecret.Description = appSecretDto.Description;
            }

            if (existingAppSecret.IsTenantWideAccess != appSecretDto.IsTenantWideAccess)
            {
                existingAppSecret.IsTenantWideAccess = appSecretDto.IsTenantWideAccess;
            }

            if (typeChanged)
            {
                existingAppSecret.Type = appSecretDto.Type;
            }

            existingAppSecret.LastModifiedByUserId = _userId;

            _unitOfWork.AppSecretRepo.Update(existingAppSecret);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save updated credential: {AppSecretId}", appSecretDto.Id);
                return serviceResponse;
            }

            if (needsRevalidation)
            {
                var existingKeyValues = existingAppSecret.EncryptedKeyValues;

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
                            AppSecretId = existingAppSecret.Id
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
                        _logger.LogError("Failed to update encrypted key-values for credential ID: {AppSecretId}", appSecretDto.Id);
                        return serviceResponse;
                    }
                }
            }

            if (needsRevalidation && validateData != null)
            {
                if (typeChanged)
                {
                    await UnmirrorCredentialFromCorsairAsync(existingAppSecret.Id, previousType);
                }

                await MirrorCredentialToCorsairAsync(existingAppSecret, validateData.EncryptedValues);
                await MirrorOAuthCredentialToCorsairAsync(existingAppSecret, validateData.EncryptedValues);
            }

            serviceResponse.Data = existingAppSecret.Adapt<AppSecretDto>();

            if (MapAppSecretTypeToCorsairOAuthPlugin(existingAppSecret.Type) is not null)
            {
                var link = await _corsairSidecarService.CreateConnectLinkAsync(existingAppSecret.Id, MapAppSecretTypeToCorsairOAuthPlugin(existingAppSecret.Type)!);
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
            _logger.LogError(ex, "Error occurred while updating credential with ID: {AppSecretId}", appSecretDto.Id);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<bool>> DeleteAppSecretAsync(Guid appSecretId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete credential. Please try again later."
        };

        try
        {
            var appSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Id == appSecretId && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            if (appSecret == null)
            {
                _logger.LogWarning("No credential found with ID: {AppSecretId}", appSecretId);
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            var guardBlock = await DeleteResourceGuard.ValidateAsync(
                _unitOfWork.AppSecretRepo,
                appSecret.EnvType,
                appSecret.Name,
                w => w.Name.ToLower() == appSecret.Name.ToLower() &&
                     w.EnvType == ConfigureEnvironmentType.Prod &&
                     w.TenantId == appSecret.TenantId &&
                     w.SpaceId == appSecret.SpaceId,
                "credential");
            if (guardBlock != null)
            {
                return guardBlock;
            }

            var (canDelete, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                appSecret.Id,
                ResourceTypeEnum.AppSecret,
                appSecret.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                }
            );

            if (!canDelete)
            {
                _logger.LogWarning("User {UserId} is not authorized to delete credential ID: {AppSecretId}", _userId, appSecretId);
                serviceResponse.Message = "You do not have access to delete this credential.";
                return serviceResponse;
            }

            await _resourceShareService.DeleteResourceSharesAsync(appSecret.Id, ResourceTypeEnum.AppSecret);

            _unitOfWork.AppSecretRepo.Delete(appSecret);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to delete credential with ID: {AppSecretId} due to database save error.", appSecretId);
                return serviceResponse;
            }

            await UnmirrorCredentialFromCorsairAsync(appSecret.Id, appSecret.Type);

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credential deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while deleting credential with ID: {AppSecretId}", appSecretId);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<bool>> DeleteAppSecretsAsync(List<Guid> appSecretIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete credentials. Please try again later."
        };

        try
        {
            var appSecrets = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => appSecretIds.Contains(w.Id) && w.EnvType == _currentTenantService.CurrentEnvType)
                .ToListAsync();

            if (appSecrets == null || appSecrets.Count == 0)
            {
                _logger.LogWarning("No credentials found for deletion.");
                serviceResponse.Message = "No credentials found to delete.";
                return serviceResponse;
            }
            var blockedNames = new List<string>();
            foreach (var appSecret in appSecrets)
            {
                var (canDelete, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                    _userId,
                    appSecret.Id,
                    ResourceTypeEnum.AppSecret,
                    appSecret.CreatedByUserId,
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
                    _unitOfWork.AppSecretRepo,
                    appSecret.EnvType,
                    appSecret.Name,
                    w => w.Name.ToLower() == appSecret.Name.ToLower() &&
                         w.EnvType == ConfigureEnvironmentType.Prod &&
                         w.TenantId == appSecret.TenantId &&
                         w.SpaceId == appSecret.SpaceId,
                    "credential");
                if (guardBlock != null)
                {
                    blockedNames.Add(appSecret.Name);
                }
            }

            if (blockedNames.Count > 0)
            {
                serviceResponse.Message =
                    $"Cannot delete the following credential(s) because they are published (PROD) or have a same-name PROD version: {string.Join(", ", blockedNames)}";
                return serviceResponse;
            }

            await _resourceShareService.DeleteResourceSharesAsync(appSecretIds, ResourceTypeEnum.AppSecret);

            _unitOfWork.AppSecretRepo.Delete(appSecrets);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to commit bulk deletion of credentials.");
                return serviceResponse;
            }

            foreach (var appSecret in appSecrets)
            {
                await UnmirrorCredentialFromCorsairAsync(appSecret.Id, appSecret.Type);
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credentials deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while bulk deleting credentials.");
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<AppSecretDto>> GetAppSecretDetailAsync(Guid appSecretId)
    {
        var serviceResponse = new ServiceResponse<AppSecretDto>
        {
            Data = null,
            Message = "Unable to load credential. Please try again later.",
        };

        try
        {
            var appSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Id == appSecretId && w.EnvType == _currentTenantService.CurrentEnvType)
                .AsNoTracking()
                .Include(i => i.EncryptedKeyValues)
                .SingleOrDefaultAsync();

            if (appSecret == null)
            {
                _logger.LogWarning("No credential found with ID: {AppSecretId}", appSecretId);
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                appSecret.Id,
                ResourceTypeEnum.AppSecret,
                appSecret.CreatedByUserId,
                appSecret.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canView)
            {
                _logger.LogWarning("User {UserId} is not authorized to view credential ID: {AppSecretId}", _userId, appSecretId);
                serviceResponse.Message = "You do not have access to view this credential.";
                return serviceResponse;
            }

            var appSecretDto = appSecret.Adapt<AppSecretDto>();

            var encryptedValues = appSecret.EncryptedKeyValues?.ToList();
            if (encryptedValues != null && encryptedValues.Any())
            {
                var decryptedMap = encryptedValues.ToDictionary(
                    kv => kv.Name,
                    kv => _encryptionService.DecryptString(kv.Value));

                appSecretDto.Data = UpdateObjectProperties(appSecretDto.Data, decryptedMap);
            }

            serviceResponse.Data = appSecretDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credential retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving Credential with ID: {AppSecretId}", appSecretId);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<AppSecretDto>> GetAppSecretDetailByNameAsync(string appSecretName)
    {
        var serviceResponse = new ServiceResponse<AppSecretDto>
        {
            Data = null,
            Message = "Unable to load credential. Please try again later.",
        };
        try
        {
            if (string.IsNullOrWhiteSpace(appSecretName))
            {
                serviceResponse.Message = "Credential name is required.";
                return serviceResponse;
            }

            var appSecretCandidates = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name == appSecretName &&
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
            var appSecret = appSecretCandidates
                .OrderBy(w => w.SpaceId == requestSpaceId ? 0 : (w.SpaceId == null ? 1 : 2))
                .ThenBy(w => w.CreatedOn)
                .FirstOrDefault();

            if (appSecret == null)
            {
                _logger.LogWarning("No credential found with name: {AppSecretName}", appSecretName);
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                appSecret.Id,
                ResourceTypeEnum.AppSecret,
                appSecret.CreatedByUserId,
                appSecret.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canView)
            {
                _logger.LogWarning("User {UserId} is not authorized to view credential name: {AppSecretName}", _userId, appSecretName);
                serviceResponse.Message = "You do not have access to view this credential.";
                return serviceResponse;
            }

            var appSecretDto = appSecret.Adapt<AppSecretDto>();

            var encryptedValues = appSecret.EncryptedKeyValues?.ToList();
            if (encryptedValues != null && encryptedValues.Any())
            {
                var decryptedMap = encryptedValues.ToDictionary(
                    kv => kv.Name,
                    kv => _encryptionService.DecryptString(kv.Value));

                appSecretDto.Data = UpdateObjectProperties(appSecretDto.Data, decryptedMap);
            }

            serviceResponse.Data = appSecretDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credential retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving Credential with name: {AppSecretName}", appSecretName);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<CorsairCredentialTestResult>> TestCorsairCredentialAsync(Guid appSecretId)
    {
        var serviceResponse = new ServiceResponse<CorsairCredentialTestResult>
        {
            Data = null,
            Message = "Connection test unavailable."
        };

        var appSecret = await _unitOfWork.AppSecretRepo
            .GetByConditionAsync(secret => secret.Id == appSecretId)
            .SingleOrDefaultAsync();
        if (appSecret == null)
        {
            serviceResponse.Message = "Credential not found.";
            return serviceResponse;
        }

        var plugin = MapAppSecretTypeToCorsairPlugin(appSecret.Type);
        if (string.IsNullOrWhiteSpace(plugin))
        {
            serviceResponse.Message = "This credential is not mapped to Corsair.";
            return serviceResponse;
        }

        var result = await _corsairSidecarService.TestCredentialAsync(appSecret.Id, plugin);
        if (result == null)
        {
            return serviceResponse;
        }

        serviceResponse.Data = result;
        serviceResponse.StatusCode = 200;
        serviceResponse.Message = "Connection test completed.";
        return serviceResponse;
    }

    /// <summary>
    /// Mirrors a stored App Secret (API-key and OAuth plugins) to the Corsair sidecar using its
    /// persisted values. Credentials are normally mirrored on create/update; this lets callers
    /// such as Production publish cloning re-sync a credential that was inserted directly.
    /// </summary>
    public async Task<bool> SyncCredentialToCorsairAsync(Guid appSecretId)
    {
        var appSecret = await _unitOfWork.AppSecretRepo
            .GetByConditionAsync(w => w.Id == appSecretId)
            .IgnoreQueryFilters()
            .Include(i => i.EncryptedKeyValues)
            .FirstOrDefaultAsync();

        if (appSecret == null)
        {
            _logger.LogWarning("Corsair sync skipped: credential {AppSecretId} not found.", appSecretId);
            return false;
        }

        var encryptedValues = (appSecret.EncryptedKeyValues ?? new List<EncryptedKeyValue>())
            .GroupBy(kv => kv.Name)
            .ToDictionary(group => group.Key, group => group.First().Value);

        var apiKeyMirrored = await MirrorCredentialToCorsairAsync(appSecret, encryptedValues);
        var oauthMirrored = await MirrorOAuthCredentialToCorsairAsync(appSecret, encryptedValues);
        return apiKeyMirrored && oauthMirrored;
    }

    /// <summary>
    /// Mints a Corsair OAuth connect link for an App Secret so the user can complete consent.
    /// </summary>
    public async Task<ServiceResponse<CorsairConnectLink>> CreateOAuthConnectLinkAsync(Guid appSecretId)
    {
        var serviceResponse = new ServiceResponse<CorsairConnectLink>
        {
            Data = null,
            Message = "Failed to create OAuth connect link."
        };

        try
        {
            var appSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Id == appSecretId)
                .SingleOrDefaultAsync();

            if (appSecret == null)
            {
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            var plugin = MapAppSecretTypeToCorsairOAuthPlugin(appSecret.Type);
            if (string.IsNullOrWhiteSpace(plugin))
            {
                serviceResponse.Message = "This credential type does not support OAuth connect.";
                return serviceResponse;
            }

            var link = await _corsairSidecarService.CreateConnectLinkAsync(appSecret.Id, plugin);
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
            _logger.LogError(ex, "Error occurred while creating OAuth connect link for credential ID: {AppSecretId}", appSecretId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Checks the Corsair OAuth connection status for an App Secret.
    /// </summary>
    public async Task<ServiceResponse<CorsairConnectionStatus>> GetOAuthConnectionStatusAsync(Guid appSecretId)
    {
        var serviceResponse = new ServiceResponse<CorsairConnectionStatus>
        {
            Data = null,
            Message = "Failed to get OAuth connection status."
        };

        try
        {
            var appSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Id == appSecretId)
                .SingleOrDefaultAsync();

            if (appSecret == null)
            {
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            var plugin = MapAppSecretTypeToCorsairOAuthPlugin(appSecret.Type);
            if (string.IsNullOrWhiteSpace(plugin))
            {
                serviceResponse.Message = "This credential type does not support OAuth connect.";
                return serviceResponse;
            }

            var status = await _corsairSidecarService.GetConnectionStatusAsync(appSecret.Id, plugin);
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
            _logger.LogError(ex, "An error occurred while getting OAuth connection status for credential ID: {AppSecretId}", appSecretId);
        }

        return serviceResponse;
    }

    private CredentialValidationResult ValidateData(AppSecretTypesEnum type, object data)
    {
        var validationResult = new CredentialValidationResult();
        var sanitizedDataJson = string.Empty;

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() }

        };

        var rawJson = System.Text.Json.JsonSerializer.Serialize(data, jsonOptions);

        if (_corsairConfigRepository.GetPluginIdForVaultType(type.ToString()) is not null)
        {
            return ValidateGeneratedCorsairData(rawJson, jsonOptions);
        }

        switch (type)
        {
            case AppSecretTypesEnum.OpenAI:
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

            case AppSecretTypesEnum.AWS:
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

            case AppSecretTypesEnum.Twilio:
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

            case AppSecretTypesEnum.SendGrid:
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

            case AppSecretTypesEnum.GitHub:
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

            case AppSecretTypesEnum.M365:
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

            case AppSecretTypesEnum.GeneralCredentials:
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

            case AppSecretTypesEnum.Anthropic:
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

            case AppSecretTypesEnum.Ollama:
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

            case AppSecretTypesEnum.OllamaCloud:
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

            case AppSecretTypesEnum.GoogleGemini:
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

            case AppSecretTypesEnum.GoogleWorkspace:
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

            case AppSecretTypesEnum.AzureOpenAI:
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

            case AppSecretTypesEnum.ElevenLabs:
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

            case AppSecretTypesEnum.OpenRouter:
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

            case AppSecretTypesEnum.AzureStorage:
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

            case AppSecretTypesEnum.AzureBlobStorage:
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

            case AppSecretTypesEnum.ConnectionString:
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
            case AppSecretTypesEnum.Qdrant:
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
            case AppSecretTypesEnum.CustomApiTool:
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

            case AppSecretTypesEnum.Groq:
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

            case AppSecretTypesEnum.Bedrock:
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

            case AppSecretTypesEnum.Mistral:
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
            case AppSecretTypesEnum.A2a:
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
            case AppSecretTypesEnum.A2aAgent:
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
            case AppSecretTypesEnum.Ai21:
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
            case AppSecretTypesEnum.Ai21Chat:
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
            case AppSecretTypesEnum.Aiml:
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
            case AppSecretTypesEnum.AiohttpOpenai:
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
            case AppSecretTypesEnum.AmazonNova:
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
            case AppSecretTypesEnum.AnthropicText:
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
            case AppSecretTypesEnum.Apertis:
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
            case AppSecretTypesEnum.Assemblyai:
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
            case AppSecretTypesEnum.AutoRouter:
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
            case AppSecretTypesEnum.AwsPolly:
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
            case AppSecretTypesEnum.Azure:
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
            case AppSecretTypesEnum.AzureAi:
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
            case AppSecretTypesEnum.AzureText:
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
            case AppSecretTypesEnum.Baseten:
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
            case AppSecretTypesEnum.BedrockMantle:
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
            case AppSecretTypesEnum.BlackForestLabs:
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
            case AppSecretTypesEnum.Bytez:
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
            case AppSecretTypesEnum.Cerebras:
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
            case AppSecretTypesEnum.CharityEngine:
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
            case AppSecretTypesEnum.Chatgpt:
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
            case AppSecretTypesEnum.Chutes:
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
            case AppSecretTypesEnum.Clarifai:
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
            case AppSecretTypesEnum.Cloudflare:
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
            case AppSecretTypesEnum.Codestral:
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
            case AppSecretTypesEnum.Cohere:
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
            case AppSecretTypesEnum.CohereChat:
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
            case AppSecretTypesEnum.Cometapi:
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
            case AppSecretTypesEnum.Compactifai:
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
            case AppSecretTypesEnum.Cursor:
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
            case AppSecretTypesEnum.Custom:
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
            case AppSecretTypesEnum.CustomOpenai:
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
            case AppSecretTypesEnum.Darkbloom:
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
            case AppSecretTypesEnum.Dashscope:
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
            case AppSecretTypesEnum.Databricks:
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
            case AppSecretTypesEnum.Datarobot:
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
            case AppSecretTypesEnum.Deepgram:
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
            case AppSecretTypesEnum.Deepinfra:
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
            case AppSecretTypesEnum.Deepseek:
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
            case AppSecretTypesEnum.DockerModelRunner:
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
            case AppSecretTypesEnum.Dotprompt:
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
            case AppSecretTypesEnum.Empower:
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
            case AppSecretTypesEnum.FalAi:
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
            case AppSecretTypesEnum.FeatherlessAi:
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
            case AppSecretTypesEnum.FireworksAi:
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
            case AppSecretTypesEnum.Friendliai:
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
            case AppSecretTypesEnum.Galadriel:
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
            case AppSecretTypesEnum.Gdc:
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
            case AppSecretTypesEnum.Gigachat:
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
            case AppSecretTypesEnum.GithubCopilot:
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
            case AppSecretTypesEnum.GradientAi:
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
            case AppSecretTypesEnum.Helicone:
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
            case AppSecretTypesEnum.Heroku:
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
            case AppSecretTypesEnum.HostedVllm:
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
            case AppSecretTypesEnum.Huggingface:
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
            case AppSecretTypesEnum.Humanloop:
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
            case AppSecretTypesEnum.Hyperbolic:
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
            case AppSecretTypesEnum.Inception:
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
            case AppSecretTypesEnum.Infinity:
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
            case AppSecretTypesEnum.JinaAi:
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
            case AppSecretTypesEnum.LambdaAi:
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
            case AppSecretTypesEnum.Langflow:
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
            case AppSecretTypesEnum.Langfuse:
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
            case AppSecretTypesEnum.Langgraph:
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
            case AppSecretTypesEnum.Lemonade:
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
            case AppSecretTypesEnum.Libertai:
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
            case AppSecretTypesEnum.LitellmAgent:
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
            case AppSecretTypesEnum.LitellmProxy:
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
            case AppSecretTypesEnum.Llamafile:
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
            case AppSecretTypesEnum.LmStudio:
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
            case AppSecretTypesEnum.Manus:
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
            case AppSecretTypesEnum.Maritalk:
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
            case AppSecretTypesEnum.Meta:
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
            case AppSecretTypesEnum.MetaLlama:
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
            case AppSecretTypesEnum.Milvus:
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
            case AppSecretTypesEnum.Minimax:
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
            case AppSecretTypesEnum.Modelscope:
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
            case AppSecretTypesEnum.Moonshot:
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
            case AppSecretTypesEnum.Morph:
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
            case AppSecretTypesEnum.NanoGpt:
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
            case AppSecretTypesEnum.Nebius:
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
            case AppSecretTypesEnum.Neosantara:
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
            case AppSecretTypesEnum.NlpCloud:
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
            case AppSecretTypesEnum.Novita:
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
            case AppSecretTypesEnum.Nscale:
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
            case AppSecretTypesEnum.NvidiaNim:
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
            case AppSecretTypesEnum.NvidiaRiva:
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
            case AppSecretTypesEnum.Oci:
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
            case AppSecretTypesEnum.OllamaChat:
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
            case AppSecretTypesEnum.Oobabooga:
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
            case AppSecretTypesEnum.OpenaiLike:
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
            case AppSecretTypesEnum.Ovhcloud:
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
            case AppSecretTypesEnum.Parasail:
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
            case AppSecretTypesEnum.Perplexity:
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
            case AppSecretTypesEnum.Petals:
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
            case AppSecretTypesEnum.PgVector:
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
            case AppSecretTypesEnum.Pinstripes:
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
            case AppSecretTypesEnum.Poe:
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
            case AppSecretTypesEnum.Predibase:
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
            case AppSecretTypesEnum.Publicai:
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
            case AppSecretTypesEnum.Ragflow:
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
            case AppSecretTypesEnum.Recraft:
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
            case AppSecretTypesEnum.Reducto:
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
            case AppSecretTypesEnum.Replicate:
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
            case AppSecretTypesEnum.Runwayml:
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
            case AppSecretTypesEnum.S3Vectors:
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
            case AppSecretTypesEnum.Sagemaker:
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
            case AppSecretTypesEnum.SagemakerChat:
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
            case AppSecretTypesEnum.SagemakerNova:
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
            case AppSecretTypesEnum.Sambanova:
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
            case AppSecretTypesEnum.Sap:
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
            case AppSecretTypesEnum.Scaleway:
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
            case AppSecretTypesEnum.Snowflake:
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
            case AppSecretTypesEnum.Soniox:
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
            case AppSecretTypesEnum.Stability:
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
            case AppSecretTypesEnum.Synthetic:
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
            case AppSecretTypesEnum.Tencent:
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
            case AppSecretTypesEnum.Tensormesh:
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
            case AppSecretTypesEnum.TextCompletionCodestral:
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
            case AppSecretTypesEnum.TextCompletionInception:
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
            case AppSecretTypesEnum.TextCompletionOpenai:
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
            case AppSecretTypesEnum.TogetherAi:
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
            case AppSecretTypesEnum.Topaz:
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
            case AppSecretTypesEnum.Triton:
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
            case AppSecretTypesEnum.V0:
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
            case AppSecretTypesEnum.VercelAiGateway:
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
            case AppSecretTypesEnum.VertexAi:
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
            case AppSecretTypesEnum.VertexAiBeta:
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
            case AppSecretTypesEnum.Vllm:
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
            case AppSecretTypesEnum.Volcengine:
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
            case AppSecretTypesEnum.Voyage:
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
            case AppSecretTypesEnum.Wandb:
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
            case AppSecretTypesEnum.Watsonx:
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
            case AppSecretTypesEnum.WatsonxText:
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
            case AppSecretTypesEnum.Xai:
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
            case AppSecretTypesEnum.XiaomiMimo:
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
            case AppSecretTypesEnum.Xinference:
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
            case AppSecretTypesEnum.Zai:
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

    private CredentialValidationResult ValidateGeneratedCorsairData(string rawJson, JsonSerializerOptions jsonOptions)
    {
        var result = new CredentialValidationResult();
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
    /// Maps an <see cref="AppSecretTypesEnum"/> to the corresponding Corsair plugin identifier.
    /// Returns <c>null</c> when the type does not correspond to a Corsair-supported API-key plugin
    /// that is currently registered in the sidecar and verified.
    /// </summary>
    private string? MapAppSecretTypeToCorsairPlugin(AppSecretTypesEnum type)
    {
        return WorkspaceAPIs.Features.Corsair.CorsairPluginResolver.ResolveApiKeyPlugin(type, _corsairConfigRepository);
    }

    /// <summary>
    /// Maps an <see cref="AppSecretTypesEnum"/> to the corresponding Corsair OAuth plugin identifier.
    /// Returns <c>null</c> when the type does not correspond to a Corsair-supported OAuth plugin.
    /// </summary>
    /// <remarks>
    /// Explicit cases below are legacy aliases kept for clarity/back-compat. Any other OAuth-capable
    /// credential type falls back to <see cref="CorsairConfigRepository.GetOAuthPluginIdForVaultType"/>,
    /// so newly generated Corsair OAuth plugins work without a code change here.
    /// </remarks>
    private string? MapAppSecretTypeToCorsairOAuthPlugin(AppSecretTypesEnum type)
    {
        var mappedPlugin = type switch
        {
            AppSecretTypesEnum.M365 => "outlook",
            AppSecretTypesEnum.Teams => "teams",
            AppSecretTypesEnum.Onedrive => "onedrive",
            AppSecretTypesEnum.Sharepoint => "sharepoint",
            AppSecretTypesEnum.GoogleWorkspace => "gmail",
            _ => null
        };

        return mappedPlugin ?? _corsairConfigRepository.GetOAuthPluginIdForVaultType(type.ToString());
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
    private async Task UnmirrorCredentialFromCorsairAsync(Guid appSecretId, AppSecretTypesEnum type)
    {
        var plugin = MapAppSecretTypeToCorsairPlugin(type);
        var plugins = _corsairConfigRepository.GetPluginIdsForVaultType(type.ToString());
        if (string.IsNullOrWhiteSpace(plugin) && plugins.Count == 0)
        {
            return;
        }

        foreach (var pluginId in plugins.Count > 0 ? plugins : new[] { plugin! })
        {
            await _corsairSidecarService.DeleteCredentialAsync(appSecretId, pluginId);
        }
    }

    /// <summary>
    /// Mirrors an API-key credential to the Corsair sidecar when the credential type maps to a supported plugin.
    /// In the create/update paths the mirror is best-effort (the returned value is ignored); publish treats a
    /// <c>false</c> result as a failure so it never persists an unusable Production clone.
    /// </summary>
    /// <returns><c>true</c> when nothing needed mirroring or every attempted mirror succeeded.</returns>
    private async Task<bool> MirrorCredentialToCorsairAsync(AppSecret appSecret, Dictionary<string, string> encryptedValues)
    {
        var plugin = MapAppSecretTypeToCorsairPlugin(appSecret.Type);
        var plugins = _corsairConfigRepository.GetPluginIdsForVaultType(appSecret.Type.ToString());
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
                "Skipping Corsair mirror for credential {AppSecretId}: no credential values found for plugin {Plugin}.",
                appSecret.Id,
                plugin);
            return true;
        }

        var allMirrored = true;
        foreach (var pluginId in plugins.Count > 0 ? plugins : new[] { plugin! })
        {
            IReadOnlyDictionary<string, string>? credentials = pluginId == "twilio"
                ? BuildTwilioCredentials(appSecret, decryptedValues)
                : decryptedValues;

            if (credentials == null)
            {
                _logger.LogInformation(
                    "Skipping Corsair mirror for credential {AppSecretId}: plugin {Plugin} requires fields not present in this credential.",
                    appSecret.Id,
                    pluginId);
                continue;
            }

            if (!await _corsairSidecarService.MirrorCredentialAsync(appSecret.Id, pluginId, credentials))
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
        AppSecret appSecret,
        Dictionary<string, string> decryptedValues)
    {
        var authToken = decryptedValues.GetValueOrDefault("AuthToken");
        var accountSid = GetSanitized(appSecret.Data, "AccountSid");
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
    private async Task<bool> MirrorOAuthCredentialToCorsairAsync(AppSecret appSecret, Dictionary<string, string> encryptedValues)
    {
        var plugin = MapAppSecretTypeToCorsairOAuthPlugin(appSecret.Type);
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
                "Skipping Corsair OAuth mirror for credential {AppSecretId}: no client secret found for plugin {Plugin}.",
                appSecret.Id,
                plugin);
            return true;
        }

        var clientId = GetFirstCredentialValue(decryptedValues, "ClientID", "ClientId", "my_client_id")
            ?? GetSanitized(appSecret.Data, "ClientID")
            ?? GetSanitized(appSecret.Data, "ClientId")
            ?? GetSanitized(appSecret.Data, "my_client_id");
        var redirectUrl = _environmentConfig.CorsairRedirectUri;

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(redirectUrl))
        {
            _logger.LogInformation(
                "Skipping Corsair OAuth mirror for credential {AppSecretId}: missing client id or redirect url for plugin {Plugin}.",
                appSecret.Id,
                plugin);
            return true;
        }

        return await _corsairSidecarService.StoreIntegrationKeysAsync(
            appSecret.Id,
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
