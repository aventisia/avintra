
namespace MLModelBuilderAPIs.Services;

public class ExtractionSetupService : IExtractionSetupService
{
    private readonly ILogger<ExtractionSetupService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILLMDataExtractionService _llmDataExtractionService;
    private readonly Guid _userId;

    public ExtractionSetupService(
        ILogger<ExtractionSetupService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ILLMDataExtractionService llmDataExtractionService)
    {
        // Retrieve the user ID from the HTTP context and initialize the logger and unit of work
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _llmDataExtractionService = llmDataExtractionService;
    }

    // Method to update an existing extraction setup record
    public async Task<ServiceResponse<MLModelSetupDto>> UpdateExtractionSetupAsync(MLModelSetupDto mLModelSetupDto)
    {
        // Initialize the service response with a failure state and default message
        var serviceResponse = new ServiceResponse<MLModelSetupDto>
        {
            Data = null,
            Message = "Failed to update extraction setup. Please try again later."
        };

        try
        {
            // Log the start of the update operation, including the relevant identifiers
            _logger.LogInformation("Update process initiated | ML Model Setup ID: {Id} | User ID: {UserId}", mLModelSetupDto.Id, _userId);

            // Retrieve the existing extraction setup from the database by ID
            var mLModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mLModelSetupDto.Id)
                .SingleOrDefaultAsync();

            // Check if the setup was not found and return an appropriate message
            if (mLModel == null)
            {
                _logger.LogWarning("Extraction setup not found | ML Model Setup ID: {Id} | User ID: {UserId}", mLModelSetupDto.Id, _userId);
                serviceResponse.Message = "Extraction setup not found. The provided setup ID does not exist.";
                return serviceResponse;
            }

            // Trim any unnecessary spaces or formatting from string fields in the DTO
            mLModelSetupDto = TrimDtoStringPropsUtil.TrimDtoStringProps(mLModelSetupDto);

            // Log the mapping process from DTO to entity
            mLModelSetupDto.Adapt(mLModel);
            mLModel.GeneratedPrompt = GenerateExtractionModelPrompt(mLModelSetupDto);
            mLModel.SetupStatus = SetupStatusTypesEnum.Completed;
            mLModel.LastModifiedByUserId = _userId;

            // Log the action of saving changes to the database
            _logger.LogInformation("Saving the updated extraction setup to the database | ML Model Setup ID: {Id}", mLModelSetupDto.Id);
            _unitOfWork.MLModelRepo.Update(mLModel);

            // Attempt to persist the changes and check for success
            if (!await _unitOfWork.SaveAsync())
            {
                // Log an error if the database save operation fails
                _logger.LogError("Failed to save changes to the database | ML Model Setup ID: {Id} | User ID: {UserId}", mLModelSetupDto.Id, _userId);
                return serviceResponse;
            }

            // Log success upon successful update
            _logger.LogInformation("Extraction setup update completed successfully | ML Model Setup ID: {Id} | User ID: {UserId}", mLModelSetupDto.Id, _userId);

            // Set the response data with the updated DTO and indicate successful completion
            serviceResponse.Data = mLModel.Adapt<MLModelSetupDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setup updated successfully.";
        }
        catch (Exception ex)
        {
            // Log any exception that occurs during the process
            _logger.LogError(ex, "Exception occurred during extraction setup update | ML Model Setup ID: {Id} | User ID: {UserId}", mLModelSetupDto.Id, _userId);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<MLModelSetupDto>> GetExtractionSetupByMLModelIdAsync(Guid mlModelId)
    {
        // Initialize the response with a default failure message and null data
        var serviceResponse = new ServiceResponse<MLModelSetupDto>
        {
            Data = null,
            Message = "Failed to retrieve the extraction setup. Please try again later."
        };

        try
        {
            // Log the beginning of the retrieval process
            _logger.LogInformation("Attempting to retrieve extraction setup for ML model with ID: {MLModelId}", mlModelId);

            // Fetch the extraction setup based on the provided ML model ID and map it to the DTO
            var mLModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mlModelId)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            // If no setup is found, log a warning and return a message
            if (mLModel == null)
            {
                _logger.LogWarning("No extraction setup found for ML model with ID: {MLModelId}", mlModelId);
                serviceResponse.Message = "No extraction setup exists for the provided ML model ID.";
                return serviceResponse;
            }

            // Log the successful retrieval of the setup
            _logger.LogInformation("Successfully retrieved extraction setup for ML model with ID: {MLModelId}", mlModelId);

            // Set the successful response data
            serviceResponse.Data = mLModel.Adapt<MLModelSetupDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError("Error occurred while retrieving extraction setup for ML model with ID: {MLModelId}. Exception: {ExceptionMessage}", mlModelId, ex.Message);
        }

        return serviceResponse;
    }

