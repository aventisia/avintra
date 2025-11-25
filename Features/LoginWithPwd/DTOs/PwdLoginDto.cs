namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the data transfer object for making a manual login request using a username and password. <br/>
/// </summary>
/// <remarks>
/// Note: Not applying StringLength, EmailAddress check due to security reasons. Validation will trigger Lockout if UserName or Pwd are invalid 
/// </remarks>
public class PwdLoginDto : BaseEmailProperty
{
    /// <summary>
    /// Gets or sets the email/username of the user's account.
    /// </summary>
    public override required string Email { get; set; }

    /// <summary>
    /// Gets or sets the password of the user's account.
    /// </summary>
    [DisplayName("Password")]
    public required string Pwd { get; set; }

    /// <summary>
    /// Gets or sets the operating system information of the user's device.
    /// </summary>
    public OSInformationDto? OSInfo { get; set; }
}