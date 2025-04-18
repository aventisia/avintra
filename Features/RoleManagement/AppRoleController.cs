namespace AccountsAPIs.Controllers;

[Route("account-role")]
[ApiController]
[Authorize]
public class RoleController : BaseApiController
{
    private readonly IRoleService _roleService;

    public RoleController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    // Gets a list of roles
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<RoleDto>>>> GetARoleList()
    {
        return ResultHelper(await _roleService.GetRoleListAsync());
    }

    // Checks Role with the specified Name is available.
    [HttpPost("is-available")]    
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsRoleAvailableAsync(CheckAvailabilityDto checkAvailability)
    {
        return ResultHelper(await _roleService.IsRoleAvailableAsync(checkAvailability));
    }

    // Creates a new role
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<RoleDto>>> InsertRole([FromBody] RoleDto roleDto)
    {
        return ResultHelper(await _roleService.InsertRoleAsync(roleDto));
    }

    // Retrieve a role
    [HttpGet("{roleId}")]
    public async Task<ActionResult<ServiceResponse<RoleDto>>> GetRoleByIdAsync(Guid roleId)
    {
        return ResultHelper(await _roleService.GetRoleByIdAsync(roleId));
    }

    // Updates a role
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<RoleDto>>> UpdateARole([FromBody] RoleDto roleDto)
    {
        return ResultHelper(await _roleService.UpdateRoleAsync(roleDto));
    }

    // Deletes role permanently
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteRoleAsync(Guid id)
    {
        return ResultHelper(await _roleService.DeleteRoleAsync(id));
    }

    // Deletes multiple Roles based on the provided IDs
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleRoles(IEnumerable<Guid> roleIds)
    {
        return ResultHelper(await _roleService.DeleteMultipleRolesAsync(roleIds));
    }
}