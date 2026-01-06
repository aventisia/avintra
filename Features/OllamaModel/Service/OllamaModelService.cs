namespace WorkspaceAPIs.Services;

public class OllamaModelService : IOllamaModelService
{
    private readonly ILogger<OllamaModelService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    // Constructor for dependency injection.
    public OllamaModelService(
        ILogger<OllamaModelService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;

        // Initialize the user ID by extracting it from the JWT claims in the HTTP context.
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _logger.LogInformation("OllamaModelService initialized for user {UserId}.", _userId);
    }

    // Method to check if the ollama model name is available.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsOllamaModelNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check ollama model name availability. Please try again."
        };

        try
        {
            // Validation of model name: Ensure it starts with a letter or underscore and contains no spaces or special characters.
            if (string.IsNullOrEmpty(checkAvailabilityDto.UserInput))
            {
                _logger.LogError("Invalid ollama model name: '{ModelName}'. The name must start with a letter or underscore and cannot contain spaces or symbols.", checkAvailabilityDto.UserInput);
                serviceResponse.Message = $"The name '{checkAvailabilityDto.UserInput}' is invalid. Please use a valid name.";
                return serviceResponse;
            }

            // Query to check if a model with the same name already exists in the database.
            var existingOllamaModel = await _unitOfWork.OllamaModelRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower()
                )
                .FirstOrDefaultAsync();

            // If the model already exists, return false indicating the name is not available.
            if (existingOllamaModel != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "An ollama model with the same name already exists. Please enter a unique name.";
                _logger.LogWarning("Model name '{ModelName}' is not available. Already exists for user {UserId}.", checkAvailabilityDto.UserInput, _userId);
                return serviceResponse;
            }

            // If no model exists with the given name, return true indicating the name is available.
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Ollama model name is available.";
            _logger.LogInformation("Model name '{ModelName}' is available for user {UserId}.", checkAvailabilityDto.UserInput, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while checking availability for model name '{ModelName}' for user {UserId}.", checkAvailabilityDto.UserInput, _userId);
        }

        return serviceResponse;
    }

    // Method to retrieve all ollama models.
    public async Task<ServiceResponse<IEnumerable<OllamaModelDto>>> GetAllOllamaModelsAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<OllamaModelDto>>
        {
            Data = null,
            Message = "Failed to retrieve ollama models. Please try again later."
        };

        try
        {
            // Query to fetch ollama models created by the current user, ordered by creation date.
            var ollamaModels = await _unitOfWork.OllamaModelRepo
                .GetByConditionAsync(w => w.CreatedByUserId == _userId)
                .AsNoTracking()
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderBy(o => o.CreatedOn)
                .ToListAsync();

            // Map the models to the DTOs for return.
            serviceResponse.Data = ollamaModels.Adapt<IEnumerable<OllamaModelDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Ollama models retrieved successfully.";

            _logger.LogInformation("Successfully retrieved {ModelCount} ollama models for user {UserId}.", ollamaModels.Count, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching ollama models for user {UserId}.", _userId);
        }

        return serviceResponse;
    }

    // Method to retrieve a specific ollama model by its ID.
    public async Task<ServiceResponse<OllamaModelDto>> GetOllamaModelAsync(Guid ollamaModelId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<OllamaModelDto>
        {
            Data = null,
            Message = "Failed to retrieve ollama model. Please try again later."
        };

        try
        {
            // Query to find a model by its ID, including related user data.
            var ollamaModel = await _unitOfWork.OllamaModelRepo
                .GetByConditionAsync(w => w.Id == ollamaModelId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .SingleOrDefaultAsync();

            if (ollamaModel == null)
            {
                _logger.LogWarning("Ollama model with ID {OllamaModelId} not found.", ollamaModelId);
                serviceResponse.Message = "Ollama model not found.";
                return serviceResponse;
            }

            // Convert the model to DTO and return the response.
            serviceResponse.Data = ollamaModel.Adapt<OllamaModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Ollama model retrieved successfully.";

            _logger.LogInformation("Successfully retrieved ollama model with ID {OllamaModelId}.", ollamaModelId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching ollama model with ID {OllamaModelId}.", ollamaModelId);
        }

        return serviceResponse;
    }

    // Method to retrieve a specific ollama model by its name.
    public async Task<ServiceResponse<OllamaModelDto>> GetOllamaModelByNameAsync(string ollamaModelName)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<OllamaModelDto>
        {
            Data = null,
            Message = "Failed to retrieve ollama model. Please try again later."
        };

        try
        {
            // Check if the model name is provided.
            if (string.IsNullOrWhiteSpace(ollamaModelName))
            {
                _logger.LogWarning("Ollama model search failed: The model name is empty or contains only whitespace.");
                serviceResponse.Message = "Ollama model name cannot be empty or whitespace.";
                return serviceResponse;
            }

            // Query to retrieve the ollama model based on its name.
            var ollamaModel = await _unitOfWork.OllamaModelRepo
                .GetByConditionAsync(w => w.Name.ToLower() == ollamaModelName.ToLower())
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .FirstOrDefaultAsync();

            // If no model is found, return a not found message.
            if (ollamaModel == null)
            {
                _logger.LogWarning("Ollama model with name '{OllamaModelName}' not found.", ollamaModelName);
                serviceResponse.Message = "Ollama model not found.";
                return serviceResponse;
            }

            // Convert the model entity to a DTO.
            serviceResponse.Data = ollamaModel.Adapt<OllamaModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Ollama model retrieved successfully.";

            // Log success for the retrieval.
            _logger.LogInformation("Successfully retrieved ollama model with name '{OllamaModelName}'.", ollamaModelName);
        }
        catch (Exception ex)
        {
            // Log the error if an exception occurs during the retrieval process.
            _logger.LogError(ex, "An error occurred while retrieving ollama model with name '{OllamaModelName}'.", ollamaModelName);
        }

        return serviceResponse;
    }

    // Method to insert a new ollama model.
    public async Task<ServiceResponse<OllamaModelDto>> InsertOllamaModelAsync(OllamaModelDto ollamaModelDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<OllamaModelDto>
        {
            Data = null,
            Message = "Failed to insert ollama model. Please try again."
        };

        try
        {
            // Check if a model with the same name already exists.
            var existingModel = await _unitOfWork.OllamaModelRepo
                .GetByConditionAsync(w => w.Name.ToLower() == ollamaModelDto.Name.ToLower())
                .FirstOrDefaultAsync();

            if (existingModel != null)
            {
                _logger.LogWarning("Duplicate model name '{ModelName}' attempted for insertion.", ollamaModelDto.Name);
                serviceResponse.Message = "An ollama model with the same name already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Trim any leading/trailing spaces from the DTO properties.
            ollamaModelDto = TrimDtoStringPropsUtil.TrimDtoStringProps(ollamaModelDto);

            // Create a new ollama model from the DTO and assign user IDs for tracking.
            var newOllamaModel = ollamaModelDto.Adapt<OllamaModel>();
            newOllamaModel.CreatedByUserId = _userId;
            newOllamaModel.LastModifiedByUserId = _userId;

            // Insert the new model into the database.
            await _unitOfWork.OllamaModelRepo.InsertAsync(newOllamaModel);

            // Save changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes when inserting ollama model with name '{ModelName}'", ollamaModelDto.Name);
                return serviceResponse;
            }

            // Map the inserted model to DTO for response.
            serviceResponse.Data = newOllamaModel.Adapt<OllamaModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Ollama model inserted successfully.";

            _logger.LogInformation("Successfully inserted new ollama model with name '{ModelName}' for user {UserId}.", ollamaModelDto.Name, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while inserting ollama model with name '{ModelName}'.", ollamaModelDto.Name);
        }

        return serviceResponse;
    }

    // Method to update an existing ollama model.
    public async Task<ServiceResponse<OllamaModelDto>> UpdateOllamaModelAsync(OllamaModelDto ollamaModelDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<OllamaModelDto>
        {
            Data = null,
            Message = "Failed to update ollama model. Please try again."
        };

        try
        {
            // Query to check if the model exists in the database.
            var existingOllamaModel = await _unitOfWork.OllamaModelRepo
                .GetByConditionAsync(w => w.Id == ollamaModelDto.Id)
                .SingleOrDefaultAsync();

            if (existingOllamaModel == null)
            {
                _logger.LogWarning("Ollama model with ID {OllamaModelId} not found for update.", ollamaModelDto.Id);
                serviceResponse.Message = "Ollama model not found.";
                return serviceResponse;
            }

            // Check for duplicate names if the name is changed.
            var duplicateOllamaModel = await _unitOfWork.OllamaModelRepo
                .GetByConditionAsync(w =>
                    w.Id != ollamaModelDto.Id &&
                    w.Name.ToLower() == ollamaModelDto.Name.ToLower())
                .FirstOrDefaultAsync();

            if (duplicateOllamaModel != null)
            {
                _logger.LogWarning("Attempt to update ollama model with duplicate name '{ModelName}'.", ollamaModelDto.Name);
                serviceResponse.Message = "An ollama model with the same name already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Trim and update the properties of the existing model.
            ollamaModelDto = TrimDtoStringPropsUtil.TrimDtoStringProps(ollamaModelDto);
            ollamaModelDto.Adapt(existingOllamaModel);
            existingOllamaModel.LastModifiedByUserId = _userId;
            existingOllamaModel.LastModifiedOn = DateTimeOffset.UtcNow;

            // Update the model in the database.
            _unitOfWork.OllamaModelRepo.Update(existingOllamaModel);

            // Save the changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes when updating ollama model with ID {OllamaModelId}.", ollamaModelDto.Id);
                return serviceResponse;
            }

            // Return the updated model.
            serviceResponse.Data = existingOllamaModel.Adapt<OllamaModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Ollama model updated successfully.";

            _logger.LogInformation("Successfully updated ollama model with ID {OllamaModelId} for user {UserId}.", ollamaModelDto.Id, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating ollama model with ID {OllamaModelId}.", ollamaModelDto.Id);
        }

        return serviceResponse;
    }

    // Method to delete an ollama model by ID.
    public async Task<ServiceResponse<bool>> DeleteOllamaModelAsync(Guid ollamaModelId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete ollama model. Please try again."
        };

        try
        {
            // Query to find the model by ID.
            var existingOllamaModel = await _unitOfWork.OllamaModelRepo
                .GetByConditionAsync(w => w.Id == ollamaModelId)
                .SingleOrDefaultAsync();

            if (existingOllamaModel == null)
            {
                _logger.LogWarning("Ollama model with ID {OllamaModelId} not found for deletion.", ollamaModelId);
                serviceResponse.Message = "Ollama model not found.";
                return serviceResponse;
            }

            // Delete the model from the database.
            _unitOfWork.OllamaModelRepo.Delete(existingOllamaModel);

            // Save the changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete ollama model with ID {OllamaModelId}. SaveChanges failed.", ollamaModelId);
                return serviceResponse;
            }

            // Return success.
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Ollama model deleted successfully.";

            _logger.LogInformation("Successfully deleted ollama model with ID {OllamaModelId} for user {UserId}.", ollamaModelId, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting ollama model with ID {OllamaModelId}.", ollamaModelId);
        }

        return serviceResponse;
    }

    // Method to delete multiple ollama models by their IDs.
    public async Task<ServiceResponse<bool>> DeleteMultipleOllamaModelsAsync(IEnumerable<Guid> ollamaModelIds)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete ollama models. Please try again."
        };

        try
        {
            // Query to find all models by the given IDs.
            var modelsToDelete = await _unitOfWork.OllamaModelRepo
                .GetByConditionAsync(w => ollamaModelIds.Contains(w.Id))
                .AsNoTracking()
                .ToListAsync();

            if (modelsToDelete == null || !modelsToDelete.Any())
            {
                _logger.LogWarning("No ollama models found for deletion for user {UserId} with model IDs {OllamaModelIds}.", _userId, string.Join(", ", ollamaModelIds));
                serviceResponse.Message = "No ollama models found for deletion.";
                return serviceResponse;
            }

            // Delete the models from the database.
            _unitOfWork.OllamaModelRepo.Delete(modelsToDelete);

            // Save the changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete models for user {UserId} with model IDs {OllamaModelIds}. SaveChanges failed.", _userId, string.Join(", ", ollamaModelIds));
                return serviceResponse;
            }

            // Return success.
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"Successfully deleted {modelsToDelete.Count} ollama models.";

            _logger.LogInformation("Successfully deleted {ModelCount} ollama models for user {UserId} with model IDs {OllamaModelIds}.", modelsToDelete.Count, _userId, string.Join(", ", ollamaModelIds));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting multiple ollama models for user {UserId} with model IDs {OllamaModelIds}.", _userId, string.Join(", ", ollamaModelIds));
        }

        return serviceResponse;
    }

    // Method to search for ollama models by name.
    public async Task<ServiceResponse<IEnumerable<OllamaModelDto>>> SearchOllamaModelsByNameAsync(string modelName)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<OllamaModelDto>>
        {
            Data = null,
            Message = "Failed to search ollama models. Please try again."
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
            var matchedOllamaModels = await _unitOfWork.OllamaModelRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower().Contains(modelName.Trim().ToLower()) ||
                    w.ModelName.ToLower().Contains(modelName.Trim().ToLower())
                )
                .ToListAsync();

            // If no models are found, return a message.
            if (matchedOllamaModels == null || !matchedOllamaModels.Any())
            {
                _logger.LogInformation("No ollama models found for search term '{ModelName}' for user {UserId}.", modelName, _userId);
                serviceResponse.Message = "No ollama models found matching the search term.";
                return serviceResponse;
            }

            // Map the matched models to DTOs and return.
            serviceResponse.Data = matchedOllamaModels.Adapt<IEnumerable<OllamaModelDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{matchedOllamaModels.Count} ollama model(s) found matching the search term '{modelName}'.";

            _logger.LogInformation("{Count} ollama model(s) found for search term '{ModelName}' for user {UserId}.", matchedOllamaModels.Count, modelName, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while searching for ollama models with search term '{ModelName}' for user {UserId}.", modelName, _userId);
        }

        return serviceResponse;
    }
}