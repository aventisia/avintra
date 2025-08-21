namespace AccountsAPIs.DTOs;

/// <summary>
/// DTO for creating a new user account with email verification.
/// </summary>
public class CreateUserAccountDto : BaseEmailProperty
{
    /// <summary>
    /// Gets or sets the unique identifier for the verification code record.
    /// </summary>
    [RequiredGuid]
    public Guid VerificationCodeId { get; set; }

    /// <summary>
    /// Gets or sets the verification code or OTP (One-Time Password) entered by the user.
    /// </summary>
    [StringLength(255)]
    public required string SecretCode { get; set; }
}
