namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the request that starts one desktop sign-in attempt.
/// </summary>
public class DesktopSignInMintDto
{
    /// <summary>
    /// Gets or sets the opaque state the desktop app generated for this attempt.
    /// </summary>
    public required string State { get; set; }

    /// <summary>
    /// Gets or sets the PKCE S256 challenge of the desktop app's code verifier. Max length 43.
    /// </summary>
    public required string CodeChallenge { get; set; }

    /// <summary>
    /// Gets or sets the loopback return address the browser delivers the code to.
    /// </summary>
    public required string RedirectUri { get; set; }
}
