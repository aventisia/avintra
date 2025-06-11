namespace MLModelBuilderAPIs.Services;

public class ClassificationService : IClassificationService
{
    private readonly ILogger<ClassificationService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILLMDataExtractionService _llmDataExtractionService;
    private readonly Guid _userId;

    public ClassificationService(
        ILogger<ClassificationService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ILLMDataExtractionService llmDataExtractionService)
    {
        // Retrieve the current user's ID from the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _llmDataExtractionService = llmDataExtractionService;
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

            // Assign a unique index (as a string) to each category in the setup object
            int index = 0;
            foreach (var category in classificationDto.SetupObject.Categories)
            {
                category.Index = index.ToString();
                index++;
            }

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

    // Extracts classification data via a Language Learning Model (LLM).
    public async Task<ServiceResponse<ClassificationResponseDto>> ExtractViaLLMAsync(ExtractRequestDto extractRequestDto)
    {
        // Initialize ServiceResponse with a default failure message
        var serviceResponse = new ServiceResponse<ClassificationResponseDto>
        {
            Data = null,
            Message = "Failed to extract classification data via LLM. Please try again."
        };

        try
        {
            _logger.LogInformation("Starting LLM extraction process for ModelId: {ModelId}", extractRequestDto.ModelId);

            // Retrieve the classification model from the repository
            var model = await _unitOfWork.MLModelRepo
                                          .GetByConditionAsync(w => w.Id == extractRequestDto.ModelId)
                                          .Include(i => i.ExtractedData)
                                          .SingleOrDefaultAsync();


            // If model is not found, log and return failure
            if (model == null)
            {
                _logger.LogWarning("Model not found for ModelId: {ModelId}", extractRequestDto.ModelId);
                serviceResponse.Message = "Model not found";
                return serviceResponse;
            }

            // Convert model to SentimentAnalyticDto and get categories
            var categoryDict = model.Adapt<ClassificationDto>()?
                    .SetupObject?
                    .Categories?
                    .ToDictionary(c => c.Index, c => c.Name);

            // Check for prompt availability
            if (string.IsNullOrEmpty(model.GeneratedPrompt))
            {
                _logger.LogWarning("Prompt not found for ModelId: {ModelId}", extractRequestDto.ModelId);
                serviceResponse.Message = "Prompt not found for the model";
                return serviceResponse;
            }

            // Prepare the list to hold extracted data for each file
            var extractedDataList = new List<ClassificationSetupFileData>();

            // Initialize a list to store data that will be updated into the database.
            var extractedDataToBeUpdated = new List<ExtractedData>();

            // Initialize a list to store data that will be inserted into the database.
            var extractedDataToBeInserted = new List<ExtractedData>();

            _logger.LogInformation("Starting extraction for {FileCount} files", extractRequestDto.FileIds.Count);

            // Loop through each file ID and process
            foreach (var fileId in extractRequestDto.FileIds)
            {
                _logger.LogInformation("Processing extraction for FileId: {FileId}", fileId);

                var extractedData = new ClassificationSetupFileData
                {
                    ExtractedData = new List<ClassificationSetupData>(),
                    FileId = fileId,
                    Remarks = $"001: Failed to extract data for FileId: {fileId}."
                };

                // Retrieve the file from the repository
                var file = await _unitOfWork.UploadedDocRepo
                                             .GetByConditionAsync(w => w.Id == fileId)
                                             .SingleOrDefaultAsync();

                // Handle case where file is not found
                if (file == null)
                {
                    _logger.LogWarning("File not found for FileId: {FileId}", fileId);
                    extractedData.Remarks = $"002: Failed, file not found for FileId: {fileId}.";
                    extractedDataList.Add(extractedData);
                    continue;
                }

                // Validate required inputs: Check if the file path is provided and not empty.
                if (string.IsNullOrEmpty(file.Path))
                {
                    serviceResponse.Message = "File URL is missing.";

                    // Log the validation failure reason.
                    _logger.LogWarning("Validation failed: File URL is missing or null.");

                    return serviceResponse;
                }

                // Extract the file text from the URL using the LLMDataExtractionService.
                var fileText = await _llmDataExtractionService.GetFileTextAsync(file.Path);

                // Check if the file text was successfully retrieved.
                if (string.IsNullOrEmpty(fileText))
                {
                    serviceResponse.Message = "Failed to extract text from the file.";

                    // Log the failure of file text extraction.
                    _logger.LogWarning("Validation failed: Failed to retrieve text from the file at URL: {FilePath}", file.Path);

                    return serviceResponse;
                }

                // Create the prompt for the LLM model, including the generated prompt and the extracted file text.
                var prompt = $"{model.GeneratedPrompt}\n\nFile Text:\n{fileText}";

                // Record the start time of the LLM extraction call (in UTC)
                var startExecutionTime = DateTime.UtcNow;

                // Call the LLM extraction service
                var llmResponse = await _llmDataExtractionService.ExtractDataAsync(model.GeneratedPrompt, model.LLM);

                // Record the end time after the extraction is complete (in UTC)
                var endExecutionTime = DateTime.UtcNow;

                // Calculate total execution time in seconds, rounding up to the nearest whole number
                int executionTimeInSeconds = (int)Math.Ceiling((endExecutionTime - startExecutionTime).TotalSeconds);

                // Handle response from LLM service
                if (llmResponse.StatusCode != 200)
                {
                    _logger.LogWarning("LLM extraction failed for FileId: {FileId} with message: {Message}", fileId, llmResponse.Message);
                    extractedData.Remarks = $"003: {llmResponse.Message}";
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

                // Check for empty data in LLM response
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

                // Deserialize the extracted data into a list of classification setup data
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                try
                {
                    extractedData.ExtractedData = JsonSerializer.Deserialize<List<ClassificationSetupData>>(llmResponse.Data, options) ?? new List<ClassificationSetupData>();
                    extractedData.Remarks = "";

                    // Assign names using dictionary lookup
                    foreach (var category in extractedData.ExtractedData)
                    {
                        if (categoryDict.TryGetValue(category.Index, out var name))
                        {
                            category.Name = name;
                        }
                    }
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
                _logger.LogInformation("Successfully extracted and deserialized data for FileId: {FileId}", fileId);

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
                    existingExtractedData.ExecutionCount += 1;
                    existingExtractedData.ExecutionTime += executionTimeInSeconds;
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

            // Prepare the final response DTO with the extracted classification data
            var extractResponseDto = new ClassificationResponseDto
            {
                ModelId = extractRequestDto.ModelId,
                FilesExtractedData = extractedDataList
            };

            // Set final status and message based on the results
            serviceResponse.Data = extractResponseDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = extractedDataList.Any(w => w.Remarks.Contains("Failed")) ?
                                        "Failed to extract data for one or more files" :
                                        "Data extracted successfully";

            _logger.LogInformation("Extraction process completed. Summary: {Message}", serviceResponse.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An exception occurred during the LLM extraction process.");
        }

        return serviceResponse;
    }

    // Retrieves a collection of extracted data records associated with a specific machine learning model.
    public async Task<ServiceResponse<IEnumerable<ClassificationExtractedDataDto>>> GetExtractedDataByMLModelIdAsync(Guid mlModelId)
    {
        // Initialize the response with a default failure message and null data
        var serviceResponse = new ServiceResponse<IEnumerable<ClassificationExtractedDataDto>>
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
                .ProjectToType<ClassificationExtractedDataDto>()
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
    public async Task<ServiceResponse<IEnumerable<ClassificationReviewDataDto>>> GetExtractedReviewDataByMLModelIdAsync(Guid mlModelId)
    {// Initialize the response with a default failure message and null data
        var serviceResponse = new ServiceResponse<IEnumerable<ClassificationReviewDataDto>>
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
                .ProjectToType<ClassificationReviewDataDto>()
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
    public async Task<ServiceResponse<ClassificationExtractedDataDto>> UpdateExtractedReviewDataAsync(ClassificationExtractedDataDto classificationExtractedDataDto)
    {
        // Initialize the response with default failure state
        var serviceResponse = new ServiceResponse<ClassificationExtractedDataDto>
        {
            Data = null,
            Message = "Failed to update review data. Please try again later."
        };

        try
        {
            _logger.LogInformation("Initiating update for review data with ID: {ReviewDataId}", classificationExtractedDataDto.Id);

            // Retrieve the existing data record from the repository
            var existingReviewData = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(x => x.Id == classificationExtractedDataDto.Id)
                .FirstOrDefaultAsync();

            if (existingReviewData == null)
            {
                _logger.LogWarning("Review data not found. ID: {ReviewDataId}", classificationExtractedDataDto.Id);
                serviceResponse.Message = $"Review data not found.";
                return serviceResponse;
            }

            // Trim whitespace from all string properties in the DTO
            classificationExtractedDataDto = TrimDtoStringPropsUtil.TrimDtoStringProps(classificationExtractedDataDto);

            // Map the trimmed DTO values to the existing entity
            classificationExtractedDataDto.Adapt(existingReviewData);

            // Apply the update to the repository
            _unitOfWork.ExtractedDataRepo.Update(existingReviewData);

            // Attempt to save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes during update of review data. ID: {ReviewDataId}, User ID: {UserId}", classificationExtractedDataDto.Id, _userId);
                return serviceResponse;
            }

            _logger.LogInformation("Successfully updated review data. ID: {ReviewDataId}", classificationExtractedDataDto.Id);

            // Prepare successful response
            serviceResponse.Data = existingReviewData.Adapt<ClassificationExtractedDataDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Review data updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while updating review data. ID: {ReviewDataId}", classificationExtractedDataDto.Id);
        }

        return serviceResponse;
    }

    // Adds review data associated with a specific machine learning model.
    public async Task<ServiceResponse<IEnumerable<ClassificationReviewDataDto>>> AddReviewDataAsync(CreateModelReviewRequestDto createModelReviewRequestDto)
    {
        // Initialize the service response with a default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<ClassificationReviewDataDto>>
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
                    MLModelId = s.MLModelId,
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
            serviceResponse.Data = extractedDataToInsert.Adapt<IEnumerable<ClassificationReviewDataDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Review data added successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while adding review data for ML model ID: {MLModelId}", createModelReviewRequestDto.MLModelId);
        }

        return serviceResponse;
    }

    // Retrieves Fine tuning data records associated with the specified machine learning model ID.
    public async Task<ServiceResponse<IEnumerable<ClassificationFineTuningDataDto>>> GetFineTunningDataByMLModelIdAsync(Guid mlModelId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<ClassificationFineTuningDataDto>>
        {
            Data = null,
            Message = "Failed to retrieve fine tuning data. Please try again later."
        };

        try
        {
            _logger.LogInformation("Starting retrieval of Fine tuning data for ML model ID: {MLModelId}", mlModelId);

            var fineTuningDataList = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(w => w.MLModelId == mlModelId && w.SubmitForFineTuning)
                .Include(x => x.CreatedByUser)
                .Include(x => x.UploadedDoc)
                .ProjectToType<ClassificationFineTuningDataDto>()
                .ToListAsync();

            _logger.LogInformation("Successfully retrieved {Count} Fine tuning data records for ML model ID: {MLModelId}", fineTuningDataList.Count, mlModelId);

            serviceResponse.Data = fineTuningDataList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Fine tuning data retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving Fine tuning data for ML model ID: {MLModelId}", mlModelId);
        }

        return serviceResponse;
    }

    // Schedules a fine tuning job for a specific machine learning model by sending the fine tuning request details.
    public async Task<ServiceResponse<IEnumerable<ClassificationFineTuningDataDto>>> ScheduleFineTuningAsync(AddFineTuningRequestDto fineTuningRequest)
    {
        // Initialize the service response with a default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<ClassificationFineTuningDataDto>>
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

            serviceResponse.Data = extractedDataList.Adapt<IEnumerable<ClassificationFineTuningDataDto>>();
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
                    .ThenInclude(i2 => i2.MLModel)
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

            // Check if the FineTuningLog's status is 'Scheduled'
            if (fineTuningLog.Status != ScheduleTypesEnum.Scheduled)
            {
                _logger.LogWarning("Deletion failed: Fine-tuning history with ID {FineTuningHistoryId} cannot be deleted because its status is {Status}.",
                    fineTuningHistoryId, fineTuningLog.Status);
                serviceResponse.Message = "Cannot delete fine-tuning history because it is not in 'Scheduled' status.";
                return serviceResponse;
            }

            // Retrieve the associated ScheduledModel and its related fine-tuning logs
            var scheduledModel = await _unitOfWork.ScheduledModelRepo
                .GetByConditionAsync(w => w.Id == fineTuningLog.ScheduledModelId)
                .Include(m => m.FineTuningLogs)
                .SingleOrDefaultAsync();

            // If related scheduled model exists
            if (scheduledModel != null)
            {
                // Check how many fine-tuning logs are associated with this ScheduledModel
                if (scheduledModel.FineTuningLogs.Count > 1)
                {
                    // If more than one, delete only the FineTuningLog
                    _unitOfWork.FineTuningLogRepo.Delete(fineTuningLog);
                    _logger.LogInformation("Deleted FineTuningLog with ID {FineTuningHistoryId}.", fineTuningHistoryId);
                }
                else
                {
                    // If this is the last FineTuningLog, delete both the FineTuningLog and the ScheduledModel
                    _unitOfWork.FineTuningLogRepo.Delete(fineTuningLog);
                    _unitOfWork.ScheduledModelRepo.Delete(scheduledModel);
                    _logger.LogInformation("Deleted FineTuningLog with ID {FineTuningHistoryId} and its associated ScheduledModel with ID {ScheduledModelId}.",
                        fineTuningHistoryId, scheduledModel.Id);
                }

                // Persist changes after deleting related entities
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Save operation failed after deleting fine-tuning log and possibly ScheduledModel for History ID {FineTuningHistoryId}.",
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
        // Initialize the service response with a failure state by default
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete fine-tuning history records. Please try again."
        };

        try
        {
            // Check if any IDs were provided for deletion
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

            // If no logs were found, return a message
            if (!fineTuningLogs.Any())
            {
                _logger.LogWarning("No fine-tuning history records found for the provided IDs.");
                serviceResponse.Message = "No matching fine-tuning history records found.";
                return serviceResponse;
            }

            // Check if all fine-tuning logs are in the 'Scheduled' status
            var logsNotScheduled = fineTuningLogs.Where(log => log.Status != ScheduleTypesEnum.Scheduled).ToList();

            // If any fine-tuning log is not in 'Scheduled' status, prevent deletion and notify the user
            if (logsNotScheduled.Any())
            {
                var nonScheduledIds = logsNotScheduled.Select(log => log.Id).ToList();
                _logger.LogWarning("Deletion failed for FineTuningLogs with IDs {NonScheduledIds} due to non-Scheduled status.",
                    string.Join(", ", nonScheduledIds));
                serviceResponse.Message = "Some fine-tuning history records are not in 'Scheduled' status and cannot be deleted.";
                return serviceResponse;
            }

            // Get all related scheduled models for the fetched fine-tuning logs
            var scheduledModelIds = fineTuningLogs
                .Select(s => s.ScheduledModelId)
                .Distinct()
                .ToList();

            // Fetch all scheduled models associated with the fine-tuning logs
            var scheduledModels = await _unitOfWork.ScheduledModelRepo
                .GetByConditionAsync(w => scheduledModelIds.Contains(w.Id))
                .Include(i => i.FineTuningLogs) // Include fine-tuning logs related to scheduled models
                .ToListAsync();

            // Iterate through the scheduled models and delete associated fine-tuning logs and models
            foreach (var scheduledModel in scheduledModels)
            {
                // Remove all associated fine-tuning logs from the scheduled model
                if (scheduledModel.FineTuningLogs.Any())
                {
                    _unitOfWork.FineTuningLogRepo.Delete(scheduledModel.FineTuningLogs);
                }

                // Delete the scheduled model itself
                _unitOfWork.ScheduledModelRepo.Delete(scheduledModel);
            }

            // Save all changes after deletions (both fine-tuning logs and scheduled models)
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Save operation failed while deleting fine-tuning history and scheduled model records.");
                return serviceResponse;
            }

            // Log success and update service response
            _logger.LogInformation("Successfully deleted {Count} fine-tuning history records and their associated scheduled models.", fineTuningLogs.Count);

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Selected fine-tuning history records and related scheduled models deleted successfully.";
        }
        catch (Exception ex)
        {
            // Log any exception that occurs during the process
            _logger.LogError(ex, "An exception occurred while deleting multiple fine-tuning history records.");
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
                categoriesStringBuilder.AppendLine($"{category.Index}. {category.Name}{instructions}");
            }
        }

        // Load a template file and replace placeholders with the generated prompt sections
        var generatedPrompt = FileTemplateLoaderUtil.LoadAndRenderFile("ClassificationPrompt.txt", new Dictionary<string, string>()
                    {
                        // Replace the placeholders {{Prompt}}, {{Context}}, and {{Categories}} in the template with the respective sections
                        {"{{Prompt}}", promptStringBuilder.Replace("\n","").ToString()  },
                        {"{{Context}}", classificationDto.SetupObject.Context.Replace("\n","").ToString() },
                        {"{{AllowMultipleClasses}}", classificationDto.SetupObject.AllowMultipleClasses.ToString() },
                        {"{{Categories}}", categoriesStringBuilder.Replace("\n","").ToString() },
                    }
                );

        // Return the final generated prompt after replacing newline characters and returning the string
        return generatedPrompt.Replace("\n", "").ToString();
    }
}
