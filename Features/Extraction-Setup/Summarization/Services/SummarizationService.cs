namespace MLModelBuilderAPIs.Services;

public class SummarizationService : ISummarizationService
{
    private readonly ILogger<SummarizationService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public SummarizationService(
        ILogger<SummarizationService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Retrieve the current user's ID from the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Updates the Summarization setup for a given ML model
    public async Task<ServiceResponse<SummarizationDto>> UpdateSummarizationSetupAsync(SummarizationDto SummarizationDto)
    {
        var serviceResponse = new ServiceResponse<SummarizationDto>
        {
            Data = null,
            Message = "Failed to update the Summarization setup. Please try again later."
        };

        try
        {
            _logger.LogInformation("Initiating update for Summarization setup | Setup ID: {Id} | User ID: {UserId}", SummarizationDto.Id, _userId);

            var mLModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == SummarizationDto.Id)
                .SingleOrDefaultAsync();

            if (mLModel == null)
            {
                _logger.LogWarning("No Summarization setup found | Setup ID: {Id} | User ID: {UserId}", SummarizationDto.Id, _userId);
                serviceResponse.Message = "Summarization setup not found. Please verify the setup ID.";
                return serviceResponse;
            }

            // Clean up DTO string properties
            SummarizationDto = TrimDtoStringPropsUtil.TrimDtoStringProps(SummarizationDto);

            // Map the updated DTO data to the model entity
            SummarizationDto.Adapt(mLModel);
            mLModel.GeneratedPrompt = GenerateSummarizationModelPrompt(SummarizationDto);
            mLModel.LastModifiedByUserId = _userId;

            _logger.LogInformation("Saving updated Summarization setup | Setup ID: {Id}", SummarizationDto.Id);
            _unitOfWork.MLModelRepo.Update(mLModel);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save updated Summarization setup | Setup ID: {Id} | User ID: {UserId}", SummarizationDto.Id, _userId);
                return serviceResponse;
            }

            _logger.LogInformation("Successfully updated Summarization setup | Setup ID: {Id} | User ID: {UserId}", SummarizationDto.Id, _userId);

            serviceResponse.Data = mLModel.Adapt<SummarizationDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Summarization setup updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating the Summarization setup | Setup ID: {Id} | User ID: {UserId}", SummarizationDto.Id, _userId);
        }

        return serviceResponse;
    }

    // Constructs the prompt string for the Summarization model based on configuration details
    private string? GenerateSummarizationModelPrompt(SummarizationDto SummarizationDto)
    {
        var promptBuilder = new StringBuilder();

        // Use custom prompt if provided; otherwise, default to a generic Summarization instruction
        promptBuilder.AppendLine(!string.IsNullOrEmpty(SummarizationDto.SetupObject?.Prompt)
            ? SummarizationDto.SetupObject.Prompt.Trim()
            : "You are a Summarization expert. Your task is to classify the provided content.");

        switch (SummarizationDto.SetupObject.SummarizationMethod)
        {
            case SummarizationMethodTypesEnum.MapReduce:
                if (!string.IsNullOrWhiteSpace(SummarizationDto.SetupObject.MapIndividualSummaryPrompt))
                {
                    promptBuilder.AppendLine("Map Step Prompt:");
                    promptBuilder.AppendLine(SummarizationDto.SetupObject.MapIndividualSummaryPrompt.Trim());
                }

                if (!string.IsNullOrWhiteSpace(SummarizationDto.SetupObject.MapFinalCombinePrompt))
                {
                    promptBuilder.AppendLine("Reduce Step Prompt:");
                    promptBuilder.AppendLine(SummarizationDto.SetupObject.MapFinalCombinePrompt.Trim());
                }
                break;

            case SummarizationMethodTypesEnum.Refine:
                if (!string.IsNullOrWhiteSpace(SummarizationDto.SetupObject.RefineInitialPrompt))
                {
                    promptBuilder.AppendLine("Initial Refine Prompt:");
                    promptBuilder.AppendLine(SummarizationDto.SetupObject.RefineInitialPrompt.Trim());
                }

                if (!string.IsNullOrWhiteSpace(SummarizationDto.SetupObject.RefineSubsequentPrompt))
                {
                    promptBuilder.AppendLine("Subsequent Refine Prompt:");
                    promptBuilder.AppendLine(SummarizationDto.SetupObject.RefineSubsequentPrompt.Trim());
                }
                break;

            case SummarizationMethodTypesEnum.Stuff:
                if (!string.IsNullOrWhiteSpace(SummarizationDto.SetupObject.StuffPrompt))
                {
                    promptBuilder.AppendLine("Stuff Prompt:");
                    promptBuilder.AppendLine(SummarizationDto.SetupObject.StuffPrompt.Trim());
                }
                break;
        }

        // Include summarization constraints if defined
        if (SummarizationDto.SetupObject.TotalMinimumWords > 0 || SummarizationDto.SetupObject.TotalMaximumWords > 0)
        {
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Constraints:");
            if (SummarizationDto.SetupObject.TotalMinimumWords > 0)
                promptBuilder.AppendLine($"- Minimum words: {SummarizationDto.SetupObject.TotalMinimumWords}");
            if (SummarizationDto.SetupObject.TotalMaximumWords > 0)
                promptBuilder.AppendLine($"- Maximum words: {SummarizationDto.SetupObject.TotalMaximumWords}");
        }

        // Define the expected output format for the model's Summarization
        promptBuilder.AppendLine();
        // Final instructions
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("Output Format:");
        promptBuilder.AppendLine("Return a clear and concise summary in plain text.");
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("Guidelines:");
        promptBuilder.AppendLine("- Focus only on the key ideas from the source text.");
        promptBuilder.AppendLine("- Avoid unnecessary repetition or filler.");
        promptBuilder.AppendLine("- Maintain the original meaning and tone of the content.");

        return promptBuilder.ToString().Replace("\n", " ");
    }

    // Retrieves the Summarization setup for a specific ML model
    public async Task<ServiceResponse<SummarizationDto>> GetSummarizationSetupByMLModelIdAsync(Guid mlModelId)
    {
        var serviceResponse = new ServiceResponse<SummarizationDto>
        {
            Data = null,
            Message = "Failed to retrieve the Summarization setup. Please try again later."
        };

        try
        {
            _logger.LogInformation("Fetching Summarization setup for ML model ID: {MLModelId}", mlModelId);

            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mlModelId)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            if (mlModel == null)
            {
                _logger.LogWarning("No Summarization setup found for ML model ID: {MLModelId}", mlModelId);
                serviceResponse.Message = "No Summarization setup found for the specified ML model.";
                return serviceResponse;
            }

            _logger.LogInformation("Successfully retrieved Summarization setup for ML model ID: {MLModelId}", mlModelId);

            serviceResponse.Data = mlModel.Adapt<SummarizationDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Summarization setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving Summarization setup | ML Model ID: {MLModelId}", mlModelId);
        }

        return serviceResponse;
    }
}
