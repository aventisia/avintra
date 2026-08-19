namespace WorkspaceAPIs.Controllers;

[Route("sa")]
[ApiController]
[Authorize(Roles = "SA")]
public class ManageTenantController : BaseApiController
{
    private readonly IManageTenantService _manageTenantService;

    public ManageTenantController(IManageTenantService manageTenantService)
    {
        _manageTenantService = manageTenantService;
    }

    // Deletes a tenant
    [HttpDelete("tenant")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTenant()
    {
        return ResultHelper(await _manageTenantService.DeleteTenantAsync());
    }

    // Gets tenant job summary (execution time and published agents).
    [HttpGet("tenant/summary")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TenantTableSummaryDto>>>> GetTenantJobSummary([FromQuery] DateTimeOffset? startDate, [FromQuery] DateTimeOffset? endDate)
    {
        return ResultHelper(await _manageTenantService.GetTenantJobSummaryAsync(startDate, endDate));
    }

    // Gets the list of published agents for a specific tenant.
    [HttpGet("tenant/{tenantId}/published-agents")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TenantPublishedAgentDto>>>> GetTenantPublishedAgents(Guid tenantId)
    {
        return ResultHelper(await _manageTenantService.GetTenantPublishedAgentsAsync(tenantId));
    }

    // Sets the fixed credits limit for a published agent.
    [HttpPut("agent/{flowVersionId}/fixed-credits")]
    public async Task<ActionResult<ServiceResponse<bool>>> SetFixedCredits(Guid flowVersionId, [FromBody] double? fixedCredits)
    {
        return ResultHelper(await _manageTenantService.SetFixedCreditsAsync(flowVersionId, fixedCredits));
    }
}