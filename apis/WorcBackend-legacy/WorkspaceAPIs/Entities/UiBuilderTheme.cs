namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents the visual theme of a custom UI builder project, stored inside the project's JSON column.
/// </summary>
public class UiBuilderTheme
{
    /// <summary>
    /// Gets or sets the primary brand color as a 6-digit hex value, for example "#4f46e5".
    /// </summary>
    [MaxLength(7)]
    public string PrimaryColor { get; set; } = "#4f46e5";

    /// <summary>
    /// Gets or sets the neutral palette ("slate", "gray", "zinc", "neutral", or "stone").
    /// </summary>
    [MaxLength(20)]
    public string NeutralColor { get; set; } = "slate";

    /// <summary>
    /// Gets or sets the corner radius scale ("none", "sm", "md", "lg", or "xl").
    /// </summary>
    [MaxLength(10)]
    public string Radius { get; set; } = "md";

    /// <summary>
    /// Gets or sets the font family ("inter", "system", "serif", or "mono").
    /// </summary>
    [MaxLength(20)]
    public string FontFamily { get; set; } = "inter";

    /// <summary>
    /// Gets or sets the color mode ("light" or "dark").
    /// </summary>
    [MaxLength(10)]
    public string Mode { get; set; } = "light";
}
