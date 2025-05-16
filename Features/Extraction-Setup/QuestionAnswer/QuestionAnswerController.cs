namespace MLModelBuilderAPIs.Controllers;

[Route("question-answer")]
[ApiController]
[Authorize]
public class QuestionAnswerController : BaseApiController
{
    private readonly IQuestionAnswerService _QuestionAnswerService;

    public QuestionAnswerController(IQuestionAnswerService QuestionAnswerService)
    {
        _QuestionAnswerService = QuestionAnswerService;
    }

    // Updates an existing QuestionAnswer setup
    [HttpPut("setup")]
    public async Task<ActionResult<ServiceResponse<QuestionAnswerDto>>> UpdateQuestionAnswerSetup([FromBody] QuestionAnswerDto QuestionAnswerDto)
    {
        return ResultHelper(await _QuestionAnswerService.UpdateQuestionAnswerSetupAsync(QuestionAnswerDto));
    }

    // Retrieves a specific QuestionAnswer setup by ml model ID
    [HttpGet("setup-by-model/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<QuestionAnswerDto>>> GetQuestionAnswerSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _QuestionAnswerService.GetQuestionAnswerSetupByMLModelIdAsync(mlModelId));
    }
}