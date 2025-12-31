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

    // Creates a new account for an individual user (IU) or Aventisia employee.
    [HttpPost("create-user-account")]
    public async Task<ActionResult<ServiceResponse<UserSessionDto>>> CreateNewUser([FromBody] CreateAccountDto createAccountDto)
    {
        // Create new user
        var newUser = await _userRegistrationService.CreateAccountAsync(createAccountDto);

        // New user creation failed
        if (newUser.StatusCode == 400 || newUser.Data == null)
            return BadRequest(newUser.Message);

        // Create UserSessionDto
        var userSessionDto = await _authService.CreateUserSessionAsync(newUser.Data);

        // Returns userSessionDto
        return ResultHelper(userSessionDto);
    }

    // Sets or updates the user's tenant organization.
    [HttpPut("tenant-info")]
    public async Task<ActionResult<ServiceResponse<UserSessionDto>>> UpdateTenantOrganization([FromBody] TenantOrganizationDto tenantOrganizationDto)
    {
        // Update ogranization detail
        var updatedUser = await _userRegistrationService.UpdateTenantOrganizationAsync(tenantOrganizationDto);

        // New user creation failed
        if (updatedUser.StatusCode == 400 || updatedUser.Data == null)
            return BadRequest(updatedUser.Message);

        // Create UserSessionDto
        var userSessionDto = await _authService.CreateUserSessionAsync(updatedUser.Data);

        // Returns userSessionDto
        return ResultHelper(userSessionDto);
    }
}
