namespace MLModelBuilderAPIs.Services;

public class InferencingModelService : IInferencingModelService
{
    private readonly ILogger<InferencingModelService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILLMDataExtractionService _llmDataExtractionService;
    private readonly Guid _userId;

    public InferencingModelService(
        ILogger<InferencingModelService> logger,
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

    // Gets the model setup for a specific inferencing model using its unique ML model ID.
    public async Task<ServiceResponse<InferencingModelDto>> GetSetupByMLModelIdAsync(Guid mlModelId)
    {
        // Initialize the response with a failure state and default message
        var serviceResponse = new ServiceResponse<InferencingModelDto>
        {
            Data = null,
            Message = "Failed to retrieve the model setup. Please try again later."
        };

        try
        {
            // Log the beginning of the retrieval process with the ML model ID
            _logger.LogInformation("Attempting to retrieve model setup for ML model with ID: {MLModelId}", mlModelId);

            // Fetch the model setup from the database by its ML model ID, including related user and task data
            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mlModelId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.Tasks)
                .SingleOrDefaultAsync();

            // If no model setup is found, log a warning and return an appropriate message
            if (mlModel == null)
            {
                _logger.LogWarning("No model setup found for ML model with ID: {MLModelId}", mlModelId);
                serviceResponse.Message = "No model setup exists for the provided ML model ID.";
                return serviceResponse;
            }

            // Log the successful retrieval of the model setup
            _logger.LogInformation("Successfully retrieved model setup for ML model with ID: {MLModelId}", mlModelId);

            // Adapt the retrieved ML model to the corresponding DTO (Data Transfer Object)
            var inferencingModelDto = mlModel.Adapt<InferencingModelDto>();

            // Retrieve the list of inferencing tasks and add it to the model DTO 
            // This will populate the ModelTasks property with specific task details
            inferencingModelDto.ModelTasks = GetInferencingModelTask(mlModel);

            // Map the adapted model setup (including tasks) to the response DTO
            serviceResponse.Data = inferencingModelDto;

            // Set the success response status and message
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Model setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log the exception details if an error occurs during the process
            _logger.LogError("Error occurred while retrieving model setup for ML model with ID: {MLModelId}. Exception: {ExceptionMessage}", mlModelId, ex.Message);
        }

        // Return the service response (either successful or failure)
        return serviceResponse;
    }

