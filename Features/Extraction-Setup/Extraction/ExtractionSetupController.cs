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

    // Retrieves a collection of extracted data records associated with a specific machine learning model.
    [HttpGet("extracted-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractedDataResponseDto>>>> GetExtractedDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _extractionSetupService.GetExtractedDataByMLModelIdAsync(mlModelId));
    }

    // Retrieves a collection of extracted review data records associated with a specific machine learning model.
    [HttpGet("review-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractionReviewDataDto>>>> GetExtractedReviewDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _extractionSetupService.GetExtractedReviewDataByMLModelIdAsync(mlModelId));
    }

    // Updates one or more extracted review data records linked to a specific machine learning model.
    [HttpPut("review-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<ExtractedDataResponseDto>>> UpdateExtractedReviewData(ExtractedDataResponseDto extractedDataResponseDto)
    {
        return ResultHelper(await _extractionSetupService.UpdateExtractedReviewDataAsync(extractedDataResponseDto));
    }
}