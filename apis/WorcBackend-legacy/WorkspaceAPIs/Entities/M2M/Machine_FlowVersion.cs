namespace WorkspaceAPIs.Entities;

[Table("Machine_FlowVersion")]
public class Machine_FlowVersion : IMustHaveTenant
{
    public Guid TenantId { get; set; }

    /// <summary>
    /// Represents the machine that this flow is associated with
    /// </summary>
    [ForeignKey("MachineId")]
    public virtual Machine? Machine { get; set; }

    /// <summary>
    /// Represents the ID of the machine this flow is associated with
    /// </summary>
    public required Guid MachineId { get; set; }

    /// <summary>
    /// Represents the flow version associated with this machine
    /// </summary>
    [ForeignKey("FlowVersionId")]
    public virtual FlowVersion? FlowVersion { get; set; }

    /// <summary>
    /// Represents the ID of the flow version associated with this machine
    /// </summary>
    public required Guid FlowVersionId { get; set; }
}