    // Updates the configuration for an inferencing model setup.
    public async Task<ServiceResponse<InferencingModelDto>> UpdateSetupAsync(InferencingModelDto modelSetupDto)
    {
        // Prepare default failure response
        var serviceResponse = new ServiceResponse<InferencingModelDto>
        {
            Data = null,
            Message = "Failed to update model setup. Please try again later."
        };

        try
        {
            // Validate input DTO
            if (!ValidateModelSetupDto(modelSetupDto, out string? validationMessage))
            {
                _logger.LogWarning("Model setup validation failed: {ValidationMessage}", validationMessage);
                serviceResponse.Message = validationMessage;
                return serviceResponse;
            }

            _logger.LogInformation("Starting update for model setup | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);

            // Fetch the model including associated tasks
            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == modelSetupDto.Id)
                .Include(i => i.Tasks)
                .SingleOrDefaultAsync();

            // If model not found
            if (mlModel == null)
            {
                _logger.LogWarning("Model not found | ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
                serviceResponse.Message = "Model not found.";
                return serviceResponse;
            }

            // Prevent updates to published models
            if (mlModel.IsPublished)
            {
                _logger.LogWarning("Attempt to modify a published model | ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
                serviceResponse.Message = "This model is published and cannot be modified.";
                return serviceResponse;
            }

            // Clean up string fields in DTO
            modelSetupDto = TrimDtoStringPropsUtil.TrimDtoStringProps(modelSetupDto);

            _logger.LogInformation("Applying DTO changes to model entity | Model ID: {Id}", modelSetupDto.Id);
            mlModel.Adapt(modelSetupDto);
            mlModel.SetupStatus = SetupStatusTypesEnum.Completed;
            mlModel.LastModifiedByUserId = _userId;

            _logger.LogInformation("Saving model changes to database | Model ID: {Id}", modelSetupDto.Id);
            _unitOfWork.MLModelRepo.Update(mlModel);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save model changes | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
                return serviceResponse;
            }

            // Track new and existing tasks
            var tasksToBeAdded = new List<ModelTask>();
            var tasksToBeUpdated = new List<ModelTask>();

            if (modelSetupDto.ModelTasks?.Count > 0)
            {
                // Iterate over each task DTO to determine if it should be added or updated
                foreach (var taskDto in modelSetupDto.ModelTasks)
                {
                    // Attempt to find an existing task in the model with the same name
                    var existingTask = mlModel.Tasks.FirstOrDefault(t => t.Name == taskDto.Name);

                    if (existingTask == null)
                    {
                        // Task does not exist — create a new task entity from the DTO
                        var newTask = taskDto.Adapt<ModelTask>();
                        newTask.MLModelId = mlModel.Id;
                        newTask.SetupObject = SerializeSetupObject(taskDto);
                        newTask.CreatedByUserId = _userId;
                        newTask.LastModifiedByUserId = _userId;

                        tasksToBeAdded.Add(newTask);
                    }
                    else
                    {
                        // Task already exists — update its properties from the DTO
                        taskDto.Adapt(existingTask);
                        existingTask.SetupObject = SerializeSetupObject(taskDto);
                        existingTask.LastModifiedByUserId = _userId;

                        tasksToBeUpdated.Add(existingTask);
                    }
                }
            }

            // Insert new tasks if any
            if (tasksToBeAdded.Any())
            {
                _logger.LogInformation("Adding new tasks | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
                await _unitOfWork.ModelTaskRepo.InsertAsync(tasksToBeAdded);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save new tasks | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
                    return serviceResponse;
                }
            }

            // Update existing tasks if any
            if (tasksToBeUpdated.Any())
            {
                _logger.LogInformation("Updating existing tasks | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
                _unitOfWork.ModelTaskRepo.Update(tasksToBeUpdated);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save updated tasks | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
                    return serviceResponse;
                }
            }

            _logger.LogInformation("Model setup update completed successfully | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);

            // Return success response with updated model data
            serviceResponse.Data = mlModel.Adapt<InferencingModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Model setup updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating model setup | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
        }

        return serviceResponse;
    }

    // // Extracts data using a Language Learning Model (LLM).
    // public async Task<ServiceResponse<ExtractionResponseDto>> ExtractViaLLMAsync(ExtractRequestDto extractRequestDto)
    // {
    //     // Initialize ServiceResponse with a default failure message
    //     var serviceResponse = new ServiceResponse<ExtractionResponseDto>
    //     {
    //         Data = null,
    //         Message = "Failed to extract extraction data via LLM. Please try again."
    //     };

    //     try
    //     {
    //         _logger.LogInformation("Starting LLM extraction process for ModelId: {ModelId}", extractRequestDto.ModelId);

    //         // Retrieve model by ModelId
    //         var model = await _unitOfWork.MLModelRepo
    //                                       .GetByConditionAsync(w => w.Id == extractRequestDto.ModelId)
    //                                       .Include(i => i.ExtractedData)
    //                                       .SingleOrDefaultAsync();

    //         // If model is not found, log and return failure response
    //         if (model == null)
    //         {
    //             _logger.LogWarning("Model not found for ModelId: {ModelId}", extractRequestDto.ModelId);
    //             serviceResponse.Message = "Model not found";
    //             return serviceResponse;
    //         }

    //         // Adapt the model into an MLModelSetupDto and retrieve the setup object.
    //         var modelSetup = model.Adapt<MLModelSetupDto>()?.SetupObject;

    //         if (string.IsNullOrEmpty(modelSetup.LLM))
    //         {
    //             // Log a warning and set the service response message if LLM is missing or empty
    //             _logger.LogWarning("LLM is not configured for ModelId: {ModelId}.", model.Id);
    //             serviceResponse.Message = "Setup is incomplete.";
    //             return serviceResponse;
    //         }

    //         // Build a dictionary that maps field indices to field names.
    //         var fieldDict = modelSetup?
    //                             .FieldSetups?
    //                             .ToDictionary(c => c.Index, c => c.Name);

    //         // Extract table metadata from the model setup, mapping table indices to names.
    //         var tableMetadataDict = modelSetup?
    //                                     .TableMetadata?
    //                                     .ToDictionary(c => c.Index, c => c.Name);

    //         // Extract table headers from the model setup, mapping table indices to header names.
    //         var tableHeaderDict = modelSetup?
    //                                   .TableMetadata?
    //                                   .ToDictionary(c => c.Index, c => c.TableHeaders
    //                                   .ToDictionary(d => d.Index, d => d.Name));
    //         var outputFormat = new ExtractionSetupData()
    //         {
    //             Fields = fieldDict?.Select(s => new ExtractionSetupFieldValueSchema()
    //             {
    //                 Index = s.Key,
    //                 Name = s.Value,
    //                 ConfidenceScore = "0",
    //                 Value = ""
    //             }).ToList(),

    //             Tables = tableMetadataDict?.Select(s => new ExtractionSetupTableSchema()
    //             {
    //                 Index = s.Key,
    //                 Name = s.Value,
    //                 Headers = tableHeaderDict != null && tableHeaderDict.TryGetValue(s.Key, out var headers)
    //                     ? headers.Select(s1 => new ExtractionSetupTableHeaderSchema()
    //                     {
    //                         Index = s1.Key,
    //                         Name = s1.Value,
    //                     }).ToList()
    //                     : new List<ExtractionSetupTableHeaderSchema>()
    //             }).ToList()
    //         };

    //         // Check for prompt availability
    //         if (string.IsNullOrEmpty(model.GeneratedPrompt))
    //         {
    //             _logger.LogWarning("Prompt not found for ModelId: {ModelId}", extractRequestDto.ModelId);
    //             serviceResponse.Message = "Prompt not found for the model";
    //             return serviceResponse;
    //         }

    //         // Prepare the list to hold extracted data for each file
    //         var extractedDataList = new List<ExtractionSetupFileData>();

    //         // Initialize a list to store data that will be inserted into the database.
    //         var extractedDataToBeInserted = new List<ExtractedData>();

    //         // Initialize a list to store data that will be updated into the database.
    //         var extractedDataToBeUpdated = new List<ExtractedData>();

    //         _logger.LogInformation("Starting extraction for {FileCount} files", extractRequestDto.FileIds.Count);

    //         // Process each file ID to extract extraction data
    //         foreach (var documentId in extractRequestDto.FileIds)
    //         {
    //             // Check if there's any existing extracted data for the given document ID
    //             var existingDocumentData = model.ExtractedData.FirstOrDefault(data => data.DocId == documentId);
    //             _logger.LogInformation("Processing document with ID: {DocumentId}", documentId);

    //             // Add the extractedData object for new extraction data
    //             var documentExtractionData = new ExtractionSetupFileData
    //             {
    //                 ExecutionCount = existingDocumentData != null ? existingDocumentData.ExecutionCount : 0,
    //                 FailedCount = existingDocumentData != null ? existingDocumentData.FailedCount : 0,
    //                 TokenCount = existingDocumentData != null ? existingDocumentData.TokenCount : 0,
    //                 ExecutionTime = existingDocumentData != null ? existingDocumentData.ExecutionTime : 0,
    //                 ExtractedData = new ExtractionSetupData(),
    //                 FileId = documentId,
    //                 Remarks = $"001: Extraction failed for DocumentId: {documentId}."
    //             };

    //             // Retrieve the document data from the repository
    //             var document = await _unitOfWork.UploadedDocRepo
    //                                              .GetByConditionAsync(doc => doc.Id == documentId)
    //                                              .SingleOrDefaultAsync();

    //             // Check if the document was found in the repository
    //             if (document == null)
    //             {
    //                 _logger.LogWarning("Document not found with ID: {DocumentId}", documentId);
    //                 documentExtractionData.Remarks = $"002: Document not found with ID: {documentId}.";
    //                 extractedDataList.Add(documentExtractionData);
    //                 continue;
    //             }

    //             // Validate if the document has a valid file path
    //             if (string.IsNullOrEmpty(document.Path))
    //             {
    //                 serviceResponse.Message = "Document file path is missing.";

    //                 // Log the validation failure reason
    //                 _logger.LogWarning("Validation failed: Document file path is missing or null.");

    //                 return serviceResponse;
    //             }

    //             // Extract the document text using an external service
    //             var documentText = await _llmDataExtractionService.GetFileTextAsync(document.Path);

    //             // Ensure document text was successfully retrieved
    //             if (string.IsNullOrEmpty(documentText))
    //             {
    //                 serviceResponse.Message = "Failed to extract text from the document.";

    //                 // Log the failure of text extraction
    //                 _logger.LogWarning("Validation failed: Failed to retrieve text from the document at URL: {DocumentPath}", document.Path);

    //                 return serviceResponse;
    //             }

    //             // Serialize the outputFormat to JSON
    //             var outputFormatJson = JsonSerializer.Serialize(outputFormat, new JsonSerializerOptions
    //             {
    //                 PropertyNameCaseInsensitive = true,
    //             });

    //             // Replace the placeholders in the generated prompt
    //             var prompt = model.GeneratedPrompt
    //                 .Replace("{{FileContent}}", documentText)
    //                 .Replace("{{OutputFormat}}", outputFormatJson);

    //             _logger.LogWarning($"Prompt: {prompt}");


    //             // Record the start time before calling the LLM extraction service
    //             var startExecutionTime = DateTime.UtcNow;

    //             // Call the LLM data extraction service to process the document text
    //             var llmResponse = await _llmDataExtractionService.ExtractDataAsync(prompt, modelSetup.LLM, modelSetup.Temperature);

    //             // Record the end time after receiving the response from the LLM service
    //             var endExecutionTime = DateTime.UtcNow;

    //             // Calculate the total execution time in seconds (rounded up)
    //             int executionDurationInSeconds = (int)Math.Ceiling((endExecutionTime - startExecutionTime).TotalSeconds);

    //             // Check if LLM extraction was successful (StatusCode 200)
    //             if (llmResponse.StatusCode != 200)
    //             {
    //                 _logger.LogWarning("LLM extraction failed for DocumentId: {DocumentId} with message: {Message}", documentId, llmResponse.Message);
    //                 documentExtractionData.Remarks = $"003: LLM extraction failed. {llmResponse.Message}";

    //                 // Increment the failure count if there was existing extracted data for this document
    //                 if (existingDocumentData != null)
    //                 {
    //                     existingDocumentData.FailedCount += 1;
    //                     existingDocumentData.ExecutionTime += executionDurationInSeconds;
    //                     existingDocumentData.LastModifiedByUserId = _userId;
    //                     extractedDataToBeUpdated.Add(existingDocumentData);

    //                     // Update the reused documentExtractionData object with existing data details
    //                     documentExtractionData.ExecutionCount = existingDocumentData.ExecutionCount;
    //                     documentExtractionData.FailedCount = existingDocumentData.FailedCount;
    //                     documentExtractionData.TokenCount = existingDocumentData.TokenCount;
    //                     documentExtractionData.ExecutionTime = executionDurationInSeconds;
    //                 }

    //                 extractedDataList.Add(documentExtractionData);
    //                 continue;
    //             }

    //             // Check if LLM returned empty data
    //             if (string.IsNullOrEmpty(llmResponse.Data))
    //             {
    //                 _logger.LogWarning("LLM returned empty data for DocumentId: {DocumentId}", documentId);
    //                 documentExtractionData.Remarks = $"004: LLM returned empty response for DocumentId: {documentId}";
    //                 extractedDataList.Add(documentExtractionData);
    //                 continue;
    //             }

    //             // Attempt to deserialize the LLM response data into the appropriate object
    //             var serializerOptions = new JsonSerializerOptions
    //             {
    //                 PropertyNameCaseInsensitive = true
    //             };
    //             try
    //             {
    //                 documentExtractionData.ExtractedData = JsonSerializer.Deserialize<ExtractionSetupData>(llmResponse.Data, serializerOptions) ?? new ExtractionSetupData();
    //                 documentExtractionData.Remarks = "";

    //                 // Assign field names based on field index using the fieldDict dictionary
    //                 foreach (var field in documentExtractionData.ExtractedData.Fields)
    //                 {
    //                     if (fieldDict.TryGetValue(field.Index, out var name))
    //                     {
    //                         field.Name = name;
    //                     }
    //                 }
    //                 // Ensure all necessary objects are not null
    //                 if (documentExtractionData?.ExtractedData?.Tables != null)
    //                 {
    //                     foreach (var tableSchema in documentExtractionData.ExtractedData.Tables)
    //                     {
    //                         if (tableSchema == null)
    //                             continue;

    //                         // Set the table name if available
    //                         if (tableMetadataDict != null && tableMetadataDict.TryGetValue(tableSchema.Index, out var tableName))
    //                         {
    //                             tableSchema.Name = tableName;
    //                         }

    //                         // Set the header names for the table if available
    //                         if (tableHeaderDict != null && tableHeaderDict.TryGetValue(tableSchema.Index, out var headersDict))
    //                         {
    //                             if (tableSchema.Headers != null)
    //                             {
    //                                 foreach (var header in tableSchema.Headers)
    //                                 {
    //                                     if (header == null)
    //                                         continue;

    //                                     if (headersDict.TryGetValue(header.Index, out var headerName))
    //                                     {
    //                                         header.Name = headerName;
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //             catch (Exception ex)
    //             {
    //                 _logger.LogError(ex, "Deserialization failed for DocumentId: {DocumentId}", documentId);
    //                 documentExtractionData.Remarks = $"005: Deserialization failed for DocumentId: {documentId}";

    //                 // Increment the failure count if there was existing extracted data for this document
    //                 if (existingDocumentData != null)
    //                 {
    //                     existingDocumentData.FailedCount += 1;
    //                     existingDocumentData.ExecutionTime += executionDurationInSeconds;
    //                     existingDocumentData.LastModifiedByUserId = _userId;
    //                     extractedDataToBeUpdated.Add(existingDocumentData);

    //                     // Update the reused documentExtractionData object with existing data details
    //                     documentExtractionData.ExecutionCount = existingDocumentData.ExecutionCount;
    //                     documentExtractionData.FailedCount = existingDocumentData.FailedCount;
    //                     documentExtractionData.TokenCount = existingDocumentData.TokenCount;
    //                     documentExtractionData.ExecutionTime = executionDurationInSeconds;
    //                 }

    //                 extractedDataList.Add(documentExtractionData);
    //                 continue;
    //             }

    //             _logger.LogInformation("Successfully extracted and deserialized extraction data for DocumentId: {DocumentId}", documentId);

    //             // Check if there's any existing extracted data for this document
    //             if (existingDocumentData == null)
    //             {
    //                 _logger.LogInformation("No existing extracted data found for DocId: {DocId}. Preparing new record for insertion.", document.Id);

    //                 // Prepare a new record to insert into the ExtractedData table
    //                 var newExtractedData = new ExtractedData()
    //                 {
    //                     DocId = document.Id,
    //                     Type = document.Type,
    //                     MLModelId = model.Id,
    //                     TokenCount = 0,
    //                     ExecutionCount = 1,
    //                     ExecutionTime = executionDurationInSeconds,
    //                     FailedCount = 0,
    //                     DataObject = JsonSerializer.Serialize(documentExtractionData.ExtractedData, new JsonSerializerOptions
    //                     {
    //                         PropertyNameCaseInsensitive = true
    //                     }),
    //                     CreatedByUserId = _userId,
    //                     LastModifiedByUserId = _userId
    //                 };
    //                 extractedDataToBeInserted.Add(newExtractedData);

    //                 // Update the reused documentExtractionData object with the new record's details
    //                 documentExtractionData.ExecutionCount = newExtractedData.ExecutionCount;
    //                 documentExtractionData.FailedCount = newExtractedData.FailedCount;
    //                 documentExtractionData.TokenCount = newExtractedData.TokenCount;
    //                 documentExtractionData.ExecutionTime = newExtractedData.ExecutionTime;
    //                 extractedDataList.Add(documentExtractionData);
    //             }
    //             else
    //             {
    //                 _logger.LogInformation("Existing extracted data found for DocId: {DocId}. Preparing record for update.", document.Id);

    //                 // Update the existing record in the ExtractedData table
    //                 existingDocumentData.DataObject = JsonSerializer.Serialize(documentExtractionData.ExtractedData, new JsonSerializerOptions
    //                 {
    //                     PropertyNameCaseInsensitive = true
    //                 });
    //                 existingDocumentData.LastModifiedByUserId = _userId;
    //                 existingDocumentData.ExecutionCount += 1;
    //                 existingDocumentData.ExecutionTime += executionDurationInSeconds;

    //                 // Add updated data to the update list
    //                 extractedDataToBeUpdated.Add(existingDocumentData);

    //                 // Update the reused documentExtractionData object with the existing record's details
    //                 documentExtractionData.ExecutionCount = existingDocumentData.ExecutionCount;
    //                 documentExtractionData.FailedCount = existingDocumentData.FailedCount;
    //                 documentExtractionData.TokenCount = existingDocumentData.TokenCount;
    //                 documentExtractionData.ExecutionTime = executionDurationInSeconds;

    //                 extractedDataList.Add(documentExtractionData);
    //             }

    //             // Optionally send the extracted data to the client UI (not implemented here)
    //             // await _extractHub.Clients.User(_userId.ToString()).SendAsync("GetExtractedData", documentExtractionData);
    //         }
    //         // Check if there is any extracted data to insert into the database
    //         if (extractedDataToBeInserted.Any())
    //         {
    //             _logger.LogInformation("Inserting {Count} new extracted data records into the database.", extractedDataToBeInserted.Count);

    //             // Insert new records
    //             await _unitOfWork.ExtractedDataRepo.InsertAsync(extractedDataToBeInserted);

    //             // Save database changes
    //             if (!await _unitOfWork.SaveAsync())
    //             {
    //                 _logger.LogError("Failed to save extracted data to the database after insertion.");
    //             }
    //         }

    //         // Check if there is any extracted data to update into the database
    //         if (extractedDataToBeUpdated.Any())
    //         {
    //             _logger.LogInformation("Updating {Count} existing extracted data records in the database.", extractedDataToBeUpdated.Count);

    //             // Update existing records
    //             _unitOfWork.ExtractedDataRepo.Update(extractedDataToBeUpdated);

    //             // Save database changes
    //             if (!await _unitOfWork.SaveAsync())
    //             {
    //                 _logger.LogError("Failed to save extracted data to the database after update.");
    //             }
    //         }

    //         // Prepare the final response DTO with the extracted data
    //         var extractResponseDto = new ExtractionResponseDto
    //         {
    //             ModelId = extractRequestDto.ModelId,
    //             FilesExtractedData = extractedDataList
    //         };

    //         // Set the final status and message based on the results
    //         serviceResponse.Data = extractResponseDto;
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = extractedDataList.Any(w => w.Remarks.Contains("Failed")) ?
    //                                     "Failed to extract data for one or more files" :
    //                                     "Data extracted successfully";

    //         _logger.LogInformation("Extraction process completed. Summary: {Message}", serviceResponse.Message);
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex, "An exception occurred during the LLM extraction process.");
    //     }

    //     return serviceResponse;
    // }

    // // Retrieves a collection of extracted data records associated with a specific machine learning model.
    // public async Task<ServiceResponse<IEnumerable<ExtractedDataResponseDto>>> GetExtractedDataByMLModelIdAsync(Guid mlModelId)
    // {
    //     // Initialize the response with a default failure message and null data
    //     var serviceResponse = new ServiceResponse<IEnumerable<ExtractedDataResponseDto>>
    //     {
    //         Data = null,
    //         Message = "Failed to retrieve extracted data. Please try again later."
    //     };

    //     try
    //     {
    //         // Log the beginning of the retrieval process
    //         _logger.LogInformation("Attempting to retrieve extracted data for ML model with ID: {MLModelId}", mlModelId);

    //         // Fetch the extracted data based on the provided ML model ID and map it to the DTO
    //         var extractedDataList = await _unitOfWork.ExtractedDataRepo
    //             .GetByConditionAsync(w => w.MLModelId == mlModelId)
    //             .Include(i => i.CreatedByUser)
    //             .Include(i => i.UploadedDoc)
    //             .ProjectToType<ExtractedDataResponseDto>()
    //             .ToListAsync();


    //         // Log the successful retrieval of the setup
    //         _logger.LogInformation("Successfully retrieved extracted data for ML model with ID: {MLModelId}", mlModelId);

    //         // Set the successful response data
    //         serviceResponse.Data = extractedDataList;
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = "Extracted data retrieved successfully.";
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError("Error occurred while retrieving extracted data for ML model with ID: {MLModelId}. Exception: {ExceptionMessage}", mlModelId, ex.Message);
    //     }

    //     return serviceResponse;
    // }

    // // Retrieves a collection of extracted review data records associated with a specific machine learning model.
    // public async Task<ServiceResponse<IEnumerable<ExtractionReviewDataDto>>> GetExtractedReviewDataByMLModelIdAsync(Guid mlModelId)
    // {// Initialize the response with a default failure message and null data
    //     var serviceResponse = new ServiceResponse<IEnumerable<ExtractionReviewDataDto>>
    //     {
    //         Data = null,
    //         Message = "Failed to retrieve extracted review data. Please try again later."
    //     };

    //     try
    //     {
    //         // Log the beginning of the retrieval process
    //         _logger.LogInformation("Attempting to retrieve extracted review data for ML model with ID: {MLModelId}", mlModelId);

    //         // Fetch the extracted review data based on the provided ML model ID and map it to the DTO
    //         var extractedReviewDataList = await _unitOfWork.ExtractedDataRepo
    //             .GetByConditionAsync(w => w.MLModelId == mlModelId)
    //             .Include(i => i.CreatedByUser)
    //             .Include(i => i.UploadedDoc)
    //             .ProjectToType<ExtractionReviewDataDto>()
    //             .ToListAsync();

    //         // Log the successful retrieval of the setup
    //         _logger.LogInformation("Successfully retrieved extracted review data for ML model with ID: {MLModelId}", mlModelId);

    //         // Set the successful response data
    //         serviceResponse.Data = extractedReviewDataList;
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = "Extracted review data retrieved successfully.";
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError("Error occurred while retrieving extracted review data for ML model with ID: {MLModelId}. Exception: {ExceptionMessage}", mlModelId, ex.Message);
    //     }

    //     return serviceResponse;
    // }

    // // Updates an extracted review data record associated with a specific machine learning model.
    // public async Task<ServiceResponse<ExtractedDataResponseDto>> UpdateExtractedReviewDataAsync(ExtractedDataResponseDto extractedDataResponseDto)
    // {
    //     // Initialize the response with default failure state
    //     var serviceResponse = new ServiceResponse<ExtractedDataResponseDto>
    //     {
    //         Data = null,
    //         Message = "Failed to update review data. Please try again later."
    //     };

    //     try
    //     {
    //         _logger.LogInformation("Initiating update for review data with ID: {ReviewDataId}", extractedDataResponseDto.Id);

    //         // Retrieve the existing data record from the repository
    //         var existingReviewData = await _unitOfWork.ExtractedDataRepo
    //             .GetByConditionAsync(x => x.Id == extractedDataResponseDto.Id)
    //             .FirstOrDefaultAsync();

    //         if (existingReviewData == null)
    //         {
    //             _logger.LogWarning("Review data not found. ID: {ReviewDataId}", extractedDataResponseDto.Id);
    //             serviceResponse.Message = $"Review data not found.";
    //             return serviceResponse;
    //         }

    //         // Trim whitespace from all string properties in the DTO
    //         extractedDataResponseDto = TrimDtoStringPropsUtil.TrimDtoStringProps(extractedDataResponseDto);

    //         // Map the trimmed DTO values to the existing entity
    //         extractedDataResponseDto.Adapt(existingReviewData);

    //         // Apply the update to the repository
    //         _unitOfWork.ExtractedDataRepo.Update(existingReviewData);

    //         // Attempt to save changes
    //         if (!await _unitOfWork.SaveAsync())
    //         {
    //             _logger.LogError("Failed to save changes during update of review data. ID: {ReviewDataId}, User ID: {UserId}", extractedDataResponseDto.Id, _userId);
    //             return serviceResponse;
    //         }

    //         _logger.LogInformation("Successfully updated review data. ID: {ReviewDataId}", extractedDataResponseDto.Id);

    //         // Prepare successful response
    //         serviceResponse.Data = existingReviewData.Adapt<ExtractedDataResponseDto>();
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = "Review data updated successfully.";
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex, "Exception occurred while updating review data. ID: {ReviewDataId}", extractedDataResponseDto.Id);
    //     }

