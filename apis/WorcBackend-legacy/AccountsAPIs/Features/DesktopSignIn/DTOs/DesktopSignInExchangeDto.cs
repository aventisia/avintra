namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the request that exchanges a desktop sign-in code for a session.
/// </summary>
public class DesktopSignInExchangeDto
{
    /// <summary>
    /// Gets or sets the single-use code the desktop app received.
    /// </summary>
    public required string Code { get; set; }

    /// <summary>
    /// Gets or sets the state the app generated for the attempt that minted the code.
    /// </summary>
    public required string State { get; set; }

    /// <summary>
    /// Gets or sets the desktop app's PKCE code verifier. Max length 128.
    /// </summary>
    public required string CodeVerifier { get; set; }
}
