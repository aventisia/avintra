
namespace MLModelBuilderAPIs.Services;

public class GenerativeModelService : IGenerativeModelService
{
    private readonly ILogger<GenerativeModelService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILLMDataExtractionService _llmDataExtractionService;
    private readonly Guid _userId;

    public GenerativeModelService(
        ILogger<GenerativeModelService> logger,
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

    // Gets the model setup for a specific generative model using its unique ML model ID.
    public async Task<ServiceResponse<GenerativeModelDto>> GetSetupByMLModelIdAsync(Guid mlModelId)
    {
        // Initialize the response with a failure state and default message
        var serviceResponse = new ServiceResponse<GenerativeModelDto>
        {
            Data = null,
            Message = "Failed to retrieve the generative model setup. Please try again later."
        };

        try
        {
            // Log the beginning of the retrieval process with the ML model ID
            _logger.LogInformation("Attempting to retrieve generative model setup for ML model with ID: {MLModelId}", mlModelId);

            // Fetch the model setup from the database by its ML model ID, including related user and task data
            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mlModelId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.GenerativeModel)
                .SingleOrDefaultAsync();

            // If no model setup is found, log a warning and return an appropriate message
            if (mlModel == null)
            {
                _logger.LogWarning("No model setup found for ML model with ID: {MLModelId}", mlModelId);
                serviceResponse.Message = "No generative model setup exists for the provided ML model ID.";
                return serviceResponse;
            }

            // Log the successful retrieval of the model setup
            _logger.LogInformation("Successfully retrieved model setup for ML model with ID: {MLModelId}", mlModelId);

            // Adapt the retrieved ML model to the corresponding DTO (Data Transfer Object)
            var generativeModelDto = mlModel.Adapt<GenerativeModelDto>();

            // Retrieve the list of Generative tasks and add it to the model DTO
            if (mlModel.GenerativeModel != null)
            {
                generativeModelDto.GenerativeModel = mlModel.GenerativeModel.Adapt<GenerativeModelDefaultSetupDto>();
            }
            // if (mlModel.GenerativeModel != null)
            // {
            //     var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            //     // Map the generative model to the DTO
            //     generativeModelDto.GenerativeModel = mlModel.GenerativeModel.Adapt<GenerativeModelDefaultSetupDto>();

            //     // Deserialize the setup data based on the GenerativeModel type
            //     object? setupData = null;
            //     switch (generativeModelDto.GenerativeModel.Name)
            //     {
            //         case GenerativeModelTypesEnum.ThoughtLeadership:
            //             setupData = JsonSerializer.Deserialize<ThoughtLeadershipModelConfigDto>(mlModel.GenerativeModel.SetupObject, options);
            //             break;

            //         case GenerativeModelTypesEnum.CompanyDeepDive:
            //             setupData = JsonSerializer.Deserialize<CompanyProfileGenerationConfigDto>(mlModel.GenerativeModel.SetupObject, options);
            //             break;

            //         case GenerativeModelTypesEnum.DocumentDrafting:
            //             setupData = JsonSerializer.Deserialize<DocumentDraftingConfigDto>(mlModel.GenerativeModel.SetupObject, options);
            //             break;

            //         case GenerativeModelTypesEnum.PersonaResearch:
            //             setupData = JsonSerializer.Deserialize<PersonaResearchConfigDto>(mlModel.GenerativeModel.SetupObject, options);
            //             break;

            //         case GenerativeModelTypesEnum.RFP_RPI_ResponseGenerator:
            //             setupData = JsonSerializer.Deserialize<RFPResponseGenerationConfigDto>(mlModel.GenerativeModel.SetupObject, options);
            //             break;
            //         default:
            //             setupData = null;
            //             break;
            //     }

            //     // Assign the setup data to the DTO property (ensure there's a property in your DTO to hold this)
            //     generativeModelDto.GenerativeModel.SetupObject = setupData;
            // }


            // Map the adapted model setup (including tasks) to the response DTO
            serviceResponse.Data = generativeModelDto;

            // Set the success response status and message
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Generative model setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log the exception details if an error occurs during the process
            _logger.LogError("Error occurred while retrieving generative model setup for ML model with ID: {MLModelId}. Exception: {ExceptionMessage}", mlModelId, ex.Message);
        }

        // Return the service response (either successful or failure)
        return serviceResponse;
    }

