namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the single-use code that hands a sign-in back to the desktop app.
/// </summary>
public class DesktopSignInMintResultDto
{
    /// <summary>
    /// Gets or sets the single-use code the browser delivers to the desktop app's loopback listener.
    /// </summary>
    public required string Code { get; set; }
}
