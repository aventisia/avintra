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
        // Extract the user ID from the current HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Updates the summarization setup for a specific ML model
    public async Task<ServiceResponse<SummarizationDto>> UpdateSummarizationSetupAsync(SummarizationDto summarizationDto)
    {
        var response = new ServiceResponse<SummarizationDto>
        {
            Data = null,
            Message = "Failed to update the summarization setup. Please try again.",
        };

        try
        {
            _logger.LogInformation("Updating summarization setup | Model ID: {ModelId} | User ID: {UserId}", summarizationDto.Id, _userId);

            // Validate based on summarization method
            switch (summarizationDto.SetupObject.SummarizationMethod)
            {
                case SummarizationMethodTypesEnum.MapReduce:
                    if (string.IsNullOrWhiteSpace(summarizationDto.SetupObject.MapIndividualSummaryPrompt))
                    {
                        _logger.LogWarning("'MapIndividualSummaryPrompt' is required and cannot be null or empty.");
                        response.Message = "'MapIndividualSummaryPrompt' is required.";
                        return response;
                    }

                    if (string.IsNullOrWhiteSpace(summarizationDto.SetupObject.MapFinalCombinePrompt))
                    {
                        _logger.LogWarning("'MapFinalCombinePrompt' is required and cannot be null or empty.");
                        response.Message = "'MapFinalCombinePrompt' is required.";
                        return response;
                    }
                    break;

                case SummarizationMethodTypesEnum.Refine:
                    if (string.IsNullOrWhiteSpace(summarizationDto.SetupObject.RefineInitialPrompt))
                    {
                        _logger.LogWarning("'RefineInitialPrompt' is required and cannot be null or empty.");
                        response.Message = "'RefineInitialPrompt' is required.";
                        return response;
                    }

                    if (string.IsNullOrWhiteSpace(summarizationDto.SetupObject.RefineSubsequentPrompt))
                    {
                        _logger.LogWarning("'RefineSubsequentPrompt' is required and cannot be null or empty.");
                        response.Message = "'RefineSubsequentPrompt' is required.";
                        return response;
                    }
                    break;

                case SummarizationMethodTypesEnum.Stuff:
                    if (string.IsNullOrWhiteSpace(summarizationDto.SetupObject.StuffPrompt))
                    {
                        _logger.LogWarning("'StuffPrompt' is required and cannot be null or empty.");
                        response.Message = "'StuffPrompt' is required.";
                        return response;
                    }
                    break;

                default:
                    _logger.LogWarning("Invalid summarization method: {Method}", summarizationDto.SetupObject.SummarizationMethod);
                    response.Message = "Invalid summarization method.";
                    return response;
            }
            var existingModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(m => m.Id == summarizationDto.Id)
                .SingleOrDefaultAsync();

            if (existingModel == null)
            {
                _logger.LogWarning("Summarization setup not found | Model ID: {ModelId} | User ID: {UserId}", summarizationDto.Id, _userId);
                response.Message = "Summarization setup not found. Please check the model ID.";
                return response;
            }

            summarizationDto = TrimDtoStringPropsUtil.TrimDtoStringProps(summarizationDto);

            summarizationDto.Adapt(existingModel);
            existingModel.GeneratedPrompt = GenerateSummarizationPrompt(summarizationDto);
            existingModel.LastModifiedByUserId = _userId;

            _logger.LogInformation("Saving changes to summarization setup | Model ID: {ModelId}", summarizationDto.Id);
            _unitOfWork.MLModelRepo.Update(existingModel);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Error saving summarization setup | Model ID: {ModelId} | User ID: {UserId}", summarizationDto.Id, _userId);
                return response;
            }

            _logger.LogInformation("Summarization setup updated successfully | Model ID: {ModelId} | User ID: {UserId}", summarizationDto.Id, _userId);

            response.Data = existingModel.Adapt<SummarizationDto>();
            response.StatusCode = 200;
            response.Message = "Summarization setup updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while updating summarization setup | Model ID: {ModelId} | User ID: {UserId}", summarizationDto.Id, _userId);
        }

        return response;
    }

    // Builds the prompt string for the summarization model using the setup settings
    private string? GenerateSummarizationPrompt(SummarizationDto summarizationDto)
    {
        var promptBuilder = new StringBuilder();

        switch (summarizationDto.SetupObject.SummarizationMethod)
        {
            case SummarizationMethodTypesEnum.MapReduce:
                if (!string.IsNullOrWhiteSpace(summarizationDto.SetupObject.MapIndividualSummaryPrompt))
                {
                    promptBuilder.AppendLine("Map Phase Prompt:");
                    promptBuilder.AppendLine(summarizationDto.SetupObject.MapIndividualSummaryPrompt.Trim());
                }

                if (!string.IsNullOrWhiteSpace(summarizationDto.SetupObject.MapFinalCombinePrompt))
                {
                    promptBuilder.AppendLine("Reduce Phase Prompt:");
                    promptBuilder.AppendLine(summarizationDto.SetupObject.MapFinalCombinePrompt.Trim());
                }
                break;

            case SummarizationMethodTypesEnum.Refine:
                if (!string.IsNullOrWhiteSpace(summarizationDto.SetupObject.RefineInitialPrompt))
                {
                    promptBuilder.AppendLine("Initial Refinement Prompt:");
                    promptBuilder.AppendLine(summarizationDto.SetupObject.RefineInitialPrompt.Trim());
                }

                if (!string.IsNullOrWhiteSpace(summarizationDto.SetupObject.RefineSubsequentPrompt))
                {
                    promptBuilder.AppendLine("Subsequent Refinement Prompt:");
                    promptBuilder.AppendLine(summarizationDto.SetupObject.RefineSubsequentPrompt.Trim());
                }
                break;

            case SummarizationMethodTypesEnum.Stuff:
                if (!string.IsNullOrWhiteSpace(summarizationDto.SetupObject.StuffPrompt))
                {
                    promptBuilder.AppendLine("Stuff Prompt:");
                    promptBuilder.AppendLine(summarizationDto.SetupObject.StuffPrompt.Trim());
                }
                break;
        }

        // Add summarization length constraints if specified
        if (summarizationDto.SetupObject.TotalMinimumWords > 0 || summarizationDto.SetupObject.TotalMaximumWords > 0)
        {
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Length Constraints:");
            if (summarizationDto.SetupObject.TotalMinimumWords > 0)
                promptBuilder.AppendLine($"- Minimum word count: {summarizationDto.SetupObject.TotalMinimumWords}");
            if (summarizationDto.SetupObject.TotalMaximumWords > 0)
                promptBuilder.AppendLine($"- Maximum word count: {summarizationDto.SetupObject.TotalMaximumWords}");
        }

        // Define output format and writing style expectations
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("Expected Output:");
        promptBuilder.AppendLine("Provide a clear, concise summary in plain text format.");
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("Writing Guidelines:");
        promptBuilder.AppendLine("- Emphasize key ideas and relevant details.");
        promptBuilder.AppendLine("- Avoid redundant or irrelevant content.");
        promptBuilder.AppendLine("- Preserve the original tone and meaning.");

        return promptBuilder.ToString().Replace("\n", " ");
    }

    // Retrieves the summarization setup for a given ML model ID
    public async Task<ServiceResponse<SummarizationDto>> GetSummarizationSetupByMLModelIdAsync(Guid mlModelId)
    {
        var response = new ServiceResponse<SummarizationDto>
        {
            Data = null,
            Message = "Failed to retrieve the summarization setup. Please try again."
        };

        try
        {
            _logger.LogInformation("Retrieving summarization setup | Model ID: {ModelId}", mlModelId);

            var model = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(m => m.Id == mlModelId)
                .Include(m => m.CreatedByUser)
                .SingleOrDefaultAsync();

            if (model == null)
            {
                _logger.LogWarning("Summarization setup not found | Model ID: {ModelId}", mlModelId);
                response.Message = "No summarization setup found for the specified model ID.";
                return response;
            }

            _logger.LogInformation("Summarization setup retrieved successfully | Model ID: {ModelId}", mlModelId);

            response.Data = model.Adapt<SummarizationDto>();
            response.StatusCode = 200;
            response.Message = "Summarization setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving summarization setup | Model ID: {ModelId}", mlModelId);
        }

        return response;
    }
}
