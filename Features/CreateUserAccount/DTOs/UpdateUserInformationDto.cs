namespace AccountsAPIs.DTOs;

/// <summary>
/// DTO for updating or creating a user's details (first name, last name, and password) within an organization's tenant.
/// </summary>
public class UpdateUserInformationDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the user.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the user's first name. Maximum length is 50 characters.
    /// </summary>
    [StringLength(50)]
    public required string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the user's last name. Maximum length is 50 characters.
    /// </summary>
    [StringLength(50)]
    public required string LastName { get; set; }

    /// <summary>
    /// Gets or sets the user's password. Must be between 8 and 16 characters in length.
    /// </summary>
    [StringLength(16, MinimumLength = 8, ErrorMessage = "{0} must meet length requirements")]
    [DisplayName("Password")]
    public required string Pwd { get; set; }
}