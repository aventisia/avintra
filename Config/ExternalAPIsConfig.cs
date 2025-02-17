namespace AspNetToolkit.Config;

/// <summary>
/// Represents the configuration for external APIs.
/// </summary>
public class ExternalAPIsConfig
{
    /// <summary>
    /// Gets or sets the workspace user.
    /// </summary>
    public required string WorkspaceUser { get; set; }

    /// <summary>
    /// Gets or sets the internal user.
    /// </summary>
    public required string InternalUser { get; set; }

    /// <summary>
    /// Gets or sets the model builder user.
    /// </summary>
    public required string ModelBuilderUser { get; set; }
}