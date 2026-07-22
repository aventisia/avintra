namespace WorkspaceAPIs.Controllers;

[Route("search")]
[ApiController]
[Authorize]
public class SearchByQueryController : BaseApiController
{
    private readonly ISearchByQueryService _searchByQueryService;

    public SearchByQueryController(ISearchByQueryService searchByQueryService)
    {
        _searchByQueryService = searchByQueryService;
    }

    // Searches flow version
    [HttpGet("flow-version")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FlowVersionSearchResultDto>>>> SearchFlowVersion(
        [FromQuery] string query,
        [FromQuery] FlowTypesEnum type = FlowTypesEnum.Agent,
        [FromQuery] bool includePublishedOnly = true,
        [FromQuery] Guid? machineId = null)
    {
        return ResultHelper(await _searchByQueryService.SearchFlowVersionAsync(query, type, includePublishedOnly, machineId));
    }

    // Searches machine by unique name with optional flow version filter
    [HttpGet("machine")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<MachineSearchResultDto>>>> SearchMachine(
        [FromQuery] string? query,
        [FromQuery] Guid? flowVersionId)
    {
        return ResultHelper(await _searchByQueryService.SearchMachineAsync(query, flowVersionId));
    }
}
