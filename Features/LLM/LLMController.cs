namespace MLModelBuilderAPIs.Controllers;

[Route("llm")]
[ApiController]
[Authorize]
public class LLMController : BaseApiController
{
    #region Fields
    private readonly ILLMService _llmService;

    #endregion

    #region  Constructors
    public LLMController(ILLMService llmService)
    {
        _llmService = llmService;
    }

    #endregion

    #region Methods

    //Retrieve the list of LLMs
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<LLMDto>>>> GetAllLLMs()
    {
        return ResultHelper(await _llmService.GetAllLLMsAsync());
    }

    //check LLM name availability
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsLLMNameAvailable(CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _llmService.IsLLMNameAvailableAsync(checkAvailabilityDto));
    }

    //Creates a new LLM
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<LLMDto>>> InsertDataField([FromBody] LLMDto llmDto)
    {
        return ResultHelper(await _llmService.InsertLLMAsync(llmDto));
    }

    //Updates a LLM
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<LLMDto>>> UpdateLLM([FromBody] LLMDto llmDto)
    {
        return ResultHelper(await _llmService.UpdateLLMAsync(llmDto));
    }

    //Deletes a LLM permanently
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteLLM(Guid id)
    {
        return ResultHelper(await _llmService.DeleteLLMAsync(id));
    }

    //Get a LLM using identifier
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<LLMDto>>> GetLLMById(Guid id)
    {
        return ResultHelper(await _llmService.GetLLMByIdAsync(id));
    }

    #endregion

}
