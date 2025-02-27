namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for a project.
/// </summary>
public class MachineDto
{
    /// <summary>
    /// Gets or sets the flow record's primary key.
    /// </summary>
    /// <remarks>
    /// Note: Not making it required because the same DTO is used for insert and update.
    /// </remarks>
    public Guid Id { get; set; }

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
    public string? IPAddress { get; set; }

    /// <summary>
    /// Represents the host name of the machine
    /// </summary>
    [Required, MaxLength(100)]
    public required string Hostname { get; set; }

    /// <summary>
    /// Represents the operating system of the machine, e.g., Windows, Linux
    /// </summary>
    public required MachineTypeEnum Type { get; set; }

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
    [Required, MaxLength(256)]
    public required string CurrentTask { get; set; }

    /// <summary>
    /// Represents the availability of the machine for another task. True if available, False if not.
    /// </summary>
    public bool IsAvailable { get; set; }

    /// <summary>
    /// Represents the timestamp of when the machine was last checked in
    /// </summary>
    public DateTime LastCheckedIn { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the user record is disabled.
    /// </summary>
    /// <remarks>
    /// Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the user record. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was created. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the user record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was last modified. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}