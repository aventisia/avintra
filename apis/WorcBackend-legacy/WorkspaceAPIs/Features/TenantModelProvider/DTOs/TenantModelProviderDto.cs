namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) representing a tenant-scoped model provider configuration,
/// including the selected credential and the list of enabled model identifiers.
/// </summary>
public class TenantModelProviderDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the configuration record.
    /// Optional because the same DTO is used for insert and update.
    /// </summary>
    public Guid? Id { get; set; }

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
    /// </summary>
    public List<string> EnabledModelIds { get; set; } = new();

    /// <summary>
    /// Gets or sets a value indicating whether the provider is disabled.
    /// Nullable to differentiate between 'true', 'false' and undefined.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the record.
    /// Informational only; not included in API requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// Informational only; not included in API requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the record.
    /// Informational only; not included in API requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was last modified.
    /// Informational only; not included in API requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
