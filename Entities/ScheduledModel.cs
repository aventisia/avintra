namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents a scheduled operation (such as review or fine-tuning) that is planned for execution on a specific ML model at a defined time.
/// </summary>
public class ScheduledModel : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Identifier for the tenant (used for multi-tenancy support).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Time zone in which the schedule is configured.
    /// </summary>
    public required string TimeZone { get; set; }

    /// <summary>
    /// Date and time when the operation is scheduled to occur.
    /// </summary>
    public required DateTime ScheduledAt { get; set; }

    /// <summary>
    /// Collection of file identifiers associated with this scheduled operation.
    /// </summary>
    public required List<Guid> FileIds { get; set; }

    /// <summary>
    /// Type of operation to be performed at the scheduled time (e.g., Review, FineTuning).
    /// </summary>
    public ModelOperationTypesEnum ScheduleType { get; set; }

    /// <summary>
    /// Identifier of the associated ML model.
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Navigation property for the associated ML model.
    /// </summary>
    [ForeignKey("MLModelId")]
    public virtual MLModel? MLModel { get; set; }
}
