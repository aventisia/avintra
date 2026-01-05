namespace WorkspaceAPIs.Controllers;

[Route("project")]
[ApiController]
public class ProjectUsageController : BaseApiController
{
    private readonly IProjectUsageService _projectUsageService;

    public ProjectUsageController(IProjectUsageService projectUsageService)
    {
        _projectUsageService = projectUsageService;
    }

    // Retrieves a summary of project usage metrics for the previous day.
    [HttpGet("usage")]
    public async Task<ActionResult<ServiceResponse<ProjectUsageMetricDto>>> GetUsageSummary()
    {
        return ResultHelper(await _projectUsageService.GetUsageSummaryAsync());
    }
}
