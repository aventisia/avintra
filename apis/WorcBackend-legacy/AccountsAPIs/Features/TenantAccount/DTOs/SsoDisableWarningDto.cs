namespace AccountsAPIs.DTOs;

/// <summary>
/// Non-blocking warning returned when single sign-on is disabled while passwordless users exist.
/// </summary>
public class SsoDisableWarningDto
{
    /// <summary>
    /// Gets or sets a value indicating whether the warning is informational only (disable always succeeds).
    /// </summary>
    public bool WarnOnly { get; set; }

    /// <summary>
    /// Gets or sets the email addresses of active tenant admins without a password.
    /// </summary>
    public List<string> AffectedAdmins { get; set; } = new();

    /// <summary>
    /// Gets or sets the number of users of the tenant without a password.
    /// </summary>
    public int AffectedUserCount { get; set; }

    /// <summary>
    /// Gets or sets the recovery hint describing how affected users regain access.
    /// </summary>
    public string? RecoveryHint { get; set; }
}
