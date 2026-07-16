namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents flow version assignment details for a machine.
/// </summary>
public class AssignFlowVersionDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the flow version.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tenant identifier.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the machine identifier associated with the flow version.
    /// </summary>
    [RequiredGuid]
    public required Guid MachineId { get; set; }

    /// <summary>
    /// Gets or sets the flow name.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the version number of the flow version.
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the flow version is assigned.
    /// </summary>
    public bool IsAssigned { get; set; }

    /// <summary>
    /// Represents the execution status of the flow version. Possible values are: CreatingJob, LaunchingExecutor, Executing, Paused, Stopped.
    /// </summary>
    public AgentExecutionStatus Status { get; set; } = AgentExecutionStatus.Stopped;

    /// <summary>
    /// Gets or sets the job identifier associated with this flow version execution.
    /// </summary>
    public Guid? JobId { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the record is disabled.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the record.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was last modified.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }

    /// <summary>
    /// Gets or sets initials of the user who created the record.
    /// </summary>
    public string? CreatedByUserInitials { get; set; }
}
