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
        [FromQuery] bool includePublishedOnly = true)
    {
        return ResultHelper(await _searchByQueryService.SearchFlowVersionAsync(query, type, includePublishedOnly));
    }
}
