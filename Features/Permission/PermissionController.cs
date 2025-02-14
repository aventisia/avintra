namespace AccountsAPIs.Controllers;

[Route("permission")]
[ApiController]
[Authorize]
public class PermissionController(IPermissionService permissionService) : BaseApiController
{
    private readonly IPermissionService _permissionService = permissionService;

    // Gets a list of permissions
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<PermissionDto>>>> GetPermissionList()
    {
        return ResultHelper(await _permissionService.GetPermissionListAsync());
    }

    // Creates a new permission
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<PermissionDto>>> InsertPermission([FromBody] PermissionDto permissionDto)
    {
        return ResultHelper(await _permissionService.InsertPermissionAsync(permissionDto));
    }

    // Updates a permission
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<PermissionDto>>> UpdatePermission([FromBody] PermissionDto permissionDto)
    {
        return ResultHelper(await _permissionService.UpdatePermissionAsync(permissionDto));
    }

    // Deletes permission permanently
    [HttpDelete("delete/{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeletePermission(Guid id)
    {
        return ResultHelper(await _permissionService.DeletePermissionAsync(id));
    }
}