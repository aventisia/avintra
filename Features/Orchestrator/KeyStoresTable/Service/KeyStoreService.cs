namespace WorkspaceAPIs.Services;

public class KeyStoreService : IKeyStoreService
{
    private readonly ILogger<KeyStoreService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly IStringEncryptionService _stringEncryptionService;

    public KeyStoreService(
        ILogger<KeyStoreService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IStringEncryptionService stringEncryptionService)
    {
        // Extract the user ID from the HTTP context, default to Guid.Empty if not found
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _stringEncryptionService = stringEncryptionService;
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
            // Check if a key store with the same name already exists for the current user
            var existingKeyStore = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w =>
                    w.CreatedByUserId == _userId &&
                    w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
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
    public async Task<ServiceResponse<IEnumerable<KeyStoreDto>>> GetKeyStoresAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<KeyStoreDto>>
        {
            Data = null,
            Message = "Failed to retrieve key stores. Please try again."
        };

        try
        {
            // Retrieve and order the user's key stores by creation date
            var keyStores = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w => w.CreatedByUserId == _userId)
                .OrderByDescending(w => w.CreatedOn)
                .ProjectToType<KeyStoreDto>()
                .ToListAsync();

            serviceResponse.Data = keyStores;
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
                .GetByConditionAsync(w => w.Id == keyStoreId && w.CreatedByUserId == _userId)
                .ProjectToType<KeyStoreDto>()
                .FirstOrDefaultAsync();

            serviceResponse.Data = keyStore;
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
            // Check if a key store with the same name already exists for the user
            var existingKeyStore = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == keyStoreDto.Name.ToLower() &&
                    w.CreatedByUserId == _userId)
                .FirstOrDefaultAsync();

            // If an item with the same name exists, return a conflict response
            if (existingKeyStore != null)
            {
                _logger.LogInformation("Key store already exists.");
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

            // If the KeyStore type is "CREDENTIAL", encrypt the Value property to protect sensitive information.
            if (newKeyStore.Type == KeyStoreTypesEnum.CREDENTIAL)
            {
                // Encrypt the credential value before saving it
                newKeyStore.Value = _stringEncryptionService.EncryptString(newKeyStore.Value);
                newKeyStore.IsEncrypted = true;
            }

            // Insert the new key store into the repository
            await _unitOfWork.KeyStoreRepo.InsertAsync(newKeyStore);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while inserting new key store.");
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
            // Fetch the existing key store
            var keyStore = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w =>
                    w.Id == keyStoreDto.Id && w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // If the item doesn't exist, return an error message
            if (keyStore == null)
            {
                _logger.LogInformation("Key store does not exist.");
                serviceResponse.Message = "Key store does not exist.";
                return serviceResponse;
            }

            // Check if another key store with the same name exists
            var existingKeyStore = await _unitOfWork.KeyStoreRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == keyStoreDto.Name.ToLower() &&
                    w.CreatedByUserId == _userId &&
                    w.Id != keyStoreDto.Id)
                .FirstOrDefaultAsync();

            // If a conflict is found, return a conflict response
            if (existingKeyStore != null)
            {
                _logger.LogInformation("Key store name already exists.");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A key store with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // Trim string properties in the DTO for consistency
            keyStoreDto = TrimDtoStringPropsUtil.TrimDtoStringProps(keyStoreDto);

            // If the key store type is "CREDENTIAL" and the value has changed or is not already encrypted,
            // encrypt the Value property to protect sensitive information.
            if (keyStoreDto.Type == KeyStoreTypesEnum.CREDENTIAL && !string.IsNullOrEmpty(keyStoreDto.Value))
            {
                // Encrypt the credential value prior to saving it
                keyStoreDto.Value = _stringEncryptionService.EncryptString(keyStore.Value);
                keyStoreDto.IsEncrypted = true;
            }

            // Map the properties from the keyStoreDto to the existing keyStore entity
            keyStoreDto.Adapt(keyStore);

            // Update the key store in the repository
            _unitOfWork.KeyStoreRepo.Update(keyStore);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while updating key store.");
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
                .GetByConditionAsync(w => w.Id == keyStoreId && w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // If the item doesn't exist, return an error message
            if (keyStore == null)
            {
                _logger.LogInformation("Key store does not exist.");
                serviceResponse.Message = "Key store does not exist.";
                return serviceResponse;
            }

            // Delete the key store from the repository
            _unitOfWork.KeyStoreRepo.Delete(keyStore);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting key store.");
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
                .GetByConditionAsync(w => w.CreatedByUserId == _userId && keyStoreIds.Contains(w.Id))
                .ToListAsync();

            // If no items are found, return an error message
            if (keyStores.Count == 0)
            {
                _logger.LogInformation("Key stores do not exist.");
                serviceResponse.Message = "Key stores do not exist.";
                return serviceResponse;
            }

            // Delete the key stores from the repository
            _unitOfWork.KeyStoreRepo.Delete(keyStores);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting key stores.");
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
                .GetByConditionAsync(w =>
                    w.Id == keyStoreId && w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // If the key store doesn't exist, return an error response
            if (keyStore == null)
            {
                _logger.LogInformation("Key store not found.");
                serviceResponse.Message = "Key store not found.";
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
}