    //     return serviceResponse;
    // }

    // // Adds review data associated with a specific machine learning model.
    // public async Task<ServiceResponse<IEnumerable<ExtractionReviewDataDto>>> AddReviewDataAsync(CreateModelReviewRequestDto createModelReviewRequestDto)
    // {
    //     // Initialize the service response with a default failure message
    //     var serviceResponse = new ServiceResponse<IEnumerable<ExtractionReviewDataDto>>
    //     {
    //         Data = null,
    //         Message = "Failed to add review data. Please try again later."
    //     };

    //     try
    //     {
    //         // Log the start of the review data creation process
    //         _logger.LogInformation("Initiating review data creation for ML model ID: {MLModelId}", createModelReviewRequestDto.MLModelId);

    //         // Retrieve uploaded documents using the provided file IDs
    //         var uploadedFiles = await _unitOfWork.UploadedDocRepo
    //             .GetByConditionAsync(doc => createModelReviewRequestDto.FileIds.Contains(doc.Id))
    //             .ToListAsync();

    //         if (!uploadedFiles.Any())
    //         {
    //             _logger.LogWarning("No uploaded documents found for file IDs: {FileIds} for ML model ID: {MLModelId}",
    //                 string.Join(", ", createModelReviewRequestDto.FileIds), createModelReviewRequestDto.MLModelId);

