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
    [StringLength(100)]
    public string? AppName { get; set; }

    /// <summary>
    /// Gets or sets the custom company name. Maximum length 100 characters.
    /// </summary>
    [StringLength(100)]
    public string? CompanyName { get; set; }

    /// <summary>
    /// Gets or sets the light-theme logo as an absolute HTTPS URL on the deployment's domain.
    /// </summary>
    public string? LogoUrl { get; set; }

    /// <summary>
    /// Gets or sets the dark-theme logo (same domain rules as <see cref="LogoUrl"/>). Reserved for
    /// a future dark theme and currently only used as a fallback when <see cref="LogoUrl"/> is unset.
    /// </summary>
    public string? LogoUrlDark { get; set; }

    /// <summary>
    /// Gets or sets the full wordmark logo (same domain rules as <see cref="LogoUrl"/>), used where
    /// the full logo with the app name is shown.
    /// </summary>
    public string? FullLogoUrl { get; set; }

    /// <summary>
    /// Gets or sets the favicon as an absolute HTTPS URL on the deployment's domain.
    /// </summary>
    public string? FaviconUrl { get; set; }

    /// <summary>
    /// Gets or sets the primary brand color as a valid CSS color value (hex, rgb()/rgba() or
    /// hsl()/hsla()).
    /// </summary>
    public string? PrimaryColor { get; set; }

    /// <summary>
    /// Gets or sets the secondary brand color (same formats as <see cref="PrimaryColor"/>).
    /// </summary>
    public string? SecondaryColor { get; set; }
}
