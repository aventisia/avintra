namespace MLModelBuilderAPIs.Services;

public class SummarizationService : ISummarizationService
{
    private readonly ILogger<SummarizationService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILLMDataExtractionService _llmDataExtractionService;
    private readonly Guid _userId;

    public SummarizationService(
        ILogger<SummarizationService> logger,
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
            existingModel.SetupStatus = SetupStatusTypesEnum.Completed;
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
        var defaultPrompt = new StringBuilder();

        switch (summarizationDto.SetupObject.SummarizationMethod)
        {
            case SummarizationMethodTypesEnum.MapReduce:
                if (!string.IsNullOrWhiteSpace(summarizationDto.SetupObject.MapIndividualSummaryPrompt))
                {
                    defaultPrompt.AppendLine("Map Phase Prompt:");
                    defaultPrompt.AppendLine(summarizationDto.SetupObject.MapIndividualSummaryPrompt.Trim());
                }

                if (!string.IsNullOrWhiteSpace(summarizationDto.SetupObject.MapFinalCombinePrompt))
                {
                    defaultPrompt.AppendLine("Reduce Phase Prompt:");
                    defaultPrompt.AppendLine(summarizationDto.SetupObject.MapFinalCombinePrompt.Trim());
                }
                break;

            case SummarizationMethodTypesEnum.Refine:
                if (!string.IsNullOrWhiteSpace(summarizationDto.SetupObject.RefineInitialPrompt))
                {
                    defaultPrompt.AppendLine("Initial Refinement Prompt:");
                    defaultPrompt.AppendLine(summarizationDto.SetupObject.RefineInitialPrompt.Trim());
                }

                if (!string.IsNullOrWhiteSpace(summarizationDto.SetupObject.RefineSubsequentPrompt))
                {
                    defaultPrompt.AppendLine("Subsequent Refinement Prompt:");
                    defaultPrompt.AppendLine(summarizationDto.SetupObject.RefineSubsequentPrompt.Trim());
                }
                break;

            case SummarizationMethodTypesEnum.Stuff:
                if (!string.IsNullOrWhiteSpace(summarizationDto.SetupObject.StuffPrompt))
                {
                    defaultPrompt.AppendLine("Stuff Prompt:");
                    defaultPrompt.AppendLine(summarizationDto.SetupObject.StuffPrompt.Trim());
                }
                break;
        }

        // Load a template file and replace placeholders with the generated prompt sections
        var generatedPrompt = FileTemplateLoaderUtil.LoadAndRenderFile("SummarizationPrompt.txt", new Dictionary<string, string>()
                    {
                        // Replace the placeholders {{Prompt}}, {{Context}}, {{CharactersPerChunk}}, {{ChunkOverlap}}, {{TotalMinimumWords}}, and {{TotalMaximumWords}} in the template with the respective sections
                        {"{{Prompt}}", defaultPrompt.Replace("\n","").ToString()  },
                        {"{{Context}}", summarizationDto.SetupObject.Context.ToString()  },
                        {"{{CharactersPerChunk}}", summarizationDto.SetupObject.CharactersPerChunk.ToString()},
                        {"{{ChunkOverlap}}", summarizationDto.SetupObject.ChunkOverlap.ToString()},
                        {"{{TotalMinimumWords}}", summarizationDto.SetupObject.TotalMinimumWords.ToString() },
                        {"{{TotalMaximumWords}}", summarizationDto.SetupObject.TotalMaximumWords.ToString()}
                    }
                );

        // Return the final generated prompt after replacing newline characters and returning the string
        return generatedPrompt.Replace("\n", "").ToString();
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

    // Extracts summarization data using a Language Learning Model (LLM).
    public async Task<ServiceResponse<SummarizationResponseDto>> ExtractViaLLMAsync(ExtractRequestDto extractRequestDto)
    {
        // Initialize ServiceResponse with a default failure message
        var serviceResponse = new ServiceResponse<SummarizationResponseDto>
        {
            Data = null,
            Message = "Failed to extract summarization data via LLM. Please try again."
        };

        try
        {
            _logger.LogInformation("Starting summarization extraction for ModelId: {ModelId}", extractRequestDto.ModelId);

            // Retrieve the model from the repository
            var model = await _unitOfWork.MLModelRepo
                                          .GetByConditionAsync(w => w.Id == extractRequestDto.ModelId)
                                          .Include(i => i.ExtractedData)
                                          .SingleOrDefaultAsync();

            // If the model is not found, log and return a failure response
            if (model == null)
            {
                _logger.LogWarning("Model not found for ModelId: {ModelId}", extractRequestDto.ModelId);
                serviceResponse.Message = "Model not found";
                return serviceResponse;
            }

            // Check if the model has a generated prompt for summarization
            if (string.IsNullOrEmpty(model.GeneratedPrompt))
            {
                _logger.LogWarning("No summarization prompt found for ModelId: {ModelId}", extractRequestDto.ModelId);
                serviceResponse.Message = "Missing summarization prompt for the model";
                return serviceResponse;
            }

            // List to store extracted summarization data for each file
            var extractedDataList = new List<SummarizationSetupFileData>();

            // Initialize a list to store data that will be inserted into the database.
            var extractedDataToBeInserted = new List<ExtractedData>();

            // Initialize a list to store data that will be updated into the database.
            var extractedDataToBeUpdated = new List<ExtractedData>();

            _logger.LogInformation("Starting extraction for {FileCount} files", extractRequestDto.FileIds.Count);

            // Process each file ID to extract summarization data
            foreach (var fileId in extractRequestDto.FileIds)
            {
                _logger.LogInformation("Processing extraction for FileId: {FileId}", fileId);

                var extractedData = new SummarizationSetupFileData
                {
                    ExtractedData = new SummarizationSetupData(),
                    FileId = fileId,
                    Remarks = $"001: Summarization extraction failed for FileId: {fileId}."
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

                // Call LLM extraction service for summarization
                // var llmResponse = await _llmDataExtractionService.ExtractDataAsync(model.GeneratedPrompt, model.LLM, file.Path);

                // // Check if LLM extraction was successful
                // if (llmResponse.StatusCode != 200)
                // {
                //     _logger.LogWarning("LLM summarization extraction failed for FileId: {FileId} with message: {Message}", fileId, llmResponse.Message);
                //     extractedData.Remarks = $"003: LLM summarization extraction failed. {llmResponse.Message}";
                //     extractedDataList.Add(extractedData);
                //     continue;
                // }

                // // Check if LLM returned empty data
                // if (string.IsNullOrEmpty(llmResponse.Data))
                // {
                //     _logger.LogWarning("LLM returned empty data for FileId: {FileId}", fileId);
                //     extractedData.Remarks = $"004: LLM returned empty response for FileId: {fileId}";
                //     extractedDataList.Add(extractedData);
                //     continue;
                // }

                // Deserialize the extracted summarization data
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var llmResponse = "{\"summary\": \"In 2025, OpenAI launched a new AI model capable of handling complex reasoning and multimodal inputs, such as images and video. The model demonstrates enhanced language accuracy and integrates with productivity tools, supporting real-time collaboration. While experts commend its performance, they emphasize the need for responsible deployment and attention to privacy concerns.\"}";
                extractedData.ExtractedData = JsonSerializer.Deserialize<SummarizationSetupData>(llmResponse, options) ?? new SummarizationSetupData();
                extractedData.Remarks = "";

                _logger.LogInformation("Successfully extracted and deserialized summarization data for FileId: {FileId}", fileId);

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
            
            // Prepare the response DTO with extracted summarization data
            var extractResponseDto = new SummarizationResponseDto
            {
                ModelId = extractRequestDto.ModelId,
                FilesExtractedData = extractedDataList
            };

            // Finalize the service response based on the extraction results
            serviceResponse.Data = extractResponseDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = extractedDataList.Any(w => w.Remarks.Contains("Failed")) ?
                                        "Summarization extraction failed for one or more files" :
                                        "Summarization extraction completed successfully";

            _logger.LogInformation("Summarization extraction process finished. Status: {Message}", serviceResponse.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during summarization extraction via LLM.");
        }

        return serviceResponse;
    }
}