    //             serviceResponse.Message = "No uploaded documents matched the provided file IDs.";
    //             return serviceResponse;
    //         }

    //         // Prepare extracted data entities for insertion
    //         var extractedDataToInsert = uploadedFiles.Select(file => new ExtractedData
    //         {
    //             MLModelId = createModelReviewRequestDto.MLModelId,
    //             DocId = file.Id,
    //             DataObject = string.Empty,
    //             Accuracy = 0,
    //             Type = createModelReviewRequestDto.Type,
    //             CreatedByUserId = _userId,
    //             LastModifiedByUserId = _userId,
    //             SubmitForFineTuning = false,
    //         }).ToList();

    //         // Insert extracted data
    //         await _unitOfWork.ExtractedDataRepo.InsertAsync(extractedDataToInsert);

    //         // Persist the changes
    //         if (!await _unitOfWork.SaveAsync())
    //         {
    //             _logger.LogError("Failed to persist extracted review data for ML model ID: {MLModelId}", createModelReviewRequestDto.MLModelId);
    //             return serviceResponse;
    //         }

    //         // If scheduling information is provided, add a scheduled model entry
    //         if (createModelReviewRequestDto.ScheduleInfo != null)
    //         {
    //             await _unitOfWork.ScheduledModelRepo.InsertAsync(extractedDataToInsert.Select(s => new ScheduledModel
    //             {
    //                 MLModelId = s.MLModelId,
    //                 TimeZone = createModelReviewRequestDto.ScheduleInfo.TimeZone,
    //                 ScheduledAt = createModelReviewRequestDto.ScheduleInfo.ScheduledAt,
    //                 ScheduleType = ModelOperationTypesEnum.RunAndReview,
    //                 ExtractedDataId = s.Id,
    //                 CreatedByUserId = _userId,
    //                 LastModifiedByUserId = _userId
    //             }).ToList());

