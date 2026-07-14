namespace WorkspaceAPIs.Entities;

[Table("Machines")]
public class Machine : BaseEntity, IMustHaveTenant
{
    [Required]
    public Guid TenantId { get; set; }

    /// <summary>
    /// Get or set the Name of the machine (max length 256)
    /// </summary>
    /// <remarks>
    /// The Machine unique name (machine local or virtual machine where the job is supposed to run) is going to be [username]_env_os_osid, which is a unique identifier for the machine.
    /// For example, [gaurav]_dev_windows_f9e58876-0de0-452b-8f80-0dfc0e2b88cd, [john doe]_prod_linux_12345678-0de0-452b-8f80-0dfc0e2b88cd
    /// </remarks>
    [Required, MaxLength(256)]
    public required string Name { get; set; }

    /// <summary>
    /// Represents the environment of the machine, e.g., Development, UAT, Production
    /// </summary>
    [Required]
    public required EnvironmentTypesEnum Environment { get; set; }

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
    /// Optional IP address of the machine (supports IPv4 or IPv6)
    /// </summary>
    [MaxLength(100)]
    public string? IpAddress { get; set; }

    /// <summary>
    /// Represents the timestamp of when the machine was last checked in
    /// </summary>
    public DateTime LastCheckedIn { get; set; }

    /// <summary>
    /// Represents the status of the machine. Possible values are: Idle, Online, Offline, Running, Stopped
    /// </summary>
    [Required]
    public required MachineStatusEnum Status { get; set; }

    /// <summary>
    /// Many-to-Many relationship with Flow version, representing the machine's associated flow versions
    /// </summary>
    public virtual ICollection<Machine_FlowVersion> MachineFlowVersions { get; set; } = new List<Machine_FlowVersion>();
}
