namespace AccountsAPIs.DTOs;

/// <summary>
/// Cached OAuth state binding for a single authorization attempt.
/// </summary>
public class SsoAuthStateDto
{
    /// <summary>
    /// Gets or sets the nonce that the issued id_token must echo.
    /// </summary>
    public string Nonce { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the tenant the authorization attempt was started for.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the email hint supplied at authorization time.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the attempt is an admin-consent grant.
    /// </summary>
    public bool AdminConsent { get; set; }

    /// <summary>
    /// Gets or sets the social provider name of the attempt, when it is a social attempt.
    /// </summary>
    public string? Provider { get; set; }

    /// <summary>
    /// Gets or sets the PKCE code verifier of the attempt.
    /// </summary>
    public string? CodeVerifier { get; set; }

    /// <summary>
    /// Gets or sets the browser binding hash of the attempt.
    /// </summary>
    public string? BindingHash { get; set; }

    /// <summary>
    /// Gets or sets the same-origin path to return to after sign-in.
    /// </summary>
    public string? ReturnUrl { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the person arrived with a paid plan chosen.
    /// </summary>
    public bool HasPlanIntent { get; set; }
}
