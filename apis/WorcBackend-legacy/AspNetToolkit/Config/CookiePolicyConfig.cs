namespace AspNetToolkit.Config;

/// <summary>
/// Represents the configuration for cookie policy.
/// </summary>
public class CookiePolicyConfig
{
    /// <summary>
    /// Gets or sets the same-site mode for cookies.
    /// </summary>
    public required string SameSiteMode { get; set; }

    /// <summary>
    /// Gets or sets the domain for cookies.
    /// </summary>
    public required string Domain { get; set; }
}