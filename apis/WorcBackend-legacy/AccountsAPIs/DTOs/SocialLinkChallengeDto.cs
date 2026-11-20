namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the provider identity held while the one-time link confirmation code is outstanding.
/// </summary>
public class SocialLinkChallengeDto
{
    /// <summary>
    /// Gets or sets the provider name of the attempt.
    /// </summary>
    public string Provider { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the provider's permanent account id.
    /// </summary>
    public string ProviderKey { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the account email the code was sent to.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the same-origin path to return to after sign-in.
    /// </summary>
    public string? ReturnUrl { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the person arrived with a paid plan chosen.
    /// </summary>
    public bool HasPlanIntent { get; set; }

    /// <summary>
    /// Gets or sets the number of rejected codes, which survives a resend.
    /// </summary>
    public int FailedAttempts { get; set; }
}
