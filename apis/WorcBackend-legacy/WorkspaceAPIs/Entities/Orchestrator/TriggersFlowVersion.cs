namespace WorkspaceAPIs.Entities;

[Table("worc_TriggerFlowVersions")]
public class TriggerFlowVersion : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }

    /// <summary>
    /// Represents the trigger that this flow is associated with
    /// </summary>
    [ForeignKey("TriggerId")]
    public virtual Trigger? Trigger { get; set; }

    /// <summary>
    /// Represents the ID of the trigger this flow is associated with
    /// </summary>
    public required Guid TriggerId { get; set; }

    /// <summary>
    /// Represents the flow version associated with this trigger
    /// </summary>
    [ForeignKey("FlowVersionId")]
    public virtual FlowVersion? FlowVersion { get; set; }

    /// <summary>
    /// Represents the ID of the flow version associated with this trigger
    /// </summary>
    public required Guid FlowVersionId { get; set; }
}