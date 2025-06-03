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

    // -------------------- Setup & Test Endpoints --------------------

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

    // -------------------- Run & Review Data Endpoints --------------------

    // Retrieves a collection of extracted review data records associated with a specific machine learning model.
    [HttpGet("review-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractionReviewDataDto>>>> GetExtractedReviewDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _questionAnswerService.GetExtractedReviewDataByMLModelIdAsync(mlModelId));
    }

    // Updates one or more extracted review data records linked to a specific machine learning model.
    [HttpPut("review-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<QuestionAnswerExtractedDataDto>>> UpdateExtractedReviewData(QuestionAnswerExtractedDataDto questionAnswerExtractedDataDto)
    {
        return ResultHelper(await _questionAnswerService.UpdateExtractedReviewDataAsync(questionAnswerExtractedDataDto));
    }

    // Adds review data associated with a specific machine learning model.
    [HttpPost("review-data")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<QuestionAnswerReviewDataDto>>>> AddReviewDataByMLModelId(CreateModelReviewRequestDto createModelReviewRequestDto)
    {
        return ResultHelper(await _questionAnswerService.AddReviewDataAsync(createModelReviewRequestDto));
    }

    // -------------------- Fine-Tining Data Endpoints --------------------

    // Retrieves a collection of fine-tuning data records associated with the specified machine learning model ID.
    [HttpGet("fine-tuning/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SummarizationFineTuningDataDto>>>> GetFineTunningDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _questionAnswerService.GetFineTunningDataByMLModelIdAsync(mlModelId));
    }

    // Schedules a fine-tuning job for a specific machine learning model by sending the fine-tuning request details.
    [HttpPost("schedule-fine-tuning")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SummarizationFineTuningDataDto>>>> ScheduleFineTuningAsync(AddFineTuningRequestDto addFineTuningRequestDto)
    {
        return ResultHelper(await _questionAnswerService.ScheduleFineTuningAsync(addFineTuningRequestDto));
    }

    // Retrieves the fine-tuning history records associated with a specific ML model.
    [HttpGet("fine-tuning/histories/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FineTuningHistoryDto>>>> GetFineTuningDataHistories(Guid mlModelId)
    {
        return ResultHelper(await _questionAnswerService.GetFineTuningDataHistoriesAsync(mlModelId));
    }
}