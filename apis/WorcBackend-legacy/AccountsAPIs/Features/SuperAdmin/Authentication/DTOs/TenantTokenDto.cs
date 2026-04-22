namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents information about whether a token belongs to a tenant.
/// </summary>
public class TenantTokenDto
{
    /// <summary>
    /// Gets or sets a value indicating whether the token is a tenant token.
    /// </summary>
    public bool IsTenantToken { get; set; }
}