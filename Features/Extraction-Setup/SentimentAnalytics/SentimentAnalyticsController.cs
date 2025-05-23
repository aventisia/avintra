namespace MLModelBuilderAPIs.Controllers;

[Route("sentiment-analytics")]
[ApiController]
[Authorize]
public class SentimentAnalyticsController : BaseApiController
{
    private readonly ISentimentAnalyticsService _sentimentAnalyticsService;

    public SentimentAnalyticsController(ISentimentAnalyticsService sentimentAnalyticsService)
    {
        _sentimentAnalyticsService = sentimentAnalyticsService;
    }

    // Updates an existing extraction setup
    [HttpPut("setup")]
    public async Task<ActionResult<ServiceResponse<SentimentAnalyticDto>>> UpdateSentimentAnalyticsSetup([FromBody] SentimentAnalyticDto sentimentAnalyticDto)
    {
        return ResultHelper(await _sentimentAnalyticsService.UpdateSentimentAnalyticsSetupAsync(sentimentAnalyticDto));
    }

    // Retrieves a specific extraction setup by ml model ID
    [HttpGet("setup-by-model/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<SentimentAnalyticDto>>> GetSentimentAnalyticsSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _sentimentAnalyticsService.GetSentimentAnalyticsSetupByMLModelIdAsync(mlModelId));
    }

    // Extracts data via a Language Learning Model (LLM)
    [HttpPost("extract-via-llm")]
    public async Task<ActionResult<ServiceResponse<SentimentAnalyticsResponseDto>>> ExtractViaLLM(ExtractRequestDto extractRequestDto)
    {
        return ResultHelper(await _sentimentAnalyticsService.ExtractViaLLMAsync(extractRequestDto));
    }

    // Retrieves a collection of extracted data records associated with a specific machine learning model.
    [HttpGet("extracted-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SentimentAnalyticsExtractedDataDto>>>> GetExtractedDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _sentimentAnalyticsService.GetExtractedDataByMLModelIdAsync(mlModelId));
    }

    // Retrieves a collection of extracted review data records associated with a specific machine learning model.
    [HttpGet("review-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SentimentAnalyticsReviewDataDto>>>> GetExtractedReviewDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _sentimentAnalyticsService.GetExtractedReviewDataByMLModelIdAsync(mlModelId));
    }
}