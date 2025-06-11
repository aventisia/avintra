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

    // Initializes the connection and triggers AI persona data extraction process via LLM.
    public async Task<ServiceResponse<AIPersonaResponseDto>> InitializeConnectionToLLMAsync(Guid modelId)
    {
        // Initialize ServiceResponse with a default failure message
        var serviceResponse = new ServiceResponse<AIPersonaResponseDto>
        {
            Data = null,
            Message = "Failed to initialize connection to LLM. Please try again later."
        };

        try
        {
            _logger.LogInformation("Starting AI persona data extraction for ModelId: {ModelId}", modelId);

            // Retrieve the model from the repository based on the provided modelId
            var model = await _unitOfWork.MLModelRepo
                                          .GetByConditionAsync(w => w.Id == modelId)
                                          .Include(i => i.ExtractedData)
                                          .SingleOrDefaultAsync();

            // If the model is not found, log and return failure response
            if (model == null)
            {
                _logger.LogWarning("Model with ModelId: {ModelId} not found.", modelId);
                serviceResponse.Message = "Model not found.";
                return serviceResponse;
            }

            // Check if the model has a prompt for AI persona extraction
            if (string.IsNullOrEmpty(model.GeneratedPrompt))
            {
                _logger.LogWarning("AI persona extraction prompt is missing for ModelId: {ModelId}", modelId);
                serviceResponse.Message = "Missing AI person prompt for the model.";
                return serviceResponse;
            }

            // List to hold the extracted AI persona data for each file
            var extractedDataList = new List<AIPersonaSetupFileData>();

            // Initialize fallback extracted data object with error remarks
            var extractedData = new AIPersonaSetupFileData
            {
                ExtractedData = new AIPersonaSetupData(),
                Remarks = $"001: AI persona extraction failed for ModelId: {modelId}."
            };

            // Retrieve the files associated with the model from the repository
            var files = await _unitOfWork.UploadedDocRepo
                                          .GetByConditionAsync(w => w.MLModelId == modelId)
                                          .ToListAsync();

            // Check if any files exist; if not, log and return failure response
            if (files == null || !files.Any())
            {
                _logger.LogWarning("No files found for ModelId: {ModelId}.", modelId);
                serviceResponse.Message = "No files associated with the model.";
                return serviceResponse;
            }

            // Variable to hold concatenated text of all files
            var allFileText = string.Empty;

            // Loop through each file and extract its text
            foreach (var file in files)
            {
                // Validate file path before attempting to extract text
                if (string.IsNullOrEmpty(file.Path))
                {
                    serviceResponse.Message = "File path is missing.";
                    _logger.LogWarning("File URL is missing for FileId: {FileId}", file.Id);
                    return serviceResponse;
                }

                // Extract file text using LLMDataExtractionService
                var fileText = await _llmDataExtractionService.GetFileTextAsync(file.Path);

                // If file text extraction fails, log the warning and continue with the next file
                if (string.IsNullOrEmpty(fileText))
                {
                    _logger.LogWarning("Text extraction failed for FileId: {FileId} at URL: {FilePath}", file.Id, file.Path);
                    continue;
                }

                // Append extracted file text to allFileText
                allFileText += fileText;
            }

            // If no text could be extracted from any file, log and return failure response
            if (string.IsNullOrEmpty(allFileText))
            {
                serviceResponse.Message = "Failed to extract text from files.";
                _logger.LogWarning("Failed to extract text from files for ModelId: {ModelId}.", modelId);
                return serviceResponse;
            }

            // Prepare the LLM prompt by combining model's generated prompt with the concatenated file text
            var prompt = $"{model.GeneratedPrompt}\n\nFile Text:\n{allFileText}";

            // Record the start time of the LLM extraction
            var startExecutionTime = DateTime.UtcNow;

            // Call LLM data extraction service
            var llmResponse = await _llmDataExtractionService.ExtractDataAsync(prompt, model.LLM);

            // Record the end time after extraction
            var endExecutionTime = DateTime.UtcNow;

            // Calculate the execution time in seconds
            int executionTimeInSeconds = (int)Math.Ceiling((endExecutionTime - startExecutionTime).TotalSeconds);

            // If LLM response indicates failure, log and proceed with fallback data
            if (llmResponse.StatusCode != 200)
            {
                _logger.LogWarning("LLM extraction failed for ModelId: {ModelId}. Error Message: {Message}", modelId, llmResponse.Message);
                extractedData.Remarks = $"003: LLM extraction failed for ModelId: {modelId}. {llmResponse.Message}";
                extractedDataList.Add(extractedData);
            }

            // If LLM returned empty data, log and mark as failed
            if (string.IsNullOrEmpty(llmResponse.Data))
            {
                _logger.LogWarning("LLM returned empty data for ModelId: {ModelId}", modelId);
                extractedData.Remarks = $"004: LLM returned empty data for ModelId: {modelId}.";
                extractedDataList.Add(extractedData);
            }
            else
            {
                // Deserialize the LLM response into the extracted persona data object
                try
                {
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    extractedData.ExtractedData = JsonSerializer.Deserialize<AIPersonaSetupData>(llmResponse.Data, options) ?? new AIPersonaSetupData();
                    extractedData.Remarks = string.Empty;  // Clear remarks on successful extraction
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Deserialization failed for ModelId: {ModelId}", modelId);
                    extractedData.Remarks = $"005: Deserialization failed for ModelId: {modelId}.";
                    extractedDataList.Add(extractedData);
                }

                _logger.LogInformation("Successfully extracted and deserialized AI persona data for ModelId: {ModelId}", modelId);
                extractedDataList.Add(extractedData);
            }

            // Prepare the response DTO with all extracted AI persona data
            var extractResponseDto = new AIPersonaResponseDto
            {
                ModelId = modelId,
                FilesExtractedData = extractedDataList
            };

            // Finalize the service response based on the success or failure of the extraction process
            serviceResponse.Data = extractResponseDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = extractedDataList.Any(w => w.Remarks.Contains("Failed"))
                                      ? "AI persona connection encountered issues with one or more files."
                                      : "AI persona connection completed successfully.";

            _logger.LogInformation("AI persona data connection initialized. Status: {Message}", serviceResponse.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred during AI persona data extraction for ModelId: {ModelId}.", modelId);
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

    // Schedules a fine tuning job for a specific machine learning model by sending the fine tuning request details.
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

            serviceResponse.Data = extractedDataList.Adapt<IEnumerable<AIPersonaFineTuningDataDto>>();
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
                    .ThenInclude(i2 => i2.MLModel)
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