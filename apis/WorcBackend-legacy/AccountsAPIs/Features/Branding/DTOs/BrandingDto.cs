namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the deployment's branding configuration. Values are sourced from the deployment
/// environment; an unset value is left null so the client falls back to its built-in
/// Avintra/Aventisia defaults.
/// </summary>
public class BrandingDto
{
    /// <summary>
    /// Gets or sets the custom application/product name shown in the UI and document title.
    /// Maximum length 100 characters.
    /// </summary>
    public string? AppName { get; set; }

    /// <summary>
    /// Gets or sets the custom company name. Maximum length 100 characters.
    /// </summary>
    public string? CompanyName { get; set; }

    /// <summary>
    /// Gets or sets the light company logo (full wordmark) as an absolute HTTPS URL on the deployment's domain.
    /// </summary>
    public string? CompanyLogoUrlLight { get; set; }

    /// <summary>
    /// Gets or sets the dark company logo (same domain rules as <see cref="CompanyLogoUrlLight"/>).
    /// </summary>
    public string? CompanyLogoUrlDark { get; set; }

    /// <summary>
    /// Gets or sets the light product logo as an absolute HTTPS URL on the deployment's domain.
    /// </summary>
    public string? ProductLogoUrlLight { get; set; }

    /// <summary>
    /// Gets or sets the dark product logo (same domain rules as <see cref="ProductLogoUrlLight"/>).
    /// </summary>
    public string? ProductLogoUrlDark { get; set; }

    /// <summary>
    /// Gets or sets the light short logo as an absolute HTTPS URL on the deployment's domain.
    /// </summary>
    public string? ShortLogoUrlLight { get; set; }

    /// <summary>
    /// Gets or sets the dark short logo (same domain rules as <see cref="ShortLogoUrlLight"/>).
    /// </summary>
    public string? ShortLogoUrlDark { get; set; }

    /// <summary>
    /// Gets or sets the light favicon as an absolute HTTPS URL on the deployment's domain.
    /// </summary>
    public string? FaviconUrlLight { get; set; }

    /// <summary>
    /// Gets or sets the dark favicon (same domain rules as <see cref="FaviconUrlLight"/>).
    /// </summary>
    public string? FaviconUrlDark { get; set; }

    /// <summary>
    /// Gets or sets the background brand color as a valid CSS color value (hex, rgb() or rgba()).
    /// </summary>
    public string? BackgroundColor { get; set; }

    /// <summary>
    /// Gets or sets the foreground brand color (same formats as <see cref="BackgroundColor"/>).
    /// </summary>
    public string? ForegroundColor { get; set; }

    /// <summary>
    /// Gets or sets the primary brand color (same formats as <see cref="BackgroundColor"/>).
    /// </summary>
    public string? PrimaryColor { get; set; }

    /// <summary>
    /// Gets or sets the primary foreground brand color (same formats as <see cref="BackgroundColor"/>).
    /// </summary>
    public string? PrimaryForegroundColor { get; set; }

    /// <summary>
    /// Gets or sets the secondary brand color (same formats as <see cref="BackgroundColor"/>).
    /// </summary>
    public string? SecondaryColor { get; set; }

    /// <summary>
    /// Gets or sets the secondary foreground brand color (same formats as <see cref="BackgroundColor"/>).
    /// </summary>
    public string? SecondaryForegroundColor { get; set; }

    /// <summary>
    /// Gets or sets the accent brand color (same formats as <see cref="BackgroundColor"/>).
    /// </summary>
    public string? AccentColor { get; set; }

    /// <summary>
    /// Gets or sets the accent foreground brand color (same formats as <see cref="BackgroundColor"/>).
    /// </summary>
    public string? AccentForegroundColor { get; set; }
}
