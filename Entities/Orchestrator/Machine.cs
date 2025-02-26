namespace WorkspaceAPIs.Entities;
public class Machine : BaseEntity, IMustHaveTenant
{
    [Required]
    public Guid TenantId { get; set; }

    /// <summary>
    /// get or set the Name of the machine max(200)
    /// </summary>
    [Required, MaxLength(200)]
    public string? Name { get; set; }

    /// <summary>
    /// IP address of the machine IPv4 or 6
    /// </summary>
    [Required, MaxLength(100)]
    public string? IPAddress { get; set; }

    /// <summary>
    /// represents the host name of the machine
    /// </summary>
    [Required, MaxLength(100)]
    public string? Hostname { get; set; }

    /// <summary>
    ///  represents the operating system of the machine like Windows, Linux
    /// </summary>
    [Required]
    public MachineTypeEnum Type { get; set; }

    /// <summary>
    /// represenets the status of the machine one of from Online, Offline, Running, Stopped
    /// </summary>
    public MachineStatusTypeEnum Status { get; set; }

    /// <summary>
    /// represents the environment of the machine Development, UAT, Production
    /// </summary>
    [Required, MaxLength(100)]
    public string? Environment { get; set; }

    /// <summary>
    /// represents the Running agent/flow activity
    /// </summary>
    public string? CurrentTask { get; set; }

    /// <summary>
    /// represents the avaibility of the machine for another task.
    /// </summary>
    public bool IsAvailable { get; set; }

    /// <summary>
    /// Running agent/flow's activity/action, if any
    /// </summary>
    public DateTime LastCheckedIn { get; set; }

    // Many-to-Many Relationship with Flows
    public virtual ICollection<MachineFlow>? MachineFlows { get; set; }
}
