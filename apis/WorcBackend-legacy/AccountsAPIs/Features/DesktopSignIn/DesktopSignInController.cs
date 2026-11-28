namespace AccountsAPIs.Controllers;

[Route("auth/desktop")]
[ApiController]
public class DesktopSignInController : BaseApiController
{
    private readonly IDesktopSignInService _desktopSignInService;

    public DesktopSignInController(IDesktopSignInService desktopSignInService)
    {
        _desktopSignInService = desktopSignInService;
    }

    /// <summary>
    /// Mints a single-use desktop sign-in code bound to the caller, the state and the PKCE challenge.
    /// </summary>
    [Authorize]
    [HttpPost("mint")]
    public async Task<ActionResult<ServiceResponse<DesktopSignInMintResultDto>>> MintDesktopSignInCode(
        [FromBody] DesktopSignInMintDto desktopSignInMintDto)
    {
        if (!Guid.TryParse(User.FindFirst("uid")?.Value, out var userId))
            return PlainTextError(401, "Unauthorized");

        if (!Guid.TryParse(User.FindFirst("sid")?.Value, out var sessionId))
            return PlainTextError(401, "Invalid session");

        return ResultHelper(await _desktopSignInService.MintDesktopSignInCodeAsync(userId, sessionId, desktopSignInMintDto));
    }

    /// <summary>
    /// Exchanges a single-use desktop sign-in code for a new user session.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("exchange")]
    public async Task<ActionResult<ServiceResponse<UserSessionDto>>> ExchangeDesktopSignInCode(
        [FromBody] DesktopSignInExchangeDto desktopSignInExchangeDto)
    {
        return ResultHelper(await _desktopSignInService.ExchangeDesktopSignInCodeAsync(desktopSignInExchangeDto));
    }
}
