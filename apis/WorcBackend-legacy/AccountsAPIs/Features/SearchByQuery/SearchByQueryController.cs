namespace AccountsAPIs.Controllers;

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

    /// <summary>
    /// Searches tenant users.
    /// </summary>
    [HttpGet("user")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SearchedUserDto>>>> SearchUser(
        [FromQuery] string? query,
        [FromQuery] bool includeCurrentUser = false,
        [FromQuery] bool onlyCurrentSpace = false)
    {
        return ResultHelper(await _searchByQueryService.SearchUserAsync(query, includeCurrentUser, onlyCurrentSpace));
    }
}
