namespace WorkspaceAPIs.Controllers;

[ApiController]
[Route("execution")]
[Authorize]
public class ExecutionController : BaseApiController
{
    private readonly IExecutionGraphService _executionGraphService;
    private readonly IJobsTableService _jobsTableService;

    public ExecutionController(
        IExecutionGraphService executionGraphService,
        IJobsTableService jobsTableService)
    {
        _executionGraphService = executionGraphService;
        _jobsTableService = jobsTableService;
    }

    [HttpGet("graph/{jobId}")]
    public async Task<ActionResult<ServiceResponse<ExecutionGraphDto>>> GetExecutionGraph(Guid jobId)
    {
        return ResultHelper(await _executionGraphService.GetExecutionGraphAsync(jobId));
    }

    // Returns the fixed credits override configured for an agent (flow version).
    // Used by the LLM pipeline to skip token-based credit deduction when the agent
    // has a fixed credits override set by the Super Admin (Tenants section).
    [HttpGet("agent/{flowVersionId}/fixed-credits")]
    public async Task<ActionResult<ServiceResponse<double?>>> GetAgentFixedCredits(Guid flowVersionId)
    {
        return ResultHelper(await _jobsTableService.GetAgentFixedCreditsAsync(flowVersionId));
    }

    // Starts a job (Created -> Running). This is an executor-only endpoint that is
    // reachable with a machine JWT (dual auth: API key or JWT) so the runner app
    // can mark a job as running without requiring the OM role on the user account.
    [HttpPost("job/{jobId}/start")]
    [AllowAnonymous, ApiKeyAuthorize("machineAuth", allowJwtAuth: true)]
    public async Task<ActionResult<ServiceResponse<JobRecordDto>>> StartJob(Guid jobId)
    {
        var response = await _jobsTableService.StartJobAsync(new JobStartDto { Id = jobId });
        return ResultHelper(response);
    }

    // Closes a job in a terminal status. This is an executor-only endpoint reachable
    // with a machine JWT (dual auth: API key or JWT).
    [HttpPost("job/{jobId}/close")]
    [AllowAnonymous, ApiKeyAuthorize("machineAuth", allowJwtAuth: true)]
    public async Task<ActionResult<ServiceResponse<JobRecordDto>>> CloseJob(Guid jobId, [FromBody] JobCloseDto jobCloseDto)
    {
        jobCloseDto.Id = jobId;
        var response = await _jobsTableService.CloseJobAsync(jobCloseDto);
        return ResultHelper(response);
    }

    // Pull-based job dispatch for runner apps. Returns the next Created job attached to the
    // requested machine's FlowVersions, already assigned to the machine. Returns an empty
    // successful response (204 from ResultHelper) when nothing is pending. Machine JWT only.
    [HttpGet("machine/{machineId}/next-pending-job")]
    [AllowAnonymous, ApiKeyAuthorize("machineAuth", allowJwtAuth: true)]
    public async Task<ActionResult<ServiceResponse<JobRecordDto?>>> GetNextPendingJob(Guid machineId)
    {
        var response = await _jobsTableService.GetAndAssignNextPendingJobForMachineAsync(machineId);
        return ResultHelper(response);
    }

    /// <summary>
    /// Creates a job for another flow on behalf of a runner machine identity. Machine JWT only, since the tenant is resolved from its claims.
    /// </summary>
    [HttpPost("job")]
    [AllowAnonymous, ApiKeyAuthorize("machineAuth", allowJwtAuth: true)]
    public async Task<ActionResult<ServiceResponse<JobRecordDto>>> CreateFlowJob([FromBody] JobInsertDto jobInsertDto)
    {
        if (!TryGetMachineTenantId(out var tenantId))
            return PlainTextError(403, "Machine credentials are required.");

        return ResultHelper(await _jobsTableService.CreateFlowJobAsync(jobInsertDto, tenantId));
    }

    /// <summary>
    /// Retrieves a job's status and output for a waiting Create Job step, scoped to the requesting machine's tenant. Machine JWT only.
    /// </summary>
    [HttpGet("job/{jobId}")]
    [AllowAnonymous, ApiKeyAuthorize("machineAuth", allowJwtAuth: true)]
    public async Task<ActionResult<ServiceResponse<FlowJobStatusDto>>> GetFlowJobStatus(Guid jobId)
    {
        if (!TryGetMachineTenantId(out var tenantId))
            return PlainTextError(403, "Machine credentials are required.");

        return ResultHelper(await _jobsTableService.GetFlowJobStatusAsync(jobId, tenantId));
    }

    private bool TryGetMachineTenantId(out Guid tenantId)
    {
        tenantId = Guid.Empty;

        return MachineIdentityClaims.TryGetMachineId(User, out _)
            && MachineIdentityClaims.TryGetTenantId(User, out tenantId);
    }
}
