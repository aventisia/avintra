namespace AccountsAPIs.Entities;

/// <summary>
/// Represents an active session record for a user.
/// </summary>
[Table("ActiveSessions")]
public class ActiveSession
{
    /// <summary>
    /// Gets or sets the primary key of the user's active session record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the ID of the device/client using which the session was created.
    /// </summary>
    // [MaxLength(100)] - PENDING FOR NOW. Not sure how to extract DeviceId yet
    public required string DeviceId { get; set; }

    /// <summary>
    /// Gets or sets the IP address of the user when the session was created.
    /// </summary>
    [MaxLength(15)]
    public required string IPAddress { get; set; }

    /// <summary>
    /// Gets or sets the browser name (if available) using which the session was created.
    /// </summary>
    [MaxLength(50)]
    public string? BrowserType { get; set; }

    /// <summary>
    /// Gets or sets the OS name (if available) in which the session was created.
    /// </summary>
    [MaxLength(50)]
    public string? OperatingSystem { get; set; }

    /// <summary>
    /// Gets or sets the user location when the session was created.
    /// </summary>
    [MaxLength(50)]
    public string? Location { get; set; }

    /// <summary>
    /// Gets or sets the refresh token for the session.
    /// </summary>
    [MaxLength(100)]
    public required string RefreshToken { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the session expires.
    /// </summary>
    public DateTimeOffset SessionExpiresOn { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the session was created.
    /// </summary>
    public DateTimeOffset LoggedInOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the date and time when the session was last refreshed.
    /// </summary>
    public DateTimeOffset LastRefreshOn { get; set; }

    /// <summary>
    /// Gets or sets the primary key of the user record associated with the session.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the virtual property to attach the active session with the user.
    /// </summary>
    [ForeignKey("UserId")]
    public virtual AccountUser? User { get; set; }

    /// <summary>
    /// Gets or sets the version number used for row versioning. Row versioning helps detect conflicts between concurrent transactions
    /// </summary>
    /// <remarks>
    /// It is a hidden system column and won't be visible in table's column list.
    /// For more information, see https://www.npgsql.org/efcore/modeling/concurrency.html?tabs=data-annotations
    /// </remarks>
    [Timestamp]
    public uint Version { get; set; }
}