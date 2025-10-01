namespace MLModelBuilderAPIs.Controllers;

[Route("generative-model")]
[ApiController]
[Authorize]
public class GenerativeModelController : BaseApiController
{
    private readonly IGenerativeModelService _generativeModelService;

    public GenerativeModelController(IGenerativeModelService GenerativeModelService)
    {
        _generativeModelService = GenerativeModelService;
    }

    // -------------------- Setup & Test Endpoints --------------------

    // Retrieves a specific model setup by ml model ID
    [HttpGet("setup/{aiProjectId}")]
    public async Task<ActionResult<ServiceResponse<GenerativeModelDto>>> GetSetupByAIProjectId(Guid aiProjectId, Guid? aiProjectVersionId)
    {
        return ResultHelper(await _generativeModelService.GetSetupByAIProjectIdAsync(aiProjectId, aiProjectVersionId));
    }

    // Updates an existing model setup
    [HttpPut("setup")]
    public async Task<ActionResult<ServiceResponse<GenerativeModelDto>>> UpdateSetup([FromBody] GenerativeModelDto modelSetupDto)
    {
        return ResultHelper(await _generativeModelService.UpdateSetupAsync(modelSetupDto));
    }

    // Updates the configuration of a generative model setup and executes the model with the new configuration
    [HttpPut("update-and-execute")]
    public async Task<ActionResult<ServiceResponse<ConversationHistoryDto>>> UpdateAndExecute([FromBody] GenerativeModelDto modelSetupDto, Guid? cid)
    {
        return ResultHelper(await _generativeModelService.UpdateAndExecuteAsync(modelSetupDto, cid));
    }
}