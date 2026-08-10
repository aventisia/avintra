namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for an account user.
/// </summary>
public class AccountUsersTableDto
{
    /// <summary>
    /// Gets or sets the primary key of the user record. 
    /// </summary>
    /// <remarks>
    /// Note: Not making it required because the same DTO is used for insert and update.
    /// </remarks>
    public Guid Id { get; set; }

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
    /// Gets or sets the email/username of the user. Max-254.
    /// </summary>
    [StringLength(254)]
    public required string Email { get; set; }

    /// <summary>
    /// Gets or sets the list of user roles (role names).
    /// </summary>
    [MinLength(1)]
    public required List<string> UserRoles { get; set; }

    /// <summary>
    /// Gets or sets the list of space names the user belongs to.
    /// </summary>
    public List<string> Spaces { get; set; } = new();

    /// <summary>
    /// Gets or sets a flag indicating if two-factor authentication is enabled for the user.
    /// </summary>
    public required bool TwoFactorEnabled { get; set; }

    /// <summary>
    /// Gets or sets the date and time, in UTC, when the user lockout ends.
    /// </summary>
    public DateTimeOffset? LockoutEnd { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the user record is disabled.
    /// </summary>
    /// <remarks>
    /// Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating if a user has confirmed their email address. Read-only.
    /// </summary>
    public bool? EmailConfirmed { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the password was last set/reset/updated by the user. Read-only.
    /// </summary>
    public DateTimeOffset? PwdSetOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the user record. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was created. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the user record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was last modified. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}