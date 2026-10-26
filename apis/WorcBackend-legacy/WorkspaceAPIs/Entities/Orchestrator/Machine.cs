namespace WorkspaceAPIs.Entities;

[Table("run_Machines")]
public class Machine : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the record's primary key in Guid (globally unique identifier) format.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid TenantId { get; set; }

    /// <summary>
    /// Get or set the Name of the machine (max length 256)
    /// </summary>
    /// <remarks>
    /// The Machine unique name (machine local or virtual machine where the job is supposed to run) is going to be [username]_os_osid, which is a unique identifier for the machine.
    /// For example, [gaurav]_windows_f9e58876-0de0-452b-8f80-0dfc0e2b88cd, [john doe]_linux_12345678-0de0-452b-8f80-0dfc0e2b88cd
    /// </remarks>
    [Required, MaxLength(256)]
    public required string Name { get; set; }

    /// <summary>
    /// Represents the operating system of the machine, e.g., Windows, Linux
    /// </summary>
    [Required]
    public required OsTypesEnum OperatingSystem { get; set; }

    /// <summary>
    /// Gets or sets the identifier that uniquely represents the operating system.
    /// </summary>
    [Required, MaxLength(100)]
    public required string OsID { get; set; }

    /// <summary>
    /// Represents the username of the machine
    /// </summary>
    [Required, MaxLength(255)]
    public required string Username { get; set; }

    /// <summary>
    /// Represents the host name of the machine
    /// </summary>
    [Required, MaxLength(255)]
    public required string Hostname { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who owns the machine.
    /// </summary>
    [Required]
    public Guid UserId { get; set; }

    /// <summary>
    /// Represents the timestamp of when the machine was last checked in
    /// </summary>
    public DateTime LastCheckedIn { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets a value indicating whether the record is disabled. Use this to mark a record as disabled if it's outdated or no longer required when deletion is not possible.
    /// </summary>
    public bool IsDisabled { get; set; } = false;

    /// <summary>
    /// Gets or sets the version number used for row versioning. Row versioning helps detect conflicts between concurrent transactions.
    /// </summary>
    /// <remarks>
    /// It is a hidden system column and won't be visible in table's column list.
    /// For more information, see https://www.npgsql.org/efcore/modeling/concurrency.html?tabs=data-annotations
    /// </remarks>
    [Timestamp]
    public uint Version { get; set; }

    /// <summary>
    /// One to Many relationship with WorkspaceUser, representing the user who owns the machine
    /// One user can have multiple machines, but each machine is owned by a single user. 
    /// This relationship is established through the UserId foreign key.
    /// </summary>
    public virtual WorkspaceUser? User { get; set; }

    /// <summary>
    /// Many-to-Many relationship with Flow version, representing the machine's associated flow versions
    /// </summary>
    public virtual ICollection<Machine_FlowVersion> MachineFlowVersions { get; set; } = new List<Machine_FlowVersion>();
}
