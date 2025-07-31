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
    [HttpGet("setup/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<GenerativeModelDto>>> GetSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _generativeModelService.GetSetupByMLModelIdAsync(mlModelId));
    }

    // Updates an existing model setup
    [HttpPut("setup")]
    public async Task<ActionResult<ServiceResponse<GenerativeModelDto>>> UpdateSetup([FromBody] GenerativeModelDto modelSetupDto)
    {
        return ResultHelper(await _generativeModelService.UpdateSetupAsync(modelSetupDto));
    }
}