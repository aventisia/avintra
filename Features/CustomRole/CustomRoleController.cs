namespace AccountsAPIs.Controllers;

[Route("role")]
[ApiController]
[Authorize]
public class CustomRoleController : BaseApiController
{
    private readonly ICustomRoleService _customRoleService;

    public CustomRoleController(ICustomRoleService customRoleService)
    {
        _customRoleService = customRoleService;
    }

    // Gets a list of roles
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<CustomRoleDto>>>> GetCustomRoleList()
    {
        return ResultHelper(await _customRoleService.GetCustomRoleListAsync());
    }

    // Creates a new role
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<CustomRoleDto>>> InsertCustomRole([FromBody] CustomRoleDto customRoleDto)
    {
        return ResultHelper(await _customRoleService.InsertCustomRoleAsync(customRoleDto));
    }

    // Updates a role
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<CustomRoleDto>>> UpdateCustomRole([FromBody] CustomRoleDto customRoleDto)
    {
        return ResultHelper(await _customRoleService.UpdateCustomRoleAsync(customRoleDto));
    }

    // Deletes role permanently
    [HttpDelete("delete/{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteCustomeRole(Guid id)
    {
        return ResultHelper(await _customRoleService.DeleteCustomeRoleAsync(id));
    }
}