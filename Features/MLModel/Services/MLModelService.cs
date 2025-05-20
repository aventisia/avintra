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
    private string GetDefaultSerializedSetupByModel(MLModel newMLModel)
    {
        // Default prompt text used for all model types.
        var defaultPrompt = "You are an expert extraction algorithm.\n" +
                            "Extract only the relevant information from the provided text.\n" +
                            "If you do not know the value of an attribute, leave it blank.";

        // Set up configuration based on the model type in the provided newMLModel object.
        switch (newMLModel.Type)
        {
            case ModelTypesEnum.Extraction:
                // Configuration for the extraction model type: defines how to extract relevant information.
                var extractionSetup = new ExtractionSetupDto
                {
                    Context = string.Empty,
                    Prompt = defaultPrompt,
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
                    Context = string.Empty,
                    Prompt = defaultPrompt,
                    UncertaintyAction = ClassificationUncertaintyAction.DiscardItem,
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
                    Context = string.Empty,
                    Prompt = defaultPrompt,
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
                    Context = string.Empty,
                    Prompt = defaultPrompt,
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

            // Default case: returns an empty string for any unrecognized model types.
            default:
                return string.Empty;
        }
    }
}
