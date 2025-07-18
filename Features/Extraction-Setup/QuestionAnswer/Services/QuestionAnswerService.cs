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
    public async Task<ServiceResponse<QuestionAnswerDto>> UpdateQuestionAnswerSetupAsync(QuestionAnswerDto questionAnswerDto)
    {
        var serviceResponse = new ServiceResponse<QuestionAnswerDto>
        {
            Data = null,
            Message = "Unable to update the questionAnswer setup. Please try again."
        };

        try
        {
            _logger.LogInformation("Starting update of questionAnswer setup | ID: {Id} | User: {UserId}", questionAnswerDto.Id, _userId);

            var mLModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == questionAnswerDto.Id)
                .SingleOrDefaultAsync();

            if (mLModel == null)
            {
                _logger.LogWarning("QuestionAnswer setup not found | ID: {Id} | User: {UserId}", questionAnswerDto.Id, _userId);
                serviceResponse.Message = "QuestionAnswer setup not found. Please check the ID.";
                return serviceResponse;
            }

            // Check if the setup is already published and prevent modifications
            if (mLModel.IsPublished)
            {
                // Do not allow updates to a published question-answer setup.
                // Published setups are locked to ensure consistency and prevent unauthorized modifications.
                _logger.LogWarning("Attempt to update a published question answer setup | Model ID: {ModelId} | User ID: {UserId}", questionAnswerDto.Id, _userId);

                serviceResponse.Message = "This model has already been published and cannot be modified.";
                return serviceResponse;
            }

            // Sanitize string properties in the DTO
            questionAnswerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(questionAnswerDto);

            // Assign a unique index (as a string) to each question answer in the setup object
            int index = 0;
            foreach (var category in questionAnswerDto.SetupObject.QuestionAnswers)
            {
                category.Index = index.ToString();
                index++;
            }

            // Apply updated values to the model entity
            questionAnswerDto.Adapt(mLModel);
            mLModel.GeneratedPrompt = GenerateQuestionAnswerModelPrompt(questionAnswerDto);
            mLModel.SetupStatus = SetupStatusTypesEnum.Completed;
            mLModel.LLM = questionAnswerDto.SetupObject.LLM;
            mLModel.LastModifiedByUserId = _userId;

            _logger.LogInformation("Saving changes to questionAnswer setup | ID: {Id}", questionAnswerDto.Id);
            _unitOfWork.MLModelRepo.Update(mLModel);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Error saving changes to questionAnswer setup | ID: {Id} | User: {UserId}", questionAnswerDto.Id, _userId);
                return serviceResponse;
            }

            _logger.LogInformation("questionAnswer setup updated successfully | ID: {Id} | User: {UserId}", questionAnswerDto.Id, _userId);

            serviceResponse.Data = mLModel.Adapt<QuestionAnswerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "questionAnswer setup updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An exception occurred during update of questionAnswer setup | ID: {Id} | User: {UserId}", questionAnswerDto.Id, _userId);
        }

        return serviceResponse;
    }

    // Retrieves the questionAnswer setup associated with a specific ML model
    public async Task<ServiceResponse<QuestionAnswerDto>> GetQuestionAnswerSetupByMLModelIdAsync(Guid mlModelId)
    {
        var serviceResponse = new ServiceResponse<QuestionAnswerDto>
        {
            Data = null,
            Message = "Unable to fetch the questionAnswer setup. Please try again."
        };

        try
        {
            _logger.LogInformation("Retrieving questionAnswer setup for ML Model ID: {MLModelId}", mlModelId);

            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mlModelId)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            if (mlModel == null)
            {
                _logger.LogWarning("questionAnswer setup not found for ML Model ID: {MLModelId}", mlModelId);
                serviceResponse.Message = "No setup found for the specified ML model.";
                return serviceResponse;
            }

            _logger.LogInformation("questionAnswer setup retrieved successfully for ML Model ID: {MLModelId}", mlModelId);

            serviceResponse.Data = mlModel.Adapt<QuestionAnswerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "questionAnswer setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving the questionAnswer setup | ML Model ID: {MLModelId}", mlModelId);
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

            // Transform the model into a Data Transfer Object (DTO) of type QuestionAnswerDto and extract the setup object.
            var modelSetup = model.Adapt<QuestionAnswerDto>()?.SetupObject;

            if (string.IsNullOrEmpty(modelSetup.LLM))
            {
                // Log a warning and set the service response message if LLM is missing or empty
                _logger.LogWarning("LLM is not configured for ModelId: {ModelId}.", model.Id);
                serviceResponse.Message = "Setup is incomplete.";
                return serviceResponse;
            }

            // Create a dictionary where the key is the index of each answer and the value is the answer's name.
            var questionAnswerDic = modelSetup
                    .QuestionAnswers?
                    .ToDictionary(c => c.Index, c => c.Name);


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

            // Process each file ID to extract question and answer data
            foreach (var documentId in extractRequestDto.FileIds)
            {
                // Check if there's any existing extracted data for the given document ID
                var existingDocumentData = model.ExtractedData.FirstOrDefault(data => data.DocId == documentId);
                _logger.LogInformation("Processing document with ID: {DocumentId}", documentId);

                // Add the extractedData object for new extraction data
                var documentExtractionData = new QuestionAnswerSetupFileData
                {
                    ExecutionCount = existingDocumentData != null ? existingDocumentData.ExecutionCount : 0,
                    FailedCount = existingDocumentData != null ? existingDocumentData.FailedCount : 0,
                    TokenCount = existingDocumentData != null ? existingDocumentData.TokenCount : 0,
                    ExecutionTime = existingDocumentData != null ? existingDocumentData.ExecutionTime : 0,
                    ExtractedData = new List<QuestionAnswerSetupData>(),
                    FileId = documentId,
                    Remarks = $"001: Question and answer failed for DocumentId: {documentId}."
                };

                // Retrieve the document data from the repository
                var document = await _unitOfWork.UploadedDocRepo
                                                 .GetByConditionAsync(doc => doc.Id == documentId)
                                                 .SingleOrDefaultAsync();

                // Check if the document was found in the repository
                if (document == null)
                {
                    _logger.LogWarning("Document not found with ID: {DocumentId}", documentId);
                    documentExtractionData.Remarks = $"002: Document not found with ID: {documentId}.";
                    extractedDataList.Add(documentExtractionData);
                    continue;
                }

                // Validate if the document has a valid file path
                if (string.IsNullOrEmpty(document.Path))
                {
                    serviceResponse.Message = "Document file path is missing.";

                    // Log the validation failure reason
                    _logger.LogWarning("Validation failed: Document file path is missing or null.");

                    return serviceResponse;
                }

                // Extract the document text using an external service
                var documentText = await _llmDataExtractionService.GetFileTextAsync(document.Path);

                // Ensure document text was successfully retrieved
                if (string.IsNullOrEmpty(documentText))
                {
                    serviceResponse.Message = "Failed to extract text from the document.";

                    // Log the failure of text extraction
                    _logger.LogWarning("Validation failed: Failed to retrieve text from the document at URL: {DocumentPath}", document.Path);

                    return serviceResponse;
                }

                // Replace the placeholder {{FileContent}} in the generated prompt with the actual document content (documentText)
                var prompt = model.GeneratedPrompt.Replace("{{FileContent}}", documentText);

                // Record the start time before calling the LLM extraction service
                var startExecutionTime = DateTime.UtcNow;

                // Call the LLM data extraction service to process the document text
                var llmResponse = await _llmDataExtractionService.ExtractDataAsync(prompt, modelSetup.LLM, modelSetup.Temperature);

                // Record the end time after receiving the response from the LLM service
                var endExecutionTime = DateTime.UtcNow;

                // Calculate the total execution time in seconds (rounded up)
                int executionDurationInSeconds = (int)Math.Ceiling((endExecutionTime - startExecutionTime).TotalSeconds);

                // Check if LLM extraction was successful (StatusCode 200)
                if (llmResponse.StatusCode != 200)
                {
                    _logger.LogWarning("LLM question and answer failed for DocumentId: {DocumentId} with message: {Message}", documentId, llmResponse.Message);
                    documentExtractionData.Remarks = $"003: LLM question and answer failed. {llmResponse.Message}";

                    // Increment the failure count if there was existing extracted data for this document
                    if (existingDocumentData != null)
                    {
                        existingDocumentData.FailedCount += 1;
                        existingDocumentData.ExecutionTime += executionDurationInSeconds;
                        existingDocumentData.LastModifiedByUserId = _userId;
                        extractedDataToBeUpdated.Add(existingDocumentData);

                        // Update the reused documentExtractionData object with existing data details
                        documentExtractionData.ExecutionCount = existingDocumentData.ExecutionCount;
                        documentExtractionData.FailedCount = existingDocumentData.FailedCount;
                        documentExtractionData.TokenCount = existingDocumentData.TokenCount;
                        documentExtractionData.ExecutionTime = executionDurationInSeconds;
                    }

                    extractedDataList.Add(documentExtractionData);
                    continue;
                }

                // Check if LLM returned empty data
                if (string.IsNullOrEmpty(llmResponse.Data))
                {
                    _logger.LogWarning("LLM returned empty data for DocumentId: {DocumentId}", documentId);
                    documentExtractionData.Remarks = $"004: LLM returned empty response for DocumentId: {documentId}";
                    extractedDataList.Add(documentExtractionData);
                    continue;
                }

                // Attempt to deserialize the LLM response data into the appropriate object
                var serializerOptions = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                try
                {
                    documentExtractionData.ExtractedData = JsonSerializer.Deserialize<List<QuestionAnswerSetupData>>(llmResponse.Data, serializerOptions) ?? new List<QuestionAnswerSetupData>();
                    documentExtractionData.Remarks = "";

                    // Assign names using dictionary lookup
                    foreach (var category in documentExtractionData.ExtractedData)
                    {
                        if (questionAnswerDic.TryGetValue(category.Index, out var name))
                        {
                            category.Question = name;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Deserialization failed for DocumentId: {DocumentId}", documentId);
                    documentExtractionData.Remarks = $"005: Deserialization failed for DocumentId: {documentId}";

                    // Increment the failure count if there was existing extracted data for this document
                    if (existingDocumentData != null)
                    {
                        existingDocumentData.FailedCount += 1;
                        existingDocumentData.ExecutionTime += executionDurationInSeconds;
                        existingDocumentData.LastModifiedByUserId = _userId;
                        extractedDataToBeUpdated.Add(existingDocumentData);

                        // Update the reused documentExtractionData object with existing data details
                        documentExtractionData.ExecutionCount = existingDocumentData.ExecutionCount;
                        documentExtractionData.FailedCount = existingDocumentData.FailedCount;
                        documentExtractionData.TokenCount = existingDocumentData.TokenCount;
                        documentExtractionData.ExecutionTime = executionDurationInSeconds;
                    }

                    extractedDataList.Add(documentExtractionData);
                    continue;
                }

                _logger.LogInformation("Successfully extracted and deserialized question and answer data for DocumentId: {DocumentId}", documentId);

                // Check if there's any existing extracted data for this document
                if (existingDocumentData == null)
                {
                    _logger.LogInformation("No existing extracted data found for DocId: {DocId}. Preparing new record for insertion.", document.Id);

                    // Prepare a new record to insert into the ExtractedData table
                    var newExtractedData = new ExtractedData()
                    {
                        DocId = document.Id,
                        Type = document.Type,
                        MLModelId = model.Id,
                        TokenCount = 0,
                        ExecutionCount = 1,
                        ExecutionTime = executionDurationInSeconds,
                        FailedCount = 0,
                        DataObject = JsonSerializer.Serialize(documentExtractionData.ExtractedData, new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        }),
                        CreatedByUserId = _userId,
                        LastModifiedByUserId = _userId
                    };
                    extractedDataToBeInserted.Add(newExtractedData);

                    // Update the reused documentExtractionData object with the new record's details
                    documentExtractionData.ExecutionCount = newExtractedData.ExecutionCount;
                    documentExtractionData.FailedCount = newExtractedData.FailedCount;
                    documentExtractionData.TokenCount = newExtractedData.TokenCount;
                    documentExtractionData.ExecutionTime = executionDurationInSeconds;
                    extractedDataList.Add(documentExtractionData);
                }
                else
                {
                    _logger.LogInformation("Existing extracted data found for DocId: {DocId}. Preparing record for update.", document.Id);

                    // Update the existing record in the ExtractedData table
                    existingDocumentData.DataObject = JsonSerializer.Serialize(documentExtractionData.ExtractedData, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    existingDocumentData.LastModifiedByUserId = _userId;
                    existingDocumentData.ExecutionCount += 1;
                    existingDocumentData.ExecutionTime += executionDurationInSeconds;

                    // Add updated data to the update list
                    extractedDataToBeUpdated.Add(existingDocumentData);

                    // Update the reused documentExtractionData object with the existing record's details
                    documentExtractionData.ExecutionCount = existingDocumentData.ExecutionCount;
                    documentExtractionData.FailedCount = existingDocumentData.FailedCount;
                    documentExtractionData.TokenCount = existingDocumentData.TokenCount;
                    documentExtractionData.ExecutionTime = existingDocumentData.ExecutionTime;

                    extractedDataList.Add(documentExtractionData);
                }

                // Optionally send the extracted data to the client UI (not implemented here)
                // await _extractHub.Clients.User(_userId.ToString()).SendAsync("GetExtractedData", documentExtractionData);
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

    // Updates an extracted review data record associated with a specific machine learning model.
    public async Task<ServiceResponse<QuestionAnswerExtractedDataDto>> UpdateExtractedReviewDataAsync(QuestionAnswerExtractedDataDto questionAnswerExtractedDataDto)
    {
        // Initialize the response with default failure state
        var serviceResponse = new ServiceResponse<QuestionAnswerExtractedDataDto>
        {
            Data = null,
            Message = "Failed to update review data. Please try again later."
        };

        try
        {
            _logger.LogInformation("Initiating update for review data with ID: {ReviewDataId}", questionAnswerExtractedDataDto.Id);

            // Retrieve the existing data record from the repository
            var existingReviewData = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(x => x.Id == questionAnswerExtractedDataDto.Id)
                .FirstOrDefaultAsync();

            if (existingReviewData == null)
            {
                _logger.LogWarning("Review data not found. ID: {ReviewDataId}", questionAnswerExtractedDataDto.Id);
                serviceResponse.Message = $"Review data not found.";
                return serviceResponse;
            }

            // Trim whitespace from all string properties in the DTO
            questionAnswerExtractedDataDto = TrimDtoStringPropsUtil.TrimDtoStringProps(questionAnswerExtractedDataDto);

            // Map the trimmed DTO values to the existing entity
            questionAnswerExtractedDataDto.Adapt(existingReviewData);

            // Apply the update to the repository
            _unitOfWork.ExtractedDataRepo.Update(existingReviewData);

            // Attempt to save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes during update of review data. ID: {ReviewDataId}, User ID: {UserId}", questionAnswerExtractedDataDto.Id, _userId);
                return serviceResponse;
            }

            _logger.LogInformation("Successfully updated review data. ID: {ReviewDataId}", questionAnswerExtractedDataDto.Id);

            // Prepare successful response
            serviceResponse.Data = existingReviewData.Adapt<QuestionAnswerExtractedDataDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Review data updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while updating review data. ID: {ReviewDataId}", questionAnswerExtractedDataDto.Id);
        }

        return serviceResponse;
    }

    // Adds review data associated with a specific machine learning model.
    public async Task<ServiceResponse<IEnumerable<QuestionAnswerReviewDataDto>>> AddReviewDataAsync(CreateModelReviewRequestDto createModelReviewRequestDto)
    {
        // Initialize the service response with a default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<QuestionAnswerReviewDataDto>>
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
            serviceResponse.Data = extractedDataToInsert.Adapt<IEnumerable<QuestionAnswerReviewDataDto>>();
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
    public async Task<ServiceResponse<IEnumerable<QuestionAnswerFineTuningDataDto>>> GetFineTunningDataByMLModelIdAsync(Guid mlModelId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<QuestionAnswerFineTuningDataDto>>
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
                .ProjectToType<QuestionAnswerFineTuningDataDto>()
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
    public async Task<ServiceResponse<IEnumerable<QuestionAnswerFineTuningDataDto>>> ScheduleFineTuningAsync(AddFineTuningRequestDto fineTuningRequest)
    {
        // Initialize the service response with a default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<QuestionAnswerFineTuningDataDto>>
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

            serviceResponse.Data = extractedDataList.Adapt<IEnumerable<QuestionAnswerFineTuningDataDto>>();
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
                var questionAnswer = QuestionAnswerDto.SetupObject.QuestionAnswers[i];
                var instructions = string.IsNullOrEmpty(questionAnswer.Instructions) ? "" : $", - {questionAnswer.Instructions}";
                questionAnswerBuilder.AppendLine($"{questionAnswer.Index}. {questionAnswer.Name}{instructions}");
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