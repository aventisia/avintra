namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the owner-managed settings of a custom UI builder project.
/// </summary>
public class UiBuilderProjectSettingsDto
{
    /// <summary>
    /// Gets or sets standing instructions sent with every generation. Max 4000 characters.
    /// </summary>
    [StringLength(4000)]
    public string? Instructions { get; set; }

    /// <summary>
    /// Gets or sets the visual theme, or null for the platform default.
    /// </summary>
    public UiBuilderThemeDto? Theme { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the project is offered to the tenant as a template.
    /// </summary>
    public bool IsTemplate { get; set; }
}
