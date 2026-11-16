namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the checkpoint name assigned to a custom UI builder version.
/// </summary>
public class UiBuilderVersionLabelDto
{
    /// <summary>
    /// Gets or sets the checkpoint name, or null to clear it. Max 100 characters.
    /// </summary>
    [StringLength(100)]
    public string? Label { get; set; }
}
