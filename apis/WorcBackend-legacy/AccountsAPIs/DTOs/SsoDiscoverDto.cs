namespace AccountsAPIs.DTOs;

/// <summary>
/// Home-realm-discovery result for an email address: the provider login URL when the domain is SSO-enabled.
/// </summary>
public class SsoDiscoverDto
{
    /// <summary>
    /// Gets or sets the provider authorization URL carrying the email hint, state and nonce. Null when no active single sign-on tenant matches.
    /// </summary>
    public string? SsoLoginUrl { get; set; }

    /// <summary>
    /// Gets or sets the identity provider key when a single sign-on tenant matches.
    /// </summary>
    public string? Provider { get; set; }

    /// <summary>
    /// Gets or sets the matching tenant id when a single sign-on tenant matches.
    /// </summary>
    public Guid? TenantId { get; set; }
}
