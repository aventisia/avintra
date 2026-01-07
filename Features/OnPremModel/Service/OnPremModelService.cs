namespace WorkspaceAPIs.Services;

public class OnPremModelService : IOnPremModelService
{
    private readonly ILogger<OnPremModelService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    // Constructor for dependency injection.
    public OnPremModelService(
        ILogger<OnPremModelService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;

        // Initialize the user ID by extracting it from the JWT claims in the HTTP context.
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Method to check if the on-prem model name is available.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsOnPremModelNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check on-prem model name availability. Please try again."
        };

        try
        {
            // Validation of model name: Ensure it starts with a letter or underscore and contains no spaces or special characters.
            if (string.IsNullOrEmpty(checkAvailabilityDto.UserInput))
            {
                _logger.LogError("Invalid on-prem model name: '{ModelName}'. The name must start with a letter or underscore and cannot contain spaces or symbols.", checkAvailabilityDto.UserInput);
                serviceResponse.Message = $"The name '{checkAvailabilityDto.UserInput}' is invalid. Please use a valid name.";
                return serviceResponse;
            }

            // Query to check if a model with the same name already exists in the database.
            var existingOnPremModel = await _unitOfWork.OnPremModelRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower()
                )
                .FirstOrDefaultAsync();

            // If the model already exists, return false indicating the name is not available.
            if (existingOnPremModel != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "An on-prem model with the same name already exists. Please enter a unique name.";
                _logger.LogWarning("Model name '{ModelName}' is not available. Already exists for user {UserId}.", checkAvailabilityDto.UserInput, _userId);
                return serviceResponse;
            }

            // If no model exists with the given name, return true indicating the name is available.
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "On-prem model name is available.";
            _logger.LogInformation("Model name '{ModelName}' is available for user {UserId}.", checkAvailabilityDto.UserInput, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while checking availability for model name '{ModelName}' for user {UserId}.", checkAvailabilityDto.UserInput, _userId);
        }

