namespace MLModelBuilderAPIs.Services;

public class ConversationModelService : IConversationModelService
{
    private readonly ILogger<ConversationModelService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILLMDataExtractionService _llmDataExtractionService;
    private readonly Guid _userId;

    public ConversationModelService(
        ILogger<ConversationModelService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ILLMDataExtractionService llmDataExtractionService)
    {
        // Retrieve the user ID from the HTTP context and initialize the logger and unit of work
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _llmDataExtractionService = llmDataExtractionService;
    }

    // Gets the model setup for a specific conversation model using its unique ML model ID.
    public async Task<ServiceResponse<ConversationModelDto>> GetSetupByMLModelIdAsync(Guid mlModelId)
    {
        // Initialize the response with a failure state and default message
        var serviceResponse = new ServiceResponse<ConversationModelDto>
        {
            Data = null,
            Message = "Failed to retrieve the conversational model setup. Please try again later."
        };

        try
        {
            // Log the beginning of the retrieval process with the ML model ID
            _logger.LogInformation("Attempting to retrieve conversational model setup for ML model with ID: {MLModelId}", mlModelId);

            // Fetch the model setup from the database by its ML model ID, including related user and task data
            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mlModelId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.ConversationalModel)
                .SingleOrDefaultAsync();

            // If no model setup is found, log a warning and return an appropriate message
            if (mlModel == null)
            {
                _logger.LogWarning("No model setup found for ML model with ID: {MLModelId}", mlModelId);
                serviceResponse.Message = "No conversational model setup exists for the provided ML model ID.";
                return serviceResponse;
            }

            // Log the successful retrieval of the model setup
            _logger.LogInformation("Successfully retrieved model setup for ML model with ID: {MLModelId}", mlModelId);

            // Adapt the retrieved ML model to the corresponding DTO (Data Transfer Object)
            var conversationModelDto = mlModel.Adapt<ConversationModelDto>();

            // Retrieve the list of Conversation tasks and add it to the model DTO
            if (mlModel.ConversationalModel != null)
            {
                conversationModelDto.AIPersona = mlModel.ConversationalModel.Adapt<ConversationModelSetupTaskDto>();
            }

            // Map the adapted model setup (including tasks) to the response DTO
            serviceResponse.Data = conversationModelDto;

            // Set the success response status and message
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversational model setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log the exception details if an error occurs during the process
            _logger.LogError("Error occurred while retrieving conversational model setup for ML model with ID: {MLModelId}. Exception: {ExceptionMessage}", mlModelId, ex.Message);
        }

        // Return the service response (either successful or failure)
        return serviceResponse;
    }

    // Updates an existing conversational model setup and its associated AI persona configuration.
    public async Task<ServiceResponse<ConversationModelDto>> UpdateSetupAsync(ConversationModelDto conversationModelDto)
    {
        // Initialize default failure response
        var serviceResponse = new ServiceResponse<ConversationModelDto>
        {
            Data = null,
            Message = "Failed to update conversational model. Please try again later."
        };

        try
        {
            _logger.LogInformation("Starting update for conversational model | Model ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);

            // Retrieve the existing ML model from the database, including any associated conversational tasks
            var existingModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(m => m.Id == conversationModelDto.Id)
                .Include(m => m.ConversationalModel)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Handle case where the model does not exist
            if (existingModel == null)
            {
                _logger.LogWarning("Conversational model not found | ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);
                serviceResponse.Message = "Conversational model not found.";
                return serviceResponse;
            }

            // Prevent modifications to published models
            if (existingModel.IsPublished)
            {
                _logger.LogWarning("Modification blocked for published model | ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);
                serviceResponse.Message = "Published models cannot be modified.";
                return serviceResponse;
            }

            // Trim string values from the incoming DTO to avoid invalid whitespace issues
            conversationModelDto = TrimDtoStringPropsUtil.TrimDtoStringProps(conversationModelDto);

            _logger.LogInformation("Applying updates to base model entity | Model ID: {Id}", conversationModelDto.Id);

            // Map changes from DTO to existing model entity
            existingModel.Adapt(conversationModelDto);
            existingModel.Type = ModelTypesEnum.Conversation;
            existingModel.SetupStatus = SetupStatusTypesEnum.Completed;
            existingModel.LastModifiedByUserId = _userId;

            // Update base model in the database
            _unitOfWork.MLModelRepo.Update(existingModel);

            // Save base model changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save base model changes | Model ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);
                return serviceResponse;
            }

            // Handle AI persona configuration if provided
            if (conversationModelDto.AIPersona != null)
            {
                // Look for an existing persona task named "AIPersona"
                var conversationalModel = existingModel.ConversationalModel;

                if (conversationalModel == null)
                {
                    // No existing task — create a new conversational persona
                    var newPersona = conversationModelDto.AIPersona.Adapt<ConversationalModel>();
                    newPersona.MLModelId = existingModel.Id;
                    newPersona.CreatedByUserId = _userId;
                    newPersona.LastModifiedByUserId = _userId;

                    await _unitOfWork.ConversationalModelRepo.InsertAsync(newPersona);
                }
                else
                {
                    // Existing task found — update it from the DTO
                    conversationModelDto.AIPersona.Adapt(conversationalModel);
                    conversationalModel.LastModifiedByUserId = _userId;

                    _unitOfWork.ConversationalModelRepo.Update(conversationalModel);
                }

                // Save changes to the persona task
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save AI persona changes | Model ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);
                    return serviceResponse;
                }
            }

            _logger.LogInformation("Conversational model update successful | Model ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);

            // Return successful response with updated data
            serviceResponse.Data = existingModel.Adapt<ConversationModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversational model updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating conversational model | Model ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);
        }

        return serviceResponse;
    }
}

