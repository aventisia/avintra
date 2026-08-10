namespace WorkspaceAPIs.Controllers;

[Route("space-summary")]
[ApiController]
[Authorize(Roles = "TA")]
public class SpaceSummaryController : BaseApiController
{
    private readonly ISpaceSummaryService _spaceSummaryService;

    public SpaceSummaryController(ISpaceSummaryService spaceSummaryService)
    {
        _spaceSummaryService = spaceSummaryService;
    }

    // Retrieves aggregated usage metrics (published agents, execution time, machines) grouped by space
    // for the current tenant. Used by the Tenant Admin Spaces table.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SpaceSummaryDto>>>> GetSpaceSummaries()
    {
        return ResultHelper(await _spaceSummaryService.GetSpaceSummariesAsync());
    }
}