    // Extracts data using a Language Learning Model (LLM).
    public async Task<ServiceResponse<ExtractionResponseDto>> ExtractViaLLMAsync(ExtractRequestDto extractRequestDto)
    {
        // Initialize ServiceResponse with a default failure message
        var serviceResponse = new ServiceResponse<ExtractionResponseDto>
        {
            Data = null,
            Message = "Failed to extract extraction data via LLM. Please try again."
        };

        try
        {
            _logger.LogInformation("Starting LLM extraction process for ModelId: {ModelId}", extractRequestDto.ModelId);

            // Retrieve the model from the repository
            var model = await _unitOfWork.MLModelRepo
                                          .GetByConditionAsync(w => w.Id == extractRequestDto.ModelId)
                                          .Include(i => i.ExtractedData)
                                          .SingleOrDefaultAsync();

            // If model is not found, log and return failure response
            if (model == null)
            {
                _logger.LogWarning("Model not found for ModelId: {ModelId}", extractRequestDto.ModelId);
                serviceResponse.Message = "Model not found";
                return serviceResponse;
            }

            // Check for prompt availability
            if (string.IsNullOrEmpty(model.GeneratedPrompt))
            {
                _logger.LogWarning("Prompt not found for ModelId: {ModelId}", extractRequestDto.ModelId);
                serviceResponse.Message = "Prompt not found for the model";
                return serviceResponse;
            }

            // Prepare the list to hold extracted data for each file
            var extractedDataList = new List<ExtractionSetupFileData>();

            // Initialize a list to store data that will be inserted into the database.
            var extractedDataToBeInserted = new List<ExtractedData>();

            // Initialize a list to store data that will be updated into the database.
            var extractedDataToBeUpdated = new List<ExtractedData>();

            _logger.LogInformation("Starting extraction for {FileCount} files", extractRequestDto.FileIds.Count);

            // Loop through each file ID and process
            foreach (var fileId in extractRequestDto.FileIds)
            {
                _logger.LogInformation("Processing extraction for FileId: {FileId}", fileId);

                var extractedData = new ExtractionSetupFileData
                {
                    ExtractedData = new ExtractionSetupData(),
                    FileId = fileId,
                    Remarks = $"001: Failed to extract data for FileId: {fileId}."
                };

                // Retrieve file from repository
                var file = await _unitOfWork.UploadedDocRepo
                                             .GetByConditionAsync(w => w.Id == fileId)
                                             .SingleOrDefaultAsync();

                if (file == null)
                {
                    _logger.LogWarning("File not found for FileId: {FileId}", fileId);
                    extractedData.Remarks = $"002: Failed, file not found for FileId: {fileId}.";
                    extractedDataList.Add(extractedData);
                    continue;
                }

                // Call the LLM extraction service
                var llmResponse = await _llmDataExtractionService.ExtractDataAsync(model.GeneratedPrompt, model.LLM, file.Path);

                // Check for valid response from LLM service
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

                // Check if the LLM response does not contain the expected structure (i.e., '[')
                if (!llmResponse.Data.Contains("["))
                {
                    _logger.LogError("005: Data extraction failed for FileId: {fileId}.", fileId);
                    extractedData.Remarks = $"005: Failed to extract valid data for FileId: {fileId}";
                    extractedDataList.Add(extractedData);
                    continue;
                }

                // Attempt to deserialize the extracted data
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                try
                {
                    extractedData.ExtractedData = JsonSerializer.Deserialize<ExtractionSetupData>(llmResponse.Data, options) ?? new ExtractionSetupData();
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

            // Prepare the final response DTO with the extracted data
            var extractResponseDto = new ExtractionResponseDto
            {
                ModelId = extractRequestDto.ModelId,
                FilesExtractedData = extractedDataList
            };

            // Set the final status and message based on the results
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
    public async Task<ServiceResponse<IEnumerable<ExtractedDataResponseDto>>> GetExtractedDataByMLModelIdAsync(Guid mlModelId)
    {
        // Initialize the response with a default failure message and null data
        var serviceResponse = new ServiceResponse<IEnumerable<ExtractedDataResponseDto>>
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
                .ProjectToType<ExtractedDataResponseDto>()
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
    public async Task<ServiceResponse<IEnumerable<ExtractionReviewDataDto>>> GetExtractedReviewDataByMLModelIdAsync(Guid mlModelId)
    {// Initialize the response with a default failure message and null data
        var serviceResponse = new ServiceResponse<IEnumerable<ExtractionReviewDataDto>>
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
                .ProjectToType<ExtractionReviewDataDto>()
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
    public async Task<ServiceResponse<ExtractedDataResponseDto>> UpdateExtractedReviewDataAsync(ExtractedDataResponseDto extractedDataResponseDto)
    {
        // Initialize the response with default failure state
        var serviceResponse = new ServiceResponse<ExtractedDataResponseDto>
        {
            Data = null,
            Message = "Failed to update review data. Please try again later."
        };

        try
        {
            _logger.LogInformation("Initiating update for review data with ID: {ReviewDataId}", extractedDataResponseDto.Id);

            // Retrieve the existing data record from the repository
            var existingReviewData = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(x => x.Id == extractedDataResponseDto.Id)
                .FirstOrDefaultAsync();

            if (existingReviewData == null)
            {
                _logger.LogWarning("Review data not found. ID: {ReviewDataId}", extractedDataResponseDto.Id);
                serviceResponse.Message = $"Review data not found.";
                return serviceResponse;
            }

            // Trim whitespace from all string properties in the DTO
            extractedDataResponseDto = TrimDtoStringPropsUtil.TrimDtoStringProps(extractedDataResponseDto);

            // Map the trimmed DTO values to the existing entity
            extractedDataResponseDto.Adapt(existingReviewData);

            // Apply the update to the repository
            _unitOfWork.ExtractedDataRepo.Update(existingReviewData);

            // Attempt to save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes during update of review data. ID: {ReviewDataId}, User ID: {UserId}", extractedDataResponseDto.Id, _userId);
                return serviceResponse;
            }

            _logger.LogInformation("Successfully updated review data. ID: {ReviewDataId}", extractedDataResponseDto.Id);

            // Prepare successful response
            serviceResponse.Data = existingReviewData.Adapt<ExtractedDataResponseDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Review data updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while updating review data. ID: {ReviewDataId}", extractedDataResponseDto.Id);
        }

        return serviceResponse;
    }

    // Adds review data associated with a specific machine learning model.
    public async Task<ServiceResponse<IEnumerable<ExtractionReviewDataDto>>> AddReviewDataAsync(CreateModelReviewRequestDto createModelReviewRequestDto)
    {
        // Initialize the service response with a default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<ExtractionReviewDataDto>>
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
                await _unitOfWork.ScheduledModelRepo.InsertAsync(new ScheduledModel
                {
                    MLModelId = createModelReviewRequestDto.MLModelId,
                    TimeZone = createModelReviewRequestDto.ScheduleInfo.TimeZone,
                    ScheduledAt = createModelReviewRequestDto.ScheduleInfo.ScheduledAt,
                    ScheduleType = ModelOperationTypesEnum.RunAndReview,
                    FileIds = uploadedFiles.Select(file => file.Id).ToList(),
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                });

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
            serviceResponse.Data = extractedDataToInsert.Adapt<IEnumerable<ExtractionReviewDataDto>>();
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
    public async Task<ServiceResponse<IEnumerable<ExtractionFineTuningDataDto>>> GetFineTunningDataByMLModelIdAsync(Guid mlModelId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<ExtractionFineTuningDataDto>>
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
                .ProjectToType<ExtractionFineTuningDataDto>()
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

    // Schedules a Fine tuning job for a specific machine learning model by sending the Fine tuning request details.
    public async Task<ServiceResponse<IEnumerable<ExtractionFineTuningDataDto>>> ScheduleFineTuningAsync(AddFineTuningRequestDto fineTuningRequest)
    {
        // Initialize the service response with a default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<ExtractionFineTuningDataDto>>
        {
            Data = null,
            Message = "Failed to schedule Fine tuning. Please try again later."
        };

        try
        {
            // Log the start of the Fine tuning process
            _logger.LogInformation("Starting Fine tuning scheduling for ML model ID: {MLModelId}", fineTuningRequest.MLModelId);

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

            // Create and insert a new scheduled Fine tuning job
            var scheduledModel = new ScheduledModel
            {
                MLModelId = fineTuningRequest.MLModelId,
                TimeZone = fineTuningRequest.TimeZone,
                ScheduledAt = fineTuningRequest.ScheduledAt,
                ScheduleType = ModelOperationTypesEnum.FineTuning,
                FileIds = extractedDataList.Select(file => file.DocId).ToList(),
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId
            };

            await _unitOfWork.ScheduledModelRepo.InsertAsync(scheduledModel);

            // Attempt to save the scheduled Fine tuning job
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist scheduled Fine tuning job for ML model ID: {MLModelId}", fineTuningRequest.MLModelId);
                return serviceResponse;
            }

            // Create fine-tuning logs for each associated document
            var fineTuningLogs = scheduledModel.FileIds.Select(s => new FineTuningLog()
            {
                ScheduledModelId = scheduledModel.Id,
                DocId = s,
                Status = ExtractedDataStatusesEnums.Pending,
            });

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

            serviceResponse.Data = extractedDataList.Adapt<IEnumerable<ExtractionFineTuningDataDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Fine tuning job scheduled successfully.";
        }
        catch (Exception ex)
        {
            // Log any unexpected exceptions that occur during the process
            _logger.LogError(ex, "An error occurred while scheduling Fine tuning for ML model ID: {MLModelId}", fineTuningRequest.MLModelId);
        }

        return serviceResponse;
    }

    // Retrieves the Fine tuning history records for a specified machine learning model.
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
                        scheduledModels.Select(s => s.Id).Contains(w.ScheduledModelId) &&
                        w.Status == ExtractedDataStatusesEnums.FineTuning
                    )
                    .Include(i => i.ScheduledModel)
                    .Include(i => i.UploadedDoc)
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

    // Generates a prompt string used to guide the ML model for extracting data from documents, based on the provided model setup.
    private string? GenerateExtractionModelPrompt(MLModelSetupDto mlModelSetupDto)
    {
        // Initialize a StringBuilder to build the default prompt string
        var defaultPrompt = new StringBuilder();

        // Add the base instruction or use the provided NodePrompt from the setup object
        // If mlModelSetupDto.SetupObject.Prompt is not null or empty, it will be used. Otherwise, a default message is added.
        defaultPrompt.AppendLine(!string.IsNullOrEmpty(mlModelSetupDto.SetupObject?.Prompt)
            ? mlModelSetupDto.SetupObject.Prompt.Trim()
            : "You are an expert data extraction algorithm. Your task is to accurately extract relevant data from the provided document.");

        // Initialize a StringBuilder for storing field extraction instructions
        var fieldInstruction = new StringBuilder();

        // Section: Field extraction instructions
        if (mlModelSetupDto.SetupObject?.FieldSetups != null && mlModelSetupDto.SetupObject.FieldSetups.Any())
        {
            // Iterate through the list of field setups in the model setup object
            for (int i = 0; i < mlModelSetupDto.SetupObject.FieldSetups.Count; i++)
            {
                var field = mlModelSetupDto.SetupObject.FieldSetups[i];

                // If there are specific instructions for the field, append them, otherwise leave it blank
                var instructions = string.IsNullOrEmpty(field.Instructions) ? "" : $", - {field.Instructions}";

                // Append each field's details, including its name, type, and instructions if available
                fieldInstruction.AppendLine($"{i + 1}. {field.Name} (type: {field.Type}){instructions}");
            }
        }

        // Initialize a StringBuilder for storing table extraction instructions
        var tableInstruction = new StringBuilder();

        // Section: Table extraction instructions
        if (mlModelSetupDto.SetupObject?.TableMetadata != null && mlModelSetupDto.SetupObject.TableMetadata.Any())
        {
            // Iterate through the list of table metadata in the model setup object
            foreach (var table in mlModelSetupDto.SetupObject.TableMetadata)
            {
                // Add a new line and introduce the table extraction step
                tableInstruction.AppendLine("### Data Extraction Instructions for the Table:");

                // Display the table name with context if provided
                tableInstruction.AppendLine($"Table name: {table.Name}{(string.IsNullOrEmpty(table.Context) ? "" : $", context - {table.Context}")}");

                // Inform the user about the columns to extract
                tableInstruction.AppendLine("Please extract the following columns:");

                // Check if table headers exist and loop through them to extract column info
                if (table.TableHeaders != null)
                {
                    for (int i = 0; i < table.TableHeaders.Count; i++)
                    {
                        var column = table.TableHeaders[i];

                        // Append instructions for the column, if any
                        var instructions = string.IsNullOrEmpty(column.Instructions) ? "" : $", - {column.Instructions}";

                        // Append each column's details, including its name, type, and instructions if available
                        tableInstruction.AppendLine($"{i + 1}. {column.Name} (type: {column.Type}){instructions}");
                    }
                }
            }
        }
        else
        {
            tableInstruction.AppendLine("Since the table has no details, return the `tables` array as an empty list: `[]`.");
        }
        // Load a template file and replace placeholders with the generated prompt sections
        var generatedPrompt = FileTemplateLoaderUtil.LoadAndRenderFile("ExtractionPrompt.txt", new Dictionary<string, string>()
                    {
                        // Replace the placeholders {{Prompt}}, {{Fields}}, and {{Tables}} in the template with the respective sections
                        {"{{Prompt}}", defaultPrompt.Replace("\n","").ToString()  },
                        {"{{Fields}}", fieldInstruction.Replace("\n","").ToString() },
                        {"{{Tables}}", tableInstruction.Replace("\n","").ToString() }
                    }
                );

        // Return the final generated prompt after replacing newline characters and returning the string
        return generatedPrompt.Replace("\n", "").ToString();
    }
}

