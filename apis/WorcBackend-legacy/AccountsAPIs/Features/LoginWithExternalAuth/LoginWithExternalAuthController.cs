namespace AccountsAPIs.Controllers;

[Route("auth")]
[ApiController]
public class LoginWithExternalAuthController : BaseApiController
{
    private readonly ILoginWithExternalAuthService _loginWithExternalAuthService;
    private readonly IAuthService _authService;

    public LoginWithExternalAuthController(
        ILoginWithExternalAuthService loginWithExternalAuthService, IAuthService authService)
    {
        _loginWithExternalAuthService = loginWithExternalAuthService;
        _authService = authService;
    }

    // Generates an authentication URL for a specified external provider (Azure, Google, Facebook, Twitter).
    [HttpGet("entra/login-url")]
    public ActionResult<ServiceResponse<string>> GenerateLoginUrl(ExternalAuthProviderEnum type, string? email)
    {
        return ResultHelper(_loginWithExternalAuthService.GenerateLoginUrlAsync(type, email, Guid.Empty));
    }

    // Validates an external token and creates the user if not already existing.
    [HttpGet("entra/token")]
    public async Task<ActionResult<ServiceResponse<UserSessionDto>>> EntraToken(string code, string? state)
    {
        // Validate the token and create the user if it doesn't exist
        var authenticateUserResult = await _loginWithExternalAuthService.EntraTokenAsync(code, state);

        // Return the mapped client or server error when authentication did not succeed
        if (authenticateUserResult.StatusCode != 200 || authenticateUserResult.Data == null)
        {
            var errorStatusCode = authenticateUserResult.StatusCode is >= 400 and < 600
                ? authenticateUserResult.StatusCode
                : 401;

            return PlainTextError(errorStatusCode, authenticateUserResult.Message);
        }

        // Delete any expired sessions for the authenticated user
        var terminateUserExpiredSessionsResult = await _authService.TerminateUserSessionsAsync(
            authenticateUserResult.Data.Id,
            authenticateUserResult.Data.UserName,
            TerminateSessionReasonsEnum.SessionHasExpired);

        // Delete failed - return plain text
        if (terminateUserExpiredSessionsResult.StatusCode != 200)
            return ResultHelper(terminateUserExpiredSessionsResult);

        // Create a new user session for the authenticated user
        var createUserSessionResult = await _authService.CreateUserSessionAsync(authenticateUserResult.Data);

        // Return the user session information to the client
        return ResultHelper(createUserSessionResult);
    }

    // Generates a Google or GitHub authorization URL and binds the attempt to the calling browser.
    [HttpGet("social/login-url")]
    public ActionResult<ServiceResponse<string>> GenerateSocialLoginUrl(
        ExternalAuthProviderEnum provider, string? redirect, bool hasPlanIntent)
    {
        return ResultHelper(_loginWithExternalAuthService.GenerateSocialLoginUrl(provider, redirect, hasPlanIntent));
    }

    // Completes a Google or GitHub sign-in and reports the next step to the client.
    [HttpGet("social/callback")]
    public async Task<ActionResult<ServiceResponse<SocialCallbackDto>>> SocialCallback(string code, string? state)
    {
        var socialSignInResult = await _loginWithExternalAuthService.SocialCallbackAsync(code, state);

        return await CompleteSocialResultAsync(socialSignInResult);
    }

    // Confirms the one-time code that links a Google or GitHub account to an existing account.
    [HttpPost("social/link/verify")]
    public async Task<ActionResult<ServiceResponse<SocialCallbackDto>>> VerifySocialLink(
        [FromBody] SocialLinkVerifyDto socialLinkVerifyDto)
    {
        var socialSignInResult = await _loginWithExternalAuthService.VerifySocialLinkAsync(socialLinkVerifyDto);

        return await CompleteSocialResultAsync(socialSignInResult);
    }

    // Resends the outstanding two-step or account-link code of a social sign-in attempt.
    [HttpPost("social/challenge/resend")]
    public async Task<ActionResult<ServiceResponse<SocialCallbackDto>>> ResendSocialChallenge(
        [FromBody] SocialChallengeResendDto socialChallengeResendDto)
    {
        var prepareResult = await _loginWithExternalAuthService.PrepareSocialChallengeResendAsync(
            socialChallengeResendDto.VerificationCodeId,
            socialChallengeResendDto.Email,
            socialChallengeResendDto.Provider);

        if (prepareResult.StatusCode != 200 || prepareResult.Data == null)
            return PlainTextError(prepareResult.StatusCode, prepareResult.Message);

        return prepareResult.Data.Outcome == SocialSignInOutcomeEnum.LinkCodeRequired
            ? await IssueSocialLinkCodeAsync(prepareResult.Data)
            : await IssueSocialTwoFACodeAsync(prepareResult.Data.Email, prepareResult.Data.Provider);
    }

