namespace AccountsAPIs.Controllers;

[Route("role")]
[ApiController]
[Authorize]
public class AccountRoleController : BaseApiController
{
    private readonly IAccountRoleService _accountRoleService;

    public AccountRoleController(IAccountRoleService accountRoleService)
    {
        _accountRoleService = accountRoleService;
    }

    // Gets a list of roles
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AccountRoleDto>>>> GetAccountRoleList()
    {
        return ResultHelper(await _accountRoleService.GetAccountRoleListAsync());
    }

    // Creates a new role
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<AccountRoleDto>>> InsertAccountRole([FromBody] AccountRoleDto accountRoleDto)
    {
        return ResultHelper(await _accountRoleService.InsertAccountRoleAsync(accountRoleDto));
    }

    // Updates a role
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<AccountRoleDto>>> UpdateAccountRole([FromBody] AccountRoleDto accountRoleDto)
    {
        return ResultHelper(await _accountRoleService.UpdateAccountRoleAsync(accountRoleDto));
    }

    // Deletes role permanently
    [HttpDelete("delete/{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteAccountRole(Guid id)
    {
        return ResultHelper(await _accountRoleService.DeleteAccountRoleAsync(id));
    }
}