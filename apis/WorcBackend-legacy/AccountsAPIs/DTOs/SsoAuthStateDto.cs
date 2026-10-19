namespace AccountsAPIs.DTOs;

/// <summary>
/// Cached OAuth state binding for a single Entra authorization attempt.
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
}
