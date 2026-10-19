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
}
