namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the data transfer object for updating the first name and last name of a user account.
/// </summary>
public class UserProfileDto
{
    /// <summary>
    /// Gets or sets the first name of the user. Max-50.
    /// </summary>
    [StringLength(255)]
    public string? AvatarSrc { get; set; }
    /// <summary>
    /// Gets or sets the first name of the user. Max-50.
    /// </summary>
    [StringLength(50)]
    public required string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the last name of the user. Max-50.
    /// </summary>
    [StringLength(50)]
    public required string LastName { get; set; }

    /// <summary>
    /// Gets or sets the date of birth of the user. 
    /// </summary>
    public DateTime? DateOfBirth { get; set; }

    /// <summary>
    /// Gets or sets the phone number of the user. Max-20.
    /// </summary>
    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets the gender of the user profile
    /// </summary>
    public GenderTypeEnum Gender { get; set; } = GenderTypeEnum.PreferNotToSay;

    /// <summary>
    /// Gets or sets the country of the user. Max-100.
    /// </summary>
    public CountriesEnum? Country { get; set; }
}