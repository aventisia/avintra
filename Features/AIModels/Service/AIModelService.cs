namespace MLModelBuilderAPIs.Services;

public class AIModelService : IAIModelService
{
    private readonly ILogger<AIModelService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISummarizationService _summarizationService;
    private readonly IExtractionSetupService _extractionSetupService;
    private readonly IClassificationService _classificationService;
    private readonly ISentimentAnalyticsService _sentimentAnalyticsService;
    private readonly IQuestionAnswerService _questionAnswerService;
    private readonly IAIPersonaService _aiPersonaService;
    private readonly Guid _userId;
    private readonly string? _apiKey;

    public AIModelService(
        ILogger<AIModelService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ISummarizationService summarizationService,
        IExtractionSetupService extractionSetupService,
        IClassificationService classificationService,
        ISentimentAnalyticsService sentimentAnalyticsService,
        IQuestionAnswerService questionAnswerService,
        IAIPersonaService aiPersonaService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _summarizationService = summarizationService;
        _extractionSetupService = extractionSetupService;
        _classificationService = classificationService;
        _sentimentAnalyticsService = sentimentAnalyticsService;
        _questionAnswerService = questionAnswerService;
        _aiPersonaService = aiPersonaService;

        // Attempt to extract the user ID from the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _apiKey = GetApiKeyOfRequestUtil.GetApiKeyOfRequest(httpContextAccessor.HttpContext);

    }

    // Retrieves a list of published ai models.
    public async Task<ServiceResponse<IEnumerable<AIModelDto>>> GetAIModelsAsync(bool includeUnpublish)
    {
        var response = new ServiceResponse<IEnumerable<AIModelDto>>
        {
            Data = null,
            Message = "Failed to retrieve ai models. Please try again later.",
        };

        try
        {
            _logger.LogDebug("Querying the repository for published ai models...");

            var models = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Type != null && (includeUnpublish || w.IsPublished))
                .ProjectToType<AIModelDto>()
                .ToListAsync();

            _logger.LogDebug("Query completed. {Count} models found.", models.Count);

            response.Data = models;
            response.StatusCode = 200;
            response.Message = "AI models retrieved successfully.";

            _logger.LogInformation("Successfully retrieved {Count} ai models for user {UserId}.", models.Count, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving ai models for user {UserId}.", _userId);
        }

        return response;
    }

    // Retrieves a list of published ai models.
    public async Task<ServiceResponse<IEnumerable<AIModelDto>>> SearchAIModelsAsync(string searchKey, bool includeUnpublish)
    {
        var response = new ServiceResponse<IEnumerable<AIModelDto>>
        {
            Data = null,
            Message = "Failed to search for AI models. Please try again later.",
        };

        try
        {
            _logger.LogDebug("Starting search for AI models based on the provided search key...");

            var models = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w =>
                    w.Type != null &&
                    w.Name.ToLower().Contains(searchKey.ToLower()) &&
                    (includeUnpublish || w.IsPublished)
                )
                .ProjectToType<AIModelDto>()
                .ToListAsync();

            _logger.LogDebug("Search completed. Found {Count} AI models matching the search criteria.", models.Count);

            response.Data = models;
            response.StatusCode = 200;
            response.Message = "AI models retrieved successfully.";

            _logger.LogInformation("Successfully retrieved {Count} AI models for user {UserId}.", models.Count, _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while searching for AI models for user {UserId}.", _userId);
        }

        return response;
    }

