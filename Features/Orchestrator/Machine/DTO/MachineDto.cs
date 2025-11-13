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
    public required string IPAddress { get; set; }

    /// <summary>
    /// Represents the host name of the machine
    /// </summary>
    [Required, MaxLength(100)]
    public required string Hostname { get; set; }

    /// <summary>
    /// Represents the operating system of the machine, e.g., Windows, Linux
    /// </summary>
    [Required]
    public required MachineTypeEnum Type { get; set; }

    /// <summary>
    /// Represents the status of the machine. Possible values are: Idle, Online, Offline, Running, Stopped
    /// </summary>
    public MachineStatusTypeEnum Status { get; set; } = MachineStatusTypeEnum.Idle;

    /// <summary>
    /// Represents the environment of the machine, e.g., Development, UAT, Production
    /// </summary>
    [Required]
    public required EnvironmentTypesEnum Environment { get; set; }

    /// <summary>
    /// Represents the running agent/flow activity on the machine, if any
    /// </summary>
    public string? CurrentTask { get; set; }

    /// <summary>
    /// Gets or sets the agents count which are associated with the machine.
    /// </summary>
    public int? AgentCount { get; set; }

    /// <summary>
    /// Represents the timestamp of when the machine was last checked in
    /// </summary>
    public DateTime LastCheckedIn { get; set; }

    // <summary>
    /// Gets or sets the connection identifier of the machine.
    /// </summary>
    public string ConnectionId { get; set; } = string.Empty;

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

    /// <summary>
    /// Gets or sets the collection of unique identifiers for agents(flow version) associated with the user.
    /// This property may be included in requests and responses.
    /// </summary>
    public IEnumerable<Guid>? AgentIds { get; set; }
}