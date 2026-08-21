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
                .GetAllAsync()
                .AsNoTracking()
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderBy(o => o.CreatedOn)
                .ProjectToType<OnPremModelDto>()
                .ToListAsync();

            // Loop through on-prem models grouped by provider type
            foreach (var onPremModel in onPremModels.GroupBy(g => g.ProviderType).ToList())
            {
                // Check if the provider type is 'Ollama' to filter relevant models
                if (onPremModel.Key == OnPremModelProviderEnum.Ollama)
                {
                    // Fetch the list of models from Ollama asynchronously based on the provider URL
                    var ollamaModels = new List<OllamaModelDto>();

                    // Loop through each on-prem model in the current group
                    foreach (var modelDto in onPremModel)
                    {
                        if (ollamaModels.Count == 0)
                            ollamaModels = await GetOllamaModelsAsync(modelDto.ProviderUrl, CancellationToken.None);

                        // Attempt to find a matching Ollama model by comparing model names (case-insensitive)
                        var ollamaModel = ollamaModels.FirstOrDefault(w => w.Name.Equals(modelDto.ModelName, StringComparison.InvariantCultureIgnoreCase));

                        // If no match is found (i.e., the model is not present in Ollama), set the status to 'Uninstalled'
                        if (ollamaModel == null)
                            modelDto.Status = OnPremModelStatusEnum.Uninstalled;
                        else
                            // If a match is found, also set the status to 'Installed' (currently both conditions have the same action)
                            modelDto.Status = OnPremModelStatusEnum.Installed;
                    }
                }
            }

            // Map the models to the DTOs for return.
            serviceResponse.Data = onPremModels;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "On-prem models retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching on-prem models for user {UserId}.", _userId);
        }

        return serviceResponse;
    }

    // Retrieves the list of models available from an Ollama provider at the given base URL.
    public async Task<ServiceResponse<IEnumerable<OllamaModelDto>>> GetOllamaModelsAsync(string providerUrl)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<OllamaModelDto>>
        {
            Data = null,
            Message = "Failed to retrieve Ollama models. Please try again later."
        };

        try
        {
            var ollamaModels = await GetOllamaModelsAsync(providerUrl, CancellationToken.None);

            serviceResponse.Data = ollamaModels;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Ollama models retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving Ollama models for user {UserId}.", _userId);
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

            // Check if the provider type is 'Ollama' to filter relevant models
            if (onPremModel.ProviderType == OnPremModelProviderEnum.Ollama)
            {
                // Fetch the list of models from Ollama asynchronously based on the provider URL
                var ollamaModels = await GetOllamaModelsAsync(onPremModel.ProviderUrl, CancellationToken.None);

                // Attempt to find a matching Ollama model by comparing model names (case-insensitive)
                var ollamaModel = ollamaModels.FirstOrDefault(w => w.Name.Equals(onPremModel.ModelName, StringComparison.InvariantCultureIgnoreCase));

                // If no match is found (i.e., the model is not present in Ollama), set the status to 'Uninstalled'
                if (ollamaModel == null)
                    onPremModel.Status = OnPremModelStatusEnum.Uninstalled;
                else
                    // If a match is found, also set the status to 'Uninstalled' (currently both conditions have the same action)
                    onPremModel.Status = OnPremModelStatusEnum.Uninstalled;
            }

            // Convert the model to DTO and return the response.
            serviceResponse.Data = onPremModel.Adapt<OnPremModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "On-prem model retrieved successfully.";
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

            // Check if the provider type is 'Ollama' to filter relevant models
            if (onPremModel.ProviderType == OnPremModelProviderEnum.Ollama)
            {
                // Fetch the list of models from Ollama asynchronously based on the provider URL
                var ollamaModels = await GetOllamaModelsAsync(onPremModel.ProviderUrl, CancellationToken.None);

                // Attempt to find a matching Ollama model by comparing model names (case-insensitive)
                var ollamaModel = ollamaModels.FirstOrDefault(w => w.Name.Equals(onPremModel.ModelName, StringComparison.InvariantCultureIgnoreCase));

                // If no match is found (i.e., the model is not present in Ollama), set the status to 'Uninstalled'
                if (ollamaModel == null)
                    onPremModel.Status = OnPremModelStatusEnum.Uninstalled;
                else
                    // If a match is found, also set the status to 'Uninstalled' (currently both conditions have the same action)
                    onPremModel.Status = OnPremModelStatusEnum.Uninstalled;
            }

            // Convert the model entity to a DTO.
            serviceResponse.Data = onPremModel.Adapt<OnPremModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "On-prem model retrieved successfully.";
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
            // Check whether an on-prem model with the same name, provider type, and provider URL already exists.
            var existingModel = await _unitOfWork.OnPremModelRepo
                .GetByConditionAsync(w =>
                    w.ModelName.ToLower() == onPremModelDto.ModelName.ToLower() &&
                    w.ProviderType == onPremModelDto.ProviderType &&
                    w.ProviderUrl == onPremModelDto.ProviderUrl
                )
                .FirstOrDefaultAsync();

            if (existingModel != null)
            {
                _logger.LogWarning(
                    "Attempted to insert a duplicate on-prem model. ModelName: {ModelName}, ProviderType: {ProviderType}, ProviderUrl: {ProviderUrl}.",
                    onPremModelDto.ModelName,
                    onPremModelDto.ProviderType,
                    onPremModelDto.ProviderUrl
                );

                serviceResponse.Message = "An on-prem model with the same name, provider type, and provider URL already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Trim any leading/trailing spaces from the DTO properties.
            onPremModelDto = TrimDtoStringPropsUtil.TrimDtoStringProps(onPremModelDto);

            // Create a new on-prem model from the DTO and assign user IDs for tracking.
            var newOnPremModel = onPremModelDto.Adapt<OnPremModel>();
            newOnPremModel.Status = OnPremModelStatusEnum.Installed;
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
                // Optional follow-up actions:
                // - Transition model status (e.g., Downloading → Installed)
                // - Persist completion timestamp
                // - Emit domain event
            }

            // Call SyncAllOnPremModelsAsync method and wait for its result
            var syncResponse = await SyncAllOnPremModelsAsync(new SyncOnPremModelsDto()
            {
                ProviderUrl = onPremModelDto.ProviderUrl,
                ProviderType = onPremModelDto.ProviderType
            });

            if (!syncResponse.Data)
            {
                _logger.LogWarning("Failed to sync on-prem models for ProviderUrl: {ProviderUrl}, ProviderType: {ProviderType}.", onPremModelDto.ProviderUrl, onPremModelDto.ProviderType);
            }

            // Map the inserted model to DTO for response.
            serviceResponse.Data = newOnPremModel.Adapt<OnPremModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "On-prem model inserted successfully.";
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
                .AsNoTracking()
                .SingleOrDefaultAsync();

            if (existingOnPremModel == null)
            {
                _logger.LogWarning("On-prem model with ID {OnPremModelId} not found for update.", onPremModelDto.Id);
                serviceResponse.Message = "On-prem model not found.";
                return serviceResponse;
            }

            // Check whether an on-prem model with the same name, provider type, and provider URL already exists.
            var duplicateOnPremModel = await _unitOfWork.OnPremModelRepo
                .GetByConditionAsync(w =>
                    w.Id != onPremModelDto.Id &&
                    w.ModelName.ToLower() == onPremModelDto.ModelName.ToLower() &&
                    w.ProviderType == onPremModelDto.ProviderType &&
                    w.ProviderUrl == onPremModelDto.ProviderUrl
                )
                .FirstOrDefaultAsync();

            if (duplicateOnPremModel != null)
            {
                _logger.LogWarning(
                    "Attempted to insert a duplicate on-prem model. ModelName: {ModelName}, ProviderType: {ProviderType}, ProviderUrl: {ProviderUrl}.",
                    onPremModelDto.ModelName,
                    onPremModelDto.ProviderType,
                    onPremModelDto.ProviderUrl
                );

                serviceResponse.Message = "An on-prem model with the same name, provider type, and provider URL already exists.";
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
                // Optional follow-up actions:
                // - Transition model status (e.g., Downloading → Installed)
                // - Persist completion timestamp
                // - Emit domain event
            }

            // Call SyncAllOnPremModelsAsync method and wait for its result
            var syncResponse = await SyncAllOnPremModelsAsync(new SyncOnPremModelsDto()
            {
                ProviderUrl = onPremModelDto.ProviderUrl,
                ProviderType = onPremModelDto.ProviderType
            });

            if (!syncResponse.Data)
            {
                _logger.LogWarning("Failed to sync on-prem models for ProviderUrl: {ProviderUrl}, ProviderType: {ProviderType}.", onPremModelDto.ProviderUrl, onPremModelDto.ProviderType);
            }




            // Return the updated model.
            serviceResponse.Data = existingOnPremModel.Adapt<OnPremModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "On-prem model updated successfully.";
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
                serviceResponse.Message = "No on-prem models found matching the search term.";
                return serviceResponse;
            }

            // Map the matched models to DTOs and return.
            serviceResponse.Data = matchedOnPremModels.Adapt<IEnumerable<OnPremModelDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{matchedOnPremModels.Count} on-prem model(s) found matching the search term '{modelName}'.";
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
            // Log the incoming request details (model name, status, and provider URL)
            _logger.LogDebug("Ollama handler invoked. Model: {Model}, Status: {Status}, Url: {Url}", modelName, providerStatus, providerUrl);

            // Create HttpClient scoped to this operation and set BaseAddress for relative endpoint usage later
            using var httpClient = new HttpClient
            {
                BaseAddress = new Uri(providerUrl)
            };

            // Declare variables that will be assigned based on the requested model status
            string endpoint;
            object payload;
            HttpRequestMessage request;

            // Switch statement to decide the endpoint and payload based on model status
            switch (providerStatus)
            {
                // Case for when the model is either being downloaded or installed Both actions map to the same Ollama 'pull' operation
                case OnPremModelStatusEnum.Downloading:
                case OnPremModelStatusEnum.Installed:
                    endpoint = "/api/pull";
                    payload = new { name = modelName, stream = true };

                    request = new HttpRequestMessage(HttpMethod.Post, endpoint)
                    {
                        Content = JsonContent.Create(payload)
                    };
                    break;

                // Case for when the model is uninstalled, triggering the delete operation
                case OnPremModelStatusEnum.Uninstalled:
                    endpoint = "/api/delete";
                    payload = new { name = modelName };

                    request = new HttpRequestMessage(HttpMethod.Delete, endpoint)
                    {
                        Content = JsonContent.Create(payload)
                    };
                    break;

                // Handle unexpected model statuses
                default:
                    _logger.LogWarning("Invalid model status received for ollama. Model: {Model}, Status: {Status}", modelName, providerStatus);
                    throw new ArgumentOutOfRangeException(nameof(providerStatus));
            }

            // Send the HTTP request to Ollama's API
            var response = await httpClient.SendAsync(request, cancellationToken);

            // Check if the response is successful (status code 2xx)
            if (response.IsSuccessStatusCode)
            {
                return true;
            }

            // If response is not successful, read the error content for troubleshooting
            var error = await response.Content.ReadAsStringAsync(cancellationToken);

            // Log the error details with the response content
            _logger.LogError("Ollama operation failed. Model: {Model}, Status: {Status}, HttpStatus: {HttpStatus}, Response: {Response}", modelName, providerStatus, response.StatusCode, error);
            return false;
        }
        catch (OperationCanceledException)
        {
            // Log warning if the operation was canceled (e.g., due to timeout)
            _logger.LogWarning("Ollama operation was cancelled. Model: {Model}, Status: {Status}", modelName, providerStatus);

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during Ollama operation. Model: {Model}, Status: {Status}, Url: {Url}", modelName, providerStatus, providerUrl);
            return false;
        }
    }

    // Retrieves the list of models from the Ollama provider.
    private async Task<List<OllamaModelDto>> GetOllamaModelsAsync(string providerUrl, CancellationToken cancellationToken)
    {
        try
        {
            // Log the details of the request (provider URL)
            _logger.LogDebug("Fetching models from Ollama provider. Provider URL: {Url}", providerUrl);

            // Create a new HttpClient scoped to this operation, setting BaseAddress to allow relative endpoints
            using var httpClient = new HttpClient
            {
                BaseAddress = new Uri(providerUrl)
            };

            // Define the endpoint for fetching the model list
            string endpoint = "/api/tags";

            // Send the GET request to fetch the model list
            var response = await httpClient.GetAsync(endpoint, cancellationToken);

            // Check if the response is successful (status code 2xx)
            if (response.IsSuccessStatusCode)
            {
                // Read the JSON response containing the model list
                var modelsJson = await response.Content.ReadAsStringAsync(cancellationToken);

                // Configure JSON deserialization options for case-insensitive property matching
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                // Deserialize the JSON response into a list of model DTOs
                var modelListResponse = System.Text.Json.JsonSerializer.Deserialize<OllamaModelListResponse>(modelsJson, options);

                // Check if the deserialization was successful and if models are present
                if (modelListResponse != null && modelListResponse.Models.Any())
                {
                    // Return the list of models
                    return modelListResponse.Models;
                }
                else
                {
                    // Log a warning if no models were found in the response
                    _logger.LogWarning("No models found in the response from Ollama.");
                    return new List<OllamaModelDto>();
                }
            }

            // If the response is not successful, log the status code and error details
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Failed to retrieve models. HTTP Status: {HttpStatus}, Error: {ErrorResponse}", response.StatusCode, error);
            return new List<OllamaModelDto>();
        }
        catch (Exception ex)
        {
            // Log unexpected errors that occur during the retrieval process
            _logger.LogError(ex, "An unexpected error occurred while retrieving models from Ollama. Provider URL: {Url}", providerUrl);
            return new List<OllamaModelDto>();
        }
    }

    // Syncs on-prem models with the specified provider and base URL.
    public async Task<ServiceResponse<bool>> SyncAllOnPremModelsAsync(SyncOnPremModelsDto syncOnPremModelsDto)
    {
        // Initialize ServiceResponse with failed response by default
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to sync on-prem models. Please try again later."
        };

        try
        {
            // Query to fetch on-prem models created by the current user, filtered by the provider type
            var onPremModels = await _unitOfWork.OnPremModelRepo
                .GetByConditionAsync(w => w.ProviderType == syncOnPremModelsDto.ProviderType)
                .AsNoTracking()
                .ToListAsync();

            // Lists to track models that need to be inserted or updated
            var needToBeInserted = new List<OnPremModel>();
            var needToBeUpdated = new List<OnPremModel>();

            switch (syncOnPremModelsDto.ProviderType)
            {
                case OnPremModelProviderEnum.Ollama:
                    // Fetch the list of models from Ollama asynchronously based on the provided URL
                    var ollamaModels = await GetOllamaModelsAsync(syncOnPremModelsDto.ProviderUrl, CancellationToken.None);

                    // Loop through each on-prem model retrieved from the database
                    foreach (var ollamaModel in ollamaModels)
                    {
                        // Skip iteration if there are no models from Ollama
                        if (ollamaModels.Count == 0) continue;

                        // Attempt to find a matching Ollama model by comparing model names (case-insensitive)
                        var onPremModel = onPremModels
                            .FirstOrDefault(w => w.ModelName.Equals(ollamaModel.Name, StringComparison.InvariantCultureIgnoreCase));

                        if (onPremModel != null)
                        {
                            // If a matching Ollama model is found and its status is not "installed", update it
                            if (onPremModel.Status != OnPremModelStatusEnum.Installed)
                            {
                                onPremModel.Status = OnPremModelStatusEnum.Installed;
                                needToBeUpdated.Add(onPremModel);
                            }
                        }
                        else
                        {
                            // If the Ollama model is not found in the database, create a new model entry
                            var newOnPremModel = new OnPremModel
                            {
                                Name = ollamaModel.Name,
                                ProviderUrl = syncOnPremModelsDto.ProviderUrl,
                                ModelName = ollamaModel.Name,
                                Status = OnPremModelStatusEnum.Installed,
                                ProviderType = syncOnPremModelsDto.ProviderType,
                                CreatedByUserId = _userId,
                                LastModifiedByUserId = _userId,
                            };

                            needToBeInserted.Add(newOnPremModel);
                        }
                    }

                    // If there are any new models to be inserted, perform the insert operation
                    if (needToBeInserted.Any())
                    {
                        await _unitOfWork.OnPremModelRepo.InsertAsync(needToBeInserted);
                    }

                    // If there are any models that need to be updated, perform the update operation
                    if (needToBeUpdated.Any())
                    {
                        _unitOfWork.OnPremModelRepo.Update(needToBeUpdated);
                    }

                    // Save changes to the database
                    if (!await _unitOfWork.SaveAsync() && (needToBeInserted.Any() || needToBeUpdated.Any()))
                    {
                        _logger.LogError("Failed to save changes when inserting on-prem model with name '{ModelName}'", onPremModels.FirstOrDefault()?.ModelName);
                        return serviceResponse;
                    }

                    break;

                default:
                    // Handle other provider types if necessary
                    break;
            }

            // Successfully synced models, update the service response with success status
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "On-prem models synced successfully.";
        }
        catch (Exception ex)
        {
            // Catch any exceptions, log the error with a specific message, and include the user ID for better context
            _logger.LogError(ex, "Error occurred while syncing on-prem models for user {UserId}.", _userId);
        }

        return serviceResponse;
    }
}