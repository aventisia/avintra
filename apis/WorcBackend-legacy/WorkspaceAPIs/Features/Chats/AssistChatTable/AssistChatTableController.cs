namespace WorkspaceAPIs.Controllers;

[Route("assist-chat")]
[ApiController]
[Authorize]
public class AssistChatTableController : BaseApiController
{
    private readonly IAssistChatTableService _assistChatTableService;

    public AssistChatTableController(IAssistChatTableService assistChatTableService)
    {
        _assistChatTableService = assistChatTableService;
    }

    // Retrieves all actuve conversation of flow versions.
    [HttpGet("active")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssistChatTableDto>>>> GetAssignedFlowVersionsAsync()
    {
        return ResultHelper(await _assistChatTableService.GetPublishFlowVersionsAsync());
    }

    // Retrieves all archived flow versions.
    [HttpGet("archived")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssistChatTableDto>>>> GetArchivedFlowVersionsAsync()
    {
        return ResultHelper(await _assistChatTableService.GetArchiveFlowVersionsAsync());
    }

    // Updates an existing flow version.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<AssistChatTableDto>>> UpdateFlowVersionAsync([FromBody] AssistChatTableDto assistChatTableDto)
    {
        return ResultHelper(await _assistChatTableService.UpdateFlowVersionAsync(assistChatTableDto));
    }
}