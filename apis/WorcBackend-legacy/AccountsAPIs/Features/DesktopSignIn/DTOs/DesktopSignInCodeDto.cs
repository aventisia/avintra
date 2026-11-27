namespace AccountsAPIs.DTOs;

/// <summary>
/// Cached desktop sign-in code binding for a single hand-back attempt.
/// </summary>
public class DesktopSignInCodeDto
{
    /// <summary>
    /// Gets or sets the account the code was minted for.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the hash of the state the desktop app generated for the attempt.
    /// </summary>
    public string StateHash { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the hash of the PKCE S256 challenge minted with the code.
    /// </summary>
    public string ChallengeHash { get; set; } = string.Empty;
}
