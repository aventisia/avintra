namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a read-only published view of a custom UI builder project and its pinned published version.
/// </summary>
public class UiBuilderProjectViewDto
{
    /// <summary>
    /// Gets or sets the published project details.
    /// </summary>
    public UiBuilderProjectDto? Project { get; set; }

    /// <summary>
    /// Gets or sets the pinned published version, or null when unavailable.
    /// </summary>
    public UiBuilderVersionDto? HeadVersion { get; set; }
}
