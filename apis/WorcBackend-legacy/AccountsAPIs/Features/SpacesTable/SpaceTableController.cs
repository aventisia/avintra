namespace AccountsAPIs.Controllers;

[Route("space")]
[ApiController]
[Authorize]
public class SpaceTableController : BaseApiController
{
    private readonly ISpaceTableService _spaceTableService;

    public SpaceTableController(ISpaceTableService spaceTableService)
    {
        _spaceTableService = spaceTableService;
    }

    // Retrieves all spaces in the system.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SpaceTableDto>>>> GetSpaces()
    {
        return ResultHelper(await _spaceTableService.GetAllSpacesAsync());
    }

    // Gets a list of spaces for selection options
    [HttpGet("option-to-select")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOption>>>> GetSelectableSpaceOptions()
    {
        return ResultHelper(await _spaceTableService.GetSelectableSpaceOptionsAsync());
    }

    // Retrieves a specific space by its unique identifier.
    [HttpGet("{spaceId}")]
    public async Task<ActionResult<ServiceResponse<SpaceTableDto>>> GetSpaceByIdAsync(Guid spaceId)
    {
        return ResultHelper(await _spaceTableService.GetSpaceByIdAsync(spaceId));
    }

    // Creates a new space.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<SpaceTableDto>>> InsertSpace([FromBody] SpaceDto spaceDto)
    {
        return ResultHelper(await _spaceTableService.CreateSpaceAsync(spaceDto));
    }

    // Updates an existing space.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<SpaceTableDto>>> UpdateSpace([FromBody] SpaceDto spaceDto)
    {
        return ResultHelper(await _spaceTableService.UpdateSpaceAsync(spaceDto));
    }

    // Deletes a specific space by its unique identifier.
    [HttpDelete("{spaceId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteSpace(Guid spaceId)
    {
        return ResultHelper(await _spaceTableService.DeleteSpaceAsync(spaceId));
    }

    // Deletes multiple spaces by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteSpaces([FromBody] List<Guid> spaceIds)
    {
        return ResultHelper(await _spaceTableService.DeleteSpacesAsync(spaceIds));
    }

    // Retrieves all users associated with a specific space.
    [HttpGet("users/{spaceId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SpaceUserDto>>>> GetSpaceUsers(Guid spaceId)
    {
        return ResultHelper(await _spaceTableService.GetSpaceUsersAsync(spaceId));
    }

    // Adds the given users to a space (used by the share flow to sync space membership).
    [HttpPost("{spaceId}/users")]
    public async Task<ActionResult<ServiceResponse<bool>>> AddSpaceUsers(Guid spaceId, [FromBody] List<Guid> userIds)
    {
        return ResultHelper(await _spaceTableService.AddSpaceUsersAsync(spaceId, userIds));
    }

    // Removes the given users from a space (used by the share flow to sync space membership).
    [HttpDelete("{spaceId}/users")]
    public async Task<ActionResult<ServiceResponse<bool>>> RemoveSpaceUsers(Guid spaceId, [FromBody] List<Guid> userIds)
    {
        return ResultHelper(await _spaceTableService.RemoveSpaceUsersAsync(spaceId, userIds));
    }
}