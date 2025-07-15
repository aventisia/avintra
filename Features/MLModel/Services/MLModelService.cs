namespace MLModelBuilderAPIs.Services;

public class MLModelService : IMLModelService
{
    private readonly ILogger<MLModelService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IExtractionSetupService _extractionSetupService;
    private readonly Guid _userId;

    public MLModelService(
        ILogger<MLModelService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IExtractionSetupService extractionSetupService)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _extractionSetupService = extractionSetupService;
    }

    // Get the list of model records created by the user
    public async Task<ServiceResponse<IEnumerable<MLModelDto>>> GetMLModelListAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<MLModelDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get model records created by the user
            var mlModels = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w =>
                    w.CreatedByUserId == _userId)
                .OrderByDescending(o => o.CreatedOn)
                .ProjectToType<MLModelDto>()
                .ToListAsync();

            // Task successful
            serviceResponse.Data = mlModels.Adapt<IEnumerable<MLModelDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Models retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Checks the availability of a model name.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsMLModelNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check model name availability. Please try again"
        };

        try
        {
            // Validate model uniqueness
            var modelAlreadyExists = await _unitOfWork.MLModelRepo
                                                        .GetByConditionAsync(w =>
                                                            w.CreatedByUserId == _userId &&
                                                            w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
                                                        .FirstOrDefaultAsync();

            // Model already exists
            if (modelAlreadyExists != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "A model with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Model name is available";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Creates a model record
    public async Task<ServiceResponse<MLModelDto>> InsertMLModelAsync(MLModelDto mlModelDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<MLModelDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate model uniqueness
            var modelAlreadyExists = await _unitOfWork.MLModelRepo
                                                        .GetByConditionAsync(w =>
                                                            w.CreatedByUserId == _userId &&
                                                            w.Name.ToLower() == mlModelDto.Name.Trim().ToLower())
                                                        .FirstOrDefaultAsync();

            // Model already exists
            if (modelAlreadyExists != null)
            {
                _logger.LogInformation($"Model already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A model with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto' string props
            mlModelDto = TrimDtoStringPropsUtil.TrimDtoStringProps(mlModelDto);

            // Default mapping
            var newMLModel = mlModelDto.Adapt<MLModel>();
            newMLModel.SetupObject = GetDefaultSerializedSetupByModel(newMLModel);
            newMLModel.Accuracy = (decimal?)90.00;
            newMLModel.SetupStatus = SetupStatusTypesEnum.Pending;
            newMLModel.CreatedByUserId = _userId;
            newMLModel.LastModifiedByUserId = _userId;

            // Initialize extraction setup

            //Insert a model record
            await _unitOfWork.MLModelRepo.InsertAsync(newMLModel);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting a Model record.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newMLModel.Adapt<MLModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Model added successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Update model record
    public async Task<ServiceResponse<MLModelDto>> UpdateMLModelAsync(MLModelDto mlModelDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<MLModelDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate model record existence
            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w =>
                    w.Id == mlModelDto.Id &&
                    w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // Model does not exist
            if (mlModel == null)
            {
                _logger.LogInformation($"Model does not exist");
                serviceResponse.Message = "Model does not exist";
                return serviceResponse;
            }

            // Prevent updates to published models
            if (mlModel.IsPublished)
            {
                // Published models are read-only to maintain data integrity and consistency
                _logger.LogWarning("Attempt to update a published ML model | Model ID: {ModelId} | User ID: {UserId}", mlModelDto.Id, _userId);

                serviceResponse.Message = "This model has already been published and cannot be modified.";
                return serviceResponse;
            }

            // Validate model uniqueness
            var modelAlreadyExists = await _unitOfWork.MLModelRepo
                                                        .GetByConditionAsync(w =>
                                                            w.CreatedByUserId == _userId &&
                                                            w.Name.ToLower() == mlModelDto.Name.Trim().ToLower()
                                                            && w.Id != mlModelDto.Id)
                                                        .FirstOrDefaultAsync();

            // Model already exists
            if (modelAlreadyExists != null)
            {
                _logger.LogInformation($"Model already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A model with same name already exists. Please enter a unique name";
                return serviceResponse;
            }


            // Prevent changing setup status from 'Completed' to any other status
            if (mlModel.SetupStatus == SetupStatusTypesEnum.Completed &&
                mlModelDto.SetupStatus != SetupStatusTypesEnum.Completed)
            {
                _logger.LogInformation("Cannot change setup status from 'Completed'.");
                serviceResponse.Message = "Setup status change not allowed.";
                return serviceResponse;
            }
            // Trim dto' string props
            mlModelDto = TrimDtoStringPropsUtil.TrimDtoStringProps(mlModelDto);

            // Auto mapping 
            var newMLModel = mlModelDto.Adapt(mlModel);
            newMLModel.Accuracy = (decimal?)90.00;
            newMLModel.CreatedByUserId = _userId;
            newMLModel.LastModifiedByUserId = _userId;

            // Update Model record
            _unitOfWork.MLModelRepo.Update(newMLModel);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating a Model.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newMLModel.Adapt<MLModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Model updated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Delete model record
    public async Task<ServiceResponse<bool>> DeleteMLModelAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            // Try to get model record
            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w =>
                    w.Id == id &&
                    w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // Model record does not exist
            if (mlModel == null)
            {
                _logger.LogInformation($"Model does not exist");
                serviceResponse.Message = "Model does not exist";
                return serviceResponse;
            }

            // Delete Model
            _unitOfWork.MLModelRepo.Delete(mlModel);

            // Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting a Model");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Model deleted successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Get a Model by identifier
    public async Task<ServiceResponse<MLModelDto>> GetMLModelByIdAsync(Guid modelId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<MLModelDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get a Model using identifier
            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == modelId).Include(i => i.CreatedByUser)
                .ProjectToType<MLModelDto>()
                .SingleOrDefaultAsync();

            // Check if Model not exists
            if (mlModel == null)
            {
                _logger.LogInformation($"Model does not exist");
                serviceResponse.Message = "Model does not exist";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = mlModel.Adapt<MLModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Model retrieved successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Initializes and serializes the default setup configuration based on the model type.
    private string? GetDefaultSerializedSetupByModel(MLModel newMLModel)
    {
        // Set up configuration based on the model type in the provided newMLModel object.
        switch (newMLModel.Type)
        {
            case ModelTypesEnum.Extraction:
                // Configuration for the extraction model type: defines how to extract relevant information.
                var extractionSetup = new ExtractionSetupDto
                {
                    Temperature = 0.2,
                    Context = string.Empty,
                    Prompt = string.Empty,
                    TableMetadata = null,
                    FieldSetups = new List<FieldSetupDto>
                {
                    new FieldSetupDto
                    {
                        Name = string.Empty,
                        Type = string.Empty,
                        Instructions = string.Empty
                    }
                }
                };

                // Serialize the extraction setup configuration and return as a JSON string.
                return JsonSerializer.Serialize(extractionSetup);

            case ModelTypesEnum.Classification:
                // Configuration for the classification model type: defines categories and instructions for content classification.
                var classificationSetup = new ClassificationSetupDto
                {
                    Temperature = 0.2,
                    Context = string.Empty,
                    Prompt = string.Empty,
                    AllowMultipleClasses = false,
                    Categories = new List<ClassificationCategoryDto>
                {
                    new ClassificationCategoryDto
                    {
                        Name = string.Empty,
                        Instructions = string.Empty
                    }
                }
                };

                // Serialize the classification setup configuration and return as a JSON string.
                return JsonSerializer.Serialize(classificationSetup);

            case ModelTypesEnum.SentimentAnalytics:
                // Configuration for the sentiment analysis model type: defines sentiment categories and their instructions.
                var sentimentAnalyticsSetup = new SentimentAnalyticSetupDto
                {
                    Temperature = 0.2,
                    Context = string.Empty,
                    Prompt = string.Empty,
                    Categories = new List<SentimentAnalyticsSetupCategoryDto>
                {
                    new SentimentAnalyticsSetupCategoryDto
                    {
                        Name = string.Empty,
                        Instructions = string.Empty
                    }
                }
                };

                // Serialize the sentiment analysis setup configuration and return as a JSON string.
                return JsonSerializer.Serialize(sentimentAnalyticsSetup);

            // Setup for the Summarization model type (currently no specific configuration is defined).
            case ModelTypesEnum.Summarization:
                // Configuration for summarization model type (if needed in the future).
                var summarizationSetup = new SummarizationSetupDto
                {
                    Temperature = 0.2,
                    Context = string.Empty,
                    CharactersPerChunk = 0,
                    ChunkOverlap = 0,
                    TotalMinimumWords = 0,
                    TotalMaximumWords = 0,
                    SummarizationMethod = null,
                };

                // Serialize the summarization setup configuration and return as a JSON string.
                return JsonSerializer.Serialize(summarizationSetup);

            // Setup for the Question Answer model type (currently no specific configuration is defined).
            case ModelTypesEnum.QuestionAnswer:
                // Configuration for question answering model type (if needed in the future).
                var questionAnswerSetup = new QuestionAnswerSetupDto
                {
                    Temperature = 0.2,
                    Context = string.Empty,
                    Prompt = string.Empty,
                    QuestionAnswers = new List<QuestionAnswerLabelDto>()
                    {
                        new QuestionAnswerLabelDto()
                        {
                            Name = string.Empty,
                            Instructions = string.Empty
                        }
                    }
                };

                // Serialize the question answer setup configuration and return as a JSON string.
                return JsonSerializer.Serialize(questionAnswerSetup);

            // Initialize configuration for the AI Persona model type (currently using default or empty values).
            case ModelTypesEnum.AIPersona:
                // Placeholder setup for future enhancements to the AI Persona model configuration.
                var aiPersonaSetup = new AIPersonaSetupDto
                {
                    Name = string.Empty,
                    RoleOrObjective = string.Empty,
                    CategoryOrDomain = string.Empty,
                    ToneOfVoice = string.Empty,
                    Instructions = string.Empty,
                    ExclusionsOrBoundaries = string.Empty,
                    Documents = null,
                    ContextMemoryTimeframe = string.Empty,
                    Temperature = 0.7,
                    EnableAudio = false,
                    EnableVideo = false,
                    EnableChat = false,
                };

                // Convert the AI Persona setup configuration into a JSON string and return it.
                return JsonSerializer.Serialize(aiPersonaSetup);


            // Default case: returns an empty string for any unrecognized model types.
            default:
                return null;
        }
    }

    // Publishes an ML model by setting its IsPublished property to true.
    public async Task<ServiceResponse<bool>> PublishMLModelAsync(Guid mlModelId)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to publish the model. Please try again."
        };

        try
        {
            // Retrieve the ML model by ID and user ownership
            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mlModelId && w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // If model not found, return appropriate message
            if (mlModel == null)
            {
                _logger.LogWarning("Publish failed: ML model with ID {ModelId} was not found or does not belong to user {UserId}.", mlModelId, _userId);
                serviceResponse.Message = "The specified model does not exist.";
                return serviceResponse;
            }

            // If model is already published, return conflict message
            if (mlModel.IsPublished)
            {
                _logger.LogInformation("Publish skipped: ML model with ID {ModelId} is already published.", mlModelId);
                serviceResponse.Message = "The model is already published.";
                return serviceResponse;
            }

            // Set IsPublished to true and update last modified user
            mlModel.IsPublished = true;
            mlModel.PublishedOn = DateTime.UtcNow;
            mlModel.LastModifiedByUserId = _userId;

            // Update the model in the repository
            _unitOfWork.MLModelRepo.Update(mlModel);

            // Save changes to the database, if fail return failure response
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist publishing changes for model with ID {ModelId}.", mlModelId);
                return serviceResponse;
            }

            // On success, set response data and status code
            _logger.LogInformation("ML model with ID {ModelId} published successfully by user {UserId}.", mlModelId, _userId);
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "The model has been published successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while publishing the ML model with ID {ModelId}.", mlModelId);
        }

        return serviceResponse;
    }
}
