namespace WorkspaceAPIs.Services;

public class KeyStoreService : IKeyStoreService
{
    private readonly ILogger<KeyStoreService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly IStringEncryptionService _stringEncryptionService;
    private readonly IResourceShareService _resourceShareService;
    private readonly ICurrentTenantService _currentTenantService;

    public KeyStoreService(
        ILogger<KeyStoreService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IStringEncryptionService stringEncryptionService,
        IResourceShareService resourceShareService,
        ICurrentTenantService currentTenantService)
    {
        // Extract the user ID from the HTTP context, default to Guid.Empty if not found
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _stringEncryptionService = stringEncryptionService;
        _resourceShareService = resourceShareService;
        _currentTenantService = currentTenantService;
    }

    // Method to check if the key store name is available for the current user
    public async Task<ServiceResponse<TrueFalseResultDto>> IsKeyStoreNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check key store name availability. Please try again."
        };

        try
        {
            // Check if the provided key store name is valid
            if (!IsValidIdentifier(checkAvailabilityDto.UserInput))
            {
                _logger.LogError($"Invalid key store name: '{checkAvailabilityDto.UserInput}'. It must start with a letter or underscore and cannot contain spaces or symbols.");
                serviceResponse.Message = $"The name '{checkAvailabilityDto.UserInput}' is invalid. Please use a valid name.";
                return serviceResponse;
            }

            // Check if a key store with the same name already exists within the current environment
            var existingKeyStore = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType)
                .FirstOrDefaultAsync();

            // If an item with the same name exists, return a message indicating it's unavailable
            if (existingKeyStore != null)
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

    // Method to retrieve all key stores created by the current user
    public async Task<ServiceResponse<IEnumerable<KeyStoreDto>>> GetKeyStoresAsync(bool isPersonal)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<KeyStoreDto>>
        {
            Data = null,
            Message = "Failed to retrieve key stores. Please try again."
        };

        try
        {
            List<KeyStore> keyStores = new();
            Dictionary<Guid, ResourceAccessTypeEnum> resourceAccess = new();

            if (isPersonal)
            {
                // Retrieve only owned key stores
                keyStores = await _unitOfWork.KeyStoreRepo
                    .GetByConditionAsync(w => w.CreatedByUserId == _userId && w.EnvType == _currentTenantService.CurrentEnvType)
                    .OrderByDescending(w => w.CreatedOn)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .ToListAsync();
            }
            else
            {
                // Retrieve key store resources the user can access along with their permissions
                resourceAccess = await _resourceShareService.GetAccessibleResourcesWithAccessAsync(
                    _userId,
                    ResourceTypeEnum.KeyStore,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                    }
                );

                // Retrieve accessible key stores
                keyStores = await _unitOfWork.KeyStoreRepo
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

            // Map key store entities to DTOs
            var keyStoreDtoList = keyStores.Adapt<List<KeyStoreDto>>();

            // Assign access levels:
            // - Personal key stores are always owned by the current user.
            // - Shared key stores use the user's granted permission.
            // - Tenant-wide key stores default to View access when no explicit permission exists.
            keyStoreDtoList.ForEach(fe =>
            {
                fe.AccessLevel = isPersonal
                    ? ResourceAccessTypeEnum.Owner
                    : resourceAccess.GetValueOrDefault(fe.Id, ResourceAccessTypeEnum.View);
            });

            serviceResponse.Data = keyStoreDtoList;
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

    // Method to retrieve a specific key store by its ID for the current user
    public async Task<ServiceResponse<KeyStoreDto>> GetKeyStoreByIdAsync(Guid keyStoreId)
    {
        var serviceResponse = new ServiceResponse<KeyStoreDto>
        {
            Data = null,
            Message = "Failed to retrieve the key store. Please try again."
        };

        try
        {
            // Fetch the key store by ID, ensuring it's created by the current user
            var keyStore = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w => w.Id == keyStoreId && w.EnvType == _currentTenantService.CurrentEnvType)
                .FirstOrDefaultAsync();

            if (keyStore == null)
            {
                serviceResponse.Message =
                    "Key store not found.";

                return serviceResponse;
            }

            // Validate view access
            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                    _userId,
                    keyStore.Id,
                    ResourceTypeEnum.KeyStore,
                    keyStore.CreatedByUserId,
                    keyStore.IsTenantWideAccess,
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

            serviceResponse.Data = keyStore.Adapt<KeyStoreDto>();
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

    // Method to retrieve a specific key store by its name for the current user
    public async Task<ServiceResponse<KeyStoreDto>> GetKeyStoreByNameAsync(string keyStoreName)
    {
        var serviceResponse = new ServiceResponse<KeyStoreDto>
        {
            Data = null,
            Message = "Failed to retrieve the key store. Please try again."
        };

        try
        {
            // Fetch the key store by its name within the current environment
            var keyStore = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == keyStoreName.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType)
                .FirstOrDefaultAsync();

            // Return if the key store does not exist
            if (keyStore == null)
            {
                serviceResponse.Message = "Key store not found.";
                return serviceResponse;
            }

            // Validate whether the current user has permission to view the key store
            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                keyStore.Id,
                ResourceTypeEnum.KeyStore,
                keyStore.CreatedByUserId,
                keyStore.IsTenantWideAccess,
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
            serviceResponse.Data = keyStore.Adapt<KeyStoreDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Key store retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log the exception and return the default failure response
            _logger.LogError(ex, "Error retrieving key store by name: {KeyStoreName}", keyStoreName);
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
            var accessibleResourceIds = await _resourceShareService.GetAccessibleResourceIdsAsync(_userId, ResourceTypeEnum.KeyStore);

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
            var keyValuePairs = await _unitOfWork.KeyStoreRepo
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

    // Method to insert a new key store for the current user
    public async Task<ServiceResponse<KeyStoreDto>> InsertKeyStoreAsync(KeyStoreDto keyStoreDto)
    {
        var serviceResponse = new ServiceResponse<KeyStoreDto>
        {
            Data = null,
            Message = "Failed to add the key store. Please try again."
        };

        try
        {
            // Check if the provided key store name is valid
            if (!IsValidIdentifier(keyStoreDto.Name))
            {
                _logger.LogError($"Invalid key store name: '{keyStoreDto.Name}'. It must start with a letter or underscore and cannot contain spaces or symbols.");
                serviceResponse.Message = $"The name '{keyStoreDto.Name}' is invalid. Please use a valid name.";
                return serviceResponse;
            }

            // Check if a key store with the same name already exists within the current environment
            var existingKeyStore = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == keyStoreDto.Name.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .FirstOrDefaultAsync();

            // If an item with the same name exists, return a conflict response
            if (existingKeyStore != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A key store with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // Trim string properties in the DTO for consistency
            keyStoreDto = TrimDtoStringPropsUtil.TrimDtoStringProps(keyStoreDto);

            // Map DTO to entity and set user-related properties
            var newKeyStore = keyStoreDto.Adapt<KeyStore>();
            newKeyStore.CreatedByUserId = _userId;
            newKeyStore.LastModifiedByUserId = _userId;
            newKeyStore.EnvType = _currentTenantService.CurrentEnvType;

            // Insert the new key store into the repository
            await _unitOfWork.KeyStoreRepo.InsertAsync(newKeyStore);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Assign ownership
            if (!await _resourceShareService.AssignOwnerAsync(_userId, newKeyStore.Id, ResourceTypeEnum.KeyStore))
            {
                serviceResponse.Message = "Failed assigning ownership.";
                return serviceResponse;
            }

            // Return the created key store in the response
            serviceResponse.Data = newKeyStore.Adapt<KeyStoreDto>();
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

    // Method to update an existing key store for the current user
    public async Task<ServiceResponse<KeyStoreDto>> UpdateKeyStoreAsync(KeyStoreDto keyStoreDto)
    {
        var serviceResponse = new ServiceResponse<KeyStoreDto>
        {
            Data = null,
            Message = "Failed to update the key store. Please try again."
        };

        try
        {
            // Check if the provided key store name is valid
            if (!IsValidIdentifier(keyStoreDto.Name))
            {
                _logger.LogError($"Invalid key store name: '{keyStoreDto.Name}'. It must start with a letter or underscore and cannot contain spaces or symbols.");
                serviceResponse.Message = $"The name '{keyStoreDto.Name}' is invalid. Please use a valid name.";
                return serviceResponse;
            }

            // Fetch the existing key store
            var keyStore = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w => w.Id == keyStoreDto.Id && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            // If the item doesn't exist, return an error message
            if (keyStore == null)
            {
                serviceResponse.Message = "Key store does not exist.";
                return serviceResponse;
            }

            // Validate update access
            var (canEdit, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                keyStore.Id,
                ResourceTypeEnum.KeyStore,
                keyStore.CreatedByUserId,
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
                    "You do not have access to update this key store.";

                return serviceResponse;
            }

            // Check if another key store with the same name exists within the current environment
            var existingKeyStore = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == keyStoreDto.Name.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType &&
                    w.Id != keyStoreDto.Id)
                .FirstOrDefaultAsync();

            // If a conflict is found, return a conflict response
            if (existingKeyStore != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A key store with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // Trim all string properties in the DTO to remove leading/trailing whitespace
            keyStoreDto = TrimDtoStringPropsUtil.TrimDtoStringProps(keyStoreDto);

            // Update the description only if it has changed
            if (keyStore.Description != keyStoreDto.Description)
            {
                keyStore.Description = keyStoreDto.Description;
            }

            // Update tenant-wide access flag if the value has changed
            if (keyStore.IsTenantWideAccess != keyStoreDto.IsTenantWideAccess)
            {
                keyStore.IsTenantWideAccess = keyStoreDto.IsTenantWideAccess;
            }

            // Update the key store type if it has changed
            if (keyStore.Type != keyStoreDto.Type)
            {
                keyStore.Type = keyStoreDto.Type;
            }

            // Update the key store value if it has changed
            if (keyStore.Value != keyStoreDto.Value)
            {
                keyStore.Value = keyStoreDto.Value;
            }

            // Update the disabled status only when a value is provided and it has changed
            if (keyStoreDto.IsDisabled.HasValue && keyStore.IsDisabled != keyStoreDto.IsDisabled)
            {
                keyStore.IsDisabled = keyStoreDto.IsDisabled.Value;
            }

            // Record the user who last modified the key store
            keyStore.LastModifiedByUserId = _userId;

            // Update the key store in the repository
            _unitOfWork.KeyStoreRepo.Update(keyStore);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Return the updated key store in the response
            serviceResponse.Data = keyStore.Adapt<KeyStoreDto>();
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

    // Method to delete a key store by its ID
    public async Task<ServiceResponse<bool>> DeleteKeyStoreAsync(Guid keyStoreId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete the key store. Please try again."
        };

        try
        {
            // Fetch the key store to be deleted
            var keyStore = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w => w.Id == keyStoreId && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            // If the item doesn't exist, return an error message
            if (keyStore == null)
            {
                serviceResponse.Message = "Key store does not exist.";
                return serviceResponse;
            }

            // PROD-guard: block deletion of PROD key stores or key stores with a same-name PROD twin.
            var guardBlock = await DeleteResourceGuard.ValidateAsync(
                _unitOfWork.KeyStoreRepo,
                keyStore.EnvType,
                keyStore.Name,
                w => w.Name.ToLower() == keyStore.Name.ToLower() &&
                     w.EnvType == ConfigureEnvironmentType.Prod &&
                     w.TenantId == keyStore.TenantId &&
                     w.SpaceId == keyStore.SpaceId,
                "key store");
            if (guardBlock != null)
            {
                return guardBlock;
            }

            // Validate delete permission
            var (canDelete, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                keyStore.Id,
                ResourceTypeEnum.KeyStore,
                keyStore.CreatedByUserId,
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
            await _resourceShareService.DeleteResourceSharesAsync(keyStoreId, ResourceTypeEnum.KeyStore);

            // Delete the key store from the repository
            _unitOfWork.KeyStoreRepo.Delete(keyStore);

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

    // Method to delete multiple key stores by their IDs
    public async Task<ServiceResponse<bool>> DeleteKeyStoresAsync(IEnumerable<Guid> keyStoreIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete the key stores. Please try again."
        };

        try
        {
            // Fetch the key stores to be deleted
            var keyStores = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w => keyStoreIds.Contains(w.Id) && w.EnvType == _currentTenantService.CurrentEnvType)
                .ToListAsync();

            // If no items are found, return an error message
            if (keyStores.Count == 0)
            {
                serviceResponse.Message = "Key stores do not exist.";
                return serviceResponse;
            }

            var blockedNames = new List<string>();
            foreach (var keyStore in keyStores)
            {
                var (canDelete, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                    _userId,
                    keyStore.Id,
                    ResourceTypeEnum.KeyStore,
                    keyStore.CreatedByUserId,
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

                // PROD-guard: block the whole batch if any key store is PROD or has a same-name PROD twin.
                var guardBlock = await DeleteResourceGuard.ValidateAsync(
                    _unitOfWork.KeyStoreRepo,
                    keyStore.EnvType,
                    keyStore.Name,
                    w => w.Name.ToLower() == keyStore.Name.ToLower() &&
                         w.EnvType == ConfigureEnvironmentType.Prod &&
                         w.TenantId == keyStore.TenantId &&
                         w.SpaceId == keyStore.SpaceId,
                    "key store");
                if (guardBlock != null)
                {
                    blockedNames.Add(keyStore.Name);
                }
            }

            // Reject the entire batch when any selected key store is protected by the PROD guard.
            if (blockedNames.Count > 0)
            {
                serviceResponse.Message =
                    $"Cannot delete the following key store(s) because they are published (PROD) or have a same-name PROD version: {string.Join(", ", blockedNames)}";
                return serviceResponse;
            }

            // Remove resource shares
            await _resourceShareService.DeleteResourceSharesAsync(keyStoreIds, ResourceTypeEnum.KeyStore);

            // Delete the key stores from the repository
            _unitOfWork.KeyStoreRepo.Delete(keyStores);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Return a success message with the count of deleted items
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{keyStoreIds.Count()} key stores deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to decrypt the value of an encrypted key store
    public async Task<ServiceResponse<string>> DecryptKeyStoreValueAsync(Guid keyStoreId)
    {
        var serviceResponse = new ServiceResponse<string>
        {
            Data = null,
            Message = "Unable to decrypt the key store. Please try again later."
        };

        try
        {
            // Retrieve the encrypted key store by its ID
            var keyStore = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w => w.Id == keyStoreId && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            // If the key store doesn't exist, return an error response
            if (keyStore == null)
            {
                serviceResponse.Message = "Key store not found.";
                return serviceResponse;
            }

            // Validate decrypt/view access
            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                keyStore.Id,
                ResourceTypeEnum.KeyStore,
                keyStore.CreatedByUserId,
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
                    "You do not have access to decrypt this key store.";

                return serviceResponse;
            }

            // If the value is not encrypted, notify the user
            if (!keyStore.IsEncrypted)
            {
                serviceResponse.Message = "The key store value is not encrypted.";
                return serviceResponse;
            }

            // Decrypt the key store value
            var decryptedValue = _stringEncryptionService.DecryptString(keyStore.Value);
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

    // Method to decrypt the value of an encrypted key store by its name within the current environment
    public async Task<ServiceResponse<string>> DecryptKeyStoreValueByNameAsync(string keyStoreName)
    {
        var serviceResponse = new ServiceResponse<string>
        {
            Data = null,
            Message = "Unable to decrypt the key store. Please try again later."
        };

        try
        {
            // Validate the provided key store name
            if (string.IsNullOrWhiteSpace(keyStoreName))
            {
                serviceResponse.Message = "A valid key store name is required.";
                return serviceResponse;
            }

            // Normalize input for case-insensitive comparison
            var normalizedName = keyStoreName.Trim().ToLowerInvariant();

            // Retrieve the encrypted key store by its name within the current environment
            var keyStore = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == normalizedName &&
                    w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            // If the key store doesn't exist, return an error response
            if (keyStore == null)
            {
                serviceResponse.Message = "Key store not found.";
                return serviceResponse;
            }

            // Validate decrypt/view access
            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                keyStore.Id,
                ResourceTypeEnum.KeyStore,
                keyStore.CreatedByUserId,
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
                    "You do not have access to decrypt this key store.";

                return serviceResponse;
            }

            // If the value is not encrypted, notify the user
            if (!keyStore.IsEncrypted)
            {
                serviceResponse.Message = "The key store value is not encrypted.";
                return serviceResponse;
            }

            // Decrypt the key store value
            var decryptedValue = _stringEncryptionService.DecryptString(keyStore.Value);
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