    private async Task<ActionResult<ServiceResponse<SocialCallbackDto>>> CompleteSocialResultAsync(
        ServiceResponse<SocialSignInResultDto> socialSignInResult)
    {
        // The provider identity could not be resolved: nothing is created and the client shows the message
        if (socialSignInResult.StatusCode != 200 || socialSignInResult.Data == null)
            return PlainTextError(socialSignInResult.StatusCode, socialSignInResult.Message);

        var socialResult = socialSignInResult.Data;

        switch (socialResult.Outcome)
        {
            case SocialSignInOutcomeEnum.LinkCodeRequired:
                return await IssueSocialLinkCodeAsync(socialResult);

            case SocialSignInOutcomeEnum.TwoFARequired:
                return await IssueSocialTwoFACodeAsync(socialResult.Email, socialResult.Provider, socialResult.ReturnUrl,
                    socialResult.HasPlanIntent);

            case SocialSignInOutcomeEnum.SsoRequired:
                return ResultHelper(ServiceResponse<SocialCallbackDto>.Create(
                    "Single sign-on is required.",
                    200,
                    new SocialCallbackDto
                    {
                        Status = SocialSignInOutcomeEnum.SsoRequired.ToString(),
                        Provider = socialResult.Provider,
                        Email = socialResult.Email,
                        SsoLoginUrl = socialResult.SsoLoginUrl,
                        RedirectUrl = socialResult.ReturnUrl,
                        HasPlanIntent = socialResult.HasPlanIntent
                    }));

            default:
                return await IssueSocialSessionAsync(socialResult);
        }
    }

    private async Task<ActionResult<ServiceResponse<SocialCallbackDto>>> IssueSocialSessionAsync(
        SocialSignInResultDto socialResult)
    {
        if (socialResult.User == null)
            return PlainTextError(401, "Failed to sign you in. Please try again.");

        // Delete any expired sessions for the authenticated user
        var terminateUserExpiredSessionsResult = await _authService.TerminateUserSessionsAsync(
            socialResult.User.Id,
            socialResult.User.UserName!,
            TerminateSessionReasonsEnum.SessionHasExpired);

        if (terminateUserExpiredSessionsResult.StatusCode != 200)
            return ResultHelper(terminateUserExpiredSessionsResult);

        // Create the session last so no cookie is issued when the session limit or provisioning fails
        var createUserSessionResult = await _authService.CreateUserSessionAsync(socialResult.User);

        if (createUserSessionResult.StatusCode != 200)
            return ResultHelper(createUserSessionResult);

        return ResultHelper(ServiceResponse<SocialCallbackDto>.Create(
            "Signed in.",
            200,
            new SocialCallbackDto
            {
                Status = SocialSignInOutcomeEnum.SignedIn.ToString(),
                Provider = socialResult.Provider,
                Email = socialResult.Email,
                UserSession = createUserSessionResult.Data,
                RedirectUrl = socialResult.ReturnUrl,
                HasPlanIntent = socialResult.HasPlanIntent
            }));
    }

    private async Task<ActionResult<ServiceResponse<SocialCallbackDto>>> IssueSocialTwoFACodeAsync(
        string email, string provider, string? redirectUrl = null, bool hasPlanIntent = false)
    {
        var createVerificationCodeResult = await _authService.CreateVerificationCodeAsync(new CreateVerificationCodeDto
        {
            Email = email,
            RequestType = VerificationCodeRequestTypesEnum.TwoFA
        });

        if (createVerificationCodeResult.Data == null)
            return PlainTextError(500, createVerificationCodeResult.Message);

        return ResultHelper(ServiceResponse<SocialCallbackDto>.Create(
            "TwoFA is enabled",
            200,
            new SocialCallbackDto
            {
                Status = SocialSignInOutcomeEnum.TwoFARequired.ToString(),
                Provider = provider,
                Email = email,
                VerificationCodeId = createVerificationCodeResult.Data.VerificationCodeId,
                RedirectUrl = redirectUrl,
                HasPlanIntent = hasPlanIntent
            }));
    }

    private async Task<ActionResult<ServiceResponse<SocialCallbackDto>>> IssueSocialLinkCodeAsync(
        SocialSignInResultDto socialResult)
    {
        var createVerificationCodeResult = await _authService.CreateVerificationCodeAsync(new CreateVerificationCodeDto
        {
            Email = socialResult.Email,
            RequestType = VerificationCodeRequestTypesEnum.LinkSocialLogin
        });

        if (createVerificationCodeResult.Data == null)
            return PlainTextError(500, createVerificationCodeResult.Message);

        await _loginWithExternalAuthService.StoreSocialLinkChallengeAsync(
            createVerificationCodeResult.Data.VerificationCodeId,
            new SocialLinkChallengeDto
            {
                Provider = socialResult.Provider,
                ProviderKey = socialResult.ProviderKey!,
                Email = socialResult.Email,
                ReturnUrl = socialResult.ReturnUrl,
                HasPlanIntent = socialResult.HasPlanIntent,
                FailedAttempts = socialResult.FailedAttempts
            });

        return ResultHelper(ServiceResponse<SocialCallbackDto>.Create(
            "Confirm the code sent to your email.",
            200,
            new SocialCallbackDto
            {
                Status = SocialSignInOutcomeEnum.LinkCodeRequired.ToString(),
                Provider = socialResult.Provider,
                Email = socialResult.Email,
                VerificationCodeId = createVerificationCodeResult.Data.VerificationCodeId,
                RedirectUrl = socialResult.ReturnUrl,
                HasPlanIntent = socialResult.HasPlanIntent
            }));
    }
}
