namespace MLModelBuilderAPIs.Services;

public class SentimentAnalyticsService : ISentimentAnalyticsService
{
    private readonly ILogger<SentimentAnalyticsService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public SentimentAnalyticsService(
        ILogger<SentimentAnalyticsService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Extract the current user ID from the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Updates the sentiment analysis setup for a specific ML model
    public async Task<ServiceResponse<SentimentAnalyticDto>> UpdateSentimentAnalyticsSetupAsync(SentimentAnalyticDto sentimentAnalyticDto)
    {
        var serviceResponse = new ServiceResponse<SentimentAnalyticDto>
        {
            Data = null,
            Message = "Failed to update sentiment analytics setup. Please try again later."
        };

        try
        {
            _logger.LogInformation("Starting update for sentiment analytics setup | Setup ID: {Id} | Performed by User ID: {UserId}", sentimentAnalyticDto.Id, _userId);

            var mLModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == sentimentAnalyticDto.Id)
                .SingleOrDefaultAsync();

            if (mLModel == null)
            {
                _logger.LogWarning("Sentiment analytics setup not found | Setup ID: {Id} | User ID: {UserId}", sentimentAnalyticDto.Id, _userId);
                serviceResponse.Message = "Setup not found. Please verify the setup ID.";
                return serviceResponse;
            }

            // Sanitize DTO string properties
            sentimentAnalyticDto = TrimDtoStringPropsUtil.TrimDtoStringProps(sentimentAnalyticDto);

            // Map incoming DTO data to the existing model entity
            sentimentAnalyticDto.Adapt(mLModel);
            mLModel.GeneratedPrompt = GenerateSentimentAnalyticsModelPrompt(sentimentAnalyticDto);
            mLModel.SetupStatus = SetupStatusTypesEnum.Completed;
            mLModel.LastModifiedByUserId = _userId;

            _logger.LogInformation("Saving changes to sentiment analytics setup | Setup ID: {Id}", sentimentAnalyticDto.Id);
            _unitOfWork.MLModelRepo.Update(mLModel);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save sentiment analytics setup changes | Setup ID: {Id} | User ID: {UserId}", sentimentAnalyticDto.Id, _userId);
                return serviceResponse;
            }

            _logger.LogInformation("Sentiment analytics setup updated successfully | Setup ID: {Id} | User ID: {UserId}", sentimentAnalyticDto.Id, _userId);

            serviceResponse.Data = mLModel.Adapt<SentimentAnalyticDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Setup updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating the sentiment analytics setup | Setup ID: {Id} | User ID: {UserId}", sentimentAnalyticDto.Id, _userId);
        }

        return serviceResponse;
    }

    // Builds the prompt string used by the ML model to perform sentiment analysis based on the configuration
    private string? GenerateSentimentAnalyticsModelPrompt(SentimentAnalyticDto sentimentAnalyticDto)
    {
        var defaultPrompt = new StringBuilder();

        // Use the custom prompt if provided, otherwise use a default instruction
        defaultPrompt.AppendLine(!string.IsNullOrEmpty(sentimentAnalyticDto.SetupObject?.Prompt)
            ? sentimentAnalyticDto.SetupObject.Prompt.Trim()
            : "You are a sentiment analysis expert. Your task is to accurately classify the sentiment of the provided content.");

        var categoriesPrompt = new StringBuilder();

        // Add category-based classification instructions if defined
        if (sentimentAnalyticDto.SetupObject?.Categories != null && sentimentAnalyticDto.SetupObject.Categories.Any())
        {
            for (int i = 0; i < sentimentAnalyticDto.SetupObject.Categories.Count; i++)
            {
                var category = sentimentAnalyticDto.SetupObject.Categories[i];
                var instructions = string.IsNullOrEmpty(category.Instructions) ? "" : $", - {category.Instructions}";
                categoriesPrompt.AppendLine($"{i + 1}. {category.Name}{instructions}");
            }
        }

        // Load a template file and replace placeholders with the generated prompt sections
        var generatedPrompt = FileTemplateLoaderUtil.LoadAndRenderFile("SentimentAnalyticsPrompt.txt", new Dictionary<string, string>()
                    {
                        // Replace the placeholders {{Prompt}}, {{Context}}, and {{Categories}} in the template with the respective sections
                        {"{{Prompt}}", defaultPrompt.Replace("\n","").ToString()  },
                        {"{{Context}}", sentimentAnalyticDto.SetupObject.Context.Replace("\n","").ToString() },
                        {"{{Categories}}", categoriesPrompt.Replace("\n","").ToString() },
                    }
                );

        // Return the final generated prompt after replacing newline characters and returning the string
        return generatedPrompt.Replace("\n", "").ToString();
    }

    // Retrieves the sentiment analytics setup for a given machine learning model ID
    public async Task<ServiceResponse<SentimentAnalyticDto>> GetSentimentAnalyticsSetupByMLModelIdAsync(Guid mlModelId)
    {
        var serviceResponse = new ServiceResponse<SentimentAnalyticDto>
        {
            Data = null,
            Message = "Failed to retrieve the sentiment analytics setup. Please try again later."
        };

        try
        {
            _logger.LogInformation("Fetching sentiment analytics setup for ML model ID: {MLModelId}", mlModelId);

            var mLModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mlModelId)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            if (mLModel == null)
            {
                _logger.LogWarning("No sentiment analytics setup found for ML model ID: {MLModelId}", mlModelId);
                serviceResponse.Message = "No setup found for the specified ML model.";
                return serviceResponse;
            }

            _logger.LogInformation("Sentiment analytics setup retrieved successfully for ML model ID: {MLModelId}", mlModelId);

            serviceResponse.Data = mLModel.Adapt<SentimentAnalyticDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving sentiment analytics setup | ML Model ID: {MLModelId}", mlModelId);
        }

        return serviceResponse;
    }
}
