
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

    // Retrieves the configuration setup for a specific conversational AI project based on the project ID and optional version ID.
    public async Task<ServiceResponse<ConversationModelDto>> GetSetupByAIProjectIdAsync(Guid aiProjectId, Guid? aiProjectVersionId)
    {
        // Initialize the response with a failure default
        var serviceResponse = new ServiceResponse<ConversationModelDto>
        {
            Data = null,
            Message = "Failed to retrieve the conversational AI project setup. Please try again later."
        };

        try
        {
            _logger.LogInformation("Fetching conversational model setup | AI Project ID: {AIProjectId} | User ID: {UserId}", aiProjectId, _userId);

            // Retrieve AI project with access validation
            var aiProject = await _unitOfWork.AIProjectRepo
                .GetByConditionAsync(p =>
                    p.Id == aiProjectId &&
                    (
                        p.CreatedByUserId == _userId ||
                        (p.ProjectUsers != null && p.ProjectUsers.Any(u => u.UserId == _userId))
                    )
                )
                .Include(p => p.CreatedByUser)
                .Include(p => p.ProjectUsers)
                .Include(p => p.Versions!)
                .ThenInclude(v => v.Tasks)
                .SingleOrDefaultAsync();

            if (aiProject == null)
            {
                _logger.LogWarning("AI project not found or access denied | Project ID: {AIProjectId} | User ID: {UserId}", aiProjectId, _userId);
                serviceResponse.Message = "No conversational model setup exists for the provided AI project ID.";
                return serviceResponse;
            }

            _logger.LogInformation("AI project setup retrieved successfully | Project ID: {AIProjectId}", aiProjectId);

            // Map project to DTO
            var conversationModelDto = aiProject.Adapt<ConversationModelDto>();

            // Determine correct version
            AIProjectVersion? aiProjectVersion = aiProjectVersionId.HasValue
                ? aiProject.Versions.FirstOrDefault(v => v.Id == aiProjectVersionId.Value)
                : aiProject.Versions.OrderByDescending(v => v.VersionNumber).FirstOrDefault();

            conversationModelDto.AIProjectVersionId = aiProjectVersion?.Id ?? Guid.Empty;

            // Map version task (if available)
            var versionTask = aiProjectVersion?.Tasks.FirstOrDefault();
            if (versionTask != null)
            {
                conversationModelDto.AIPersona = versionTask.Adapt<ConversationModelSetupTaskDto>();
            }

            // Return success
            serviceResponse.Data = conversationModelDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversational AI project setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving AI project setup | Project ID: {AIProjectId} | User ID: {UserId}", aiProjectId, _userId);
        }

        return serviceResponse;
    }

    // Updates the configuration of an existing conversational AI project, including its associated AI persona.
    public async Task<ServiceResponse<ConversationModelDto>> UpdateSetupAsync(ConversationModelDto conversationModelDto)
    {
        // Default response in case of failure
        var serviceResponse = new ServiceResponse<ConversationModelDto>
        {
            Data = null,
            Message = "Failed to update the conversational model. Please try again later."
        };

        try
        {
            _logger.LogInformation("Initiating conversational model update | AI Project ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);

            // Fetch the existing AI project and associated data
            var aiProject = await _unitOfWork.AIProjectRepo
                .GetByConditionAsync(w =>
                    w.Id == conversationModelDto.Id &&
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
                _logger.LogWarning("AI project not found or access denied | Project ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);
                serviceResponse.Message = "Conversational AI project not found.";
                return serviceResponse;
            }

            // Ensure the user has proper access
            var userAccess = aiProject.ProjectUsers?.FirstOrDefault(f =>
                f.UserId == _userId &&
                (f.AccessType == ProjectUserAccessEnum.Owner || f.AccessType == ProjectUserAccessEnum.Edit)
            );

            if (aiProject.CreatedByUserId != _userId && userAccess == null)
            {
                _logger.LogWarning("Unauthorized update attempt | Project ID: {Id} | User ID: {UserId}", aiProject.Id, _userId);
                serviceResponse.Message = "You do not have permission to update this AI project.";
                return serviceResponse;
            }

            // Determine target version (either specific or latest)
            var aiProjectVersion = conversationModelDto.AIProjectVersionId.HasValue
                ? aiProject.Versions.FirstOrDefault(f => f.Id == conversationModelDto.AIProjectVersionId.Value)
                : aiProject.Versions.OrderByDescending(o => o.VersionNumber).FirstOrDefault();

            conversationModelDto.AIProjectVersionId = aiProjectVersion?.Id ?? Guid.Empty;

            if (aiProjectVersion == null)
            {
                _logger.LogWarning("No version found for AI project | Project ID: {Id}", conversationModelDto.Id);
                serviceResponse.Message = "Unable to find a valid version for this AI project.";
                return serviceResponse;
            }

            if (aiProjectVersion.IsPublished)
            {
                _logger.LogWarning("Update blocked for published AI project version | Project ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);
                serviceResponse.Message = "Published AI project versions cannot be modified.";
                return serviceResponse;
            }

            // Clean incoming DTO to ensure valid string formatting
            conversationModelDto = TrimDtoStringPropsUtil.TrimDtoStringProps(conversationModelDto);

            _logger.LogInformation("Updating base project metadata | Project ID: {Id}", conversationModelDto.Id);

            if (aiProject.Type == null)
            {
                // Apply changes from DTO to the entity
                aiProject.Adapt(conversationModelDto);
                aiProject.Type = AIProjectTypeEnum.Conversational;
                aiProject.LastModifiedByUserId = _userId;

                _unitOfWork.AIProjectRepo.Update(aiProject);

                // Save updates to the AI project
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to persist base project updates | Project ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);
                    return serviceResponse;
                }
            }

            // Handle AI Persona (task) update if provided
            if (conversationModelDto.AIPersona != null)
            {
                var versionTask = aiProjectVersion.Tasks.FirstOrDefault();

                if (versionTask == null)
                {
                    // Create new persona task
                    versionTask = conversationModelDto.AIPersona.Adapt<VersionTask>();
                    versionTask.AIProjectId = aiProject.Id;
                    versionTask.AIProjectVersionId = aiProjectVersion.Id;
                    versionTask.GeneratedPrompt = GenerateConversationModelPrompt(conversationModelDto.AIPersona);
                    versionTask.SystemPrompt = conversationModelDto.AIPersona.NodePrompt;
                    versionTask.CreatedByUserId = _userId;
                    versionTask.LastModifiedByUserId = _userId;

                    await _unitOfWork.VersionTaskRepo.InsertAsync(versionTask);
                }
                else
                {
                    // Update existing persona task
                    conversationModelDto.AIPersona.Adapt(versionTask);
                    versionTask.GeneratedPrompt = GenerateConversationModelPrompt(conversationModelDto.AIPersona);
                    versionTask.SystemPrompt = conversationModelDto.AIPersona.NodePrompt;
                    versionTask.LastModifiedByUserId = _userId;

                    _unitOfWork.VersionTaskRepo.Update(versionTask);
                }

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save AI persona updates | Project ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);
                    return serviceResponse;
                }
            }

            _logger.LogInformation("Conversational AI project updated successfully | Project ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);

            // Return success response
            serviceResponse.Data = aiProject.Adapt<ConversationModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversational model updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while updating conversational model | Project ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);
        }

        return serviceResponse;
    }

    private string GenerateConversationModelPrompt(ConversationModelSetupTaskDto conversationModelSetupTaskDto)
    {
        return $@"You are {conversationModelSetupTaskDto.SetupObject.Name}, an AI assistant.

            ### Role & Objective
            Your primary purpose is: {conversationModelSetupTaskDto.SetupObject.RoleOrObjective}.  
            You operate in the category/domain of: {conversationModelSetupTaskDto.SetupObject.CategoryOrDomain}.  

            ### Tone & Style
            Maintain a {conversationModelSetupTaskDto.SetupObject.ToneOfVoice} tone throughout all responses.

            ### Core Instructions
            Follow these instructions when responding:
            {conversationModelSetupTaskDto.SetupObject.Instructions}

            ### Exclusions & Boundaries
            - Do not engage in: {conversationModelSetupTaskDto.SetupObject.ExclusionsOrBoundaries}  
            - If asked to do something outside these boundaries, politely decline and redirect within allowed scope.

            ### Core Guidelines:
            1. Always stay in character as {conversationModelSetupTaskDto.SetupObject.Name}.
            2. If the user asks something outside your role or domain, politely redirect or explain your limitations.  
            3. Provide clear, accurate, and contextually relevant responses in line with the role and objective.  
            4. Stick to the defined tone and boundaries at all times.  
            5. When uncertain, ask clarifying questions instead of breaking character.";
    }

    // Retrieves a list of available languages. 
    public ServiceResponse<IEnumerable<SelectOptionDto>> GetLanguageOptions()
    {
        // Initialize the service response with default failure message and status
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>
        {
            Data = null,
            Message = "Failed to retrieve languages. Please try again later.",
        };

        try
        {
            _logger.LogInformation("Attempting to retrieve available languages options.");

            // Retrieve list of languages with their associated voices
            var availableLanguages = GetLanguagesAndVoices();

            // Convert the languages into SelectOptionDto format (Label = Name, Value = Code)
            var languages = availableLanguages.Select(s => new SelectOptionDto
            {
                Label = s.Name,
                Value = s.Code
            }).ToList();

            // Set successful response data
            serviceResponse.Data = languages;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Languages retrieved successfully.";

            _logger.LogInformation("Successfully retrieved {Count} languages.", languages.Count);
        }
        catch (Exception ex)
        {
            // Log the exception
            _logger.LogError(ex, "An error occurred while retrieving language options.");
        }

        // Return the service response (either success or failure)
        return serviceResponse;
    }

    // Retrieves a list of available voices. 
    public ServiceResponse<IEnumerable<SelectOptionDto>> GetVoiceOptionsByLanguageName(string language)
    {
        // Initialize the response object with default values
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>()
        {
            Data = null,
            Message = "Failed to retrieve voices. Please try again later.",
        };

        try
        {
            var languages = new List<SelectOptionDto>();

            // Retrieve the list of languages and voices
            var availableLanguages = GetLanguagesAndVoices();

            // Find the language by name (case-insensitive)
            var availableLanguage = availableLanguages
                        .FirstOrDefault(f =>
                            f.Name.ToLower() == language.ToLower() ||
                            f.Code.ToLower() == language.ToLower()
                        );

            // If no language is found, update the response and return
            if (availableLanguage != null && availableLanguage.Voices.Any())
            {
                // Map the voices to SelectOptionDto
                languages = availableLanguage.Voices.Select(s => new SelectOptionDto()
                {
                    Label = s.Name,
                    Value = s.Name,
                    Description = s.Gender
                }).ToList();
            }

            // Success response
            serviceResponse.Data = languages;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Voices retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log the exception details (you can adjust this as per your logging framework)
            _logger.LogError(ex, "An error occurred while retrieving voice options for language: {Language}", language);
        }

        return serviceResponse;
    }


    // Retrieves a list of available languages. 
    public ServiceResponse<IEnumerable<SelectOptionDto>> GetAvailableLanguageOptions()
    {
        // Initialize the service response with default failure message and status
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>
        {
            Data = null,
            Message = "Failed to retrieve languages. Please try again later.",
        };

        try
        {
            _logger.LogInformation("Attempting to retrieve available languages options.");

            // Initialize list to hold languages (without voices for now)
            var availableLanguages = new List<AvailableLanguageDto>
            {
                // English: Widely supported with a broad range of expressive voices
                new AvailableLanguageDto
                {
                    Name = "English",
                    Code = "en",
                    Voices = new List<AvailableVoiceDto>()
                },

                // Mandarin Chinese: Supported via multilingual models
                new AvailableLanguageDto
                {
                    Name = "Mandarin Chinese",
                    Code = "zh",
                    Voices = new List<AvailableVoiceDto>()
                },

                // Hindi: Supported with multilingual voices; commonly used in India
                new AvailableLanguageDto
                {
                    Name = "Hindi",
                    Code = "hi",
                    Voices = new List<AvailableVoiceDto>()
                },

                // Spanish: Includes support for both Latin American and European accents
                new AvailableLanguageDto
                {
                    Name = "Spanish",
                    Code = "es",
                    Voices = new List<AvailableVoiceDto>()
                },

                // Arabic: Supported through multilingual and expressive voices
                new AvailableLanguageDto
                {
                    Name = "Arabic",
                    Code = "ar",
                    Voices = new List<AvailableVoiceDto>()
                },

                // Bengali: Covered via ElevenLabs multilingual model
                new AvailableLanguageDto
                {
                    Name = "Bengali",
                    Code = "bn",
                    Voices = new List<AvailableVoiceDto>()
                },

                // Portuguese: Strong support for Brazilian Portuguese
                new AvailableLanguageDto
                {
                    Name = "Portuguese",
                    Code = "pt",
                    Voices = new List<AvailableVoiceDto>()
                },

                // Russian: Multilingual voice models handle Russian fluently
                new AvailableLanguageDto
                {
                    Name = "Russian",
                    Code = "ru",
                    Voices = new List<AvailableVoiceDto>()
                },

                // Japanese: Supported via multilingual and expressive voices
                new AvailableLanguageDto
                {
                    Name = "Japanese",
                    Code = "ja",
                    Voices = new List<AvailableVoiceDto>()
                },

                // Punjabi: Supported through multilingual models; used in India and Pakistan
                new AvailableLanguageDto
                {
                    Name = "Punjabi",
                    Code = "pa",
                    Voices = new List<AvailableVoiceDto>()
                }
            };

            // Convert the languages into SelectOptionDto format (Label = Name, Value = Code)
            var languages = availableLanguages.Select(s => new SelectOptionDto
            {
                Label = s.Name,
                Value = s.Code
            })
            .DistinctBy(d => d.Label)
            .ToList();

            // Set successful response data
            serviceResponse.Data = languages;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Languages retrieved successfully.";

            _logger.LogInformation("Successfully retrieved {Count} languages.", languages.Count);
        }
        catch (Exception ex)
        {
            // Log the exception
            _logger.LogError(ex, "An error occurred while retrieving language options.");
        }

        // Return the service response (either success or failure)
        return serviceResponse;
    }

    // Retrieves a list of available Text-to-Speech services and their options.
    public ServiceResponse<IEnumerable<SelectOptionDto>> GetAvailableTextToSpeechOptions(string language)
    {
        // Initialize the response object with a default error state
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>()
        {
            Data = null,
            Message = "Failed to retrieve Text-to-Speech options. Please try again later."
        };

        try
        {
            // Log the process of retrieving Text-to-Speech options
            _logger.LogInformation("Attempting to retrieve available Text-to-Speech options for language: {Language}", language);

            // Fetch the list of available Text-to-Speech services with their descriptions
            var availableTextToSpeechServices = GetExternalTextToSpeechServices();

            // Filter and transform the services based on the provided language (matching either by language name or code)
            var filteredTextToSpeechServices = availableTextToSpeechServices
                .Where(w =>
                    w.LanguageName.Equals(language, StringComparison.InvariantCultureIgnoreCase) ||
                    w.LanguageCode.Equals(language, StringComparison.InvariantCultureIgnoreCase)
                )
                .Select(service => new SelectOptionDto
                {
                    Label = service.Name,
                    Value = service.Name,
                    Description = service.Description
                })
                .ToList();


            // Assign the filtered services to the response data
            serviceResponse.Data = filteredTextToSpeechServices;

            // Update the status code and message to indicate successful data retrieval
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Successfully retrieved Text-to-Speech options for the specified language.";

            // Log the successful retrieval of the options
            _logger.LogInformation("Successfully retrieved {Count} Text-to-Speech options for language: {Language}.", filteredTextToSpeechServices.Count, language);
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during the process
            _logger.LogError(ex, "An error occurred while retrieving Text-to-Speech options for language: {Language}.", language);
        }

        // Return the service response containing the filtered data and status
        return serviceResponse;
    }

    // Retrieves a list of available Text-to-Speech services and their options.
    public ServiceResponse<IEnumerable<SelectOptionDto>> GetAvailableTextToSpeechVoicesOptions(string serviceName)
    {
        // Initialize the response object with a default error state
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>()
        {
            Data = null,
            Message = "Failed to retrieve Text-to-Speech voice options. Please try again later."
        };

        try
        {
            _logger.LogInformation("Attempting to retrieve available Text-to-Speech voices for service: {ServiceName}", serviceName);

            // Fetch all external TTS services including languages and voices
            var externalServices = GetExternalTextToSpeechServices();

            // Find the service matching the provided name
            var matchingService = externalServices.FirstOrDefault(s => s.Name.Equals(serviceName, StringComparison.InvariantCultureIgnoreCase));

            // Flatten all voices across all languages under the matched service
            var voiceOptions = matchingService.Voices
                .Select(s => new SelectOptionDto()
                {
                    Label = s.Name,
                    Value = s.Name,
                    Description = s.Gender
                })
                .ToList();

            // Update the response with successful data
            serviceResponse.Data = voiceOptions;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"Successfully retrieved {voiceOptions.Count} voice option(s) for service '{serviceName}'.";

            _logger.LogInformation("Retrieved {Count} voice option(s) for service: {ServiceName}.", voiceOptions.Count, serviceName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving voices for Text-to-Speech service: {ServiceName}.", serviceName);
        }

        return serviceResponse;
    }

    // Retrieves a list of available Speech-to-Text services and their options.
    public ServiceResponse<IEnumerable<SelectOptionDto>> GetAvailableSpeechToTextOptions(string language)
    {
        // Initialize the response object with a default error state
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>()
        {
            Data = null,
            Message = "Failed to retrieve Speech-to-Text options. Please try again later.",
        };

        try
        {
            // Log the beginning of the process to retrieve Speech-to-Text options
            _logger.LogInformation("Attempting to retrieve available Speech-to-Text options for language: {Language}", language);

            // Get the list of available Speech-to-Text services with details
            var availableSpeechToTextServices = GetExternalSpeechToTextServices();

            // Filter and transform the services based on the provided language (either by language name or language code)
            var languageSpecificOptions = availableSpeechToTextServices
                .Where(w =>
                    w.LanguageName.Equals(language, StringComparison.InvariantCultureIgnoreCase) ||
                    w.LanguageCode.Equals(language, StringComparison.InvariantCultureIgnoreCase)
                )
                .Select(s => new SelectOptionDto()
                {
                    Label = s.Name,
                    Value = s.Name,
                    Description = s.Description
                })
                .ToList();

            // Assign the filtered and transformed options to the response data
            serviceResponse.Data = languageSpecificOptions;

            // Update the status code and message to indicate successful data retrieval
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Successfully retrieved available Speech-to-Text options for the specified language.";

            // Log the successful retrieval of Speech-to-Text options
            _logger.LogInformation("Successfully retrieved {Count} Speech-to-Text options for language: {Language}.", languageSpecificOptions.Count, language);
        }
        catch (Exception ex)
        {
            // Log the exception details to help with troubleshooting
            _logger.LogError(ex, "An error occurred while retrieving Speech-to-Text options for language: {Language}.", language);
        }

        // Return the service response object containing the data and status
        return serviceResponse;
    }

    public List<TextToSpeechOptionDto> GetExternalTextToSpeechServices()
    {
        // Create a list to store the TextToSpeech provider information
        var textToSpeechServices = new List<TextToSpeechOptionDto>
        {
            // English
            new TextToSpeechOptionDto
            {
                Name = "ElevenLabs",
                Description = "High-quality AI voice synthesis for various global languages.",
                LanguageName = "English",
                LanguageCode = "en",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "adam", Gender = "M" },
                    new AvailableVoiceDto { Name = "alice", Gender = "F" },
                    new AvailableVoiceDto { Name = "clyde", Gender = "M" },
                    new AvailableVoiceDto { Name = "dorothy", Gender = "F" },
                    new AvailableVoiceDto { Name = "serena", Gender = "F" },
                    new AvailableVoiceDto { Name = "thomas", Gender = "M" },
                    new AvailableVoiceDto { Name = "bill", Gender = "M" }
                }
            },

            // Mandarin Chinese
            new TextToSpeechOptionDto
            {
                Name = "ElevenLabs",
                Description = "High-quality AI voice synthesis for various global languages.",
                LanguageName = "Mandarin Chinese",
                LanguageCode = "zh",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "alice", Gender = "F" },
                    new AvailableVoiceDto { Name = "bill", Gender = "M" },
                    new AvailableVoiceDto { Name = "serena", Gender = "F" },
                    new AvailableVoiceDto { Name = "adam", Gender = "M" },
                    new AvailableVoiceDto { Name = "grace", Gender = "F" }
                }
            },

            // Hindi
            new TextToSpeechOptionDto
            {

                Name = "ElevenLabs",
                Description = "High-quality AI voice synthesis for various global languages.",
                LanguageName = "Hindi",
                LanguageCode = "hi",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "bill", Gender = "M" },
                    new AvailableVoiceDto { Name = "alice", Gender = "F" },
                    new AvailableVoiceDto { Name = "thomas", Gender = "M" },
                    new AvailableVoiceDto { Name = "serena", Gender = "F" },
                    new AvailableVoiceDto { Name = "dorothy", Gender = "F" }
                }
            },

            // Spanish
            new TextToSpeechOptionDto
            {
                Name = "ElevenLabs",
                Description = "High-quality AI voice synthesis for various global languages.",
                LanguageName = "Spanish",
                LanguageCode = "es",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "dorothy", Gender = "F" },
                    new AvailableVoiceDto { Name = "glinda", Gender = "F" },
                    new AvailableVoiceDto { Name = "grace", Gender = "F" },
                    new AvailableVoiceDto { Name = "matilda", Gender = "F" },
                    new AvailableVoiceDto { Name = "adam", Gender = "M" }
                }
            },

            // Arabic
            new TextToSpeechOptionDto
            {
                Name = "ElevenLabs",
                Description = "High-quality AI voice synthesis for various global languages.",
                LanguageName = "Arabic",
                LanguageCode = "ar",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "alice", Gender = "F" },
                    new AvailableVoiceDto { Name = "bill", Gender = "M" },
                    new AvailableVoiceDto { Name = "serena", Gender = "F" },
                    new AvailableVoiceDto { Name = "adam", Gender = "M" },
                    new AvailableVoiceDto { Name = "dorothy", Gender = "F" }
                }
            },

            // Bengali
            new TextToSpeechOptionDto
            {
                Name = "ElevenLabs",
                Description = "High-quality AI voice synthesis for various global languages.",
                LanguageName = "Bengali",
                LanguageCode = "bn",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "alice", Gender = "F" },
                    new AvailableVoiceDto { Name = "bill", Gender = "M" },
                    new AvailableVoiceDto { Name = "serena", Gender = "F" },
                    new AvailableVoiceDto { Name = "adam", Gender = "M" },
                    new AvailableVoiceDto { Name = "dorothy", Gender = "F" }
                }
            },

            // Portuguese
            new TextToSpeechOptionDto
            {
                Name = "ElevenLabs",
                Description = "High-quality AI voice synthesis for various global languages.",
                LanguageName = "Portuguese",
                LanguageCode = "pt",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "giovanni", Gender = "M" },
                    new AvailableVoiceDto { Name = "alice", Gender = "F" },
                    new AvailableVoiceDto { Name = "serena", Gender = "F" },
                    new AvailableVoiceDto { Name = "grace", Gender = "F" },
                    new AvailableVoiceDto { Name = "bill", Gender = "M" }
                }
            },

            // Russian
            new TextToSpeechOptionDto
            {
                Name = "ElevenLabs",
                Description = "High-quality AI voice synthesis for various global languages.",
                LanguageName = "Russian",
                LanguageCode = "ru",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "gigi", Gender = "F" },
                    new AvailableVoiceDto { Name = "adam", Gender = "M" },
                    new AvailableVoiceDto { Name = "charlie", Gender = "M" },
                    new AvailableVoiceDto { Name = "harry", Gender = "M" },
                    new AvailableVoiceDto { Name = "serena", Gender = "F" }
                }
            },

            // Japanese
            new TextToSpeechOptionDto
            {
                Name = "ElevenLabs",
                Description = "High-quality AI voice synthesis for various global languages.",
                LanguageName = "Japanese",
                LanguageCode = "ja",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "alice", Gender = "F" },
                    new AvailableVoiceDto { Name = "bill", Gender = "M" },
                    new AvailableVoiceDto { Name = "serena", Gender = "F" },
                    new AvailableVoiceDto { Name = "freya", Gender = "F" },
                    new AvailableVoiceDto { Name = "adam", Gender = "M" }
                }
            },

            // Punjabi
            new TextToSpeechOptionDto
            {
                Name = "ElevenLabs",
                Description = "High-quality AI voice synthesis for various global languages.",
                LanguageName = "Punjabi",
                LanguageCode = "pa",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "alice", Gender = "F" },
                    new AvailableVoiceDto { Name = "bill", Gender = "M" },
                    new AvailableVoiceDto { Name = "serena", Gender = "F" },
                    new AvailableVoiceDto { Name = "adam", Gender = "M" },
                    new AvailableVoiceDto { Name = "grace", Gender = "F" }
                }
            }
        };

        return textToSpeechServices;
    }

    private List<SpeechToTextOptionDto> GetExternalSpeechToTextServices()
    {
        return new List<SpeechToTextOptionDto>
        {
            new SpeechToTextOptionDto
            {
                Name = "Whisper AI",
                Description = "Whisper AI processes audio input through deep learning models, where speech is transcribed into text. It continuously adapts to different accents, languages, and noise conditions for accurate transcription.",
                LanguageName = "English",
                LanguageCode = "en",
            },
            new SpeechToTextOptionDto
            {
                Name = "Whisper AI",
                Description = "Whisper AI processes audio input through deep learning models, where speech is transcribed into text. It continuously adapts to different accents, languages, and noise conditions for accurate transcription.",
                LanguageName = "Mandarin Chinese",
                LanguageCode = "zh",
            },
            new SpeechToTextOptionDto
            {
                Name = "Whisper AI",
                Description = "Whisper AI processes audio input through deep learning models, where speech is transcribed into text. It continuously adapts to different accents, languages, and noise conditions for accurate transcription.",
                LanguageName = "Hindi",
                LanguageCode = "hi",
            },
            new SpeechToTextOptionDto
            {
                Name = "Whisper AI",
                Description = "Whisper AI processes audio input through deep learning models, where speech is transcribed into text. It continuously adapts to different accents, languages, and noise conditions for accurate transcription.",
                LanguageName = "Spanish",
                LanguageCode = "es",
            },
            new SpeechToTextOptionDto
            {
                Name = "Whisper AI",
                Description = "Whisper AI processes audio input through deep learning models, where speech is transcribed into text. It continuously adapts to different accents, languages, and noise conditions for accurate transcription.",
                LanguageName = "Arabic",
                LanguageCode = "ar",
            },
            new SpeechToTextOptionDto
            {
                Name = "Whisper AI",
                Description = "Whisper AI processes audio input through deep learning models, where speech is transcribed into text. It continuously adapts to different accents, languages, and noise conditions for accurate transcription.",
                LanguageName = "Bengali",
                LanguageCode = "bn",
            },
            new SpeechToTextOptionDto
            {
                Name = "Whisper AI",
                Description = "Whisper AI processes audio input through deep learning models, where speech is transcribed into text. It continuously adapts to different accents, languages, and noise conditions for accurate transcription.",
                LanguageName = "Portuguese",
                LanguageCode = "pt",
            },
            new SpeechToTextOptionDto
            {
                Name = "Whisper AI",
                Description = "Whisper AI processes audio input through deep learning models, where speech is transcribed into text. It continuously adapts to different accents, languages, and noise conditions for accurate transcription.",
                LanguageName = "Russian",
                LanguageCode = "ru",
            },
            new SpeechToTextOptionDto
            {
                Name = "Whisper AI",
                Description = "Whisper AI processes audio input through deep learning models, where speech is transcribed into text. It continuously adapts to different accents, languages, and noise conditions for accurate transcription.",
                LanguageName = "Japanese",
                LanguageCode = "ja",
            },
            new SpeechToTextOptionDto
            {
                Name = "Whisper AI",
                Description = "Whisper AI processes audio input through deep learning models, where speech is transcribed into text. It continuously adapts to different accents, languages, and noise conditions for accurate transcription.",
                LanguageName = "Punjabi",
                LanguageCode = "pa",
            },

        };
    }

    private IEnumerable<AvailableLanguageDto> GetLanguagesAndVoices()
    {
        // Define a list of languages and their associated voices
        var languagesWithVoices = new List<AvailableLanguageDto>
        {
            new AvailableLanguageDto
            {
                Name = "American English",
                Code = "a",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "af_heart", Gender = "F" },
                    new AvailableVoiceDto { Name = "af_alloy", Gender = "F" },
                    new AvailableVoiceDto { Name = "af_aoede", Gender = "F" },
                    new AvailableVoiceDto { Name = "af_bella", Gender = "F" },
                    new AvailableVoiceDto { Name = "af_jessica", Gender = "F" },
                    new AvailableVoiceDto { Name = "af_kore", Gender = "F" },
                    new AvailableVoiceDto { Name = "af_nicole", Gender = "F" },
                    new AvailableVoiceDto { Name = "af_nova", Gender = "F" },
                    new AvailableVoiceDto { Name = "af_river", Gender = "F" },
                    new AvailableVoiceDto { Name = "af_sarah", Gender = "F" },
                    new AvailableVoiceDto { Name = "af_sky", Gender = "F" },
                    new AvailableVoiceDto { Name = "am_adam", Gender = "M" },
                    new AvailableVoiceDto { Name = "am_echo", Gender = "M" },
                    new AvailableVoiceDto { Name = "am_eric", Gender = "M" },
                    new AvailableVoiceDto { Name = "am_fenrir", Gender = "M" },
                    new AvailableVoiceDto { Name = "am_liam", Gender = "M" },
                    new AvailableVoiceDto { Name = "am_michael", Gender = "M" },
                    new AvailableVoiceDto { Name = "am_onyx", Gender = "M" },
                    new AvailableVoiceDto { Name = "am_puck", Gender = "M" },
                    new AvailableVoiceDto { Name = "am_santa", Gender = "M" }
                }
            },
            new AvailableLanguageDto
            {
                Name = "British English",
                Code = "b",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "bf_alice", Gender = "F" },
                    new AvailableVoiceDto { Name = "bf_emma", Gender = "F" },
                    new AvailableVoiceDto { Name = "bf_isabella", Gender = "F" },
                    new AvailableVoiceDto { Name = "bf_lily", Gender = "F" },
                    new AvailableVoiceDto { Name = "bm_daniel", Gender = "M" },
                    new AvailableVoiceDto { Name = "bm_fable", Gender = "M" },
                    new AvailableVoiceDto { Name = "bm_george", Gender = "M" },
                    new AvailableVoiceDto { Name = "bm_lewis", Gender = "M" }
                }
            },
            new AvailableLanguageDto
            {
                Name = "Japanese",
                Code = "j",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "jf_alpha", Gender = "F" },
                    new AvailableVoiceDto { Name = "jf_gongitsune", Gender = "F" },
                    new AvailableVoiceDto { Name = "jf_nezumi", Gender = "F" },
                    new AvailableVoiceDto { Name = "jf_tebukuro", Gender = "F" },
                    new AvailableVoiceDto { Name = "jm_kumo", Gender = "M" }
                }
            },
            new AvailableLanguageDto
            {
                Name = "Mandarin Chinese",
                Code = "z",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "zf_xiaobei", Gender = "F" },
                    new AvailableVoiceDto { Name = "zf_xiaoni", Gender = "F" },
                    new AvailableVoiceDto { Name = "zf_xiaoxiao", Gender = "F" },
                    new AvailableVoiceDto { Name = "zf_xiaoyi", Gender = "F" },
                    new AvailableVoiceDto { Name = "zm_yunjian", Gender = "M" },
                    new AvailableVoiceDto { Name = "zm_yunxi", Gender = "M" },
                    new AvailableVoiceDto { Name = "zm_yunxia", Gender = "M" },
                    new AvailableVoiceDto { Name = "zm_yunyang", Gender = "M" }
                }
            },
            new AvailableLanguageDto
            {
                Name = "Spanish",
                Code = "e",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "ef_dora", Gender = "F" },
                    new AvailableVoiceDto { Name = "em_alex", Gender = "M" },
                    new AvailableVoiceDto { Name = "em_santa", Gender = "M" }
                }
            },
            new AvailableLanguageDto
            {
                Name = "French",
                Code = "f",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "ff_siwis", Gender = "F" }
                }
            },
            new AvailableLanguageDto
            {
                Name = "Hindi",
                Code = "h",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "hf_alpha", Gender = "F" },
                    new AvailableVoiceDto { Name = "hf_beta", Gender = "F" },
                    new AvailableVoiceDto { Name = "hm_omega", Gender = "M" },
                    new AvailableVoiceDto { Name = "hm_psi", Gender = "M" }
                }
            },
            new AvailableLanguageDto
            {
                Name = "Italian",
                Code = "i",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "if_sara", Gender = "F" },
                    new AvailableVoiceDto { Name = "im_nicola", Gender = "M" }
                }
            },
            new AvailableLanguageDto
            {
                Name = "Brazilian Portuguese",
                Code = "p",
                Voices = new List<AvailableVoiceDto>
                {
                    new AvailableVoiceDto { Name = "pf_dora", Gender = "F" },
                    new AvailableVoiceDto { Name = "pm_alex", Gender = "M" },
                    new AvailableVoiceDto { Name = "pm_santa", Gender = "M" }
                }
            }
        };
        return languagesWithVoices;
    }
}