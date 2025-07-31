
namespace MLModelBuilderAPIs.Services;

public class GenerativeModelService : IGenerativeModelService
{
    private readonly ILogger<GenerativeModelService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILLMDataExtractionService _llmDataExtractionService;
    private readonly Guid _userId;

    public GenerativeModelService(
        ILogger<GenerativeModelService> logger,
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

    // Gets the model setup for a specific generative model using its unique ML model ID.
    public async Task<ServiceResponse<GenerativeModelDto>> GetSetupByMLModelIdAsync(Guid mlModelId)
    {
        // Initialize the response with a failure state and default message
        var serviceResponse = new ServiceResponse<GenerativeModelDto>
        {
            Data = null,
            Message = "Failed to retrieve the generative model setup. Please try again later."
        };

        try
        {
            // Log the beginning of the retrieval process with the ML model ID
            _logger.LogInformation("Attempting to retrieve generative model setup for ML model with ID: {MLModelId}", mlModelId);

            // Fetch the model setup from the database by its ML model ID, including related user and task data
            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mlModelId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.GenerativeModel)
                .SingleOrDefaultAsync();

            // If no model setup is found, log a warning and return an appropriate message
            if (mlModel == null)
            {
                _logger.LogWarning("No model setup found for ML model with ID: {MLModelId}", mlModelId);
                serviceResponse.Message = "No generative model setup exists for the provided ML model ID.";
                return serviceResponse;
            }

            // Log the successful retrieval of the model setup
            _logger.LogInformation("Successfully retrieved model setup for ML model with ID: {MLModelId}", mlModelId);

            // Adapt the retrieved ML model to the corresponding DTO (Data Transfer Object)
            var generativeModelDto = mlModel.Adapt<GenerativeModelDto>();

            // Retrieve the list of Generative tasks and add it to the model DTO
            if (mlModel.GenerativeModel != null)
            {
                generativeModelDto.GenerativeModel = mlModel.GenerativeModel.Adapt<GenerativeModelSetupTaskDto>();
            }

            // Map the adapted model setup (including tasks) to the response DTO
            serviceResponse.Data = generativeModelDto;

            // Set the success response status and message
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Generative model setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log the exception details if an error occurs during the process
            _logger.LogError("Error occurred while retrieving generative model setup for ML model with ID: {MLModelId}. Exception: {ExceptionMessage}", mlModelId, ex.Message);
        }

        // Return the service response (either successful or failure)
        return serviceResponse;
    }

    // Updates an existing generative model setup and its associated AI persona configuration.
    public async Task<ServiceResponse<GenerativeModelDto>> UpdateSetupAsync(GenerativeModelDto generativeModelDto)
    {
        // Initialize default failure response
        var serviceResponse = new ServiceResponse<GenerativeModelDto>
        {
            Data = null,
            Message = "Failed to update generative model. Please try again later."
        };

        try
        {
            _logger.LogInformation("Starting update for generative model | Model ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);

            // Retrieve the existing ML model from the database, including any associated generative tasks
            var existingModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(m => m.Id == generativeModelDto.Id)
                .Include(m => m.GenerativeModel)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Handle case where the model does not exist
            if (existingModel == null)
            {
                _logger.LogWarning("generative model not found | ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);
                serviceResponse.Message = "generative model not found.";
                return serviceResponse;
            }

            // Prevent modifications to published models
            if (existingModel.IsPublished)
            {
                _logger.LogWarning("Modification blocked for published model | ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);
                serviceResponse.Message = "Published models cannot be modified.";
                return serviceResponse;
            }

            // Trim string values from the incoming DTO to avoid invalid whitespace issues
            generativeModelDto = TrimDtoStringPropsUtil.TrimDtoStringProps(generativeModelDto);

            _logger.LogInformation("Applying updates to base model entity | Model ID: {Id}", generativeModelDto.Id);

            // Map changes from DTO to existing model entity
            existingModel.Adapt(generativeModelDto);
            existingModel.Type = ModelTypesEnum.Generative;
            existingModel.SetupStatus = SetupStatusTypesEnum.Completed;
            existingModel.LastModifiedByUserId = _userId;

            // Update base model in the database
            _unitOfWork.MLModelRepo.Update(existingModel);

            // Save base model changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save base model changes | Model ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);
                return serviceResponse;
            }

            // Handle AI persona configuration if provided
            if (generativeModelDto.Name != null)
            {
                // Look for an existing persona task named "AIPersona"
                var generativeModel = existingModel.GenerativeModel;

                if (generativeModel == null)
                {
                    // No existing task — create a new generative persona
                    var newPersona = generativeModelDto.GenerativeModel.Adapt<GenerativeModel>();
                    newPersona.MLModelId = existingModel.Id;
                    newPersona.CreatedByUserId = _userId;
                    newPersona.LastModifiedByUserId = _userId;

                    await _unitOfWork.GenerativeModelRepo.InsertAsync(newPersona);
                }
                else
                {
                    // Existing task found — update it from the DTO
                    generativeModelDto.GenerativeModel.Adapt(generativeModel);
                    generativeModel.LastModifiedByUserId = _userId;

                    _unitOfWork.GenerativeModelRepo.Update(generativeModel);
                }

                // Save changes to the persona task
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save AI persona changes | Model ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);
                    return serviceResponse;
                }
            }

            _logger.LogInformation("generative model update successful | Model ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);

            // Return successful response with updated data
            serviceResponse.Data = existingModel.Adapt<GenerativeModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "generative model updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating generative model | Model ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);
        }

        return serviceResponse;
    }
}

