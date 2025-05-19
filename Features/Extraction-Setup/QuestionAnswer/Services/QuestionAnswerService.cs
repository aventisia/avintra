namespace MLModelBuilderAPIs.Services;

public class QuestionAnswerService : IQuestionAnswerService
{
    private readonly ILogger<QuestionAnswerService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public QuestionAnswerService(
        ILogger<QuestionAnswerService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Extract the user ID from the current HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Updates the QuestionAnswer configuration for the specified ML model
    public async Task<ServiceResponse<QuestionAnswerDto>> UpdateQuestionAnswerSetupAsync(QuestionAnswerDto QuestionAnswerDto)
    {
        var serviceResponse = new ServiceResponse<QuestionAnswerDto>
        {
            Data = null,
            Message = "Unable to update the QuestionAnswer setup. Please try again."
        };

        try
        {
            _logger.LogInformation("Starting update of QuestionAnswer setup | ID: {Id} | User: {UserId}", QuestionAnswerDto.Id, _userId);

            var mLModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == QuestionAnswerDto.Id)
                .SingleOrDefaultAsync();

            if (mLModel == null)
            {
                _logger.LogWarning("QuestionAnswer setup not found | ID: {Id} | User: {UserId}", QuestionAnswerDto.Id, _userId);
                serviceResponse.Message = "QuestionAnswer setup not found. Please check the ID.";
                return serviceResponse;
            }

            // Sanitize string properties in the DTO
            QuestionAnswerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(QuestionAnswerDto);

            // Apply updated values to the model entity
            QuestionAnswerDto.Adapt(mLModel);
            mLModel.GeneratedPrompt = GenerateQuestionAnswerModelPrompt(QuestionAnswerDto);
            mLModel.LastModifiedByUserId = _userId;

            _logger.LogInformation("Saving changes to QuestionAnswer setup | ID: {Id}", QuestionAnswerDto.Id);
            _unitOfWork.MLModelRepo.Update(mLModel);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Error saving changes to QuestionAnswer setup | ID: {Id} | User: {UserId}", QuestionAnswerDto.Id, _userId);
                return serviceResponse;
            }

            _logger.LogInformation("QuestionAnswer setup updated successfully | ID: {Id} | User: {UserId}", QuestionAnswerDto.Id, _userId);

            serviceResponse.Data = mLModel.Adapt<QuestionAnswerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "QuestionAnswer setup updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An exception occurred during update of QuestionAnswer setup | ID: {Id} | User: {UserId}", QuestionAnswerDto.Id, _userId);
        }

        return serviceResponse;
    }

    // Builds the prompt string for the QuestionAnswer model based on provided setup details
    private string? GenerateQuestionAnswerModelPrompt(QuestionAnswerDto QuestionAnswerDto)
    {
        var promptBuilder = new StringBuilder();

        // Use a custom prompt if provided; otherwise, use the default instruction
        promptBuilder.AppendLine(!string.IsNullOrEmpty(QuestionAnswerDto.SetupObject?.Prompt)
            ? QuestionAnswerDto.SetupObject.Prompt.Trim()
            : "You are an expert in answering questions. Your task is to analyze and classify the content provided.");

        var questionAnswerBuilder = new StringBuilder();

        // Add instructions based on predefined question and answer, if available
        if (QuestionAnswerDto.SetupObject?.QuestionAnswers != null && QuestionAnswerDto.SetupObject.QuestionAnswers.Any())
        {
            for (int i = 0; i < QuestionAnswerDto.SetupObject.QuestionAnswers.Count; i++)
            {
                var category = QuestionAnswerDto.SetupObject.QuestionAnswers[i];
                var instructions = string.IsNullOrEmpty(category.Instructions) ? "" : $", - {category.Instructions}";
                questionAnswerBuilder.AppendLine($"- {i + 1}. {category.Name}{instructions}");
            }
        }

        // Load a template file and replace placeholders with the generated prompt sections
        var generatedPrompt = FileTemplateLoaderUtil.LoadAndRenderFile("QuestionAnswerPrompt.txt", new Dictionary<string, string>()
                    {
                        // Replace the placeholders {{Prompt}}, {{Context}}, and {{Questions}} in the template with the respective sections
                        {"{{Prompt}}", promptBuilder.Replace("\n","").ToString()  },
                        {"{{Context}}", QuestionAnswerDto.SetupObject.Context.Replace("\n","").ToString() },
                        {"{{Questions}}", questionAnswerBuilder.Replace("\n","").ToString() },
                    }
                );

        // Return the final generated prompt after replacing newline characters and returning the string
        return generatedPrompt.Replace("\n", "").ToString();
    }

    // Retrieves the QuestionAnswer setup associated with a specific ML model
    public async Task<ServiceResponse<QuestionAnswerDto>> GetQuestionAnswerSetupByMLModelIdAsync(Guid mlModelId)
    {
        var serviceResponse = new ServiceResponse<QuestionAnswerDto>
        {
            Data = null,
            Message = "Unable to fetch the QuestionAnswer setup. Please try again."
        };

        try
        {
            _logger.LogInformation("Retrieving QuestionAnswer setup for ML Model ID: {MLModelId}", mlModelId);

            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mlModelId)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            if (mlModel == null)
            {
                _logger.LogWarning("QuestionAnswer setup not found for ML Model ID: {MLModelId}", mlModelId);
                serviceResponse.Message = "No setup found for the specified ML model.";
                return serviceResponse;
            }

            _logger.LogInformation("QuestionAnswer setup retrieved successfully for ML Model ID: {MLModelId}", mlModelId);

            serviceResponse.Data = mlModel.Adapt<QuestionAnswerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "QuestionAnswer setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving the QuestionAnswer setup | ML Model ID: {MLModelId}", mlModelId);
        }

        return serviceResponse;
    }
}