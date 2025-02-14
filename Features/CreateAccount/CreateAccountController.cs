namespace AccountsAPIs.Controllers;

[Route("auth")]
[ApiController]
public class CreateAccountController(
    ICreateAccountService createAccountService,
    IAuthService authService) : BaseApiController
{
    private readonly ICreateAccountService _createAccountService = createAccountService;
    private readonly IAuthService _authService = authService;

    // Creates a new account for an individual user (IU) or Aventisia employee.
    [HttpPost("create-account")]
    public async Task<ActionResult<ServiceResponse<UserSessionDto>>> CreateNewUser([FromBody] CreateAccountDto createAccountDto)
    {
        // Create new user
        var newUser = await _createAccountService.CreateAccountAsync(createAccountDto);

        // New user creation failed
        if (newUser.StatusCode == 400 || newUser.Data == null)
            return BadRequest(newUser.Message);

        // Create UserSessionDto
        var userSessionDto = await _authService.CreateUserSessionAsync(newUser.Data);

        // Returns userSessionDto
        return ResultHelper(userSessionDto);
    }
}