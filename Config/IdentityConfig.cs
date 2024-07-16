namespace AspNetToolkit.Config;

/// <summary>
/// Represents the configuration settings for identity management.
/// </summary>
public class IdentityConfig
{
    /// <summary>
    /// Gets or sets the maximum number of active sessions allowed per user.
    /// </summary>
    public int MaxActiveSessionAllowed { get; set; }

    /// <summary>
    /// Gets or sets the number of previous passwords to retain for password history.
    /// </summary>
    public int ObsoletePwdRetainLimit { get; set; }

    /// <summary>
    /// Gets or sets the default lockout duration in minutes.
    /// </summary>
    public int DefaultLockoutTimeSpanInMinutes { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of failed access attempts before an account is locked out.
    /// </summary>
    public int LockoutMaxFailedAccessAttempts { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether a confirmed account is required for sign-in.
    /// </summary>
    public bool SignInRequireConfirmedAccount { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether a confirmed email is required for sign-in.
    /// </summary>
    public bool SignInRequireConfirmedEmail { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether a confirmed phone number is required for sign-in.
    /// </summary>
    public bool SignInRequireConfirmedPhoneNo { get; set; }
}