namespace AspNetToolkit.Entities;

/// <summary>
/// Represents an active session record for a user, storing session details like device, location, and expiration.
/// </summary>
[Table("ActiveSessions")]
public class ActiveSessionReadOnly
{
    /// <summary>
    /// Gets or sets the unique identifier for the active session.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the device or client that initiated the session.
    /// </summary>
    // [MaxLength(100)] - TODO: DeviceId extraction logic still pending.
    public required string DeviceId { get; set; }

    /// <summary>
    /// Gets or sets the IP address of the user when the session was created.
    /// </summary>
    [MaxLength(15)]
    public required string IPAddress { get; set; }

    /// <summary>
    /// Gets or sets the name of the browser (if available) used during session creation.
    /// </summary>
    [MaxLength(50)]
    public string? BrowserType { get; set; }

    /// <summary>
    /// Gets or sets the operating system name (if available) of the user's device when the session was created.
    /// </summary>
    [MaxLength(50)]
    public string? OperatingSystem { get; set; }

    /// <summary>
    /// Gets or sets the geographic location of the user when the session was established.
    /// </summary>
    [MaxLength(50)]
    public string? Location { get; set; }

    /// <summary>
    /// Gets or sets the refresh token associated with the session.
    /// </summary>
    [MaxLength(100)]
    public required string RefreshToken { get; set; }

    /// <summary>
    /// Gets or sets the expiration timestamp for the session.
    /// </summary>
    public DateTimeOffset SessionExpiresOn { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the session was initially created.
    /// </summary>
    public DateTimeOffset LoggedInOn { get; set; }

    /// <summary>
    /// Gets or sets the timestamp of the last session refresh.
    /// </summary>
    public DateTimeOffset LastRefreshOn { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the user associated with the session.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the version number used for concurrency control. Helps detect conflicts in concurrent transactions.
    /// </summary>
    /// <remarks>
    /// This is a hidden system column and won't appear in the table's column list.
    /// For more details on concurrency control, see: https://www.npgsql.org/efcore/modeling/concurrency.html?tabs=data-annotations
    /// </remarks>
    [Timestamp]
    public uint Version { get; set; }
}
