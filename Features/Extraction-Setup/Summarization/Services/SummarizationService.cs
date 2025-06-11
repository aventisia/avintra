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
                // TODO: It will be used letter 
                // case SummarizationMethodTypesEnum.MapReduce:
                //     if (string.IsNullOrWhiteSpace(summarizationDto.SetupObject.MapIndividualSummaryPrompt))
                //     {
                //         _logger.LogWarning("'MapIndividualSummaryPrompt' is required and cannot be null or empty.");
                //         response.Message = "'MapIndividualSummaryPrompt' is required.";
                //         return response;
                //     }

                //     if (string.IsNullOrWhiteSpace(summarizationDto.SetupObject.MapFinalCombinePrompt))
                //     {
                //         _logger.LogWarning("'MapFinalCombinePrompt' is required and cannot be null or empty.");
                //         response.Message = "'MapFinalCombinePrompt' is required.";
                //         return response;
                //     }
                //     break;

                // case SummarizationMethodTypesEnum.Refine:
                //     if (string.IsNullOrWhiteSpace(summarizationDto.SetupObject.RefineInitialPrompt))
                //     {
                //         _logger.LogWarning("'RefineInitialPrompt' is required and cannot be null or empty.");
                //         response.Message = "'RefineInitialPrompt' is required.";
                //         return response;
                //     }

                //     if (string.IsNullOrWhiteSpace(summarizationDto.SetupObject.RefineSubsequentPrompt))
                //     {
                //         _logger.LogWarning("'RefineSubsequentPrompt' is required and cannot be null or empty.");
                //         response.Message = "'RefineSubsequentPrompt' is required.";
                //         return response;
                //     }
                //     break;

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
            _logger.LogInformation("Starting summarization for ModelId: {ModelId}", extractRequestDto.ModelId);

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

            _logger.LogInformation("Starting for {FileCount} files", extractRequestDto.FileIds.Count);

            // Process each file ID to extract summarization data
            foreach (var fileId in extractRequestDto.FileIds)
            {
                _logger.LogInformation("Processing for FileId: {FileId}", fileId);

                var extractedData = new SummarizationSetupFileData
                {
                    ExtractedData = new SummarizationSetupData(),
                    FileId = fileId,
                    Remarks = $"001: Summarization failed for FileId: {fileId}."
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

                // Record the start time of the LLM extraction call (in UTC)
                var startExecutionTime = DateTime.UtcNow;

                // Call the LLM extraction service
                var llmResponse = await _llmDataExtractionService.ExtractDataAsync(model.GeneratedPrompt, model.LLM, file.Path);

                // Record the end time after the extraction is complete (in UTC)
                var endExecutionTime = DateTime.UtcNow;

                // Calculate total execution time in seconds, rounding up to the nearest whole number
                int executionTimeInSeconds = (int)Math.Ceiling((endExecutionTime - startExecutionTime).TotalSeconds);

                // Check if LLM extraction was successful
                if (llmResponse.StatusCode != 200)
                {
                    _logger.LogWarning("LLM summarization failed for FileId: {FileId} with message: {Message}", fileId, llmResponse.Message);
                    extractedData.Remarks = $"003: LLM summarization failed. {llmResponse.Message}";
                    extractedDataList.Add(extractedData);

                    // Increment FailedCount if existing extracted data is found
                    var existing = model.ExtractedData?.FirstOrDefault(w => w.DocId == file.Id);
                    if (existing != null)
                    {
                        existing.FailedCount += 1;
                        existing.ExecutionTime += executionTimeInSeconds;
                        existing.LastModifiedByUserId = _userId;
                        extractedDataToBeUpdated.Add(existing);
                    }

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

                // Deserialize the extracted summarization data
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                try
                {
                    extractedData.ExtractedData = JsonSerializer.Deserialize<SummarizationSetupData>(llmResponse.Data, options) ?? new SummarizationSetupData();
                    extractedData.Remarks = "";
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Deserialization failed for FileId: {FileId}", fileId);
                    extractedData.Remarks = $"005: Deserialization failed for FileId: {fileId}";

                    // Increment FailedCount if existing extracted data is found
                    var existing = model.ExtractedData?.FirstOrDefault(w => w.DocId == file.Id);
                    if (existing != null)
                    {
                        existing.FailedCount += 1;
                        existing.ExecutionTime += executionTimeInSeconds;
                        existing.LastModifiedByUserId = _userId;
                        extractedDataToBeUpdated.Add(existing);
                    }

                    extractedDataList.Add(extractedData);
                    continue;
                }
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
                        TokenCount = 0,
                        ExecutionCount = 1,
                        ExecutionTime = executionTimeInSeconds,
                        FailedCount = 0,
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
                    existingExtractedData.ExecutionCount += 1;
                    existingExtractedData.ExecutionTime += executionTimeInSeconds;

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
                                        "Summarization failed for one or more files" :
                                        "Summarization completed successfully";

            _logger.LogInformation("Summarization process finished. Status: {Message}", serviceResponse.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during summarization via LLM.");
        }

        return serviceResponse;
    }

    // Retrieves a collection of extracted data records associated with a specific machine learning model.
    public async Task<ServiceResponse<IEnumerable<SummarizationExtractedDataDto>>> GetExtractedDataByMLModelIdAsync(Guid mlModelId)
    {
        // Initialize the response with a default failure message and null data
        var serviceResponse = new ServiceResponse<IEnumerable<SummarizationExtractedDataDto>>
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
                .ProjectToType<SummarizationExtractedDataDto>()
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
    public async Task<ServiceResponse<IEnumerable<SummarizationReviewDataDto>>> GetExtractedReviewDataByMLModelIdAsync(Guid mlModelId)
    {
        // Initialize the response with a default failure message and null data
        var serviceResponse = new ServiceResponse<IEnumerable<SummarizationReviewDataDto>>
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
                .ProjectToType<SummarizationReviewDataDto>()
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

    // Updates an extracted review data record associated with a specific machine learning model.
    public async Task<ServiceResponse<SummarizationExtractedDataDto>> UpdateExtractedReviewDataAsync(SummarizationExtractedDataDto summarizationExtractedDataDto)
    {
        // Initialize the response with default failure state
        var serviceResponse = new ServiceResponse<SummarizationExtractedDataDto>
        {
            Data = null,
            Message = "Failed to update review data. Please try again later."
        };

        try
        {
            _logger.LogInformation("Initiating update for review data with ID: {ReviewDataId}", summarizationExtractedDataDto.Id);

            // Retrieve the existing data record from the repository
            var existingReviewData = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(x => x.Id == summarizationExtractedDataDto.Id)
                .FirstOrDefaultAsync();

            if (existingReviewData == null)
            {
                _logger.LogWarning("Review data not found. ID: {ReviewDataId}", summarizationExtractedDataDto.Id);
                serviceResponse.Message = $"Review data not found.";
                return serviceResponse;
            }

            // Trim whitespace from all string properties in the DTO
            summarizationExtractedDataDto = TrimDtoStringPropsUtil.TrimDtoStringProps(summarizationExtractedDataDto);

            // Map the trimmed DTO values to the existing entity
            summarizationExtractedDataDto.Adapt(existingReviewData);

            // Apply the update to the repository
            _unitOfWork.ExtractedDataRepo.Update(existingReviewData);

            // Attempt to save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes during update of review data. ID: {ReviewDataId}, User ID: {UserId}", summarizationExtractedDataDto.Id, _userId);
                return serviceResponse;
            }

            _logger.LogInformation("Successfully updated review data. ID: {ReviewDataId}", summarizationExtractedDataDto.Id);

            // Prepare successful response
            serviceResponse.Data = existingReviewData.Adapt<SummarizationExtractedDataDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Review data updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while updating review data. ID: {ReviewDataId}", summarizationExtractedDataDto.Id);
        }

        return serviceResponse;
    }

    // Adds review data associated with a specific machine learning model.
    public async Task<ServiceResponse<IEnumerable<SummarizationReviewDataDto>>> AddReviewDataAsync(CreateModelReviewRequestDto createModelReviewRequestDto)
    {
        // Initialize the service response with a default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<SummarizationReviewDataDto>>
        {
            Data = null,
            Message = "Failed to add review data. Please try again later."
        };

        try
        {
            // Log the start of the review data creation process
            _logger.LogInformation("Initiating review data creation for ML model ID: {MLModelId}", createModelReviewRequestDto.MLModelId);

            // Retrieve uploaded documents using the provided file IDs
            var uploadedFiles = await _unitOfWork.UploadedDocRepo
                .GetByConditionAsync(doc => createModelReviewRequestDto.FileIds.Contains(doc.Id))
                .ToListAsync();

            if (!uploadedFiles.Any())
            {
                _logger.LogWarning("No uploaded documents found for file IDs: {FileIds} for ML model ID: {MLModelId}",
                    string.Join(", ", createModelReviewRequestDto.FileIds), createModelReviewRequestDto.MLModelId);

                serviceResponse.Message = "No uploaded documents matched the provided file IDs.";
                return serviceResponse;
            }

            // Prepare extracted data entities for insertion
            var extractedDataToInsert = uploadedFiles.Select(file => new ExtractedData
            {
                MLModelId = createModelReviewRequestDto.MLModelId,
                DocId = file.Id,
                DataObject = string.Empty,
                Accuracy = 0,
                Type = createModelReviewRequestDto.Type,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
                SubmitForFineTuning = false,
            }).ToList();

            // Insert extracted data
            await _unitOfWork.ExtractedDataRepo.InsertAsync(extractedDataToInsert);

            // Persist the changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist extracted review data for ML model ID: {MLModelId}", createModelReviewRequestDto.MLModelId);
                return serviceResponse;
            }

            // If scheduling information is provided, add a scheduled model entry
            if (createModelReviewRequestDto.ScheduleInfo != null)
            {
                await _unitOfWork.ScheduledModelRepo.InsertAsync(extractedDataToInsert.Select(s => new ScheduledModel
                {
                    MLModelId = createModelReviewRequestDto.MLModelId,
                    TimeZone = createModelReviewRequestDto.ScheduleInfo.TimeZone,
                    ScheduledAt = createModelReviewRequestDto.ScheduleInfo.ScheduledAt,
                    ScheduleType = ModelOperationTypesEnum.RunAndReview,
                    ExtractedDataId = s.Id,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                }).ToList());

                // Persist scheduled model entry
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save scheduled model entry for ML model ID: {MLModelId}", createModelReviewRequestDto.MLModelId);
                    return serviceResponse;
                }
            }

            // Log the successful addition of review data
            _logger.LogInformation("Review data successfully added for ML model ID: {MLModelId}", createModelReviewRequestDto.MLModelId);

            // Return the successful response
            serviceResponse.Data = extractedDataToInsert.Adapt<IEnumerable<SummarizationReviewDataDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Review data added successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while adding review data for ML model ID: {MLModelId}", createModelReviewRequestDto.MLModelId);
        }

        return serviceResponse;
    }

    // Retrieves fine tuning data records associated with the specified machine learning model ID.
    public async Task<ServiceResponse<IEnumerable<SummarizationFineTuningDataDto>>> GetFineTunningDataByMLModelIdAsync(Guid mlModelId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<SummarizationFineTuningDataDto>>
        {
            Data = null,
            Message = "Failed to retrieve fine tuning data. Please try again later."
        };

        try
        {
            _logger.LogInformation("Starting retrieval of fine tuning data for ML model ID: {MLModelId}", mlModelId);

            var fineTuningDataList = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(w => w.MLModelId == mlModelId && w.SubmitForFineTuning)
                .Include(x => x.CreatedByUser)
                .Include(x => x.UploadedDoc)
                .ProjectToType<SummarizationFineTuningDataDto>()
                .ToListAsync();

            _logger.LogInformation("Successfully retrieved {Count} fine tuning data records for ML model ID: {MLModelId}", fineTuningDataList.Count, mlModelId);

            serviceResponse.Data = fineTuningDataList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "fine tuning data retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving fine tuning data for ML model ID: {MLModelId}", mlModelId);
        }

        return serviceResponse;
    }

    // Schedules a fine tuning job for a specific machine learning model by sending the fine tuning request details.
    public async Task<ServiceResponse<IEnumerable<SummarizationFineTuningDataDto>>> ScheduleFineTuningAsync(AddFineTuningRequestDto fineTuningRequest)
    {
        // Initialize the service response with a default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<SummarizationFineTuningDataDto>>
        {
            Data = null,
            Message = "Failed to schedule fine tuning. Please try again later."
        };

        try
        {
            // Log the start of the fine tuning process
            _logger.LogInformation("Starting fine tuning scheduling for ML model ID: {MLModelId}", fineTuningRequest.MLModelId);

            // Fetch extracted data associated with the specified file IDs and ML model
            var extractedDataList = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(w => w.MLModelId == fineTuningRequest.MLModelId && fineTuningRequest.FileIds.Contains(w.DocId))
                .Include(i => i.UploadedDoc)
                .Include(i => i.CreatedByUser)
                .ToListAsync();

            if (!extractedDataList.Any())
            {
                // Log and return response when no data is found
                _logger.LogWarning("No extracted data found for provided file IDs: {FileIds} under ML model ID: {MLModelId}",
                    string.Join(", ", fineTuningRequest.FileIds), fineTuningRequest.MLModelId);

                serviceResponse.Message = "No extracted data found for the provided file IDs.";
                return serviceResponse;
            }

            // Check if any of the extracted data are already scheduled
            var alreadyScheduledData = await _unitOfWork.ScheduledModelRepo
                        .GetByConditionAsync(w =>
                            extractedDataList.Select(s => s.Id).Contains(w.ExtractedDataId) &&
                            w.MLModelId == fineTuningRequest.MLModelId &&
                            w.ScheduleType == ModelOperationTypesEnum.FineTuning &&
                            w.Status == ScheduleTypesEnum.Scheduled)
                            .ToListAsync();

            if (alreadyScheduledData.Any())
            {
                // Log and return response if fine tuning is already scheduled for the provided file IDs
                _logger.LogWarning("Fine tuning job already scheduled for file IDs: {FileIds} under ML model ID: {MLModelId}",
                    string.Join(", ", fineTuningRequest.FileIds), fineTuningRequest.MLModelId);

                serviceResponse.Message = "Fine tuning job has already been scheduled for the selected data.";
                return serviceResponse;
            }

            // Create and insert a new scheduled fine tuning job
            var scheduledModels = extractedDataList.Select(s => new ScheduledModel
            {
                MLModelId = s.MLModelId,
                TimeZone = fineTuningRequest.TimeZone,
                ScheduledAt = fineTuningRequest.ScheduledAt,
                ScheduleType = ModelOperationTypesEnum.FineTuning,
                Status = ScheduleTypesEnum.Scheduled,
                ExtractedDataId = s.Id,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId
            }).ToList();

            await _unitOfWork.ScheduledModelRepo.InsertAsync(scheduledModels);

            // Attempt to save the scheduled fine tuning job
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist scheduled fine tuning job for ML model ID: {MLModelId}", fineTuningRequest.MLModelId);
                return serviceResponse;
            }

            // Load scheduled models with their associated fine-tuning logs
            scheduledModels = await _unitOfWork.ScheduledModelRepo
                .GetByConditionAsync(w => scheduledModels.Select(s => s.Id).Contains(w.Id))
                .Include(i => i.FineTuningLogs)
                .ToListAsync();

            // Create fine-tuning logs for each associated document
            var fineTuningLogs = scheduledModels.Select(s => new FineTuningLog()
            {
                Version = (s.FineTuningLogs?.Count ?? 0) + 1,
                ScheduledModelId = s.Id,
                Status = ScheduleTypesEnum.Scheduled,
            }).ToList();

            // Insert all fine-tuning logs into the repository
            await _unitOfWork.FineTuningLogRepo.InsertAsync(fineTuningLogs);

            // Save the fine-tuning log entries and validate success
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist scheduled AI persona fine-tuning job for ML model ID: {MLModelId}", fineTuningRequest.MLModelId);
                return serviceResponse;
            }

            // Log success and return the successful service response
            _logger.LogInformation("Fine tuning job successfully scheduled for ML model ID: {MLModelId}", fineTuningRequest.MLModelId);

            serviceResponse.Data = extractedDataList.Adapt<IEnumerable<SummarizationFineTuningDataDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Fine tuning job scheduled successfully.";
        }
        catch (Exception ex)
        {
            // Log any unexpected exceptions that occur during the process
            _logger.LogError(ex, "An error occurred while scheduling fine tuning for ML model ID: {MLModelId}", fineTuningRequest.MLModelId);
        }

        return serviceResponse;
    }

    // Retrieves the fine tuning history records for a specified machine learning model.
    public async Task<ServiceResponse<IEnumerable<FineTuningHistoryDto>>> GetFineTuningDataHistoriesAsync(Guid mlModelId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<FineTuningHistoryDto>>
        {
            Data = null,
            Message = "Failed to retrieve fine tuning history. Please try again later."
        };

        try
        {
            _logger.LogInformation("Initiating retrieval of fine-tuning history for ML Model ID: {MLModelId}", mlModelId);

            // Retrieve scheduled models associated with the specified ML model ID and of type 'FineTuning'
            var scheduledModels = await _unitOfWork.ScheduledModelRepo
                .GetByConditionAsync(w => w.MLModelId == mlModelId && w.ScheduleType == ModelOperationTypesEnum.FineTuning)
                .ToListAsync();

            var fineTuningLogs = new List<FineTuningHistoryDto>();

            if (scheduledModels.Any())
            {
                // Retrieve fine-tuning logs that match the scheduled model IDs and have a status of 'FineTuning'
                fineTuningLogs = await _unitOfWork.FineTuningLogRepo
                    .GetByConditionAsync(w =>
                        scheduledModels.Select(s => s.Id).Contains(w.ScheduledModelId)
                    )
                    .Include(i => i.ScheduledModel)
                    .ProjectToType<FineTuningHistoryDto>()
                    .ToListAsync();
            }

            _logger.LogInformation("Retrieved {Count} fine-tuning record(s) for ML Model ID: {MLModelId}", fineTuningLogs.Count, mlModelId);

            serviceResponse.Data = fineTuningLogs;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Fine tuning history retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log error if something goes wrong during the data retrieval process
            _logger.LogError(ex, "Error while fetching fine tuning history for ML model ID: {MLModelId}", mlModelId);
        }

        return serviceResponse;
    }

    // Reschedules a fine-tuning job for the existing data.
    public async Task<ServiceResponse<FineTuningHistoryDto>> RescheduleFineTuningAsync(RescheduleFineTuningDto rescheduleFineTuningDto)
    {
        // Initialize the service response with a default failure state.
        var serviceResponse = new ServiceResponse<FineTuningHistoryDto>
        {
            Data = null,
            Message = "Failed to reschedule fine-tuning. Please try again later."
        };

        try
        {
            // Log the initiation of the fine-tuning reschedule request with relevant identifiers.
            _logger.LogInformation("Request received to reschedule fine-tuning for ML Model ID: {MLModelId}, Data ID: {DataId}",
                rescheduleFineTuningDto.MLModelId, rescheduleFineTuningDto.Id);

            // Retrieve the fine-tuning log entry using the provided extracted data ID.
            var fineTuningLog = await _unitOfWork.FineTuningLogRepo
                .GetByConditionAsync(w => w.Id == rescheduleFineTuningDto.Id)
                .FirstOrDefaultAsync();

            // If no matching fine-tuning log is found, return a failure response.
            if (fineTuningLog == null)
            {
                _logger.LogWarning("No fine-tuning log found for ML Model ID: {MLModelId}, Data ID: {DataId}. Rescheduling failed.",
                    rescheduleFineTuningDto.MLModelId, rescheduleFineTuningDto.Id);

                serviceResponse.Message = "Data not found.";
                return serviceResponse;
            }

            // Retrieve the associated scheduled model details using the ScheduledModelId from the fine-tuning log.
            var scheduledModel = await _unitOfWork.ScheduledModelRepo
                .GetByConditionAsync(w => w.Id == fineTuningLog.ScheduledModelId)
                .FirstOrDefaultAsync();

            // If no scheduled model is found, return a failure response.
            if (scheduledModel == null)
            {
                _logger.LogWarning("No scheduled model found for ML Model ID: {MLModelId}, Data ID: {DataId}. Rescheduling failed.",
                    rescheduleFineTuningDto.MLModelId, rescheduleFineTuningDto.Id);

                serviceResponse.Message = "Data not found.";
                return serviceResponse;
            }

            // Update the scheduled model with the new time zone and scheduled date from the input.
            scheduledModel.TimeZone = rescheduleFineTuningDto.TimeZone;
            scheduledModel.ScheduledAt = rescheduleFineTuningDto.ScheduledAt;

            // Apply the changes to the scheduled model repository.
            _unitOfWork.ScheduledModelRepo.Update(scheduledModel);

            // Attempt to save the changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist rescheduled fine-tuning job for ML Model ID: {MLModelId}, Data ID: {DataId}. Changes were not saved.",
                    rescheduleFineTuningDto.MLModelId, rescheduleFineTuningDto.Id);
                return serviceResponse;
            }

            // Log the successful rescheduling and update the service response with the fine-tuning history.
            _logger.LogInformation("Successfully rescheduled fine-tuning job for ML Model ID: {MLModelId}, Data ID: {DataId}. Changes saved successfully.",
                rescheduleFineTuningDto.MLModelId, rescheduleFineTuningDto.Id);

            serviceResponse.Data = fineTuningLog.Adapt<FineTuningHistoryDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Fine-tuning job rescheduled successfully.";
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during the process and return the failure response.
            _logger.LogError(ex, "Exception occurred while rescheduling fine-tuning for ML Model ID: {MLModelId}, Data ID: {DataId}.",
                rescheduleFineTuningDto.MLModelId, rescheduleFineTuningDto.Id);

            serviceResponse.Message = "An unexpected error occurred while rescheduling fine-tuning.";
        }

        return serviceResponse;
    }

    // Deletes a fine-tuning history record from the database based on the provided ID.
    public async Task<ServiceResponse<bool>> DeleteFineTuningDataHistoryAsync(Guid fineTuningHistoryId)
    {
        // Initialize the service response with a failure state by default
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete fine-tuning history. Please try again."
        };

        try
        {
            // Retrieve the fine-tuning log by its ID, including its associated ScheduledModel
            var fineTuningLog = await _unitOfWork.FineTuningLogRepo
                .GetByConditionAsync(w => w.Id == fineTuningHistoryId)
                .Include(i => i.ScheduledModel)
                .SingleOrDefaultAsync();

            // If no matching fine-tuning log is found, exit early
            if (fineTuningLog == null)
            {
                _logger.LogWarning("Deletion failed: Fine-tuning history with ID {FineTuningHistoryId} not found.", fineTuningHistoryId);
                serviceResponse.Message = "Fine-tuning history not found.";
                return serviceResponse;
            }

            // Retrieve the associated ScheduledModel and its related fine-tuning logs
            var scheduledModel = await _unitOfWork.ScheduledModelRepo
                .GetByConditionAsync(w => w.Id == fineTuningLog.ScheduledModelId)
                .Include(m => m.FineTuningLogs)
                .SingleOrDefaultAsync();

            // If related scheduled model exists, remove its fine-tuning logs and the model itself
            if (scheduledModel != null)
            {
                if (scheduledModel.FineTuningLogs.Any())
                {
                    _unitOfWork.FineTuningLogRepo.Delete(scheduledModel.FineTuningLogs);
                    _logger.LogInformation("Deleted {Count} fine-tuning logs linked to ScheduledModel ID {ScheduledModelId}.",
                        scheduledModel.FineTuningLogs.Count, scheduledModel.Id);
                }

                _unitOfWork.ScheduledModelRepo.Delete(scheduledModel);
                _logger.LogInformation("Deleted ScheduledModel with ID {ScheduledModelId}.", scheduledModel.Id);

                // Persist changes after deleting related entities
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Save operation failed after deleting fine-tuning logs and ScheduledModel for History ID {FineTuningHistoryId}.",
                        fineTuningHistoryId);
                    return serviceResponse;
                }
            }

            // Return success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Fine-tuning history and associated data deleted successfully.";
        }
        catch (Exception ex)
        {
            // Log exception details for debugging
            _logger.LogError(ex, "An exception occurred while deleting fine-tuning history with ID {FineTuningHistoryId}.", fineTuningHistoryId);
        }

        return serviceResponse;
    }

    // Deletes multiple fine-tuning history records from the database based on the provided list of IDs.
    public async Task<ServiceResponse<bool>> DeleteMultipleFineTuningDataHistoriesAsync(IEnumerable<Guid> fineTuningHistoryIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete fine-tuning history records. Please try again."
        };

        try
        {
            if (fineTuningHistoryIds == null || !fineTuningHistoryIds.Any())
            {
                serviceResponse.Message = "No IDs provided for deletion.";
                return serviceResponse;
            }

            _logger.LogInformation("Initiating batch deletion for {Count} fine-tuning history records.", fineTuningHistoryIds.Count());

            // Fetch all fine-tuning logs matching the provided IDs
            var fineTuningLogs = await _unitOfWork.FineTuningLogRepo
                .GetByConditionAsync(w => fineTuningHistoryIds.Contains(w.Id))
                .ToListAsync();

            if (!fineTuningLogs.Any())
            {
                _logger.LogWarning("No fine-tuning history records found for the provided IDs.");
                serviceResponse.Message = "No matching fine-tuning history records found.";
                return serviceResponse;
            }

            // Get all related scheduled models for the fetched logs
            var scheduledModelIds = fineTuningLogs
                .Select(s => s.ScheduledModelId)
                .Distinct()
                .ToList();

            var scheduledModels = await _unitOfWork.ScheduledModelRepo
                .GetByConditionAsync(w => scheduledModelIds.Contains(w.Id))
                .Include(i => i.FineTuningLogs)
                .ToListAsync();

            foreach (var scheduledModel in scheduledModels)
            {
                // Remove all associated fine-tuning logs
                if (scheduledModel.FineTuningLogs.Any())
                {
                    _unitOfWork.FineTuningLogRepo.Delete(scheduledModel.FineTuningLogs);
                }

                // Delete the scheduled model itself
                _unitOfWork.ScheduledModelRepo.Delete(scheduledModel);
            }

            // Save all changes after deletions
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Save operation failed while deleting fine-tuning history and scheduled model records.");
                return serviceResponse;
            }

            _logger.LogInformation("Successfully deleted {Count} fine-tuning history records and their associated scheduled models.", fineTuningLogs.Count);

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Selected fine-tuning history records and related scheduled models deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An exception occurred while deleting multiple fine-tuning history records.");
        }

        return serviceResponse;
    }

    // Builds the prompt string for the summarization model using the setup settings
    private string? GenerateSummarizationPrompt(SummarizationDto summarizationDto)
    {
        var defaultPrompt = new StringBuilder();

        switch (summarizationDto.SetupObject.SummarizationMethod)
        {
            // TODO: It will be used letter 
            // case SummarizationMethodTypesEnum.MapReduce:
            //     if (!string.IsNullOrWhiteSpace(summarizationDto.SetupObject.MapIndividualSummaryPrompt))
            //     {
            //         defaultPrompt.AppendLine("Map Phase Prompt:");
            //         defaultPrompt.AppendLine(summarizationDto.SetupObject.MapIndividualSummaryPrompt.Trim());
            //     }

            //     if (!string.IsNullOrWhiteSpace(summarizationDto.SetupObject.MapFinalCombinePrompt))
            //     {
            //         defaultPrompt.AppendLine("Reduce Phase Prompt:");
            //         defaultPrompt.AppendLine(summarizationDto.SetupObject.MapFinalCombinePrompt.Trim());
            //     }
            //     break;

            // case SummarizationMethodTypesEnum.Refine:
            //     if (!string.IsNullOrWhiteSpace(summarizationDto.SetupObject.RefineInitialPrompt))
            //     {
            //         defaultPrompt.AppendLine("Initial Refinement Prompt:");
            //         defaultPrompt.AppendLine(summarizationDto.SetupObject.RefineInitialPrompt.Trim());
            //     }

            //     if (!string.IsNullOrWhiteSpace(summarizationDto.SetupObject.RefineSubsequentPrompt))
            //     {
            //         defaultPrompt.AppendLine("Subsequent Refinement Prompt:");
            //         defaultPrompt.AppendLine(summarizationDto.SetupObject.RefineSubsequentPrompt.Trim());
            //     }
            //     break;

            case SummarizationMethodTypesEnum.Stuff:
                if (!string.IsNullOrWhiteSpace(summarizationDto.SetupObject.StuffPrompt))
                {
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
}