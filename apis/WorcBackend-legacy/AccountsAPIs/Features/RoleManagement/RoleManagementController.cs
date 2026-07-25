namespace AccountsAPIs.Controllers;

[Route("manage-role")]
[ApiController]
[Authorize]
public class RoleManagementController : BaseApiController
{
    private readonly IRoleManagementService _roleManagementService;

    public RoleManagementController(IRoleManagementService roleManagementService)
    {
        _roleManagementService = roleManagementService;
    }

    // Gets a list of roles
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<RoleManagementDto>>>> GetRoleList(Guid? tenantId)
    {
        return ResultHelper(await _roleManagementService.GetRoleListAsync(tenantId));
    }

    // Checks Role with the specified Name is available.
    [HttpPost("is-available/{tenantId}")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsRoleAvailableAsync(Guid tenantId, CheckAvailabilityDto checkAvailability)
    {
        return ResultHelper(await _roleManagementService.IsRoleAvailableAsync(tenantId, checkAvailability));
    }

    // Creates a new role
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<RoleManagementDto>>> InsertRole([FromBody] RoleManagementDto roleManagementDto)
    {
        return ResultHelper(await _roleManagementService.InsertRoleAsync(roleManagementDto));
    }

    // Retrieve a role
    [HttpGet("{roleId}")]
    public async Task<ActionResult<ServiceResponse<RoleManagementDto>>> GetRoleByIdAsync(Guid roleId)
    {
        return ResultHelper(await _roleManagementService.GetRoleByIdAsync(roleId));
    }

    // Updates a role
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<RoleManagementDto>>> UpdateARole([FromBody] RoleManagementDto roleManagementDto)
    {
        return ResultHelper(await _roleManagementService.UpdateRoleAsync(roleManagementDto));
    }

    // Deletes role permanently
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteRoleAsync(Guid id)
    {
        return ResultHelper(await _roleManagementService.DeleteRoleAsync(id));
    }

    // Deletes multiple Roles based on the provided IDs
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleRoles(IEnumerable<Guid> roleIds)
    {
        return ResultHelper(await _roleManagementService.DeleteMultipleRolesAsync(roleIds));
    }

    // Retrieves the roles options for.
    [HttpGet("option-to-select/{tenantId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOption>>>> GetRoleOptionList(Guid tenantId)
    {
        return ResultHelper(await _roleManagementService.GetRoleOptionListAsync(tenantId));
    }
}
