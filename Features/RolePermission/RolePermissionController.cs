namespace AccountsAPIs.Controllers;

[Route("role-permission")]
[ApiController]
[Authorize]
public class RolePermissionController : BaseApiController
{
    private readonly IRolePermissionService _rolePermissionService;

    public RolePermissionController(IRolePermissionService rolePermissionService)
    {
        _rolePermissionService = rolePermissionService;
    }

    // Gets a list of role permissions
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<RolePermissionDto>>>> GetRolePermissionList()
    {
        return ResultHelper(await _rolePermissionService.GetRolePermissionListAsync());
    }

    // Creates a new role permission
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<RolePermissionDto>>> InsertRolePermission([FromBody] RolePermissionDto rolePermissionDto)
    {
        return ResultHelper(await _rolePermissionService.InsertRolePermissionAsync(rolePermissionDto));
    }

    // Updates a role permission
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<RolePermissionDto>>> UpdateRolePermission([FromBody] RolePermissionDto rolePermissionDto)
    {
        return ResultHelper(await _rolePermissionService.UpdateRolePermissionAsync(rolePermissionDto));
    }

    // Deletes a role permission permanently
    [HttpDelete("delete/{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteRolePermission(Guid id)
    {
        return ResultHelper(await _rolePermissionService.DeleteRolePermissionAsync(id));
    }
}