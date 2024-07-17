namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the data transfer object for making a password reset request.
/// </summary>
/// <remarks>
/// Note: UserName will be extracted from the Jwt (AccessToken cookie) which will be available via cookies
/// </remarks>
public class PwdResetDto
{
    /// <summary>
    /// Gets or sets the new password for the user account.
    /// </summary>
    [StringLength(16, MinimumLength = 8, ErrorMessage = "{0} must meet length requirements")]
    [DisplayName("New password")]
    public required string NewPwd { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the user wants to log off from all other active sessions.
    /// </summary>
    public required bool LogoffFromAllSessions { get; set; }
}