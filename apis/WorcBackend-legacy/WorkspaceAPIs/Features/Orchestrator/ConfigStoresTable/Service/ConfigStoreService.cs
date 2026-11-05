namespace WorkspaceAPIs.Services;

public class ConfigStoreService : IConfigStoreService
{
    private readonly ILogger<ConfigStoreService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly IStringEncryptionService _stringEncryptionService;
    private readonly IResourceUserAccessService _resourceUserAccessService;
    private readonly IResourceFlowAccessService _resourceFlowAccessService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IUserManagementGuardService _userManagementGuardService;

    public ConfigStoreService(
        ILogger<ConfigStoreService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IStringEncryptionService stringEncryptionService,
        IResourceUserAccessService resourceUserAccessService,
        IResourceFlowAccessService resourceFlowAccessService,
        ICurrentTenantService currentTenantService,
        IUserManagementGuardService userManagementGuardService)
    {
        // Extract the user ID from the HTTP context, default to Guid.Empty if not found
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _stringEncryptionService = stringEncryptionService;
        _resourceUserAccessService = resourceUserAccessService;
        _resourceFlowAccessService = resourceFlowAccessService;
        _currentTenantService = currentTenantService;
        _userManagementGuardService = userManagementGuardService;
    }

    // Method to check if the config store name is available for the current user
    public async Task<ServiceResponse<TrueFalseResultDto>> IsConfigStoreNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check key store name availability. Please try again."
        };

        try
        {
            // Check if the provided config store name is valid
            if (!IsValidIdentifier(checkAvailabilityDto.UserInput))
            {
                _logger.LogError($"Invalid config store name: '{checkAvailabilityDto.UserInput}'. It must start with a letter or underscore and cannot contain spaces or symbols.");
                serviceResponse.Message = $"The name '{checkAvailabilityDto.UserInput}' is invalid. Please use a valid name.";
                return serviceResponse;
            }

            // Check if a config store with the same name already exists within the current environment
            var existingConfigStore = await _unitOfWork.ConfigStoreRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            // If an item with the same name exists, return a message indicating it's unavailable
            if (existingConfigStore != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "A key store with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // If no conflict is found, the name is available
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Key store name is available.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to retrieve all config stores created by the current user
    public async Task<ServiceResponse<IEnumerable<ConfigStoreDto>>> GetConfigStoresAsync(bool isPersonal)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<ConfigStoreDto>>
        {
            Data = null,
            Message = "Failed to retrieve key stores. Please try again."
        };

        try
        {
            List<ConfigStore> configStores = new();
            Dictionary<Guid, ResourceAccessTypeEnum> resourceAccess = new();

            if (isPersonal)
            {
                // Retrieve only owned config stores
                configStores = await _unitOfWork.ConfigStoreRepo
                    .GetByConditionAsync(w => w.CreatedByUserId == _userId && w.EnvType == _currentTenantService.CurrentEnvType)
                    .OrderByDescending(w => w.CreatedOn)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .ToListAsync();
            }
            else
            {
                // Retrieve config store resources the user can access along with their permissions
                resourceAccess = await _resourceUserAccessService.GetAccessibleResourcesWithAccessAsync(
                    _userId,
                    ResourceTypeEnum.ConfigStore,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                    }
                );

                // Retrieve accessible config stores
                configStores = await _unitOfWork.ConfigStoreRepo
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

            // Map config store entities to DTOs
            var configStoreDtoList = configStores.Adapt<List<ConfigStoreDto>>();

            // Assign access levels:
            // - Personal config stores are always owned by the current user.
            // - Shared config stores use the user's granted permission.
            // - Tenant-wide config stores default to View access when no explicit permission exists.
            configStoreDtoList.ForEach(fe =>
            {
                fe.AccessLevel = isPersonal
                    ? ResourceAccessTypeEnum.Owner
                    : resourceAccess.GetValueOrDefault(fe.Id, ResourceAccessTypeEnum.View);
            });

            serviceResponse.Data = configStoreDtoList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Key stores retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to retrieve a specific config store by its ID for the current user
    public async Task<ServiceResponse<ConfigStoreDto>> GetConfigStoreByIdAsync(Guid configStoreId)
    {
        var serviceResponse = new ServiceResponse<ConfigStoreDto>
        {
            Data = null,
            Message = "Failed to retrieve the key store. Please try again."
        };

        try
        {
            // Fetch the config store by ID, ensuring it's created by the current user
            var configStore = await _unitOfWork.ConfigStoreRepo
                .GetByConditionAsync(w => w.Id == configStoreId && w.EnvType == _currentTenantService.CurrentEnvType)
                .FirstOrDefaultAsync();

            if (configStore == null)
            {
                serviceResponse.Message =
                    "Config store not found.";

                return serviceResponse;
            }

            // Validate view access
            var (canView, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                    _userId,
                    configStore.Id,
                    ResourceTypeEnum.ConfigStore,
                    configStore.CreatedByUserId,
                    configStore.IsTenantWideAccess,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                    }
                );

            if (!canView)
            {
                serviceResponse.Message = "You do not have access to view this key store.";
                return serviceResponse;
            }

            serviceResponse.Data = configStore.Adapt<ConfigStoreDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Key store retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to retrieve a specific config store by its name for the current user
    public async Task<ServiceResponse<ConfigStoreDto>> GetConfigStoreByNameAsync(string configStoreName)
    {
        var serviceResponse = new ServiceResponse<ConfigStoreDto>
        {
            Data = null,
            Message = "Failed to retrieve the key store. Please try again."
        };

        try
        {
            // Fetch the config store by its name within the current environment
            var configStore = await _unitOfWork.ConfigStoreRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == configStoreName.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType)
                .FirstOrDefaultAsync();

            // Return if the config store does not exist
            if (configStore == null)
            {
                serviceResponse.Message = "Key store not found.";
                return serviceResponse;
            }

            // Validate whether the current user has permission to view the config store
            var (canView, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                configStore.Id,
                ResourceTypeEnum.ConfigStore,
                configStore.CreatedByUserId,
                configStore.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                });

            // Return if the user does not have view access
            if (!canView)
            {
                serviceResponse.Message = "You do not have access to view this key store.";
                return serviceResponse;
            }

            // Map the entity to the DTO and populate the successful response
            serviceResponse.Data = configStore.Adapt<ConfigStoreDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Key store retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log the exception and return the default failure response
            _logger.LogError(ex, "Error retrieving config store by name: {ConfigStoreName}", configStoreName);
        }

        return serviceResponse;
    }

    // Fetch config key-value pairs for a list of keys (full list if no keys provided)
    public async Task<ServiceResponse<IEnumerable<ConfigKeyValueDto>>> FetchConfigKeyValuePairsAsync(IEnumerable<string>? keys)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<ConfigKeyValueDto>>
        {
            Data = null,
            Message = "Failed to fetch config keys values. Please try again."
        };

        try
        {
            // Fetch the ConfigStore ResourceIds for the current user
            var accessibleResourceIds = await _resourceUserAccessService.GetAccessibleResourceIdsAsync(_userId, ResourceTypeEnum.ConfigStore);

            var normalizedKeys = keys?
                .Where(w => !string.IsNullOrWhiteSpace(w))
                .Select(s => s.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList() ?? new List<string>();

            var fetchAllAccessibleKeys = !normalizedKeys.Any();

            // Ignore the global space filter and hand-write the space condition so callers
            // scoped to a space (e.g. the runner executing a space-scoped flow) also see
            // Central (SpaceId == null) keys; a space key and a Central key sharing a name
            // both match, with the caller resolving the collision.
            var currentSpaceId = _currentTenantService.CurrentSpaceId;
            var keyValuePairs = await _unitOfWork.ConfigStoreRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.EnvType == _currentTenantService.CurrentEnvType &&
                    (w.SpaceId == null || w.SpaceId == currentSpaceId) &&
                    (fetchAllAccessibleKeys || normalizedKeys.Contains(w.Name))
                    && (w.IsTenantWideAccess || w.CreatedByUserId == _userId || accessibleResourceIds.Contains(w.Id)))
                .IgnoreQueryFilters()
                .Select(w => new ConfigKeyValueDto { Key = w.Name, Value = w.Value })
                .ToListAsync();

            serviceResponse.Data = keyValuePairs;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = keyValuePairs.Count > 0 ? "Config key-value pairs fetched successfully." : "No config keys found.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to insert a new config store for the current user
    public async Task<ServiceResponse<ConfigStoreDto>> InsertConfigStoreAsync(ConfigStoreDto configStoreDto)
    {
        var serviceResponse = new ServiceResponse<ConfigStoreDto>
        {
            Data = null,
            Message = "Failed to add the key store. Please try again."
        };

        try
        {
            // Block creating new config stores while in the PROD environment.
            var prodBlock = CreateResourceGuard.Validate<ConfigStoreDto>(
                _currentTenantService.CurrentEnvType,
                "config store");
            if (prodBlock != null)
            {
                return prodBlock;
            }

            // Check if the provided config store name is valid
            if (!IsValidIdentifier(configStoreDto.Name))
            {
                _logger.LogError($"Invalid config store name: '{configStoreDto.Name}'. It must start with a letter or underscore and cannot contain spaces or symbols.");
                serviceResponse.Message = $"The name '{configStoreDto.Name}' is invalid. Please use a valid name.";
                return serviceResponse;
            }

            // Check if a config store with the same name already exists within the current environment
            var existingConfigStore = await _unitOfWork.ConfigStoreRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == configStoreDto.Name.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            // If an item with the same name exists, return a conflict response
            if (existingConfigStore != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A key store with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // Trim string properties in the DTO for consistency
            configStoreDto = TrimDtoStringPropsUtil.TrimDtoStringProps(configStoreDto);

            // Map DTO to entity and set user-related properties
            var newConfigStore = configStoreDto.Adapt<ConfigStore>();
            newConfigStore.CreatedByUserId = _userId;
            newConfigStore.LastModifiedByUserId = _userId;
            newConfigStore.EnvType = _currentTenantService.CurrentEnvType;
            newConfigStore.IsResourceAccessRestricted = true;

            // Insert the new config store into the repository
            await _unitOfWork.ConfigStoreRepo.InsertAsync(newConfigStore);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Assign ownership
            if (!await _resourceUserAccessService.AssignOwnerAsync(_userId, newConfigStore.Id, ResourceTypeEnum.ConfigStore))
            {
                serviceResponse.Message = "Failed assigning ownership.";
                return serviceResponse;
            }

            // Return the created config store in the response
            serviceResponse.Data = newConfigStore.Adapt<ConfigStoreDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Key store created successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to update an existing config store for the current user
    public async Task<ServiceResponse<ConfigStoreDto>> UpdateConfigStoreAsync(ConfigStoreDto configStoreDto)
    {
        var serviceResponse = new ServiceResponse<ConfigStoreDto>
        {
            Data = null,
            Message = "Failed to update the key store. Please try again."
        };

        try
        {
            // Check if the provided config store name is valid
            if (!IsValidIdentifier(configStoreDto.Name))
            {
                _logger.LogError($"Invalid config store name: '{configStoreDto.Name}'. It must start with a letter or underscore and cannot contain spaces or symbols.");
                serviceResponse.Message = $"The name '{configStoreDto.Name}' is invalid. Please use a valid name.";
                return serviceResponse;
            }

            // Fetch the existing config store
            var configStore = await _unitOfWork.ConfigStoreRepo
                .GetByConditionAsync(w => w.Id == configStoreDto.Id && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            // If the item doesn't exist, return an error message
            if (configStore == null)
            {
                serviceResponse.Message = "Key store does not exist.";
                return serviceResponse;
            }

            // Require OM for PROD edits based on the persisted config store environment.
            var prodUpdateBlock = ProdResourceUpdateGuard.Validate<ConfigStoreDto>(
                configStore.EnvType,
                _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()),
                "config store");
            if (prodUpdateBlock != null)
            {
                return prodUpdateBlock;
            }

            // Validate update access
            var (canEdit, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                configStore.Id,
                ResourceTypeEnum.ConfigStore,
                configStore.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canEdit)
            {
                serviceResponse.Message =
                    "You do not have access to update this config store.";

                return serviceResponse;
            }

            // Check if another config store with the same name exists within the current environment
            var existingConfigStore = await _unitOfWork.ConfigStoreRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == configStoreDto.Name.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType &&
                    w.Id != configStoreDto.Id)
                .FirstOrDefaultAsync();

            // If a conflict is found, return a conflict response
            if (existingConfigStore != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A key store with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // Trim all string properties in the DTO to remove leading/trailing whitespace
            configStoreDto = TrimDtoStringPropsUtil.TrimDtoStringProps(configStoreDto);

            // Update the description only if it has changed
            if (configStore.Description != configStoreDto.Description)
            {
                configStore.Description = configStoreDto.Description;
            }

            // Update tenant-wide access flag if the value has changed
            if (configStore.IsTenantWideAccess != configStoreDto.IsTenantWideAccess)
            {
                configStore.IsTenantWideAccess = configStoreDto.IsTenantWideAccess;
            }

            // IMPORTANT NOTE: IsResourceAccessRestricted is assign-endpoint-only and never copied from the DTO, so edit saves cannot lift or impose a restriction.

            // Update the config store type if it has changed
            if (configStore.Type != configStoreDto.Type)
            {
                configStore.Type = configStoreDto.Type;
            }

            // Update the config store value if it has changed
            if (configStore.Value != configStoreDto.Value)
            {
                configStore.Value = configStoreDto.Value;
            }

            // Update the disabled status only when a value is provided and it has changed
            if (configStoreDto.IsDisabled.HasValue && configStore.IsDisabled != configStoreDto.IsDisabled)
            {
                configStore.IsDisabled = configStoreDto.IsDisabled.Value;
            }

            // Record the user who last modified the config store
            configStore.LastModifiedByUserId = _userId;

            // Update the config store in the repository
            _unitOfWork.ConfigStoreRepo.Update(configStore);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Return the updated config store in the response
            serviceResponse.Data = configStore.Adapt<ConfigStoreDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Key store updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to delete a config store by its ID
    public async Task<ServiceResponse<bool>> DeleteConfigStoreAsync(Guid configStoreId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete the key store. Please try again."
        };

        try
        {
            // Fetch the config store to be deleted
            var configStore = await _unitOfWork.ConfigStoreRepo
                .GetByConditionAsync(w => w.Id == configStoreId && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            // If the item doesn't exist, return an error message
            if (configStore == null)
            {
                serviceResponse.Message = "Key store does not exist.";
                return serviceResponse;
            }

            // PROD-guard: block deletion of PROD config stores or config stores with a same-name PROD twin.
            var guardBlock = await DeleteResourceGuard.ValidateAsync(
                _unitOfWork.ConfigStoreRepo,
                configStore.EnvType,
                configStore.Name,
                w => w.Name.ToLower() == configStore.Name.ToLower() &&
                     w.EnvType == ConfigureEnvironmentType.Prod &&
                     w.TenantId == configStore.TenantId &&
                     w.SpaceId == configStore.SpaceId,
                "config store");
            if (guardBlock != null)
            {
                return guardBlock;
            }

            // Validate delete permission
            var (canDelete, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                configStore.Id,
                ResourceTypeEnum.ConfigStore,
                configStore.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                }
            );

            if (!canDelete)
            {
                serviceResponse.Message = "You do not have access to delete this key store.";
                return serviceResponse;
            }

            // Remove resource shares
            await _resourceUserAccessService.DeleteResourceUserAccessesAsync(configStoreId, ResourceTypeEnum.ConfigStore);
            await _resourceFlowAccessService.DeleteResourceFlowAccessesAsync(ResourceTypeEnum.ConfigStore, configStoreId);

            // Delete the config store from the repository
            _unitOfWork.ConfigStoreRepo.Delete(configStore);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Return a success message
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Key store deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to delete multiple config stores by their IDs
    public async Task<ServiceResponse<bool>> DeleteConfigStoresAsync(IEnumerable<Guid> configStoreIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete the key stores. Please try again."
        };

        try
        {
            // Fetch the config stores to be deleted
            var configStores = await _unitOfWork.ConfigStoreRepo
                .GetByConditionAsync(w => configStoreIds.Contains(w.Id) && w.EnvType == _currentTenantService.CurrentEnvType)
                .ToListAsync();

            // If no items are found, return an error message
            if (configStores.Count == 0)
            {
                serviceResponse.Message = "Key stores do not exist.";
                return serviceResponse;
            }

            var blockedNames = new List<string>();
            foreach (var configStore in configStores)
            {
                var (canDelete, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                    _userId,
                    configStore.Id,
                    ResourceTypeEnum.ConfigStore,
                    configStore.CreatedByUserId,
                    false,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                    }
                );

                if (!canDelete)
                {
                    serviceResponse.Message = "You do not have access to delete one or more key stores.";
                    return serviceResponse;
                }

                // PROD-guard: block the whole batch if any config store is PROD or has a same-name PROD twin.
                var guardBlock = await DeleteResourceGuard.ValidateAsync(
                    _unitOfWork.ConfigStoreRepo,
                    configStore.EnvType,
                    configStore.Name,
                    w => w.Name.ToLower() == configStore.Name.ToLower() &&
                         w.EnvType == ConfigureEnvironmentType.Prod &&
                         w.TenantId == configStore.TenantId &&
                         w.SpaceId == configStore.SpaceId,
                    "config store");
                if (guardBlock != null)
                {
                    blockedNames.Add(configStore.Name);
                }
            }

            // Reject the entire batch when any selected config store is protected by the PROD guard.
            if (blockedNames.Count > 0)
            {
                serviceResponse.Message =
                    $"Cannot delete the following config store(s) because they are published (PROD) or have a same-name PROD version: {string.Join(", ", blockedNames)}";
                return serviceResponse;
            }

            // Remove resource shares
            await _resourceUserAccessService.DeleteResourceUserAccessesAsync(configStoreIds, ResourceTypeEnum.ConfigStore);
            await _resourceFlowAccessService.DeleteResourceFlowAccessesAsync(ResourceTypeEnum.ConfigStore, configStoreIds);

            // Delete the config stores from the repository
            _unitOfWork.ConfigStoreRepo.Delete(configStores);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Return a success message with the count of deleted items
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{configStoreIds.Count()} key stores deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to decrypt the value of an encrypted config store
    public async Task<ServiceResponse<string>> DecryptConfigStoreValueAsync(Guid configStoreId)
    {
        var serviceResponse = new ServiceResponse<string>
        {
            Data = null,
            Message = "Unable to decrypt the key store. Please try again later."
        };

        try
        {
            // Retrieve the encrypted config store by its ID
            var configStore = await _unitOfWork.ConfigStoreRepo
                .GetByConditionAsync(w => w.Id == configStoreId && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            // If the config store doesn't exist, return an error response
            if (configStore == null)
            {
                serviceResponse.Message = "Key store not found.";
                return serviceResponse;
            }

            // Validate decrypt/view access
            var (canView, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                configStore.Id,
                ResourceTypeEnum.ConfigStore,
                configStore.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canView)
            {
                serviceResponse.Message =
                    "You do not have access to decrypt this config store.";

                return serviceResponse;
            }

            // If the value is not encrypted, notify the user
            if (!configStore.IsEncrypted)
            {
                serviceResponse.Message = "The key store value is not encrypted.";
                return serviceResponse;
            }

            // Decrypt the config store value
            var decryptedValue = _stringEncryptionService.DecryptString(configStore.Value);
            serviceResponse.Data = decryptedValue;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Key store decrypted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurred while decrypting the key store.";
        }

        return serviceResponse;
    }

    // Method to decrypt the value of an encrypted config store by its name within the current environment
    public async Task<ServiceResponse<string>> DecryptConfigStoreValueByNameAsync(string configStoreName)
    {
        var serviceResponse = new ServiceResponse<string>
        {
            Data = null,
            Message = "Unable to decrypt the key store. Please try again later."
        };

        try
        {
            // Validate the provided config store name
            if (string.IsNullOrWhiteSpace(configStoreName))
            {
                serviceResponse.Message = "A valid key store name is required.";
                return serviceResponse;
            }

            // Normalize input for case-insensitive comparison
            var normalizedName = configStoreName.Trim().ToLowerInvariant();

            // Retrieve the encrypted config store by its name within the current environment
            var configStore = await _unitOfWork.ConfigStoreRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == normalizedName &&
                    w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            // If the config store doesn't exist, return an error response
            if (configStore == null)
            {
                serviceResponse.Message = "Key store not found.";
                return serviceResponse;
            }

            // Validate decrypt/view access
            var (canView, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                configStore.Id,
                ResourceTypeEnum.ConfigStore,
                configStore.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canView)
            {
                serviceResponse.Message =
                    "You do not have access to decrypt this config store.";

                return serviceResponse;
            }

            // If the value is not encrypted, notify the user
            if (!configStore.IsEncrypted)
            {
                serviceResponse.Message = "The key store value is not encrypted.";
                return serviceResponse;
            }

            // Decrypt the config store value
            var decryptedValue = _stringEncryptionService.DecryptString(configStore.Value);
            serviceResponse.Data = decryptedValue;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Key store decrypted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurred while decrypting the key store.";
        }

        return serviceResponse;
    }

    // Method to validate if the input string is a valid identifier
    private bool IsValidIdentifier(string identifier)
    {
        // Check if the identifier is null or empty
        if (string.IsNullOrEmpty(identifier))
        {
            return false;
        }

        // Ensure that the identifier does not contain any spaces
        if (identifier.Contains(" "))
        {
            return false;
        }

        // Define a regex pattern for a valid identifier
        // The identifier must start with a letter (A-Za-z) or an underscore (_), and can contain letters, digits (0-9), or underscores (_), but no spaces.
        var pattern = @"^[A-Za-z_][A-Za-z0-9_]*$";

        // Check if the identifier matches the pattern
        if (!Regex.IsMatch(identifier, pattern))
        {
            // If it doesn't match the pattern, it's invalid
            return false;
        }

        // Check if the identifier is a reserved keyword
        string[] keywords = new string[]
        {
            "abstract", "as", "base", "bool", "break", "byte", "case", "catch", "char", "checked",
            "class", "const", "continue", "decimal", "default", "delegate", "do", "double",
            "else", "enum", "event", "explicit", "extern", "false", "finally", "fixed", "float",
            "for", "foreach", "goto", "if", "implicit", "in", "int", "interface", "internal",
            "is", "lock", "long", "namespace", "new", "null", "object", "operator", "out", "override",
            "params", "private", "protected", "public", "readonly", "ref", "return", "sbyte", "sealed",
            "short", "sizeof", "stackalloc", "static", "string", "struct", "switch", "this", "throw",
            "true", "try", "typeof", "uint", "ulong", "unchecked", "unsafe", "ushort", "using",
            "virtual", "void", "volatile", "while"
        };

        // If the identifier is a C# keyword, it's invalid
        if (Array.Exists(keywords, keyword => keyword.Equals(identifier, StringComparison.OrdinalIgnoreCase)))
        {
            // If it's a keyword, it's invalid
            return false;
        }

        // If it passes all checks, it's a valid identifier
        return true;
    }
}
