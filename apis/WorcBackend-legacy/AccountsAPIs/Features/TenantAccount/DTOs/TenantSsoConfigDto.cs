using System.Text.Json.Serialization;

namespace AccountsAPIs.DTOs;

/// <summary>
/// Versioned single sign-on configuration persisted in the tenant's SSOConfigJson column.
/// </summary>
public class TenantSsoConfigDto
{
    /// <summary>
    /// Gets or sets the schema version of the stored document.
    /// </summary>
    [JsonPropertyName("v")]
    public int V { get; set; }

    /// <summary>
    /// Gets or sets the identity provider key. Only "microsoft_entra" is supported.
    /// </summary>
    [JsonPropertyName("provider")]
    public string Provider { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the provider's external tenant identifier (Entra "tid").
    /// </summary>
    [JsonPropertyName("externalTenantId")]
    public string ExternalTenantId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the email domain that maps users of this tenant to the provider.
    /// </summary>
    [JsonPropertyName("emailDomain")]
    public string EmailDomain { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the tenant-supplied (BYO) client id. Optional; the global app is used when absent.
    /// </summary>
    [JsonPropertyName("byoClientId")]
    public string? ByoClientId { get; set; }

    /// <summary>
    /// Gets or sets the tenant-supplied (BYO) client secret. Accepted on write only; never persisted or returned.
    /// </summary>
    [JsonPropertyName("byoClientSecret")]
    public string? ByoClientSecret { get; set; }

    /// <summary>
    /// Gets or sets the DataProtection-protected tenant client secret. Never returned by any GET response.
    /// </summary>
    [JsonPropertyName("byoClientSecretProtected")]
    public string? ByoClientSecretProtected { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the tenant admin attested ownership of the email domain.
    /// </summary>
    [JsonPropertyName("domainVerified")]
    public bool DomainVerified { get; set; }

    /// <summary>
    /// Gets or sets the ISO-8601 timestamp of the domain ownership attestation.
    /// </summary>
    [JsonPropertyName("domainVerifiedOn")]
    public string? DomainVerifiedOn { get; set; }

    /// <summary>
    /// Gets or sets the user id of the tenant admin who attested domain ownership.
    /// </summary>
    [JsonPropertyName("domainVerifiedBy")]
    public string? DomainVerifiedBy { get; set; }
}
