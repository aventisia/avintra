
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

    // Gets the model setup for a specific generative model using its unique AI project ID.
    public async Task<ServiceResponse<GenerativeModelDto>> GetSetupByAIProjectIdAsync(Guid aiProjectId, Guid? aiProjectVersionId)
    {
        // Initialize the response with a failure state and default message
        var serviceResponse = new ServiceResponse<GenerativeModelDto>
        {
            Data = null,
            Message = "Failed to retrieve the generative model setup. Please try again later."
        };

        try
        {
            // Log the beginning of the retrieval process with the AI project ID
            _logger.LogInformation("Attempting to retrieve generative model setup for AI project with ID: {AIProjectId}", aiProjectId);

            // Fetch the AI project from the database by its ID, including related user and task data
            var aiProject = await _unitOfWork.AIProjectRepo
                .GetByConditionAsync(w =>
                    w.Id == aiProjectId &&
                    (
                        w.CreatedByUserId == _userId ||
                        (w.ProjectUsers != null && w.ProjectUsers.Any(a => a.UserId == _userId))
                    )
                )
                .Include(i => i.ProjectUsers)
                .Include(i => i.CreatedByUser)
                .Include(i => i.Versions!)
                .ThenInclude(i2 => i2.Tasks)
                .SingleOrDefaultAsync();

            // If no AI project is found, log a warning and return an appropriate message
            if (aiProject == null)
            {
                _logger.LogWarning("No AI project found with ID: {AIProjectId}", aiProjectId);
                serviceResponse.Message = "No generative model setup exists for the provided AI project ID.";
                return serviceResponse;
            }

            // Log the successful retrieval of the AI project
            _logger.LogInformation("Successfully retrieved generative model setup for AI project with ID: {AIProjectId}", aiProjectId);

            // Adapt the retrieved AI project to the corresponding DTO (Data Transfer Object)
            var generativeModelDto = aiProject.Adapt<GenerativeModelDto>();

            // Get the AI project version, either by version ID or the latest one
            var aiProjectVersion = aiProject.Versions.FirstOrDefault(v => v.Id == generativeModelDto.AIProjectVersionId)
                ?? aiProject.Versions.OrderByDescending(o => o.VersionNumber).FirstOrDefault();

            // Retrieve the list of generative tasks and add it to the model DTO
            if (aiProjectVersion?.Tasks?.Any() == true)
            {
                generativeModelDto.GenerativeModel = aiProjectVersion.Tasks.FirstOrDefault().Adapt<GenerativeModelDefaultSetupDto>();
            }

            // Map the adapted model setup (including tasks) to the response DTO
            serviceResponse.Data = generativeModelDto;

            // Set the success response status and message
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Generative model setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log the exception details if an error occurs during the process
            _logger.LogError("Error occurred while retrieving generative model setup for AI project with ID: {AIProjectId}. Exception: {ExceptionMessage}", aiProjectId, ex.Message);
        }

        // Return the service response (either successful or failure)
        return serviceResponse;
    }

    // Updates an existing AI project setup and its associated generative model configuration.
    public async Task<ServiceResponse<GenerativeModelDto>> UpdateSetupAsync(GenerativeModelDto generativeModelDto)
    {
        // Initialize default failure response
        var serviceResponse = new ServiceResponse<GenerativeModelDto>
        {
            Data = null,
            Message = "Failed to update AI project setup. Please try again later."
        };

        try
        {
            _logger.LogInformation("Starting update for AI project | Project ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);

            // Validate input DTO
            if (!ValidateModelSetupDto(generativeModelDto.GenerativeModel, out string? validationMessage))
            {
                _logger.LogWarning("AI project setup validation failed: {ValidationMessage}", validationMessage);
                serviceResponse.Message = validationMessage;
                return serviceResponse;
            }

            // Retrieve the existing AI project from the database
            var aiProject = await _unitOfWork.AIProjectRepo
                .GetByConditionAsync(w =>
                    w.Id == generativeModelDto.Id &&
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

            if (aiProject == null)
            {
                _logger.LogWarning("AI project not found | ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);
                serviceResponse.Message = "AI project not found.";
                return serviceResponse;
            }

            // Check if user is creator or has edit/owner access
            var userAccess = aiProject.ProjectUsers?.FirstOrDefault(w =>
                w.AIProjectId == aiProject.Id &&
                w.UserId == _userId &&
                (w.AccessType == ProjectUserAccessEnum.Owner || w.AccessType == ProjectUserAccessEnum.Edit)
            );

            if (aiProject.CreatedByUserId != _userId && userAccess == null)
            {
                _logger.LogWarning("Unauthorized update attempt on AI project | Project ID: {ProjectId} | User ID: {UserId}", aiProject.Id, _userId);
                serviceResponse.Message = "You do not have access to update this AI project.";
                return serviceResponse;
            }

            // Get the AI project version
            var aiProjectVersion = aiProject.Versions.FirstOrDefault(v => v.Id == generativeModelDto.AIProjectVersionId)
                ?? aiProject.Versions.OrderByDescending(o => o.VersionNumber).FirstOrDefault();

            // Prevent updates to published versions
            if (aiProjectVersion?.IsPublished == true)
            {
                _logger.LogWarning("Modification blocked for published AI project version | Project ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);
                serviceResponse.Message = "Published AI project versions cannot be modified.";
                return serviceResponse;
            }

            // Trim DTO string properties to prevent whitespace issues
            generativeModelDto = TrimDtoStringPropsUtil.TrimDtoStringProps(generativeModelDto);

            _logger.LogInformation("Applying updates to AI project entity | Project ID: {Id}", generativeModelDto.Id);

            if (aiProject.Type == null)
            {
                // Update base AI project
                aiProject.Type = AIProjectTypeEnum.Generative;
                aiProject.LastModifiedByUserId = _userId;
                _unitOfWork.AIProjectRepo.Update(aiProject);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save AI project changes | Project ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);
                    return serviceResponse;
                }

            }
            // Handle version task (generative model setup)
            var versionTask = aiProjectVersion?.Tasks.FirstOrDefault();

            if (versionTask == null)
            {
                // Create a new task (generative persona setup)
                versionTask = generativeModelDto.GenerativeModel.Adapt<VersionTask>();
                versionTask.GeneratedPrompt = await GeneratePromptForModelSetupAsync(generativeModelDto.GenerativeModel);
                versionTask.SystemPrompt = generativeModelDto.GenerativeModel.NodePrompt;
                versionTask.AIProjectId = aiProject.Id;
                versionTask.AIProjectVersionId = aiProjectVersion.Id;
                versionTask.Version = 1;
                versionTask.CreatedByUserId = _userId;
                versionTask.LastModifiedByUserId = _userId;

                await _unitOfWork.VersionTaskRepo.InsertAsync(versionTask);
            }
            else
            {
                // Update existing task
                generativeModelDto.GenerativeModel.Adapt(versionTask);
                versionTask.GeneratedPrompt = await GeneratePromptForModelSetupAsync(generativeModelDto.GenerativeModel);
                versionTask.SystemPrompt = generativeModelDto.GenerativeModel.NodePrompt;
                versionTask.LastModifiedByUserId = _userId;

                _unitOfWork.VersionTaskRepo.Update(versionTask);
            }

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save generative model task changes | Project ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);
                return serviceResponse;
            }

            _logger.LogInformation("AI project update successful | Project ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);

            // Return successful result
            serviceResponse.Data = aiProject.Adapt<GenerativeModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI project setup updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating AI project setup | Project ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);
        }

        return serviceResponse;
    }

    // Updates the generative model setup and executes it to generate a response using the configured AI persona.
    public async Task<ServiceResponse<ConversationHistoryDto>> UpdateAndExecuteAsync(GenerativeModelDto generativeModelDto, Guid? conversationId)
    {
        var serviceResponse = new ServiceResponse<ConversationHistoryDto>
        {
            Data = null,
            Message = "Failed to update and execute generative model. Please try again later."
        };

        try
        {
            _logger.LogInformation("Initiating update and execution for Generative Model | Project ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);

            // Validate the input DTO
            if (!ValidateModelSetupDto(generativeModelDto.GenerativeModel, out string? validationMessage))
            {
                _logger.LogWarning("Validation failed for Generative Model setup | Reason: {ValidationMessage}", validationMessage);
                serviceResponse.Message = validationMessage;
                return serviceResponse;
            }

            // Retrieve the target AI project, including users, versions, and tasks
            var aiProject = await _unitOfWork.AIProjectRepo
                .GetByConditionAsync(w => w.Id == generativeModelDto.Id)
                .AsNoTracking()
                .Include(i => i.ProjectUsers)
                .Include(i => i.Versions!)
                    .ThenInclude(i2 => i2.Tasks)
                .SingleOrDefaultAsync();

            if (aiProject == null)
            {
                _logger.LogWarning("AI Project not found | Project ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);
                serviceResponse.Message = "AI Project not found.";
                return serviceResponse;
            }

            // Select the appropriate project version
            var aiProjectVersion = aiProject.Versions.FirstOrDefault(v => v.Id == generativeModelDto.AIProjectVersionId)
                ?? aiProject.Versions.OrderByDescending(o => o.VersionNumber).FirstOrDefault();

            if (aiProjectVersion?.IsPublished == true)
            {
                _logger.LogWarning("Attempt to modify a published project version blocked | Project ID: {Id} | User ID: {UserId}", aiProject.Id, _userId);
                serviceResponse.Message = "Modifications to published project versions are not allowed.";
                return serviceResponse;
            }

            // Sanitize DTO strings
            generativeModelDto = TrimDtoStringPropsUtil.TrimDtoStringProps(generativeModelDto);

            _logger.LogInformation("Updating AI Project metadata | Project ID: {Id}", aiProject.Id);

            if (aiProject.Type == null)
            {
                // Update project base information
                aiProject.Type = AIProjectTypeEnum.Generative;
                aiProject.LastModifiedByUserId = _userId;
                _unitOfWork.AIProjectRepo.Update(aiProject);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save updates to AI Project | Project ID: {Id} | User ID: {UserId}", aiProject.Id, _userId);
                    return serviceResponse;
                }
            }

            // Retrieve or initialize the version task (AI persona setup)
            var versionTask = aiProjectVersion?.Tasks.FirstOrDefault();

            if (versionTask == null)
            {
                _logger.LogInformation("No existing generative task found; creating new one | Project ID: {Id}", aiProject.Id);

                versionTask = generativeModelDto.GenerativeModel.Adapt<VersionTask>();
                versionTask.GeneratedPrompt = await GeneratePromptForModelSetupAsync(generativeModelDto.GenerativeModel);
                versionTask.SystemPrompt = generativeModelDto.GenerativeModel.NodePrompt;
                versionTask.AIProjectId = aiProject.Id;
                versionTask.AIProjectVersionId = aiProjectVersion?.Id ?? Guid.Empty;
                versionTask.CreatedByUserId = _userId;
                versionTask.LastModifiedByUserId = _userId;

                await _unitOfWork.VersionTaskRepo.InsertAsync(versionTask);
            }
            else
            {
                _logger.LogInformation("Updating existing generative task | Task ID: {TaskId}", versionTask.Id);

                generativeModelDto.GenerativeModel.Adapt(versionTask);
                versionTask.GeneratedPrompt = await GeneratePromptForModelSetupAsync(generativeModelDto.GenerativeModel);
                versionTask.SystemPrompt = generativeModelDto.GenerativeModel.NodePrompt;
                versionTask.LastModifiedByUserId = _userId;

                _unitOfWork.VersionTaskRepo.Update(versionTask);
            }

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes to Generative Task | Project ID: {Id} | User ID: {UserId}", aiProject.Id, _userId);
                return serviceResponse;
            }

            _logger.LogInformation("Generative model update successful | Project ID: {Id}", aiProject.Id);

            // Execute prompt via LLM
            var llmResponse = await _llmDataExtractionService.ExtractDataAsync(
                versionTask.GeneratedPrompt,
                versionTask.LLM,
                versionTask.Temperature,
                UsageSourceTypesEnum.AIModel,
                generativeModelDto.AIProjectVersionId,
                generativeModelDto.Name,
                null
            );

            // Create conversation history from LLM output
            var conversationHistory = new ConversationHistory
            {
                AIProjectId = aiProject.Id,
                Message = llmResponse.Data ?? string.Empty,
                ParticipantType = ParticipantTypesEnum.Bot,
                ParticipantName = nameof(ParticipantTypesEnum.Bot),
                ConversationId = conversationId ?? Guid.NewGuid(),
                IsUserMessage = false
            };

            await _unitOfWork.ConversationHistoryRepo.InsertAsync(conversationHistory);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist conversation history | Project ID: {Id} | User ID: {UserId}", aiProject.Id, _userId);
                return serviceResponse;
            }

            // Final success response
            serviceResponse.StatusCode = 200;
            serviceResponse.Data = conversationHistory.Adapt<ConversationHistoryDto>();
            serviceResponse.Message = "Generative model updated and executed successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while updating/executing generative model | Project ID: {Id} | User ID: {UserId}", generativeModelDto.Id, _userId);
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

    // Generate prompt for generative model
    private async Task<string> GeneratePromptForModelSetupAsync(GenerativeModelDefaultSetupDto generativeModelDefaultSetupDto)
    {
        var generatedPrompt = string.Empty;

        // Step 1: Serialize the SetupObject into JSON for deserialization into the appropriate DTO
        string setupObjectJson = JsonSerializer.Serialize(generativeModelDefaultSetupDto.SetupObject);

        // Configure JSON deserialization options to handle case-insensitive property matching
        var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        try
        {
            // Step 2: Match model type to expected DTO and attempt deserialization
            switch (generativeModelDefaultSetupDto.Name)
            {
                case GenerativeModelTypesEnum.ThoughtLeadership:
                    // Expected DTO: ThoughtLeadershipModelConfigDto
                    var thoughtLeadership = JsonSerializer.Deserialize<ThoughtLeadershipModelConfigDto>(setupObjectJson, jsonOptions);
                    if (thoughtLeadership != null)
                    {
                        // Pre-build the reference materials section before interpolating
                        string referenceMaterialsSection = string.Empty;

                        if (thoughtLeadership.Documents.Any())
                        {
                            var lines = new List<string> { "Reference Documents:" };

                            for (int i = 0; i < thoughtLeadership.Documents.Count; i++)
                            {
                                var doc = thoughtLeadership.Documents[i];
                                var extractedText = await _llmDataExtractionService.GetFileTextAsync(doc.Path);
                                lines.Add($"{i + 1}. {extractedText}");
                            }

                            referenceMaterialsSection = string.Join("\n", lines);
                        }

                        generatedPrompt = $@"SYSTEM PROMPT
                            {(!string.IsNullOrWhiteSpace(generativeModelDefaultSetupDto.NodePrompt)
                                ? generativeModelDefaultSetupDto.NodePrompt
                                : "You are an expert technical writer and content strategist. Your task is to draft high-quality documents tailored to specific business needs, using clear structure, tone, and formatting. Always follow the provided guidelines exactly.")}

                            OBJECTIVE
                            Produce an insightful and original {thoughtLeadership?.DocumentType ?? "{{Document Type}}"} demonstrating deep expertise in {thoughtLeadership?.Industry ?? "{{Industry}}"}. Crafted for {thoughtLeadership?.AudienceTarget ?? "{{Target Audience}}"}, focused on {thoughtLeadership?.Purpose ?? "{{Purpose}}"}, with a consistent {thoughtLeadership?.ToneStyle ?? "{{Tone and Style}}"} tone.

                            INPUT DETAILS
                            - Task Type: Thought Leadership
                            - Document Type: {thoughtLeadership.DocumentType}
                            - Primary Topic: {thoughtLeadership.Topic}
                            - Industry / Domain: {thoughtLeadership.Industry}
                            - Purpose / Goal: {thoughtLeadership.Purpose}
                            - Target Audience: {thoughtLeadership.AudienceTarget}
                            - Tone & Style: {thoughtLeadership.ToneStyle}
                            - Supporting Data & Stats: {thoughtLeadership.DataAndStats}
                            
                            SOURCES & MATERIALS
                            {(thoughtLeadership.Links.Any()
                                ? "Reference Links:" + string.Join(Environment.NewLine, thoughtLeadership.Links.Select((link, index) => $"{index + 1}. {link.Url}"))
                                : "")}

                            {referenceMaterialsSection}

                            STRUCTURE & FORMAT
                            - Expected Length: {thoughtLeadership.ContentLength}
                            - Required Structure / Outline: {thoughtLeadership.ContentStructure}
                            - Use **headings**, **subheadings**, **bullet points**, and **bold** text where needed.

                            CONTENT RULES
                            1. Facts must be verifiable (2023–{DateTime.UtcNow.Year} sources).
                            2. Include case studies, examples, and data.
                            3. Avoid fluff, repetition, or generic content.
                            4. Follow the provided structure strictly.
                            5. Maintain tone and style consistently.

                            DO NOT INCLUDE
                            - Fabricated data or placeholder links.
                            - Promotional or filler content.
                            - Repetition or off-topic discussion.

                            OUTPUT BELOW THIS LINE
                            ";
                    }
                    break;

                case GenerativeModelTypesEnum.CompanyDeepDive:
                    // Expected DTO: CompanyProfileGenerationConfigDto
                    var companyProfile = JsonSerializer.Deserialize<CompanyProfileGenerationConfigDto>(setupObjectJson, jsonOptions);
                    if (companyProfile != null)
                    {
                        // Pre-build the reference materials section before interpolating
                        string referenceMaterialsSection = string.Empty;

                        if (companyProfile.Documents?.Any() == true)
                        {
                            var lines = new List<string> { "Reference Documents:" };

                            for (int i = 0; i < companyProfile.Documents.Count; i++)
                            {
                                var doc = companyProfile.Documents[i];
                                var extractedText = await _llmDataExtractionService.GetFileTextAsync(doc.Path);
                                lines.Add($"{i + 1}. {extractedText}");
                            }

                            referenceMaterialsSection = string.Join("\n", lines);
                        }


                        generatedPrompt = $@"SYSTEM PROMPT
                        {(string.IsNullOrEmpty(generativeModelDefaultSetupDto.NodePrompt)
                            ? $"You are a business research analyst and expert content generator. Your goal is to produce a comprehensive, data-backed Company Deep Dive using real, verifiable information only (2023–{DateTime.UtcNow.Year}). No assumptions or fabrications are permitted."
                            : generativeModelDefaultSetupDto.NodePrompt)}

                        COMPANY PROFILE
                        - Company Name: {companyProfile.CompanyName}
                        - Website: {companyProfile.WebsiteLink}
                        - Focus Area: {companyProfile.FocusArea}
                        - Industry: {companyProfile.WebData}

                        SOURCES & MATERIALS
                        {(companyProfile.Links.Any()
                            ? "Input Links:" + string.Join(Environment.NewLine, companyProfile.Links.Select((link, index) => $"{index + 1}. {link.Url}"))
                            : "")}

                        {referenceMaterialsSection}

                        OBJECTIVE
                        Create a clear, in-depth profile of {companyProfile.CompanyName}, focused on its current business model, strategy, performance, market positioning, and risks. The output must match the selected summary depth: {companyProfile.SummaryDepth}.

                        STRUCTURE & OUTPUT FORMAT
                        - Output Format: Company Intelligence Report
                        - Summary Depth: {companyProfile.SummaryDepth} (e.g., Overview / Mid-Level / Full Deep Dive)
                        - Use **section headings**, **bullet points**, and **bold formatting** for clarity.
                        - Suggested Sections:
                        1. Executive Summary
                        2. Company Overview
                        3. Products and Services
                        4. Leadership & Team
                        5. Financial Performance (Use available data)
                        6. Competitive Landscape
                        7. Growth Strategy & Roadmap
                        8. Risks & Challenges
                        9. Key Metrics & Takeaways

                        CONTENT RULES
                        1. Use only data from the input links and documents.
                        2. Cross-reference key points with publicly verifiable sources.
                        3. Avoid speculation or unsupported analysis.
                        4. Maintain a professional, neutral, insight-driven tone.
                        5. Do not copy/paste raw content—synthesize insights.

                        DO NOT INCLUDE
                        - Promotional content or biased opinions
                        - Generic or outdated information
                        - Placeholder text or broken structure

                        OUTPUT BELOW THIS LINE
                        ";
                    }
                    break;

                case GenerativeModelTypesEnum.PersonaResearch:
                    // Expected DTO: PersonaResearchConfigDto
                    var personaResearch = JsonSerializer.Deserialize<PersonaResearchConfigDto>(setupObjectJson, jsonOptions);
                    if (personaResearch != null)
                    {
                        generatedPrompt = $@"SYSTEM PROMPT
                        {(string.IsNullOrEmpty(generativeModelDefaultSetupDto.NodePrompt)
                            ? "You are a B2B/B2C persona research analyst with expertise in audience profiling, behavioral segmentation, and market insights. Your task is to generate a realistic, data-supported buyer or user persona based on the given inputs. No made-up or speculative details are allowed."
                            : generativeModelDefaultSetupDto.NodePrompt)}
                        
                        PERSONA INFORMATION
                        - Persona Name: {personaResearch.PersonaName}
                        - Company / Brand Context: {personaResearch.CompanyName}
                        - Purpose of Research: {personaResearch.PurposeOfResearch}
                        - Desired Outputs: {personaResearch.DesiredOutput} (e.g., full persona profile, messaging guide, decision journey map)

                        SOURCES
                        {(personaResearch.Links.Any()
                            ? "Input Links:\n" + string.Join("\n", personaResearch.Links.Select((link, index) => $"{index + 1}. {link.Url}"))
                            : "")}

                        OBJECTIVE
                        Create a comprehensive and tailored persona profile that will inform the development of product strategy, content, marketing, or sales efforts. Use only data from the links provided or from current (2023–{DateTime.UtcNow.Year}) known industry trends.

                        📐 OUTPUT STRUCTURE
                        Suggested Persona Format:
                        1. **Persona Snapshot** (Name, Role, Industry, Location, Age Range)
                        2. **Goals & Motivations**
                        3. **Pain Points & Frustrations**
                        4. **Decision Triggers & Buying Criteria**
                        5. **Information Sources & Channels**
                        6. **Common Objections or Concerns**
                        7. **Communication Style & Tone Preference**
                        8. **Suggested Messaging Do’s & Don’ts**
                        9. **Buying Journey or Funnel Stage Alignment**
                        10. **Real-World Quotes or Example Behaviors** (optional)

                         GUIDELINES
                        1. Focus on industry-accurate persona behavior.
                        2. If insufficient data is provided, clarify what assumptions are being made.
                        3. Ensure output is clear, structured, and easy to use for mareting/sales/product teams.
                        4. Avoid repetition or vague descriptors.

                        DO NOT INCLUDE
                        - Fabricated quotes or demographics
                        - Generic filler content (e.g., “likes to stay updated”)
                        - Overly promotional or brand-centric assumptions

                        OUTPUT BELOW THIS LINE
                        ";
                    }
                    break;

                case GenerativeModelTypesEnum.RFPResponseGenerator:
                    // Expected DTO: RFPResponseGenerationConfigDto
                    var rfpResponse = JsonSerializer.Deserialize<RFPResponseGenerationConfigDto>(setupObjectJson, jsonOptions);
                    if (rfpResponse != null)
                    {
                        // Pre-build the reference materials section before interpolating
                        string rfpReferenceDocument = string.Empty;

                        if (rfpResponse.RPFDocument?.Any() == true)
                        {
                            var lines = new List<string> { "RFP/RFI Documents:" };

                            for (int i = 0; i < rfpResponse.RPFDocument.Count; i++)
                            {
                                var doc = rfpResponse.RPFDocument[i];
                                var extractedText = await _llmDataExtractionService.GetFileTextAsync(doc.Path);
                                lines.Add($"{i + 1}. {extractedText}");
                            }

                            rfpReferenceDocument = string.Join("\n", lines);
                        }

                        // Pre-build the reference materials section before interpolating
                        string referenceMaterialsSection = string.Empty;

                        if (rfpResponse.PreferDocument?.Any() == true)
                        {
                            var lines = new List<string> { "Reference Documents:" };

                            for (int i = 0; i < rfpResponse.PreferDocument.Count; i++)
                            {
                                var doc = rfpResponse.PreferDocument[i];
                                var extractedText = await _llmDataExtractionService.GetFileTextAsync(doc.Path);
                                lines.Add($"{i + 1}. {extractedText}");
                            }

                            referenceMaterialsSection = string.Join("\n", lines);
                        }
                        generatedPrompt = $@"SYSTEM PROMPT
                        {(string.IsNullOrEmpty(generativeModelDefaultSetupDto.NodePrompt)
                            ? "You are a senior bid strategist and technical writer specializing in high-stakes RFP and RFI responses. Your job is to craft winning, client-aligned, and criteria-compliant proposals using only the provided documents and sources."
                            : generativeModelDefaultSetupDto.NodePrompt)}

                        CLIENT/BIDDER INFORMATION
                        - Client/Bidder Name: {rfpResponse.ClientName}
                        - Client Website: {rfpResponse.WebsiteLink}

                        INPUT MATERIALS
                        {rfpReferenceDocument}

                        {referenceMaterialsSection}

                        {(rfpResponse.Links.Any()
                            ? "External Links:\n" + string.Join("\n", rfpResponse.Links.Select((link, index) => $"{index + 1}. {link.Url}"))
                            : "")}

                        STRATEGY & SCOPE
                        - Response Strategy: {rfpResponse.ResponseStrategy} (e.g., highlight innovation, emphasize cost-efficiency, stress security certifications)
                        - Response Boundaries: {rfpResponse.ResponseBoundary} (e.g., only respond to sections 1–3; no pricing details; adhere strictly to 20-page limit)

                        OUTPUT FORMAT
                        Structure the response based on the RFP format, and follow these guidelines:
                        1. Use the exact section headers and question numbering from the RFP
                        2. Include only verified capabilities—do not fabricate responses
                        3. Use formal, persuasive language suitable for B2B or government procurement
                        4. Highlight differentiators clearly using bullets or bold text

                        GUIDELINES
                        1. Pull content only from provided documents or links
                        2. Reuse known approved boilerplate (if available in Reference Docs)
                        3. Avoid generic marketing language unless strategy requires it
                        4. Maintain compliance and formatting as per RFP rules

                        DO NOT INCLUDE
                        - Assumed or invented features
                        - Pricing, SLAs, or contract details unless explicitly requested
                        - Promotional tone or company slogans
                        
                        OUTPUT BELOW THIS LINE
                        ";
                    }
                    break;

                case GenerativeModelTypesEnum.DocumentDrafting:
                    // Expected DTO: DocumentDraftingConfigDto
                    var documentDraft = JsonSerializer.Deserialize<DocumentDraftingConfigDto>(setupObjectJson, jsonOptions);
                    if (documentDraft != null)
                    {
                        // Pre-build the reference materials section before interpolating
                        string referenceMaterialsSection = string.Empty;

                        if (documentDraft.PreferenceDocuments?.Any() == true)
                        {
                            var lines = new List<string> { "Reference Documents:" };

                            for (int i = 0; i < documentDraft.PreferenceDocuments.Count; i++)
                            {
                                var doc = documentDraft.PreferenceDocuments[i];
                                var extractedText = await _llmDataExtractionService.GetFileTextAsync(doc.Path);
                                lines.Add($"{i + 1}. {extractedText}");
                            }

                            referenceMaterialsSection = string.Join("\n", lines);
                        }

                        generatedPrompt = $@"SYSTEM PROMPT
                        {(!string.IsNullOrWhiteSpace(generativeModelDefaultSetupDto.NodePrompt)
                                ? generativeModelDefaultSetupDto.NodePrompt
                                : "You are an expert technical writer and content strategist. Your task is to draft high-quality documents tailored to specific business needs, using clear structure, tone, and formatting. Always follow the provided guidelines exactly.")}

                        DOCUMENT DETAILS
                        - Document Title: {documentDraft.DocumentTitle}
                        - Document Type: {documentDraft.DocumentType} (e.g., Policy, Strategy Deck, SOP, Proposal, Whitepaper, etc.)
                        - Localization Needed: {documentDraft.LocalizationNeeded} (e.g., UK English, Spanish, region-specific tone/culture)

                        REFERENCE MATERIALS
                        {referenceMaterialsSection}
                            
                        GUIDELINES & STRUCTURE
                        - Follow these instructions: {documentDraft.GuidelineInstruction}
                        - Output must follow this structure: {documentDraft.OutputStructure}

                        STYLE & TONE
                        1. Maintain professional and business-appropriate tone
                        2. Avoid filler or redundant phrasing
                        3. Use bullet points, numbered lists, or tables if specified
                        4. Ensure consistency with corporate branding (if stated)

                        AVOID
                        - Generic language or assumptions not backed by provided references
                        - Overuse of passive voice or marketing jargon (unless required)
                        - External data or citations unless clearly instructed

                        OUTPUT BELOW THIS LINE
                        ";
                    }
                    break;

                default:
                    // Unsupported model type encountered
                    _logger.LogWarning("Validation failed due to unsupported model type: {ModelType}.", generativeModelDefaultSetupDto.Name);
                    break;
            }
        }
        catch (JsonException ex)
        {
            // Handle JSON deserialization error and log the exception
            _logger.LogError(ex, "Error during JSON deserialization while validating setup for model type: {ModelType}", generativeModelDefaultSetupDto.Name);
            return generatedPrompt;
        }

        // Step 3: If validation is successful, log the success and return the generated prompt content
        _logger.LogInformation("Model setup validation succeeded for model type: {ModelType}.", generativeModelDefaultSetupDto.Name);
        return generatedPrompt;
    }
}