        return serviceResponse;
    }

    // Method to retrieve all on-prem models.
    public async Task<ServiceResponse<IEnumerable<OnPremModelDto>>> GetAllOnPremModelsAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<OnPremModelDto>>
        {
            Data = null,
            Message = "Failed to retrieve on-prem models. Please try again later."
        };

        try
        {
            // Query to fetch on-prem models created by the current user, ordered by creation date.
            var onPremModels = await _unitOfWork.OnPremModelRepo
                .GetByConditionAsync(w => w.CreatedByUserId == _userId)
                .AsNoTracking()
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderBy(o => o.CreatedOn)
                .ToListAsync();

            // Map the models to the DTOs for return.
            serviceResponse.Data = onPremModels.Adapt<IEnumerable<OnPremModelDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "On-prem models retrieved successfully.";

            _logger.LogInformation("Successfully retrieved {ModelCount} on-prem models for user {UserId}.", onPremModels.Count, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching on-prem models for user {UserId}.", _userId);
        }

        return serviceResponse;
    }

    // Method to retrieve a specific on-prem model by its ID.
    public async Task<ServiceResponse<OnPremModelDto>> GetOnPremModelAsync(Guid onPremModelId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<OnPremModelDto>
        {
            Data = null,
            Message = "Failed to retrieve on-prem model. Please try again later."
        };

        try
        {
            // Query to find a model by its ID, including related user data.
            var onPremModel = await _unitOfWork.OnPremModelRepo
                .GetByConditionAsync(w => w.Id == onPremModelId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .SingleOrDefaultAsync();

            if (onPremModel == null)
            {
                _logger.LogWarning("On-prem model with ID {OnPremModelId} not found.", onPremModelId);
                serviceResponse.Message = "On-prem model not found.";
                return serviceResponse;
            }

            // Convert the model to DTO and return the response.
            serviceResponse.Data = onPremModel.Adapt<OnPremModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "On-prem model retrieved successfully.";

            _logger.LogInformation("Successfully retrieved on-prem model with ID {OnPremModelId}.", onPremModelId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching on-prem model with ID {OnPremModelId}.", onPremModelId);
        }

        return serviceResponse;
    }

    // Method to retrieve a specific on-prem model by its name.
    public async Task<ServiceResponse<OnPremModelDto>> GetOnPremModelByNameAsync(string onPremModelName)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<OnPremModelDto>
        {
            Data = null,
            Message = "Failed to retrieve on-prem model. Please try again later."
        };

        try
        {
            // Check if the model name is provided.
            if (string.IsNullOrWhiteSpace(onPremModelName))
            {
                _logger.LogWarning("On-prem model search failed: The model name is empty or contains only whitespace.");
                serviceResponse.Message = "On-prem model name cannot be empty or whitespace.";
                return serviceResponse;
            }

            // Query to retrieve the on-prem model based on its name.
            var onPremModel = await _unitOfWork.OnPremModelRepo
                .GetByConditionAsync(w => w.Name.ToLower() == onPremModelName.ToLower())
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .FirstOrDefaultAsync();

            // If no model is found, return a not found message.
            if (onPremModel == null)
            {
                _logger.LogWarning("On-prem model with name '{OnPremModelName}' not found.", onPremModelName);
                serviceResponse.Message = "On-prem model not found.";
                return serviceResponse;
            }

            // Convert the model entity to a DTO.
            serviceResponse.Data = onPremModel.Adapt<OnPremModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "On-prem model retrieved successfully.";

            // Log success for the retrieval.
            _logger.LogInformation("Successfully retrieved on-prem model with name '{OnPremModelName}'.", onPremModelName);
        }
        catch (Exception ex)
        {
            // Log the error if an exception occurs during the retrieval process.
            _logger.LogError(ex, "An error occurred while retrieving on-prem model with name '{OnPremModelName}'.", onPremModelName);
        }

        return serviceResponse;
    }

    // Method to insert a new on-prem model.
    public async Task<ServiceResponse<OnPremModelDto>> InsertOnPremModelAsync(OnPremModelDto onPremModelDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<OnPremModelDto>
        {
            Data = null,
            Message = "Failed to insert on-prem model. Please try again."
        };

        try
        {
            // Check if a model with the same name already exists.
            var existingModel = await _unitOfWork.OnPremModelRepo
                .GetByConditionAsync(w => w.Name.ToLower() == onPremModelDto.Name.ToLower())
                .FirstOrDefaultAsync();

            if (existingModel != null)
            {
                _logger.LogWarning("Duplicate model name '{ModelName}' attempted for insertion.", onPremModelDto.Name);
                serviceResponse.Message = "An on-prem model with the same name already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Trim any leading/trailing spaces from the DTO properties.
            onPremModelDto = TrimDtoStringPropsUtil.TrimDtoStringProps(onPremModelDto);

            // Create a new on-prem model from the DTO and assign user IDs for tracking.
            var newOnPremModel = onPremModelDto.Adapt<OnPremModel>();
            newOnPremModel.CreatedByUserId = _userId;
            newOnPremModel.LastModifiedByUserId = _userId;

            // Insert the new model into the database.
            await _unitOfWork.OnPremModelRepo.InsertAsync(newOnPremModel);

            // Save changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes when inserting on-prem model with name '{ModelName}'", onPremModelDto.Name);
                return serviceResponse;
            }

            // Log the start of the provider-specific model operation. The message adapts to the current model status (Download / Install / Uninstall).
            _logger.LogInformation(
                "Starting model operation. Status: {Status}, ProviderType: {ProviderType}, Model: {ModelName}, ProviderUrl: {ProviderUrl}",
                newOnPremModel.Status,
                newOnPremModel.ProviderType,
                newOnPremModel.ModelName,
                newOnPremModel.ProviderUrl);

            // Execute the provider-specific model operation (pull or delete) based on the current model status.
            var isSuccessful = await HandleModelAsync(
                newOnPremModel.ProviderType,
                newOnPremModel.ProviderUrl,
                newOnPremModel.ModelName,
                newOnPremModel.Status,
                CancellationToken.None);

            // Validate the outcome of the provider operation.
            if (!isSuccessful)
            {
                // Log failure with full operational context for troubleshooting.
                _logger.LogError(
                    "Model operation failed. Status: {Status}, ProviderType: {ProviderType}, Model: {ModelName}, ProviderUrl: {ProviderUrl}",
                    newOnPremModel.Status,
                    newOnPremModel.ProviderType,
                    newOnPremModel.ModelName,
                    newOnPremModel.ProviderUrl);

                // Optional follow-up actions:
                // - Update model status to Failed
                // - Persist error details
                // - Trigger retry or backoff logic
                // - Raise alert / notification
            }
            else
            {
                // Log successful completion of the provider operation.
                _logger.LogInformation(
                    "Model operation completed successfully. Status: {Status}, ProviderType: {ProviderType}, Model: {ModelName}, ProviderUrl: {ProviderUrl}",
                    newOnPremModel.Status,
                    newOnPremModel.ProviderType,
                    newOnPremModel.ModelName,
                    newOnPremModel.ProviderUrl);

                // Optional follow-up actions:
                // - Transition model status (e.g., Downloading → Installed)
                // - Persist completion timestamp
                // - Emit domain event
            }

            // Map the inserted model to DTO for response.
            serviceResponse.Data = newOnPremModel.Adapt<OnPremModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "On-prem model inserted successfully.";

            _logger.LogInformation("Successfully inserted new on-prem model with name '{ModelName}' for user {UserId}.", onPremModelDto.Name, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while inserting on-prem model with name '{ModelName}'.", onPremModelDto.Name);
        }

        return serviceResponse;
    }

    // Method to update an existing on-prem model.
    public async Task<ServiceResponse<OnPremModelDto>> UpdateOnPremModelAsync(OnPremModelDto onPremModelDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<OnPremModelDto>
        {
            Data = null,
            Message = "Failed to update on-prem model. Please try again."
        };

        try
        {
            // Query to check if the model exists in the database.
            var existingOnPremModel = await _unitOfWork.OnPremModelRepo
                .GetByConditionAsync(w => w.Id == onPremModelDto.Id)
                .SingleOrDefaultAsync();

            if (existingOnPremModel == null)
            {
                _logger.LogWarning("On-prem model with ID {OnPremModelId} not found for update.", onPremModelDto.Id);
                serviceResponse.Message = "On-prem model not found.";
                return serviceResponse;
            }

            // Check for duplicate names if the name is changed.
            var duplicateOnPremModel = await _unitOfWork.OnPremModelRepo
                .GetByConditionAsync(w =>
                    w.Id != onPremModelDto.Id &&
                    w.Name.ToLower() == onPremModelDto.Name.ToLower())
                .FirstOrDefaultAsync();

            if (duplicateOnPremModel != null)
            {
                _logger.LogWarning("Attempt to update on-prem model with duplicate name '{ModelName}'.", onPremModelDto.Name);
                serviceResponse.Message = "An on-prem model with the same name already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Trim and update the properties of the existing model.
            onPremModelDto = TrimDtoStringPropsUtil.TrimDtoStringProps(onPremModelDto);
            onPremModelDto.Adapt(existingOnPremModel);
            existingOnPremModel.LastModifiedByUserId = _userId;
            existingOnPremModel.LastModifiedOn = DateTimeOffset.UtcNow;

            _unitOfWork.OnPremModelRepo.Update(existingOnPremModel);

            // Save the changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes when updating on-prem model with ID {OnPremModelId}.", onPremModelDto.Id);
                return serviceResponse;
            }

            // Log the start of the provider-specific model operation. The message adapts to the current model status (Download / Install / Uninstall).
            _logger.LogInformation(
                "Starting model operation. Status: {Status}, ProviderType: {ProviderType}, Model: {ModelName}, ProviderUrl: {ProviderUrl}",
                existingOnPremModel.Status,
                existingOnPremModel.ProviderType,
                existingOnPremModel.ModelName,
                existingOnPremModel.ProviderUrl);

            // Execute the provider-specific model operation (pull or delete) based on the current model status.
            var isSuccessful = await HandleModelAsync(
                existingOnPremModel.ProviderType,
                existingOnPremModel.ProviderUrl,
                existingOnPremModel.ModelName,
                existingOnPremModel.Status,
                CancellationToken.None);

            // Validate the outcome of the provider operation.
            if (!isSuccessful)
            {
                // Log failure with full operational context for troubleshooting.
                _logger.LogError(
                    "Model operation failed. Status: {Status}, ProviderType: {ProviderType}, Model: {ModelName}, ProviderUrl: {ProviderUrl}",
                    existingOnPremModel.Status,
                    existingOnPremModel.ProviderType,
                    existingOnPremModel.ModelName,
                    existingOnPremModel.ProviderUrl);

                // Optional follow-up actions:
                // - Update model status to Failed
                // - Persist error details
                // - Trigger retry or backoff logic
                // - Raise alert / notification
            }
            else
            {
                // Log successful completion of the provider operation.
                _logger.LogInformation(
                    "Model operation completed successfully. Status: {Status}, ProviderType: {ProviderType}, Model: {ModelName}, ProviderUrl: {ProviderUrl}",
                    existingOnPremModel.Status,
                    existingOnPremModel.ProviderType,
                    existingOnPremModel.ModelName,
                    existingOnPremModel.ProviderUrl);

                // Optional follow-up actions:
                // - Transition model status (e.g., Downloading → Installed)
                // - Persist completion timestamp
                // - Emit domain event
            }

            // Return the updated model.
            serviceResponse.Data = existingOnPremModel.Adapt<OnPremModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "On-prem model updated successfully.";

            _logger.LogInformation("Successfully updated on-prem model with ID {OnPremModelId} for user {UserId}.", onPremModelDto.Id, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating on-prem model with ID {OnPremModelId}.", onPremModelDto.Id);
        }

        return serviceResponse;
    }

    // Method to delete an on-prem model by ID.
    public async Task<ServiceResponse<bool>> DeleteOnPremModelAsync(Guid OnPremModelId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete on-prem model. Please try again."
        };

        try
        {
            // Query to find the model by ID.
            var existingOnPremModel = await _unitOfWork.OnPremModelRepo
                .GetByConditionAsync(w => w.Id == OnPremModelId)
                .SingleOrDefaultAsync();

            if (existingOnPremModel == null)
            {
                _logger.LogWarning("On-prem model with ID {OnPremModelId} not found for deletion.", OnPremModelId);
                serviceResponse.Message = "On-prem model not found.";
                return serviceResponse;
            }
            // Log the start of the provider-specific uninstall operation.
            _logger.LogInformation(
                "Starting model uninstall operation. ProviderType: {ProviderType}, Model: {ModelName}, ProviderUrl: {ProviderUrl}",
                existingOnPremModel.ProviderType,
                existingOnPremModel.ModelName,
                existingOnPremModel.ProviderUrl);

            // Execute the provider-specific uninstall operation (delete).
            var isSuccessful = await HandleModelAsync(
                existingOnPremModel.ProviderType,
                existingOnPremModel.ProviderUrl,
                existingOnPremModel.ModelName,
                OnPremModelStatusEnum.Uninstalled,
                CancellationToken.None);

            // Validate the outcome of the uninstall operation.
            if (!isSuccessful)
            {
                _logger.LogError(
                    "Model uninstall failed. ProviderType: {ProviderType}, Model: {ModelName}, ProviderUrl: {ProviderUrl}",
                    existingOnPremModel.ProviderType,
                    existingOnPremModel.ModelName,
                    existingOnPremModel.ProviderUrl);

                // Optional follow-up actions:
                // - Update model status to Failed
                // - Persist failure reason in database
                // - Trigger retry or alert
            }
            else
            {
                // Log successful completion of the uninstall operation.
                _logger.LogInformation(
                    "Model uninstall completed successfully. ProviderType: {ProviderType}, Model: {ModelName}, ProviderUrl: {ProviderUrl}",
                    existingOnPremModel.ProviderType,
                    existingOnPremModel.ModelName,
                    existingOnPremModel.ProviderUrl);

                // Optional follow-up actions:
                // - Update model status to Uninstalled
                // - Persist completion timestamp
                // - Emit domain event or notification
            }

            // Delete the model from the database.
            _unitOfWork.OnPremModelRepo.Delete(existingOnPremModel);

            // Save the changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete on-prem model with ID {OnPremModelId}. SaveChanges failed.", OnPremModelId);
                return serviceResponse;
            }

            // Return success.
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "On-prem model deleted successfully.";

            _logger.LogInformation("Successfully deleted on-prem model with ID {OnPremModelId} for user {UserId}.", OnPremModelId, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting on-prem model with ID {OnPremModelId}.", OnPremModelId);
        }

        return serviceResponse;
    }

    // Method to delete multiple on-prem models by their IDs.
    public async Task<ServiceResponse<bool>> DeleteMultipleOnPremModelsAsync(IEnumerable<Guid> OnPremModelIds)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete on-prem models. Please try again."
        };

        try
        {
            // Query to find all models by the given IDs.
            var modelsToDelete = await _unitOfWork.OnPremModelRepo
                .GetByConditionAsync(w => OnPremModelIds.Contains(w.Id))
                .AsNoTracking()
                .ToListAsync();

            if (modelsToDelete == null || !modelsToDelete.Any())
            {
                _logger.LogWarning("No on-prem models found for deletion for user {UserId} with model IDs {OnPremModelIds}.", _userId, string.Join(", ", OnPremModelIds));
                serviceResponse.Message = "No on-prem models found for deletion.";
                return serviceResponse;
            }

            foreach (var existingOnPremModel in modelsToDelete)
            {
                // Log the start of the provider-specific uninstall operation.
                _logger.LogInformation(
                    "Starting model uninstall operation. ProviderType: {ProviderType}, Model: {ModelName}, ProviderUrl: {ProviderUrl}",
                    existingOnPremModel.ProviderType,
                    existingOnPremModel.ModelName,
                    existingOnPremModel.ProviderUrl);

                // Execute the provider-specific uninstall operation (delete).
                var isSuccessful = await HandleModelAsync(
                    existingOnPremModel.ProviderType,
                    existingOnPremModel.ProviderUrl,
                    existingOnPremModel.ModelName,
                    OnPremModelStatusEnum.Uninstalled,
                    CancellationToken.None);

                // Validate the outcome of the uninstall operation.
                if (!isSuccessful)
                {
                    _logger.LogError(
                        "Model uninstall failed. ProviderType: {ProviderType}, Model: {ModelName}, ProviderUrl: {ProviderUrl}",
                        existingOnPremModel.ProviderType,
                        existingOnPremModel.ModelName,
                        existingOnPremModel.ProviderUrl);

                    // Optional follow-up actions:
                    // - Update model status to Failed
                    // - Persist failure reason in database
                    // - Trigger retry or alert
                }
                else
                {
                    _logger.LogInformation(
                        "Model uninstall completed successfully. ProviderType: {ProviderType}, Model: {ModelName}, ProviderUrl: {ProviderUrl}",
                        existingOnPremModel.ProviderType,
                        existingOnPremModel.ModelName,
                        existingOnPremModel.ProviderUrl);

                    // Optional follow-up actions:
                    // - Update model status to Uninstalled
                    // - Persist completion timestamp
                    // - Emit domain event or notification
                }

            }

            // Delete the models from the database.
            _unitOfWork.OnPremModelRepo.Delete(modelsToDelete);

            // Save the changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete models for user {UserId} with model IDs {OnPremModelIds}. SaveChanges failed.", _userId, string.Join(", ", OnPremModelIds));
                return serviceResponse;
            }

            // Return success.
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"Successfully deleted {modelsToDelete.Count} on-prem models.";

            _logger.LogInformation("Successfully deleted {ModelCount} on-prem models for user {UserId} with model IDs {OnPremModelIds}.", modelsToDelete.Count, _userId, string.Join(", ", OnPremModelIds));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting multiple on-prem models for user {UserId} with model IDs {OnPremModelIds}.", _userId, string.Join(", ", OnPremModelIds));
        }

        return serviceResponse;
    }

    // Method to search for on-prem models by name.
    public async Task<ServiceResponse<IEnumerable<OnPremModelDto>>> SearchOnPremModelsByNameAsync(string modelName)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<OnPremModelDto>>
        {
            Data = null,
            Message = "Failed to search on-prem models. Please try again."
        };

        try
        {
            // Validate that the search term is not empty or whitespace.
            if (string.IsNullOrWhiteSpace(modelName))
            {
                _logger.LogWarning("Search term is empty or contains only whitespace.");
                serviceResponse.Message = "Search keyword cannot be empty or whitespace.";
                return serviceResponse;
            }

            // Query to search for models whose name contains the search term.
            var matchedOnPremModels = await _unitOfWork.OnPremModelRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower().Contains(modelName.Trim().ToLower()) ||
                    w.ModelName.ToLower().Contains(modelName.Trim().ToLower())
                )
                .ToListAsync();

            // If no models are found, return a message.
            if (matchedOnPremModels == null || !matchedOnPremModels.Any())
            {
                _logger.LogInformation("No on-prem models found for search term '{ModelName}' for user {UserId}.", modelName, _userId);
                serviceResponse.Message = "No on-prem models found matching the search term.";
                return serviceResponse;
            }

            // Map the matched models to DTOs and return.
            serviceResponse.Data = matchedOnPremModels.Adapt<IEnumerable<OnPremModelDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{matchedOnPremModels.Count} on-prem model(s) found matching the search term '{modelName}'.";

            _logger.LogInformation("{Count} on-prem model(s) found for search term '{ModelName}' for user {UserId}.", matchedOnPremModels.Count, modelName, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while searching for on-prem models with search term '{ModelName}' for user {UserId}.", modelName, _userId);
        }

        return serviceResponse;
    }

    // Entry point for handling on-prem model lifecycle operations. Decides which provider-specific handler should be executed based on the provided provider type.
    public async Task<bool> HandleModelAsync(OnPremModelProviderEnum providerType, string providerUrl, string modelName, OnPremModelStatusEnum onPremModelStatus, CancellationToken cancellationToken = default)
    {
        // Log the start of the operation with all contextual information
        _logger.LogInformation("Starting model operation. ProviderType: {ProviderType}, Model: {Model}, TargetStatus: {Status}, ProviderUrl: {Url}", providerType, modelName, onPremModelStatus, providerUrl);

        // Select the correct provider handler based on provider type
        return providerType switch
        {
            // Currently only Ollama is supported
            OnPremModelProviderEnum.Ollama => await HandleOllamaAsync(providerUrl, modelName, onPremModelStatus, cancellationToken),

            // Fail fast if an unsupported provider type is passed
            _ => throw new NotSupportedException($"Provider '{providerType}' is not supported.")
        };
    }

    // Handles model install/uninstall operations specifically for the Ollama provider. Maps internal model statuses to Ollama HTTP API endpoints.
    private async Task<bool> HandleOllamaAsync(string providerUrl, string modelName, OnPremModelStatusEnum providerStatus, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogDebug("Ollama handler invoked. Model: {Model}, Status: {Status}, Url: {Url}", modelName, providerStatus, providerUrl);

            // Create HttpClient scoped to this operation and BaseAddress allows relative endpoints to be used later
            using var httpClient = new HttpClient
            {
                BaseAddress = new Uri(providerUrl)
            };

            // Declare variables that will be assigned based on the requested model status
            string endpoint;
            object payload;

            // Decide which Ollama API endpoint and payload to use based on the requested model status
            switch (providerStatus)
            {
                // Downloading and Installed both map to Ollama's pull operation
                case OnPremModelStatusEnum.Downloading:
                case OnPremModelStatusEnum.Installed:
                    endpoint = "/api/pull";
                    payload = new { name = modelName, stream = true };

                    _logger.LogInformation("Initiating Ollama model pull. Model: {Model}, Endpoint: {Endpoint}", modelName, endpoint);
                    break;

                // Uninstalled maps to Ollama's delete operation
                case OnPremModelStatusEnum.Uninstalled:
                    endpoint = "/api/delete";
                    payload = new { name = modelName };

                    _logger.LogInformation("Initiating Ollama model deletion. Model: {Model}, Endpoint: {Endpoint}", modelName, endpoint);
                    break;

                // Guard clause for unexpected enum values
                default:
                    _logger.LogWarning("Invalid model status received for Ollama. Model: {Model}, Status: {Status}", modelName, providerStatus);
                    throw new ArgumentOutOfRangeException(nameof(providerStatus));
            }

            // Execute the HTTP POST request against Ollama
            var response = await httpClient.PostAsJsonAsync(endpoint, payload, cancellationToken);

            // Check whether the HTTP request was successful
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Ollama operation succeeded. Model: {Model}, Status: {Status}, HttpStatus: {HttpStatus}", modelName, providerStatus, response.StatusCode);
                return true;
            }

            // Read error content returned by Ollama for troubleshooting
            var error = await response.Content.ReadAsStringAsync(cancellationToken);

            _logger.LogError("Ollama operation failed. Model: {Model}, Status: {Status}, HttpStatus: {HttpStatus}, Response: {Response}", modelName, providerStatus, response.StatusCode, error);
            return false;
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Ollama operation was cancelled. Model: {Model}, Status: {Status}", modelName, providerStatus);

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during Ollama operation. Model: {Model}, Status: {Status}, Url: {Url}", modelName, providerStatus, providerUrl);
            return false;
        }
    }
}