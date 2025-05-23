namespace MLModelBuilderAPIs.Controllers;

[Route("classification")]
[ApiController]
[Authorize]
public class ClassificationController : BaseApiController
{
    private readonly IClassificationService _classificationService;

    public ClassificationController(IClassificationService ClassificationService)
    {
        _classificationService = ClassificationService;
    }

    // Updates an existing extraction setup
    [HttpPut("setup")]
    public async Task<ActionResult<ServiceResponse<ClassificationDto>>> UpdateClassificationSetup([FromBody] ClassificationDto classificationDto)
    {
        return ResultHelper(await _classificationService.UpdateClassificationSetupAsync(classificationDto));
    }

    // Retrieves a specific extraction setup by ml model ID
    [HttpGet("setup-by-model/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<ClassificationDto>>> GetClassificationSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _classificationService.GetClassificationSetupByMLModelIdAsync(mlModelId));
    }

    // Extracts data via a Language Learning Model (LLM)
    [HttpPost("extract-via-llm")]
    public async Task<ActionResult<ServiceResponse<ClassificationResponseDto>>> ExtractViaLLM(ExtractRequestDto extractRequestDto)
    {
        return ResultHelper(await _classificationService.ExtractViaLLMAsync(extractRequestDto));
    }

    // Retrieves a collection of extracted data records associated with a specific machine learning model.
    [HttpGet("extracted-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ClassificationExtractedDataDto>>>> GetExtractedDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _classificationService.GetExtractedDataByMLModelIdAsync(mlModelId));
    }

    // Retrieves a collection of extracted review data records associated with a specific machine learning model.
    [HttpGet("review-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractedReviewDataDto>>>> GetExtractedReviewDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _classificationService.GetExtractedReviewDataByMLModelIdAsync(mlModelId));
    }
}