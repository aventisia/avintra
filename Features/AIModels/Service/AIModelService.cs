namespace MLModelBuilderAPIs.Services;

public class AIModelService : IAIModelService
{
    private readonly ILogger<AIModelService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IInferencingModelService _inferencingModelService;
    private readonly Guid _userId;
    private readonly string? _apiKey;

    public AIModelService(
        ILogger<AIModelService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IInferencingModelService inferencingModelService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _inferencingModelService = inferencingModelService;

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
                .GetByConditionAsync(w =>
                    (includeUnpublish || w.IsPublished) &&
                    w.CreatedByUserId == _userId ||
                    (
                        w.Users.Any(a => a.UserId == _userId)
                    )
                )
                .Include(i => i.Tasks)
                .Include(i => i.Users)
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
                    (includeUnpublish || w.IsPublished) &&
                    w.Type != null &&
                    w.Name.ToLower().Contains(searchKey.ToLower())
                )
                .Include(i => i.Tasks)
                .Include(i => i.Users)
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
        // Initialize the response object with a default failure message.
        var serviceResponse = new ServiceResponse<object>
        {
            Data = null,
            Message = "Failed to fetch AI model setup. Please try again later.", 
        };

        try
        {
            // Log the debug message about retrieving the model setup for the given ID.
            _logger.LogDebug("Retrieving AI model with ID {ModelId} from repository...", mlModelId);

            // Fetch the ML model by its ID from the repository.
            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(m => m.Id == mlModelId) 
                .FirstOrDefaultAsync(); 

            // If no model is found with the given ID, log a warning and return a response with a not found message.
            if (mlModel == null)
            {
                _logger.LogWarning("AI model with ID {ModelId} not found.", mlModelId);
                serviceResponse.Message = "AI model not found."; 
                return serviceResponse; 
            }

            // Log the successful retrieval of the model.
            _logger.LogInformation("Found AI model with ID {ModelId}, Type: {ModelType}.", mlModelId, mlModel.Type);

            // Initialize the setup data object to null.
            object? setupData = null;

            // Handle different types of AI models and fetch the appropriate setup data.
            switch (mlModel.Type)
            {
                case ModelTypesEnum.Inferencing:  
                    _logger.LogInformation("Fetching setup for Inferencing model...");
                    setupData = new
                    {
                        Data = await _inferencingModelService.GetSetupByMLModelIdAsync(mlModelId) 
                    };
                    break;

                case ModelTypesEnum.Conversation: 
                    _logger.LogInformation("Fetching setup for Conversation model...");
                    setupData = new
                    {
                        Data = await _inferencingModelService.GetSetupByMLModelIdAsync(mlModelId)
                    };
                    break;

                case ModelTypesEnum.Generative: 
                    _logger.LogInformation("Fetching setup for Generative model...");
                    setupData = new
                    {
                        Data = await _inferencingModelService.GetSetupByMLModelIdAsync(mlModelId)
                    };
                    break;

                // If the model type is not recognized, log a warning and return a failure response.
                default:
                    _logger.LogWarning("Unhandled model type: {ModelType}", mlModel.Type);
                    serviceResponse.Message = $"Unsupported model type: {mlModel.Type}";
                    return serviceResponse; 
            }

            // Set the setup data and successful status in the response.
            serviceResponse.Data = setupData;
            serviceResponse.StatusCode = 200; 
            serviceResponse.Message = "Successfully retrieved AI model setup."; 

            // Log that the setup retrieval was successful.
            _logger.LogInformation("Successfully retrieved setup for model ID {ModelId}.", mlModelId);
        }
        catch (Exception ex) // Catch any exceptions that occur during the process
        {
            // Log the error if an exception is thrown during the process of fetching the model setup.
            _logger.LogError(ex, "Error occurred while fetching AI model setup for ID {ModelId}", mlModelId);
        }

        // Return the response, whether success or failure.
        return serviceResponse;
    }

    // Executes an AI model using LLM logic, based on the provided model content and configuration.
    public async Task<ServiceResponse<object>> ExecuteViaLLMAsync(ModelContentProcessingRequestDto requestDto)
    {
        // Initialize the response object with a default failure message
        var serviceResponse = new ServiceResponse<object>
        {
            Data = null,
            Message = "Failed to execute the AI model. Please try again later."
        };

        try
        {
            // Log the beginning of the model retrieval process
            _logger.LogDebug("Attempting to retrieve AI model with ID: {ModelId}", requestDto.ModelId);

            // Retrieve the published AI model including its associated API keys
            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(m => m.Id == requestDto.ModelId && m.IsPublished)
                .Include(m => m.ModelAPIKeys)
                .FirstOrDefaultAsync();

            // Return a failure response if the model does not exist or is not published
            if (mlModel == null)
            {
                _logger.LogWarning("AI model not found for ID: {ModelId}", requestDto.ModelId);
                serviceResponse.Message = "AI model not found.";
                return serviceResponse;
            }

            // Validate that the provided API key exists among the model's allowed API keys
            var apiKeyEntry = mlModel.ModelAPIKeys.FirstOrDefault(k => k.ApiKey == _apiKey);
            if (apiKeyEntry == null)
            {
                _logger.LogWarning("Unauthorized request with invalid API key for model ID: {ModelId}", requestDto.ModelId);
                serviceResponse.Message = "Authorization failed. Invalid API key.";
                return serviceResponse;
            }

            // Log the model type before processing
            _logger.LogInformation("Executing model ID: {ModelId}, Type: {ModelType}", requestDto.ModelId, mlModel.Type);

            object? resultData = null;

            // Select appropriate execution logic based on the model's type
            switch (mlModel.Type)
            {
                case ModelTypesEnum.Inferencing:
                    _logger.LogInformation("Starting execution of 'Inferencing' model...");

                    // Execute the model via the inferencing service
                    var result = await _inferencingModelService.ExecuteLLMByFileContentAsync(requestDto);

                    // Store the resulting data
                    resultData = result.Data;

                    _logger.LogInformation("Execution of 'Inferencing' model completed.");
                    break;

                default:
                    // Unsupported model types fall into the default case
                    _logger.LogWarning("Unsupported model type: {ModelType} for model ID: {ModelId}", mlModel.Type, requestDto.ModelId);
                    serviceResponse.Message = $"Model type '{mlModel.Type}' is not supported for execution.";
                    return serviceResponse;
            }

            // Populate a successful response with the result
            serviceResponse.Data = resultData;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI model executed successfully.";
            _logger.LogInformation("Model execution completed successfully for model ID: {ModelId}", requestDto.ModelId);
        }
        catch (Exception ex)
        {
            // Catch and log any unexpected errors during execution
            _logger.LogError(ex, "An error occurred during execution of the AI model with ID: {ModelId}", requestDto.ModelId);
        }

        return serviceResponse;
    }
}

