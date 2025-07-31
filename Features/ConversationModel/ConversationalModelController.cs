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
    [HttpGet("languages/available")]
    public ActionResult<ServiceResponse<AvailableLanguageDto>> GetLanguagesWithVoices()
    {
        return ResultHelper(_ConversationModelService.GetLanguagesWithVoices());
    }
    
    // Retrieves a list of available Speech-to-Text services and their options.
    [HttpGet("speech-to-text")]
    public ActionResult<ServiceResponse<SpeechToTextOptionDto>> GetAvailableSpeechToTextServices()
    {
        return ResultHelper(_ConversationModelService.GetAvailableSpeechToTextServices());
    }

    // Retrieves a list of available Text-to-Speech services and their options.
    [HttpGet("text-to-speech")]
    public ActionResult<ServiceResponse<TextToSpeechOptionDto>> GetAvailableTextToSpeechServices()
    {
        return ResultHelper(_ConversationModelService.GetAvailableTextToSpeechServices());
    }
}