namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a model enabled for a tenant model provider together with the capability it is enabled for.
/// </summary>
public class EnabledModel
{
    /// <summary>
    /// Gets or sets the identifier of the enabled model.
    /// </summary>
    public string ModelId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the capability the model is enabled for.
    /// </summary>
    public string? Capability { get; set; }
}
