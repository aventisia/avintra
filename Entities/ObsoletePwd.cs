namespace AccountsAPIs.Entities;

/// <summary>
/// Represents an obsolete password record.
/// </summary>
[Table("ObsoletePwds")]
public class ObsoletePwd
{
    /// <summary>
    /// Gets or sets the primary key of the ObsoletePwd record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the password hash.
    /// </summary>
    [DisplayName("Password")]
    public required string PwdHash { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the password was last set/reset/updated by the user.
    /// </summary>
    public DateTimeOffset? PwdSetOn { get; set; } = new DateTimeOffset();

    /// <summary>
    /// Gets or sets the primary key of the associated user record.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the virtual property to attach an AccountUser with ObsoletePwd.
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