namespace WorkspaceAPIs.Entities;

public class MachineFlow : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }


    [ForeignKey("MachineId")]
    public Machine? Machine { get; set; }
    public Guid MachineId { get; set; }


    [ForeignKey("FlowVersionId")]
    public FlowVersion? FlowVersion { get; set; }
    public Guid FlowVersionId { get; set; }
}