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
    [HttpGet("setup/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<SentimentAnalyticDto>>> GetSentimentAnalyticsSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _sentimentAnalyticsService.GetSentimentAnalyticsSetupByMLModelIdAsync(mlModelId));
    }
}