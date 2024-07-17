namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the DTO to send tenant information required for authentication.
/// </summary>
public class TenantInfoDto
{
    /// <summary>
    /// Gets or sets the tenant's primary ID.
    /// </summary>
    public required Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the tenant's full name. Maximum length is 100 characters.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who is requesting the tenant info for authentication. Maximum length is 254 characters.
    /// </summary>
    public required string UserName { get; set; }

    /// <summary>
    /// Gets or sets the tenant's single sign-on configuration, if any.
    /// </summary>
    public string? SSOConfigJson { get; set; }
}