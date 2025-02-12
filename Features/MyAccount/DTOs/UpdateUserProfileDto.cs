using AccountsAPIs.AccountApiEnum;

namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the data transfer object for updating the first name and last name of a user account.
/// </summary>
public class UpdateUserProfileDto
{
    /// <summary>
    /// Gets or sets the source of the user's avatar (profile pic).
    /// </summary>
    [MaxLength(255)]
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
    public required DateTime DateOfBirth { get; set; }

    /// <summary>
    /// Gets or sets the phone number of the user. Max-20.
    /// </summary>
    [StringLength(20)]
    public required string PhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets the phone number type of the user. either Home or Office
    /// </summary>
    public required PhoneNumberType PhoneNumberType { get; set; }

    /// <summary>
    /// Gets or sets the address line 1 of the user. Max-50.
    /// </summary>
    [StringLength(200)]
    public required string AddressLine1 { get; set; }

    /// <summary>
    /// Gets or sets the address line 2 of the user. Max-50.
    /// </summary>
    [StringLength(200)]
    public required string AddressLine2 { get; set; }

    /// <summary>
    /// Gets or sets the gender of the user profile
    /// </summary>
    public required GenderType Gender { get; set; }


    /// <summary>
    /// Gets or sets the country of the user. Max-100.
    /// </summary>
    [StringLength(100)]
    public required string Country { get; set; }

    /// <summary>
    /// Gets or sets the state or province of the user. Max-100.
    /// </summary>
    [StringLength(100)]
    public required string StateOrProvince { get; set; }

    /// <summary>
    /// Gets or sets the city of the user. Max-100.
    /// </summary>
    [StringLength(100)]
    public required string City { get; set; }

    /// <summary>
    /// Gets or sets the Zip or postal code of the user. Max-10.
    /// </summary>
    [StringLength(10)]
    public required string ZipOrPostalCode { get; set; }
}