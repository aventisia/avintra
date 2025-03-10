namespace WorkspaceAPIs.Services;

public class ConfigItemService : IConfigItemService
{
    private readonly ILogger<ConfigItemService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly IStringEncryptionService _stringEncryptionService;

    public ConfigItemService(
        ILogger<ConfigItemService> logger,
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

    // Method to check if the config item name is available for the current user
    public async Task<ServiceResponse<TrueFalseResultDto>> IsConfigItemNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check config item name availability. Please try again"
        };

        try
        {
            // Check if a config item with the same name already exists for the current user
            var existingConfigItem = await _unitOfWork.ConfigItemRepo
                .GetByConditionAsync(w =>
                    w.CreatedByUserId == _userId &&
                    w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
                .FirstOrDefaultAsync();

            // If an item with the same name exists, return a message indicating it's unavailable
            if (existingConfigItem != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "A config item with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // If no conflict is found, the name is available
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Config item name is available.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to retrieve all config items created by the current user
    public async Task<ServiceResponse<IEnumerable<ConfigItemDto>>> GetConfigItemsAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<ConfigItemDto>>
        {
            Data = null,
            Message = "Failed to retrieve config items. Please try again."
        };

        try
        {
            // Retrieve and order the user's config items by creation date
            var configItems = await _unitOfWork.ConfigItemRepo
                .GetByConditionAsync(w => w.CreatedByUserId == _userId)
                .OrderByDescending(w => w.CreatedOn)
                .ProjectToType<ConfigItemDto>()
                .ToListAsync();

            serviceResponse.Data = configItems;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Config items retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to retrieve a specific config item by its ID for the current user
    public async Task<ServiceResponse<ConfigItemDto>> GetConfigItemByIdAsync(Guid configItemId)
    {
        var serviceResponse = new ServiceResponse<ConfigItemDto>
        {
            Data = null,
            Message = "Failed to retrieve the config item. Please try again."
        };

        try
        {
            // Fetch the config item by ID, ensuring it's created by the current user
            var configItem = await _unitOfWork.ConfigItemRepo
                .GetByConditionAsync(w => w.Id == configItemId && w.CreatedByUserId == _userId)
                .ProjectToType<ConfigItemDto>()
                .FirstOrDefaultAsync();

            serviceResponse.Data = configItem;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Config item retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to insert a new config item for the current user
    public async Task<ServiceResponse<ConfigItemDto>> InsertConfigItemAsync(ConfigItemDto configItemDto)
    {
        var serviceResponse = new ServiceResponse<ConfigItemDto>
        {
            Data = null,
            Message = "Failed to add the config item. Please try again."
        };

        try
        {
            // Check if a config item with the same name already exists for the user
            var existingConfigItem = await _unitOfWork.ConfigItemRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == configItemDto.Name.ToLower() &&
                    w.CreatedByUserId == _userId)
                .FirstOrDefaultAsync();

            // If an item with the same name exists, return a conflict response
            if (existingConfigItem != null)
            {
                _logger.LogInformation("Config item already exists.");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A config item with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // Trim string properties in the DTO for consistency
            configItemDto = TrimDtoStringPropsUtil.TrimDtoStringProps(configItemDto);

            // Map DTO to entity and set user-related properties
            var newConfigItem = configItemDto.Adapt<ConfigItem>();
            newConfigItem.CreatedByUserId = _userId;
            newConfigItem.LastModifiedByUserId = _userId;

            // If the ConfigItem type is "CREDENTIAL", encrypt the Value property to protect sensitive information.
            // This ensures that credentials are not stored in plain text and remain secure.
            if (newConfigItem.Type == ConfigItemTypesEnum.CREDENTIAL)
            {
                // Encrypt the credential value before saving it
                newConfigItem.Value = _stringEncryptionService.EncryptString(newConfigItem.Value);
                newConfigItem.IsEncrypted = true;
            }

            // Insert the new config item into the repository
            await _unitOfWork.ConfigItemRepo.InsertAsync(newConfigItem);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while inserting new config item.");
                return serviceResponse;
            }

            // Return the created config item in the response
            serviceResponse.Data = newConfigItem.Adapt<ConfigItemDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Config item created successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to update an existing config item for the current user
    public async Task<ServiceResponse<ConfigItemDto>> UpdateConfigItemAsync(ConfigItemDto configItemDto)
    {
        var serviceResponse = new ServiceResponse<ConfigItemDto>
        {
            Data = null,
            Message = "Failed to update the config item. Please try again."
        };

        try
        {
            // Fetch the existing config item
            var configItem = await _unitOfWork.ConfigItemRepo
                .GetByConditionAsync(w =>
                    w.Id == configItemDto.Id && w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // If the item doesn't exist, return an error message
            if (configItem == null)
            {
                _logger.LogInformation("Config item does not exist.");
                serviceResponse.Message = "Config item does not exist.";
                return serviceResponse;
            }

            // Check if another config item with the same name exists
            var existingConfigItem = await _unitOfWork.FlowRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == configItemDto.Name.ToLower() &&
                    w.CreatedByUserId == _userId &&
                    w.Id != configItemDto.Id)
                .FirstOrDefaultAsync();

            // If a conflict is found, return a conflict response
            if (existingConfigItem != null)
            {
                _logger.LogInformation("Config item name already exists.");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A config item with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // Trim string properties in the DTO for consistency
            configItemDto = TrimDtoStringPropsUtil.TrimDtoStringProps(configItemDto);

            // If the ConfigItem type is "CREDENTIAL" and it is not already encrypted,
            // encrypt the Value property to safeguard sensitive information.
            // This ensures that credentials are not stored in plain text.
            if (configItem.Type == ConfigItemTypesEnum.CREDENTIAL && !configItem.IsEncrypted)
            {
                // Encrypt the credential value prior to saving it
                configItem.Value = _stringEncryptionService.EncryptString(configItem.Value);
                configItem.IsEncrypted = true;
            }

            // Update the config item in the repository
            _unitOfWork.ConfigItemRepo.Update(configItem);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while updating config item.");
                return serviceResponse;
            }

            // Return the updated config item in the response
            serviceResponse.Data = configItem.Adapt<ConfigItemDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Config item updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to delete a config item by its ID
    public async Task<ServiceResponse<bool>> DeleteConfigItemAsync(Guid configItemId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete the config item. Please try again."
        };

        try
        {
            // Fetch the config item to be deleted
            var configItem = await _unitOfWork.ConfigItemRepo
                .GetByConditionAsync(w => w.Id == configItemId && w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // If the item doesn't exist, return an error message
            if (configItem == null)
            {
                _logger.LogInformation("Config item does not exist.");
                serviceResponse.Message = "Config item does not exist.";
                return serviceResponse;
            }

            // Delete the config item from the repository
            _unitOfWork.ConfigItemRepo.Delete(configItem);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting config item.");
                return serviceResponse;
            }

            // Return a success message
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Config item deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to delete multiple config items by their IDs
    public async Task<ServiceResponse<bool>> DeleteConfigItemsAsync(IEnumerable<Guid> configItemIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete the config items. Please try again."
        };

        try
        {
            // Fetch the config items to be deleted
            var configItems = await _unitOfWork.ConfigItemRepo
                .GetByConditionAsync(w => w.CreatedByUserId == _userId && configItemIds.Contains(w.Id))
                .ToListAsync();

            // If no items are found, return an error message
            if (configItems.Count == 0)
            {
                _logger.LogInformation("Config items do not exist.");
                serviceResponse.Message = "Config items do not exist.";
                return serviceResponse;
            }

            // Delete the config items from the repository
            _unitOfWork.ConfigItemRepo.Delete(configItems);

            // Ensure changes are saved successfully
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting config items.");
                return serviceResponse;
            }

            // Return a success message with the count of deleted items
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{configItemIds.Count()} Config items deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to decrypt the value of an encrypted config item
    public async Task<ServiceResponse<string>> DecryptConfigItemValueAsync(Guid configItemId)
    {
        var serviceResponse = new ServiceResponse<string>
        {
            Data = null,
            Message = "Unable to decrypt the config item. Please try again later."
        };

        try
        {
            // Retrieve the encrypted config item by its ID
            var configItem = await _unitOfWork.ConfigItemRepo
                .GetByConditionAsync(w =>
                    w.Id == configItemId && w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // If the config item doesn't exist, return an error response
            if (configItem == null)
            {
                _logger.LogInformation("Config item not found.");
                serviceResponse.Message = "Config item not found.";
                return serviceResponse;
            }

            // If the value is not encrypted, notify the user
            if (!configItem.IsEncrypted)
            {
                serviceResponse.Message = "The config item value is not encrypted.";
                return serviceResponse;
            }

            // Decrypt the config item value
            var decryptedValue = _stringEncryptionService.DecryptString(configItem.Value);
            serviceResponse.Data = decryptedValue;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Config item decrypted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurred while decrypting the config item.";
        }

        return serviceResponse;
    }
}