namespace MLModelBuilderAPIs.Services;

public class AIModelService : IAIModelService
{
    private readonly ILogger<AIModelService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IInferencingModelService _inferencingModelService;
    private readonly ILLMDataExtractionService _llmDataExtractionService;
    private readonly string? _apiKey;

    public AIModelService(
        ILogger<AIModelService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IInferencingModelService inferencingModelService,
        ILLMDataExtractionService llmDataExtractionService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _inferencingModelService = inferencingModelService;
        _llmDataExtractionService = llmDataExtractionService;

        _apiKey = GetApiKeyOfRequestUtil.GetApiKeyOfRequest(httpContextAccessor.HttpContext);
    }

    // Retrieves a list of published AI project versions (AI models).
    public async Task<ServiceResponse<IEnumerable<AIModelDto>>> GetAIModelsAsync()
    {
        // Initialize the response with a default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<AIModelDto>>
        {
            Data = null,
            Message = "Failed to retrieve AI models. Please try again later.",
        };

        try
        {
            _logger.LogDebug("Fetching all published AI models from the repository...");

            // Query the repository for published AI project versions with related entities
            var aiProjectVersions = await _unitOfWork.AIProjectVersionRepo
                .GetByConditionAsync(w => w.IsPublished)
                .Include(i => i.Tasks)
                .Include(i => i.AIProject)
                .Include(i => i.CreatedByUser)
                .ProjectToType<AIModelDto>()
                .ToListAsync();

            _logger.LogDebug("Repository query successful. Found {Count} published AI models.", aiProjectVersions.Count);

            // Populate the service response with retrieved data
            serviceResponse.Data = aiProjectVersions;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI models retrieved successfully.";

            _logger.LogInformation("Successfully retrieved {Count} published AI models.", aiProjectVersions.Count);
        }
        catch (Exception ex)
        {
            // Log any errors that occur during data retrieval
            _logger.LogError(ex, "Error occurred while retrieving published AI models.");
        }

        return serviceResponse;
    }

    // Searches for published AI models that match the given search key.
    public async Task<ServiceResponse<IEnumerable<AIModelDto>>> SearchAIModelsAsync(string searchKey)
    {
        // Initialize the service response with a default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<AIModelDto>>
        {
            Data = null,
            Message = "Failed to search for AI models. Please try again later.",
        };

        try
        {
            _logger.LogDebug("Initiating search for published AI models with search key: {SearchKey}", searchKey);

            // Query the repository for published AI project versions whose names match the search key
            var aiProjectVersions = await _unitOfWork.AIProjectVersionRepo
                .GetByConditionAsync(w =>
                    w.IsPublished &&
                    w.AIProject.Name.ToLower().Contains(searchKey.ToLower())
                )
                .Include(i => i.AIProject)
                .Include(i => i.Tasks)
                .Include(i => i.CreatedByUser)
                .ProjectToType<AIModelDto>()
                .ToListAsync();

            _logger.LogDebug("Search completed. Found {Count} matching AI models.", aiProjectVersions.Count);

            // Populate the service response with the results
            serviceResponse.Data = aiProjectVersions;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI models retrieved successfully.";

            _logger.LogInformation("Successfully retrieved {Count} AI models matching the search key.", aiProjectVersions.Count);
        }
        catch (Exception ex)
        {
            // Log the exception details for troubleshooting
            _logger.LogError(ex, "An error occurred during the AI model search process.");
        }

        return serviceResponse;
    }

