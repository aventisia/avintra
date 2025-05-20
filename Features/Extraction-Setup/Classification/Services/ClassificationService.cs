namespace MLModelBuilderAPIs.Services;

public class ClassificationService : IClassificationService
{
    private readonly ILogger<ClassificationService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public ClassificationService(
        ILogger<ClassificationService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Retrieve the current user's ID from the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Updates the classification setup for a given ML model
    public async Task<ServiceResponse<ClassificationDto>> UpdateClassificationSetupAsync(ClassificationDto classificationDto)
    {
        var serviceResponse = new ServiceResponse<ClassificationDto>
        {
            Data = null,
            Message = "Failed to update the classification setup. Please try again later."
        };

        try
        {
            _logger.LogInformation("Initiating update for classification setup | Setup ID: {Id} | User ID: {UserId}", classificationDto.Id, _userId);

            var mLModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == classificationDto.Id)
                .SingleOrDefaultAsync();

            if (mLModel == null)
            {
                _logger.LogWarning("No classification setup found | Setup ID: {Id} | User ID: {UserId}", classificationDto.Id, _userId);
                serviceResponse.Message = "Classification setup not found. Please verify the setup ID.";
                return serviceResponse;
            }

            // Clean up DTO string properties
            classificationDto = TrimDtoStringPropsUtil.TrimDtoStringProps(classificationDto);

            // Map the updated DTO data to the model entity
            classificationDto.Adapt(mLModel);
            mLModel.GeneratedPrompt = GenerateClassificationModelPrompt(classificationDto);
            mLModel.SetupStatus = SetupStatusTypesEnum.Completed;
            mLModel.LastModifiedByUserId = _userId;

            _logger.LogInformation("Saving updated classification setup | Setup ID: {Id}", classificationDto.Id);
            _unitOfWork.MLModelRepo.Update(mLModel);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save updated classification setup | Setup ID: {Id} | User ID: {UserId}", classificationDto.Id, _userId);
                return serviceResponse;
            }

            _logger.LogInformation("Successfully updated classification setup | Setup ID: {Id} | User ID: {UserId}", classificationDto.Id, _userId);

            serviceResponse.Data = mLModel.Adapt<ClassificationDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Classification setup updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating the classification setup | Setup ID: {Id} | User ID: {UserId}", classificationDto.Id, _userId);
        }

        return serviceResponse;
    }

    // Constructs the prompt string for the classification model based on configuration details
    private string? GenerateClassificationModelPrompt(ClassificationDto classificationDto)
    {
        var promptStringBuilder = new StringBuilder();

        // Use custom prompt if provided; otherwise, default to a generic classification instruction
        promptStringBuilder.AppendLine(!string.IsNullOrEmpty(classificationDto.SetupObject?.Prompt)
            ? classificationDto.SetupObject.Prompt.Trim()
            : "You are a classification expert. Your task is to classify the provided content.");

        var categoriesStringBuilder = new StringBuilder();

        // Include category-based classification instructions if defined
        if (classificationDto.SetupObject?.Categories != null && classificationDto.SetupObject.Categories.Any())
        {
            for (int i = 0; i < classificationDto.SetupObject.Categories.Count; i++)
            {
                var category = classificationDto.SetupObject.Categories[i];
                var instructions = string.IsNullOrEmpty(category.Instructions) ? "" : $", - {category.Instructions}";
                categoriesStringBuilder.AppendLine($"{i + 1}. {category.Name}{instructions}");
            }
        }

        // Load a template file and replace placeholders with the generated prompt sections
        var generatedPrompt = FileTemplateLoaderUtil.LoadAndRenderFile("ClassificationPrompt.txt", new Dictionary<string, string>()
                    {
                        // Replace the placeholders {{Prompt}}, {{Context}}, and {{Categories}} in the template with the respective sections
                        {"{{Prompt}}", promptStringBuilder.Replace("\n","").ToString()  },
                        {"{{Context}}", classificationDto.SetupObject.Context.Replace("\n","").ToString() },
                        {"{{AllowMultipleClasses}}", classificationDto.SetupObject.AllowMultipleClasses.ToString() },
                        {"{{UncertaintyAction}}", classificationDto.SetupObject.UncertaintyAction.ToString() },
                        {"{{Categories}}", categoriesStringBuilder.Replace("\n","").ToString() },
                    }
                );

        // Return the final generated prompt after replacing newline characters and returning the string
        return generatedPrompt.Replace("\n", "").ToString();
    }

    // Retrieves the classification setup for a specific ML model
    public async Task<ServiceResponse<ClassificationDto>> GetClassificationSetupByMLModelIdAsync(Guid mlModelId)
    {
        var serviceResponse = new ServiceResponse<ClassificationDto>
        {
            Data = null,
            Message = "Failed to retrieve the classification setup. Please try again later."
        };

        try
        {
            _logger.LogInformation("Fetching classification setup for ML model ID: {MLModelId}", mlModelId);

            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mlModelId)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            if (mlModel == null)
            {
                _logger.LogWarning("No classification setup found for ML model ID: {MLModelId}", mlModelId);
                serviceResponse.Message = "No classification setup found for the specified ML model.";
                return serviceResponse;
            }

            _logger.LogInformation("Successfully retrieved classification setup for ML model ID: {MLModelId}", mlModelId);

            serviceResponse.Data = mlModel.Adapt<ClassificationDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Classification setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving classification setup | ML Model ID: {MLModelId}", mlModelId);
        }

        return serviceResponse;
    }
}
