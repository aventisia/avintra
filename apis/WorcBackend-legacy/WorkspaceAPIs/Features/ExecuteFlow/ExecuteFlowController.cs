namespace WorkspaceAPIs.Controllers;

[ApiController]
[Route("execute-flow")]
[Authorize]
public class ExecuteFlowController : BaseApiController
{
    private readonly IExecuteFlowService _executeFlowService;

    public ExecuteFlowController(IExecuteFlowService executeFlowService)
    {
        _executeFlowService = executeFlowService;
    }

    [HttpPost("execute")]
    public async Task<ActionResult<ServiceResponse<ExecuteFlowResponseDto>>> ExecuteFlowAsync([FromBody] ExecuteFlowRequestDto requestDto)
    {
        return ResultHelper(await _executeFlowService.ExecuteFlowAsync(requestDto));
    }
}
