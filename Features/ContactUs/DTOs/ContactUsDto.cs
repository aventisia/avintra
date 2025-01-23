namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a Contact Us data transfer object.
/// </summary>
public class ContactUsDto
{
    /// <summary>
    /// Gets or sets the primary key of the contact-us record.
    /// </summary>
    /// <remarks>
    /// Note: Not making it required because the same DTO is used for insert and update.
    /// </remarks>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the contact. Max-100 characters.
    /// </summary>
    [StringLength(100)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the work email address of the contact. Max-254 characters.
    /// </summary>
    [StringLength(254)]
    public required string Email { get; set; }

    /// <summary>
    /// Gets or sets the phone number of the contact. Max-20.
    /// </summary>
    [StringLength(20)]
    public string? Phone { get; set; }

    /// <summary>
    /// Gets or sets the brief message of the contact. Max-500.
    /// </summary>
    [StringLength(500)]
    public required string Message { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was created. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }
}