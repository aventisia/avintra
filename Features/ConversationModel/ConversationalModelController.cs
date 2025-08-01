namespace MLModelBuilderAPIs.Controllers;

[Route("conversation-model")]
[ApiController]
[Authorize]
public class ConversationalModelController : BaseApiController
{
    private readonly IConversationModelService _ConversationModelService;

    public ConversationalModelController(IConversationModelService ConversationModelService)
    {
        _ConversationModelService = ConversationModelService;
    }

    // -------------------- Setup & Test Endpoints --------------------

    // Retrieves a specific model setup by ml model ID
    [HttpGet("setup/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<ConversationModelDto>>> GetSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _ConversationModelService.GetSetupByMLModelIdAsync(mlModelId));
    }

    // Updates an existing model setup
    [HttpPut("setup")]
    public async Task<ActionResult<ServiceResponse<ConversationModelDto>>> UpdateSetup([FromBody] ConversationModelDto modelSetupDto)
    {
        return ResultHelper(await _ConversationModelService.UpdateSetupAsync(modelSetupDto));
    }

    // -------------------- Text to Speech & Speech to Text --------------------

    // Retrieves a list of available languages for Speech-to-Text services with associated voices.
    [HttpGet("languages")]
    public ActionResult<ServiceResponse<SelectOptionDto>> GetLanguageOptions()
    {
        return ResultHelper(_ConversationModelService.GetLanguageOptions());
    }

    [HttpGet("voices/{language}")]
    public ActionResult<ServiceResponse<SelectOptionDto>> GetVoiceOptionsByLanguageName(string language)
    {
        return ResultHelper(_ConversationModelService.GetVoiceOptionsByLanguageName(language));
    }

    // Retrieves a list of available Speech-to-Text services and their options.
    [HttpGet("speech-to-text/{language}")]
    public ActionResult<ServiceResponse<SelectOptionDto>> GetAvailableSpeechToTextOptions(string language)
    {
        return ResultHelper(_ConversationModelService.GetAvailableSpeechToTextOptions(language));
    }

    // Retrieves a list of available Text-to-Speech services and their options.
    [HttpGet("text-to-speech/{language}")]
    public ActionResult<ServiceResponse<SelectOptionDto>> GetAvailableTextToSpeechOptions(string language)
    {
        return ResultHelper(_ConversationModelService.GetAvailableTextToSpeechOptions(language));
    }

    // Retrieves a list of available Speech-to-Text voices and their options.
    [HttpGet("text-to-speech/voices/{serviceName}")]
    public ActionResult<ServiceResponse<SelectOptionDto>> GetAvailableTextToSpeechVoicesOptions(string serviceName)
    {
        return ResultHelper(_ConversationModelService.GetAvailableTextToSpeechVoicesOptions(serviceName));
    }
}