namespace MLModelBuilderAPIs.Services;

public class MLModelTemplateService : IMLModelTemplateService
{
    private readonly ILogger<MLModelTemplateService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IInferencingModelService _inferencingModelService;
    private readonly IConversationModelService _conversationModelService;
    private readonly Guid _userId;

    public MLModelTemplateService(
        ILogger<MLModelTemplateService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IInferencingModelService inferencingModelService,
        IConversationModelService conversationModelService)
    {
        // Extract user ID from the HTTP context claims; default to empty Guid if missing
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _inferencingModelService = inferencingModelService;
        _conversationModelService = conversationModelService;
    }

    // Retrieves all ML model templates.
    public async Task<ServiceResponse<IEnumerable<MLModelTemplateDto>>> GetAllMLModelTemplatesAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<MLModelTemplateDto>>
        {
            Data = null,
            Message = "Failed to retrieve ML model templates. Please try again."
        };

        try
        {
            // Get all templates
            var mlModelTemplates = await _unitOfWork.MLModelTemplateRepo
                .GetByConditionAsync(w =>
                    w.CreatedByUserId == _userId ||
                    w.AccessType == AccessTypesEnum.Public ||
                    w.AccessType == AccessTypesEnum.TenantLevel
                )
                .Include(i => i.CreatedByUser)
                .ToListAsync();

            // Populate service response with successful data
            serviceResponse.Data = mlModelTemplates.Adapt<IEnumerable<MLModelTemplateDto>>();
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
                .GetByConditionAsync(w =>
                    w.Id == mlModelTemplateId &&
                    w.CreatedByUserId == _userId ||
                    (
                        w.AccessType == AccessTypesEnum.TenantLevel ||
                        w.AccessType == AccessTypesEnum.Public
                    )
                )
                .Include(i => i.CreatedByUser)
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

    // Publishes a machine learning model template by mapping input data, configuring the template, and persisting it to the database.
    public async Task<ServiceResponse<MLModelTemplateDto>> PublishMLModelTemplateAsync(PublishMLModelTemplateDto publishMLModelTemplateDto)
    {
        // Initialize the response with default failure message
        var serviceResponse = new ServiceResponse<MLModelTemplateDto>
        {
            Data = null,
            Message = "Failed to publish ML model template. Please try again."
        };

        try
        {
            // Retrieve the existing ML model based on the provided reference ID
            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == publishMLModelTemplateDto.RefId)
                .SingleOrDefaultAsync();

            // Check if the ML model exists
            if (mlModel == null)
            {
                _logger.LogError("ML model template with ID {TemplateId} not found.", publishMLModelTemplateDto.Id);
                serviceResponse.Message = "ML model not found.";
                return serviceResponse;
            }

            string setupData = "";

            // If the model type is 'Inferencing', fetch and serialize its setup configuration
            if (mlModel.Type == ModelTypesEnum.Inferencing)
            {
                var inferencing = await _inferencingModelService.GetSetupByMLModelIdAsync(mlModel.Id);
                setupData = JsonSerializer.Serialize(inferencing.Data, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }

            // If the model type is 'Conversation', fetch and serialize its setup configuration
            else if (mlModel.Type == ModelTypesEnum.Conversation)
            {
                var conversion = await _conversationModelService.GetSetupByMLModelIdAsync(mlModel.Id);
                setupData = JsonSerializer.Serialize(conversion, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }

            // Clean all string properties in the input DTO to remove leading/trailing whitespaces
            publishMLModelTemplateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(publishMLModelTemplateDto);

            // Map the cleaned DTO to an MLModelTemplate entity
            var mlModelTemplate = publishMLModelTemplateDto.Adapt<MLModelTemplate>();

            // Set additional configuration and model type
            mlModelTemplate.Type = mlModel.Type;
            mlModelTemplate.ConfigJson = setupData;

            // Set auditing fields
            mlModelTemplate.CreatedByUserId = _userId;
            mlModelTemplate.LastModifiedByUserId = _userId;
            mlModelTemplate.LastModifiedOn = DateTime.UtcNow;

            // Update the template in the repository
            _unitOfWork.MLModelTemplateRepo.Update(mlModelTemplate);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to publish ML model template with ID {TemplateId} by user {UserId}.", mlModelTemplate.Id, _userId);
                return serviceResponse;
            }

            // Map the updated entity back to a DTO for returning to the client
            serviceResponse.Data = mlModelTemplate.Adapt<MLModelTemplateDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML model template published successfully.";

            // Log the successful operation
            _logger.LogInformation("Published ML model template with ID {TemplateId} by user {UserId}.", mlModelTemplate.Id, _userId);
        }
        catch (Exception ex)
        {
            // Log any unexpected exception during the publish process
            _logger.LogError(ex, "Error publishing ML model template for user {UserId}.", _userId);
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
                .GetByConditionAsync(w =>
                    w.Id == mlModelTemplateDto.Id
                )
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
    public async Task<ServiceResponse<IEnumerable<TrendingMLModelTemplateDto>>> GetTrendingMLModelTemplatesAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<TrendingMLModelTemplateDto>>
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
                .OrderByDescending(o => o.UsagesCount)
                .ToListAsync();

            // Populate service response with successful data
            serviceResponse.Data = mLModelTemplates.Adapt<IEnumerable<TrendingMLModelTemplateDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML model templates retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while retrieving ML model templates for user {UserId}.", _userId);
        }

        return serviceResponse;
    }

    // Uses a selected trending Worc template to create a new ml model
    public async Task<ServiceResponse<UseTemplateDto>> UseTemplateToCreateMLModelAsync(TrendingMLModelTemplateDto trendingTemplateDto)
    {
        var serviceResponse = new ServiceResponse<UseTemplateDto>
        {
            Message = "Failed to add template. Please try again."
        };

        try
        {
            // Trim string properties for cleanliness and ensure no extra whitespace
            trendingTemplateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(trendingTemplateDto);

            // Check if the template already exists in the database
            var templateEntity = await _unitOfWork.MLModelTemplateRepo.GetByConditionAsync(w => w.Id == trendingTemplateDto.Id).SingleOrDefaultAsync();
            if (templateEntity == null)
            {
                _logger.LogWarning("Template not found in the database for ID: {TemplateId}", trendingTemplateDto.Id);
                serviceResponse.Message = "Template not found in the database.";
                return serviceResponse;
            }

            // Map the DTO to ml model entity and set user information
            var mlModelEntity = trendingTemplateDto.Adapt<MLModel>();
            mlModelEntity.Type = templateEntity.Type;
            mlModelEntity.CreatedByUserId = _userId;
            mlModelEntity.LastModifiedByUserId = _userId;

            // Insert the ml model entity into the repository
            await _unitOfWork.MLModelRepo.InsertAsync(mlModelEntity);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save ml model entity for template ID: {TemplateId}", trendingTemplateDto.Id);
                return serviceResponse;
            }

            // If the model type is 'Inferencing', fetch and serialize its setup configuration
            if (mlModelEntity.Type == ModelTypesEnum.Inferencing)
            {
                var inferencingData = JsonSerializer.Deserialize<InferencingModelDto>(templateEntity.ConfigJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                inferencingData.Id = mlModelEntity.Id;
                await _inferencingModelService.UpdateSetupAsync(inferencingData);
            }

            // If the model type is 'Conversation', fetch and serialize its setup configuration
            else if (mlModelEntity.Type == ModelTypesEnum.Conversation)
            {
                var conversationData = JsonSerializer.Deserialize<InferencingModelDto>(templateEntity.ConfigJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                conversationData.Id = mlModelEntity.Id;
                await _inferencingModelService.UpdateSetupAsync(conversationData);
            }

            mlModelEntity = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mlModelEntity.Id)
                .Include(i => i.CreatedByUser)
                .FirstOrDefaultAsync();

            // If everything succeeds, log success and update the response
            _logger.LogInformation("Template successfully saved to the Template Library. Template ID: {TemplateId}", trendingTemplateDto.Id);
            serviceResponse.Data = mlModelEntity.Adapt<UseTemplateDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Template added successfully.";
        }
        catch (Exception ex)
        {
            // Log the exception with details for debugging
            _logger.LogError(ex, "An error occurred while saving template to Template Library.");
        }

        return serviceResponse;
    }
}

