namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for a project.
/// </summary>
public class MachineDto
{
    public Guid TenantId { get; set; }

    /// <summary>
    /// get or set the Name of the machine max(200)
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// IP address of the machine IPv4 or 6
    /// </summary>
    public string? IPAddress { get; set; }

    /// <summary>
    /// represents the host name of the machine
    /// </summary>
    public string? Hostname { get; set; }

    /// <summary>
    ///  represents the operating system of the machine like Windows, Linux
    /// </summary>
    public MachineTypeEnum Type { get; set; }

    /// <summary>
    /// represenets the status of the machine one of from Online, Offline, Running, Stopped
    /// </summary>
    public MachineStatusTypeEnum Status { get; set; }

    /// <summary>
    /// represents the environment of the machine Development, UAT, Production
    /// </summary>
    public MachineEnvironmentTypeEnum Environment { get; set; }

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

    /// <summary>
    /// Gets or sets a flag indicating whether the machine is disabled.
    /// </summary>
    /// <remarks>
    /// Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the machine.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public Guid? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the machine was created.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the machine. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public Guid? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the machine was last modified. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}