namespace AccountsAPIs.Controllers;

[Route("auth")]
[ApiController]
public class SingleSignOnController : BaseApiController
{
    private readonly ISingleSignOnService _singleSignOnService;

    public SingleSignOnController(ISingleSignOnService singleSignOnService)
    {
        _singleSignOnService = singleSignOnService;
    }

    // Authenticates tenant's user via validating SSO's access_token 
    [HttpPost("tenant-sso")]
    public  ActionResult<UserSessionDto> SignInWithSSO([FromBody] SSOLoginDto ssoLoginDto)
    {
        return Ok();
    }

    // Authenticates individual user via validating Google's access_token 
    [HttpPost("siw-google")]
    public  ActionResult<UserSessionDto> SignInWithGoogle([FromBody] SIWGoogleDto siwGoogleDto)
    {
        return Ok();
    }

    // Authenticates individual user via validating Microsoft's access_token 
    [HttpPost("siw-ms")]
    public  ActionResult<UserSessionDto> SignInWithMicrosoft([FromBody] SIWMicrosoftDto siwMicrosoftDto)
    {
        return Ok();
    }

    // Authenticates individual user via validating Github's access_token 
    [HttpPost("siw-github")]
    public ActionResult<UserSessionDto> SignInWithGithub([FromBody] SIWGithubDto siwGithubDto)
    {
        return Ok();
    }
}