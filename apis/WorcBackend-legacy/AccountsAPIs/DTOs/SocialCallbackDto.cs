namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the outcome of a social sign-in attempt as the client consumes it.
/// </summary>
public class SocialCallbackDto
{
    /// <summary>
    /// Gets or sets the outcome: SignedIn, TwoFARequired, LinkCodeRequired or SsoRequired.
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the issued session when the outcome is SignedIn.
    /// </summary>
    public UserSessionDto? UserSession { get; set; }

    /// <summary>
    /// Gets or sets the verification code the client must confirm for the TwoFARequired and LinkCodeRequired outcomes.
    /// </summary>
    public Guid? VerificationCodeId { get; set; }

    /// <summary>
    /// Gets or sets the account email the code was sent to.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Gets or sets the provider name the person used.
    /// </summary>
    public string? Provider { get; set; }

    /// <summary>
    /// Gets or sets the single sign-on URL the person must continue with for the SsoRequired outcome.
    /// </summary>
    public string? SsoLoginUrl { get; set; }

    /// <summary>
    /// Gets or sets the same-origin path to return to after sign-in.
    /// </summary>
    public string? RedirectUrl { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the person arrived with a paid plan chosen.
    /// </summary>
    public bool HasPlanIntent { get; set; }
}
