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
            GetInferencingModelSetup(mlModel, inferencingModelDto);

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
            // // Validate input DTO
            // if (!ValidateModelSetupDto(modelSetupDto, out string? validationMessage))
            // {
            //     _logger.LogWarning("Model setup validation failed: {ValidationMessage}", validationMessage);
            //     serviceResponse.Message = validationMessage;
            //     return serviceResponse;
            // }

            _logger.LogInformation("Starting update for model setup | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);

            // Fetch the model including associated tasks
            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == modelSetupDto.Id)
                .Include(i => i.Tasks)
                .AsNoTracking()
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
            mlModel.Type = ModelTypesEnum.Inferencing;
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
            var tasksToBeDeleted = new List<ModelTask>();

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            foreach (var task in mlModel.Tasks.ToList())
            {
                // Use a dictionary to map task names to corresponding properties in modelSetupDto
                var taskPropertyMappings = new Dictionary<string, object?>
                {
                    { nameof(InferencingModelTypesEnum.Extraction), modelSetupDto.Extraction },
                    { nameof(InferencingModelTypesEnum.Classification), modelSetupDto.Classification },
                    { nameof(InferencingModelTypesEnum.Summarization), modelSetupDto.Summarization },
                    { nameof(InferencingModelTypesEnum.SentimentAnalytics), modelSetupDto.SentimentAnalytics },
                    { nameof(InferencingModelTypesEnum.QuestionAnswer), modelSetupDto.QuestionAnswer }
                };

                // Check if the task should be deleted
                if (taskPropertyMappings.ContainsKey(task.Name) && taskPropertyMappings[task.Name] == null)
                {
                    tasksToBeDeleted.Add(task);
                }
            }

            if (modelSetupDto.Extraction != null)
            {
                var existingTask = mlModel.Tasks.FirstOrDefault(t => t.Name == modelSetupDto.Extraction.Name);
                if (existingTask == null)
                {
                    // Task does not exist — create a new task entity from the DTO
                    var newTask = modelSetupDto.Extraction.Adapt<ModelTask>();
                    newTask.MLModelId = mlModel.Id;
                    newTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.Extraction.SetupObject, options);
                    newTask.CreatedByUserId = _userId;
                    newTask.LastModifiedByUserId = _userId;

                    tasksToBeAdded.Add(newTask);
                }
                else
                {
                    // Task already exists — update its properties from the DTO
                    modelSetupDto.Extraction.Adapt(existingTask);
                    existingTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.Extraction.SetupObject, options);
                    existingTask.LastModifiedByUserId = _userId;

                    tasksToBeUpdated.Add(existingTask);
                }
            }

            if (modelSetupDto.Classification != null)
            {
                var existingTask = mlModel.Tasks.FirstOrDefault(t => t.Name == modelSetupDto.Classification.Name);
                if (existingTask == null)
                {
                    // Task does not exist — create a new task entity from the DTO
                    var newTask = modelSetupDto.Classification.Adapt<ModelTask>();
                    newTask.MLModelId = mlModel.Id;
                    newTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.Classification.SetupObject, options);
                    newTask.CreatedByUserId = _userId;
                    newTask.LastModifiedByUserId = _userId;

                    tasksToBeAdded.Add(newTask);
                }
                else
                {
                    // Task already exists — update its properties from the DTO
                    modelSetupDto.Classification.Adapt(existingTask);
                    existingTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.Classification.SetupObject, options);
                    existingTask.LastModifiedByUserId = _userId;

                    tasksToBeUpdated.Add(existingTask);
                }
            }

            if (modelSetupDto.SentimentAnalytics != null)
            {
                var existingTask = mlModel.Tasks.FirstOrDefault(t => t.Name == modelSetupDto.SentimentAnalytics.Name);
                if (existingTask == null)
                {
                    // Task does not exist — create a new task entity from the DTO
                    var newTask = modelSetupDto.SentimentAnalytics.Adapt<ModelTask>();
                    newTask.MLModelId = mlModel.Id;
                    newTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.SentimentAnalytics.SetupObject, options);
                    newTask.CreatedByUserId = _userId;
                    newTask.LastModifiedByUserId = _userId;

                    tasksToBeAdded.Add(newTask);
                }
                else
                {
                    // Task already exists — update its properties from the DTO
                    modelSetupDto.SentimentAnalytics.Adapt(existingTask);
                    existingTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.SentimentAnalytics.SetupObject, options);
                    existingTask.LastModifiedByUserId = _userId;

                    tasksToBeUpdated.Add(existingTask);
                }
            }

            if (modelSetupDto.QuestionAnswer != null)
            {
                var existingTask = mlModel.Tasks.FirstOrDefault(t => t.Name == modelSetupDto.QuestionAnswer.Name);
                if (existingTask == null)
                {
                    // Task does not exist — create a new task entity from the DTO
                    var newTask = modelSetupDto.QuestionAnswer.Adapt<ModelTask>();
                    newTask.MLModelId = mlModel.Id;
                    newTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.QuestionAnswer.SetupObject, options);
                    newTask.CreatedByUserId = _userId;
                    newTask.LastModifiedByUserId = _userId;

                    tasksToBeAdded.Add(newTask);
                }
                else
                {
                    // Task already exists — update its properties from the DTO
                    modelSetupDto.QuestionAnswer.Adapt(existingTask);
                    existingTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.QuestionAnswer.SetupObject, options);
                    existingTask.LastModifiedByUserId = _userId;

                    tasksToBeUpdated.Add(existingTask);
                }
            }

            if (modelSetupDto.Summarization != null)
            {
                var existingTask = mlModel.Tasks.FirstOrDefault(t => t.Name == modelSetupDto.Summarization.Name);
                if (existingTask == null)
                {
                    // Task does not exist — create a new task entity from the DTO
                    var newTask = modelSetupDto.Summarization.Adapt<ModelTask>();
                    newTask.MLModelId = mlModel.Id;
                    newTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.Summarization.SetupObject, options);
                    newTask.CreatedByUserId = _userId;
                    newTask.LastModifiedByUserId = _userId;

                    tasksToBeAdded.Add(newTask);
                }
                else
                {
                    // Task already exists — update its properties from the DTO
                    modelSetupDto.Summarization.Adapt(existingTask);
                    existingTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.Summarization.SetupObject, options);
                    existingTask.LastModifiedByUserId = _userId;

                    tasksToBeUpdated.Add(existingTask);
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

    // Extracts data using a Language Learning Model (LLM).
    public async Task<ServiceResponse<InferencingModelResponseDto>> ExecuteLLMByFileIdsAsync(ModelExecutionRequestDto modelExecutionRequestDto)
    {
        // Initialize the response with a default failure message
        var serviceResponse = new ServiceResponse<InferencingModelResponseDto>
        {
            Data = null,
            Message = "Failed to execute via LLM. Please try again."
        };

        try
        {
            _logger.LogInformation("Starting execution by file IDs for ModelId: {ModelId}", modelExecutionRequestDto.ModelId);

            // Retrieve the ML model and related data including tasks, extracted data, and uploaded documents
            var model = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == modelExecutionRequestDto.ModelId)
                .Include(i => i.Tasks)
                .Include(i => i.ExtractedData)
                .Include(i => i.UploadedDocs)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Return early if the model is not found
            if (model == null)
            {
                _logger.LogWarning("Model not found for ModelId: {ModelId}", modelExecutionRequestDto.ModelId);
                serviceResponse.Message = "Model not found";
                return serviceResponse;
            }

            // Prepare collections to hold extracted data results and database operations
            var extractedDataList = new List<InferencingModelTaskResponseDto>();
            var extractedDataToInsert = new List<ExtractedData>();
            var extractedDataToUpdate = new List<ExtractedData>();

            // Process each task associated with the model
            foreach (var modelTask in model.Tasks.ToList())
            {
                _logger.LogInformation("Processing task {TaskId} with {FileCount} files for ModelId: {ModelId}", modelTask.Id, modelExecutionRequestDto.FileIds.Count, model.Id);

                // Process each file specified in the request
                foreach (var fileId in modelExecutionRequestDto.FileIds)
                {
                    // Extract data for the current file and task
                    var (documentExtractionData, newExtractedData, updatedExtractedData) = await ProcessFileAsync(model, modelTask, fileId);

                    // Collect the extraction result for the response
                    extractedDataList.Add(documentExtractionData);

                    // Prepare new extracted data records for insertion
                    if (newExtractedData != null)
                    {
                        extractedDataToInsert.Add(newExtractedData);
                    }
                    // Prepare existing extracted data records for update
                    if (updatedExtractedData != null)
                    {
                        extractedDataToUpdate.Add(updatedExtractedData);
                    }
                }
            }

            // Insert new extracted data records in bulk if any
            if (extractedDataToInsert.Any())
            {
                _logger.LogInformation("Inserting {Count} new extracted data records.", extractedDataToInsert.Count);
                await _unitOfWork.ExtractedDataRepo.InsertAsync(extractedDataToInsert);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save new extracted data to the database.");
                }
                else
                {
                    _logger.LogInformation("New extracted data records saved successfully.");
                }
            }

            // Update existing extracted data records in bulk if any
            if (extractedDataToUpdate.Any())
            {
                _logger.LogInformation("Updating {Count} existing extracted data records.", extractedDataToUpdate.Count);
                _unitOfWork.ExtractedDataRepo.Update(extractedDataToUpdate);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save updated extracted data to the database.");
                }
                else
                {
                    _logger.LogInformation("Existing extracted data records updated successfully.");
                }
            }

            // Prepare the successful response including the list of extraction results
            serviceResponse.Data = new InferencingModelResponseDto
            {
                ModelId = modelExecutionRequestDto.ModelId,
                ExtractedData = extractedDataList
            };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = extractedDataList.Any(d => d.Remarks.Contains("Failed"))
                ? "Failed to extract data for one or more files"
                : "Data extracted successfully";

            _logger.LogInformation("Extraction process completed for ModelId: {ModelId}. Summary: {Message}", modelExecutionRequestDto.ModelId, serviceResponse.Message);
        }
        catch (Exception ex)
        {
            // Log any unexpected exceptions during processing
            _logger.LogError(ex, "An exception occurred during the extraction process for ModelId: {ModelId}", modelExecutionRequestDto.ModelId);
        }

        // Return the service response, either success or failure
        return serviceResponse;
    }

    private async Task<(InferencingModelTaskResponseDto DocumentExtractionData, ExtractedData? NewExtractedData, ExtractedData? UpdatedExtractedData)> ProcessFileAsync(
        MLModel model,
        ModelTask modelTask,
        Guid fileId)
    {
        _logger.LogInformation("Starting extraction for DocumentId: {DocumentId} in ModelId: {ModelId}, TaskId: {TaskId}", fileId, model.Id, modelTask.Id);

        var existingData = model.ExtractedData.FirstOrDefault(d => d.DocId == fileId);
        var documentExtractionData = new InferencingModelTaskResponseDto
        {
            ExecutionCount = 0,
            FailedCount = 0,
            TokenCount = 0,
            ExecutionTime = 0,
            FileId = fileId,
            Remarks = $"001: Extraction failed for DocumentId: {fileId}."
        };

        var document = model.UploadedDocs.FirstOrDefault(d => d.Id == fileId);
        if (document == null)
        {
            _logger.LogWarning("Document not found for DocumentId: {DocumentId}", fileId);
            documentExtractionData.Remarks = $"002: Document not found with ID: {fileId}.";
            return (documentExtractionData, null, null);
        }

        if (string.IsNullOrEmpty(document.Path))
        {
            _logger.LogWarning("Missing file path for DocumentId: {DocumentId}", fileId);
            documentExtractionData.Remarks = "Document file path is missing.";
            return (documentExtractionData, null, null);
        }

        var documentText = await _llmDataExtractionService.GetFileTextAsync(document.Path);
        if (string.IsNullOrEmpty(documentText))
        {
            _logger.LogWarning("Failed to extract text for DocumentId: {DocumentId} at path: {Path}", fileId, document.Path);
            documentExtractionData.Remarks = "Failed to extract text from the document.";
            return (documentExtractionData, null, null);
        }

        documentExtractionData = await CallLLMAndProcessResponseAsync(modelTask, documentText, documentExtractionData);

        string? dataObject = null;

        if (existingData == null)
        {
            var newExtracted = new ExtractedData
            {
                DocId = fileId,
                Type = document.Type,
                MLModelId = model.Id,
                TokenCount = documentExtractionData.TokenCount,
                ExecutionCount = documentExtractionData.ExecutionCount,
                ExecutionTime = documentExtractionData.ExecutionTime,
                FailedCount = documentExtractionData.FailedCount,
                DataObject = dataObject,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId
            };

            _logger.LogInformation("Created new extracted data record for DocumentId: {DocumentId}", fileId);
            return (documentExtractionData, newExtracted, null);
        }
        else
        {
            existingData.DataObject = dataObject;
            existingData.ExecutionCount = existingData.ExecutionCount;
            existingData.FailedCount = existingData.FailedCount;
            existingData.TokenCount = existingData.TokenCount;
            existingData.ExecutionTime = documentExtractionData.ExecutionTime;
            existingData.LastModifiedByUserId = _userId;

            _logger.LogInformation("Updated existing extracted data record for DocumentId: {DocumentId}", fileId);
            return (documentExtractionData, null, existingData);
        }
    }

    private async Task<InferencingModelTaskResponseDto> CallLLMAndProcessResponseAsync(ModelTask modelTask, string fileContent, InferencingModelTaskResponseDto documentExtractionData)
    {
        // Generate the prompt by replacing placeholders with actual content
        // var outputFormatJson = JsonSerializer.Serialize(outputFormat, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        var prompt = modelTask.GeneratedPrompt.Replace("{{FileContent}}", fileContent);
        // .Replace("{{OutputFormat}}", outputFormatJson);

        // Log the generated prompt for debugging
        _logger.LogDebug("Sending prompt to LLM: {Prompt}", prompt);

        var startTime = DateTime.UtcNow;

        // Call the LLM service to extract data
        var llmResponse = await _llmDataExtractionService.ExtractDataAsync(prompt, modelTask.LLM, modelTask.Temperature);

        var endTime = DateTime.UtcNow;
        var executionSeconds = (int)Math.Ceiling((endTime - startTime).TotalSeconds);

        // Log the LLM response status and execution time
        _logger.LogDebug("LLM response for prompt status: {ResponseStatus}, Execution Time: {ExecutionTime}s", llmResponse.StatusCode, executionSeconds);

        // If LLM response is not successful, log the error and return a failed response
        if (llmResponse.StatusCode != 200 || string.IsNullOrEmpty(llmResponse.Data))
        {
            _logger.LogWarning("LLM extraction failed for the document with error message: {Message}", llmResponse.Message);

            documentExtractionData.ExecutionTime = executionSeconds;
            documentExtractionData.FailedCount = 1;
            return documentExtractionData;
        }

        // Deserialize the LLM response to the specific output format
        try
        {
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            switch (modelTask.Name)
            {
                case nameof(InferencingModelTypesEnum.Extraction):
                    documentExtractionData.Extraction = JsonSerializer.Deserialize<ExtractionTaskExtractedDataDto>(llmResponse.Data, options);
                    break;

                case nameof(InferencingModelTypesEnum.Summarization):
                    documentExtractionData.Summarization = JsonSerializer.Deserialize<SummarizationTaskExtractedDataDto>(llmResponse.Data, options);
                    break;

                case nameof(InferencingModelTypesEnum.QuestionAnswer):
                    documentExtractionData.QuestionAnswer = JsonSerializer.Deserialize<List<QuestionAnswerTaskExtractedDataDto>>(llmResponse.Data, options);
                    break;

                case nameof(InferencingModelTypesEnum.SentimentAnalytics):
                    documentExtractionData.SentimentAnalytics = JsonSerializer.Deserialize<List<SentimentAnalysisExtractedDataDto>>(llmResponse.Data, options);
                    break;

                case nameof(InferencingModelTypesEnum.Classification):
                    documentExtractionData.Classification = JsonSerializer.Deserialize<List<ClassificationTaskExtractedDataDto>>(llmResponse.Data, options);
                    break;

                default:
                    _logger.LogWarning("Unhandled task type: {TaskName}", modelTask.Name);
                    break;
            }

            _logger.LogInformation("Successfully deserialized LLM response data.");

            // Return the deserialized response
            documentExtractionData.ExecutionTime = executionSeconds;
            documentExtractionData.ExecutionCount = 1;
            return documentExtractionData;
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to deserialize LLM response data.");
            documentExtractionData.ExecutionTime = executionSeconds;
            documentExtractionData.FailedCount = 1;
            return documentExtractionData;
        }
    }


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

    // Maps tasks from an ML model to the appropriate properties in the InferencingModelDto. Each task is deserialized based on its type into a strongly-typed DTO.
    private void GetInferencingModelSetup(MLModel mlModel, InferencingModelDto inferencingModelDto)
    {
        // Exit early if the ML model or its tasks list is null or empty
        if (mlModel?.Tasks == null || !mlModel.Tasks.Any())
            return;

        // Configure JSON deserialization to ignore case sensitivity in property names
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        // Iterate over each task in the ML model
        foreach (var mlTask in mlModel.Tasks)
        {
            // Determine the type of task and deserialize accordingly
            switch (mlTask.Name)
            {
                case nameof(InferencingModelTypesEnum.Extraction):
                    var extractionDto = new ExtractionTaskDto
                    {
                        Id = mlTask.Id,
                        Name = mlTask.Name,
                        SetupObject = JsonSerializer.Deserialize<ExtractionTaskSetupDto>(mlTask.SetupObject ?? null, jsonOptions),
                        LLM = mlTask.LLM,
                        ConfigurationType = mlTask.ConfigurationType,
                        NodePrompt = mlTask.NodePrompt,
                        Temperature = mlTask.Temperature
                    };
                    inferencingModelDto.Extraction = extractionDto;
                    break;

                case nameof(InferencingModelTypesEnum.Classification):
                    var classificationDto = new ClassificationTaskDto
                    {
                        Id = mlTask.Id,
                        Name = mlTask.Name,
                        SetupObject = JsonSerializer.Deserialize<ClassificationTaskSetupDto>(mlTask.SetupObject ?? null, jsonOptions),
                        LLM = mlTask.LLM,
                        ConfigurationType = mlTask.ConfigurationType,
                        NodePrompt = mlTask.NodePrompt,
                        Temperature = mlTask.Temperature
                    };
                    inferencingModelDto.Classification = classificationDto;
                    break;

                case nameof(InferencingModelTypesEnum.SentimentAnalytics):
                    var sentimentDto = new SentimentAnalyticsTaskSDto
                    {
                        Id = mlTask.Id,
                        Name = mlTask.Name,
                        SetupObject = JsonSerializer.Deserialize<SentimentAnalyticsTaskSetupDto>(mlTask.SetupObject ?? null, jsonOptions),
                        LLM = mlTask.LLM,
                        ConfigurationType = mlTask.ConfigurationType,
                        NodePrompt = mlTask.NodePrompt,
                        Temperature = mlTask.Temperature
                    };
                    inferencingModelDto.SentimentAnalytics = sentimentDto;
                    break;

                case nameof(InferencingModelTypesEnum.QuestionAnswer):
                    var questionAnswerDto = new QuestionAnswerTaskDto
                    {
                        Id = mlTask.Id,
                        Name = mlTask.Name,
                        SetupObject = JsonSerializer.Deserialize<QuestionAnswerTaskSetupDto>(mlTask.SetupObject ?? null, jsonOptions),
                        LLM = mlTask.LLM,
                        ConfigurationType = mlTask.ConfigurationType,
                        NodePrompt = mlTask.NodePrompt,
                        Temperature = mlTask.Temperature
                    };
                    inferencingModelDto.QuestionAnswer = questionAnswerDto;
                    break;

                case nameof(InferencingModelTypesEnum.Summarization):
                    var summarizationDto = new SummarizationTaskDto
                    {
                        Id = mlTask.Id,
                        Name = mlTask.Name,
                        SetupObject = JsonSerializer.Deserialize<SummarizationTaskSetupDto>(mlTask.SetupObject ?? null, jsonOptions),
                        LLM = mlTask.LLM,
                        ConfigurationType = mlTask.ConfigurationType,
                        NodePrompt = mlTask.NodePrompt,
                        Temperature = mlTask.Temperature
                    };
                    inferencingModelDto.Summarization = summarizationDto;
                    break;

                default:
                    // Log a warning for unknown or unsupported task types
                    _logger.LogWarning("Unknown task name encountered during deserialization: {TaskName}", mlTask.Name);
                    break;
            }
        }
    }
}

