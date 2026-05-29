namespace WorkspaceAPIs.Controllers;

[ApiController]
[Route("execute-flow")]
[Authorize]
public class ExecuteFlowController : BaseApiController
{
    private readonly IExecuteFlowStep1Service _executeFlowStep1Service;

    public ExecuteFlowController(IExecuteFlowStep1Service executeFlowStep1Service)
    {
        _executeFlowStep1Service = executeFlowStep1Service;
    }

    /// <summary>
    /// Endpoint to execute the flow on web from anywhere on our av-platform.
    /// Flow graph validations will be applied based on the flow version published status
    /// </summary>
    [HttpPost("execute")]
    public async Task<ActionResult<ServiceResponse<ExecuteFlowResponseDto>>> ExecuteFlowAsync([FromBody] ExecuteFlowRequestDto requestDto)
    {
        // TODO: need to decide on what kind of this trigger type we want to use for non published and published flow execution
        return ResultHelper(await _executeFlowStep1Service.ExecuteFlowAsync(requestDto, TriggerTypesEnum.ManualTrigger));
    }

    /// <summary>
    /// Executes a flow via webhook trigger from external systems.
    /// 
    /// - Requires API key authentication (handled by WebhookTriggerAuthorizeAttribute)
    /// - Only published flows can be executed
    /// - Accepts raw JSON payload from external source
    /// </summary>
    [HttpPost("webhook")]
    [AllowAnonymous] // bypass JWT/auth
    [WebhookTriggerAuthorize]
    public async Task<ActionResult<ServiceResponse<ExecuteFlowResponseDto>>> ExecuteFlowFromWebhookAsync([FromBody] ExecuteFlowRequestDto requestDto)
    {
        return ResultHelper(await _executeFlowStep1Service.ExecuteFlowAsync(requestDto, TriggerTypesEnum.WebhookTrigger));
    }
}