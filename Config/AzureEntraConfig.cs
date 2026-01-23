namespace AccountsAPIs.Config;

/// <summary>
/// Represents the configuration settings required to integrate with Azure Entra (Azure AD).
/// </summary>
public class AzureEntraConfig
{
    /// <summary>
    /// Gets or sets the Azure tenant ID.
    /// </summary>
    public required string TenantId { get; set; }

    /// <summary>
    /// Gets or sets the Azure application (client) ID.
    /// </summary>
    public required string ClientId { get; set; }

    /// <summary>
    /// Gets or sets the Azure application (client) secret.
    /// </summary>
    public required string ClientSecret { get; set; }
}