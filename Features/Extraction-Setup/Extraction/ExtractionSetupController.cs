namespace MLModelBuilderAPIs.Controllers;

[Route("extraction")]
[ApiController]
[Authorize]
public class ExtractionSetupController : BaseApiController
{
    private readonly IExtractionSetupService _extractionSetupService;

    public ExtractionSetupController(IExtractionSetupService extractionSetupService)
    {
        _extractionSetupService = extractionSetupService;
    }

    // Updates an existing extraction setup
    [HttpPut("setup")]
    public async Task<ActionResult<ServiceResponse<ExtractionSetupDto>>> UpdateExtractionSetup([FromBody] MLModelSetupDto mlModelSetupDto)
    {
        return ResultHelper(await _extractionSetupService.UpdateExtractionSetupAsync(mlModelSetupDto));
    }

    // Retrieves a specific extraction setup by ml model ID
    [HttpGet("setup-by-model/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<ExtractionSetupDto>>> GetExtractionSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _extractionSetupService.GetExtractionSetupByMLModelIdAsync(mlModelId));
    }

    // Extracts data via a Language Learning Model (LLM)
    [HttpPost("extract-via-llm")]
    public async Task<ActionResult<ServiceResponse<ExtractionResponseDto>>> ExtractViaLLM(ExtractRequestDto extractRequestDto)
    {
        return ResultHelper(await _extractionSetupService.ExtractViaLLMAsync(extractRequestDto));
    }
}