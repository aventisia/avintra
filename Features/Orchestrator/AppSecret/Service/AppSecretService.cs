namespace WorkspaceAPIs.Services;

public class AppSecretService : IAppSecretService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AppSecretService> _logger;
    private readonly IStringEncryptionService _encryptionService;
    private readonly Guid _userId;

    public AppSecretService(
        IUnitOfWork unitOfWork,
        ILogger<AppSecretService> logger, IHttpContextAccessor
        httpContextAccessor,
        IStringEncryptionService encryptionService
    )
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _encryptionService = encryptionService;

        // Extract user ID from the HTTP context, if available
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Retrieve all app secrets
    public async Task<ServiceResponse<IEnumerable<AppSecretDto>>> GetAllAppSecretsAsync()
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<AppSecretDto>>
        {
            Data = null,
            Message = "Failed to fetch app secrets. Please try again later."
        };

        try
        {
            // Attempt to retrieve all app secrets from the repository
            var appSecrets = await _unitOfWork.AppSecretRepo
                .GetAllAsync()
                .OrderByDescending(w => w.CreatedOn)
                .Include(i => i.CreatedByUser)
                .ToListAsync();

            // Adapt the data to the DTO format and assign to service response
            serviceResponse.Data = appSecrets.Adapt<IEnumerable<AppSecretDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "App secrets fetched successfully.";

            // Log the number of app secrets fetched
            _logger.LogInformation("Successfully retrieved {Count} app secrets from the database.", appSecrets.Count);
        }
        catch (Exception ex)
        {
            // Log any error that occurs during the process
            _logger.LogError(ex, "Error occurred while fetching app secrets.");
        }

        // Return the service response (could be success or failure)
        return serviceResponse;
    }

    // Checks the availability of a app secret name.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsAppSecretNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check App secret name availability. Please try again."
        };

        try
        {
            // Trim and normalize the app secret name input
            var appSecretName = checkAvailabilityDto.UserInput?.Trim();

            if (string.IsNullOrWhiteSpace(appSecretName))
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "App secret name cannot be empty. Please provide a valid name.";
                return serviceResponse;
            }

            // Check if app secret with the same name exists (case-insensitive)
            var existingAppSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Name.ToLower() == appSecretName.ToLower())
                .SingleOrDefaultAsync();

            // App secret name already exists
            if (existingAppSecret != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = $"A app secret with the name '{appSecretName}' already exists. Please try a different name.";
                return serviceResponse;
            }

            // Name is available
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"The app secret name '{appSecretName}' is available.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while checking app secret name availability.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieve app secrets as selectable options (e.g., for a dropdown)
    public async Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetSelectableAppSecretOptionsAsync(AppSecretTypesEnum? type)
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>
        {
            Data = null,
            Message = "Failed to fetch app secret options. Please try again later."
        };

        try
        {
            // Attempt to fetch the selectable app secret options from the repository
            var options = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => !type.HasValue || w.Type == type)
                .ProjectToType<SelectOptionDto>()
                .ToListAsync();

            // Assign the options to the service response
            serviceResponse.Data = options;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "App secret options fetched successfully.";

            // Log the number of app secret options fetched
            _logger.LogInformation("Successfully fetched {Count} app secret(s) from the database.", options.Count);
        }
        catch (Exception ex)
        {
            // Log any error that occurs during the process
            _logger.LogError(ex, "Error occurred while fetching app secret options.");
        }

        // Return the service response (could be success or failure)
        return serviceResponse;
    }

    // Retrieve a specific app secret by its ID
    public async Task<ServiceResponse<AppSecretDto>> GetAppSecretByIdAsync(Guid appSecretId)
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<AppSecretDto>
        {
            Data = null,
            Message = "Unable to fetch the app secret. Please try again later."
        };

        try
        {
            // Log the request to fetch the app secret by ID
            _logger.LogInformation("Looking up app secret with ID: {AppSecretId}", appSecretId);

            // Attempt to retrieve the app secret by its ID
            var appSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Id == appSecretId)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            // If no app secret is found, log and return an appropriate message
            if (appSecret == null)
            {
                _logger.LogWarning("No app secret found with ID: {AppSecretId}", appSecretId);
                serviceResponse.Message = "App secret not found.";
                return serviceResponse;
            }

            // Adapt the entity to a DTO and assign to the service response
            serviceResponse.Data = appSecret.Adapt<AppSecretDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "App secret retrieved successfully.";

            // Log successful retrieval of app secret by ID
            _logger.LogInformation("Successfully fetched app secret with ID: {AppSecretId}", appSecretId);
        }
        catch (Exception ex)
        {
            // Log any error that occurs during the process
            _logger.LogError(ex, "An error occurred while fetching app secret with ID: {AppSecretId}", appSecretId);
        }

        // Return the service response (could be success or failure)
        return serviceResponse;
    }

    // Create a new app secret
    public async Task<ServiceResponse<AppSecretDto>> CreateAppSecretAsync(AppSecretDto appSecretDto)
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<AppSecretDto>
        {
            Data = null,
            Message = "Failed to create app secret. Please try again later."
        };

        try
        {
            // Log the start of the app secret creation process
            _logger.LogInformation("Initiating creation of app secret: {AppSecretName}", appSecretDto.Name);

            // Check if an app secret with the same name already exists
            var existingSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Name.ToLower() == appSecretDto.Name.ToLower())
                .SingleOrDefaultAsync();

            // If an existing secret is found, return a conflict response
            if (existingSecret != null)
            {
                _logger.LogWarning("App secret creation aborted. A secret named '{AppSecretName}' already exists.", appSecretDto.Name);
                serviceResponse.Message = $"An app secret named '{appSecretDto.Name}' already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Clean up input DTO (trim strings, remove extra spaces, etc.)
            appSecretDto = TrimDtoStringPropsUtil.TrimDtoStringProps(appSecretDto);

            // Validate the data, Pass the cleaned-up app secret data to the validation function
            var validateData = ValidateData(appSecretDto.Type, appSecretDto.Data);

            // Check if validation was successful, If the sanitized data is empty or invalid, return the service response with the validation remark
            if (string.IsNullOrEmpty(validateData.SanitizedDataJson))
            {
                serviceResponse.Message = validateData.Remark;
                return serviceResponse;
            }

            // Create a new AppSecret entity
            var newAppSecret = appSecretDto.Adapt<AppSecret>();
            newAppSecret.Data = validateData.SanitizedDataJson;
            newAppSecret.CreatedByUserId = _userId;
            newAppSecret.LastModifiedByUserId = _userId;

            // Insert the new app secret into the repository
            await _unitOfWork.AppSecretRepo.InsertAsync(newAppSecret);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save newly created app secret: {AppSecretName}", appSecretDto.Name);
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
                _logger.LogError("Failed to insert encrypted key-values for AppSecret ID: {AppSecretId}", appSecretDto.Id);
                return serviceResponse;
            }

            // Adapt the entity to DTO and return success response
            serviceResponse.Data = newAppSecret.Adapt<AppSecretDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "App secret created successfully.";

            // Log successful creation of the app secret
            _logger.LogInformation("App secret created successfully with ID: {AppSecretId}", newAppSecret.Id);
        }
        catch (Exception ex)
        {
            // Log any unexpected errors during app secret creation
            _logger.LogError(ex, "An unexpected error occurred while creating app secret: {AppSecretName}", appSecretDto.Name);
        }

        // Return the service response (could be success or failure)
        return serviceResponse;
    }

    // Update an existing app secret
    public async Task<ServiceResponse<AppSecretDto>> UpdateAppSecretAsync(AppSecretDto appSecretDto)
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<AppSecretDto>
        {
            Data = null,
            Message = "Failed to update app secret. Please try again later."
        };

        try
        {
            // Log the attempt to update the app secret
            _logger.LogInformation("Attempting to update app secret with ID: {AppSecretId}", appSecretDto.Id);

            // Attempt to retrieve the app secret by ID
            var existingAppSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Id == appSecretDto.Id)
                .Include(i => i.EncryptedKeyValues)
                .SingleOrDefaultAsync();

            // If the app secret doesn't exist, return an error message
            if (existingAppSecret == null)
            {
                _logger.LogWarning("Update failed. No app secret found with ID: {AppSecretId}", appSecretDto.Id);
                serviceResponse.Message = "App secret not found.";
                return serviceResponse;
            }

            // Check for a duplicate secret by name
            var duplicateSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Name.ToLower() == appSecretDto.Name.ToLower() && w.Id != appSecretDto.Id)
                .SingleOrDefaultAsync();

            // If a duplicate exists, return a conflict message
            if (duplicateSecret != null)
            {
                _logger.LogWarning("Update failed. App secret with name '{AppSecretName}' already exists.", appSecretDto.Name);
                serviceResponse.Message = $"An app secret with the name '{appSecretDto.Name}' already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Clean up input DTO (trim strings, remove extra spaces, etc.)
            appSecretDto = TrimDtoStringPropsUtil.TrimDtoStringProps(appSecretDto);

            // Validate the data, Pass the cleaned-up app secret data to the validation function
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

            // Update the app secret in the repository
            _unitOfWork.AppSecretRepo.Update(existingAppSecret);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save updated app secret: {AppSecretId}", appSecretDto.Id);
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
                    _logger.LogError("Failed to update encrypted key-values for AppSecret ID: {AppSecretId}", appSecretDto.Id);
                    return serviceResponse;
                }
            }

            // Return success response
            serviceResponse.Data = existingAppSecret.Adapt<AppSecretDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "App secret updated successfully.";

            // Log successful update of the app secret
            _logger.LogInformation("App secret with ID: {AppSecretId} successfully updated.", appSecretDto.Id);
        }
        catch (Exception ex)
        {
            // Log any unexpected errors during the update
            _logger.LogError(ex, "Error occurred while updating app secret with ID: {AppSecretId}", appSecretDto.Id);
        }

        // Return the service response (could be success or failure)
        return serviceResponse;
    }

    // Delete a single app secret by ID
    public async Task<ServiceResponse<bool>> DeleteAppSecretAsync(Guid appSecretId)
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete app secret. Please try again later."
        };

        try
        {
            // Log the start of the app secret deletion process
            _logger.LogInformation("Initiating deletion of app secret with ID: {AppSecretId}", appSecretId);

            // Attempt to retrieve the app secret by ID
            var appSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Id == appSecretId)
                .SingleOrDefaultAsync();

            // If no app secret is found, return an error message
            if (appSecret == null)
            {
                _logger.LogWarning("No app secret found with ID: {AppSecretId}", appSecretId);
                serviceResponse.Message = "App secret not found.";
                return serviceResponse;
            }

            // Delete the app secret from the repository
            _unitOfWork.AppSecretRepo.Delete(appSecret);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to delete app secret with ID: {AppSecretId} due to database save error.", appSecretId);
                return serviceResponse;
            }

            // Return success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "App secret deleted successfully.";

            // Log successful deletion
            _logger.LogInformation("App secret with ID: {AppSecretId} successfully deleted.", appSecretId);
        }
        catch (Exception ex)
        {
            // Log any unexpected errors during the deletion
            _logger.LogError(ex, "Unexpected error while deleting app secret with ID: {AppSecretId}", appSecretId);
        }

        // Return the service response (could be success or failure)
        return serviceResponse;
    }

    // Delete multiple app secrets by their IDs
    public async Task<ServiceResponse<bool>> DeleteAppSecretsAsync(List<Guid> appSecretIds)
    {
        // Initialize service response with default failure message
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete app secrets. Please try again later."
        };

        try
        {
            // Log the initiation of bulk deletion
            _logger.LogInformation("Initiating bulk deletion for {Count} app secret(s).", appSecretIds.Count);

            // Attempt to retrieve the app secrets by their IDs
            var appSecrets = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => appSecretIds.Contains(w.Id))
                .ToListAsync();

            // If no app secrets are found, return an error message
            if (appSecrets == null || appSecrets.Count == 0)
            {
                _logger.LogWarning("No app secrets found for deletion.");
                serviceResponse.Message = "No app secrets found to delete.";
                return serviceResponse;
            }

            // Delete the app secrets from the repository
            _unitOfWork.AppSecretRepo.Delete(appSecrets);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to commit bulk deletion of app secrets.");
                return serviceResponse;
            }

            // Return success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "App secrets deleted successfully.";

            // Log successful bulk deletion
            _logger.LogInformation("Successfully deleted {Count} app secret(s).", appSecrets.Count);
        }
        catch (Exception ex)
        {
            // Log any unexpected errors during the bulk deletion
            _logger.LogError(ex, "Unexpected error while bulk deleting app secrets.");
        }

        // Return the service response (could be success or failure)
        return serviceResponse;
    }
    // Retrieves the details of a specific App Secret, including decrypted key-value data.
    public async Task<ServiceResponse<AppSecretDto>> GetAppSecretDetailAsync(Guid appSecretId)
    {
        // Prepare default response in case of failure
        var serviceResponse = new ServiceResponse<AppSecretDto>
        {
            Data = null,
            Message = "Unable to load app secret. Please try again later.",
        };

        try
        {
            // Fetch the AppSecret entity along with its encrypted key-value pairs
            var appSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Id == appSecretId)
                .AsNoTracking()
                .Include(i => i.EncryptedKeyValues)
                .SingleOrDefaultAsync();

            if (appSecret == null)
            {
                _logger.LogWarning("No AppSecret found with ID: {AppSecretId}", appSecretId);
                serviceResponse.Message = "App secret not found.";
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
            serviceResponse.Message = "App secret retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving AppSecret with ID: {AppSecretId}", appSecretId);
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
            case nameof(AppSecretTypesEnum.OpenAiApi):
                {
                    // Deserialize JSON into OpenAiApiCredentialsDto
                    var openAiCredentials = System.Text.Json.JsonSerializer.Deserialize<OpenAiApiCredentialsDto>(rawJson, jsonOptions);
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

            case nameof(AppSecretTypesEnum.Aws):
                {
                    // Deserialize JSON into AwsCredentialsDto
                    var awsCredentials = System.Text.Json.JsonSerializer.Deserialize<AwsCredentialsDto>(rawJson, jsonOptions);
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

            case nameof(AppSecretTypesEnum.TwilioApi):
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

            case nameof(AppSecretTypesEnum.SendGridApi):
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
                  case nameof(AppSecretTypesEnum.GitHubApi):
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

                 case nameof(AppSecretTypesEnum.GeneralCredentialApi):
                {
                    var generalCredential = System.Text.Json.JsonSerializer.Deserialize<GeneralCredentialsDto>(rawJson, jsonOptions);
                    if(generalCredential!= null)
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


                 case nameof(AppSecretTypesEnum.OneDriveCredentialApi):
                {
                    var oneDriveCredentials = System.Text.Json.JsonSerializer.Deserialize<OneDriveCredentialsDto>(rawJson, jsonOptions);
                    if(oneDriveCredentials!= null)
                    {
                        validationResult.EncryptedValues["ClientSecret"] = _encryptionService.EncryptString(oneDriveCredentials.ClientSecret);
                       
                        oneDriveCredentials.OAuthRedirectURL = string.Empty;
                        oneDriveCredentials.AuthorizationURL = string.Empty;
                        oneDriveCredentials.AccessTokenURL = string.Empty;
                        oneDriveCredentials.ClientID = string.Empty;

                        sanitizedDataJson = System.Text.Json.JsonSerializer.Serialize(oneDriveCredentials, jsonOptions);
                    }
                     else
                    {
                        validationResult.Remark = "Invalid General credentials: required fields missing or format incorrect.";
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
