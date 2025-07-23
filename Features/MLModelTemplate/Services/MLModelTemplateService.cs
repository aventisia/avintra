namespace MLModelBuilderAPIs.Services;

public class MLModelTemplateService : IMLModelTemplateService
{
    private readonly ILogger<MLModelTemplateService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public MLModelTemplateService(
        ILogger<MLModelTemplateService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Extract user ID from the HTTP context claims; default to empty Guid if missing
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves all ML model templates optionally filtered by ML model ID.
    public async Task<ServiceResponse<IEnumerable<MLModelTemplateDto>>> GetAllMLModelTemplatesAsync(Guid? mlModelVersionId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<MLModelTemplateDto>>
        {
            Data = null,
            Message = "Failed to retrieve ML model templates. Please try again."
        };

        try
        {
            // Start with all templates
            var mLModelTemplates = await _unitOfWork.MLModelTemplateRepo
                .GetAllAsync()
                .Include(i => i.CreatedByUser)
                .Include(i => i.MLModelVersion)
                .ThenInclude(i2 => i2.MLModel)
                .ToListAsync();

            // Filter by ML model version ID if provided
            if (mlModelVersionId.HasValue)
            {
                mLModelTemplates = mLModelTemplates.Where(t => t.MLModelVersionId == mlModelVersionId.Value).ToList();
                _logger.LogInformation("Filtering ML model templates by MLModelId {ModelId} for user {UserId}.", mlModelVersionId, _userId);
            }

            // Populate service response with successful data
            serviceResponse.Data = mLModelTemplates.Adapt<IEnumerable<MLModelTemplateDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML model templates retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while retrieving ML model templates for user {UserId}.", _userId);
        }

        return serviceResponse;
    }

    // Retrieves a single ML model template by its unique identifier.
    public async Task<ServiceResponse<MLModelTemplateDto>> GetMLModelTemplateByIdAsync(Guid mlModelTemplateId)
    {
        var serviceResponse = new ServiceResponse<MLModelTemplateDto>
        {
            Data = null,
            Message = "Failed to retrieve ML model template. Please try again."
        };

        try
        {
            // Query for the template with the given ID
            var mLModelTemplate = await _unitOfWork.MLModelTemplateRepo
                .GetByConditionAsync(t => t.Id == mlModelTemplateId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.MLModelVersion)
                .ThenInclude(i2 => i2.MLModel)
                .SingleOrDefaultAsync();

            // Check if template exists
            if (mLModelTemplate == null)
            {
                _logger.LogWarning("ML model template with ID {mlModelTemplateId} not found for user {UserId}.", mlModelTemplateId, _userId);
                serviceResponse.Message = "ML model template not found.";
                return serviceResponse;
            }

            // Map the entity to DTO
            serviceResponse.Data = mLModelTemplate.Adapt<MLModelTemplateDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML model template retrieved successfully.";

            _logger.LogInformation("Successfully retrieved ML model template with ID {mlModelTemplateId} for user {UserId}.", mlModelTemplateId, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving ML model template with ID {mlModelTemplateId} for user {UserId}.", mlModelTemplateId, _userId);
        }

        return serviceResponse;
    }

    // Creates a new ML model template.
    public async Task<ServiceResponse<MLModelTemplateDto>> CreateMLModelTemplateAsync(MLModelTemplateDto mlModelTemplateDto)
    {
        var serviceResponse = new ServiceResponse<MLModelTemplateDto>
        {
            Data = null,
            Message = "Failed to create ML model template. Please try again."
        };

        try
        {
            // Trim whitespace from all string properties in DTO for clean data
            mlModelTemplateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(mlModelTemplateDto);

            // Map DTO to entity for persistence
            var newTemplateEntity = mlModelTemplateDto.Adapt<MLModelTemplate>();

            // Set audit fields
            newTemplateEntity.CreatedByUserId = _userId;
            newTemplateEntity.LastModifiedByUserId = _userId;
            newTemplateEntity.CreatedOn = DateTime.UtcNow;

            // Insert the new entity into the repository
            await _unitOfWork.MLModelTemplateRepo.InsertAsync(newTemplateEntity);

            // Persist changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save new ML model template created by user {UserId}.", _userId);
                return serviceResponse;
            }

            // Map the saved entity back to DTO for response
            serviceResponse.Data = newTemplateEntity.Adapt<MLModelTemplateDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML model template created successfully.";

            _logger.LogInformation("Created new ML model template with ID {mlModelTemplateId} for user {UserId}.", newTemplateEntity.Id, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating ML model template for user {UserId}.", _userId);
        }

        return serviceResponse;
    }

    // Updates an existing ML model template.
    public async Task<ServiceResponse<MLModelTemplateDto>> UpdateMLModelTemplateAsync(MLModelTemplateDto mlModelTemplateDto)
    {
        var serviceResponse = new ServiceResponse<MLModelTemplateDto>
        {
            Data = null,
            Message = "Failed to update ML model template. Please try again."
        };

        try
        {
            // Retrieve existing entity by ID
            var mLModelTemplate = await _unitOfWork.MLModelTemplateRepo
                .GetByConditionAsync(t => t.Id == mlModelTemplateDto.Id)
                .SingleOrDefaultAsync();

            // Check if entity exists before updating
            if (mLModelTemplate == null)
            {
                _logger.LogWarning("ML model template with ID {mlModelTemplateId} not found for update by user {UserId}.", mlModelTemplateDto.Id, _userId);
                serviceResponse.Message = "ML model template does not exist.";
                return serviceResponse;
            }

            // Map updated fields from DTO to entity
            mlModelTemplateDto.Adapt(mLModelTemplate);

            // Update audit field for last modified user
            mLModelTemplate.LastModifiedByUserId = _userId;

            // Mark entity as updated
            _unitOfWork.MLModelTemplateRepo.Update(mLModelTemplate);

            // Save changes to database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save updates to ML model template with ID {mlModelTemplateId} by user {UserId}.", mlModelTemplateDto.Id, _userId);
                return serviceResponse;
            }

            // Return updated entity as DTO
            serviceResponse.Data = mLModelTemplate.Adapt<MLModelTemplateDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML model template updated successfully.";

            _logger.LogInformation("Updated ML model template with ID {mlModelTemplateId} by user {UserId}.", mlModelTemplateDto.Id, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating ML model template with ID {mlModelTemplateId} for user {UserId}.", mlModelTemplateDto.Id, _userId);
        }

        return serviceResponse;
    }

    // Deletes an ML model template by its ID.
    public async Task<ServiceResponse<bool>> DeleteMLModelTemplateAsync(Guid mlModelTemplateId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete ML model template. Please try again."
        };

        try
        {
            // Find the template entity by ID
            var templateToDelete = await _unitOfWork.MLModelTemplateRepo
                .GetByConditionAsync(t => t.Id == mlModelTemplateId)
                .SingleOrDefaultAsync();

            // If not found, return warning message
            if (templateToDelete == null)
            {
                _logger.LogWarning("Attempted to delete non-existent ML model template with ID {mlModelTemplateId} by user {UserId}.", mlModelTemplateId, _userId);
                serviceResponse.Message = "ML model template does not exist.";
                return serviceResponse;
            }

            // Delete the entity
            _unitOfWork.MLModelTemplateRepo.Delete(templateToDelete);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete ML model template with ID {mlModelTemplateId} by user {UserId}.", mlModelTemplateId, _userId);
                serviceResponse.Message = "Failed to delete the ML model template.";
                return serviceResponse;
            }

            // Indicate success
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML model template deleted successfully.";

            _logger.LogInformation("Deleted ML model template with ID {mlModelTemplateId} by user {UserId}.", mlModelTemplateId, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting ML model template with ID {mlModelTemplateId} for user {UserId}.", mlModelTemplateId, _userId);
        }

        return serviceResponse;
    }

    // Deletes multiple ML model templates by their IDs.
    public async Task<ServiceResponse<bool>> DeleteMultipleMLModelTemplatesAsync(IEnumerable<Guid> mlModelTemplateIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete ML model templates. Please try again."
        };

        try
        {
            // Validate input list
            if (mlModelTemplateIds == null || !mlModelTemplateIds.Any())
            {
                _logger.LogWarning("No template IDs provided for bulk delete by user {UserId}.", _userId);
                serviceResponse.Message = "No ML model template IDs provided for deletion.";
                return serviceResponse;
            }

            // Fetch all templates matching provided IDs
            var mLModelTemplates = await _unitOfWork.MLModelTemplateRepo
                .GetByConditionAsync(t => mlModelTemplateIds.Contains(t.Id))
                .ToListAsync();

            // Check if any templates found to delete
            if (!mLModelTemplates.Any())
            {
                _logger.LogWarning("No matching ML model templates found for provided IDs for user {UserId}.", _userId);
                serviceResponse.Message = "No matching ML model templates found.";
                return serviceResponse;
            }

            // Delete all found templates
            _unitOfWork.MLModelTemplateRepo.Delete(mLModelTemplates);

            // Persist deletions
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to bulk delete ML model templates for user {UserId}.", _userId);
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML model templates deleted successfully.";

            _logger.LogInformation("Bulk deleted ML model templates with IDs [{mlModelTemplateIds}] for user {UserId}.", string.Join(", ", mlModelTemplateIds), _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error bulk deleting ML model templates for user {UserId}.", _userId);
        }

        return serviceResponse;
    }

    // Retrieves all ML model templates optionally filtered by ML model ID.
    public async Task<ServiceResponse<IEnumerable<MLModelTemplateDto>>> GetTrendingMLModelTemplatesAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<MLModelTemplateDto>>
        {
            Data = null,
            Message = "Failed to retrieve ML model templates. Please try again."
        };

        try
        {
            // Start with all templates
            var mLModelTemplates = await _unitOfWork.MLModelTemplateRepo
                .GetAllAsync()
                .Include(i => i.CreatedByUser)
                .Include(i => i.MLModelVersion)
                .ThenInclude(i2 => i2.MLModel)
                .OrderByDescending(o => o.UsagesCount)
                .ToListAsync();

            // Populate service response with successful data
            serviceResponse.Data = mLModelTemplates.Adapt<IEnumerable<MLModelTemplateDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML model templates retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while retrieving ML model templates for user {UserId}.", _userId);
        }

        return serviceResponse;
    }
}
