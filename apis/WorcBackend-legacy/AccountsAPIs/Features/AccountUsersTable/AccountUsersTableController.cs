namespace AccountsAPIs.Controllers;

[Route("user")]
[ApiController]
[Authorize(Roles = "TA")]
public class AccountUsersTableController : BaseApiController
{
    private readonly IAccountUsersTableService _accountUsersTableService;

    public AccountUsersTableController(IAccountUsersTableService accountUsersTableService)
    {
        _accountUsersTableService = accountUsersTableService;
    }

    // Retrieves a list of account users.
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AccountUsersTableDto>>>> GetAccountUsers()
    {
        return ResultHelper(await _accountUsersTableService.GetAccountUsersAsync());
    }

    // Inserts a new account user.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<AccountUsersTableDto>>> InsertAccountUser([FromBody] AccountUsersTableDto accountUsersTableDto)
    {
        return ResultHelper(await _accountUsersTableService.InsertAccountUserAsync(accountUsersTableDto));
    }

    // Updates an account user.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<AccountUsersTableDto>>> UpdateAccountUser([FromBody] AccountUsersTableDto accountUsersTableDto)
    {
        return ResultHelper(await _accountUsersTableService.UpdateAccountUserAsync(accountUsersTableDto));
    }

    // Deletes an account user.
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteAccountUser(Guid id)
    {
        return ResultHelper(await _accountUsersTableService.DeleteAccountUserAsync(id));
    }

    // Retrieves the account roles basis current user top role.
    [HttpGet("roles-to-select")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOption>>>> GetAccountRoles()
    {
        return ResultHelper(await _accountUsersTableService.GetAccountRolesAsync());
    }

    // Retrieves the spaces for the current tenant for user space assignment.
    [HttpGet("spaces-to-select")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOption>>>> GetAccountSpaces()
    {
        return ResultHelper(await _accountUsersTableService.GetAccountSpacesAsync());
    }

    // Disable multiple users by their IDs.
    [HttpPost("disable-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DisableUsers([FromBody] List<Guid> ids)
    {
        return ResultHelper(await _accountUsersTableService.DisableUsersAsync(ids));
    }
}