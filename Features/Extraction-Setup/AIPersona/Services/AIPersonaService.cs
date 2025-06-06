namespace MLModelBuilderAPIs.Services;

public class AIPersonaService : IAIPersonaService
{
    private readonly ILogger<AIPersonaService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILLMDataExtractionService _llmDataExtractionService;
    private readonly Guid _userId;

    public AIPersonaService(
        ILogger<AIPersonaService> logger,
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
    // Updates the AI persona setup for a specific ML model
    public async Task<ServiceResponse<AIPersonaDto>> UpdateAIPersonaSetupAsync(AIPersonaDto aiPersonaDto)
    {
        var response = new ServiceResponse<AIPersonaDto>
        {
            Data = null,
            Message = "Failed to update the AI persona setup. Please try again.",
        };

        try
        {
            _logger.LogInformation("Updating AI persona setup | Model ID: {ModelId} | User ID: {UserId}", aiPersonaDto.Id, _userId);

            var existingModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(m => m.Id == aiPersonaDto.Id)
                .SingleOrDefaultAsync();

            if (existingModel == null)
            {
                _logger.LogWarning("AI persona setup not found | Model ID: {ModelId} | User ID: {UserId}", aiPersonaDto.Id, _userId);
                response.Message = "AI persona setup not found. Please check the model ID.";
                return response;
            }

            // Trim string properties in the DTO
            aiPersonaDto = TrimDtoStringPropsUtil.TrimDtoStringProps(aiPersonaDto);

            // Map the updated values from the DTO to the existing model
            aiPersonaDto.Adapt(existingModel);
            existingModel.GeneratedPrompt = GenerateAIPersonaPrompt(aiPersonaDto);
            existingModel.SetupStatus = SetupStatusTypesEnum.Completed;
            existingModel.LastModifiedByUserId = _userId;

            _logger.LogInformation("Saving changes to AI persona setup | Model ID: {ModelId}", aiPersonaDto.Id);
            _unitOfWork.MLModelRepo.Update(existingModel);

            // Save the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Error saving AI persona setup | Model ID: {ModelId} | User ID: {UserId}", aiPersonaDto.Id, _userId);
                return response;
            }

            _logger.LogInformation("AI persona setup updated successfully | Model ID: {ModelId} | User ID: {UserId}", aiPersonaDto.Id, _userId);

            // Return the updated AI persona setup
            response.Data = existingModel.Adapt<AIPersonaDto>();
            response.StatusCode = 200;
            response.Message = "AI persona setup updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while updating AI persona setup | Model ID: {ModelId} | User ID: {UserId}", aiPersonaDto.Id, _userId);
        }

