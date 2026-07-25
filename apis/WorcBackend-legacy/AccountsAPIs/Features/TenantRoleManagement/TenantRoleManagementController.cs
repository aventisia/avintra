namespace AccountsAPIs.Controllers;

[Route("tenant-role")]
[ApiController]
[Authorize]
public class TenantRoleManagementController : BaseApiController
{
    private readonly ITenantRoleManagementService _tenantRoleManagementServiceService;

    public TenantRoleManagementController(ITenantRoleManagementService tenantRoleManagementServiceService)
    {
        _tenantRoleManagementServiceService = tenantRoleManagementServiceService;
    }

    // Gets a list of roles
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TenantRoleDto>>>> GetRoleList()
    {
        return ResultHelper(await _tenantRoleManagementServiceService.GetRoleListAsync());
    }

    // Checks Role with the specified Name is available.
    [HttpPost("is-available")]    
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsRoleAvailableAsync(CheckAvailabilityDto checkAvailability)
    {
        return ResultHelper(await _tenantRoleManagementServiceService.IsRoleAvailableAsync(checkAvailability));
    }

    // Creates a new role
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<TenantRoleDto>>> InsertRole([FromBody] TenantRoleDto tenantRoleDto)
    {
        return ResultHelper(await _tenantRoleManagementServiceService.InsertRoleAsync(tenantRoleDto));
    }

    // Retrieve a role
    [HttpGet("{tenantRoleId}")]
    public async Task<ActionResult<ServiceResponse<TenantRoleDto>>> GetRoleByIdAsync(Guid tenantRoleId)
    {
        return ResultHelper(await _tenantRoleManagementServiceService.GetRoleByIdAsync(tenantRoleId));
    }

    // Updates a role
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<TenantRoleDto>>> UpdateARole([FromBody] TenantRoleDto tenantRoleDto)
    {
        return ResultHelper(await _tenantRoleManagementServiceService.UpdateRoleAsync(tenantRoleDto));
    }

    // Deletes role permanently
    [HttpDelete("{tenantRoleId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteRoleAsync(Guid tenantRoleId)
    {
        return ResultHelper(await _tenantRoleManagementServiceService.DeleteRoleAsync(tenantRoleId));
    }

    // Deletes multiple Roles based on the provided IDs
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleRoles(IEnumerable<Guid> tenantRoleIds)
    {
        return ResultHelper(await _tenantRoleManagementServiceService.DeleteMultipleRolesAsync(tenantRoleIds));
    }

    // Retrieves the roles options.
    [HttpGet("option-to-select")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOption>>>> GetRoleOptionList()
    {
        return ResultHelper(await _tenantRoleManagementServiceService.GetRoleOptionListAsync());
    }

}