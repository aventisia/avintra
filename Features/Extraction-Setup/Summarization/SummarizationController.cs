namespace MLModelBuilderAPIs.Controllers;

[Route("summarization")]
[ApiController]
[Authorize]
public class SummarizationController : BaseApiController
{
    private readonly ISummarizationService _SummarizationService;

    public SummarizationController(ISummarizationService SummarizationService)
    {
        _SummarizationService = SummarizationService;
    }

    // Updates an existing summarization setup
    [HttpPut("setup")]
    public async Task<ActionResult<ServiceResponse<SummarizationDto>>> UpdateSummarizationSetup([FromBody] SummarizationDto summarizationDto)
    {
        return ResultHelper(await _SummarizationService.UpdateSummarizationSetupAsync(summarizationDto));
    }

    // Retrieves a specific summarization setup by ml model ID
    [HttpGet("setup-by-model/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<SummarizationDto>>> GetSummarizationSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _SummarizationService.GetSummarizationSetupByMLModelIdAsync(mlModelId));
    }
}