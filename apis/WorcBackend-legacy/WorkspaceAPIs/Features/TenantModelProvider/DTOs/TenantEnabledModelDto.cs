namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object representing a single enabled model for a tenant, including its provider and capability.
/// </summary>
public class TenantEnabledModelDto
{
    /// <summary>
    /// Gets or sets the type of the external model provider.
    /// </summary>
    public LLMProviderTypesEnum ProviderType { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the enabled model.
    /// </summary>
    public string ModelId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the capability the model is enabled for.
    /// </summary>
    public ModelCapabilityEnum? Capability { get; set; }
}
