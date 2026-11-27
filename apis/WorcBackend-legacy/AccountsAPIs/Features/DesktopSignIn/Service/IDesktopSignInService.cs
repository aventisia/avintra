namespace AccountsAPIs.Services;

public interface IDesktopSignInService
{
    /// <summary>
    /// Mints a single-use desktop sign-in code bound to the caller, the state and the PKCE challenge.
    /// </summary>
    /// <param name="userId">The account of the signed-in browser session.</param>
    /// <param name="sessionId">The live session of the signed-in browser session.</param>
    /// <param name="desktopSignInMintDto">The state, code challenge and loopback return address of the attempt.</param>
    /// <returns>The single-use code, or the reason the attempt was refused.</returns>
    Task<ServiceResponse<DesktopSignInMintResultDto>> MintDesktopSignInCodeAsync(Guid userId, Guid sessionId, DesktopSignInMintDto desktopSignInMintDto);

    /// <summary>
    /// Exchanges a single-use desktop sign-in code for a new user session.
    /// </summary>
    /// <param name="desktopSignInExchangeDto">The code, the state and the PKCE code verifier of the attempt.</param>
    /// <returns>The new user session, or the reason the attempt was refused.</returns>
    Task<ServiceResponse<UserSessionDto>> ExchangeDesktopSignInCodeAsync(DesktopSignInExchangeDto desktopSignInExchangeDto);
}
