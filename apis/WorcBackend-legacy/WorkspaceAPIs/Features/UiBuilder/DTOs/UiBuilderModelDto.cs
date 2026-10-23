namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a text-capable model enabled for the tenant that the UI builder can generate with.
/// </summary>
public class UiBuilderModelDto
{
    /// <summary>
    /// Gets or sets the provider type name (for example "OpenAI").
    /// </summary>
    public string ProviderType { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the identifier of the model.
    /// </summary>
    public string ModelId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the name of the vault credential configured for the provider, or null when none resolves.
    /// </summary>
    public string? CredentialName { get; set; }

    /// <summary>
    /// Gets or sets the environment of the vault credential ("dev" or "prod"), or null when no credential resolves.
    /// </summary>
    public string? CredentialEnvType { get; set; }

    /// <summary>
    /// Gets or sets the base URL for self-hosted providers.
    /// </summary>
    public string? ProviderUrl { get; set; }
}
