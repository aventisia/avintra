namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the data transfer object for updating the email of a user account.
/// </summary>
/// <remarks>
/// This class is used to make a email update request from the user account's settings area, 
/// but only if the user is logged in. The username will be extracted from the Jwt (AccessToken cookie) 
/// which will be available via cookies.
/// </remarks>
/// 

public class EmailUpdateDto
{
    /// <summary>
    /// Gets or sets the first name of the user. Max-50.
    /// </summary>
    [StringLength(50)]
    public required string Email { get; set; }

}