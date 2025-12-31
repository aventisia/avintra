namespace AspNetToolkit.DTOs;

/// <summary>
/// This DTO is used for operations related to user accounts, such as creating and updating user details.
/// Operations are: <br/>
/// - Create user in WorkspaceDb or InternalDb or both when an admin creates any user account from AccountsAPIs <br/>
/// - Update user details in WorkspaceDb or InternalDb or both when an admin updates any user account from AccountsAPIs <br/>
/// - Create user in WorkspaceDb or InternalDb or both when an user creates an account <br/>
/// - Update user details in WorkspaceDb or InternalDb or both when user updates his/her basic details from account setting dialog <br/>
/// - Get user basic details whenever logged in user needs it to view it <br/>
/// </summary>
public class AppUserBaseDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the user.
    /// </summary>
    [RequiredGuid]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the user name.
    /// </summary>
    [StringLength(254)]
    public required string UserName { get; set; }

    /// <summary>
    /// Gets or sets the user's first name.
    /// </summary>
    [StringLength(50)]
    public required string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the user's last name.
    /// </summary>
    [StringLength(50)]
    public required string LastName { get; set; }

    /// <summary>
    /// Gets or sets the user's avatar (profile pic) source.
    /// </summary>
    [StringLength(255)]
    public string? AvatarSrc { get; set; }
}