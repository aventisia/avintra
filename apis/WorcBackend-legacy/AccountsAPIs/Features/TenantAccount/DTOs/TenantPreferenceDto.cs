namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a Data Transfer Object (DTO) for tenant preferences and security settings.
/// </summary>
public class TenantPreferenceDto
{
    /// <summary>
    /// Gets or sets the unique identifier (ID) of the tenant record.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tenant's full name. Maximum length is 100 characters.
    /// </summary>
    public string? TenantName { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether single sign-on is enabled for the tenant.
    /// If enabled, the authentication pipeline will use the tenant's single sign-on configuration to log in users without a password.
    /// </summary>
    public bool IsSSOEnabled { get; set; } 

    /// <summary>
    /// Gets or sets a value indicating whether users are allowed to login using a password.
    /// This is mostly required when the tenant wants their users to login using single sign-on only.
    /// </summary>
    public bool IsPwdEnabled { get; set; } 

    /// <summary>
    /// Gets or sets a value indicating whether password expiration is removed. By default, this is enabled.
    /// </summary>
    public bool IsPwdNeverExpiresEnabled { get; set; }

    /// <summary>
    /// Gets or sets the number of days before the password can expire.
    /// </summary>
    public int DaysBeforePwdExpires { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether user sessions will automatically time out after a period of inactivity.
    /// </summary>
    public bool IsIdleSessionTimeoutEnabled { get; set; }

    /// <summary>
    /// Gets or sets the number of minutes before a user session can expire automatically due to inactivity on the app.
    /// This is only required or applicable if IsIdleSessionTimeoutEnabled is set to true.
    /// </summary>
    public int IdleSessionTimeoutMinutes { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether an additional verification step is required for all users to log in.
    /// </summary>
    public bool IsTwoFAEnabled { get; set; }

    /// <summary>
    /// Gets or sets the versioned single sign-on configuration document. Accepted on write; the stored
    /// tenant client secret is never included in responses.
    /// </summary>
    public string? SSOConfigJson { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether a tenant client secret is stored for this tenant.
    /// </summary>
    public bool SsoSecretPresent { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the email domain ownership attestation exists.
    /// </summary>
    public bool DomainVerified { get; set; }

    /// <summary>
    /// Gets or sets the tenant admin's write-only attestation that the tenant owns its email domain.
    /// </summary>
    public bool DomainVerifyAttestation { get; set; }

    /// <summary>
    /// Gets or sets the non-blocking warning produced when single sign-on is disabled with passwordless users present.
    /// </summary>
    public SsoDisableWarningDto? SsoDisableWarning { get; set; }
}



