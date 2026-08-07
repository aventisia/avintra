namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a tenant-scoped configuration for an external model provider.
/// Each row stores the selected credential and the list of enabled model identifiers
/// for a single provider, scoped to a tenant via <see cref="IMustHaveTenant"/>.
/// </summary>
[Table("worc_TenantModelProviders")]
public class TenantModelProvider : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the tenant, enabling multi-tenancy support.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the type of the external model provider.
    /// </summary>
    public LLMProviderTypesEnum ProviderType { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the vault credential associated with the provider.
    /// Nullable because URL-based providers (e.g. Ollama) do not use a vault credential.
    /// </summary>
    public Guid? CredentialId { get; set; }

    /// <summary>
    /// Gets or sets the base URL for self-hosted providers (e.g. Ollama).
    /// Null/empty for credential-based providers.
    /// </summary>
    public string? ProviderUrl { get; set; }

    /// <summary>
    /// Gets or sets the list of model identifiers enabled for this provider.
    /// Stored as a JSON column.
    /// </summary>
    public List<string> EnabledModelIds { get; set; } = new();
}
