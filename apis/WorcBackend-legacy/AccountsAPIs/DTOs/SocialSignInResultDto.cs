namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the resolved next step of a social sign-in before any session is issued.
/// </summary>
public class SocialSignInResultDto
{
    /// <summary>
    /// Gets or sets the resolved outcome.
    /// </summary>
    public SocialSignInOutcomeEnum Outcome { get; set; }

    /// <summary>
    /// Gets or sets the account email of the attempt.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the provider name of the attempt.
    /// </summary>
    public string Provider { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the provider's permanent account id, held while a link confirmation code is outstanding.
    /// </summary>
    public string? ProviderKey { get; set; }

    /// <summary>
    /// Gets or sets the same-origin path to return to after sign-in.
    /// </summary>
    public string? ReturnUrl { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the person arrived with a paid plan chosen.
    /// </summary>
    public bool HasPlanIntent { get; set; }

    /// <summary>
    /// Gets or sets the single sign-on URL the person must continue with when single sign-on takes precedence.
    /// </summary>
    public string? SsoLoginUrl { get; set; }

    /// <summary>
    /// Gets or sets the account whose session is issued when the outcome is SignedIn.
    /// </summary>
    public AccountUser? User { get; set; }

    /// <summary>
    /// Gets or sets the number of rejected link codes of the outstanding attempt.
    /// </summary>
    public int FailedAttempts { get; set; }
}
