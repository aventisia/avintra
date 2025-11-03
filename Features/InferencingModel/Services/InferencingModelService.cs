namespace MLModelBuilderAPIs.Services;

public class InferencingModelService : IInferencingModelService
{
    private readonly ILogger<InferencingModelService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILLMDataExtractionService _llmDataExtractionService;
    private readonly FileUploadConfig _fileUploadConfig;
    private readonly Guid _userId;

    public InferencingModelService(
        ILogger<InferencingModelService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ILLMDataExtractionService llmDataExtractionService,
        FileUploadConfig fileUploadConfig)
    {
        // Retrieve the user ID from the HTTP context and initialize the logger and unit of work
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _llmDataExtractionService = llmDataExtractionService;
        _fileUploadConfig = fileUploadConfig;
    }

    // Gets the model setup for a specific AI Project using its unique AI Project ID.
    public async Task<ServiceResponse<InferencingModelDto>> GetAIProjectSetupAsync(Guid aiProjectId, Guid? aiProjectVersionId)
    {
        // Initialize the response with a failure state and default message
        var serviceResponse = new ServiceResponse<InferencingModelDto>
        {
            Data = null,
            Message = "Failed to retrieve the AI project setup. Please try again later."
        };

        try
        {
            // Log the beginning of the retrieval process with the AI project ID
            _logger.LogInformation("Attempting to retrieve AI project setup for AI project with ID: {AIProjectId}", aiProjectId);

            // Fetch the AI project setup from the database by its AI project ID, including related user and task data
            var aiProject = await _unitOfWork.AIProjectRepo
                .GetByConditionAsync(w =>
                    w.Id == aiProjectId &&
                    (
                        w.CreatedByUserId == _userId ||
                        (w.ProjectUsers != null && w.ProjectUsers.Any(a => a.UserId == _userId))
                    )
                )
                .Include(i => i.CreatedByUser)
                .Include(i => i.ProjectUsers)
                .Include(i => i.Versions!)
                .ThenInclude(i2 => i2.Tasks)
                .SingleOrDefaultAsync();

            // If no AI project setup is found, log a warning and return an appropriate message
            if (aiProject == null)
            {
                _logger.LogWarning("No AI project setup found for AI project with ID: {AIProjectId}", aiProjectId);
                serviceResponse.Message = "No AI project setup exists for the provided AI project ID.";
                return serviceResponse;
            }

            // Log the successful retrieval of the AI project setup
            _logger.LogInformation("Successfully retrieved AI project setup for AI project with ID: {AIProjectId}", aiProjectId);

            // Adapt the retrieved AI project to the corresponding DTO (Data Transfer Object)
            var aiProjectDto = aiProject.Adapt<InferencingModelDto>();

            // Get the AI project version, either by version ID or the latest one
            AIProjectVersion? aiProjectVersion = null;
            if (aiProjectVersionId.HasValue)
                aiProjectVersion = aiProject.Versions.FirstOrDefault(w => w.Id == aiProjectVersionId.Value);
            else
                aiProjectVersion = aiProject.Versions.OrderByDescending(o => o.VersionNumber).FirstOrDefault();

            aiProjectDto.AIProjectVersionId = aiProjectVersion?.Id ?? Guid.Empty;
            aiProjectDto.BusinessContext = aiProjectVersion?.BusinessContext ?? string.Empty;

            var versionTaskList = aiProjectVersion?.Tasks.ToList() ?? new List<VersionTask>();

            // Retrieve the list of inferencing tasks and add it to the AI project DTO
            // This will populate the ModelTasks property with specific task details
            GetInferencingModelSetup(versionTaskList, aiProjectDto);

            // Map the adapted project setup (including tasks) to the response DTO
            serviceResponse.Data = aiProjectDto;

            // Set the success response status and message
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI project setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log the exception details if an error occurs during the process
            _logger.LogError("Error occurred while retrieving AI project setup for AI project with ID: {AIProjectId}. Exception: {ExceptionMessage}", aiProjectId, ex.Message);
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
            var mlModel = await _unitOfWork.AIProjectRepo
                .GetByConditionAsync(w =>
                    w.Id == modelSetupDto.Id &&
                    (
                        w.CreatedByUserId == _userId ||
                        (w.ProjectUsers != null && w.ProjectUsers.Any(a => a.UserId == _userId))
                    )
                )
                .Include(i => i.ProjectUsers)
                .Include(i => i.Versions!)
                .ThenInclude(i2 => i2.Tasks)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // If model not found
            if (mlModel == null)
            {
                _logger.LogWarning("Model not found | ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
                serviceResponse.Message = "Model not found.";
                return serviceResponse;
            }

            // Check if the user is the creator or has the required access (Owner/Edit)
            var modelUserAccess = mlModel.ProjectUsers?.FirstOrDefault(w =>
                w.AIProjectId == mlModel.Id &&
                w.UserId == _userId &&
                (w.AccessType == ProjectUserAccessEnum.Owner || w.AccessType == ProjectUserAccessEnum.Edit)
            );

            // Allow access if the user is the creator, else check if they have access
            if (mlModel.CreatedByUserId != _userId && modelUserAccess == null)
            {
                _logger.LogWarning("Unauthorized update attempt on model setup | Model ID: {ModelId} | User ID: {UserId}", mlModel.Id, _userId);
                serviceResponse.Message = "You do not have access to update this model's setup.";
                return serviceResponse;
            }

            AIProjectVersion? aiProjectVersion = mlModel.Versions.FirstOrDefault(w => w.Id == modelSetupDto.AIProjectVersionId);

            // Prevent updates to published models
            if (aiProjectVersion.IsPublished)
            {
                _logger.LogWarning("Attempt to modify a published model | ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
                serviceResponse.Message = "This model is published and cannot be modified.";
                return serviceResponse;
            }

            if (aiProjectVersion.BusinessContext != modelSetupDto.BusinessContext)
            {
                aiProjectVersion.BusinessContext = modelSetupDto.BusinessContext;
                aiProjectVersion.LastModifiedByUserId = _userId;
                aiProjectVersion.LastModifiedOn = DateTimeOffset.UtcNow;

                _unitOfWork.AIProjectVersionRepo.Update(aiProjectVersion);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save model changes | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
                    return serviceResponse;
                }
            }
            // Clean up string fields in DTO
            modelSetupDto = TrimDtoStringPropsUtil.TrimDtoStringProps(modelSetupDto);

            if (mlModel.Type == null)
            {
                _logger.LogInformation("Applying DTO changes to model entity | Model ID: {Id}", modelSetupDto.Id);
                modelSetupDto.Adapt(mlModel);
                mlModel.Type = AIProjectTypeEnum.Inferencing;
                mlModel.LastModifiedByUserId = _userId;

                _logger.LogInformation("Saving model changes to database | Model ID: {Id}", modelSetupDto.Id);
                _unitOfWork.AIProjectRepo.Update(mlModel);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save model changes | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
                    return serviceResponse;
                }
            }



            // Track new and existing tasks
            var tasksToBeAdded = new List<VersionTask>();
            var tasksToBeUpdated = new List<VersionTask>();
            var tasksToBeDeleted = new List<VersionTask>();

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            foreach (var task in aiProjectVersion.Tasks.ToList())
            {
                // Use a dictionary to map task names to corresponding properties in modelSetupDto
                var taskPropertyMappings = new Dictionary<string, object?>
                {
                    { nameof(AIProjectTaskTypesEnum.Extraction), modelSetupDto.Extraction },
                    { nameof(AIProjectTaskTypesEnum.Classification), modelSetupDto.Classification },
                    { nameof(AIProjectTaskTypesEnum.Summarization), modelSetupDto.Summarization },
                    { nameof(AIProjectTaskTypesEnum.SentimentAnalytics), modelSetupDto.SentimentAnalytics },
                    { nameof(AIProjectTaskTypesEnum.QuestionAnswer), modelSetupDto.QuestionAnswer }
                };

                // Check if the task should be deleted
                if (taskPropertyMappings.ContainsKey(task.Name) && taskPropertyMappings[task.Name] == null)
                {
                    tasksToBeDeleted.Add(task);
                }
            }

            if (modelSetupDto.Extraction != null)
            {
                var existingTask = aiProjectVersion.Tasks.FirstOrDefault(t => t.Name == modelSetupDto.Extraction.Name);
                if (existingTask == null)
                {
                    // Task does not exist — create a new task entity from the DTO
                    var newTask = modelSetupDto.Extraction.Adapt<VersionTask>();
                    newTask.AIProjectId = aiProjectVersion.AIProjectId;
                    newTask.AIProjectVersionId = aiProjectVersion.Id;
                    newTask.SystemPrompt = modelSetupDto.Extraction.NodePrompt;
                    newTask.GeneratedPrompt = GenerateModelPrompt(newTask.Name, modelSetupDto);
                    newTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.Extraction.SetupObject, options);
                    newTask.CreatedByUserId = _userId;
                    newTask.LastModifiedByUserId = _userId;

                    tasksToBeAdded.Add(newTask);
                }
                else
                {
                    // Task already exists — update its properties from the DTO
                    modelSetupDto.Extraction.Adapt(existingTask);
                    existingTask.SystemPrompt = modelSetupDto.Extraction.NodePrompt;
                    existingTask.GeneratedPrompt = GenerateModelPrompt(existingTask.Name, modelSetupDto);
                    existingTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.Extraction.SetupObject, options);
                    existingTask.LastModifiedByUserId = _userId;

                    tasksToBeUpdated.Add(existingTask);
                }
            }

            if (modelSetupDto.Classification != null)
            {
                var existingTask = aiProjectVersion.Tasks.FirstOrDefault(t => t.Name == modelSetupDto.Classification.Name);
                if (existingTask == null)
                {
                    // Task does not exist — create a new task entity from the DTO
                    var newTask = modelSetupDto.Classification.Adapt<VersionTask>();
                    newTask.AIProjectId = aiProjectVersion.AIProjectId;
                    newTask.SystemPrompt = modelSetupDto.Classification.NodePrompt;
                    newTask.GeneratedPrompt = GenerateModelPrompt(newTask.Name, modelSetupDto);
                    newTask.AIProjectVersionId = aiProjectVersion.Id;
                    newTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.Classification.SetupObject, options);
                    newTask.CreatedByUserId = _userId;
                    newTask.LastModifiedByUserId = _userId;

                    tasksToBeAdded.Add(newTask);
                }
                else
                {
                    // Task already exists — update its properties from the DTO
                    modelSetupDto.Classification.Adapt(existingTask);
                    existingTask.SystemPrompt = modelSetupDto.Classification.NodePrompt;
                    existingTask.GeneratedPrompt = GenerateModelPrompt(existingTask.Name, modelSetupDto);
                    existingTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.Classification.SetupObject, options);
                    existingTask.LastModifiedByUserId = _userId;

