namespace MLModelBuilderAPIs.Controllers;

[Route("question-answer")]
[ApiController]
[Authorize]
public class QuestionAnswerController : BaseApiController
{
    private readonly IQuestionAnswerService _questionAnswerService;

    public QuestionAnswerController(IQuestionAnswerService QuestionAnswerService)
    {
        _questionAnswerService = QuestionAnswerService;
    }

    // Updates an existing QuestionAnswer setup
    [HttpPut("setup")]
    public async Task<ActionResult<ServiceResponse<QuestionAnswerDto>>> UpdateQuestionAnswerSetup([FromBody] QuestionAnswerDto QuestionAnswerDto)
    {
        return ResultHelper(await _questionAnswerService.UpdateQuestionAnswerSetupAsync(QuestionAnswerDto));
    }

    // Retrieves a specific QuestionAnswer setup by ml model ID
    [HttpGet("setup-by-model/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<QuestionAnswerDto>>> GetQuestionAnswerSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _questionAnswerService.GetQuestionAnswerSetupByMLModelIdAsync(mlModelId));
    }

    // Extracts data via a Language Learning Model (LLM)
    [HttpPost("extract-via-llm")]
    public async Task<ActionResult<ServiceResponse<QuestionAnswerResponseDto>>> ExtractViaLLM(ExtractRequestDto extractRequestDto)
    {
        return ResultHelper(await _questionAnswerService.ExtractViaLLMAsync(extractRequestDto));
    }

    // Retrieves a collection of extracted data records associated with a specific machine learning model.
    [HttpGet("extracted-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<QuestionAnswerExtractedDataDto>>>> GetExtractedDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _questionAnswerService.GetExtractedDataByMLModelIdAsync(mlModelId));
    }

    // Retrieves a collection of extracted review data records associated with a specific machine learning model.
    [HttpGet("review-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractedReviewDataDto>>>> GetExtractedReviewDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _questionAnswerService.GetExtractedReviewDataByMLModelIdAsync(mlModelId));
    }
}