    // Fetches the setup details of a specific AI model using its ID.
    public async Task<ServiceResponse<object>> GetAIModelSetupByIdAsync(Guid mlModelId)
    {
        var serviceResponse = new ServiceResponse<object>
        {
            Data = null,
            Message = "Failed to fetch AI model setup. Please try again later.",
        };

        try
        {
            _logger.LogDebug("Initiating query to retrieve AI model setup from the repository...");

            // Retrieve the model from the repository using its ID
            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mlModelId)
                .FirstOrDefaultAsync();

            if (mlModel == null)
            {
                // If the model with the given ID doesn't exist, log the warning and return an appropriate message
                _logger.LogWarning($"AI model with ID {mlModelId} not found.");
                serviceResponse.Message = "AI model not found.";
                return serviceResponse;
            }

            // Initialize a variable to hold the data based on the model type
            object? data = null;

            // Log the model type for better tracking
            _logger.LogInformation($"Processing AI model with ID {mlModelId}, Model Type: {mlModel.Type}.");

            // Handle different AI model types
            switch (mlModel.Type)
            {
                case ModelTypesEnum.Extraction:
                    // If the model type is Extraction, fetch the extraction setup
                    _logger.LogInformation("Processing AI model of type 'Extraction'. Fetching setup...");
                    var extractionSetup = await _extractionSetupService.GetExtractionSetupByMLModelIdAsync(mlModelId);
                    data = new
                    {
                        Type = mlModel.Type,
                        Fields = extractionSetup.Data.SetupObject?.FieldSetups,
                        Tables = extractionSetup.Data.SetupObject?.TableMetadata
                    };

                    _logger.LogInformation("Successfully retrieved extraction setup data.");
                    break;

                case ModelTypesEnum.Classification:
                    // If the model type is Classification, fetch the classification setup
                    _logger.LogInformation("Processing AI model of type 'Classification'. Fetching setup...");
                    var classificationSetup = await _classificationService.GetClassificationSetupByMLModelIdAsync(mlModelId);
                    data = new
                    {
                        Type = mlModel.Type,
                        Categories = classificationSetup.Data.SetupObject?.Categories
                    };
                    _logger.LogInformation("Successfully retrieved classification setup data.");
                    break;

                case ModelTypesEnum.Summarization:
                    // If the model type is Summarization, fetch the summarization setup
                    _logger.LogInformation("Processing AI model of type 'Summarization'. Fetching setup...");
                    var summarizationSetup = await _summarizationService.GetSummarizationSetupByMLModelIdAsync(mlModelId);
                    data = new
                    {
                        Type = mlModel.Type,
                        Summary = string.Empty
                    };
                    _logger.LogInformation("Successfully retrieved summarization setup data.");
                    break;

                case ModelTypesEnum.SentimentAnalytics:
                    // If the model type is Sentiment Analysis, fetch the sentiment setup
                    _logger.LogInformation("Processing AI model of type 'SentimentAnalytics'. Fetching setup...");
                    var sentimentAnalyticsSetup = await _sentimentAnalyticsService.GetSentimentAnalyticsSetupByMLModelIdAsync(mlModelId);
                    data = new
                    {
                        Type = mlModel.Type,
                        Categories = sentimentAnalyticsSetup.Data.SetupObject?.Categories
                    };
                    _logger.LogInformation("Successfully retrieved sentiment analysis setup data.");
                    break;

                case ModelTypesEnum.QuestionAnswer:
                    // If the model type is Question Answering, fetch the Q&A setup
                    _logger.LogInformation("Processing AI model of type 'QuestionAnswer'. Fetching setup...");
                    var questionAnswerSetup = await _questionAnswerService.GetQuestionAnswerSetupByMLModelIdAsync(mlModelId);
                    data = new
                    {
                        Type = mlModel.Type,
                        QuestionAnswers = questionAnswerSetup.Data.SetupObject?.QuestionAnswers
                    };
                    _logger.LogInformation("Successfully retrieved question answering setup data.");
                    break;

                case ModelTypesEnum.AIPersona:
                    // If the model type is AI Persona, fetch the persona setup
                    _logger.LogInformation("Processing AI model of type 'AIPersona'. Fetching setup...");
                    var aiPersonaSetup = await _aiPersonaService.GetAIPersonaSetupByMLModelIdAsync(mlModelId);
                    data = new
                    {
                        Type = mlModel.Type,
                    };
                    _logger.LogInformation("Successfully retrieved AI persona setup data.");
                    break;

                default:
                    // If the model type is unknown, log a warning and break
                    _logger.LogWarning($"Unknown model type: {mlModel.Type}.");
                    break;
            }

            // Return the fetched setup data
            serviceResponse.Data = data;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Successfully retrieved AI model setup.";
            _logger.LogInformation("Successfully completed the retrieval of AI model setup.");
        }
        catch (Exception ex)
        {
            // Log the error if an exception occurs
            _logger.LogError($"An error occurred while fetching the AI model setup with ID {mlModelId}: {ex.Message}");
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<object>> ExecuteViaLLMAsync(ExtractRequestDto extractRequestDto)
    {
        var serviceResponse = new ServiceResponse<object>
        {
            Data = null,
            Message = "Failed to execute the AI model. Please try again later."
        };

        try
        {
            _logger.LogDebug("Starting retrieval of AI model from the repository...");

            // Attempt to retrieve the AI model using the provided ModelId
            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == extractRequestDto.ModelId && w.IsPublished)
                .Include(i => i.ModelAPIKeys)
                .FirstOrDefaultAsync();

            if (mlModel == null)
            {
                _logger.LogWarning($"AI model not found for ID: {extractRequestDto.ModelId}");
                serviceResponse.Message = "AI model not found.";
                return serviceResponse;
            }

            // Check if the provided API key is associated with the model
            var isApiKeyValid = mlModel.ModelAPIKeys.FirstOrDefault(key => key.ApiKey == _apiKey);
            if (isApiKeyValid == null)
            {
                _logger.LogWarning($"Unauthorized access attempt with an invalid API key for model ID: {extractRequestDto.ModelId}");
                serviceResponse.Message = "Authorization failed. Please verify your API key.";
                return serviceResponse;
            }

            object? data = null;

            _logger.LogInformation($"Executing model ID: {extractRequestDto.ModelId} of type: {mlModel.Type}");

            // Determine execution path based on model type
            switch (mlModel.Type)
            {
                case ModelTypesEnum.Extraction:
                    _logger.LogInformation("Executing 'Extraction' model via LLM...");
                    var extractionResult = await _extractionSetupService.ExtractViaLLMAsync(extractRequestDto);
                    data = extractionResult.Data;
                    _logger.LogInformation("Extraction completed successfully.");
                    break;

                case ModelTypesEnum.Classification:
                    _logger.LogInformation("Executing 'Classification' model via LLM...");
                    var classificationResult = await _classificationService.ExtractViaLLMAsync(extractRequestDto);
                    data = classificationResult.Data;
                    _logger.LogInformation("Classification completed successfully.");
                    break;

                case ModelTypesEnum.Summarization:
                    _logger.LogInformation("Executing 'Summarization' model via LLM...");
                    var summarizationResult = await _summarizationService.ExtractViaLLMAsync(extractRequestDto);
                    data = summarizationResult.Data;
                    _logger.LogInformation("Summarization completed successfully.");
                    break;

                case ModelTypesEnum.SentimentAnalytics:
                    _logger.LogInformation("Executing 'SentimentAnalytics' model via LLM...");
                    var sentimentResult = await _sentimentAnalyticsService.ExtractViaLLMAsync(extractRequestDto);
                    data = sentimentResult.Data;
                    _logger.LogInformation("Sentiment analysis completed successfully.");
                    break;

                case ModelTypesEnum.QuestionAnswer:
                    _logger.LogInformation("Executing 'QuestionAnswer' model via LLM...");
                    var qaResult = await _questionAnswerService.ExtractViaLLMAsync(extractRequestDto);
                    data = qaResult.Data;
                    _logger.LogInformation("Question answering completed successfully.");
                    break;

                case ModelTypesEnum.AIPersona:
                    _logger.LogInformation("Initializing connection to LLM for 'AIPersona' model...");
                    var personaResult = await _aiPersonaService.InitializeConnectionToLLMAsync(extractRequestDto.ModelId);
                    data = personaResult.Data;
                    _logger.LogInformation("AI Persona interaction completed successfully.");
                    break;

                default:
                    _logger.LogWarning($"Unsupported or unknown model type: {mlModel.Type}");
                    break;
            }

            serviceResponse.Data = data;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI model executed successfully.";
            _logger.LogInformation("Model execution process completed.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while executing the AI model with ID: {extractRequestDto.ModelId}");
        }

        return serviceResponse;
    }

