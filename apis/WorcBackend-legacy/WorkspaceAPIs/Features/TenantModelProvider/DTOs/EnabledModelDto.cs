namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object representing a model enabled for a provider together with its optional capability.
/// </summary>
public class EnabledModelDto
{
    /// <summary>
    /// Gets or sets the identifier of the enabled model.
    /// </summary>
    public string ModelId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the capability the model is enabled for.
    /// </summary>
    public ModelCapabilityEnum? Capability { get; set; }
}
