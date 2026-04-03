namespace WorkspaceAPIs.Controllers;

[Route("assist-chat")]
[ApiController]
[Authorize]
public class AssistChatController : BaseApiController
{
    private readonly IAssistChatService _assistChatService;

    public AssistChatController(IAssistChatService assistChatService)
    {
        _assistChatService = assistChatService;
    }

    // Retrieves all actuve conversation of flow versions.
    [HttpGet("active")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssistChatDto>>>> GetAssignedFlowVersionsAsync()
    {
        return ResultHelper(await _assistChatService.GetPublishFlowVersionsAsync());
    }

    // Retrieves all archived flow versions.
    [HttpGet("archived")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssistChatDto>>>> GetArchivedFlowVersionsAsync()
    {
        return ResultHelper(await _assistChatService.GetArchiveFlowVersionsAsync());
    }

    // Updates an existing flow version.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<AssistChatDto>>> UpdateFlowVersionAsync([FromBody] AssistChatDto assistChatDto)
    {
        return ResultHelper(await _assistChatService.UpdateFlowVersionAsync(assistChatDto));
    }
}