    //             // Persist scheduled model entry
    //             if (!await _unitOfWork.SaveAsync())
    //             {
    //                 _logger.LogError("Failed to save scheduled model entry for ML model ID: {MLModelId}", createModelReviewRequestDto.MLModelId);
    //                 return serviceResponse;
    //             }
    //         }

    //         // Log the successful addition of review data
    //         _logger.LogInformation("Review data successfully added for ML model ID: {MLModelId}", createModelReviewRequestDto.MLModelId);

    //         // Return the successful response
    //         serviceResponse.Data = extractedDataToInsert.Adapt<IEnumerable<ExtractionReviewDataDto>>();
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = "Review data added successfully.";
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex, "Exception occurred while adding review data for ML model ID: {MLModelId}", createModelReviewRequestDto.MLModelId);
    //     }

    //     return serviceResponse;
    // }

    // // Retrieves Fine tuning data records associated with the specified machine learning model ID.
    // public async Task<ServiceResponse<IEnumerable<ExtractionFineTuningDataDto>>> GetFineTunningDataByMLModelIdAsync(Guid mlModelId)
    // {
    //     var serviceResponse = new ServiceResponse<IEnumerable<ExtractionFineTuningDataDto>>
    //     {
    //         Data = null,
    //         Message = "Failed to retrieve fine tuning data. Please try again later."
    //     };

    //     try
    //     {
    //         _logger.LogInformation("Starting retrieval of Fine tuning data for ML model ID: {MLModelId}", mlModelId);

    //         var fineTuningDataList = await _unitOfWork.ExtractedDataRepo
    //             .GetByConditionAsync(w => w.MLModelId == mlModelId && w.SubmitForFineTuning)
    //             .Include(x => x.CreatedByUser)
    //             .Include(x => x.UploadedDoc)
    //             .ProjectToType<ExtractionFineTuningDataDto>()
    //             .ToListAsync();

    //         _logger.LogInformation("Successfully retrieved {Count} Fine tuning data records for ML model ID: {MLModelId}", fineTuningDataList.Count, mlModelId);

    //         serviceResponse.Data = fineTuningDataList;
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = "Fine tuning data retrieved successfully.";
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex, "An error occurred while retrieving Fine tuning data for ML model ID: {MLModelId}", mlModelId);
    //     }

    //     return serviceResponse;
    // }

    // // Schedules a fine tuning job for a specific machine learning model by sending the fine tuning request details.
    // public async Task<ServiceResponse<IEnumerable<ExtractionFineTuningDataDto>>> ScheduleFineTuningAsync(AddFineTuningRequestDto fineTuningRequest)
    // {
    //     // Initialize the service response with a default failure message
    //     var serviceResponse = new ServiceResponse<IEnumerable<ExtractionFineTuningDataDto>>
    //     {
    //         Data = null,
    //         Message = "Failed to schedule fine tuning. Please try again later."
    //     };

    //     try
    //     {
    //         // Log the start of the fine tuning process
    //         _logger.LogInformation("Starting fine tuning scheduling for ML model ID: {MLModelId}", fineTuningRequest.MLModelId);

    //         // Fetch extracted data associated with the specified file IDs and ML model
    //         var extractedDataList = await _unitOfWork.ExtractedDataRepo
    //             .GetByConditionAsync(w => w.MLModelId == fineTuningRequest.MLModelId && fineTuningRequest.FileIds.Contains(w.DocId))
    //             .Include(i => i.UploadedDoc)
    //             .Include(i => i.CreatedByUser)
    //             .ToListAsync();

    //         if (!extractedDataList.Any())
    //         {
    //             // Log and return response when no data is found
    //             _logger.LogWarning("No extracted data found for provided file IDs: {FileIds} under ML model ID: {MLModelId}",
    //                 string.Join(", ", fineTuningRequest.FileIds), fineTuningRequest.MLModelId);

    //             serviceResponse.Message = "No extracted data found for the provided file IDs.";
    //             return serviceResponse;
    //         }

    //         // Check if any of the extracted data are already scheduled
    //         var alreadyScheduledData = await _unitOfWork.ScheduledModelRepo
    //                     .GetByConditionAsync(w =>
    //                         extractedDataList.Select(s => s.Id).Contains(w.ExtractedDataId) &&
    //                         w.MLModelId == fineTuningRequest.MLModelId &&
    //                         w.ScheduleType == ModelOperationTypesEnum.FineTuning &&
    //                         w.Status == ScheduleTypesEnum.Scheduled)
    //                         .ToListAsync();

    //         if (alreadyScheduledData.Any())
    //         {
    //             // Log and return response if fine tuning is already scheduled for the provided file IDs
    //             _logger.LogWarning("Fine tuning job already scheduled for file IDs: {FileIds} under ML model ID: {MLModelId}",
    //                 string.Join(", ", fineTuningRequest.FileIds), fineTuningRequest.MLModelId);

    //             serviceResponse.Message = "Fine tuning job has already been scheduled for the selected data.";
    //             return serviceResponse;
    //         }

    //         // Create and insert a new scheduled fine tuning job
    //         var scheduledModels = extractedDataList.Select(s => new ScheduledModel
    //         {
    //             MLModelId = s.MLModelId,
    //             TimeZone = fineTuningRequest.TimeZone,
    //             ScheduledAt = fineTuningRequest.ScheduledAt,
    //             ScheduleType = ModelOperationTypesEnum.FineTuning,
    //             Status = ScheduleTypesEnum.Scheduled,
    //             ExtractedDataId = s.Id,
    //             CreatedByUserId = _userId,
    //             LastModifiedByUserId = _userId
    //         }).ToList();

    //         await _unitOfWork.ScheduledModelRepo.InsertAsync(scheduledModels);

    //         // Attempt to save the scheduled fine tuning job
    //         if (!await _unitOfWork.SaveAsync())
    //         {
    //             _logger.LogError("Failed to persist scheduled fine tuning job for ML model ID: {MLModelId}", fineTuningRequest.MLModelId);
    //             return serviceResponse;
    //         }

    //         // Load scheduled models with their associated fine-tuning logs
    //         scheduledModels = await _unitOfWork.ScheduledModelRepo
    //             .GetByConditionAsync(w => scheduledModels.Select(s => s.Id).Contains(w.Id))
    //             .Include(i => i.FineTuningLogs)
    //             .ToListAsync();

    //         // Create fine-tuning logs for each associated document
    //         var fineTuningLogs = scheduledModels.Select(s => new FineTuningLog()
    //         {
    //             Version = (s.FineTuningLogs?.Count ?? 0) + 1,
    //             ScheduledModelId = s.Id,
    //             Status = ScheduleTypesEnum.Scheduled,
    //         }).ToList();

    //         // Insert all fine-tuning logs into the repository
    //         await _unitOfWork.FineTuningLogRepo.InsertAsync(fineTuningLogs);

    //         // Save the fine-tuning log entries and validate success
    //         if (!await _unitOfWork.SaveAsync())
    //         {
    //             _logger.LogError("Failed to persist scheduled AI persona fine-tuning job for ML model ID: {MLModelId}", fineTuningRequest.MLModelId);
    //             return serviceResponse;
    //         }

    //         // Log success and return the successful service response
    //         _logger.LogInformation("Fine tuning job successfully scheduled for ML model ID: {MLModelId}", fineTuningRequest.MLModelId);

    //         serviceResponse.Data = extractedDataList.Adapt<IEnumerable<ExtractionFineTuningDataDto>>();
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = "Fine tuning job scheduled successfully.";
    //     }
    //     catch (Exception ex)
    //     {
    //         // Log any unexpected exceptions that occur during the process
    //         _logger.LogError(ex, "An error occurred while scheduling fine tuning for ML model ID: {MLModelId}", fineTuningRequest.MLModelId);
    //     }

    //     return serviceResponse;
    // }
    // // Retrieves the Fine tuning history records for a specified machine learning model.

    // public async Task<ServiceResponse<IEnumerable<FineTuningHistoryDto>>> GetFineTuningDataHistoriesAsync(Guid mlModelId)
    // {
    //     var serviceResponse = new ServiceResponse<IEnumerable<FineTuningHistoryDto>>
    //     {
    //         Data = null,
    //         Message = "Failed to retrieve fine tuning history. Please try again later."
    //     };

    //     try
    //     {
    //         _logger.LogInformation("Initiating retrieval of fine-tuning history for ML Model ID: {MLModelId}", mlModelId);

    //         // Retrieve scheduled models associated with the specified ML model ID and of type 'FineTuning'
    //         var scheduledModels = await _unitOfWork.ScheduledModelRepo
    //             .GetByConditionAsync(w => w.MLModelId == mlModelId && w.ScheduleType == ModelOperationTypesEnum.FineTuning)
    //             .ToListAsync();

    //         var fineTuningLogs = new List<FineTuningHistoryDto>();

    //         if (scheduledModels.Any())
    //         {
    //             // Retrieve fine-tuning logs that match the scheduled model IDs and have a status of 'FineTuning'
    //             fineTuningLogs = await _unitOfWork.FineTuningLogRepo
    //                 .GetByConditionAsync(w =>
    //                     scheduledModels.Select(s => s.Id).Contains(w.ScheduledModelId)
    //                 )
    //                 .Include(i => i.ScheduledModel)
    //                 .ThenInclude(i2 => i2.MLModel)
    //                 .ProjectToType<FineTuningHistoryDto>()
    //                 .ToListAsync();
    //         }

    //         _logger.LogInformation("Retrieved {Count} fine-tuning record(s) for ML Model ID: {MLModelId}", fineTuningLogs.Count, mlModelId);

    //         serviceResponse.Data = fineTuningLogs;
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = "Fine tuning history retrieved successfully.";
    //     }
    //     catch (Exception ex)
    //     {
    //         // Log error if something goes wrong during the data retrieval process
    //         _logger.LogError(ex, "Error while fetching fine tuning history for ML model ID: {MLModelId}", mlModelId);
    //     }

    //     return serviceResponse;
    // }

    // // Reschedules a fine-tuning job for the existing data.
    // public async Task<ServiceResponse<FineTuningHistoryDto>> RescheduleFineTuningAsync(RescheduleFineTuningDto rescheduleFineTuningDto)
    // {
    //     // Initialize the service response with a default failure state.
    //     var serviceResponse = new ServiceResponse<FineTuningHistoryDto>
    //     {
    //         Data = null,
    //         Message = "Failed to reschedule fine-tuning. Please try again later."
    //     };

    //     try
    //     {
    //         // Log the initiation of the fine-tuning reschedule request with relevant identifiers.
    //         _logger.LogInformation("Request received to reschedule fine-tuning for ML Model ID: {MLModelId}, Data ID: {DataId}",
    //             rescheduleFineTuningDto.MLModelId, rescheduleFineTuningDto.Id);

    //         // Retrieve the fine-tuning log entry using the provided extracted data ID.
    //         var fineTuningLog = await _unitOfWork.FineTuningLogRepo
    //             .GetByConditionAsync(w => w.Id == rescheduleFineTuningDto.Id)
    //             .FirstOrDefaultAsync();

    //         // If no matching fine-tuning log is found, return a failure response.
    //         if (fineTuningLog == null)
    //         {
    //             _logger.LogWarning("No fine-tuning log found for ML Model ID: {MLModelId}, Data ID: {DataId}. Rescheduling failed.",
    //                 rescheduleFineTuningDto.MLModelId, rescheduleFineTuningDto.Id);

    //             serviceResponse.Message = "Data not found.";
    //             return serviceResponse;
    //         }

    //         // Retrieve the associated scheduled model details using the ScheduledModelId from the fine-tuning log.
    //         var scheduledModel = await _unitOfWork.ScheduledModelRepo
    //             .GetByConditionAsync(w => w.Id == fineTuningLog.ScheduledModelId)
    //             .FirstOrDefaultAsync();

    //         // If no scheduled model is found, return a failure response.
    //         if (scheduledModel == null)
    //         {
    //             _logger.LogWarning("No scheduled model found for ML Model ID: {MLModelId}, Data ID: {DataId}. Rescheduling failed.",
    //                 rescheduleFineTuningDto.MLModelId, rescheduleFineTuningDto.Id);

    //             serviceResponse.Message = "Data not found.";
    //             return serviceResponse;
    //         }

    //         // Update the scheduled model with the new time zone and scheduled date from the input.
    //         scheduledModel.TimeZone = rescheduleFineTuningDto.TimeZone;
    //         scheduledModel.ScheduledAt = rescheduleFineTuningDto.ScheduledAt;

    //         // Apply the changes to the scheduled model repository.
    //         _unitOfWork.ScheduledModelRepo.Update(scheduledModel);

    //         // Attempt to save the changes to the database.
    //         if (!await _unitOfWork.SaveAsync())
    //         {
    //             _logger.LogError("Failed to persist rescheduled fine-tuning job for ML Model ID: {MLModelId}, Data ID: {DataId}. Changes were not saved.",
    //                 rescheduleFineTuningDto.MLModelId, rescheduleFineTuningDto.Id);
    //             return serviceResponse;
    //         }

    //         // Log the successful rescheduling and update the service response with the fine-tuning history.
    //         _logger.LogInformation("Successfully rescheduled fine-tuning job for ML Model ID: {MLModelId}, Data ID: {DataId}. Changes saved successfully.",
    //             rescheduleFineTuningDto.MLModelId, rescheduleFineTuningDto.Id);

    //         serviceResponse.Data = fineTuningLog.Adapt<FineTuningHistoryDto>();
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = "Fine-tuning job rescheduled successfully.";
    //     }
    //     catch (Exception ex)
    //     {
    //         // Log any exceptions that occur during the process and return the failure response.
    //         _logger.LogError(ex, "Exception occurred while rescheduling fine-tuning for ML Model ID: {MLModelId}, Data ID: {DataId}.",
    //             rescheduleFineTuningDto.MLModelId, rescheduleFineTuningDto.Id);

    //         serviceResponse.Message = "An unexpected error occurred while rescheduling fine-tuning.";
    //     }

    //     return serviceResponse;
    // }

    // // Deletes a fine-tuning history record from the database based on the provided ID.
    // public async Task<ServiceResponse<bool>> DeleteFineTuningDataHistoryAsync(Guid fineTuningHistoryId)
    // {
    //     // Initialize the service response with a failure state by default
    //     var serviceResponse = new ServiceResponse<bool>
    //     {
    //         Data = false,
    //         Message = "Failed to delete fine-tuning history. Please try again."
    //     };

    //     try
    //     {
    //         // Retrieve the fine-tuning log by its ID, including its associated ScheduledModel
    //         var fineTuningLog = await _unitOfWork.FineTuningLogRepo
    //             .GetByConditionAsync(w => w.Id == fineTuningHistoryId)
    //             .Include(i => i.ScheduledModel)
    //             .SingleOrDefaultAsync();

    //         // If no matching fine-tuning log is found, exit early
    //         if (fineTuningLog == null)
    //         {
    //             _logger.LogWarning("Deletion failed: Fine-tuning history with ID {FineTuningHistoryId} not found.", fineTuningHistoryId);
    //             serviceResponse.Message = "Fine-tuning history not found.";
    //             return serviceResponse;
    //         }

    //         // Check if the FineTuningLog's status is 'Scheduled'
    //         if (fineTuningLog.Status != ScheduleTypesEnum.Scheduled)
    //         {
    //             _logger.LogWarning("Deletion failed: Fine-tuning history with ID {FineTuningHistoryId} cannot be deleted because its status is {Status}.",
    //                 fineTuningHistoryId, fineTuningLog.Status);
    //             serviceResponse.Message = "Cannot delete fine-tuning history because it is not in 'Scheduled' status.";
    //             return serviceResponse;
    //         }

    //         // Retrieve the associated ScheduledModel and its related fine-tuning logs
    //         var scheduledModel = await _unitOfWork.ScheduledModelRepo
    //             .GetByConditionAsync(w => w.Id == fineTuningLog.ScheduledModelId)
    //             .Include(m => m.FineTuningLogs)
    //             .SingleOrDefaultAsync();

    //         // If related scheduled model exists
    //         if (scheduledModel != null)
    //         {
    //             // Check how many fine-tuning logs are associated with this ScheduledModel
    //             if (scheduledModel.FineTuningLogs.Count > 1)
    //             {
    //                 // If more than one, delete only the FineTuningLog
    //                 _unitOfWork.FineTuningLogRepo.Delete(fineTuningLog);
    //                 _logger.LogInformation("Deleted FineTuningLog with ID {FineTuningHistoryId}.", fineTuningHistoryId);
    //             }
    //             else
    //             {
    //                 // If this is the last FineTuningLog, delete both the FineTuningLog and the ScheduledModel
    //                 _unitOfWork.FineTuningLogRepo.Delete(fineTuningLog);
    //                 _unitOfWork.ScheduledModelRepo.Delete(scheduledModel);
    //                 _logger.LogInformation("Deleted FineTuningLog with ID {FineTuningHistoryId} and its associated ScheduledModel with ID {ScheduledModelId}.",
    //                     fineTuningHistoryId, scheduledModel.Id);
    //             }

    //             // Persist changes after deleting related entities
    //             if (!await _unitOfWork.SaveAsync())
    //             {
    //                 _logger.LogError("Save operation failed after deleting fine-tuning log and possibly ScheduledModel for History ID {FineTuningHistoryId}.",
    //                     fineTuningHistoryId);
    //                 return serviceResponse;
    //             }
    //         }

    //         // Return success response
    //         serviceResponse.Data = true;
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = "Fine-tuning history and associated data deleted successfully.";
    //     }
    //     catch (Exception ex)
    //     {
    //         // Log exception details for debugging
    //         _logger.LogError(ex, "An exception occurred while deleting fine-tuning history with ID {FineTuningHistoryId}.", fineTuningHistoryId);
    //     }

    //     return serviceResponse;
    // }

    // // Deletes multiple fine-tuning history records from the database based on the provided list of IDs.
    // public async Task<ServiceResponse<bool>> DeleteMultipleFineTuningDataHistoriesAsync(IEnumerable<Guid> fineTuningHistoryIds)
    // {
    //     // Initialize the service response with a failure state by default
    //     var serviceResponse = new ServiceResponse<bool>
    //     {
    //         Data = false,
    //         Message = "Failed to delete fine-tuning history records. Please try again."
    //     };

    //     try
    //     {
    //         // Check if any IDs were provided for deletion
    //         if (fineTuningHistoryIds == null || !fineTuningHistoryIds.Any())
    //         {
    //             serviceResponse.Message = "No IDs provided for deletion.";
    //             return serviceResponse;
    //         }

    //         _logger.LogInformation("Initiating batch deletion for {Count} fine-tuning history records.", fineTuningHistoryIds.Count());

    //         // Fetch all fine-tuning logs matching the provided IDs
    //         var fineTuningLogs = await _unitOfWork.FineTuningLogRepo
    //             .GetByConditionAsync(w => fineTuningHistoryIds.Contains(w.Id))
    //             .ToListAsync();

    //         // If no logs were found, return a message
    //         if (!fineTuningLogs.Any())
    //         {
    //             _logger.LogWarning("No fine-tuning history records found for the provided IDs.");
    //             serviceResponse.Message = "No matching fine-tuning history records found.";
    //             return serviceResponse;
    //         }

    //         // Check if all fine-tuning logs are in the 'Scheduled' status
    //         var logsNotScheduled = fineTuningLogs.Where(log => log.Status != ScheduleTypesEnum.Scheduled).ToList();

    //         // If any fine-tuning log is not in 'Scheduled' status, prevent deletion and notify the user
    //         if (logsNotScheduled.Any())
    //         {
    //             var nonScheduledIds = logsNotScheduled.Select(log => log.Id).ToList();
    //             _logger.LogWarning("Deletion failed for FineTuningLogs with IDs {NonScheduledIds} due to non-Scheduled status.",
    //                 string.Join(", ", nonScheduledIds));
    //             serviceResponse.Message = "Some fine-tuning history records are not in 'Scheduled' status and cannot be deleted.";
    //             return serviceResponse;
    //         }

    //         // Get all related scheduled models for the fetched fine-tuning logs
    //         var scheduledModelIds = fineTuningLogs
    //             .Select(s => s.ScheduledModelId)
    //             .Distinct()
    //             .ToList();

    //         // Fetch all scheduled models associated with the fine-tuning logs
    //         var scheduledModels = await _unitOfWork.ScheduledModelRepo
    //             .GetByConditionAsync(w => scheduledModelIds.Contains(w.Id))
    //             .Include(i => i.FineTuningLogs) // Include fine-tuning logs related to scheduled models
    //             .ToListAsync();

    //         // Iterate through the scheduled models and delete associated fine-tuning logs and models
    //         foreach (var scheduledModel in scheduledModels)
    //         {
    //             // Remove all associated fine-tuning logs from the scheduled model
    //             if (scheduledModel.FineTuningLogs.Any())
    //             {
    //                 _unitOfWork.FineTuningLogRepo.Delete(scheduledModel.FineTuningLogs);
    //             }

    //             // Delete the scheduled model itself
    //             _unitOfWork.ScheduledModelRepo.Delete(scheduledModel);
    //         }

    //         // Save all changes after deletions (both fine-tuning logs and scheduled models)
    //         if (!await _unitOfWork.SaveAsync())
    //         {
    //             _logger.LogError("Save operation failed while deleting fine-tuning history and scheduled model records.");
    //             return serviceResponse;
    //         }

    //         // Log success and update service response
    //         _logger.LogInformation("Successfully deleted {Count} fine-tuning history records and their associated scheduled models.", fineTuningLogs.Count);

    //         serviceResponse.Data = true;
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = "Selected fine-tuning history records and related scheduled models deleted successfully.";
    //     }
    //     catch (Exception ex)
    //     {
    //         // Log any exception that occurs during the process
    //         _logger.LogError(ex, "An exception occurred while deleting multiple fine-tuning history records.");
    //     }

    //     return serviceResponse;
    // }

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
                fieldInstruction.AppendLine($"{field.Index}. {field.Name} (type: {field.Type}){instructions}");
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
                tableInstruction.AppendLine($"{table.Index}. Table name: {table.Name}{(string.IsNullOrEmpty(table.Context) ? "" : $", context - {table.Context}")}");

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
                        tableInstruction.AppendLine($"{column.Index}. {column.Name} (type: {column.Type}){instructions}");
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
                        // Replace the placeholders {{Prompt}}, {{Context}}, and {{OutputFormat}} in the template with the respective sections
                        {"{{Prompt}}", defaultPrompt.Replace("\n","").ToString()  },
                        //{"{{Context}}", mlModelSetupDto.SetupObject.Context },
                    }
                );

        // Return the final generated prompt after replacing newline characters and returning the string
        return generatedPrompt.Replace("\n", "").ToString();
    }


    // Converts machine learning model tasks into a list of <see cref="InferencingModelTaskDto"/>, including deserialization of task-specific configuration (SetupObject) based on task type.
    private List<InferencingModelTaskDto> GetInferencingModelTask(MLModel mlModel)
    {
        var inferencingModelDtos = new List<InferencingModelTaskDto>();

        // Check for null or empty task list
        if (mlModel?.Tasks == null || !mlModel.Tasks.Any())
        {
            _logger.LogInformation("No tasks found in the ML model with ID: {ModelId}. Returning empty result.", mlModel?.Id);
            return inferencingModelDtos;
        }

        // Process each task in the ML model
        foreach (var modelTask in mlModel.Tasks)
        {
            try
            {
                // Adapt task to base DTO
                var inferencingTaskDto = modelTask.Adapt<InferencingModelTaskDto>();
                _logger.LogDebug("Adapting task '{TaskName}' to InferencingModelTaskDto.", modelTask.Name);

                // Deserialize task-specific setup object
                PopulateTaskSpecificDto(inferencingTaskDto, modelTask);

                inferencingModelDtos.Add(inferencingTaskDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while processing task '{TaskName}' from ML model ID: {ModelId}. Skipping this task.", modelTask?.Name, mlModel?.Id);
            }
        }

        return inferencingModelDtos;
    }

    // Deserializes the SetupObject JSON from the ML task into the appropriate task-specific DTO, based on the task type.
    private void PopulateTaskSpecificDto(InferencingModelTaskDto taskDto, ModelTask modelTask)
    {
        // Configure JSON deserialization to be case-insensitive
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        try
        {
            // Determine task type and deserialize the SetupObject into the corresponding DTO
            switch (taskDto.Name)
            {
                case nameof(InferencingModelTypesEnum.Extraction):
                    taskDto.Extraction = JsonSerializer.Deserialize<ExtractionTaskDto>(modelTask.SetupObject, jsonOptions);
                    _logger.LogDebug("Deserialized ExtractionTaskDto for task '{TaskName}'.", modelTask.Name);
                    break;

                case nameof(InferencingModelTypesEnum.QuestionAnswer):
                    taskDto.QuestionAnswer = JsonSerializer.Deserialize<QuestionAnswerTaskDto>(modelTask.SetupObject, jsonOptions);
                    _logger.LogDebug("Deserialized QuestionAnswerTaskDto for task '{TaskName}'.", modelTask.Name);
                    break;

                case nameof(InferencingModelTypesEnum.SentimentAnalysis):
                    taskDto.SentimentAnalytics = JsonSerializer.Deserialize<SentimentAnalyticTaskDto>(modelTask.SetupObject, jsonOptions);
                    _logger.LogDebug("Deserialized SentimentAnalysisTaskDto for task '{TaskName}'.", modelTask.Name);
                    break;

                case nameof(InferencingModelTypesEnum.Classification):
                    taskDto.Classification = JsonSerializer.Deserialize<ClassificationTaskDto>(modelTask.SetupObject, jsonOptions);
                    _logger.LogDebug("Deserialized ClassificationTaskDto for task '{TaskName}'.", modelTask.Name);
                    break;

                case nameof(InferencingModelTypesEnum.Summarization):
                    taskDto.Summarization = JsonSerializer.Deserialize<SummarizationTaskDto>(modelTask.SetupObject, jsonOptions);
                    _logger.LogDebug("Deserialized SummarizationTaskDto for task '{TaskName}'.", modelTask.Name);
                    break;

                default:
                    _logger.LogWarning("Unknown task type '{TaskType}' for task '{TaskName}'. No deserialization performed.", taskDto.Name, modelTask.Name);
                    break;
            }
        }
        catch (JsonException jsonEx)
        {
            // Log JSON deserialization-specific errors
            _logger.LogError(jsonEx, "Failed to deserialize SetupObject for task '{TaskName}'. JSON content: {SetupObject}", modelTask.Name, modelTask.SetupObject);
        }
        catch (Exception ex)
        {
            // Log any other unexpected errors
            _logger.LogError(ex, "Unexpected error while deserializing SetupObject for task '{TaskName}'.", modelTask.Name);
        }
    }
    // Serializes the setup object from the task DTO into a JSON string based on the task type.
    private string? SerializeSetupObject(InferencingModelTaskDto modelSetupTask)
    {
        // Configure JSON serialization options
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        object? setupObject = null;

        // Determine the correct setup object based on the task name (model type)
        switch (modelSetupTask.Name)
        {
            case nameof(InferencingModelTypesEnum.Extraction):
                setupObject = modelSetupTask.Extraction;
                break;

            case nameof(InferencingModelTypesEnum.Summarization):
                setupObject = modelSetupTask.Summarization;
                break;

            case nameof(InferencingModelTypesEnum.Classification):
                setupObject = modelSetupTask.Classification;
                break;

            case nameof(InferencingModelTypesEnum.SentimentAnalysis):
                setupObject = modelSetupTask.SentimentAnalytics;
                break;

            case nameof(InferencingModelTypesEnum.QuestionAnswer):
                setupObject = modelSetupTask.QuestionAnswer;
                break;

            default:
                _logger.LogInformation("No matching setup object found for task type '{TaskName}'. Defaulting to null.", modelSetupTask.Name);
                break;
        }

        // Return the serialized JSON string or null if no object matched
        return JsonSerializer.Serialize(setupObject, options);
    }

    // Validates the input model setup DTO and its associated tasks.
    private bool ValidateModelSetupDto(InferencingModelDto modelSetupDto, out string? validationMessage)
    {
        validationMessage = null;
        string? detailedMessage = null;

        _logger.LogInformation("Starting validation for InferencingModelDto.");

        // Ensure the required top-level field is present
        if (string.IsNullOrWhiteSpace(modelSetupDto.BusinessContext))
        {
            detailedMessage = "BusinessContext is required.";
        }
        // Proceed only if there are tasks to validate
        else if (modelSetupDto.ModelTasks != null && modelSetupDto.ModelTasks.Any())
        {
            var validModelTypeNames = Enum.GetNames(typeof(InferencingModelTypesEnum)).ToList();

            foreach (var task in modelSetupDto.ModelTasks)
            {
                // Ensure task name is provided
                if (string.IsNullOrWhiteSpace(task.Name))
                {
                    detailedMessage = "Each task must have a Name.";
                    break;
                }

                // Validate that the task name corresponds to a known model type
                if (!validModelTypeNames.Contains(task.Name))
                {
                    detailedMessage = $"Task name '{task.Name}' is not a recognized inferencing model type.";
                    break;
                }

                // If using Cloud configuration, SecretKey is mandatory
                if (task.ConfigurationType == LLMConfigurationTypesEnum.Cloud && string.IsNullOrEmpty(task.SecretKey))
                {
                    detailedMessage = $"Task '{task.Name}' is configured for Cloud but missing a required SecretKey.";
                    break;
                }

                // Attempt to parse the task name into an enum value
                if (!Enum.TryParse(task.Name, out InferencingModelTypesEnum modelType))
                {
                    detailedMessage = $"Unable to parse task name '{task.Name}' into a valid model type.";
                    break;
                }

                // TODO: Add model-type-specific validations here as needed
                /*
                switch (modelType)
                {
                    case InferencingModelTypesEnum.Extraction:
                        if (task.ExtractionTask?.Fields == null || !task.ExtractionTask.Fields.Any())
                        {
                            detailedMessage = $"Extraction task '{task.Name}' requires at least one field.";
                            break;
                        }
                        break;

                    // Additional case validations...
                }
                */

                if (detailedMessage != null)
                    break;
            }
        }

        if (detailedMessage != null)
        {
            _logger.LogWarning("Validation failed for InferencingModelDto: {ErrorDetail}", detailedMessage);
            validationMessage = detailedMessage;
            return false;
        }

        _logger.LogInformation("InferencingModelDto passed validation.");
        return true;
    }
}

