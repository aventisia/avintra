namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a request to confirm the one-time code that links a social provider account.
/// </summary>
public class SocialLinkVerifyDto
{
    /// <summary>
    /// Gets or sets the primary key of the verification code issued with the callback.
    /// </summary>
    [RequiredGuid]
    public Guid VerificationCodeId { get; set; }

    /// <summary>
    /// Gets or sets the verification code or OTP provided by the user.
    /// </summary>
    [StringLength(255)]
    public required string SecretCode { get; set; }
}
