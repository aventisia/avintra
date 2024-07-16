namespace WorkspaceAPIs.Controllers;

[Route("user")]
[ApiController]
[Authorize]
public class WorkspaceUserController : BaseApiController
{
    private readonly IWorkspaceUserService _userService;

    public WorkspaceUserController(IWorkspaceUserService userService)
    {
        _userService = userService;
    }

    // Retrieves a workspace user by its ID.
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<WorkspaceUserDto>>> GetWorkspaceUser(Guid id)
    {
        return ResultHelper(await _userService.GetWorkspaceUserAsync(id));
    }

    // Get records is not required for WorksapceUser as other than user itself, 
    // no one required to see all users from InternalUser entity. Tenant manager 
    // will be able to see all users from AccountUser entity.

    // Insert new workspace record if does not exist already
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<WorkspaceUserDto>>> InsertWorkspaceUser([FromBody] WorkspaceUserDto workspaceUserDto)
    {
        return ResultHelper(await _userService.InsertWorkspaceUserAsync(workspaceUserDto));
    }

    // Updates an existing workspace user.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<WorkspaceUserDto>>> UpdateWorkspaceUser([FromBody] WorkspaceUserDto workspaceUserDto)
    {
        return ResultHelper(await _userService.UpdateWorkspaceUserAsync(workspaceUserDto));
    }

    // Deletes a workspace user by its ID.
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteWorkspaceUser(Guid id)
    {
        return ResultHelper(await _userService.DeleteWorkspaceUserAsync(id));
    }
}