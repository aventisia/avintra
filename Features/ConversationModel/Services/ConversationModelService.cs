namespace MLModelBuilderAPIs.Services;

public class ConversationModelService : IConversationModelService
{
    private readonly ILogger<ConversationModelService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILLMDataExtractionService _llmDataExtractionService;
    private readonly Guid _userId;

    public ConversationModelService(
        ILogger<ConversationModelService> logger,
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

    // Gets the model setup for a specific conversation model using its unique ML model ID.
    public async Task<ServiceResponse<ConversationModelDto>> GetSetupByMLModelIdAsync(Guid mlModelId)
    {
        // Initialize the response with a failure state and default message
        var serviceResponse = new ServiceResponse<ConversationModelDto>
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
            var conversationModelDto = mlModel.Adapt<ConversationModelDto>();

            // Retrieve the list of Conversation tasks and add it to the model DTO
            var aiPersona = mlModel.Tasks.FirstOrDefault(w => w.Name == "AIPersona");
            if (aiPersona != null)
            {
                conversationModelDto.AIPersona = aiPersona.Adapt<ConversationModelSetupTaskDto>();

                // Deserialize the SetupObject for AIPersona task and assign it to the DTO
                conversationModelDto.AIPersona.SetupObject = JsonSerializer.Deserialize<ConversationModelSetupDto>(
                    aiPersona.SetupObject, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                // Check if deserialization succeeded, you can add error handling here
                if (conversationModelDto.AIPersona == null)
                {
                    _logger.LogWarning("Failed to deserialize AIPersona task setup object for Model ID: {Id}", mlModel.Id);
                }
            }

            // Map the adapted model setup (including tasks) to the response DTO
            serviceResponse.Data = conversationModelDto;

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

    // Updates the configuration for an Conversation model setup.
    public async Task<ServiceResponse<ConversationModelDto>> UpdateSetupAsync(ConversationModelDto modelSetupDto)
    {
        // Prepare default failure response
        var serviceResponse = new ServiceResponse<ConversationModelDto>
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
            mlModel.Type = ModelTypesEnum.Conversation;
            mlModel.SetupStatus = SetupStatusTypesEnum.Completed;
            mlModel.LastModifiedByUserId = _userId;

            _logger.LogInformation("Saving model changes to database | Model ID: {Id}", modelSetupDto.Id);
            _unitOfWork.MLModelRepo.Update(mlModel);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save model changes | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
                return serviceResponse;
            }

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };


            if (modelSetupDto.AIPersona != null)
            {
                var existingTask = mlModel.Tasks.FirstOrDefault(t => t.Name == "AIPersona");
                if (existingTask == null)
                {
                    // Task does not exist — create a new task entity from the DTO
                    var newTask = modelSetupDto.AIPersona.Adapt<ModelTask>();
                    newTask.MLModelId = mlModel.Id;
                    newTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.AIPersona.SetupObject, options);
                    newTask.CreatedByUserId = _userId;
                    newTask.LastModifiedByUserId = _userId;

                    await _unitOfWork.ModelTaskRepo.InsertAsync(newTask);

                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogError("Failed to save new tasks | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
                        return serviceResponse;
                    }
                }
                else
                {
                    // Task already exists — update its properties from the DTO
                    modelSetupDto.AIPersona.Adapt(existingTask);
                    existingTask.SetupObject = JsonSerializer.Serialize(modelSetupDto.AIPersona, options);
                    existingTask.LastModifiedByUserId = _userId;

                    _unitOfWork.ModelTaskRepo.Update(existingTask);

                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogError("Failed to save updated tasks | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);
                        return serviceResponse;
                    }
                }
            }

            _logger.LogInformation("Model setup update completed successfully | Model ID: {Id} | User ID: {UserId}", modelSetupDto.Id, _userId);

            // Return success response with updated model data
            serviceResponse.Data = mlModel.Adapt<ConversationModelDto>();
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
}

