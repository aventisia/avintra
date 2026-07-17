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
    /// Represents the environment of the machine, e.g., Development, UAT, Production.
    /// </summary>
    public required EnvironmentTypesEnum Environment { get; set; }

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
    /// Optional IP address of the machine (supports IPv4 or IPv6, max length 100).
    /// </summary>
    [StringLength(100)]
    public string? IpAddress { get; set; }

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
    /// Gets or sets the username of the user who created the user record. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public required string CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was created. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the user record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public required string LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was last modified. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset LastModifiedOn { get; set; }
}

public class MachineFlowVersion : FlowVersionSearchResultDto
{
    // This class inherits from FlowVersionSearchResultDto to include all properties of a flow version search result.
    // Additional properties specific to the machine-flow version relationship can be added here if needed in the future.
}
