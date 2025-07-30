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
}