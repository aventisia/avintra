namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the visual theme of a custom UI builder project.
/// </summary>
public class UiBuilderThemeDto
{
    /// <summary>
    /// Gets or sets the primary brand color as a 6-digit hex value, for example "#4f46e5".
    /// </summary>
    [StringLength(7)]
    public string PrimaryColor { get; set; } = "#4f46e5";

    /// <summary>
    /// Gets or sets the neutral palette ("slate", "gray", "zinc", "neutral", or "stone").
    /// </summary>
    [StringLength(20)]
    public string NeutralColor { get; set; } = "slate";

    /// <summary>
    /// Gets or sets the corner radius scale ("none", "sm", "md", "lg", or "xl").
    /// </summary>
    [StringLength(10)]
    public string Radius { get; set; } = "md";

    /// <summary>
    /// Gets or sets the font family ("inter", "system", "serif", or "mono").
    /// </summary>
    [StringLength(20)]
    public string FontFamily { get; set; } = "inter";

    /// <summary>
    /// Gets or sets the color mode ("light" or "dark").
    /// </summary>
    [StringLength(10)]
    public string Mode { get; set; } = "light";
}