    // Retrieves the setup details of a specific AI project version by its ID.
    public async Task<ServiceResponse<object>> GetAIModelSetupByIdAsync(Guid aiProjectVersionId)
    {
        // Initialize the response with a default failure message
        var serviceResponse = new ServiceResponse<object>
        {
            Data = null,
            Message = "Failed to fetch AI model setup. Please try again later.",
        };

        try
        {
            _logger.LogDebug("Retrieving AI project version with ID: {AIProjectVersionId}", aiProjectVersionId);

            // Fetch the AI project version including its parent project
            var aiProjectVersion = await _unitOfWork.AIProjectVersionRepo
                .GetByConditionAsync(m => m.Id == aiProjectVersionId)
                .Include(i => i.AIProject)
                .FirstOrDefaultAsync();

            // Handle case when project version is not found
            if (aiProjectVersion == null)
            {
                _logger.LogWarning("AI project version not found for ID: {AIProjectVersionId}", aiProjectVersionId);
                serviceResponse.Message = "AI project version not found.";
                return serviceResponse;
            }

            _logger.LogInformation("AI project version found for ID: {AIProjectVersionId}", aiProjectVersionId);

            object? setupData = null;

            // Determine the setup logic based on AI project type
            switch (aiProjectVersion.AIProject.Type)
            {
                case AIProjectTypeEnum.Inferencing:
                    _logger.LogInformation("Fetching setup for Inferencing project...");
                    var inferencingSetupData = await _inferencingModelService.GetAIProjectSetupAsync(aiProjectVersion.AIProjectId, aiProjectVersionId);
                    setupData = inferencingSetupData.Data;
                    break;

                // case AIProjectTypeEnum.Conversational:
                //     _logger.LogInformation("Fetching setup for Conversation project...");
                //     var conversationalSetupData = await _conversationModelService.GetSetupByMLModelIdAsync(aiProjectVersion.AIProjectId);
                //     setupData = conversationalSetupData.Data;
                //     break;

                // case AIProjectTypeEnum.Generative:
                //     _logger.LogInformation("Fetching setup for Generative project...");
                //     var generativeSetupData = await _generativeModelService.GetSetupByMLModelIdAsync(aiProjectVersion.AIProjectId);
                //     setupData = generativeSetupData.Data;
                //     break;

                default:
                    _logger.LogWarning("Unsupported AI project type: {ProjectType}", aiProjectVersion.AIProject.Type);
                    serviceResponse.Message = $"Unsupported AI project type: {aiProjectVersion.AIProject.Type}";
                    return serviceResponse;
            }

            // Populate success response
            serviceResponse.Data = setupData;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Successfully retrieved AI model setup.";

            _logger.LogInformation("Successfully retrieved setup for AI project version ID: {AIProjectVersionId}", aiProjectVersionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving setup for AI project version ID: {AIProjectVersionId}", aiProjectVersionId);
        }

        return serviceResponse;
    }

    // Executes an AI model using LLM logic, based on the provided model content and configuration.
    public async Task<ServiceResponse<object>> ExecuteViaLLMAsync(ModelContentProcessingRequestDto requestDto)
    {
        // Initialize the response with a default failure message
        var serviceResponse = new ServiceResponse<object>
        {
            Data = null,
            Message = "Failed to execute the AI model. Please try again later."
        };

        try
        {
            // Check for credits availability
            var hasSufficientCredits = await _llmDataExtractionService.HasSufficientCreditsAsync();
            if (!hasSufficientCredits.Data)
            {
                serviceResponse.Message = "Unable to execute AI model due to insufficient credits.";
                return serviceResponse;
            }

            _logger.LogDebug("Attempting to retrieve published AI model verison with ID: {AIProjectVersionId}", requestDto.AIProjectVersionId);

            // Retrieve the published AI project version along with its parent project
            var aiProjectVersion = await _unitOfWork.AIProjectVersionRepo
                .GetByConditionAsync(m => m.Id == requestDto.AIProjectVersionId && m.IsPublished)
                .Include(i => i.AIProject)
                .FirstOrDefaultAsync();

            if (aiProjectVersion == null)
            {
                _logger.LogWarning("AI model not found or not published. Model version ID: {AIProjectVersionId}", requestDto.AIProjectVersionId);
                serviceResponse.Message = "AI model version not found.";
                return serviceResponse;
            }

            _logger.LogInformation("Retrieved AI model version. ID: {AIProjectVersionId}, Type: {ModelType}", requestDto.AIProjectVersionId, aiProjectVersion.AIProject.Type);

            object? resultData = null;

            // Determine execution logic based on model type
            switch (aiProjectVersion.AIProject.Type)
            {
                case AIProjectTypeEnum.Inferencing:
                    _logger.LogInformation("Executing Inferencing model...");
                    var result = await _inferencingModelService.ExecuteLLMByFileContentAsync(requestDto);
                    resultData = result.Data;
                    _logger.LogInformation("Inferencing model execution completed.");
                    break;

                // Future types like Generative or Conversation can be added here
                default:
                    _logger.LogWarning("Unsupported AI project type '{ProjectType}' for model version ID: {AIProjectVersionId}",
                        aiProjectVersion.AIProject.Type, requestDto.AIProjectVersionId);

                    serviceResponse.Message = $"Model type '{aiProjectVersion.AIProject.Type}' is not supported for execution.";
                    return serviceResponse;
            }

            // Populate the success response
            serviceResponse.Data = resultData;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI model executed successfully.";

            _logger.LogInformation("Execution completed successfully for model version ID: {AIProjectVersionId}", requestDto.AIProjectVersionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while executing AI model with version ID: {AIProjectVersionId}", requestDto.AIProjectVersionId);
        }

        return serviceResponse;
    }
}