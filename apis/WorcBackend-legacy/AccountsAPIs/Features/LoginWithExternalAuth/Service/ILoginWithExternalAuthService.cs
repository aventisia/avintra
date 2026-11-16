namespace AccountsAPIs.Services;

public interface ILoginWithExternalAuthService
{
    /// <summary>
    /// Generates a login URL carrying the email hint and the OAuth state binding for a specific tenant.
    /// </summary>
    /// <param name="type">The external authentication provider.</param>
    /// <param name="email">The email used as the provider login hint.</param>
    /// <param name="tenantId">The tenant the authorization attempt belongs to.</param>
    /// <returns>The generated login URL or an error message.</returns>
    ServiceResponse<string> GenerateLoginUrlAsync(ExternalAuthProviderEnum type, string? email, Guid tenantId);

    /// <summary>
    /// Generates an administrator consent URL that binds the granted tenant id to the supplied tenant.
    /// </summary>
    /// <param name="email">The email used as the provider login hint.</param>
    /// <param name="tenantId">The tenant the consent grant belongs to.</param>
    /// <returns>The generated consent URL or an error message.</returns>
    ServiceResponse<string> GenerateAdminConsentUrlAsync(string? email, Guid tenantId);

    /// <summary>
    /// Consumes the single-use OAuth state created while generating an authorization URL.
    /// </summary>
    /// <param name="state">The opaque state returned by the provider.</param>
    /// <returns>The bound state, or null when the state is unknown, expired or already used.</returns>
    SsoAuthStateDto? ConsumeAuthState(string? state);

    /// <summary>
    /// Processes the Azure Entra login and handles the provided authorization code.
    /// </summary>
    /// <param name="code">The authorization code received from Azure Entra.</param>
    /// <param name="state">The OAuth state returned by Azure Entra.</param>
    /// <returns>A service response containing the authenticated user account information.</returns>
    Task<ServiceResponse<AccountUser>> EntraTokenAsync(string code, string? state);

    /// <summary>
    /// Generates a Google or GitHub authorization URL and binds the attempt to the calling browser.
    /// </summary>
    /// <param name="provider">The social provider to sign in with.</param>
    /// <param name="redirectUrl">The same-origin path to return to after sign-in.</param>
    /// <param name="hasPlanIntent">Whether the person arrived with a paid plan chosen.</param>
    /// <returns>The authorization URL or an error message.</returns>
    ServiceResponse<string> GenerateSocialLoginUrl(ExternalAuthProviderEnum provider, string? redirectUrl, bool hasPlanIntent);

    /// <summary>
    /// Resolves the social provider identity of an authorization code into the next sign-in step.
    /// </summary>
    /// <param name="code">The authorization code received from the provider.</param>
    /// <param name="state">The opaque state returned by the provider.</param>
    /// <returns>A service response with the resolved outcome.</returns>
    Task<ServiceResponse<SocialSignInResultDto>> SocialCallbackAsync(string code, string? state);

    /// <summary>
    /// Confirms the one-time code that links a social provider account to an existing account.
    /// </summary>
    /// <param name="socialLinkVerifyDto">The outstanding code and the code the person entered.</param>
    /// <returns>A service response with the resolved outcome.</returns>
    Task<ServiceResponse<SocialSignInResultDto>> VerifySocialLinkAsync(SocialLinkVerifyDto socialLinkVerifyDto);

    /// <summary>
    /// Prepares the resend of the outstanding two-step or account-link code of a social attempt.
    /// </summary>
    /// <param name="verificationCodeId">The outstanding code issued with the callback.</param>
    /// <param name="email">The account email the code was sent to.</param>
    /// <param name="provider">The provider name the attempt belongs to.</param>
    /// <returns>A service response naming the code the caller must create next.</returns>
    Task<ServiceResponse<SocialSignInResultDto>> PrepareSocialChallengeResendAsync(Guid verificationCodeId, string email, string provider);

    /// <summary>
    /// Holds the provider identity while the one-time link confirmation code is outstanding.
    /// </summary>
    /// <param name="verificationCodeId">The issued link code the identity belongs to.</param>
    /// <param name="socialLinkChallengeDto">The provider identity to hold.</param>
    Task StoreSocialLinkChallengeAsync(Guid verificationCodeId, SocialLinkChallengeDto socialLinkChallengeDto);
}
