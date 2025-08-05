
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
                newGenerativeModel.GeneratedPrompt = await GeneratePromptForModelSetupAsync(generativeModelDto.GenerativeModel);
                newGenerativeModel.MLModelId = existingModel.Id;
                newGenerativeModel.CreatedByUserId = _userId;
                newGenerativeModel.LastModifiedByUserId = _userId;

                await _unitOfWork.GenerativeModelRepo.InsertAsync(newGenerativeModel);
            }
            else
            {
                // Existing task found — update it from the DTO
                generativeModelDto.GenerativeModel.Adapt(generativeModel);
                generativeModel.GeneratedPrompt = await GeneratePromptForModelSetupAsync(generativeModelDto.GenerativeModel);
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
                    if (thoughtLeadership == null)
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
                        generatedPrompt = $"""
                            SYSTEM PROMPT
                            {(!string.IsNullOrWhiteSpace(generativeModelDefaultSetupDto.NodePrompt)
                                ? generativeModelDefaultSetupDto.NodePrompt
                                : "You are an expert technical writer and content strategist. Your task is to draft high-quality documents tailored to specific business needs, using clear structure, tone, and formatting. Always follow the provided guidelines exactly.")}

                            OBJECTIVE
                            Produce an insightful and original {thoughtLeadership?.DocumentType ?? "{{Document Type}}"} demonstrating deep expertise in {thoughtLeadership?.Industry ?? "{{Industry}}"}. Crafted for {thoughtLeadership?.AudienceTarget ?? "{{Target Audience}}"}, focused on {thoughtLeadership?.Purpose ?? "{{Purpose}}"}, with a consistent {thoughtLeadership?.ToneStyle ?? "{{Tone and Style}}"} tone.

                            INPUT DETAILS
                            - Task Type: Thought Leadership
                            - Document Type: {thoughtLeadership?.DocumentType ?? "{{Document Type}}"}
                            - Primary Topic: {thoughtLeadership?.Topic ?? "{{Topic}}"}
                            - Industry / Domain: {thoughtLeadership?.Industry ?? "{{Industry}}"}
                            - Purpose / Goal: {thoughtLeadership?.Purpose ?? "{{Purpose}}"}
                            - Target Audience: {thoughtLeadership?.AudienceTarget ?? "{{Target Audience}}"}
                            - Tone & Style: {thoughtLeadership?.ToneStyle ?? "{{Tone and Style}}"}
                            - Supporting Data & Stats: {thoughtLeadership?.DataAndStats ?? "{{Data and Stats}}"}
                            - Reference Links:
                            {string.Join(Environment.NewLine, (thoughtLeadership?.Links ?? new List<string> { "{{Links}}" })
                                .Select((link, index) => $"{index + 1}. {link}"))}

                            REFERENCE MATERIALS
                            {referenceMaterialsSection}

                            STRUCTURE & FORMAT
                            - Expected Length: {thoughtLeadership?.ContentLength ?? "{{Output Length}}"}
                            - Required Structure / Outline: {thoughtLeadership?.ContentStructure ?? "{{Structure}}"}
                            - Use **headings**, **subheadings**, **bullet points**, and **bold** text where needed.

                            CONFIGURATION SETTINGS
                            - LLM Model: {generativeModelDefaultSetupDto.LLM}
                            - Temperature: {generativeModelDefaultSetupDto.Temperature}

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
                            """;
                    }
                    break;

                case GenerativeModelTypesEnum.CompanyDeepDive:
                    // Expected DTO: CompanyProfileGenerationConfigDto
                    var companyProfile = JsonSerializer.Deserialize<CompanyProfileGenerationConfigDto>(setupObjectJson, jsonOptions);
                    if (companyProfile == null)
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


                        generatedPrompt = $@"SYSTEM ROLE
                        {(string.IsNullOrEmpty(generativeModelDefaultSetupDto.NodePrompt)
                            ? "You are a business research analyst and expert content generator. Your goal is to produce a comprehensive, data-backed Company Deep Dive using real, verifiable information only (2023–{DateTime.UtcNow.Year}). No assumptions or fabrications are permitted."
                            : generativeModelDefaultSetupDto.NodePrompt)}

                        COMPANY PROFILE
                        - Company Name: {companyProfile.CompanyName}
                        - Website: {companyProfile.WebsiteLink}
                        - Focus Area: {companyProfile.FocusArea}
                        - Industry: {companyProfile.WebData}

                        SOURCES & MATERIALS
                        {(companyProfile.Links.Any()
                            ? "Input Links:" + string.Join(Environment.NewLine, companyProfile.Links.Select((link, index) => $"{index + 1}. {link}"))
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

                        GENERATION CONFIGURATION
                        - Base LLM: {generativeModelDefaultSetupDto.LLM}
                        - Temperature: {generativeModelDefaultSetupDto.Temperature}

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
                    if (personaResearch == null)
                    {
                        generatedPrompt = $@"SYSTEM ROLE
                        You are a B2B/B2C persona research analyst with expertise in audience profiling, behavioral segmentation, and market insights. Your task is to generate a realistic, data-supported buyer or user persona based on the given inputs. No made-up or speculative details are allowed.

                        PERSONA INFORMATION
                        - Persona Name: {personaResearch.PersonaName}
                        - Company / Brand Context: {personaResearch.CompanyName}
                        - Purpose of Research: {personaResearch.PurposeOfResearch}
                        - Desired Outputs: {personaResearch.DesiredOutput} (e.g., full persona profile, messaging guide, decision journey map)

                        SOURCES
                        {(personaResearch.Links.Any()
                            ? "Input Links:\n" + string.Join("\n", personaResearch.Links.Select((link, index) => $"{index + 1}. {link}"))
                            : "")}

                        📄 OBJECTIVE
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

                        ⚙️ LLM CONFIGURATION
                        - Base LLM: {generativeModelDefaultSetupDto.LLM}
                        - Temperature: {generativeModelDefaultSetupDto.Temperature}

                        ✅ GUIDELINES
                        1. Focus on industry-accurate persona behavior.
                        2. If insufficient data is provided, clarify what assumptions are being made.
                        3. Ensure output is clear, structured, and easy to use for marketing/sales/product teams.
                        4. Avoid repetition or vague descriptors.

                        🚫 DO NOT INCLUDE
                        - Fabricated quotes or demographics
                        - Generic filler content (e.g., “likes to stay updated”)
                        - Overly promotional or brand-centric assumptions

                        📝 OUTPUT BELOW THIS LINE
                        ";
                    }
                    break;

                case GenerativeModelTypesEnum.RFPResponseGenerator:
                    // Expected DTO: RFPResponseGenerationConfigDto
                    var rfpResponse = JsonSerializer.Deserialize<RFPResponseGenerationConfigDto>(setupObjectJson, jsonOptions);
                    if (rfpResponse == null)
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
                        generatedPrompt = $@"SYSTEM ROLE
                        You are a senior bid strategist and technical writer specializing in high-stakes RFP and RFI responses. Your job is to craft winning, client-aligned, and criteria-compliant proposals using only the provided documents and sources.

                        CLIENT/BIDDER INFORMATION
                        - Client/Bidder Name: {rfpResponse.ClientName}
                        - Client Website: {rfpResponse.WebsiteLink}

                        INPUT MATERIALS
                        {rfpReferenceDocument}

                        {referenceMaterialsSection}

                        {(rfpResponse.Links.Any()
                            ? "External Links:\n" + string.Join("\n", rfpResponse.Links.Select((link, i) => $"{i + 1}. {link}"))
                            : "")}

                        🎯 STRATEGY & SCOPE
                        - Response Strategy: {rfpResponse.ResponseStrategy} (e.g., highlight innovation, emphasize cost-efficiency, stress security certifications)
                        - Response Boundaries: {rfpResponse.ResponseBoundary} (e.g., only respond to sections 1–3; no pricing details; adhere strictly to 20-page limit)

                        OUTPUT FORMAT
                        Structure the response based on the RFP format, and follow these guidelines:
                        1. Use the exact section headers and question numbering from the RFP
                        2. Include only verified capabilities—do not fabricate responses
                        3. Use formal, persuasive language suitable for B2B or government procurement
                        4. Highlight differentiators clearly using bullets or bold text

                        ⚙️ LLM CONFIGURATION
                        - Base LLM: {generativeModelDefaultSetupDto.LLM}
                        - Temperature: {generativeModelDefaultSetupDto.Temperature}

                        ✅ GUIDELINES
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
                    if (documentDraft == null)
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

                        generatedPrompt = $@"SYSTEM ROLE
                        You are an expert technical writer and content strategist. Your task is to draft high-quality documents tailored to specific business needs, using clear structure, tone, and formatting. Always follow the provided guidelines exactly.

                        DOCUMENT DETAILS
                        - Document Title: {documentDraft.DocumentTitle}
                        - Document Type: {documentDraft.DocumentType} (e.g., Policy, Strategy Deck, SOP, Proposal, Whitepaper, etc.)
                        - Localization Needed: {documentDraft.LocalizationNeeded} (e.g., UK English, Spanish, region-specific tone/culture)

                        REFERENCE MATERIALS
                        {referenceMaterialsSection}
                            
                        GUIDELINES & STRUCTURE
                        - Follow these instructions: {documentDraft.GuidelineInstruction}
                        - Output must follow this structure: {documentDraft.OutputStructure}

                        LLM CONFIGURATION
                        - Base LLM: {generativeModelDefaultSetupDto.LLM}
                        - Temperature: {generativeModelDefaultSetupDto.Temperature}

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

