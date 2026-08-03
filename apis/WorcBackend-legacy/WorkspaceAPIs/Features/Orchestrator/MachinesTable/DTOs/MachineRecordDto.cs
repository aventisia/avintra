namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents machine record data returned by the "get by id" machine API.
/// </summary>
public class MachineRecordDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the machine.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the generated unique machine name.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Represents the operating system of the machine, e.g., Windows, Linux.
    /// </summary>
    public required OsTypesEnum OperatingSystem { get; set; }

    /// <summary>
    /// Gets or sets the identifier that uniquely represents the operating system (max length 100).
    /// </summary>
    [StringLength(100)]
    public required string OsID { get; set; }

    /// <summary>
    /// Represents the username of the machine (max length 255).
    /// </summary>
    [StringLength(255)]
    public required string Username { get; set; }

    /// <summary>
    /// Represents the host name of the machine (max length 255).
    /// </summary>
    [StringLength(255)]
    public required string Hostname { get; set; }

    /// <summary>
    /// Represents the timestamp of when the machine was last checked in.
    /// </summary>
    public DateTime LastCheckedIn { get; set; }

    /// <summary>
    /// Represents the status of the machine.
    /// </summary>
    public MachineStatusEnum Status { get; set; } = MachineStatusEnum.Offline;

    /// <summary>
    /// Gets or sets the number of flow versions associated with the machine.
    /// </summary>
    public List<MachineFlowVersion> MachineFlowVersions { get; set; } = new List<MachineFlowVersion>();

    /// <summary>
    /// Gets or sets a flag indicating whether the user record is disabled.
    /// </summary>
    public bool IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the linked user account of the machine.
    /// The value could be the linked user's unique username or user id.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public required string LinkedUserAccount { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the machine record was created. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }
}

/// <summary>
/// Represents an assigned flow version on a machine as a select option.
/// </summary>
public class MachineFlowVersion : SelectOption
{
    /// <summary>
    /// Gets or sets the optional identifier of the parent flow.
    /// </summary>
    public Guid? FlowId { get; set; }

    /// <summary>
    /// Gets or sets the version number of the flow version.
    /// </summary>
    public int VersionNumber { get; set; }
}
