
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
            Message = "Failed to retrieve the conversational model setup. Please try again later."
        };

        try
        {
            // Log the beginning of the retrieval process with the ML model ID
            _logger.LogInformation("Attempting to retrieve conversational model setup for ML model with ID: {MLModelId}", mlModelId);

            // Fetch the model setup from the database by its ML model ID, including related user and task data
            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mlModelId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.ConversationalModel)
                .SingleOrDefaultAsync();

            // If no model setup is found, log a warning and return an appropriate message
            if (mlModel == null)
            {
                _logger.LogWarning("No model setup found for ML model with ID: {MLModelId}", mlModelId);
                serviceResponse.Message = "No conversational model setup exists for the provided ML model ID.";
                return serviceResponse;
            }

            // Log the successful retrieval of the model setup
            _logger.LogInformation("Successfully retrieved model setup for ML model with ID: {MLModelId}", mlModelId);

            // Adapt the retrieved ML model to the corresponding DTO (Data Transfer Object)
            var conversationModelDto = mlModel.Adapt<ConversationModelDto>();

            // Retrieve the list of Conversation tasks and add it to the model DTO
            if (mlModel.ConversationalModel != null)
            {
                conversationModelDto.AIPersona = mlModel.ConversationalModel.Adapt<ConversationModelSetupTaskDto>();
            }

            // Map the adapted model setup (including tasks) to the response DTO
            serviceResponse.Data = conversationModelDto;

            // Set the success response status and message
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversational model setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log the exception details if an error occurs during the process
            _logger.LogError("Error occurred while retrieving conversational model setup for ML model with ID: {MLModelId}. Exception: {ExceptionMessage}", mlModelId, ex.Message);
        }

        // Return the service response (either successful or failure)
        return serviceResponse;
    }

    // Updates an existing conversational model setup and its associated AI persona configuration.
    public async Task<ServiceResponse<ConversationModelDto>> UpdateSetupAsync(ConversationModelDto conversationModelDto)
    {
        // Initialize default failure response
        var serviceResponse = new ServiceResponse<ConversationModelDto>
        {
            Data = null,
            Message = "Failed to update conversational model. Please try again later."
        };

        try
        {
            _logger.LogInformation("Starting update for conversational model | Model ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);

            // Retrieve the existing ML model from the database, including any associated conversational tasks
            var existingModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(m => m.Id == conversationModelDto.Id)
                .Include(m => m.ConversationalModel)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Handle case where the model does not exist
            if (existingModel == null)
            {
                _logger.LogWarning("Conversational model not found | ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);
                serviceResponse.Message = "Conversational model not found.";
                return serviceResponse;
            }

            // Prevent modifications to published models
            if (existingModel.IsPublished)
            {
                _logger.LogWarning("Modification blocked for published model | ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);
                serviceResponse.Message = "Published models cannot be modified.";
                return serviceResponse;
            }

            // Trim string values from the incoming DTO to avoid invalid whitespace issues
            conversationModelDto = TrimDtoStringPropsUtil.TrimDtoStringProps(conversationModelDto);

            _logger.LogInformation("Applying updates to base model entity | Model ID: {Id}", conversationModelDto.Id);

            // Map changes from DTO to existing model entity
            existingModel.Adapt(conversationModelDto);
            existingModel.Type = ModelTypesEnum.Conversation;
            existingModel.SetupStatus = SetupStatusTypesEnum.Completed;
            existingModel.LastModifiedByUserId = _userId;

            // Update base model in the database
            _unitOfWork.MLModelRepo.Update(existingModel);

            // Save base model changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save base model changes | Model ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);
                return serviceResponse;
            }

            // Handle AI persona configuration if provided
            if (conversationModelDto.AIPersona != null)
            {
                // Look for an existing persona task named "AIPersona"
                var conversationalModel = existingModel.ConversationalModel;

                if (conversationalModel == null)
                {
                    // No existing task — create a new conversational persona
                    var newPersona = conversationModelDto.AIPersona.Adapt<ConversationalModel>();
                    newPersona.MLModelId = existingModel.Id;
                    newPersona.CreatedByUserId = _userId;
                    newPersona.LastModifiedByUserId = _userId;

                    await _unitOfWork.ConversationalModelRepo.InsertAsync(newPersona);
                }
                else
                {
                    // Existing task found — update it from the DTO
                    conversationModelDto.AIPersona.Adapt(conversationalModel);
                    conversationalModel.LastModifiedByUserId = _userId;

                    _unitOfWork.ConversationalModelRepo.Update(conversationalModel);
                }

                // Save changes to the persona task
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save AI persona changes | Model ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);
                    return serviceResponse;
                }
            }

            _logger.LogInformation("Conversational model update successful | Model ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);

            // Return successful response with updated data
            serviceResponse.Data = existingModel.Adapt<ConversationModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversational model updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating conversational model | Model ID: {Id} | User ID: {UserId}", conversationModelDto.Id, _userId);
        }

        return serviceResponse;
    }

    // Retrieves a list of available languages, each with associated voices. 
    public ServiceResponse<IEnumerable<AvailableLanguageDto>> GetLanguagesWithVoices()
    {
        // Initialize the response object with default values
        var serviceResponse = new ServiceResponse<IEnumerable<AvailableLanguageDto>>()
        {
            Data = null,
            Message = "Failed to retrieve languages with voices. Please try again later.",
        };

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

        // Assign the language data to the response
        serviceResponse.Data = languagesWithVoices;
        serviceResponse.StatusCode = 200;
        serviceResponse.Message = "Languages with associated voices retrieved successfully.";

        // Return the response
        return serviceResponse;
    }

    // Retrieves a list of available Text-to-Speech services and their options.
    public ServiceResponse<IEnumerable<TextToSpeechOptionDto>> GetAvailableTextToSpeechServices()
    {
        // Initialize the response object with default values
        var serviceResponse = new ServiceResponse<IEnumerable<TextToSpeechOptionDto>>()
        {
            Data = null,
            Message = "Failed to retrieve Text-to-Speech services and their options. Please try again later.",
        };

        // Seed top 6 available services for Text-to-Speech with process-focused descriptions
        var textToSpeechServices = new List<TextToSpeechOptionDto>
    {
        new TextToSpeechOptionDto
        {
            Name = "OpenAI TTS",
            Description = "OpenAI's TTS system processes input text through advanced language models, transforming it into human-like speech. The process involves generating the speech waveform with highly realistic and natural-sounding voices that adapt to different tones and contexts."
        },
        new TextToSpeechOptionDto
        {
            Name = "Google TTS Wavenet",
            Description = "Google's Wavenet TTS works by feeding text through a deep neural network that predicts waveform characteristics for each phoneme. The resulting sound is high-quality and lifelike, with smooth prosody and expressive tone adjustments based on the context."
        },
        new TextToSpeechOptionDto
        {
            Name = "Amazon Polly",
            Description = "Amazon Polly converts text to speech by utilizing deep learning algorithms to generate lifelike voices. The TTS process involves breaking down the input text into phonetic units, adjusting pitch and speed, and creating a dynamic waveform that mimics human speech patterns."
        },
        new TextToSpeechOptionDto
        {
            Name = "Microsoft Azure TTS",
            Description = "Microsoft Azure TTS uses neural networks to synthesize speech by first analyzing the input text, then generating the corresponding voice waveform with appropriate intonation, tone, and pace. Azure’s system allows for fine-tuned customization of voice attributes to suit different applications."
        },
        new TextToSpeechOptionDto
        {
            Name = "Conqui TTS",
            Description = "Conqui TTS processes text input into speech by leveraging neural network models that understand linguistic nuances. It adjusts speech characteristics such as speed, pitch, and emotion, producing clear and articulate speech across different languages and accents."
        },
        new TextToSpeechOptionDto
        {
            Name = "Bark by Sone",
            Description = "Bark by Sone processes text using advanced deep learning techniques to generate expressive and emotional speech. Its TTS model incorporates human-like inflections, producing nuanced and context-aware speech ideal for immersive environments and emotionally engaging experiences."
        }
    };

        // Assign the seeded language data to the response
        serviceResponse.Data = textToSpeechServices;
        serviceResponse.StatusCode = 200;

        // Updated success message reflecting the retrieval of the Text-to-Speech options
        serviceResponse.Message = "Successfully retrieved Text-to-Speech service options with associated process descriptions.";

        // Return the response
        return serviceResponse;
    }

    // Retrieves a list of available Speech-to-Text services and their options.
    public ServiceResponse<IEnumerable<SpeechToTextOptionDto>> GetAvailableSpeechToTextServices()
    {
        // Initialize the response object with default values
        var serviceResponse = new ServiceResponse<IEnumerable<SpeechToTextOptionDto>>()
        {
            Data = null,
            Message = "Failed to retrieve Speech-to-Text services. Please try again later.",
        };

        // Seed available Speech-to-Text services with process-focused descriptions
        var speechToTextServices = new List<SpeechToTextOptionDto>
    {
        new SpeechToTextOptionDto
        {
            Name = "Whisper AI",
            Description = "Whisper AI processes audio input through deep learning models, where speech is transcribed into text. It continuously adapts to different accents, languages, and noise conditions for accurate transcription."
        },
        new SpeechToTextOptionDto
        {
            Name = "Google Speech-to-Text",
            Description = "Google Speech-to-Text captures audio input and processes it using advanced neural networks to convert spoken words into written text. It utilizes a cloud-based model, providing real-time transcription with high accuracy."
        },
        new SpeechToTextOptionDto
        {
            Name = "Assembly AI",
            Description = "Assembly AI's process involves real-time audio recognition where audio files are transcribed into text using state-of-the-art machine learning algorithms, while also supporting advanced features like speaker separation and keyword detection."
        },
        new SpeechToTextOptionDto
        {
            Name = "Deepgram",
            Description = "Deepgram’s process involves converting audio into text by first extracting speech features through AI models, and then transcribing them with neural networks. Its unique pipeline allows for fast and efficient processing even in noisy environments."
        },
        new SpeechToTextOptionDto
        {
            Name = "Mozilla DeepSpeech",
            Description = "Mozilla DeepSpeech uses a deep learning framework to process raw audio and transform it into text. It works by training a neural network model that recognizes patterns in speech and outputs the corresponding textual representation."
        },
        new SpeechToTextOptionDto
        {
            Name = "Vosk",
            Description = "Vosk transcribes speech by processing audio through a lightweight speech recognition model that operates offline. The system analyzes the acoustic features of speech, matches it to pre-trained phonetic models, and outputs the text."
        }
    };

        // Assign the speech-to-text services data to the response
        serviceResponse.Data = speechToTextServices;
        serviceResponse.StatusCode = 200;

        // Updated success message reflecting successful retrieval
        serviceResponse.Message = "Successfully retrieved available Speech-to-Text services.";

        // Return the response
        return serviceResponse;
    }
}

