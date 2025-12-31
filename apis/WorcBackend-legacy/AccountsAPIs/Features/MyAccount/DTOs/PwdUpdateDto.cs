namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the data transfer object for updating the password of a user account.
/// </summary>
/// <remarks>
/// This class is used to make a password update request from the user account's settings area, 
/// but only if the user is logged in. The username will be extracted from the Jwt (AccessToken cookie) 
/// which will be available via cookies.
/// </remarks>
public class PwdUpdateDto
{
    /// <summary>
    /// Gets or sets the user's current active password.
    /// </summary>
    [DisplayName("Old password")]
    public required string OldPwd { get; set; }

    /// <summary>
    /// Gets or sets the new password for the user account. The password must be between 8 and 16 characters long.
    /// </summary>
    [StringLength(16, MinimumLength = 8, ErrorMessage = "{0} must meet length requirements")]
    [DisplayName("New password")]
    public required string NewPwd { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the user wants to log off from all other active sessions.
    /// </summary>
    public required bool LogoffFromOtherSessions { get; set; }
}