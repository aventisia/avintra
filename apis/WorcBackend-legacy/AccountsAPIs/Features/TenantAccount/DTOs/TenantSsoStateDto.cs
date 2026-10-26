namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a single sign-on enable/disable request for a tenant.
/// </summary>
public class TenantSsoStateDto
{
    /// <summary>
    /// Gets or sets a value indicating whether single sign-on should be enabled.
    /// </summary>
    public bool IsSSOEnabled { get; set; }
}
