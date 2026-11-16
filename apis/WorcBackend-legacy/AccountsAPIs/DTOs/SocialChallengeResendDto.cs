namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a request to resend the two-step verification code of an outstanding social attempt.
/// </summary>
public class SocialChallengeResendDto : BaseEmailProperty
{
    /// <summary>
    /// Gets or sets the primary key of the verification code issued with the callback.
    /// </summary>
    [RequiredGuid]
    public Guid VerificationCodeId { get; set; }

    /// <summary>
    /// Gets or sets the provider name the attempt belongs to.
    /// </summary>
    public required string Provider { get; set; }
}
