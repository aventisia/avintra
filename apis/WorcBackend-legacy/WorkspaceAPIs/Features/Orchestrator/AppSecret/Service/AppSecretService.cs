namespace WorkspaceAPIs.Services;

public class AppSecretService : IAppSecretService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AppSecretService> _logger;
    private readonly IStringEncryptionService _encryptionService;
    private readonly Guid _userId;
    private readonly IResourceShareService _resourceShareService;
    public AppSecretService(
        IUnitOfWork unitOfWork,
        ILogger<AppSecretService> logger, IHttpContextAccessor
        httpContextAccessor,
        IStringEncryptionService encryptionService
, IResourceShareService resourceShareService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _encryptionService = encryptionService;

        // Extract user ID from the HTTP context, if available
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _resourceShareService = resourceShareService;
    }

    // Retrieve all vault credentials
    public async Task<ServiceResponse<IEnumerable<AppSecretDto>>> GetAllAppSecretsAsync(bool isPersonal)
    {
        // Initialize service response with default failure message
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
                // Retrieve user's personal app secrets
                appSecrets = await _unitOfWork.AppSecretRepo
                    .GetByConditionAsync(w => w.CreatedByUserId == _userId)
                    .OrderByDescending(w => w.CreatedOn)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .ToListAsync();
            }
            else
            {
                // Retrieve accessible resource ids with access levels
                resourceAccess = await _resourceShareService.GetAccessibleResourcesWithAccessAsync(
                    _userId,
                    ResourceTypeEnum.AppSecret,
                    new[]
                    {
                        ResourceAccessTypeEnum.FullAccess,
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                        ResourceAccessTypeEnum.Delete
                    }
                );

                // Retrieve tenant-wide and shared app secrets
                appSecrets = await _unitOfWork.AppSecretRepo
                    .GetByConditionAsync(w =>
                        w.IsTenantWideAccess ||
                        resourceAccess.Keys.Contains(w.Id))
                    .OrderByDescending(w => w.CreatedOn)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .ToListAsync();
            }

            // Map the app secret entities to DTOs
            var appSecretData = appSecrets.Adapt<IEnumerable<AppSecretDto>>().ToList();

            // Set the access level for each app secret:
            // - Personal app secrets are always owned by the current user.
            // - Shared app secrets use the access level from the resource access map,
            //   defaulting to View when no explicit permission is found.
            appSecretData.ForEach(fe =>
            {
                fe.AccessLevel = isPersonal
                    ? ResourceAccessTypeEnum.Owner
                    : resourceAccess.GetValueOrDefault(fe.Id, ResourceAccessTypeEnum.View);
            });

            // Adapt the data to the DTO format and assign to service response
            serviceResponse.Data = appSecretData;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credentials fetched successfully.";

            // Log the number of credentials fetched
            _logger.LogInformation("Successfully retrieved {Count} credentials from the database.", appSecrets.Count);
        }
        catch (Exception ex)
        {
            // Log any error that occurs during the process
            _logger.LogError(ex, "Error occurred while fetching credentials.");
        }

        // Return the service response (could be success or failure)
        return serviceResponse;
    }

    // Checks the availability of a credential name.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsAppSecretNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check credential name availability. Please try again."
        };

        try
        {
            // Trim and normalize the credential name input
            var appSecretName = checkAvailabilityDto.UserInput?.Trim();

            if (string.IsNullOrWhiteSpace(appSecretName))
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Credential name cannot be empty. Please provide a valid name.";
                return serviceResponse;
            }

            // Check if credential with the same name exists (case-insensitive)
            var existingAppSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Name.ToLower() == appSecretName.ToLower())
                .SingleOrDefaultAsync();

            // Credential name already exists
            if (existingAppSecret != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = $"A credential with the name '{appSecretName}' already exists. Please try a different name.";
                return serviceResponse;
            }

            // Name is available
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

    // Retrieve credentials as selectable options (e.g., for a dropdown)
    public async Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetSelectableAppSecretOptionsAsync(AppSecretTypesEnum? type)
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>
        {
            Data = null,
            Message = "Failed to fetch credentials list. Please try again later."
        };

        try
        {
            // Use ResourceShareService
            var accessibleSecretIds = await _resourceShareService.GetAccessibleResourceIdsAsync(
                _userId,
                ResourceTypeEnum.AppSecret,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.FullAccess,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                    ResourceAccessTypeEnum.Delete,
                }
            );

            // Attempt to fetch the selectable credential options from the repository
            var accessibleSecrets = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w =>
                    (!type.HasValue || w.Type == type) &&
                    (w.IsTenantWideAccess || w.CreatedByUserId == _userId || accessibleSecretIds.Contains(w.Id))
                )
                .ToListAsync();

            // Assign the options to the service response
            serviceResponse.Data = accessibleSecrets.Adapt<IEnumerable<SelectOptionDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credentials list fetched successfully.";
        }
        catch (Exception ex)
        {
            // Log any error that occurs during the process
            _logger.LogError(ex, "Error occurred while fetching credentials list options.");
        }

        // Return the service response (could be success or failure)
        return serviceResponse;
    }

    // Retrieve a specific credential by its ID
    public async Task<ServiceResponse<AppSecretDto>> GetAppSecretByIdAsync(Guid appSecretId)
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<AppSecretDto>
        {
            Data = null,
            Message = "Unable to fetch the credential. Please try again later."
        };

        try
        {
            // Attempt to retrieve the credential by its ID
            var appSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Id == appSecretId)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            // If no credential is found, log and return an appropriate message
            if (appSecret == null)
            {
                _logger.LogWarning("No credential found with ID: {AppSecretId}", appSecretId);
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }


            // Validate decrypt/view access
            var canView = await _resourceShareService.HasAccessAsync(
                _userId,
                appSecret.Id,
                ResourceTypeEnum.KeyStore,
                appSecret.CreatedByUserId,
                appSecret.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.FullAccess,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                    ResourceAccessTypeEnum.Delete,
                }
            );

            if (!canView)
            {
                _logger.LogWarning("User {UserId} is not authorized to view credential ID: {AppSecretId}", _userId, appSecretId);
                serviceResponse.Message = "You do not have permission to view this credential.";
                return serviceResponse;
            }

            // Adapt the entity to a DTO and assign to the service response
            serviceResponse.Data = appSecret.Adapt<AppSecretDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credential retrieved successfully.";

            // Log successful retrieval of credential by ID
            _logger.LogInformation("Successfully fetched credential with ID: {AppSecretId}", appSecretId);
        }
        catch (Exception ex)
        {
            // Log any error that occurs during the process
            _logger.LogError(ex, "An error occurred while fetching credential with ID: {AppSecretId}", appSecretId);
        }

        // Return the service response (could be success or failure)
        return serviceResponse;
    }

    // Create a new credential
    public async Task<ServiceResponse<AppSecretDto>> CreateAppSecretAsync(AppSecretDto appSecretDto)
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<AppSecretDto>
        {
            Data = null,
            Message = "Failed to create credential. Please try again later."
        };

        try
        {
            // Check if a credential with the same name already exists
            var existingSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Name.ToLower() == appSecretDto.Name.ToLower())
                .SingleOrDefaultAsync();

            // If an existing credential is found, return a conflict response
            if (existingSecret != null)
            {
                _logger.LogWarning("Credential creation aborted. A credential named '{CredentialName}' already exists.", appSecretDto.Name);
                serviceResponse.Message = $"A credential named '{appSecretDto.Name}' already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Clean up input DTO (trim strings, remove extra spaces, etc.)
            appSecretDto = TrimDtoStringPropsUtil.TrimDtoStringProps(appSecretDto);

            // Validate the data, Pass the cleaned-up credential data to the validation function
            var validateData = ValidateData(appSecretDto.Type, appSecretDto.Data);

            // Check if validation was successful, If the sanitized data is empty or invalid, return the service response with the validation remark
            if (string.IsNullOrEmpty(validateData.SanitizedDataJson))
            {
                serviceResponse.Message = validateData.Remark;
                return serviceResponse;
            }

            // Create a new credential entity
            var newAppSecret = appSecretDto.Adapt<AppSecret>();
            newAppSecret.Data = validateData.SanitizedDataJson;
            newAppSecret.CreatedByUserId = _userId;
            newAppSecret.LastModifiedByUserId = _userId;

            // Insert the new credential into the repository
            await _unitOfWork.AppSecretRepo.InsertAsync(newAppSecret);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save newly created credential: {AppSecretName}", appSecretDto.Name);
                return serviceResponse;
            }

            // Add new entries
            foreach (var kv in validateData.EncryptedValues)
            {
                // Create new key-value entry
                var newEncryptedValue = new EncryptedKeyValue
                {
                    Name = kv.Key,
                    Value = kv.Value,
                    AppSecretId = newAppSecret.Id
                };
                await _unitOfWork.EncryptedKeyValueRepo.InsertAsync(newEncryptedValue);
            }

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to insert encrypted key-values for Credential ID: {AppSecretId}", appSecretDto.Id);
                return serviceResponse;
            }

            // // Assign ownership
            // if (!await _resourceShareService.AssignOwnerAsync(_userId, newAppSecret.Id, ResourceTypeEnum.AppSecret))
            // {
            //     serviceResponse.Message = "Failed assigning ownership.";
            //     _logger.LogError("Failed to assign owner access for Credential ID: {AppSecretId}", appSecretDto.Id);
            //     return serviceResponse;
            // }

            // Adapt the entity to DTO and return success response
            serviceResponse.Data = newAppSecret.Adapt<AppSecretDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credential created successfully.";

            // Log successful creation of the credential
            _logger.LogInformation("Credential created successfully with ID: {AppSecretId}", newAppSecret.Id);
        }
        catch (Exception ex)
        {
            // Log any unexpected errors during Credential creation
            _logger.LogError(ex, "An unexpected error occurred while creating credential: {AppSecretName}", appSecretDto.Name);
        }

        // Return the service response (could be success or failure)
        return serviceResponse;
    }

    // Update an existing credential
    public async Task<ServiceResponse<AppSecretDto>> UpdateAppSecretAsync(AppSecretDto appSecretDto)
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<AppSecretDto>
        {
            Data = null,
            Message = "Failed to update credential. Please try again later."
        };

        try
        {
            // Attempt to retrieve the credential by ID
            var existingAppSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Id == appSecretDto.Id)
                .Include(i => i.EncryptedKeyValues)
                .SingleOrDefaultAsync();

            // If the credential doesn't exist, return an error message
            if (existingAppSecret == null)
            {
                _logger.LogWarning("Update failed. No credential found with ID: {AppSecretId}", appSecretDto.Id);
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            // Validate update access
            var canEdit = await _resourceShareService.HasAccessAsync(
                _userId,
                existingAppSecret.Id,
                ResourceTypeEnum.KeyStore,
                existingAppSecret.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.FullAccess,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canEdit)
            {
                _logger.LogWarning("User {UserId} is not authorized to update credential ID: {AppSecretId}", _userId, appSecretDto.Id);
                serviceResponse.Message = "You do not have access to update this credential.";
                return serviceResponse;
            }

            // Check for a duplicate credential by name
            var duplicateSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Name.ToLower() == appSecretDto.Name.ToLower() && w.Id != appSecretDto.Id)
                .SingleOrDefaultAsync();

            // If a duplicate exists, return a conflict message
            if (duplicateSecret != null)
            {
                _logger.LogWarning("Update failed. Credential with name '{AppSecretName}' already exists.", appSecretDto.Name);
                serviceResponse.Message = $"A credential with the name '{appSecretDto.Name}' already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Clean up input DTO (trim strings, remove extra spaces, etc.)
            appSecretDto = TrimDtoStringPropsUtil.TrimDtoStringProps(appSecretDto);

            // Validate the data, Pass the cleaned-up credential data to the validation function
            var validateData = ValidateData(appSecretDto.Type, appSecretDto.Data);

            // Check if validation was successful, If the sanitized data is empty or invalid, return the service response with the validation remark
            if (string.IsNullOrEmpty(validateData.SanitizedDataJson))
            {
                serviceResponse.Message = validateData.Remark;
                return serviceResponse;
            }

            // Apply the updated values from DTO to the existing entity
            appSecretDto.Adapt(existingAppSecret);
            existingAppSecret.Data = validateData.SanitizedDataJson;
            existingAppSecret.LastModifiedByUserId = _userId;

            // Update the credential in the repository
            _unitOfWork.AppSecretRepo.Update(existingAppSecret);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save updated credential: {AppSecretId}", appSecretDto.Id);
                return serviceResponse;
            }

            // Get existing encrypted key-values from the database
            var existingKeyValues = existingAppSecret.EncryptedKeyValues;

            // Prepare keys from request
            var incomingKeys = validateData.EncryptedValues;

            var hasChanges = false;
            var keysToInsert = new List<EncryptedKeyValue>();

            // Update existing entries or collect new ones for insertion
            foreach (var kv in incomingKeys)
            {
                // Skip if the value is null or empty
                if (string.IsNullOrEmpty(kv.Value))
                    continue;

                // Try to find an existing key-value pair by name
                var existing = existingKeyValues?.FirstOrDefault(e => e.Name == kv.Key);
                if (existing != null)
                {
                    // Update only if the value has actually changed
                    if (existing.Value != kv.Value)
                    {
                        existing.Value = kv.Value;
                        _unitOfWork.EncryptedKeyValueRepo.Update(existing);
                        hasChanges = true;
                    }
                }
                else
                {
                    // Prepare a new key-value entry for insertion
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

            // Insert new entries, if any
            if (keysToInsert.Any())
            {
                await _unitOfWork.EncryptedKeyValueRepo.InsertAsync(keysToInsert);
            }

            // Identify keys that exist in DB but not in the incoming request (to be deleted)
            var keysToDelete = existingKeyValues?
                .Where(e => e != null && !incomingKeys.ContainsKey(e.Name))
                .ToList() ?? new List<EncryptedKeyValue>();

            if (keysToDelete.Any())
            {
                _unitOfWork.EncryptedKeyValueRepo.Delete(keysToDelete);
                hasChanges = true;
            }

            // Save changes if any insert, update, or delete occurred
            if (hasChanges)
            {
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to update encrypted key-values for credential ID: {AppSecretId}", appSecretDto.Id);
                    return serviceResponse;
                }
            }

            // Return success response
            serviceResponse.Data = existingAppSecret.Adapt<AppSecretDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credential updated successfully.";

            // Log successful update of the credential
            _logger.LogInformation("Credential with ID: {AppSecretId} successfully updated.", appSecretDto.Id);
        }
        catch (Exception ex)
        {
            // Log any unexpected errors during the update
            _logger.LogError(ex, "Error occurred while updating credential with ID: {AppSecretId}", appSecretDto.Id);
        }

        // Return the service response (could be success or failure)
        return serviceResponse;
    }

    // Delete a single credential by ID
    public async Task<ServiceResponse<bool>> DeleteAppSecretAsync(Guid appSecretId)
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete credential. Please try again later."
        };

        try
        {
            // Attempt to retrieve the credential by ID
            var appSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Id == appSecretId)
                .SingleOrDefaultAsync();

            // If no credential is found, return an error message
            if (appSecret == null)
            {
                _logger.LogWarning("No credential found with ID: {AppSecretId}", appSecretId);
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            // Validate update access
            var canDelete = await _resourceShareService.HasAccessAsync(
                _userId,
                appSecret.Id,
                ResourceTypeEnum.AppSecret,
                appSecret.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.FullAccess,
                    ResourceAccessTypeEnum.Delete,
                }
            );

            if (!canDelete)
            {
                _logger.LogWarning("User {UserId} is not authorized to delete credential ID: {AppSecretId}", _userId, appSecretId);
                serviceResponse.Message = "You do not have access to delete this credential.";
                return serviceResponse;
            }

            await _resourceShareService.DeleteResourceSharesAsync(appSecret.Id, ResourceTypeEnum.AppSecret);

            // Delete the credential from the repository
            _unitOfWork.AppSecretRepo.Delete(appSecret);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to delete credential with ID: {AppSecretId} due to database save error.", appSecretId);
                return serviceResponse;
            }

            // Return success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credential deleted successfully.";

            // Log successful deletion
            _logger.LogInformation("Credential with ID: {AppSecretId} successfully deleted.", appSecretId);
        }
        catch (Exception ex)
        {
            // Log any unexpected errors during the deletion
            _logger.LogError(ex, "Unexpected error while deleting credential with ID: {AppSecretId}", appSecretId);
        }

        // Return the service response (could be success or failure)
        return serviceResponse;
    }

    // Delete multiple credentials by their IDs
    public async Task<ServiceResponse<bool>> DeleteAppSecretsAsync(List<Guid> appSecretIds)
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete credentials. Please try again later."
        };

        try
        {
            // Attempt to retrieve the credentials by their IDs
            var appSecrets = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => appSecretIds.Contains(w.Id))
                .ToListAsync();

            // If no credentials are found, return an error message
            if (appSecrets == null || appSecrets.Count == 0)
            {
                _logger.LogWarning("No credentials found for deletion.");
                serviceResponse.Message = "No credentials found to delete.";
                return serviceResponse;
            }
            foreach (var appSecret in appSecrets)
            {
                var allowed = await _resourceShareService.HasAccessAsync(
                    _userId,
                    appSecret.Id,
                    ResourceTypeEnum.KeyStore,
                    appSecret.CreatedByUserId,
                    false,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.FullAccess,
                        ResourceAccessTypeEnum.Delete,
                    }
                );

                if (!allowed)
                {
                    serviceResponse.Message = "You do not have access to delete one or more selected credentials.";
                    return serviceResponse;
                }
            }

            await _resourceShareService.DeleteResourceSharesAsync(appSecretIds, ResourceTypeEnum.AppSecret);

            // Delete the credentials from the repository
            _unitOfWork.AppSecretRepo.Delete(appSecrets);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to commit bulk deletion of credentials.");
                return serviceResponse;
            }
            // Return success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credentials deleted successfully.";

            // Log successful bulk deletion
            _logger.LogInformation("Successfully deleted {Count} credential(s).", appSecrets.Count);
        }
        catch (Exception ex)
        {
            // Log any unexpected errors during the bulk deletion
            _logger.LogError(ex, "Unexpected error while bulk deleting credentials.");
        }

        // Return the service response (could be success or failure)
        return serviceResponse;
    }

    // Retrieves the details of a specific Credential, including decrypted key-value data.
    public async Task<ServiceResponse<AppSecretDto>> GetAppSecretDetailAsync(Guid appSecretId)
    {
        // Prepare default response in case of failure
        var serviceResponse = new ServiceResponse<AppSecretDto>
        {
            Data = null,
            Message = "Unable to load credential. Please try again later.",
        };

        try
        {
            // Fetch the credential entity along with its encrypted key-value pairs
            var appSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Id == appSecretId)
                .AsNoTracking()
                .Include(i => i.EncryptedKeyValues)
                .SingleOrDefaultAsync();

            if (appSecret == null)
            {
                _logger.LogWarning("No credential found with ID: {AppSecretId}", appSecretId);
                serviceResponse.Message = "Credential not found.";
                return serviceResponse;
            }

            // Validate view access
            var canView = await _resourceShareService.HasAccessAsync(
                _userId,
                appSecret.Id,
                ResourceTypeEnum.KeyStore,
                appSecret.CreatedByUserId,
                appSecret.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.FullAccess,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                    ResourceAccessTypeEnum.Delete,
                }
            );

            if (!canView)
            {
                _logger.LogWarning("User {UserId} is not authorized to view credential ID: {AppSecretId}", _userId, appSecretId);
                serviceResponse.Message = "You do not have access to view this credential.";
                return serviceResponse;
            }

            // Map entity to DTO
            var appSecretDto = appSecret.Adapt<AppSecretDto>();

            // Decrypt and merge key-value pairs into the DTO's data object
            var encryptedValues = appSecret.EncryptedKeyValues?.ToList();
            if (encryptedValues != null && encryptedValues.Any())
            {
                var decryptedMap = encryptedValues.ToDictionary(
                    kv => kv.Name,
                    kv => _encryptionService.DecryptString(kv.Value));

                appSecretDto.Data = UpdateObjectProperties(appSecretDto.Data, decryptedMap);
            }

            // Prepare successful response
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

    // Validates and sanitizes credential data, encrypting sensitive information like API keys.
    private CredentialValidationResult ValidateData(string type, object data)
    {
        // Result object to hold encrypted value and sanitized JSON
        var validationResult = new CredentialValidationResult();
        var sanitizedDataJson = string.Empty;

        // JSON deserialization options (case-insensitive for property names)
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        // Serialize the input object to a JSON string
        var rawJson = System.Text.Json.JsonSerializer.Serialize(data, jsonOptions);

        // Switch statement based on the type of credential
        switch (type)
        {
            case nameof(AppSecretTypesEnum.OpenAI):
                {
                    // Deserialize JSON into OpenAICredentialsDto
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

            case nameof(AppSecretTypesEnum.AWS):
                {
                    // Deserialize JSON into AWSCredentialsDto
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

            case nameof(AppSecretTypesEnum.Twilio):
                {
                    // Deserialize JSON into TwilioCredentialsDto
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

            case nameof(AppSecretTypesEnum.SendGrid):
                {
                    // Deserialize JSON into SendGridCredentialsDto
                    var sendGridCredentials = System.Text.Json.JsonSerializer.Deserialize<SendGridCredentialsDto>(rawJson, jsonOptions);
                    if (sendGridCredentials != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(sendGridCredentials.ApiKey);
                        sendGridCredentials.ApiKey = string.Empty;
                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(sendGridCredentials, jsonOptions);
                    }
                    break;
                }

            case nameof(AppSecretTypesEnum.GitHub):
                {
                    var gitHubCredentials = System.Text.Json.JsonSerializer.Deserialize<GitHubCredentialsDto>(rawJson, jsonOptions);
                    if (gitHubCredentials != null)
                    {

                        validationResult.EncryptedValues["AccessToken"] = _encryptionService.EncryptString(gitHubCredentials.AccessToken);
                        gitHubCredentials.AccessToken = string.Empty;
                        gitHubCredentials.Server = string.Empty;
                        gitHubCredentials.User = string.Empty;

                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(gitHubCredentials, jsonOptions);
                    }
                    else
                    {
                        validationResult.Remark = "Invalid GitHub credentials: required fields missing or format incorrect.";
                    }
                    break;
                }

            case nameof(AppSecretTypesEnum.M365):
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

            case nameof(AppSecretTypesEnum.GeneralCredentials):
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

            case nameof(AppSecretTypesEnum.Anthropic):
                {
                    // Deserialize JSON into AnthropicCredentialsDto
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

            case nameof(AppSecretTypesEnum.GoogleGemini):
                {
                    // Deserialize JSON into GoogleGeminiCredentialsDto
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

            case nameof(AppSecretTypesEnum.GoogleWorkspace):
                {
                    // Deserialize JSON into GoogleWorkspaceCredentialsDto
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

            case nameof(AppSecretTypesEnum.AzureOpenAI):
                {
                    //Deserelize JSON Into AzureOpenAiCredentialsDto
                    var azureOpenAiCredentials = System.Text.Json.JsonSerializer.Deserialize<AzureOpenAiCredentialsDto>(rawJson, jsonOptions);
                    if (azureOpenAiCredentials != null)
                    {
                        validationResult.EncryptedValues["ApiKey"] = _encryptionService.EncryptString(azureOpenAiCredentials.ApiKey);
                        azureOpenAiCredentials.ApiKey = string.Empty;
                    }
                    else
                    {
                        validationResult.Remark = "Invalid Azure Open AI credentials: required fields missing or format incorrect.";
                    }
                    break;
                }

            case nameof(AppSecretTypesEnum.ElevenLabs):
                {
                    // Deserialize JSON into ElevenLabsCredentialsDto
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

            case nameof(AppSecretTypesEnum.OpenRouter):
                {
                    // Deserialize JSON into OpenRouterCredentialsDto
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

            case nameof(AppSecretTypesEnum.AzureStorage):
                {
                    // Deserialize JSON into AzureStorageCredentialsDto
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

            case nameof(AppSecretTypesEnum.AzureBlobStorage):
                {
                    // Deserialize JSON into AzureBlobStorageCredentialsDto
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

            case nameof(AppSecretTypesEnum.ConnectionString):
                {
                    // Deserialize incoming JSON into PostgreSQL DTO
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
            case nameof(AppSecretTypesEnum.Qdrant):
                {
                    // Deserialize incoming JSON into Qdrant DTO
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

            // Default case for unsupported credential types
            default:
                // Log an error for unsupported credential types and set an error remark
                _logger.LogError("Unsupported credential type: {CredentialType}", type);
                validationResult.Remark = $"Unsupported credential type: {type}";
                break;
        }

        // Assign the encrypted value and sanitized JSON to the validation result
        validationResult.SanitizedDataJson = sanitizedDataJson;

        // Return the result containing both the encrypted value, sanitized JSON, and remark
        return validationResult;
    }

    // Updates the properties of an object using a dictionary of key-value pairs, where the keys are property names and the values are their new values.
    private object UpdateObjectProperties(object data, Dictionary<string, string> updatedProperties)
    {
        // Convert the object to JSON string
        string jsonString = System.Text.Json.JsonSerializer.Serialize(data);

        // Parse the JSON into JsonNode
        var jsonObject = System.Text.Json.Nodes.JsonNode.Parse(jsonString)?.AsObject();
        if (jsonObject == null) return data;

        // Apply updates
        foreach (var kv in updatedProperties)
        {
            if (jsonObject.ContainsKey(kv.Key))
            {
                jsonObject[kv.Key] = kv.Value;
            }
            else
            {
                jsonObject.Add(kv.Key, kv.Value);
            }
        }

        // Deserialize the updated JSON back into an object
        var updatedObject = System.Text.Json.JsonSerializer.Deserialize<object>(jsonObject.ToJsonString());

        // Return the updated object, or original if deserialization failed
        return updatedObject ?? data;
    }
}
