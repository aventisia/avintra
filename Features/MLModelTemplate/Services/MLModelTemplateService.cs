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
            var mlModel = await _unitOfWork.AIProjectRepo
                .GetByConditionAsync(w => w.Id == publishMLModelTemplateDto.RefId)
                .Include(i => i.Versions!)
                .ThenInclude(i2 => i2.Tasks!)
                .SingleOrDefaultAsync();

            // Check if the ML model exists
            if (mlModel == null)
            {
                _logger.LogError("ML model template with ID {TemplateId} not found.", publishMLModelTemplateDto.Id);
                serviceResponse.Message = "ML model not found.";
                return serviceResponse;
            }

            // // Check if the ML model has any associated tasks for Inferencing type
            // if (!mlModel.Tasks.Any() && mlModel.Type == ModelTypesEnum.Inferencing)
            // {
            //     _logger.LogError("ML model template with ID {TemplateId} has no associated tasks for inferencing.", publishMLModelTemplateDto.Id);
            //     serviceResponse.Message = "The ML model for inferencing has no associated tasks.";
            //     return serviceResponse;
            // }

            // // Check if the ML model has a ConversationalModel for Conversation type
            // if (mlModel.ConversationalModel == null && mlModel.Type == ModelTypesEnum.Conversation)
            // {
            //     _logger.LogError("ML model template with ID {TemplateId} has no associated conversational model.", publishMLModelTemplateDto.Id);
            //     serviceResponse.Message = "The conversational model setup is incomplete.";
            //     return serviceResponse;
            // }

            // string setupData = "";
            // var llmNames = new List<string>();
            // // If the model type is 'Inferencing', fetch and serialize its setup configuration
            // if (mlModel.Type == ModelTypesEnum.Inferencing)
            // {
            //     var inferencingData = await _inferencingModelService.GetSetupByMLModelIdAsync(mlModel.Id, null);
            //     var templateData = inferencingData.Data.Adapt<InferencingModelTemplateDto>();
            //     llmNames = new List<string>
            //     {
            //         templateData?.Extraction?.LLM,
            //         templateData?.Classification?.LLM,
            //         templateData?.Summarization?.LLM,
            //         templateData?.SentimentAnalytics?.LLM,
            //         templateData?.QuestionAnswer?.LLM
            //     }.Where(x => !string.IsNullOrEmpty(x))
            //     .Distinct()
            //     .ToList();
            //     setupData = JsonSerializer.Serialize(templateData, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            // }

            // // If the model type is 'Conversation', fetch and serialize its setup configuration
            // else if (mlModel.Type == ModelTypesEnum.Conversation)
            // {
            //     var conversionData = await _conversationModelService.GetSetupByMLModelIdAsync(mlModel.Id);
            //     var templateData = conversionData.Data.Adapt<ConversationModelDto>();
            //     llmNames = new List<string>
            //     {
            //         templateData?.AIPersona?.LLM,
            //     }.Where(w => !string.IsNullOrEmpty(w))
            //     .Distinct()
            //     .ToList();
            //     setupData = JsonSerializer.Serialize(templateData, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            // }

            // Clean all string properties in the input DTO to remove leading/trailing whitespaces
            publishMLModelTemplateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(publishMLModelTemplateDto);

            // Map the cleaned DTO to an MLModelTemplate entity
            var mlModelTemplate = publishMLModelTemplateDto.Adapt<MLModelTemplate>();

            // Set additional configuration and model type
            mlModelTemplate.Type = mlModel.Type;
            // mlModelTemplate.ConfigJson = setupData;
            // mlModelTemplate.Icons = GetServiceItemDetailUtil.GetIconsByDisplayNames(llmNames);

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

    // Retrieves the AI model template schema for a given project version.
    public async Task<ServiceResponse<AIModelTemplateSchemaDto>> GetAIModelTemplateSchemaAsync(Guid projectVersionId)
    {
        // Initialize the service response with a default failure message
        var serviceResponse = new ServiceResponse<AIModelTemplateSchemaDto>
        {
            Data = null,
            Message = "Unable to retrieve the AI model template schema. Please try again later."
        };

        try
        {
            // Attempt to fetch the AI project version using the provided version ID
            var aiProjectVersion = await _unitOfWork.AIProjectVersionRepo
                .GetByConditionAsync(w => w.Id == projectVersionId)
                .Include(i => i.AIProject)
                .Include(i => i.Tasks!)
                .SingleOrDefaultAsync();

            // If the project version is not found, log the error and return an appropriate message
            if (aiProjectVersion == null)
            {
                _logger.LogError("AI project version with ID {ProjectVersionId} not found.", projectVersionId);
                serviceResponse.Message = "The specified AI project version could not be found.";
                return serviceResponse;
            }

            // If no tasks are found for an inferencing model, log an error and return a failure message
            if (!aiProjectVersion.Tasks.Any() && aiProjectVersion.AIProject.Type == AIProjectTypeEnum.Inferencing)
            {
                _logger.LogError("No tasks found for inferencing model with ID {ProjectVersionId}.", projectVersionId);
                serviceResponse.Message = "No tasks are associated with this inferencing model.";
                return serviceResponse;
            }

            // Set up JSON deserialization options for case-insensitive property matching
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            // Placeholder for serialized setup data (JSON format)
            string setupData = "";

            // List to store unique LLM names from the project version's tasks
            var llmNames = new List<string>();

            // Only proceed if the AI project version is of type 'Inferencing'
            if (aiProjectVersion.AIProject.Type == AIProjectTypeEnum.Inferencing)
            {
                // Retrieve specific tasks related to various inferencing model types
                var summarizationTask = aiProjectVersion.Tasks.FirstOrDefault(w => w.Name == InferencingModelTypesEnum.Summarization.ToString());
                var extractionTask = aiProjectVersion.Tasks.FirstOrDefault(w => w.Name == InferencingModelTypesEnum.Extraction.ToString());
                var classificationTask = aiProjectVersion.Tasks.FirstOrDefault(w => w.Name == InferencingModelTypesEnum.Classification.ToString());
                var questionAnswerTask = aiProjectVersion.Tasks.FirstOrDefault(w => w.Name == InferencingModelTypesEnum.QuestionAnswer.ToString());
                var sentimentAnalyticsTask = aiProjectVersion.Tasks.FirstOrDefault(w => w.Name == InferencingModelTypesEnum.SentimentAnalytics.ToString());

                // Construct the template configuration data based on the available tasks
                var templateData = new AIModelTemplateConfigDto()
                {
                    Name = aiProjectVersion.AIProject.Name,
                    Description = aiProjectVersion.AIProject.Description,
                    BusinessContext = aiProjectVersion.BusinessContext,

                    // Summarization task configuration
                    Summarization = summarizationTask != null ? new SummarizationTemplateConfigDto()
                    {
                        Name = summarizationTask.Name,
                        NodePrompt = summarizationTask.SystemPrompt,
                        LLM = summarizationTask.LLM,
                        Temperature = summarizationTask.Temperature,
                        ConfigurationType = summarizationTask.IsBYOKEnabled ? LLMConfigurationTypesEnum.Cloud : LLMConfigurationTypesEnum.OnPrem,
                        SetupObject = JsonSerializer.Deserialize<SummarizationTemplateConfigDetailsDto>(summarizationTask.SetupObject, options),
                        SecretKey = null,
                    } : null,

                    // Data extraction task configuration
                    Extraction = extractionTask != null ? new DataExtractionTemplateConfigDto()
                    {
                        Name = extractionTask.Name,
                        NodePrompt = extractionTask.SystemPrompt,
                        LLM = extractionTask.LLM,
                        Temperature = extractionTask.Temperature,
                        ConfigurationType = extractionTask.IsBYOKEnabled ? LLMConfigurationTypesEnum.Cloud : LLMConfigurationTypesEnum.OnPrem,
                        SetupObject = JsonSerializer.Deserialize<DataExtractionTemplateConfigDetailsDto>(extractionTask.SetupObject, options),
                        SecretKey = null,
                    } : null,

                    // Classification task configuration
                    Classification = classificationTask != null ? new ClassificationTemplateConfigDto()
                    {
                        Name = classificationTask.Name,
                        NodePrompt = classificationTask.SystemPrompt,
                        LLM = classificationTask.LLM,
                        Temperature = classificationTask.Temperature,
                        ConfigurationType = classificationTask.IsBYOKEnabled ? LLMConfigurationTypesEnum.Cloud : LLMConfigurationTypesEnum.OnPrem,
                        SetupObject = JsonSerializer.Deserialize<ClassificationTemplateConfigDetailsDto>(classificationTask.SetupObject, options),
                        SecretKey = null,
                    } : null,

                    // Sentiment analytics task configuration
                    SentimentAnalytics = sentimentAnalyticsTask != null ? new SentimentAnalysisTemplateConfigDto()
                    {
                        Name = sentimentAnalyticsTask.Name,
                        NodePrompt = sentimentAnalyticsTask.SystemPrompt,
                        LLM = sentimentAnalyticsTask.LLM,
                        Temperature = sentimentAnalyticsTask.Temperature,
                        ConfigurationType = sentimentAnalyticsTask.IsBYOKEnabled ? LLMConfigurationTypesEnum.Cloud : LLMConfigurationTypesEnum.OnPrem,
                        SetupObject = JsonSerializer.Deserialize<SentimentAnalysisTemplateConfigDetailsDto>(sentimentAnalyticsTask.SetupObject, options),
                        SecretKey = null,
                    } : null,

                    // Question answering task configuration
                    QuestionAnswer = questionAnswerTask != null ? new QuestionAnsweringTemplateConfigDto()
                    {
                        Name = questionAnswerTask.Name,
                        NodePrompt = questionAnswerTask.SystemPrompt,
                        LLM = questionAnswerTask.LLM,
                        Temperature = questionAnswerTask.Temperature,
                        ConfigurationType = questionAnswerTask.IsBYOKEnabled ? LLMConfigurationTypesEnum.Cloud : LLMConfigurationTypesEnum.OnPrem,
                        SetupObject = JsonSerializer.Deserialize<QuestionAnsweringTemplateConfigDetailsDto>(questionAnswerTask.SetupObject, options),
                        SecretKey = null,
                    } : null,
                };

                // Gather unique LLM names across all tasks, ensuring no duplicates
                llmNames = new List<string>
                {
                    templateData?.Extraction?.LLM,
                    templateData?.Classification?.LLM,
                    templateData?.Summarization?.LLM,
                    templateData?.SentimentAnalytics?.LLM,
                    templateData?.QuestionAnswer?.LLM
                }
                .Where(w => !string.IsNullOrEmpty(w))
                .Distinct()
                .ToList();

                // Serialize the template configuration into JSON for storage
                setupData = JsonSerializer.Serialize(templateData, options);
            }
            // // If the model type is 'Conversational', retrieve and serialize its setup configuration
            // else if (aiProjectVersion.AIProject.Type == AIProjectTypeEnum.Conversational)
            // {
            //     // Fetch the task related to the Conversational model type, specifically "AIPersona"
            //     var conversationalTask = aiProjectVersion.Tasks.FirstOrDefault(w => w.Name == "AIPersona");

            //     // Create the template configuration for the Conversational model
            //     var templateData = new AIModelTemplateConfigDto()
            //     {
            //         Name = aiProjectVersion.AIProject.Name,
            //         Description = aiProjectVersion.AIProject.Description,
            //         BusinessContext = aiProjectVersion.BusinessContext,

            //         // If the 'AIPersona' task exists, map its configuration to the Conversational setup
            //         AIPersona = conversationalTask != null ? new SummarizationTemplateConfigDto()
            //         {
            //             Name = conversationalTask.Name,
            //             NodePrompt = conversationalTask.SystemPrompt,
            //             LLM = conversationalTask.LLM,
            //             Temperature = conversationalTask.Temperature,
            //             ConfigurationType = conversationalTask.IsBYOKEnabled ? LLMConfigurationTypesEnum.Cloud : LLMConfigurationTypesEnum.OnPrem,
            //             SetupObject = JsonSerializer.Deserialize<SummarizationTemplateConfigDetailsDto>(conversationalTask.SetupObject, options),
            //             SecretKey = null,
            //         } : null,
            //     };

            //     // Collect the unique LLM (Language Learning Model) names from the task and remove duplicates
            //     llmNames = new List<string>
            //     {
            //         conversationalTask?.LLM,
            //     }
            //     .Where(w => !string.IsNullOrEmpty(w))
            //     .Distinct()
            //     .ToList();

            //     // Serialize the template data to a JSON string, using case-insensitive property matching
            //     setupData = JsonSerializer.Serialize(templateData, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            // }

            // // If the model type is 'Generative', retrieve and serialize its setup configuration
            // else if (aiProjectVersion.AIProject.Type == AIProjectTypeEnum.Generative)
            // {
            //     // Fetch the task related to the Generative model type, specifically "GenerativeModel"
            //     var generativeTask = aiProjectVersion.Tasks.FirstOrDefault(w => w.Name == "GenerativeModel");

            //     // Create the template configuration for the Generative model
            //     var templateData = new AIModelTemplateConfigDto()
            //     {
            //         Name = aiProjectVersion.AIProject.Name,
            //         Description = aiProjectVersion.AIProject.Description,
            //         BusinessContext = aiProjectVersion.BusinessContext,

            //         // If the 'GenerativeModel' task exists, map its configuration to the Generative setup
            //         GenerativeModel = generativeTask != null ? new SummarizationTemplateConfigDto()
            //         {
            //             Name = generativeTask.Name,
            //             NodePrompt = generativeTask.SystemPrompt,
            //             LLM = generativeTask.LLM,
            //             Temperature = generativeTask.Temperature,
            //             ConfigurationType = generativeTask.IsBYOKEnabled ? LLMConfigurationTypesEnum.Cloud : LLMConfigurationTypesEnum.OnPrem,
            //             SetupObject = JsonSerializer.Deserialize<SummarizationTemplateConfigDetailsDto>(generativeTask.SetupObject, options),
            //             SecretKey = null,
            //         } : null,
            //     };

            //     // Collect the unique LLM (Language Learning Model) names from the task and remove duplicates
            //     llmNames = new List<string>
            //     {
            //         generativeTask?.LLM,
            //     }
            //     .Where(w => !string.IsNullOrEmpty(w))
            //     .Distinct()
            //     .ToList();

            //     // Serialize the template data to a JSON string, using case-insensitive property matching
            //     setupData = JsonSerializer.Serialize(templateData, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            // }

            // Prepare the final schema response with version details, configuration data, and associated LLM names
            var aiModelTemplateConfigDto = new AIModelTemplateSchemaDto()
            {
                VersionId = aiProjectVersion.Id,
                DataObject = setupData,
                VersionNumber = aiProjectVersion.VersionNumber,
                LLMNames = llmNames
            };

            // Set the successful response data, status, and message
            serviceResponse.Data = aiModelTemplateConfigDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Successfully retrieved the AI model template schema.";

            // Log the successful retrieval of the template schema
            _logger.LogInformation("Successfully retrieved the AI model template schema for project version ID {ProjectVersionId} by user {UserId}.", aiProjectVersion.Id, _userId);
        }
        catch (Exception ex)
        {
            // Log any exception that occurs, providing detailed error information for debugging
            _logger.LogError(ex, "Error occurred while retrieving AI model template schema for user {UserId} and project version ID {ProjectVersionId}.", _userId, projectVersionId);
        }

        // Return the service response, indicating success or failure
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
    public async Task<ServiceResponse<IEnumerable<TrendingTemplateDto>>> GetTrendingMLModelTemplatesAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<TrendingTemplateDto>>
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
                .ProjectToType<TrendingTemplateDto>()
                .ToListAsync();

            // Populate service response with successful data
            serviceResponse.Data = mLModelTemplates;
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
    public async Task<ServiceResponse<TrendingTemplateDto>> UseTemplateToCreateMLModelAsync(TrendingTemplateDto trendingTemplateDto)
    {
        var serviceResponse = new ServiceResponse<TrendingTemplateDto>
        {
            Message = "Failed to add template. Please try again."
        };

        try
        {
            // Trim string properties for cleanliness, removing any unnecessary whitespaces.
            trendingTemplateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(trendingTemplateDto);

            // Check if the template already exists in the database by matching its ID.
            var templateEntity = await _unitOfWork.MLModelTemplateRepo
                .GetByConditionAsync(w => w.Id == trendingTemplateDto.Id)
                .SingleOrDefaultAsync();

            if (templateEntity == null)
            {
                // If no template is found, log a warning and return an error response.
                _logger.LogWarning("Template with ID {TemplateId} not found in the database.", trendingTemplateDto.Id);
                serviceResponse.Message = "Template not found in the database.";
                return serviceResponse;
            }

            // Fetch the existing ML model using the RefId from the template.
            var mlModelEntity = await _unitOfWork.AIProjectRepo
                .GetByConditionAsync(w => w.Id == trendingTemplateDto.RefId)
                .AsNoTracking()
                .Include(i => i.CreatedByUser)
                .FirstOrDefaultAsync();

            if (mlModelEntity == null)
            {
                // If the ML model doesn't exist, we create a new one from the template and set user-related fields.
                _logger.LogInformation("ML Model not found for template ID {TemplateId}. Creating a new model.", trendingTemplateDto.Id);
                mlModelEntity = trendingTemplateDto.Adapt<AIProject>();
                mlModelEntity.CreatedByUserId = _userId;
                mlModelEntity.LastModifiedByUserId = _userId;

                // Insert the newly created ML model into the repository.
                await _unitOfWork.AIProjectRepo.InsertAsync(mlModelEntity);

                // Check if the entity was successfully saved; if not, log an error and return the response.
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save ML model entity for template ID: {TemplateId}.", trendingTemplateDto.Id);
                    return serviceResponse;
                }

                // Log successful model creation and saving.
                _logger.LogInformation("ML Model successfully created for template ID: {TemplateId}.", trendingTemplateDto.Id);
            }

            // Handle specific configurations based on the model type ('Inferencing' or 'Conversation').
            if (templateEntity.Type == AIProjectTypeEnum.Inferencing)
            {
                // Deserialize and update the Inferencing model configuration.
                var templateSetup = JsonSerializer.Deserialize<InferencingModelTemplateDto>(templateEntity.ConfigJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                var inferencingData = templateSetup.Adapt<InferencingModelDto>();
                inferencingData.Id = mlModelEntity.Id;
                inferencingData.Name = templateEntity.Name;
                inferencingData.Description = templateEntity.Description;

                // Log the update process for the Inferencing model.
                _logger.LogInformation("Updating Inferencing setup for ML model ID: {ModelId}.", mlModelEntity.Id);
                await _inferencingModelService.UpdateSetupAsync(inferencingData);
            }
            else if (templateEntity.Type == AIProjectTypeEnum.Conversational)
            {
                // Deserialize and update the Conversation model configuration.
                var conversationData = JsonSerializer.Deserialize<ConversationModelDto>(templateEntity.ConfigJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                conversationData.Id = mlModelEntity.Id;
                conversationData.Name = templateEntity.Name;
                conversationData.Description = templateEntity.Description;

                // Log the update process for the Conversation model.
                _logger.LogInformation("Updating Conversation setup for ML model ID: {ModelId}.", mlModelEntity.Id);
                await _conversationModelService.UpdateSetupAsync(conversationData);
            }

            // Increase the usage count for the template by 1.
            templateEntity.UsagesCount++;

            // Update the template entity in the repository.
            _unitOfWork.MLModelTemplateRepo.Update(templateEntity);

            // Try saving the changes and log an error if the save operation fails.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save the updated ML model entity for template ID: {TemplateId}.", trendingTemplateDto.Id);
                return serviceResponse;
            }

            // Fetch the updated ML model entity with the user information included.
            mlModelEntity = await _unitOfWork.AIProjectRepo
                .GetByConditionAsync(w => w.Id == mlModelEntity.Id)
                .AsNoTracking()
                .Include(i => i.CreatedByUser)
                .FirstOrDefaultAsync();

            // Log success and return the updated template.
            _logger.LogInformation("Template successfully saved to the Template Library. Template ID: {TemplateId}.", trendingTemplateDto.Id);
            serviceResponse.Data = mlModelEntity.Adapt<TrendingTemplateDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Template added successfully.";
        }
        catch (Exception ex)
        {
            // In case of an exception, log the error with relevant details for troubleshooting.
            _logger.LogError(ex, "An error occurred while saving the template with ID {TemplateId} to the Template Library.", trendingTemplateDto.Id);
        }

        return serviceResponse;
    }
}
