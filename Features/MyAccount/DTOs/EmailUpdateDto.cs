namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the data transfer object for updating the email of a user account.
/// </summary>
public class EmailUpdateDto
{
    /// <summary>
    /// Gets or sets the email of the user. Max-50.
    /// </summary>
    [StringLength(254)]
    public required string Email { get; set; }

    /// <summary>
    /// Gets or sets the primary key of the verification code database record.
    /// </summary>
    [RequiredGuid]
    public Guid VerificationCodeId { get; set; }

    /// <summary>
    /// Gets or sets the verification code or OTP (One-Time Password) provided by the user.
    /// </summary>
    [StringLength(255)]
    public required string SecretCode { get; set; } 

}