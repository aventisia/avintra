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

    // Retrieves all assigned (published) flow versions.
    [HttpGet("assigned")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssistChatTableDto>>>> GetAssignedFlowVersionsAsync()
    {
        var response = await _assistChatTableService.GetPublishFlowVersionsAsync();
        return ResultHelper(response);
    }

    // Retrieves all archived flow versions.
    [HttpGet("archived")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssistChatTableDto>>>> GetArchivedFlowVersionsAsync()
    {
        var response = await _assistChatTableService.GetArchiveFlowVersionsAsync();
        return ResultHelper(response);
    }

    // Updates an existing flow version.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<AssistChatTableDto>>> UpdateFlowVersionAsync(
        [FromBody] AssistChatTableDto assistChatTableDto)
    {
        var response = await _assistChatTableService.UpdateFlowVersionAsync(assistChatTableDto);
        return ResultHelper(response);
    }
}