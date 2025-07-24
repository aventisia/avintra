namespace MLModelBuilderAPIs.Services;

public class MLModelVersionService : IMLModelVersionService
{
    private readonly ILogger<MLModelVersionService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public MLModelVersionService(
        ILogger<MLModelVersionService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Extract user ID from the HTTP context (UID is stored in the user's claims)
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        // Dependency injection of services for logging and unit of work
        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Method to get all versions of a specific model created by the user
    public async Task<ServiceResponse<IEnumerable<MLModelVersionDto>>> GetModelVersionsByModelIdAsync(Guid mlModelId)
    {
        // Initialize service response with failure status
        var serviceResponse = new ServiceResponse<IEnumerable<MLModelVersionDto>>
        {
            Data = null,
            Message = "Failed to retrieve model versions. Please try again."
        };

        try
        {
            // Retrieve ML model versions for a specific model ID created by the user
            var modelVersions = await _unitOfWork.MLModelVersionRepo
                .GetByConditionAsync(w => w.MLModelId == mlModelId)
                .Include(i => i.MLModel)
                .OrderByDescending(o => o.CreatedOn)
                .ProjectToType<MLModelVersionDto>()
                .ToListAsync();

            // If successful, set response data and status code
            serviceResponse.Data = modelVersions;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML model versions retrieved successfully.";

            // Log the successful retrieval of model versions
            _logger.LogInformation("Successfully retrieved {ModelVersionsCount} versions for model {ModelId} created by user {UserId}.", modelVersions.Count, mlModelId, _userId);
        }
        catch (Exception ex)
        {
            // Log error if something goes wrong
            _logger.LogError(ex, "Error retrieving ML model versions.");
        }

        return serviceResponse;
    }

    // Retrieves a specific machine learning model version by its unique identifier.
    public async Task<ServiceResponse<MLModelVersionDto>> GetModelVersionByIdAsync(Guid mlModelVersionId)
    {
        // Initialize service response with failure status
        var serviceResponse = new ServiceResponse<MLModelVersionDto>
        {
            Data = null,
            Message = "Failed to retrieve model version. Please try again."
        };

        try
        {
            // Retrieve ML model version for a specific model ID created by the user
            var modelVersion = await _unitOfWork.MLModelVersionRepo
                .GetByConditionAsync(w => w.Id == mlModelVersionId)
                .Include(i => i.MLModel)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            // Check if model version exists
            if (modelVersion == null)
            {
                _logger.LogWarning("Model version with ID {ModelVersionId} not found for user {UserId}.", mlModelVersionId, _userId);

                serviceResponse.Message = "Model version not found.";
                return serviceResponse;
            }

            // If successful, set response data and status code
            serviceResponse.Data = modelVersion.Adapt<MLModelVersionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML model version retrieved successfully.";

            // Log the successful retrieval of model version
            _logger.LogInformation("Successfully retrieved model version with ID {ModelVersionId} created by user {UserId}.", mlModelVersionId, _userId);
        }
        catch (Exception ex)
        {
            // Log error if something goes wrong
            _logger.LogError(ex, "Error retrieving ML model version with ID {ModelVersionId}.", mlModelVersionId);
        }

        return serviceResponse;
    }

    // Method to create a new version of a machine learning model
    public async Task<ServiceResponse<MLModelVersionDto>> CreateModelVersionAsync(MLModelVersionDto mlModelVersionDto)
    {
        // Initialize service response with failure status
        var serviceResponse = new ServiceResponse<MLModelVersionDto>
        {
            Data = null,
            Message = "Failed to insert model version. Please try again."
        };

        try
        {
            var mlModel = await _unitOfWork.MLModelRepo
            .GetByConditionAsync(w => w.Id == mlModelVersionDto.MLModelId)
            .Include(i => i.Versions)
            .SingleOrDefaultAsync();

            // Check if the model was found
            if (mlModel == null)
            {
                _logger.LogError($"MLModel with ID {mlModelVersionDto.MLModelId} not found.");
                serviceResponse.Message = "ML model not found.";
                return serviceResponse;
            }

            // Trim all string properties of the DTO
            mlModelVersionDto = TrimDtoStringPropsUtil.TrimDtoStringProps(mlModelVersionDto);

            // Map the DTO to an entity
            var newModelVersion = mlModelVersionDto.Adapt<MLModelVersion>();
            newModelVersion.VersionNumber = mlModel.Versions.Count() + 1;
            newModelVersion.CreatedByUserId = _userId;
            newModelVersion.CreatedOn = DateTime.UtcNow;
            newModelVersion.LastModifiedByUserId = _userId;

            // Insert the new model version into the repository
            await _unitOfWork.MLModelVersionRepo.InsertAsync(newModelVersion);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Error saving the new model version.");
                return serviceResponse;
            }

            // Success - Return the created model version
            serviceResponse.Data = newModelVersion.Adapt<MLModelVersionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Model version created successfully.";

            // Log successful creation of a new version
            _logger.LogInformation("Created new ML model version with ID {ModelVersionId} for model {ModelId} created by user {UserId}.", newModelVersion.Id, mlModelVersionDto.MLModelId, _userId);
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur
            _logger.LogError(ex, "Error creating model version.");
        }

        return serviceResponse;
    }

    // Method to update an existing ML model version
    public async Task<ServiceResponse<MLModelVersionDto>> UpdateModelVersionAsync(MLModelVersionDto mlModelVersionDto)
    {
        // Initialize service response with failure status
        var serviceResponse = new ServiceResponse<MLModelVersionDto>
        {
            Data = null,
            Message = "Failed to update model version. Please try again."
        };

        try
        {
            // Check if the model version exists
            var existingModelVersion = await _unitOfWork.MLModelVersionRepo
                .GetByConditionAsync(w => w.Id == mlModelVersionDto.Id)
                .SingleOrDefaultAsync();

            // If not, return an error message
            if (existingModelVersion == null)
            {
                _logger.LogInformation("Model version does not exist.");
                serviceResponse.Message = "Model version does not exist.";
                return serviceResponse;
            }

            // Prevent updates if the model version is already published
            if (existingModelVersion.IsPublished)
            {
                _logger.LogWarning($"Attempt to update a published model version. Version ID: {mlModelVersionDto.Id}");
                serviceResponse.Message = "Published model versions cannot be updated.";
                return serviceResponse;
            }

            // Trim all string properties of the DTO
            mlModelVersionDto = TrimDtoStringPropsUtil.TrimDtoStringProps(mlModelVersionDto);

            mlModelVersionDto.Adapt(existingModelVersion);
            existingModelVersion.LastModifiedByUserId = _userId;

            // Update the model version in the repository
            _unitOfWork.MLModelVersionRepo.Update(existingModelVersion);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Error saving the updated model version.");
                return serviceResponse;
            }

            // Success - Return the updated model version
            serviceResponse.Data = existingModelVersion.Adapt<MLModelVersionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Model version updated successfully.";

            // Log successful update of the model version
            _logger.LogInformation("Updated ML model version with ID {ModelVersionId} for model {ModelId} created by user {UserId}.", existingModelVersion.Id, mlModelVersionDto.MLModelId, _userId);
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur
            _logger.LogError(ex, "Error updating model version.");
            serviceResponse.Message = "An error occurred while updating the model version.";
        }

        return serviceResponse;
    }

