namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents a log entry for a fine-tuning execution, including its timing, associated data, and status.
/// </summary>
public class FineTuningLog : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the fine-tuning log entry.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tenant ID for multi-tenant filtering.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the fine-tuning process began.
    /// </summary>
    public DateTime StartedOn { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the fine-tuning process ended, if completed.
    /// </summary>
    public DateTime? EndedOn { get; set; }

    /// <summary>
    /// Gets or sets the current status of the fine-tuning process (e.g., Pending, Scheduled, Completed, Failed).
    /// </summary>
    public ScheduleTypesEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the associated scheduled model.
    /// </summary>
    public Guid ScheduledModelId { get; set; }

    /// <summary>
    /// Gets or sets the scheduled model associated with this log entry.
    /// </summary>
    [ForeignKey("ScheduledModelId")]
    public virtual ScheduledModel? ScheduledModel { get; set; }
}