        return response;
    }

    // Retrieves the AI Persona setup for a given ML model ID
    public async Task<ServiceResponse<AIPersonaDto>> GetAIPersonaSetupByMLModelIdAsync(Guid mlModelId)
    {
        var response = new ServiceResponse<AIPersonaDto>
        {
            Data = null,
            Message = "Failed to retrieve the AI persona setup. Please try again."
        };

        try
        {
            _logger.LogInformation("Retrieving AI persona setup | Model ID: {ModelId}", mlModelId);

            var model = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(m => m.Id == mlModelId)
                .Include(m => m.CreatedByUser)
                .SingleOrDefaultAsync();

            if (model == null)
            {
                _logger.LogWarning("AI persona setup not found | Model ID: {ModelId}", mlModelId);
                response.Message = "No AI persona setup found for the specified model ID.";
                return response;
            }

            _logger.LogInformation("AI persona setup retrieved successfully | Model ID: {ModelId}", mlModelId);

            response.Data = model.Adapt<AIPersonaDto>();
            response.StatusCode = 200;
            response.Message = "AI persona setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving AI persona setup | Model ID: {ModelId}", mlModelId);
        }

        return response;
    }

    // Extracts AI Persona data using a Language Learning Model (LLM).
    public async Task<ServiceResponse<AIPersonaResponseDto>> ExtractViaLLMAsync(ExtractRequestDto extractRequestDto)
    {
        // Initialize ServiceResponse with a default failure message
        var serviceResponse = new ServiceResponse<AIPersonaResponseDto>
        {
            Data = null,
            Message = "Failed to extract AI persona data via LLM. Please try again."
        };

        try
        {
            _logger.LogInformation("Starting AI persona data extraction for ModelId: {ModelId}", extractRequestDto.ModelId);

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

            // Check if the model has a generated prompt for AI persona extraction
            if (string.IsNullOrEmpty(model.GeneratedPrompt))
            {
                _logger.LogWarning("No AI persona extraction prompt found for ModelId: {ModelId}", extractRequestDto.ModelId);
                serviceResponse.Message = "Missing AI persona extraction prompt for the model";
                return serviceResponse;
            }

            // List to store extracted AI persona data for each file
            var extractedDataList = new List<AIPersonaSetupFileData>();

            // Initialize a list to store data that will be inserted into the database.
            var extractedDataToBeInserted = new List<ExtractedData>();

            // Initialize a list to store data that will be updated into the database.
            var extractedDataToBeUpdated = new List<ExtractedData>();

            _logger.LogInformation("Starting for {FileCount} files", extractRequestDto.FileIds.Count);

            // Process each file ID to extract AI persona data
            foreach (var fileId in extractRequestDto.FileIds)
            {
                _logger.LogInformation("Processing for FileId: {FileId}", fileId);

                var extractedData = new AIPersonaSetupFileData
                {
                    ExtractedData = new AIPersonaSetupData(),
                    FileId = fileId,
                    Remarks = $"001: AI Persona extraction failed for FileId: {fileId}."
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

                // Call LLM extraction service for AI persona extraction
                var llmResponse = await _llmDataExtractionService.ExtractDataAsync(model.GeneratedPrompt, model.LLM, file.Path);

                // Check if LLM extraction was successful
                if (llmResponse.StatusCode != 200)
                {
                    _logger.LogWarning("LLM AI persona extraction failed for FileId: {FileId} with message: {Message}", fileId, llmResponse.Message);
                    extractedData.Remarks = $"003: LLM AI persona extraction failed. {llmResponse.Message}";
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

                // Deserialize the extracted AI persona data
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                try
                {
                    extractedData.ExtractedData = JsonSerializer.Deserialize<AIPersonaSetupData>(llmResponse.Data, options) ?? new AIPersonaSetupData();
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
                _logger.LogInformation("Successfully extracted and deserialized AI persona data for FileId: {FileId}", fileId);

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
            }

            // Check if there is any extracted data to insert into the database
            if (extractedDataToBeInserted.Any())
            {
                _logger.LogInformation("Inserting {Count} new extracted AI persona data records into the database.", extractedDataToBeInserted.Count);

                // Insert new records
                await _unitOfWork.ExtractedDataRepo.InsertAsync(extractedDataToBeInserted);

                // Save database changes
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save extracted AI persona data to the database after insertion.");
                }
            }

            // Check if there is any extracted data to update into the database
            if (extractedDataToBeUpdated.Any())
            {
                _logger.LogInformation("Updating {Count} existing extracted AI persona data records in the database.", extractedDataToBeUpdated.Count);

                // Update existing records
                _unitOfWork.ExtractedDataRepo.Update(extractedDataToBeUpdated);

                // Save database changes
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save extracted AI persona data to the database after update.");
                }
            }

            // Prepare the response DTO with extracted AI persona data
            var extractResponseDto = new AIPersonaResponseDto
            {
                ModelId = extractRequestDto.ModelId,
                FilesExtractedData = extractedDataList
            };

            // Finalize the service response based on the extraction results
            serviceResponse.Data = extractResponseDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = extractedDataList.Any(w => w.Remarks.Contains("Failed")) ?
                                      "AI persona extraction failed for one or more files" :
                                      "AI persona extraction completed successfully";

            _logger.LogInformation("AI persona data extraction process finished. Status: {Message}", serviceResponse.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during AI persona data extraction via LLM.");
        }

        return serviceResponse;
    }

    // Retrieves a collection of extracted AI persona data records associated with a specific machine learning model.
    public async Task<ServiceResponse<IEnumerable<AIPersonaExtractedDataDto>>> GetExtractedDataByMLModelIdAsync(Guid mlModelId)
    {
        // Initialize the response with a default failure message and null data
        var serviceResponse = new ServiceResponse<IEnumerable<AIPersonaExtractedDataDto>>
        {
            Data = null,
            Message = "Failed to retrieve extracted AI persona data. Please try again later."
        };

        try
        {
            // Log the beginning of the retrieval process
            _logger.LogInformation("Attempting to retrieve extracted AI persona data for ML model with ID: {MLModelId}", mlModelId);

            // Fetch the extracted AI persona data based on the provided ML model ID and map it to the DTO
            var extractedDataList = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(w => w.MLModelId == mlModelId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.UploadedDoc)
                .ProjectToType<AIPersonaExtractedDataDto>()
                .ToListAsync();

            // Log the successful retrieval of the data
            _logger.LogInformation("Successfully retrieved extracted AI persona data for ML model with ID: {MLModelId}", mlModelId);

            // Set the successful response data
            serviceResponse.Data = extractedDataList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extracted AI persona data retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError("Error occurred while retrieving extracted AI persona data for ML model with ID: {MLModelId}. Exception: {ExceptionMessage}", mlModelId, ex.Message);
        }

        return serviceResponse;
    }

    // Retrieves a collection of extracted AI persona review data records associated with a specific machine learning model.
    public async Task<ServiceResponse<IEnumerable<AIPersonaReviewDataDto>>> GetAIPersonaReviewDataByMLModelIdAsync(Guid mlModelId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<AIPersonaReviewDataDto>>
        {
            Data = null,
            Message = "Failed to retrieve AI persona review data. Please try again later."
        };

        try
        {
            // Log the start of the process of retrieving AI persona review data.
            _logger.LogInformation("Attempting to retrieve AI persona review data for ML model with ID: {MLModelId}", mlModelId);

            // Fetch the extracted AI persona data based on the ML model ID
            var extractedAIPersonaDataList = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(w => w.MLModelId == mlModelId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.UploadedDoc)
                .ProjectToType<AIPersonaReviewDataDto>()
                .ToListAsync();

            // Log the successful retrieval
            _logger.LogInformation("Successfully retrieved {Count} AI persona review data records for ML model ID: {MLModelId}", extractedAIPersonaDataList.Count, mlModelId);

            // Set the data and success message in the response
            serviceResponse.Data = extractedAIPersonaDataList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI persona review data retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log the exception if an error occurs
            _logger.LogError(ex, "Error occurred while retrieving AI persona review data for ML model ID: {MLModelId}. Exception: {ExceptionMessage}", mlModelId, ex.Message);
        }

        return serviceResponse;
    }

    // Updates an extracted AI persona data record associated with a specific machine learning model.
    public async Task<ServiceResponse<AIPersonaExtractedDataDto>> UpdateAIPersonaReviewDataAsync(AIPersonaExtractedDataDto aiPersonaExtractedDataDto)
    {
        var serviceResponse = new ServiceResponse<AIPersonaExtractedDataDto>
        {
            Data = null,
            Message = "Failed to update AI persona data. Please try again later."
        };

        try
        {
            _logger.LogInformation("Initiating update for AI persona data with ID: {AIExtractedDataId}", aiPersonaExtractedDataDto.Id);

            // Retrieve the existing data record from the repository
            var existingAIExtractedData = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(x => x.Id == aiPersonaExtractedDataDto.Id)
                .FirstOrDefaultAsync();

            if (existingAIExtractedData == null)
            {
                _logger.LogWarning("AI persona data not found. ID: {AIExtractedDataId}", aiPersonaExtractedDataDto.Id);
                serviceResponse.Message = $"AI persona data not found.";
                return serviceResponse;
            }

            // Trim whitespace from all string properties in the DTO
            aiPersonaExtractedDataDto = TrimDtoStringPropsUtil.TrimDtoStringProps(aiPersonaExtractedDataDto);

            // Map the trimmed DTO values to the existing entity
            aiPersonaExtractedDataDto.Adapt(existingAIExtractedData);
            existingAIExtractedData.LastModifiedByUserId = _userId;

            // Apply the update to the repository
            _unitOfWork.ExtractedDataRepo.Update(existingAIExtractedData);

            // Attempt to save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes during update of AI persona data. ID: {AIExtractedDataId}, User ID: {UserId}", aiPersonaExtractedDataDto.Id, _userId);
                return serviceResponse;
            }

            _logger.LogInformation("Successfully updated AI persona data. ID: {AIExtractedDataId}", aiPersonaExtractedDataDto.Id);

            // Prepare successful response
            serviceResponse.Data = existingAIExtractedData.Adapt<AIPersonaExtractedDataDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI persona data updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while updating AI persona data. ID: {AIExtractedDataId}", aiPersonaExtractedDataDto.Id);
        }

        return serviceResponse;
    }

    // Adds AI persona review data associated with a specific machine learning model.
    public async Task<ServiceResponse<IEnumerable<AIPersonaReviewDataDto>>> AddReviewDataAsync(CreateModelReviewRequestDto createModelReviewRequestDto)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<AIPersonaReviewDataDto>>
        {
            Data = null,
            Message = "Failed to add review data. Please try again later."
        };

        try
        {
            _logger.LogInformation("Initiating AI persona review data creation for ML model ID: {MLModelId}", createModelReviewRequestDto.MLModelId);

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

            await _unitOfWork.ExtractedDataRepo.InsertAsync(extractedDataToInsert);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist AI persona review data for ML model ID: {MLModelId}", createModelReviewRequestDto.MLModelId);
                return serviceResponse;
            }

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

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save scheduled model entry for ML model ID: {MLModelId}", createModelReviewRequestDto.MLModelId);
                    return serviceResponse;
                }
            }

            _logger.LogInformation("AI persona review data successfully added for ML model ID: {MLModelId}", createModelReviewRequestDto.MLModelId);

            serviceResponse.Data = extractedDataToInsert.Adapt<IEnumerable<AIPersonaReviewDataDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI persona review data added successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while adding AI persona review data for ML model ID: {MLModelId}", createModelReviewRequestDto.MLModelId);
        }

        return serviceResponse;
    }

    // Retrieves AI persona fine-tuning data records associated with the specified machine learning model ID.
    public async Task<ServiceResponse<IEnumerable<AIPersonaFineTuningDataDto>>> GetFineTuningDataByMLModelIdAsync(Guid mlModelId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<AIPersonaFineTuningDataDto>>
        {
            Data = null,
            Message = "Failed to retrieve fine tuning data. Please try again later."
        };

        try
        {
            _logger.LogInformation("Starting retrieval of AI persona fine-tuning data for ML model ID: {MLModelId}", mlModelId);

            var fineTuningDataList = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(w => w.MLModelId == mlModelId && w.SubmitForFineTuning)
                .Include(x => x.CreatedByUser)
                .Include(x => x.UploadedDoc)
                .ProjectToType<AIPersonaFineTuningDataDto>()
                .ToListAsync();

            _logger.LogInformation("Successfully retrieved {Count} AI persona fine-tuning data records for ML model ID: {MLModelId}", fineTuningDataList.Count, mlModelId);

            serviceResponse.Data = fineTuningDataList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Fine-tuning data retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving AI persona fine-tuning data for ML model ID: {MLModelId}", mlModelId);
        }

        return serviceResponse;
    }

    // Schedules an AI persona fine-tuning job for a specific machine learning model using the provided request details.
    public async Task<ServiceResponse<IEnumerable<AIPersonaFineTuningDataDto>>> ScheduleFineTuningAsync(AddFineTuningRequestDto fineTuningRequest)
    {
        // Initialize the service response with a default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<AIPersonaFineTuningDataDto>>
        {
            Data = null,
            Message = "Failed to schedule fine tuning. Please try again later."
        };

        try
        {
            _logger.LogInformation("Starting AI persona fine-tuning scheduling for ML model ID: {MLModelId}", fineTuningRequest.MLModelId);

            // Fetch extracted data associated with the specified file IDs and ML model
            var extractedDataList = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(w => w.MLModelId == fineTuningRequest.MLModelId && fineTuningRequest.FileIds.Contains(w.DocId))
                .Include(i => i.UploadedDoc)
                .Include(i => i.CreatedByUser)
                .ToListAsync();

            if (!extractedDataList.Any())
            {
                _logger.LogWarning("No extracted data found for provided file IDs: {FileIds} under ML model ID: {MLModelId}",
                    string.Join(", ", fineTuningRequest.FileIds), fineTuningRequest.MLModelId);

                serviceResponse.Message = "No extracted data found for the provided file IDs.";
                return serviceResponse;
            }

            // Create and insert a new scheduled AI persona fine-tuning job
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

            // Save the changes to the database and check if the operation was successful
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist scheduled AI persona fine-tuning job for ML model ID: {MLModelId}", fineTuningRequest.MLModelId);
                return serviceResponse; // Return early if saving failed
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

            _logger.LogInformation("AI persona fine-tuning job successfully scheduled for ML model ID: {MLModelId}", fineTuningRequest.MLModelId);

            serviceResponse.Data = extractedDataList.Adapt<IEnumerable<AIPersonaFineTuningDataDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Fine tuning job scheduled successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while scheduling AI persona fine-tuning for ML model ID: {MLModelId}", fineTuningRequest.MLModelId);
        }

        return serviceResponse;
    }

    // Retrieves the AI persona fine-tuning history records for a specified machine learning model.
    public async Task<ServiceResponse<IEnumerable<FineTuningHistoryDto>>> GetFineTuningDataHistoriesAsync(Guid mlModelId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<FineTuningHistoryDto>>
        {
            Data = null,
            Message = "Failed to retrieve fine tuning history. Please try again later."
        };

        try
        {
            _logger.LogInformation("Initiating retrieval of AI persona fine-tuning history for ML Model ID: {MLModelId}", mlModelId);

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
                        scheduledModels.Select(s => s.Id).Contains(w.ScheduledModelId))
                    .Include(i => i.ScheduledModel)
                    .Include(i => i.UploadedDoc)
                    .ProjectToType<FineTuningHistoryDto>()
                    .ToListAsync();
            }

            _logger.LogInformation("Retrieved {Count} AI persona fine-tuning record(s) for ML Model ID: {MLModelId}", fineTuningLogs.Count, mlModelId);

            serviceResponse.Data = fineTuningLogs;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Fine-tuning history retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while fetching AI persona fine-tuning history for ML model ID: {MLModelId}", mlModelId);
        }

        return serviceResponse;

    }

    // Builds the prompt string for the ai persona model using the setup settings
    private string? GenerateAIPersonaPrompt(AIPersonaDto aiPersonaDto)
    {
        var documentPrompt = new StringBuilder();

        // Check if there are any documents provided in the SetupObject
        if (aiPersonaDto.SetupObject.Documents != null && aiPersonaDto.SetupObject.Documents.Any())
        {
            // Loop through each document and append its name and optional instructions to the prompt
            foreach (var doc in aiPersonaDto.SetupObject.Documents)
            {
                documentPrompt.AppendLine($"Document Name: {doc.Name}");
                if (!string.IsNullOrWhiteSpace(doc.Instructions))
                {
                    documentPrompt.AppendLine($"Instructions: {doc.Instructions}");
                }
                documentPrompt.AppendLine(); // Add a blank line for spacing between documents
            }
        }

        // Load a template file and replace placeholders with the generated prompt sections
        var generatedPrompt = FileTemplateLoaderUtil.LoadAndRenderFile("AIPersonaPrompt.txt", new Dictionary<string, string>()
            {
                // Replace the placeholders {{Name}}, {{RoleOrObjective}}, {{CategoryOrDomain}}, {{ToneOfVoice}}, {{Instructions}}, {{ExclusionsOrBoundaries}}, {{ContextMemoryTimeframe}}, {{Temperature}}, {{Documents}}, {{EnableChat}}, {{EnableAudio}} and {{EnableVideo}} in the template with the respective sections
                {"{{Name}}", aiPersonaDto.SetupObject.Name?.Replace("\n", "").Trim()},
                {"{{RoleOrObjective}}", aiPersonaDto.SetupObject.RoleOrObjective?.Replace("\n", "").Trim()},
                {"{{CategoryOrDomain}}", aiPersonaDto.SetupObject.CategoryOrDomain?.ToString()},
                {"{{ToneOfVoice}}", aiPersonaDto.SetupObject.ToneOfVoice?.ToString() },
                {"{{Instructions}}", aiPersonaDto.SetupObject.Instructions?.ToString() },
                {"{{ExclusionsOrBoundaries}}", aiPersonaDto.SetupObject.ExclusionsOrBoundaries?.ToString()},
                {"{{ContextMemoryTimeframe}}", aiPersonaDto.SetupObject.ContextMemoryTimeframe?.ToString()},
                {"{{Temperature}}", aiPersonaDto.SetupObject.Temperature.ToString()},
                {"{{Documents}}", documentPrompt.ToString().Replace("\n", " ").Trim()},
                {"{{EnableChat}}", aiPersonaDto.SetupObject.EnableChat.ToString()},
                {"{{EnableAudio}}", aiPersonaDto.SetupObject.EnableAudio.ToString()},
                {"{{EnableVideo}}", aiPersonaDto.SetupObject.EnableVideo.ToString()}
            });

        // Return the final generated prompt after replacing newline characters and returning the string
        return generatedPrompt.Replace("\n", "").ToString();
    }
}