    // Updates an existing generative model setup and its associated AI persona configuration.
    public async Task<ServiceResponse<GenerativeModelDto>> UpdateSetupAsync(GenerativeModelDto generativeModelDto)
    {
        // Initialize default failure response
        var serviceResponse = new ServiceResponse<GenerativeModelDto>
        {
            Data = null,
            Message = "Failed to update generative model. Please try again later."
        };

        try
        {
            _logger.LogInformation("Starting update for generative model | Model ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);

            // Validate input DTO
            if (!ValidateModelSetupDto(generativeModelDto.GenerativeModel, out string? validationMessage))
            {
                _logger.LogWarning("Model setup validation failed: {ValidationMessage}", validationMessage);
                serviceResponse.Message = validationMessage;
                return serviceResponse;
            }

            // Retrieve the existing ML model from the database, including any associated generative tasks
            var existingModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(m => m.Id == generativeModelDto.Id)
                .Include(m => m.GenerativeModel)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Handle case where the model does not exist
            if (existingModel == null)
            {
                _logger.LogWarning("generative model not found | ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);
                serviceResponse.Message = "generative model not found.";
                return serviceResponse;
            }

            // Prevent modifications to published models
            if (existingModel.IsPublished)
            {
                _logger.LogWarning("Modification blocked for published model | ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);
                serviceResponse.Message = "Published models cannot be modified.";
                return serviceResponse;
            }

            // Trim string values from the incoming DTO to avoid invalid whitespace issues
            generativeModelDto = TrimDtoStringPropsUtil.TrimDtoStringProps(generativeModelDto);

            _logger.LogInformation("Applying updates to base model entity | Model ID: {Id}", generativeModelDto.Id);

            // Map changes from DTO to existing model entity
            existingModel.Type = ModelTypesEnum.Generative;
            existingModel.SetupStatus = SetupStatusTypesEnum.Completed;
            existingModel.LastModifiedByUserId = _userId;

            // Update base model in the database
            _unitOfWork.MLModelRepo.Update(existingModel);

            // Save base model changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save base model changes | Model ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);
                return serviceResponse;
            }
            
            var generativeModel = existingModel.GenerativeModel;

            if (generativeModel == null)
            {
                // No existing task — create a new generative persona
                var newGenerativeModel = generativeModelDto.GenerativeModel.Adapt<GenerativeModel>();
                newGenerativeModel.MLModelId = existingModel.Id;
                newGenerativeModel.CreatedByUserId = _userId;
                newGenerativeModel.LastModifiedByUserId = _userId;

                await _unitOfWork.GenerativeModelRepo.InsertAsync(newGenerativeModel);
            }
            else
            {
                // Existing task found — update it from the DTO
                generativeModelDto.GenerativeModel.Adapt(generativeModel);
                generativeModel.LastModifiedByUserId = _userId;

                _unitOfWork.GenerativeModelRepo.Update(generativeModel);
            }

            // Save changes to the persona task
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save AI persona changes | Model ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);
                return serviceResponse;
            }

            _logger.LogInformation("generative model update successful | Model ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);

            // Return successful response with updated data
            serviceResponse.Data = existingModel.Adapt<GenerativeModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "generative model updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating generative model | Model ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);
        }

        return serviceResponse;
    }

    // Validates the SetupObject in a GenerativeModelDefaultSetupDto by deserializing it into the expected config DTO based on the specified model type. Logs detail for troubleshooting and returns a concise validation message on failure.
    private bool ValidateModelSetupDto(GenerativeModelDefaultSetupDto modelSetupDto, out string? validationMessage)
    {
        validationMessage = null;

        // Log which model type we're attempting to validate
        _logger.LogInformation("Validating setup object for model type: {ModelType}", modelSetupDto.Name);

        // ✅ Check 1: SetupObject must not be null
        if (modelSetupDto.SetupObject == null)
        {
            validationMessage = "Setup data is missing.";
            _logger.LogWarning("Validation failed: SetupObject is null.");
            return false;
        }

        // ✅ Step 2: Serialize SetupObject to JSON for generic-to-concrete type conversion
        string setupObjectJson = JsonSerializer.Serialize(modelSetupDto.SetupObject);

        // Enable case-insensitive property matching during deserialization
        var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        try
        {
            // ✅ Step 3: Match model type to expected DTO and attempt deserialization
            switch (modelSetupDto.Name)
            {
                case GenerativeModelTypesEnum.ThoughtLeadership:
                    // 🎯 Expecting ThoughtLeadershipModelConfigDto
                    var thoughtLeadership = JsonSerializer.Deserialize<ThoughtLeadershipModelConfigDto>(setupObjectJson, jsonOptions);
                    if (thoughtLeadership == null)
                    {
                        validationMessage = "Invalid Thought Leadership setup data.";
                        _logger.LogWarning("Deserialization to ThoughtLeadershipModelConfigDto failed.");
                        return false;
                    }
                    break;

                case GenerativeModelTypesEnum.PersonaResearch:
                    // 🎯 Expecting PersonaResearchConfigDto
                    var personaResearch = JsonSerializer.Deserialize<PersonaResearchConfigDto>(setupObjectJson, jsonOptions);
                    if (personaResearch == null)
                    {
                        validationMessage = "Invalid Persona Research setup data.";
                        _logger.LogWarning("Deserialization to PersonaResearchConfigDto failed.");
                        return false;
                    }
                    break;

                case GenerativeModelTypesEnum.CompanyDeepDive:
                    // 🎯 Expecting CompanyProfileGenerationConfigDto
                    var companyProfile = JsonSerializer.Deserialize<CompanyProfileGenerationConfigDto>(setupObjectJson, jsonOptions);
                    if (companyProfile == null)
                    {
                        validationMessage = "Invalid Company Deep Dive setup data.";
                        _logger.LogWarning("Deserialization to CompanyProfileGenerationConfigDto failed.");
                        return false;
                    }
                    break;

                case GenerativeModelTypesEnum.RFPResponseGenerator:
                    // 🎯 Expecting RFPResponseGenerationConfigDto
                    var rfpResponse = JsonSerializer.Deserialize<RFPResponseGenerationConfigDto>(setupObjectJson, jsonOptions);
                    if (rfpResponse == null)
                    {
                        validationMessage = "Invalid RFP/RPI Response Generator setup data.";
                        _logger.LogWarning("Deserialization to RFPResponseGenerationConfigDto failed.");
                        return false;
                    }
                    break;

                case GenerativeModelTypesEnum.DocumentDrafting:
                    // 🎯 Expecting DocumentDraftingConfigDto
                    var documentDraft = JsonSerializer.Deserialize<DocumentDraftingConfigDto>(setupObjectJson, jsonOptions);
                    if (documentDraft == null)
                    {
                        validationMessage = "Invalid Document Drafting setup data.";
                        _logger.LogWarning("Deserialization to DocumentDraftingConfigDto failed.");
                        return false;
                    }
                    break;

                default:
                    // ❌ Unsupported or unknown model type
                    validationMessage = $"Unsupported model type: {modelSetupDto.Name}.";
                    _logger.LogWarning("Validation failed: Unsupported model type '{ModelType}'", modelSetupDto.Name);
                    return false;
            }
        }
        catch (JsonException ex)
        {
            // ❌ JSON structure is invalid or doesn't match expected schema
            validationMessage = "Malformed JSON in setup data.";
            _logger.LogError(ex, "Deserialization error during validation for model type: {ModelType}", modelSetupDto.Name);
            return false;
        }

        // ✅ Final check: All steps passed without failure
        _logger.LogInformation("Setup validation succeeded for model type: {ModelType}.", modelSetupDto.Name);
        return true;
    }
}

