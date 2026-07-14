namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for a AssignAgentDto.
/// </summary>
public class AssignMachineDto
{
    /// <summary>
    /// Gets or sets Id of the machine.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets Id of the tenant.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets Id of the flow version
    /// </summary>
    [RequiredGuid]
    public required Guid AgentId { get; set; }

    /// <summary>
    /// Gets or sets the name of the machine.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets status of the machine.
    /// </summary>
    public MachineStatusEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the identifier that uniquely represents the operating system.
    /// </summary>
    public string? OSId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the flow version is assigned.
    /// </summary>
    public bool IsAssigned { get; set; }

    /// <summary>
    /// Gets or sets the job Id associated with the machine. This property is nullable.
    /// </summary>
    public Guid? JobId { get; set; }

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