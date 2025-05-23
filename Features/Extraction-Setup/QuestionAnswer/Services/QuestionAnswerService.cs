namespace MLModelBuilderAPIs.Services;

public class QuestionAnswerService : IQuestionAnswerService
{
    private readonly ILogger<QuestionAnswerService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILLMDataExtractionService _llmDataExtractionService;
    private readonly Guid _userId;

    public QuestionAnswerService(
        ILogger<QuestionAnswerService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ILLMDataExtractionService llmDataExtractionService)
    {
        // Extract the user ID from the current HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _llmDataExtractionService = llmDataExtractionService;
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
            mLModel.SetupStatus = SetupStatusTypesEnum.Completed;
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

    // Extracts question-answer pairs using a Language Learning Model (LLM).
    public async Task<ServiceResponse<QuestionAnswerResponseDto>> ExtractViaLLMAsync(ExtractRequestDto extractRequestDto)
    {
        // Initialize ServiceResponse with a default failure message
        var serviceResponse = new ServiceResponse<QuestionAnswerResponseDto>
        {
            Data = null,
            Message = "Failed to extract question and answer data via LLM. Please try again."
        };

        try
        {
            _logger.LogInformation("Starting Q&A extraction process for ModelId: {ModelId}", extractRequestDto.ModelId);

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

            // Check if the model has a prompt available for Q&A extraction
            if (string.IsNullOrEmpty(model.GeneratedPrompt))
            {
                _logger.LogWarning("No prompt found for ModelId: {ModelId}", extractRequestDto.ModelId);
                serviceResponse.Message = "Missing prompt for question-answer extraction";
                return serviceResponse;
            }

            // Prepare the list to hold extracted Q&A data for each file
            var extractedDataList = new List<QuestionAnswerSetupFileData>();

            // Initialize a list to store data that will be updated into the database.
            var extractedDataToBeUpdated = new List<ExtractedData>();

            // Initialize a list to store data that will be inserted into the database.
            var extractedDataToBeInserted = new List<ExtractedData>();

            _logger.LogInformation("Starting Q&A extraction for {FileCount} files", extractRequestDto.FileIds.Count);

            // Loop through each file ID and process extraction
            foreach (var fileId in extractRequestDto.FileIds)
            {
                _logger.LogInformation("Processing extraction for FileId: {FileId}", fileId);

                var extractedData = new QuestionAnswerSetupFileData
                {
                    ExtractedData = new List<QuestionAnswerSetupData>(),
                    FileId = fileId,
                    Remarks = $"001: Failed to extract Q&A data for FileId: {fileId}."
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

                // Call the LLM extraction service for Q&A data
                var llmResponse = await _llmDataExtractionService.ExtractDataAsync(model.GeneratedPrompt, model.LLM, file.Path);

                // Check if LLM extraction was successful
                if (llmResponse.StatusCode != 200)
                {
                    _logger.LogWarning("LLM extraction failed for FileId: {FileId} with message: {Message}", fileId, llmResponse.Message);
                    extractedData.Remarks = $"003: {llmResponse.Message}";
                    extractedDataList.Add(extractedData);
                    continue;
                }

                // Check if LLM returned empty data
                if (string.IsNullOrEmpty(llmResponse.Data))
                {
                    _logger.LogWarning("LLM returned empty data for FileId: {FileId}", fileId);
                    extractedData.Remarks = $"004: LLM returned empty response for FileId: {fileId}";
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

                // Deserialize the extracted Q&A data
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                extractedData.ExtractedData = JsonSerializer.Deserialize<List<QuestionAnswerSetupData>>(llmResponse.Data, options) ?? new List<QuestionAnswerSetupData>();
                extractedData.Remarks = "";

                _logger.LogInformation("Successfully extracted and deserialized Q&A data for FileId: {FileId}", fileId);

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

            // Prepare the final response DTO with the extracted Q&A data
            var extractResponseDto = new QuestionAnswerResponseDto
            {
                ModelId = extractRequestDto.ModelId,
                FilesExtractedData = extractedDataList
            };

            // Set the final status and message based on the extraction results
            serviceResponse.Data = extractResponseDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = extractedDataList.Any(w => w.Remarks.Contains("Failed")) ?
                                        "Failed to extract question-answer data for one or more files" :
                                        "Question-answer data extracted successfully";

            _logger.LogInformation("Q&A extraction process completed. Summary: {Message}", serviceResponse.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An exception occurred during the Q&A extraction process.");
        }

        return serviceResponse;
    }

    // Retrieves a collection of extracted data records associated with a specific machine learning model.
    public async Task<ServiceResponse<IEnumerable<QuestionAnswerExtractedDataDto>>> GetExtractedDataByMLModelIdAsync(Guid mlModelId)
    {
        // Initialize the response with a default failure message and null data
        var serviceResponse = new ServiceResponse<IEnumerable<QuestionAnswerExtractedDataDto>>
        {
            Data = null,
            Message = "Failed to retrieve extracted data. Please try again later."
        };

        try
        {
            // Log the beginning of the retrieval process
            _logger.LogInformation("Attempting to retrieve extracted data for ML model with ID: {MLModelId}", mlModelId);

            // Fetch the extracted data based on the provided ML model ID and map it to the DTO
            var extractedDataList = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(w => w.MLModelId == mlModelId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.UploadedDoc)
                .ProjectToType<QuestionAnswerExtractedDataDto>()
                .ToListAsync();


            // Log the successful retrieval of the setup
            _logger.LogInformation("Successfully retrieved extracted data for ML model with ID: {MLModelId}", mlModelId);

            // Set the successful response data
            serviceResponse.Data = extractedDataList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extracted data retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError("Error occurred while retrieving extracted data for ML model with ID: {MLModelId}. Exception: {ExceptionMessage}", mlModelId, ex.Message);
        }

        return serviceResponse;
    }

    // Retrieves a collection of extracted review data records associated with a specific machine learning model.
    public async Task<ServiceResponse<IEnumerable<QuestionAnswerReviewDataDto>>> GetExtractedReviewDataByMLModelIdAsync(Guid mlModelId)
    {// Initialize the response with a default failure message and null data
        var serviceResponse = new ServiceResponse<IEnumerable<QuestionAnswerReviewDataDto>>
        {
            Data = null,
            Message = "Failed to retrieve extracted review data. Please try again later."
        };

        try
        {
            // Log the beginning of the retrieval process
            _logger.LogInformation("Attempting to retrieve extracted review data for ML model with ID: {MLModelId}", mlModelId);

            // Fetch the extracted review data based on the provided ML model ID and map it to the DTO
            var extractedReviewDataList = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(w => w.MLModelId == mlModelId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.UploadedDoc)
                .ProjectToType<QuestionAnswerReviewDataDto>()
                .ToListAsync();

            // Log the successful retrieval of the setup
            _logger.LogInformation("Successfully retrieved extracted review data for ML model with ID: {MLModelId}", mlModelId);

            // Set the successful response data
            serviceResponse.Data = extractedReviewDataList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extracted review data retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError("Error occurred while retrieving extracted review data for ML model with ID: {MLModelId}. Exception: {ExceptionMessage}", mlModelId, ex.Message);
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
                questionAnswerBuilder.AppendLine($"{i + 1}. {category.Name}{instructions}");
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
}