namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the data transfer object for creating a new account.
/// </summary>
public class CreateAccountDto : BaseEmailProperty
{
    /// <summary>
    /// Gets or sets the password for the user account. Minimum length is 8 characters and maximum length is 16 characters.
    /// </summary>
    [StringLength(16, MinimumLength = 8, ErrorMessage = "{0} must meet length requirements")]
    [DisplayName("Password")]
    public required string Pwd { get; set; }

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

    /// <summary>
    /// Gets or sets a value indicating whether this sign up is being done by a social account or manually.
    /// </summary>
    public required bool IsSocialSignUp { get; set; }
}