                    tasksToBeUpdated.Add(existingTask);
                }
            }

            if (modelSetupDto.SentimentAnalytics != null)
            {
                var existingTask = aiProjectVersion.Tasks.FirstOrDefault(t => t.Name == modelSetupDto.SentimentAnalytics.Name);
                if (existingTask == null)
                {
                    // Task does not exist — create a new task entity from the DTO
                    var newTask = modelSetupDto.SentimentAnalytics.Adapt<VersionTask>();
                    newTask.AIProjectId = aiProjectVersion.AIProjectId;
                    newTask.AIProjectVersionId = aiProjectVersion.Id;
                    newTask.SystemPrompt = modelSetupDto.SentimentAnalytics.NodePrompt;
                    newTask.GeneratedPrompt = GenerateModelPrompt(newTask.Name, modelSetupDto);
                    newTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.SentimentAnalytics.SetupObject, options);
                    newTask.CreatedByUserId = _userId;
                    newTask.LastModifiedByUserId = _userId;

                    tasksToBeAdded.Add(newTask);
                }
                else
                {
                    // Task already exists — update its properties from the DTO
                    modelSetupDto.SentimentAnalytics.Adapt(existingTask);
                    existingTask.SystemPrompt = modelSetupDto.SentimentAnalytics.NodePrompt;
                    existingTask.GeneratedPrompt = GenerateModelPrompt(existingTask.Name, modelSetupDto);
                    existingTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.SentimentAnalytics.SetupObject, options);
                    existingTask.LastModifiedByUserId = _userId;

                    tasksToBeUpdated.Add(existingTask);
                }
            }

            if (modelSetupDto.QuestionAnswer != null)
            {
                var existingTask = aiProjectVersion.Tasks.FirstOrDefault(t => t.Name == modelSetupDto.QuestionAnswer.Name);
                if (existingTask == null)
                {
                    // Task does not exist — create a new task entity from the DTO
                    var newTask = modelSetupDto.QuestionAnswer.Adapt<VersionTask>();
                    newTask.AIProjectId = aiProjectVersion.AIProjectId;
                    newTask.AIProjectVersionId = aiProjectVersion.Id;
                    newTask.SystemPrompt = modelSetupDto.QuestionAnswer.NodePrompt;
                    newTask.GeneratedPrompt = GenerateModelPrompt(newTask.Name, modelSetupDto);
                    newTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.QuestionAnswer.SetupObject, options);
                    newTask.CreatedByUserId = _userId;
                    newTask.LastModifiedByUserId = _userId;

                    tasksToBeAdded.Add(newTask);
                }
                else
                {
                    // Task already exists — update its properties from the DTO
                    modelSetupDto.QuestionAnswer.Adapt(existingTask);
                    existingTask.SystemPrompt = modelSetupDto.QuestionAnswer.NodePrompt;
                    existingTask.GeneratedPrompt = GenerateModelPrompt(existingTask.Name, modelSetupDto);
                    existingTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.QuestionAnswer.SetupObject, options);
                    existingTask.LastModifiedByUserId = _userId;

                    tasksToBeUpdated.Add(existingTask);
                }
            }

            if (modelSetupDto.Summarization != null)
            {
                var existingTask = aiProjectVersion.Tasks.FirstOrDefault(t => t.Name == modelSetupDto.Summarization.Name);
                if (existingTask == null)
                {
                    // Task does not exist — create a new task entity from the DTO
                    var newTask = modelSetupDto.Summarization.Adapt<VersionTask>();
                    newTask.AIProjectId = aiProjectVersion.AIProjectId;
                    newTask.AIProjectVersionId = aiProjectVersion.Id;
                    newTask.SystemPrompt = modelSetupDto.Summarization.NodePrompt;
                    newTask.GeneratedPrompt = GenerateModelPrompt(newTask.Name, modelSetupDto);
                    newTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.Summarization.SetupObject, options);
                    newTask.CreatedByUserId = _userId;
                    newTask.LastModifiedByUserId = _userId;

                    tasksToBeAdded.Add(newTask);
                }
                else
                {
                    // Task already exists — update its properties from the DTO
                    modelSetupDto.Summarization.Adapt(existingTask);
                    existingTask.GeneratedPrompt = GenerateModelPrompt(existingTask.Name, modelSetupDto);
                    existingTask.SystemPrompt = modelSetupDto.Summarization.NodePrompt;
                    existingTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.Summarization.SetupObject, options);
                    existingTask.LastModifiedByUserId = _userId;

                    tasksToBeUpdated.Add(existingTask);
                }
            }

            // Insert new tasks if any
            if (tasksToBeAdded.Any())
            {
                _logger.LogInformation("Adding new tasks | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
                await _unitOfWork.VersionTaskRepo.InsertAsync(tasksToBeAdded);

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
                _unitOfWork.VersionTaskRepo.Update(tasksToBeUpdated);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save updated tasks | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
                    return serviceResponse;
                }
            }

            // Delete existing tasks if any
            if (tasksToBeDeleted.Any())
            {
                _logger.LogInformation("Deleting existing tasks | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
                _unitOfWork.VersionTaskRepo.Delete(tasksToBeDeleted);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save deleted tasks | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
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

    // Extracts data using a Language Learning Model (LLM) for a given AI Project.
    public async Task<ServiceResponse<InferencingModelResponseDto>> ExecuteLLMByFileIdsAsync(ModelFileProcessingRequestDto modelExecutionRequestDto)
    {
        // Initialize the response with a default failure message
        var serviceResponse = new ServiceResponse<InferencingModelResponseDto>
        {
            Data = null,
            Message = "Failed to execute via LLM. Please try again."
        };

        try
        {
            // Check for credits availability
            var hasSufficientCredits = await _llmDataExtractionService.HasSufficientCreditsAsync();
            if (!hasSufficientCredits.Data)
            {
                serviceResponse.Message = "Unable to execute AI model due to insufficient credits.";
                return serviceResponse;
            }

            _logger.LogInformation("Starting LLM execution by file IDs for AIProjectId: {AIProjectId}", modelExecutionRequestDto.ModelId);

            // Retrieve the AI project version and related data including tasks, extracted data, and uploaded documents
            var aiProjectVersion = await _unitOfWork.AIProjectVersionRepo
                .GetByConditionAsync(w =>
                    w.Id == modelExecutionRequestDto.AIProjectVersionId)
                .Include(i => i.Resources)
                .Include(i => i.Tasks!)
                .ThenInclude(i2 => i2.ExtractedDatas)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Return early if the AI project version is not found
            if (aiProjectVersion == null)
            {
                _logger.LogWarning("AI project version not found for AIProjectId: {AIProjectId}", modelExecutionRequestDto.ModelId);
                serviceResponse.Message = "AI project version not found";
                return serviceResponse;
            }

            // Prepare collections to hold extracted data results and database operations
            var extractedDataList = new List<InferencingModelTaskResponseDto>();
            var extractedDataToInsert = new List<ExtractedData>();
            var extractedDataToUpdate = new List<ExtractedData>();

            // Process each file specified in the request
            foreach (var versionResourceId in modelExecutionRequestDto.FileIds)
            {
                var documentExtractionData = new InferencingModelTaskResponseDto
                {
                    ExecutionCount = 0,
                    FailedCount = 0,
                    TokenCount = 0,
                    ExecutionTime = 0,
                    ServiceType = "OnPremGpuText", // TODO: Hardcoded for now, will be dynamic later once cloud model provider is implemented.
                    FileId = versionResourceId,
                    Remarks = string.Empty
                };

                // Get the list of AI project tasks to be executed, filtering by task IDs if provided
                var versionTasks = aiProjectVersion.Tasks
                    .Where(w => modelExecutionRequestDto.ModelTaskIds == null || modelExecutionRequestDto.ModelTaskIds.Contains(w.Id))
                    .ToList();

                // Process each task associated with the AI project
                foreach (var versionTask in versionTasks)
                {
                    _logger.LogInformation("Processing task {TaskId} with {FileCount} files for AIProjectId: {AIProjectId}", versionTask.Id, modelExecutionRequestDto.FileIds.Count, modelExecutionRequestDto.ModelId);

                    // Extract data for the current file and task
                    var (newExtractedData, updatedExtractedData) = await ProcessFileAsync(aiProjectVersion, versionTask, versionResourceId, documentExtractionData);

                    if (newExtractedData != null)
                    {
                        extractedDataToInsert.Add(newExtractedData);
                    }
                    if (updatedExtractedData != null)
                    {
                        extractedDataToUpdate.Add(updatedExtractedData);
                    }
                }

                extractedDataList.Add(documentExtractionData);
            }

            if (extractedDataToInsert.Any())
            {
                _logger.LogInformation("Inserting {Count} new extracted data records.", extractedDataToInsert.Count);

                await _unitOfWork.ExtractedDataRepo.InsertAsync(extractedDataToInsert);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save new extracted data to the database.");
                }
            }

            if (extractedDataToUpdate.Any())
            {
                _logger.LogInformation("Updating {Count} existing extracted data records.", extractedDataToUpdate.Count);
                _unitOfWork.ExtractedDataRepo.Update(extractedDataToUpdate);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save updated extracted data to the database.");
                }
            }

            // Prepare the successful response
            serviceResponse.Data = new InferencingModelResponseDto
            {
                ModelId = modelExecutionRequestDto.ModelId, // Optionally rename this property to AIProjectId in DTOs if needed
                AIProjectVersionId = modelExecutionRequestDto.AIProjectVersionId,
                ExtractedData = extractedDataList
            };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = extractedDataList.Any(d => d.Remarks.Contains("Failed"))
                ? "Failed to extract data for one or more files"
                : "Data extracted successfully";

            _logger.LogInformation("LLM extraction completed for AIProjectVersionId: {AIProjectVersionId}. Summary: {Message}", modelExecutionRequestDto.AIProjectVersionId, serviceResponse.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An exception occurred during the extraction process for AIProjectVersionId: {AIProjectVersionId}", modelExecutionRequestDto.AIProjectVersionId);
        }

        return serviceResponse;
    }

    // Executes the model using raw file content and processes extraction tasks via LLM.
    public async Task<ServiceResponse<InferencingModelResponseDto>> ExecuteLLMByFileContentAsync(ModelContentProcessingRequestDto modelExecutionRequestDto)
    {
        // Initialize the response with a default failure message
        var serviceResponse = new ServiceResponse<InferencingModelResponseDto>
        {
            Data = null,
            Message = "Failed to execute the model. Please try again later."
        };

        try
        {
            _logger.LogInformation("Starting model execution for AIProjectVersionId: {AIProjectVersionId} using file content.", modelExecutionRequestDto.AIProjectVersionId);

            // Retrieve the ML model and related data including tasks, extracted data, and uploaded documents
            var aiProjectVersion = await _unitOfWork.AIProjectVersionRepo
                .GetByConditionAsync(w =>
                    w.Id == modelExecutionRequestDto.AIProjectVersionId)
                .Include(i => i.Resources)
                .Include(i => i.Tasks!)
                .ThenInclude(i => i.ExtractedDatas)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Early return if the model is not found
            if (aiProjectVersion == null)
            {
                _logger.LogWarning("Model verion with AIProjectVersionId: {AIProjectVersionId} not found. Execution aborted.", modelExecutionRequestDto.AIProjectVersionId);
                serviceResponse.Message = "Model verion not found.";
                return serviceResponse;
            }

            // Prepare collections for extracted data and database operations
            var extractedDataList = new List<InferencingModelTaskResponseDto>();
            var versionTasks = aiProjectVersion.Tasks.Where(w =>
                    modelExecutionRequestDto.ModelTaskIds == null || modelExecutionRequestDto.ModelTaskIds.Contains(w.Id)
                )
                .ToList();

            var documentExtractionData = new InferencingModelTaskResponseDto
            {
                ExecutionCount = 0,
                FailedCount = 0,
                TokenCount = 0,
                ExecutionTime = 0,
                ServiceType = "OnPremGpuText", // TODO: Hardcoded for now, will be dynamic later once cloud model provider is implemented.
                Remarks = string.Empty
            };
            // Process each task associated with the model
            foreach (var versionTask in versionTasks)
            {
                // Call LLM and process response for each task
                documentExtractionData = await CallLLMAndProcessResponseAsync(
                    versionTask,
                    modelExecutionRequestDto.Content,
                    documentExtractionData,
                    modelExecutionRequestDto.ActionType,
                    modelExecutionRequestDto.TriggeredByAgent);

                // Log task-specific details
                if (documentExtractionData.Remarks.Contains("Failed"))
                {
                    _logger.LogWarning("Task execution failed for VersionTaskId: {VersionTaskId} while processing content for AIProjectVersionId: {AIProjectVersionId}. Remarks: {Remarks}", versionTask.Id, modelExecutionRequestDto.AIProjectVersionId, documentExtractionData.Remarks);
                }
                else
                {
                    _logger.LogInformation("Task execution successful for VersionTaskId: {VersionTaskId} for AIProjectVersionId: {AIProjectVersionId}. Extracted {TokenCount} tokens.", versionTask.Id, modelExecutionRequestDto.AIProjectVersionId, documentExtractionData.TokenCount);
                }
            }

            extractedDataList.Add(documentExtractionData);

            // Prepare the successful response with the list of extraction results
            serviceResponse.Data = new InferencingModelResponseDto
            {
                ModelId = modelExecutionRequestDto.ModelId,
                AIProjectVersionId = modelExecutionRequestDto.AIProjectVersionId,
                ExtractedData = extractedDataList
            };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = extractedDataList.Any(d => d.Remarks.Contains("Failed"))
                ? "Data extraction partially failed for one or more tasks."
                : "Data extraction completed successfully.";

            // Log summary after extraction process
            _logger.LogInformation("Extraction process completed for AIProjectVersionId: {AIProjectVersionId}. Summary: {Message}", modelExecutionRequestDto.AIProjectVersionId, serviceResponse.Message);
        }
        catch (Exception ex)
        {
            // Log unexpected exceptions during processing
            _logger.LogError(ex, "An error occurred during the extraction process for AIProjectVersionId: {AIProjectVersionId}. Exception: {ExceptionMessage}", modelExecutionRequestDto.AIProjectVersionId, ex.Message);
        }

        // Return the service response, whether success or failure
        return serviceResponse;
    }

    // Retrieves extracted data records associated with a specific AI project version.
    public async Task<ServiceResponse<IEnumerable<InferencingModelExtractedDataDetailDto>>> GetExtractedDataByAIProjectVersionIdAsync(Guid aiProjectVersionId)
    {
        // Initialize the response with a default failure message
        var serviceResponse = new ServiceResponse<IEnumerable<InferencingModelExtractedDataDetailDto>>
        {
            Data = null,
            Message = "Failed to retrieve extracted data. Please try again later."
        };

        try
        {
            _logger.LogInformation("Retrieving extracted data for AI project version ID: {AIProjectVersionId}", aiProjectVersionId);

            // Retrieve the AI project version along with associated tasks
            var aiProjectVersion = await _unitOfWork.AIProjectVersionRepo
                .GetByConditionAsync(w => w.Id == aiProjectVersionId)
                .Include(i => i.Tasks)
                .SingleOrDefaultAsync();

            // Check if the AI project version was found
            if (aiProjectVersion == null)
            {
                _logger.LogWarning("AI project version not found: {AIProjectVersionId}", aiProjectVersionId);
                serviceResponse.Message = "AI project version not found.";
                return serviceResponse;
            }

            // Extract task IDs for fast lookup using a HashSet
            var versionTaskIds = aiProjectVersion.Tasks.Select(t => t.Id).ToHashSet();

            // Fetch all extracted data related to the version's tasks
            var extractedDataList = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(w => versionTaskIds.Contains(w.VersionTaskId))
                .Include(i => i.CreatedByUser)
                .Include(i => i.VersionResource)
                .Include(i => i.VersionTask)
                .ToListAsync();

            // Handle case where no extracted data exists
            if (!extractedDataList.Any())
            {
                _logger.LogInformation("No extracted data found for AI project version ID: {AIProjectVersionId}", aiProjectVersionId);
                serviceResponse.Message = "No extracted data found.";
                return serviceResponse;
            }

            // Group extracted data by DocId
            var extractedDataByDoc = extractedDataList
                .GroupBy(data => data.VersionResourceId)
                .Select(group =>
                {
                    // Initialize the DTO with the first group item
                    var inferencingModelExtractedDataDetailDto = group.First().Adapt<InferencingModelExtractedDataDetailDto>();
                    inferencingModelExtractedDataDetailDto.AIProjectVersionId = group.First().AIProjectVersionId;
                    // Populate the DTO with each extracted data item in the group
                    foreach (var extractedData in group)
                    {
                        inferencingModelExtractedDataDetailDto = DeserializeExtractedDataObject(
                            extractedData.VersionTask?.Name,
                            extractedData.DataObject,
                            inferencingModelExtractedDataDetailDto);
                    }

                    return inferencingModelExtractedDataDetailDto;
                })
                .ToList();

            // Log success with the number of grouped records
            _logger.LogInformation("Successfully grouped {Count} extracted records for AI project version ID: {AIProjectVersionId}", extractedDataByDoc.Count, aiProjectVersionId);

            // Populate the service response with the grouped data
            serviceResponse.Data = extractedDataByDoc;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extracted data grouped by document retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving extracted data for AI project version ID: {AIProjectVersionId}", aiProjectVersionId);
        }

        return serviceResponse;
    }

    // Updates an extracted data record for a machine learning model.
    public async Task<ServiceResponse<bool>> UpdateExtractedDataAsync(InferencingModelExtractedDataDetailDto inferencingModelExtractedDataDetailDto)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to update extracted data. Please try again later."
        };

        try
        {
            _logger.LogInformation("Initiating update of extracted data for AIProjectVersionId: {AIProjectVersionId}", inferencingModelExtractedDataDetailDto.AIProjectVersionId);

            // Fetch the ML model along with associated tasks
            var aIProjectVersion = await _unitOfWork.AIProjectVersionRepo
                .GetByConditionAsync(w => w.Id == inferencingModelExtractedDataDetailDto.AIProjectVersionId)
                .Include(i => i.Tasks)
                .SingleOrDefaultAsync();

            if (aIProjectVersion == null)
            {
                _logger.LogWarning("No version found with ID: {AIProjectVersionId}", inferencingModelExtractedDataDetailDto.Id);
                serviceResponse.Message = "AI project verison not found.";
                return serviceResponse;
            }

            var versionTaskIds = aIProjectVersion.Tasks.Select(s => s.Id);
            // Fetch tasks for the ai project, including associated extracted data
            var existingExtractedDataList = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(w => versionTaskIds.Contains(w.VersionTaskId))
                .ToListAsync();

            var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var extractedDataToUpdate = new List<ExtractedData>();

            // Update data for each available task type in the input DTO
            if (inferencingModelExtractedDataDetailDto.Extraction != null)
            {
                var versionTask = aIProjectVersion.Tasks.FirstOrDefault(t => t.Name == nameof(AIProjectTaskTypesEnum.Extraction));
                var extractedData = existingExtractedDataList.FirstOrDefault(f => f.VersionResourceId == versionTask.Id && f.VersionResourceId == inferencingModelExtractedDataDetailDto.DocId);
                if (extractedData != null)
                {
                    extractedData.DataObject = JsonSerializer.Serialize(inferencingModelExtractedDataDetailDto.Extraction, jsonOptions);
                    extractedData.LastModifiedByUserId = _userId;
                    extractedDataToUpdate.Add(extractedData);
                }
            }

            if (inferencingModelExtractedDataDetailDto.Classification != null)
            {
                var versionTask = aIProjectVersion.Tasks.FirstOrDefault(t => t.Name == nameof(AIProjectTaskTypesEnum.Classification));
                var extractedData = existingExtractedDataList.FirstOrDefault(f => f.VersionResourceId == versionTask.Id && f.VersionResourceId == inferencingModelExtractedDataDetailDto.DocId);
                if (extractedData != null)
                {
                    extractedData.DataObject = JsonSerializer.Serialize(inferencingModelExtractedDataDetailDto.Classification, jsonOptions);
                    extractedData.LastModifiedByUserId = _userId;
                    extractedDataToUpdate.Add(extractedData);
                }
            }

            if (inferencingModelExtractedDataDetailDto.SentimentAnalytics != null)
            {
                var versionTask = aIProjectVersion.Tasks.FirstOrDefault(t => t.Name == nameof(AIProjectTaskTypesEnum.SentimentAnalytics));
                var extractedData = existingExtractedDataList.FirstOrDefault(f => f.VersionResourceId == versionTask.Id && f.VersionResourceId == inferencingModelExtractedDataDetailDto.DocId);
                if (extractedData != null)
                {
                    extractedData.DataObject = JsonSerializer.Serialize(inferencingModelExtractedDataDetailDto.SentimentAnalytics, jsonOptions);
                    extractedData.LastModifiedByUserId = _userId;
                    extractedDataToUpdate.Add(extractedData);
                }
            }

            if (inferencingModelExtractedDataDetailDto.QuestionAnswer != null)
            {
                var versionTask = aIProjectVersion.Tasks.FirstOrDefault(t => t.Name == nameof(AIProjectTaskTypesEnum.QuestionAnswer));
                var extractedData = existingExtractedDataList.FirstOrDefault(f => f.VersionResourceId == versionTask.Id && f.VersionResourceId == inferencingModelExtractedDataDetailDto.DocId);
                if (extractedData != null)
                {
                    extractedData.DataObject = JsonSerializer.Serialize(inferencingModelExtractedDataDetailDto.QuestionAnswer, jsonOptions);
                    extractedData.LastModifiedByUserId = _userId;
                    extractedDataToUpdate.Add(extractedData);
                }
            }

            if (inferencingModelExtractedDataDetailDto.Summarization != null)
            {
                var versionTask = aIProjectVersion.Tasks.FirstOrDefault(t => t.Name == nameof(AIProjectTaskTypesEnum.Summarization));
                var extractedData = existingExtractedDataList.FirstOrDefault(f => f.VersionTaskId == versionTask.Id && f.VersionResourceId == inferencingModelExtractedDataDetailDto.DocId);
                if (extractedData != null)
                {
                    extractedData.DataObject = JsonSerializer.Serialize(inferencingModelExtractedDataDetailDto.Summarization, jsonOptions);
                    extractedData.LastModifiedByUserId = _userId;
                    extractedDataToUpdate.Add(extractedData);
                }
            }

            if (extractedDataToUpdate.Any())
            {
                _unitOfWork.ExtractedDataRepo.Update(extractedDataToUpdate);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("Failed to persist extracted data updates to the database for ML Model ID: {MLModelId}",
                               inferencingModelExtractedDataDetailDto.Id); return serviceResponse;
                }
            }

            _logger.LogInformation("Prepared {Count} extracted data record(s) for update on ML Model ID: {MLModelId}", extractedDataToUpdate.Count, inferencingModelExtractedDataDetailDto.Id);

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extracted data successfully updated.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating extracted data for ML Model ID: {MLModelId}", inferencingModelExtractedDataDetailDto.Id);
        }

        return serviceResponse;
    }

    // Validates the input model setup DTO and its associated tasks.
    private bool ValidateModelSetupDto(InferencingModelDto modelSetupDto, out string? validationMessage)
    {
        validationMessage = null;
        string? detailedMessage = null;

        _logger.LogInformation("Starting validation for InferencingModelDto.");

        // Ensure the required top-level field 'BusinessContext' is present
        if (string.IsNullOrEmpty(modelSetupDto.BusinessContext))
        {
            detailedMessage = "BusinessContext is required."; // Missing BusinessContext
            _logger.LogWarning("Validation failed: {ErrorDetail}", detailedMessage);
            validationMessage = detailedMessage;
            return false;
        }

        if (modelSetupDto.Extraction != null)
        {
            // Ensure that the 'Extraction' task has at least one field defined
            if (modelSetupDto.Extraction.SetupObject.Fields == null || !modelSetupDto.Extraction.SetupObject.Fields.Any())
            {
                detailedMessage = "Extraction task requires at least one field."; // No fields in extraction
                _logger.LogWarning("Validation failed: {ErrorDetail}", detailedMessage);
                validationMessage = detailedMessage;
                return false;
            }

            // Check for duplicate field names in 'Extraction'
            var fieldNames = modelSetupDto.Extraction.SetupObject.Fields.Select(f => f.Name.ToLower()).ToList();
            var duplicateFields = fieldNames.GroupBy(f => f)
                                            .Where(g => g.Count() > 1)
                                            .Select(g => g.Key)
                                            .ToList();
            if (duplicateFields.Any())
            {
                detailedMessage = $"Field name(s) '{string.Join(", ", duplicateFields)}' are duplicated."; // Duplicated field names
                _logger.LogWarning("Validation failed: {ErrorDetail}", detailedMessage);
                validationMessage = detailedMessage;
                return false;
            }

            // Check for duplicate table names in 'Extraction'
            var tableNames = modelSetupDto.Extraction.SetupObject.Tables.Select(t => t.Name.ToLower()).ToList();
            var duplicateTables = tableNames.GroupBy(t => t)
                                           .Where(g => g.Count() > 1)
                                           .Select(g => g.Key)
                                           .ToList();
            if (duplicateTables.Any())
            {
                detailedMessage = $"Table name(s) '{string.Join(", ", duplicateTables)}' are duplicated."; // Duplicated table names
                _logger.LogWarning("Validation failed: {ErrorDetail}", detailedMessage);
                validationMessage = detailedMessage;
                return false;
            }

            // Check for duplicate table headers within each table
            foreach (var table in modelSetupDto.Extraction.SetupObject.Tables)
            {
                if (table.TableHeaders != null && table.TableHeaders.Any())
                {
                    var headerNames = table.TableHeaders.Select(h => h.Name.ToLower()).ToList();
                    var duplicateHeaders = headerNames.GroupBy(h => h)
                                                      .Where(g => g.Count() > 1)
                                                      .Select(g => g.Key)
                                                      .ToList();
                    if (duplicateHeaders.Any())
                    {
                        detailedMessage = $"Table '{table.Name}' has duplicate header(s): '{string.Join(", ", duplicateHeaders)}'."; // Duplicated table headers
                        _logger.LogWarning("Validation failed: {ErrorDetail}", detailedMessage);
                        validationMessage = detailedMessage;
                        return false;
                    }
                }
            }
        }

        if (modelSetupDto.Summarization != null)
        {
            // Ensure TotalMinimumWords is greater than 0
            if (modelSetupDto.Summarization.SetupObject.TotalMinimumWords <= 0)
            {
                detailedMessage = "TotalMinimumWords should be greater than 0."; // Invalid TotalMinimumWords
                _logger.LogWarning("Validation failed: {ErrorDetail}", detailedMessage);
                validationMessage = detailedMessage;
                return false;
            }

            // Ensure TotalMaximumWords is greater than 0
            if (modelSetupDto.Summarization.SetupObject.TotalMaximumWords <= 0)
            {
                detailedMessage = "TotalMaximumWords should be greater than 0."; // Invalid TotalMaximumWords
                _logger.LogWarning("Validation failed: {ErrorDetail}", detailedMessage);
                validationMessage = detailedMessage;
                return false;
            }
        }

        if (modelSetupDto.QuestionAnswer != null)
        {
            // Check for duplicate question answer names
            var questionAnswerNames = modelSetupDto.QuestionAnswer.SetupObject.QuestionAnswers
                .Select(qa => qa.Name.ToLower())
                .ToList();

            var duplicateQuestionAnswers = questionAnswerNames.GroupBy(qa => qa)
                                                              .Where(g => g.Count() > 1)
                                                              .Select(g => g.Key)
                                                              .ToList();

            if (duplicateQuestionAnswers.Any())
            {
                detailedMessage = $"Question answer name(s) '{string.Join(", ", duplicateQuestionAnswers)}' are duplicated."; // Duplicated question answer names
                _logger.LogWarning("Validation failed: {ErrorDetail}", detailedMessage);
                validationMessage = detailedMessage;
                return false;
            }
        }

        if (modelSetupDto.Classification != null)
        {
            // Check for duplicate category names in 'Classification'
            var categoryNames = modelSetupDto.Classification.SetupObject?.Categories
                .Select(c => c.Name.ToLower())
                .ToList();
            var duplicateCategories = categoryNames.GroupBy(c => c)
                                                   .Where(g => g.Count() > 1)
                                                   .Select(g => g.Key)
                                                   .ToList();

            if (duplicateCategories.Any())
            {
                detailedMessage = $"Category name(s) '{string.Join(", ", duplicateCategories)}' are duplicated."; // Duplicated category names
                _logger.LogWarning("Validation failed: {ErrorDetail}", detailedMessage);
                validationMessage = detailedMessage;
                return false;
            }

            // Check for duplicate subcategory names within each category
            foreach (var category in modelSetupDto.Classification?.SetupObject?.Categories)
            {
                // If SubCategories is null, skip this category entirely
                if (category.SubCategories == null)
                {
                    continue;
                }

                var subCategoryNames = category.SubCategories
                                              .Select(sc => sc.Name.ToLower())
                                              .ToList();
                var duplicateSubCategories = subCategoryNames.GroupBy(sc => sc)
                                                             .Where(g => g.Count() > 1)
                                                             .Select(g => g.Key)
                                                             .ToList();

                if (duplicateSubCategories.Any())
                {
                    detailedMessage = $"Subcategory name(s) '{string.Join(", ", duplicateSubCategories)}' in category '{category.Name}' are duplicated."; // Duplicated subcategory names
                    _logger.LogWarning("Validation failed: {ErrorDetail}", detailedMessage);
                    validationMessage = detailedMessage;
                    return false;
                }

                // Check for duplicate sub-subcategory names within each subcategory
                foreach (var subCategory in category.SubCategories)
                {
                    // If SubSubCategories is null, skip this subcategory
                    if (subCategory.SubSubCategories == null)
                    {
                        continue;
                    }

                    var subSubCategoryNames = subCategory.SubSubCategories
                                                         .Select(ssc => ssc.Name.ToLower())
                                                         .ToList();
                    var duplicateSubSubCategories = subSubCategoryNames.GroupBy(ssc => ssc)
                                                                       .Where(g => g.Count() > 1)
                                                                       .Select(g => g.Key)
                                                                       .ToList();

                    if (duplicateSubSubCategories.Any())
                    {
                        detailedMessage = $"Sub-subcategory name(s) '{string.Join(", ", duplicateSubSubCategories)}' in subcategory '{subCategory.Name}' under category '{category.Name}' are duplicated."; // Duplicated sub-subcategory names
                        _logger.LogWarning("Validation failed: {ErrorDetail}", detailedMessage);
                        validationMessage = detailedMessage;
                        return false;
                    }
                }
            }
        }


        if (modelSetupDto.SentimentAnalytics != null)
        {
            // Check for duplicate category names in SentimentAnalytics
            var sentimentCategoryNames = modelSetupDto.SentimentAnalytics.SetupObject.Categories
                .Select(c => c.Name.ToLower())
                .ToList();
            var duplicateSentimentCategories = sentimentCategoryNames.GroupBy(c => c)
                                                                     .Where(g => g.Count() > 1)
                                                                     .Select(g => g.Key)
                                                                     .ToList();

            if (duplicateSentimentCategories.Any())
            {
                detailedMessage = $"Category name(s) '{string.Join(", ", duplicateSentimentCategories)}' are duplicated in SentimentAnalytics."; // Duplicated sentiment categories
                _logger.LogWarning("Validation failed: {ErrorDetail}", detailedMessage);
                validationMessage = detailedMessage;
                return false;
            }

            // Check for duplicate subcategory names within each SentimentAnalytics category
            foreach (var category in modelSetupDto.SentimentAnalytics.SetupObject.Categories)
            {
                // If SubCategories is null, skip this category
                if (category.SubCategories == null)
                {
                    continue;
                }

                var sentimentSubCategoryNames = category.SubCategories
                                                        .Select(sc => sc.Name.ToLower())
                                                        .ToList();
                var duplicateSentimentSubCategories = sentimentSubCategoryNames.GroupBy(sc => sc)
                                                                             .Where(g => g.Count() > 1)
                                                                             .Select(g => g.Key)
                                                                             .ToList();

                if (duplicateSentimentSubCategories.Any())
                {
                    detailedMessage = $"Subcategory name(s) '{string.Join(", ", duplicateSentimentSubCategories)}' in category '{category.Name}' in SentimentAnalytics are duplicated."; // Duplicated sentiment subcategory names
                    _logger.LogWarning("Validation failed: {ErrorDetail}", detailedMessage);
                    validationMessage = detailedMessage;
                    return false;
                }

                // Check for duplicate sub-subcategory names within each SentimentAnalytics subcategory
                foreach (var subCategory in category.SubCategories)
                {
                    // If SubSubCategories is null, skip this subcategory
                    if (subCategory.SubSubCategories == null)
                    {
                        continue;
                    }

                    var sentimentSubSubCategoryNames = subCategory.SubSubCategories
                                                                 .Select(ssc => ssc.Name.ToLower())
                                                                 .ToList();
                    var duplicateSentimentSubSubCategories = sentimentSubSubCategoryNames.GroupBy(ssc => ssc)
                                                                                       .Where(g => g.Count() > 1)
                                                                                       .Select(g => g.Key)
                                                                                       .ToList();

                    if (duplicateSentimentSubSubCategories.Any())
                    {
                        detailedMessage = $"Sub-subcategory name(s) '{string.Join(", ", duplicateSentimentSubSubCategories)}' in subcategory '{subCategory.Name}' under category '{category.Name}' in SentimentAnalytics are duplicated."; // Duplicated sentiment sub-subcategory names
                        _logger.LogWarning("Validation failed: {ErrorDetail}", detailedMessage);
                        validationMessage = detailedMessage;
                        return false;
                    }
                }
            }
        }

        // If all checks passed, log and return true
        _logger.LogInformation("InferencingModelDto passed validation.");
        return true;
    }

    // Deserializes the extracted data object JSON string into the appropriate DTO based on the given task name,
    private InferencingModelExtractedDataDetailDto DeserializeExtractedDataObject(string taskName, string? dataObject, InferencingModelExtractedDataDetailDto inferencingModelExtractedDataDetailDto)
    {
        // Check if task name or data is empty or null
        if (string.IsNullOrWhiteSpace(taskName) || string.IsNullOrWhiteSpace(dataObject))
            return inferencingModelExtractedDataDetailDto;

        try
        {
            // Configure JSON deserialization options (case-insensitive property mapping)
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            // Choose deserialization strategy based on the inferencing task name
            switch (taskName)
            {
                case nameof(AIProjectTaskTypesEnum.Extraction):
                    // Deserialize extraction task data
                    inferencingModelExtractedDataDetailDto.Extraction = JsonSerializer.Deserialize<ExtractionTaskExtractedDataDto>(dataObject, jsonOptions);
                    break;

                case nameof(AIProjectTaskTypesEnum.Summarization):
                    // Deserialize summarization task data
                    inferencingModelExtractedDataDetailDto.Summarization = JsonSerializer.Deserialize<SummarizationTaskExtractedDataDto>(dataObject, jsonOptions);
                    break;

                case nameof(AIProjectTaskTypesEnum.QuestionAnswer):
                    // Deserialize question-answer task data
                    inferencingModelExtractedDataDetailDto.QuestionAnswer = JsonSerializer.Deserialize<List<QuestionAnswerTaskExtractedDataDto>>(dataObject, jsonOptions);
                    break;

                case nameof(AIProjectTaskTypesEnum.SentimentAnalytics):
                    // Deserialize sentiment analytics task data
                    inferencingModelExtractedDataDetailDto.SentimentAnalytics = JsonSerializer.Deserialize<List<SentimentAnalysisExtractedDataDto>>(dataObject, jsonOptions);
                    break;

                case nameof(AIProjectTaskTypesEnum.Classification):
                    // Deserialize classification task data
                    inferencingModelExtractedDataDetailDto.Classification = JsonSerializer.Deserialize<List<ClassificationTaskExtractedDataDto>>(dataObject, jsonOptions);
                    break;

                default:
                    // Log warning if task type is unknown
                    _logger.LogWarning("Unknown task name provided: {TaskName}", taskName);
                    break;
            }

            // Return the updated DTO object
            return inferencingModelExtractedDataDetailDto;
        }
        catch (Exception ex)
        {
            // Log error if deserialization fails
            _logger.LogError(ex, "Failed to deserialize LLM response for task type: {TaskName}", taskName);
            return inferencingModelExtractedDataDetailDto;
        }
    }

    // Processes a document extraction for a model task, creating or updating extracted data based on the document's state.
    private async Task<(ExtractedData? NewExtractedData, ExtractedData? UpdatedExtractedData)> ProcessFileAsync(AIProjectVersion aIProjectVersion, VersionTask versionTask, Guid fileId, InferencingModelTaskResponseDto documentExtractionData)
    {
        _logger.LogInformation("Starting extraction for DocumentId: {DocumentId} in AIProjectVersionId: {AIProjectVersionId}, VersionTaskId: {VersionTaskId}", fileId, aIProjectVersion.Id, versionTask.Id);

        // Retrieve the existing extracted data (if any) for the given document and task
        var existingData = versionTask.ExtractedDatas.FirstOrDefault(w => w.VersionTaskId == versionTask.Id && w.VersionResourceId == fileId);

        // Retrieve the uploaded document by its file ID
        var document = aIProjectVersion.Resources.FirstOrDefault(d => d.Id == fileId);
        if (document == null)
        {
            // Log and handle the case where the document is not found
            _logger.LogWarning("Document not found for DocumentId: {DocumentId}", fileId);
            documentExtractionData.Remarks = $"002: Document not found with ID: {fileId}.";
            return (null, null);
        }

        // Check if the document has a valid file path
        if (string.IsNullOrEmpty(document.Path))
        {
            // Log and handle the case where the document's file path is missing
            _logger.LogWarning("Missing file path for DocumentId: {DocumentId}", fileId);
            documentExtractionData.Remarks = "Document file path is missing.";
            return (null, null);
        }

        // If file is local then combine with local storage path
        string filePath = document.Path;
        if (!filePath.Contains("http://") && !filePath.Contains("https://"))
        {
            // Remove leading "/files" if present. TODO: This /files/ seems unnecessary in the local file path when we upload a file. need to check and change the logic
            if (filePath.StartsWith("/files/"))
                filePath = filePath.Substring("/files/".Length);

            // Combine with local storage path
            filePath = Path.Combine(_fileUploadConfig.UploadDirectory, filePath.TrimStart('/'));
        }

        // Extract the text from the document using the provided path
        var documentText = await _llmDataExtractionService.GetFileTextAsync(filePath);
        if (string.IsNullOrEmpty(documentText))
        {
            // Log and handle the case where text extraction fails
            _logger.LogWarning("Failed to extract text for DocumentId: {DocumentId} at path: {Path}", fileId, document.Path);
            documentExtractionData.Remarks = "Failed to extract text from the document.";
            return (null, null);
        }

        // Call the LLM service to process the extracted text and update the documentExtractionData
        documentExtractionData = await CallLLMAndProcessResponseAsync(
            versionTask,
            documentText,
            documentExtractionData,
            ActionTypesEnum.AIModelExecution,
            null);

        string? dataObject = GetSerializedDataObjectBasedOnTaskName(versionTask.Name, documentExtractionData);

        // If no existing extracted data, create a new record
        if (existingData == null)
        {
            var newExtracted = new ExtractedData
            {
                VersionResourceId = fileId,
                AIProjectVersionId = aIProjectVersion.Id,
                VersionTaskId = versionTask.Id,
                TokenCount = documentExtractionData.TokenCount,
                ExecutionCount = documentExtractionData.ExecutionCount,
                ExecutionTime = documentExtractionData.ExecutionTime,
                FailedCount = documentExtractionData.FailedCount,
                DataObject = dataObject,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId
            };

            // Log the creation of a new extracted data record
            _logger.LogInformation("Created new extracted data record for DocumentId: {DocumentId}", fileId);
            return (newExtracted, null);
        }
        else
        {
            // Update the existing extracted data with new values
            existingData.DataObject = dataObject;
            existingData.ExecutionCount += documentExtractionData.ExecutionCount;
            existingData.FailedCount += documentExtractionData.FailedCount;
            existingData.TokenCount += documentExtractionData.TokenCount;
            existingData.ExecutionTime += documentExtractionData.ExecutionTime;
            existingData.LastModifiedByUserId = _userId;

            // Log the update of the existing extracted data record
            _logger.LogInformation("Updated existing extracted data record for DocumentId: {DocumentId}", fileId);
            return (null, existingData);
        }
    }

    // Deserialize the LLM response data based on the task type (Extraction, Summarization, etc.) and return the serialized string of the data object.
    private string? GetSerializedDataObjectBasedOnTaskName(string taskName, InferencingModelTaskResponseDto documentExtractionData)
    {
        try
        {
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            string? dataObject = null;

            switch (taskName)
            {
                case nameof(AIProjectTaskTypesEnum.Extraction):
                    dataObject = JsonSerializer.Serialize(documentExtractionData.Extraction, options);
                    break;

                case nameof(AIProjectTaskTypesEnum.Summarization):
                    dataObject = JsonSerializer.Serialize(documentExtractionData.Summarization, options);
                    break;

                case nameof(AIProjectTaskTypesEnum.QuestionAnswer):
                    dataObject = JsonSerializer.Serialize(documentExtractionData.QuestionAnswer, options);
                    break;

                case nameof(AIProjectTaskTypesEnum.SentimentAnalytics):
                    dataObject = JsonSerializer.Serialize(documentExtractionData.SentimentAnalytics, options);
                    break;

                case nameof(AIProjectTaskTypesEnum.Classification):
                    dataObject = JsonSerializer.Serialize(documentExtractionData.Classification, options);
                    break;

                default:
                    _logger.LogWarning("Unhandled task type: {TaskName}", taskName);
                    return null;
            }
            return dataObject;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deserializing and serializing data for task: {TaskName}", taskName);
            return null;
        }
    }

    public static string? GetFieldValueByJsonPropertyName(JsonElement rootJsonElement, string jsonPropertyName)
    {
        if (rootJsonElement.TryGetProperty("fields", out var fields))
        {
            if (fields.TryGetProperty(jsonPropertyName, out var value))
            {
                return value.GetString();
            }
        }
        return string.Empty; // Not found
    }

    // TODO: temp fix to show the table rows
    public static List<string> GetTableHeaderValues(JsonElement rootJsonElement, string tableName, string headerJsonPropertyName)
    {
        if (rootJsonElement.TryGetProperty("tables", out var tables))
        {
            foreach (var table in tables.EnumerateArray())
            {
                // If you have table_name property, match it here:
                if (table.TryGetProperty("table_name", out var tName) && tName.GetString().ToLower() != tableName.ToLower()) continue;

                if (table.TryGetProperty("rows", out var rows))
                {
                    var headerValues = new List<string>();
                    foreach (var row in rows.EnumerateArray())
                    {
                        if (row.TryGetProperty(headerJsonPropertyName, out var headerValue))
                        {
                            headerValues.Add(headerValue.GetString() ?? "");
                        }
                    }
                    return headerValues;
                }
            }
        }
        return new List<string>(); // Not found
    }

    // Calls the LLM with a prompt, processes the response, and populates extraction metadata.
    private async Task<InferencingModelTaskResponseDto> CallLLMAndProcessResponseAsync(
        VersionTask versionTask,
        string fileContent,
        InferencingModelTaskResponseDto documentExtractionData,
        ActionTypesEnum actionType,
        string? triggeredByAgent = null)
    {
        // Generate the prompt by replacing placeholders with actual content
        var outputFormatJson = GetOutputFormatJson(versionTask);
        var ollamaOutputFormatSchema = GetOllamaOutputFormatSchema(versionTask);
        var prompt = versionTask.GeneratedPrompt.Replace("{{FileContent}}", fileContent).Replace("{{OutputFormat}}", outputFormatJson);

        // Log the generated prompt for debugging
        _logger.LogInformation("Sending prompt to LLM: {Prompt}", prompt);

        var startTime = DateTime.UtcNow;

        // Get ai project details
        var aIProjectVersion = await _unitOfWork.AIProjectVersionRepo
                .GetByConditionAsync(w => w.Id == versionTask.AIProjectVersionId)
                .Include(i => i.AIProject)
                .SingleOrDefaultAsync();

        // Call the LLM service to extract data
        var llmResponse = await _llmDataExtractionService.ExtractDataAsync(
            prompt,
            versionTask.LLM,
            versionTask.Temperature,
            UsageSourceTypesEnum.AIModel,
            versionTask.AIProjectVersionId,
            aIProjectVersion.AIProject.Name,
            actionType, // this will be AgentExecution or AIModelExecution
            triggeredByAgent, // triggered by an agent
            ollamaOutputFormatSchema, // ollama output schema needed
            false // No json output required
            );

        var endTime = DateTime.UtcNow;
        var executionSeconds = (int)Math.Ceiling((endTime - startTime).TotalSeconds);

        // Log the generated response for debugging
        _logger.LogInformation("LLM response received for prompt: {llmResponse}", llmResponse.Data);

        // Log the LLM response status and execution time
        _logger.LogInformation("LLM response for prompt status: {ResponseStatus}, Execution Time: {ExecutionTime}s", llmResponse.StatusCode, executionSeconds);

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

            switch (versionTask.Name)
            {
                case nameof(AIProjectTaskTypesEnum.Extraction):
                    var llmResponseJsonRoot = JsonDocument.Parse(llmResponse.Data).RootElement;
                    var extractionSetupObject = JsonSerializer.Deserialize<ExtractionTaskSetupDto>(versionTask.SetupObject ?? null, options);

                    // Prepare the output format with extracted data, mapping from fields and tables
                    if (extractionSetupObject.Tables.Count() > 0)
                    {
                        var extractionResult = new ExtractionTaskExtractedDataDto()
                        {
                            Fields = extractionSetupObject.Fields.Select(field => new ExtractionFieldDto()
                            {
                                Name = field.Name,
                                Value = GetFieldValueByJsonPropertyName(llmResponseJsonRoot, field.JsonPropertyName),
                                ConfidenceScore = "0",
                            }).ToList(),

                            // Map tables into a corresponding format
                            Tables = extractionSetupObject.Tables.Select(table => new ExtractionTableDto()
                            {
                                Name = table.Name,
                                Headers = table.TableHeaders.Select(header => new ExtractionSetupTableHeaderSchema()
                                {
                                    Name = header.Name,
                                    Values = GetTableHeaderValues(llmResponseJsonRoot, table.Name, header.JsonPropertyName),
                                }).ToList()
                            }).ToList()
                        };
                        documentExtractionData.Extraction = extractionResult;
                    }
                    else
                    {
                        var extractionResult = new ExtractionTaskExtractedDataDto()
                        {
                            Fields = extractionSetupObject.Fields.Select(field => new ExtractionFieldDto()
                            {
                                Name = field.Name,
                                Value = GetFieldValueByJsonPropertyName(llmResponseJsonRoot, field.JsonPropertyName),
                                ConfidenceScore = "0",
                            }).ToList(),
                        };
                        documentExtractionData.Extraction = extractionResult;
                    }
                    break;

                case nameof(AIProjectTaskTypesEnum.Summarization):
                    documentExtractionData.Summarization = JsonSerializer.Deserialize<SummarizationTaskExtractedDataDto>(llmResponse.Data, options);
                    break;

                case nameof(AIProjectTaskTypesEnum.QuestionAnswer):
                    documentExtractionData.QuestionAnswer = JsonSerializer.Deserialize<List<QuestionAnswerTaskExtractedDataDto>>(llmResponse.Data, options);
                    break;

                case nameof(AIProjectTaskTypesEnum.SentimentAnalytics):
                    var sentimentAnalyticsSetupDto = JsonSerializer.Deserialize<SentimentAnalyticsTaskSetupDto>(versionTask.SetupObject, options);
                    documentExtractionData.SentimentAnalytics = sentimentAnalyticsSetupDto.Categories.Adapt<List<SentimentAnalysisExtractedDataDto>>();
                    var sentimentAnalyticsCategories = JsonSerializer.Deserialize<List<CategoryDataDto>>(llmResponse.Data, options);
                    foreach (var detectedCategory in sentimentAnalyticsCategories)
                    {
                        foreach (var sentimentAnalysis in documentExtractionData.SentimentAnalytics)
                        {
                            // Match top-level category
                            if (string.Equals(sentimentAnalysis.Name, detectedCategory.Name, StringComparison.InvariantCultureIgnoreCase))
                            {
                                sentimentAnalysis.Value = detectedCategory.Value;
                                sentimentAnalysis.ConfidenceScore = detectedCategory.ConfidenceScore;
                                continue;
                            }

                            // Match subcategory
                            if (sentimentAnalysis.SubCategories != null)
                            {
                                foreach (var subcategory in sentimentAnalysis.SubCategories)
                                {
                                    if (string.Equals(subcategory.Name, detectedCategory.Name, StringComparison.InvariantCultureIgnoreCase))
                                    {
                                        subcategory.Value = detectedCategory.Value;
                                        subcategory.ConfidenceScore = detectedCategory.ConfidenceScore;

                                        // Also update parent category
                                        sentimentAnalysis.Value = detectedCategory.Value;
                                        sentimentAnalysis.ConfidenceScore = detectedCategory.ConfidenceScore;
                                        continue;
                                    }

                                    // Match subsubcategory
                                    if (subcategory.SubSubCategories != null)
                                    {
                                        foreach (var subSubcategory in subcategory.SubSubCategories)
                                        {
                                            if (string.Equals(subSubcategory.Name, detectedCategory.Name, StringComparison.InvariantCultureIgnoreCase))
                                            {
                                                subSubcategory.Value = detectedCategory.Value;
                                                subSubcategory.ConfidenceScore = detectedCategory.ConfidenceScore;

                                                // Also update parent subcategory
                                                subcategory.Value = detectedCategory.Value;
                                                subcategory.ConfidenceScore = detectedCategory.ConfidenceScore;

                                                // Also update top-level category
                                                sentimentAnalysis.Value = detectedCategory.Value;
                                                sentimentAnalysis.ConfidenceScore = detectedCategory.ConfidenceScore;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break;

                case nameof(AIProjectTaskTypesEnum.Classification):
                    var classificationSetupDto = JsonSerializer.Deserialize<SentimentAnalyticsTaskSetupDto>(versionTask.SetupObject, options);
                    documentExtractionData.Classification = classificationSetupDto.Categories.Adapt<List<ClassificationTaskExtractedDataDto>>();
                    var classificationCategories = JsonSerializer.Deserialize<List<CategoryDataDto>>(llmResponse.Data, options);
                    foreach (var detectedCategory in classificationCategories)
                    {
                        foreach (var classification in documentExtractionData.Classification)
                        {
                            // Match top-level category
                            if (string.Equals(classification.Name, detectedCategory.Name, StringComparison.InvariantCultureIgnoreCase))
                            {
                                classification.Value = detectedCategory.Value;
                                classification.ConfidenceScore = detectedCategory.ConfidenceScore;
                                continue;
                            }

                            // Match subcategory
                            if (classification.SubCategories != null)
                            {
                                foreach (var subcategory in classification.SubCategories)
                                {
                                    if (string.Equals(subcategory.Name, detectedCategory.Name, StringComparison.InvariantCultureIgnoreCase))
                                    {
                                        subcategory.Value = detectedCategory.Value;
                                        subcategory.ConfidenceScore = detectedCategory.ConfidenceScore;

                                        // Also update parent category
                                        classification.Value = detectedCategory.Value;
                                        classification.ConfidenceScore = detectedCategory.ConfidenceScore;
                                        continue;
                                    }

                                    // Match subsubcategory
                                    if (subcategory.SubSubCategories != null)
                                    {
                                        foreach (var subSubcategory in subcategory.SubSubCategories)
                                        {
                                            if (string.Equals(subSubcategory.Name, detectedCategory.Name, StringComparison.InvariantCultureIgnoreCase))
                                            {
                                                subSubcategory.Value = detectedCategory.Value;
                                                subSubcategory.ConfidenceScore = detectedCategory.ConfidenceScore;

                                                // Also update parent subcategory
                                                subcategory.Value = detectedCategory.Value;
                                                subcategory.ConfidenceScore = detectedCategory.ConfidenceScore;

                                                // Also update top-level category
                                                classification.Value = detectedCategory.Value;
                                                classification.ConfidenceScore = detectedCategory.ConfidenceScore;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break;

                default:
                    _logger.LogWarning("Unhandled task type: {TaskName}", versionTask.Name);
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

    // Generates and returns a JSON string representing the output format based on the model task type.
    // TODO: need to remove later since we have GetOllamaOutputFormatSchema
    private string? GetOutputFormatJson(VersionTask versionTask)
    {
        // If the versionTask is null, return null immediately
        if (versionTask == null) return null;

        // Declare the variable to store the output
        string? outputFormatJson = null;

        // Configure JSON deserialization options to make property name matching case-insensitive
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        // Check the type of version task and process accordingly
        switch (versionTask.Name)
        {
            // Handle Extraction task type
            case nameof(AIProjectTaskTypesEnum.Extraction):
                // Deserialize the SetupObject into the ExtractionTaskSetupDto
                var extractionSetupObject = JsonSerializer.Deserialize<ExtractionTaskSetupDto>(versionTask.SetupObject ?? null, jsonOptions);

                // Prepare the output format with extracted data, mapping from fields and tables

                if (extractionSetupObject.Tables.Count() > 0)
                {
                    var extractionResult = new
                    {
                        fields = extractionSetupObject.Fields.ToDictionary(f => f.JsonPropertyName, f => ""),
                        tables = extractionSetupObject.Tables.Select(table => new
                        {
                            table_name = table.Name,
                            rows = table.TableHeaders.ToDictionary(h => h.JsonPropertyName, h => "")
                        }).ToArray()
                    };
                    outputFormatJson = JsonSerializer.Serialize(extractionResult, jsonOptions);
                }
                else
                {
                    var extractionResult = new
                    {
                        fields = extractionSetupObject.Fields.ToDictionary(f => f.JsonPropertyName, f => ""),
                    };
                    outputFormatJson = JsonSerializer.Serialize(extractionResult, jsonOptions);
                }
                break;

            // Handle Classification task type
            case nameof(AIProjectTaskTypesEnum.Classification):
                // Deserialize the SetupObject into ClassificationTaskSetupDto
                var classificationSetupObject = JsonSerializer.Deserialize<ClassificationTaskSetupDto>(versionTask.SetupObject ?? null, jsonOptions);

                // Prepare output for the classification categories and subcategories
                // var classificationResult = classificationSetupObject.Categories.Select(category => new ClassificationTaskExtractedDataDto()
                // {
                //     Name = category.Name,
                //     Value = string.Empty,
                //     ConfidenceScore = "0",
                //     Subcategories = category.SubCategories?.Select(subcategory => new SubcategoryExtractedDataDto()
                //     {
                //         Name = subcategory.Name,
                //         Value = string.Empty,
                //         ConfidenceScore = "0",
                //         SubSubcategories = subcategory.SubSubCategories?.Select(subSubcategory => new SubSubcategoryExtractedDataDto()
                //         {
                //             Name = subSubcategory.Name,
                //             Value = string.Empty,
                //             ConfidenceScore = "0",
                //         }).ToList()
                //     }).ToList()
                // }).ToList();
                var classificationCategories = new List<CategoryDataDto>();

                foreach (var category in classificationSetupObject.Categories)
                {
                    // No subcategories: use the category itself
                    if (category.SubCategories == null || !category.SubCategories.Any())
                    {
                        classificationCategories.Add(new CategoryDataDto
                        {
                            Name = category.Name,
                            Value = string.Empty,
                            ConfidenceScore = "0",
                        });
                    }
                    else
                    {
                        foreach (var subcategory in category.SubCategories)
                        {
                            // If subcategory has subsubcategories, use subsubcategories
                            if (subcategory.SubSubCategories != null && subcategory.SubSubCategories.Any())
                            {
                                foreach (var subSubcategory in subcategory.SubSubCategories)
                                {
                                    classificationCategories.Add(new CategoryDataDto
                                    {
                                        Name = subSubcategory.Name,
                                        Value = string.Empty,
                                        ConfidenceScore = "0",
                                    });
                                }
                            }
                            else
                            {
                                // No subsubcategories, use subcategory
                                classificationCategories.Add(new CategoryDataDto
                                {
                                    Name = subcategory.Name,
                                    Value = string.Empty,
                                    ConfidenceScore = "0",
                                });
                            }
                        }
                    }
                }

                // Serialize to JSON string
                outputFormatJson = JsonSerializer.Serialize(classificationCategories, jsonOptions);
                break;

            // Handle Sentiment Analytics task type
            case nameof(AIProjectTaskTypesEnum.SentimentAnalytics):
                // Deserialize the SetupObject into SentimentAnalyticsTaskSetupDto
                var sentimentAnalyticsSetupObject = JsonSerializer.Deserialize<SentimentAnalyticsTaskSetupDto>(versionTask.SetupObject ?? null, jsonOptions);

                // // Prepare output for sentiment categories and subcategories
                // var sentimentResult = sentimentAnalyticsSetupObject.Categories.Select(category => new SentimentAnalysisExtractedDataDto()
                // {
                //     Name = category.Name,
                //     Value = string.Empty,
                //     ConfidenceScore = "0",
                //     Subcategories = category.SubCategories?.Select(subcategory => new SubcategoryExtractedDataDto()
                //     {
                //         Name = subcategory.Name,
                //         Value = string.Empty,
                //         ConfidenceScore = "0",
                //         SubSubcategories = subcategory.SubSubCategories?.Select(subSubcategory => new SubSubcategoryExtractedDataDto()
                //         {
                //             Name = subSubcategory.Name,
                //             Value = string.Empty,
                //             ConfidenceScore = "0",
                //         }).ToList()
                //     }).ToList()
                // }).ToList();

                var sentimentAnalyticsCategories = new List<CategoryDataDto>();

                foreach (var category in sentimentAnalyticsSetupObject.Categories)
                {
                    // No subcategories: use the category itself
                    if (category.SubCategories == null || !category.SubCategories.Any())
                    {
                        sentimentAnalyticsCategories.Add(new CategoryDataDto
                        {
                            Name = category.Name,
                            Value = string.Empty,
                            ConfidenceScore = "0",
                        });
                    }
                    else
                    {
                        foreach (var subcategory in category.SubCategories)
                        {
                            // If subcategory has subsubcategories, use subsubcategories
                            if (subcategory.SubSubCategories != null && subcategory.SubSubCategories.Any())
                            {
                                foreach (var subSubcategory in subcategory.SubSubCategories)
                                {
                                    sentimentAnalyticsCategories.Add(new CategoryDataDto
                                    {
                                        Name = subSubcategory.Name,
                                        Value = string.Empty,
                                        ConfidenceScore = "0",
                                    });
                                }
                            }
                            else
                            {
                                // No subsubcategories, use subcategory
                                sentimentAnalyticsCategories.Add(new CategoryDataDto
                                {
                                    Name = subcategory.Name,
                                    Value = string.Empty,
                                    ConfidenceScore = "0",
                                });
                            }
                        }
                    }
                }

                // Serialize to JSON string
                outputFormatJson = JsonSerializer.Serialize(sentimentAnalyticsCategories, jsonOptions);
                break;

            // Handle Question Answer task type
            case nameof(AIProjectTaskTypesEnum.QuestionAnswer):
                // Deserialize the SetupObject into QuestionAnswerTaskSetupDto
                var questionAnswerSetupObject = JsonSerializer.Deserialize<QuestionAnswerTaskSetupDto>(versionTask.SetupObject ?? null, jsonOptions);

                // Prepare output for question-answer pairs
                var questionAnswerResult = questionAnswerSetupObject.QuestionAnswers.Select(questionAnswer => new QuestionAnswerTaskExtractedDataDto()
                {
                    Question = questionAnswer.Name,
                    Answer = string.Empty,
                    ConfidenceScore = "0"
                }).ToList();

                // Serialize to JSON string
                outputFormatJson = JsonSerializer.Serialize(questionAnswerResult, jsonOptions);
                break;

            // Handle Summarization task type
            case nameof(AIProjectTaskTypesEnum.Summarization):
                // Deserialize the SetupObject into SummarizationTaskSetupDto
                var summarizationSetupObject = JsonSerializer.Deserialize<SummarizationTaskSetupDto>(versionTask.SetupObject ?? null, jsonOptions);

                // Prepare output for summarized data
                var summarizationResult = new SummarizationTaskExtractedDataDto()
                {
                    Summary = string.Empty
                };

                // Serialize to JSON string
                outputFormatJson = JsonSerializer.Serialize(summarizationResult, jsonOptions);
                break;

            // Default case, if the model task name does not match any of the above
            default:
                return null;
        }

        // Return the serialized output format JSON string
        return outputFormatJson;
    }

    // Generates and returns a JSON string representing the output format based on the model task type.
    private object? GetOllamaOutputFormatSchema(VersionTask versionTask)
    {
        // If the versionTask is null, return null immediately
        if (versionTask == null) return null;

        // Configure JSON deserialization options to make property name matching case-insensitive
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        // Check the type of version task and process accordingly
        switch (versionTask.Name)
        {
            // Handle Extraction task type
            case nameof(AIProjectTaskTypesEnum.Extraction):
                // Deserialize the SetupObject into the ExtractionTaskSetupDto
                var extractionSetupObject = JsonSerializer.Deserialize<ExtractionTaskSetupDto>(versionTask.SetupObject ?? null, jsonOptions);

                // Prepare the output format with extracted data, mapping from fields and tables
                var extractionJsonObj = new
                {
                    type = "object",
                    properties = new
                    {
                        fields = new
                        {
                            type = "object",
                            properties = extractionSetupObject.Fields.ToDictionary(
                                f => f.JsonPropertyName,
                                f => new { type = "string" }
                            ),
                            required = extractionSetupObject.Fields.Select(f => f.JsonPropertyName).ToArray()
                        },
                        tables = new
                        {
                            type = "array",
                            items = extractionSetupObject.Tables.Select(table => new
                            {
                                type = "object",
                                properties = new
                                {
                                    table_name = new { type = "string" },
                                    rows = new
                                    {
                                        type = "array",
                                        items = new
                                        {
                                            type = "object",
                                            properties = table.TableHeaders.ToDictionary(
                                                h => h.JsonPropertyName,
                                                h => new { type = "string" }
                                            ),
                                            required = table.TableHeaders.Select(h => h.JsonPropertyName).ToArray()
                                        }
                                    }
                                },
                                required = new[] { "table_name", "rows" }
                            }).ToArray()
                        }
                    }
                };

                // Return
                return extractionJsonObj;

            // Default case, if the model task name does not match any of the above
            default:
                return null;
        }
    }


    // Generates a task-specific LLM prompt based on the model type and setup configuration.
    private string? GenerateModelPrompt(string name, InferencingModelDto inferencingModelDto)
    {
        // Final prompt that will be returned after template processing
        string finalPrompt = string.Empty;

        // Default prompt to begin with. It will be modified based on the model type.
        var defaultPrompt = new StringBuilder();

        try
        {
            // Switch statement to handle different model types and generate the appropriate prompt
            switch (name)
            {
                case nameof(AIProjectTaskTypesEnum.Extraction):
                    // Handling for Data Extraction model

                    // Initialize builders for field and table extraction instructions
                    var fieldInstruction = new StringBuilder();
                    var tableInstruction = new StringBuilder();

                    // Default prompt for DataExtraction model, or use the one provided in the DTO
                    defaultPrompt.AppendLine(inferencingModelDto.Extraction.NodePrompt ??
                        "You are an expert data extraction algorithm. Your task is to accurately extract relevant data from the provided document.");

                    // Generate field extraction instructions if any fields are provided
                    if (inferencingModelDto.Extraction?.SetupObject?.Fields != null && inferencingModelDto.Extraction.SetupObject.Fields.Any())
                    {
                        foreach (var field in inferencingModelDto.Extraction.SetupObject.Fields)
                        {
                            var instructions = string.IsNullOrEmpty(field.Instructions) ? "" : $", - {field.Instructions}";
                            fieldInstruction.AppendLine($"{field.Index}. {field.Name} (type: {field.Type}){instructions}");
                        }
                    }

                    // Generate table extraction instructions if any tables are provided
                    if (inferencingModelDto.Extraction.SetupObject.Tables != null && inferencingModelDto.Extraction.SetupObject.Tables.Any())
                    {
                        foreach (var table in inferencingModelDto.Extraction.SetupObject.Tables)
                        {
                            string tableNameContext = string.IsNullOrEmpty(table.Context) ? table.Name : $"{table.Name} ({table.Context})";
                            tableInstruction.AppendLine("#### Tables:");
                            tableInstruction.AppendLine($"Extract rows of the {tableNameContext} table with the following columns (if available):");
                            tableInstruction.AppendLine();

                            // Add table column headers if they exist
                            if (table.TableHeaders != null)
                            {
                                foreach (var column in table.TableHeaders)
                                {
                                    var instructions = string.IsNullOrEmpty(column.Instructions) ? "" : $", - {column.Instructions}";
                                    tableInstruction.AppendLine($"{column.Index}. {column.Name} (type: {column.Type}){instructions}");
                                }
                            }
                        }
                    }
                    else
                    {
                        // If no table details are available, provide a fallback message
                        tableInstruction.AppendLine();
                    }

                    // Load the Data Extraction prompt template and replace placeholders
                    finalPrompt = FileTemplateLoaderUtil.LoadAndRenderFile("ExtractionPrompt.txt", new Dictionary<string, string>()
                    {
                        { "{{Prompt}}", defaultPrompt.ToString() },
                        { "{{Context}}", inferencingModelDto.BusinessContext.ToString() },
                        { "{{FieldInstructions}}", fieldInstruction.ToString() },
                        { "{{TableInstructions}}", tableInstruction.ToString() }
                    });
                    break;

                case nameof(AIProjectTaskTypesEnum.Summarization):
                    // Handling for Text Summarization model

                    // Default prompt for Summarization model, or use the one provided in the DTO
                    defaultPrompt.AppendLine(inferencingModelDto.Summarization.NodePrompt ??
                        "You are an expert summarization algorithm. Your task is to generate a concise and accurate summary of the provided document.");

                    // Load the Summarization prompt template and replace placeholders
                    finalPrompt = FileTemplateLoaderUtil.LoadAndRenderFile("SummarizationPrompt.txt", new Dictionary<string, string>()
                    {
                        { "{{Prompt}}", defaultPrompt.ToString() },
                        { "{{Context}}", inferencingModelDto.BusinessContext.ToString() ?? "" },
                        { "{{TotalMinimumWords}}", inferencingModelDto.Summarization.SetupObject.TotalMinimumWords.ToString() },
                        { "{{TotalMaximumWords}}", inferencingModelDto.Summarization.SetupObject.TotalMaximumWords.ToString() }
                    });
                    break;

                case nameof(AIProjectTaskTypesEnum.SentimentAnalytics):
                    // Handling for Sentiment Analysis model

                    // Default prompt for Sentiment Analysis model, or use the one provided in the DTO
                    defaultPrompt.AppendLine(inferencingModelDto.SentimentAnalytics.NodePrompt ??
                        "You are a sentiment analysis algorithm. Your task is to detect and classify the sentiment of the provided text as either positive, negative, or neutral.");

                    // Initialize prompt builder for sentiment analysis categories (if available)
                    var sentimentAnalyticsCategoriesPrompt = new StringBuilder();

                    // Add category-based classification instructions if any categories are defined
                    if (inferencingModelDto.SentimentAnalytics?.SetupObject?.Categories != null && inferencingModelDto.SentimentAnalytics.SetupObject.Categories.Any())
                    {
                        for (int i = 0; i < inferencingModelDto.SentimentAnalytics.SetupObject.Categories.Count; i++)
                        {
                            var category = inferencingModelDto.SentimentAnalytics.SetupObject.Categories[i];
                            var instructions = string.IsNullOrEmpty(category.Instructions) ? "" : $", - {category.Instructions}";
                            sentimentAnalyticsCategoriesPrompt.AppendLine($"- {category.Name}{instructions}");

                            // Check for Main category -> sub-category
                            if (category.SubCategories != null && category.SubCategories.Any())
                            {
                                foreach (var subCategory in category.SubCategories)
                                {
                                    var subCategoryInstructions = string.IsNullOrEmpty(subCategory.Instructions) ? "" : $", - {subCategory.Instructions}";
                                    sentimentAnalyticsCategoriesPrompt.AppendLine($"- {subCategory.Name}{subCategoryInstructions}");

                                    // Check for Main category -> sub-category -> sub-sub-category
                                    if (subCategory.SubSubCategories != null && subCategory.SubSubCategories.Any())
                                    {
                                        foreach (var subSubCategory in subCategory.SubSubCategories)
                                        {
                                            var subSubCategoryInstructions = string.IsNullOrEmpty(subSubCategory.Instructions) ? "" : $", - {subSubCategory.Instructions}";
                                            sentimentAnalyticsCategoriesPrompt.AppendLine($"- {subSubCategory.Name}{subSubCategoryInstructions}");
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Load the Sentiment Analysis prompt template and replace placeholders
                    finalPrompt = FileTemplateLoaderUtil.LoadAndRenderFile("SentimentAnalyticsPrompt.txt", new Dictionary<string, string>()
                    {
                        { "{{Prompt}}", defaultPrompt.ToString() },
                        { "{{Context}}", inferencingModelDto.BusinessContext },
                        { "{{Categories}}", sentimentAnalyticsCategoriesPrompt.ToString() }
                    });
                    break;

                case nameof(AIProjectTaskTypesEnum.Classification):
                    // Handling for Classification model (similar to Sentiment Analytics but for general classification tasks)

                    // Default prompt for Classification model, or use the one provided in the DTO
                    defaultPrompt.AppendLine(inferencingModelDto.Classification.NodePrompt ??
                        "You are a classification algorithm. Your task is to classify the provided text into predefined categories.");

                    // Initialize prompt builder for classification categories (if available)
                    var classificationCategoriesPrompt = new StringBuilder();

                    // Add category-based classification instructions if any categories are defined
                    if (inferencingModelDto.Classification?.SetupObject?.Categories != null && inferencingModelDto.Classification.SetupObject.Categories.Any())
                    {
                        for (int i = 0; i < inferencingModelDto.Classification.SetupObject.Categories.Count; i++)
                        {
                            var category = inferencingModelDto.Classification.SetupObject.Categories[i];
                            var instructions = string.IsNullOrEmpty(category.Instructions) ? "" : $", - {category.Instructions}";
                            classificationCategoriesPrompt.AppendLine($"{category.Name}{instructions}");

                            // Check for Main category -> sub-category
                            if (category.SubCategories != null && category.SubCategories.Any())
                            {
                                foreach (var subCategory in category.SubCategories)
                                {
                                    var subCategoryInstructions = string.IsNullOrEmpty(subCategory.Instructions) ? "" : $", - {subCategory.Instructions}";
                                    classificationCategoriesPrompt.AppendLine($"{subCategory.Name}{subCategoryInstructions}");

                                    // Check for Main category -> sub-category -> sub-sub-category
                                    if (subCategory.SubSubCategories != null && subCategory.SubSubCategories.Any())
                                    {
                                        foreach (var subSubCategory in subCategory.SubSubCategories)
                                        {
                                            var subSubCategoryInstructions = string.IsNullOrEmpty(subSubCategory.Instructions) ? "" : $", - {subSubCategory.Instructions}";
                                            classificationCategoriesPrompt.AppendLine($"{subSubCategory.Name}{subSubCategoryInstructions}");
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Load the Classification prompt template and replace placeholders
                    finalPrompt = FileTemplateLoaderUtil.LoadAndRenderFile("ClassificationPrompt.txt", new Dictionary<string, string>()
                    {
                        { "{{Prompt}}", defaultPrompt.ToString() },
                        { "{{Context}}", inferencingModelDto.BusinessContext },
                        { "{{AllowMultipleClasses}}", inferencingModelDto.Classification.SetupObject.AllowMultipleClasses.ToString() },
                        { "{{Categories}}", classificationCategoriesPrompt.ToString() }
                    });
                    break;

                case nameof(AIProjectTaskTypesEnum.QuestionAnswer):
                    // Handling for Question Answering model

                    // Default prompt for Question Answer model, or use the one provided in the DTO
                    defaultPrompt.AppendLine(inferencingModelDto.QuestionAnswer.NodePrompt ??
                        "You are a question-answering algorithm. Your task is to provide concise and accurate answers to the following questions based on the context.");

                    // Initialize prompt builder for question-answer pairs (if available)
                    var questionAnswerPrompt = new StringBuilder();

                    // Add predefined question-answer pairs if available
                    if (inferencingModelDto.QuestionAnswer.SetupObject?.QuestionAnswers != null && inferencingModelDto.QuestionAnswer.SetupObject.QuestionAnswers.Any())
                    {
                        for (int i = 0; i < inferencingModelDto.QuestionAnswer.SetupObject.QuestionAnswers.Count; i++)
                        {
                            var questionAnswer = inferencingModelDto.QuestionAnswer.SetupObject.QuestionAnswers[i];
                            var instructions = string.IsNullOrEmpty(questionAnswer.Instructions) ? "" : $" Explicit instructions for this question → {questionAnswer.Instructions}";
                            instructions = instructions.Replace("\n", " ").Trim();
                            questionAnswerPrompt.AppendLine($"Question #{i + 1}: {questionAnswer.Name}{instructions}");
                        }
                    }

                    // Load the Question Answering prompt template and replace placeholders
                    finalPrompt = FileTemplateLoaderUtil.LoadAndRenderFile("QuestionAnswerPrompt.txt", new Dictionary<string, string>()
                    {
                        { "{{Prompt}}", defaultPrompt.ToString() },
                        { "{{Context}}", inferencingModelDto.BusinessContext },
                        { "{{Questions}}", questionAnswerPrompt.ToString() }
                    });
                    break;

                // Default case when no match is found for the model type
                default:
                    return "Model type not supported.";
            }
        }
        catch (Exception ex)
        {
            // Log the exception (optional: use a logging framework here)
            _logger.LogError($"An error occurred while generating the prompt: {ex.ToString()}");
        }

        // Return the final generated prompt after replacing newline characters
        return finalPrompt;
    }

    // Maps tasks from an ML model to the appropriate properties in the InferencingModelDto. Each task is deserialized based on its type into a strongly-typed DTO.
    private void GetInferencingModelSetup(List<VersionTask>? modelTasks, InferencingModelDto inferencingModelDto)
    {
        // Exit early if the ML model tasks list is null or empty
        if (modelTasks == null || !modelTasks.Any())
            return;

        // Configure JSON deserialization to ignore case sensitivity in property names
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        // Iterate over each task in the ML model
        foreach (var mlTask in modelTasks)
        {
            // Determine the type of task and deserialize accordingly
            switch (mlTask.Name)
            {
                case nameof(AIProjectTaskTypesEnum.Extraction):
                    var extractionDto = new ExtractionTaskDto
                    {
                        Id = mlTask.Id,
                        Name = mlTask.Name,
                        SetupObject = JsonSerializer.Deserialize<ExtractionTaskSetupDto>(mlTask.SetupObject ?? null, jsonOptions),
                        LLM = mlTask.LLM,
                        ConfigurationType = mlTask.IsBYOKEnabled ? LLMConfigurationTypesEnum.Cloud : LLMConfigurationTypesEnum.OnPrem,
                        NodePrompt = mlTask.SystemPrompt,
                        Temperature = mlTask.Temperature
                    };
                    inferencingModelDto.Extraction = extractionDto;
                    break;

                case nameof(AIProjectTaskTypesEnum.Classification):
                    var classificationDto = new ClassificationTaskDto
                    {
                        Id = mlTask.Id,
                        Name = mlTask.Name,
                        SetupObject = JsonSerializer.Deserialize<ClassificationTaskSetupDto>(mlTask.SetupObject ?? null, jsonOptions),
                        LLM = mlTask.LLM,
                        ConfigurationType = mlTask.IsBYOKEnabled ? LLMConfigurationTypesEnum.Cloud : LLMConfigurationTypesEnum.OnPrem,
                        NodePrompt = mlTask.SystemPrompt,
                        Temperature = mlTask.Temperature
                    };
                    inferencingModelDto.Classification = classificationDto;
                    break;

                case nameof(AIProjectTaskTypesEnum.SentimentAnalytics):
                    var sentimentDto = new SentimentAnalyticsTaskSDto
                    {
                        Id = mlTask.Id,
                        Name = mlTask.Name,
                        SetupObject = JsonSerializer.Deserialize<SentimentAnalyticsTaskSetupDto>(mlTask.SetupObject ?? null, jsonOptions),
                        LLM = mlTask.LLM,
                        ConfigurationType = mlTask.IsBYOKEnabled ? LLMConfigurationTypesEnum.Cloud : LLMConfigurationTypesEnum.OnPrem,
                        NodePrompt = mlTask.SystemPrompt,
                        Temperature = mlTask.Temperature
                    };
                    inferencingModelDto.SentimentAnalytics = sentimentDto;
                    break;

                case nameof(AIProjectTaskTypesEnum.QuestionAnswer):
                    var questionAnswerDto = new QuestionAnswerTaskDto
                    {
                        Id = mlTask.Id,
                        Name = mlTask.Name,
                        SetupObject = JsonSerializer.Deserialize<QuestionAnswerTaskSetupDto>(mlTask.SetupObject ?? null, jsonOptions),
                        LLM = mlTask.LLM,
                        ConfigurationType = mlTask.IsBYOKEnabled ? LLMConfigurationTypesEnum.Cloud : LLMConfigurationTypesEnum.OnPrem,
                        NodePrompt = mlTask.SystemPrompt,
                        Temperature = mlTask.Temperature
                    };
                    inferencingModelDto.QuestionAnswer = questionAnswerDto;
                    break;

                case nameof(AIProjectTaskTypesEnum.Summarization):
                    var summarizationDto = new SummarizationTaskDto
                    {
                        Id = mlTask.Id,
                        Name = mlTask.Name,
                        SetupObject = JsonSerializer.Deserialize<SummarizationTaskSetupDto>(mlTask.SetupObject ?? null, jsonOptions),
                        LLM = mlTask.LLM,
                        ConfigurationType = mlTask.IsBYOKEnabled ? LLMConfigurationTypesEnum.Cloud : LLMConfigurationTypesEnum.OnPrem,
                        NodePrompt = mlTask.SystemPrompt,
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
