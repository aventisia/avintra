namespace MLModelBuilderAPIs.Services;

public class SentimentAnalyticsService : ISentimentAnalyticsService
{
    private readonly ILogger<SentimentAnalyticsService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILLMDataExtractionService _llmDataExtractionService;
    private readonly Guid _userId;

    public SentimentAnalyticsService(
        ILogger<SentimentAnalyticsService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ILLMDataExtractionService llmDataExtractionService)
    {
        // Extract the current user ID from the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _llmDataExtractionService = llmDataExtractionService;
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

    // Extracts sentiment analytics data using a Language Learning Model (LLM).
    public async Task<ServiceResponse<SentimentAnalyticsResponseDto>> ExtractViaLLMAsync(ExtractRequestDto extractRequestDto)
    {
        // Initialize ServiceResponse with a default failure message
        var serviceResponse = new ServiceResponse<SentimentAnalyticsResponseDto>
        {
            Data = null,
            Message = "Failed to extract sentiment analytics data via LLM. Please try again."
        };

        try
        {
            _logger.LogInformation("Starting sentiment analysis extraction for ModelId: {ModelId}", extractRequestDto.ModelId);

            // Retrieve the model from the repository
            var model = await _unitOfWork.MLModelRepo
                                          .GetByConditionAsync(w => w.Id == extractRequestDto.ModelId)
                                          .Include(i => i.ExtractedData)
                                          .SingleOrDefaultAsync();

            // If model is not found, log and return a failure response
            if (model == null)
            {
                _logger.LogWarning("Model not found for ModelId: {ModelId}", extractRequestDto.ModelId);
                serviceResponse.Message = "Model not found";
                return serviceResponse;
            }

            // Check if the model has a generated prompt for sentiment analysis
            if (string.IsNullOrEmpty(model.GeneratedPrompt))
            {
                _logger.LogWarning("No prompt found for ModelId: {ModelId}", extractRequestDto.ModelId);
                serviceResponse.Message = "Missing prompt for sentiment analysis";
                return serviceResponse;
            }

            // List to store sentiment analysis data for each file
            var extractedDataList = new List<SentimentAnalyticsSetupFileData>();

            // Initialize a list to store data that will be updated into the database.
            var extractedDataToBeUpdated = new List<ExtractedData>();

            // Initialize a list to store data that will be inserted into the database.
            var extractedDataToBeInserted = new List<ExtractedData>();

            _logger.LogInformation("Starting extraction for {FileCount} files", extractRequestDto.FileIds.Count);

            // Loop through each file ID to process sentiment analysis extraction
            foreach (var fileId in extractRequestDto.FileIds)
            {
                _logger.LogInformation("Processing sentiment analysis extraction for FileId: {FileId}", fileId);

                var extractedData = new SentimentAnalyticsSetupFileData
                {
                    ExtractedData = new List<SentimentAnalyticsSetupData>(),
                    FileId = fileId,
                    Remarks = $"001: Failed to extract sentiment analysis data for FileId: {fileId}."
                };

                // Retrieve file from repository
                var file = await _unitOfWork.UploadedDocRepo
                                             .GetByConditionAsync(w => w.Id == fileId)
                                             .SingleOrDefaultAsync();

                if (file == null)
                {
                    _logger.LogWarning("File not found for FileId: {FileId}", fileId);
                    extractedData.Remarks = $"002: File not found for FileId: {fileId}.";
                    extractedDataList.Add(extractedData);
                    continue;
                }

                // Call the LLM extraction service for sentiment analysis
                var llmResponse = await _llmDataExtractionService.ExtractDataAsync(model.GeneratedPrompt, model.LLM, file.Path);

                // Check for valid response from the LLM service
                if (llmResponse.StatusCode != 200)
                {
                    _logger.LogWarning("LLM sentiment analysis extraction failed for FileId: {FileId} with message: {Message}", fileId, llmResponse.Message);
                    extractedData.Remarks = $"003: LLM extraction failed. {llmResponse.Message}";
                    extractedDataList.Add(extractedData);
                    continue;
                }

                // Check if LLM returned empty data
                if (string.IsNullOrEmpty(llmResponse.Data))
                {
                    _logger.LogWarning("LLM returned empty sentiment data for FileId: {FileId}", fileId);
                    extractedData.Remarks = $"004: LLM returned empty sentiment response for FileId: {fileId}";
                    extractedDataList.Add(extractedData);
                    continue;
                }

                // Check if the LLM response does not contain the expected structure (i.e., '[')
                if (!llmResponse.Data.Contains("["))
                {
                    _logger.LogError("005: Data extraction failed for FileId: {fileId}.", fileId);
                    extractedData.Remarks = $"005: Failed to extract valid data for FileId: {fileId}";
                    extractedDataList.Add(extractedData);
                    continue;
                }

                // Attempt to deserialize the extracted sentiment data
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                extractedData.ExtractedData = JsonSerializer.Deserialize<List<SentimentAnalyticsSetupData>>(llmResponse.Data, options) ?? new List<SentimentAnalyticsSetupData>();
                extractedData.Remarks = "";

                _logger.LogInformation("Successfully extracted and deserialized sentiment data for FileId: {FileId}", fileId);

                extractedDataList.Add(extractedData);

                // Check if there is already existing extracted data for this document
                var existingExtractedData = model.ExtractedData?.FirstOrDefault(w => w.DocId == file.Id);
                if (existingExtractedData == null)
                {
                    _logger.LogInformation("No existing extracted data found for DocId: {DocId}. Preparing new record for insertion.", file.Id);

                    // Prepare a new ExtractedData object for insertion
                    extractedDataToBeInserted.Add(new ExtractedData()
                    {
                        DocId = file.Id,
                        Type = file.Type,
                        MLModelId = model.Id,
                        DataObject = JsonSerializer.Serialize(extractedData.ExtractedData, new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        }),
                        CreatedByUserId = _userId,
                        LastModifiedByUserId = _userId
                    });
                }
                else
                {
                    _logger.LogInformation("Existing extracted data found for DocId: {DocId}. Preparing record for update.", file.Id);

                    // Update the existing data object with new values
                    existingExtractedData.DataObject = JsonSerializer.Serialize(extractedData.ExtractedData, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    existingExtractedData.LastModifiedByUserId = _userId;

                    // Add to update list
                    extractedDataToBeUpdated.Add(existingExtractedData);
                }

                // Optionally push the extracted data to the client UI
                // await _extractHub.Clients.User(_userId.ToString()).SendAsync("GetExtractedData", extractedData);
            }
            // Check if there is any extracted data to insert into the database
            if (extractedDataToBeInserted.Any())
            {
                _logger.LogInformation("Inserting {Count} new extracted data records into the database.", extractedDataToBeInserted.Count);

                // Insert new records
                await _unitOfWork.ExtractedDataRepo.InsertAsync(extractedDataToBeInserted);

                // Save database changes
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save extracted data to the database after insertion.");
                }
            }

            // Check if there is any extracted data to update into the database
            if (extractedDataToBeUpdated.Any())
            {
                _logger.LogInformation("Updating {Count} existing extracted data records in the database.", extractedDataToBeUpdated.Count);

                // Update existing records
                _unitOfWork.ExtractedDataRepo.Update(extractedDataToBeUpdated);

                // Save database changes
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save extracted data to the database after update.");
                }
            }

            // Prepare the response DTO with extracted sentiment analysis data
            var extractResponseDto = new SentimentAnalyticsResponseDto
            {
                ModelId = extractRequestDto.ModelId,
                FilesExtractedData = extractedDataList
            };

            // Finalize the service response with success or failure message
            serviceResponse.Data = extractResponseDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = extractedDataList.Any(w => w.Remarks.Contains("Failed")) ?
                                        "Sentiment analysis extraction failed for one or more files" :
                                        "Sentiment analysis data extracted successfully";

            _logger.LogInformation("Sentiment analysis extraction process completed. Summary: {Message}", serviceResponse.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An exception occurred during the sentiment analysis extraction process.");
        }

        return serviceResponse;
    }
}