    // Method to delete an ML model version by its ID
    public async Task<ServiceResponse<bool>> DeleteModelVersionAsync(Guid mlModelVersionId)
    {
        // Initialize service response with failure status
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete model version. Please try again."
        };

        try
        {
            // Retrieve the model version to be deleted
            var modelVersionToDelete = await _unitOfWork.MLModelVersionRepo
                .GetByConditionAsync(w => w.Id == mlModelVersionId)
                .SingleOrDefaultAsync();

            // If model version does not exist, return an error
            if (modelVersionToDelete == null)
            {
                _logger.LogInformation($"Model version {mlModelVersionId} does not exist.");
                serviceResponse.Message = "Model version does not exist.";
                return serviceResponse;
            }

            // Delete the model version
            _unitOfWork.MLModelVersionRepo.Delete(modelVersionToDelete);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Error deleting model version {mlModelVersionId}.");
                serviceResponse.Message = "Failed to delete the model version.";
                return serviceResponse;
            }

            // Success - Return success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Model version deleted successfully.";

            // Log successful deletion of the model version
            _logger.LogInformation("Deleted ML model version with ID {ModelVersionId} for model {ModelId} created by user {UserId}.", mlModelVersionId, modelVersionToDelete.MLModelId, _userId);
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur
            _logger.LogError(ex, "Error deleting model version.");
            serviceResponse.Message = "An error occurred while deleting the model version.";
        }

        return serviceResponse;
    }

    // Deletes multiple ML model versions by their IDs.
    public async Task<ServiceResponse<bool>> DeleteMultipleModelVersionsAsync(IEnumerable<Guid> mlModelVersionIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete model versions. Please try again."
        };

        try
        {
            // Validate mlModelVersionIds input
            if (mlModelVersionIds == null || !mlModelVersionIds.Any())
            {
                _logger.LogWarning("No version IDs provided for bulk delete.");
                serviceResponse.Message = "No version IDs provided.";
                return serviceResponse;
            }

            // Fetch the versions that belong to the current user and match the provided IDs
            var versionsToDelete = await _unitOfWork.MLModelVersionRepo
                .GetByConditionAsync(v => mlModelVersionIds.Contains(v.Id) && v.CreatedByUserId == _userId)
                .ToListAsync();

            if (!versionsToDelete.Any())
            {
                _logger.LogInformation("No matching model versions found for deletion.");
                serviceResponse.Message = "No matching model versions found.";
                return serviceResponse;
            }

            // Perform deletion
            _unitOfWork.MLModelVersionRepo.Delete(versionsToDelete);

            // Save changes to DB
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete multiple model versions.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{versionsToDelete.Count} model versions deleted successfully.";

            _logger.LogInformation("{Count} ML model versions deleted successfully by user {UserId}.", versionsToDelete.Count, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting multiple model versions.");
        }

        return serviceResponse;
    }

    // Publishes a specific ML model version by setting its IsPublished flag.
    public async Task<ServiceResponse<bool>> PublishMLModelVersionAsync(PublishMLModelVersionDto publishMLModelVersionDto)
    {
        // Initialize service response with failure state
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to publish the model version. Please try again."
        };

        try
        {
            // Retrieve the ML model version to ensure it exists and is valid for publishing
            var mlModelVersion = await _unitOfWork.MLModelVersionRepo
                .GetByConditionAsync(w => w.Id == publishMLModelVersionDto.Id)
                .SingleOrDefaultAsync();

            // Check if the ML model version exists
            if (mlModelVersion == null)
            {
                // Log error if the model version doesn't exist
                _logger.LogError("Model version {ModelVersionId} not found during publish attempt.", publishMLModelVersionDto.Id);

                // Set failure message for non-existing model version
                serviceResponse.Message = "Model version not found.";
                return serviceResponse;
            }

            // If the model version is already published, return a conflict response
            if (mlModelVersion.IsPublished)
            {
                // Log information if the model version is already published
                _logger.LogInformation("Model version {ModelVersionId} is already published.", publishMLModelVersionDto.Id);

                // Set failure message for already published model
                serviceResponse.Message = "Model version is already published.";
                return serviceResponse;
            }

            // Update the model version as published and set the publishing date
            mlModelVersion.IsPublished = true;
            mlModelVersion.PublishedOn = DateTimeOffset.UtcNow;
            mlModelVersion.LastModifiedByUserId = _userId;

            // Log the publishing of the model version
            _logger.LogInformation("Model version {ModelVersionId} has been successfully published by user {UserId}.", publishMLModelVersionDto.Id, _userId);

            // Save changes to the database
            _unitOfWork.MLModelVersionRepo.Update(mlModelVersion);

            // Persist changes and check if save is successful
            if (!await _unitOfWork.SaveAsync())
            {
                // Log error if saving the publish status fails
                _logger.LogError("Failed to save the publishing changes for model version {ModelVersionId}.", publishMLModelVersionDto.Id);

                // Set failure message for saving changes
                return serviceResponse;
            }

            // Set success response if everything is fine
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Model version published successfully.";
        }
        catch (Exception ex)
        {
            // Log any unexpected errors during the process
            _logger.LogError(ex, "An error occurred while publishing model version {ModelVersionId}.", publishMLModelVersionDto.Id);
        }

        return serviceResponse;
    }
}