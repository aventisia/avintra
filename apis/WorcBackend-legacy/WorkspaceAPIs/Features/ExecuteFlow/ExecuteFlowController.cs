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

    /// <summary>
    /// Endpoint to execute the flow on web from anywhere on our worc platform.
    /// Flow graph validations will be applied based on the flow version published status
    /// </summary>
    [HttpPost("execute")]
    public async Task<ActionResult<ServiceResponse<ExecuteFlowResponseDto>>> ExecuteFlowAsync([FromBody] ExecuteFlowRequestDto requestDto)
    {
        return ResultHelper(await _executeFlowService.ExecuteFlowAsync(requestDto));
    }

    // TODO: Endpoint to execute the flow on web via webhook trigger from external system. It can only execute published flows via webhook triggers only. Yet to implement or finalized
}
