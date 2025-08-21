namespace AccountsAPIs.Controllers;

[Route("auth")]
[ApiController]
public class UserRegistrationController : BaseApiController
{
    private readonly IUserRegistrationService _userRegistrationService;
    private readonly IAuthService _authService;

    public UserRegistrationController(
        IUserRegistrationService userRegistrationService,
        IAuthService authService)
    {
        _userRegistrationService = userRegistrationService;
        _authService = authService;
    }

    // Creates a new user or employee account.
    [HttpPost("register")]
    public async Task<ActionResult<ServiceResponse<UserSessionDto>>> RegisterUser([FromBody] CreateUserAccountDto createUserAccountDto)
    {
        return ResultHelper(await _userRegistrationService.RegisterUserAsync(createUserAccountDto));
    }

    // Sets or updates the user's tenant organization.
    [HttpPut("tenant-info")]
    public async Task<ActionResult<ServiceResponse<bool>>> UpdateTenantOrganization([FromBody] TenantOrganizationDto tenantOrganizationDto)
    {
        return ResultHelper(await _userRegistrationService.UpdateTenantOrganizationAsync(tenantOrganizationDto));
    }

    // Updates user's profile details like first name, last name, and password.
    [HttpPut("user-info")]
    public async Task<ActionResult<ServiceResponse<AccountUser>>> UpdateUserInformation([FromBody] UpdateUserInformationDto updateUserInformationDto)
    {
        // Attempt to update user information
        var newUser = await _userRegistrationService.UpdateUserInformationAsync(updateUserInformationDto);

        // Return error if update failed
        if (newUser.StatusCode == 400 || newUser.Data == null)
            return BadRequest(newUser.Message);

        // Generate session data for the updated user
        var userSessionDto = await _authService.CreateUserSessionAsync(newUser.Data);

        // Return session info
        return ResultHelper(userSessionDto);
    }
}
