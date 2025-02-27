namespace WorkspaceAPIs.Entities;
public class Machine : BaseEntity, IMustHaveTenant
{
    [Required]
    public Guid TenantId { get; set; }

    /// <summary>
    /// Get or set the Name of the machine (max length 256)
    /// </summary>
    [Required, MaxLength(256)]
    public required string Name { get; set; }

    /// <summary>
    /// IP address of the machine (supports IPv4 or IPv6)
    /// </summary>
    [Required, MaxLength(100)]
    public required string IPAddress { get; set; }

    /// <summary>
    /// Represents the host name of the machine
    /// </summary>
    [Required, MaxLength(100)]
    public required string Hostname { get; set; }

    /// <summary>
    /// Represents the operating system of the machine, e.g., Windows, Linux
    /// </summary>
    [Required, MaxLength(50)]
    public required string Type { get; set; }

    /// <summary>
    /// Represents the status of the machine. Possible values are: Online, Offline, Running, Stopped
    /// </summary>
    [Required, MaxLength(50)]
    public required string Status { get; set; }

    /// <summary>
    /// Represents the environment of the machine, e.g., Development, UAT, Production
    /// </summary>
    [Required, MaxLength(50)]
    public required string Environment { get; set; }

    /// <summary>
    /// Represents the running agent/flow activity on the machine, if any
    /// </summary>
    public string? CurrentTask { get; set; }

    /// <summary>
    /// Represents the availability of the machine for another task. True if available, False if not.
    /// </summary>
    public bool IsAvailable { get; set; }

    /// <summary>
    /// Represents the timestamp of when the machine was last checked in
    /// </summary>
    public DateTime LastCheckedIn { get; set; }

    /// <summary>
    /// Many-to-Many relationship with Flows, representing the machine's associated flow activities
    /// </summary>
    public virtual ICollection<MachineFlow>? MachineFlows { get; set; }
}