    // Adds a new document record by executing the associated AI model processing logic (e.g., Extraction, Classification, etc.) based on the model type.
    public async Task<ServiceResponse<object>> AddDocumentRecordAsync(AddDocumentRequestDto addDocumentRequestDto)
    {
        var serviceResponse = new ServiceResponse<object>
        {
            Data = null,
            Message = "Failed to process the document with the AI model. Please try again later."
        };

        try
        {
            _logger.LogDebug("Attempting to retrieve AI model with ID: {ModelId}", addDocumentRequestDto.MLModelId);

            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(m => m.Id == addDocumentRequestDto.MLModelId)
                .Include(i => i.ModelAPIKeys)
                .FirstOrDefaultAsync();

            if (mlModel == null)
            {
                _logger.LogWarning("AI model not found for ID: {ModelId}", addDocumentRequestDto.MLModelId);
                serviceResponse.Message = "AI model not found.";
                return serviceResponse;
            }

            // Check if the provided API key is associated with the model
            var modelAPIKey = mlModel.ModelAPIKeys.FirstOrDefault(key => key.ApiKey == _apiKey);
            if (modelAPIKey == null)
            {
                _logger.LogWarning($"Unauthorized access attempt with an invalid API key for model ID: {addDocumentRequestDto.MLModelId}");
                serviceResponse.Message = "Authorization failed. Please verify your API key.";
                return serviceResponse;
            }

            _logger.LogInformation("Executing AI model of type: {ModelType} (ID: {ModelId})", mlModel.Type, mlModel.Id);

            // Prepare request for review processing
            var reviewRequest = new CreateModelReviewRequestDto
            {
                MLModelId = addDocumentRequestDto.MLModelId,
                Type = ExtractedDataType.Viewer,
                FileIds = addDocumentRequestDto.FileIds
            };

            object? processedData = null;

            _logger.LogInformation("AI model processing started. Model Type: {ModelType}", mlModel.Type);
            _logger.LogInformation("Attempting to add document record using model type: {ModelType}", mlModel.Type);

            switch (mlModel.Type)
            {
                case ModelTypesEnum.Extraction:
                    processedData = (await _extractionSetupService.AddReviewDataAsync(reviewRequest)).Data;
                    break;

                case ModelTypesEnum.Classification:
                    processedData = (await _classificationService.AddReviewDataAsync(reviewRequest)).Data;
                    break;

                case ModelTypesEnum.Summarization:
                    processedData = (await _summarizationService.AddReviewDataAsync(reviewRequest)).Data;
                    break;

                case ModelTypesEnum.SentimentAnalytics:
                    processedData = (await _sentimentAnalyticsService.AddReviewDataAsync(reviewRequest)).Data;
                    break;

                case ModelTypesEnum.QuestionAnswer:
                    processedData = (await _questionAnswerService.AddReviewDataAsync(reviewRequest)).Data;
                    break;

                default:
                    _logger.LogWarning("Unsupported or unknown AI model type: {ModelType}", mlModel.Type);
                    serviceResponse.Message = "Unsupported or unknown model type.";
                    return serviceResponse;
            }

            _logger.LogInformation("AI model processing completed successfully. Model Type: {ModelType}", mlModel.Type);
            serviceResponse.Data = processedData;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Document record added successfully.";
            _logger.LogInformation("AI model execution completed successfully for model ID: {ModelId}", mlModel.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while processing document record for model ID: {ModelId}", addDocumentRequestDto.MLModelId);
        }

        return serviceResponse;
    }
}

