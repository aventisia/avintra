namespace AspNetToolkit.Config;

/// <summary>
/// Represents the configuration for the default settings of a tenant.
/// </summary>
public class TenantDefaultConfig
{
    /// <summary>
    /// Gets or sets the number of inactive days before data expires.
    /// </summary>
    public required int InactiveDaysBeforeDataExpires { get; set; }

    /// <summary>
    /// Gets or sets the idle session timeout in minutes.
    /// </summary>
    public required int IdleSessionTimeoutInMinutes { get; set; }

    /// <summary>
    /// Gets or sets the number of days before the password expires.
    /// </summary>
    public required int DaysBeforePwdExpires { get; set; }
}