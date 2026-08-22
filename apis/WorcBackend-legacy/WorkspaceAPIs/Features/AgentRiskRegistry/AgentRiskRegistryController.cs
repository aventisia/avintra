using WorkspaceAPIs.DTOs;
using WorkspaceAPIs.Services;

namespace WorkspaceAPIs.Controllers;

[Route("agent-risk-registry")]
[ApiController]
[Authorize]
public class AgentRiskRegistryController : BaseApiController
{
    private readonly IAgentRiskRegistryService _service;

    public AgentRiskRegistryController(IAgentRiskRegistryService service)
    {
        _service = service;
    }

    // Retrieves all registry rows for the table view.
    [HttpGet("rows")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AgentRiskRegistryRowDto>>>> GetAllRows()
    {
        return ResultHelper(await _service.GetAllRowsAsync());
    }

    // Retrieves the registry rows pending the current user's approval.
    [HttpGet("pending-approvals")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AgentRiskRegistryRowDto>>>> GetPendingApprovals()
    {
        return ResultHelper(await _service.GetPendingApprovalsAsync());
    }

    // Retrieves the full registry record for a flow version (agent).
    [HttpGet("flow-version/{flowVersionId}")]
    public async Task<ActionResult<ServiceResponse<AgentRiskRegistryDto>>> GetByFlowVersion(Guid flowVersionId)
    {
        return ResultHelper(await _service.GetByFlowVersionAsync(flowVersionId));
    }

    // Creates or updates the registry record for a flow version.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<AgentRiskRegistryDto>>> Upsert([FromBody] AgentRiskRegistryUpsertDto dto)
    {
        return ResultHelper(await _service.UpsertAsync(dto));
    }
}
