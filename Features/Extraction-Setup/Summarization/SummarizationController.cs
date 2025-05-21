namespace MLModelBuilderAPIs.Controllers;

[Route("summarization")]
[ApiController]
[Authorize]
public class SummarizationController : BaseApiController
{
    private readonly ISummarizationService _summarizationService;

    public SummarizationController(ISummarizationService SummarizationService)
    {
        _summarizationService = SummarizationService;
    }

    // Updates an existing summarization setup
    [HttpPut("setup")]
    public async Task<ActionResult<ServiceResponse<SummarizationDto>>> UpdateSummarizationSetup([FromBody] SummarizationDto summarizationDto)
    {
        return ResultHelper(await _summarizationService.UpdateSummarizationSetupAsync(summarizationDto));
    }

    // Retrieves a specific summarization setup by ml model ID
    [HttpGet("setup-by-model/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<SummarizationDto>>> GetSummarizationSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _summarizationService.GetSummarizationSetupByMLModelIdAsync(mlModelId));
    }

    // Extracts data via a Language Learning Model (LLM)
    [HttpPost("extract-via-llm")]
    public async Task<ActionResult<ServiceResponse<SummarizationResponseDto>>> ExtractViaLLM(ExtractRequestDto extractRequestDto)
    {
        return ResultHelper(await _summarizationService.ExtractViaLLMAsync(extractRequestDto));
    }
}