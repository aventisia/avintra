namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents a scheduled task (e.g., review or fine-tuning) planned to be executed on a specific ML model at a designated time.
/// </summary>
public class ScheduledModel : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant identifier for multi-tenancy support.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the time zone in which the schedule is defined.
    /// </summary>
    public required string TimeZone { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the scheduled operation should occur.
    /// </summary>
    public required DateTime ScheduledAt { get; set; }

    /// <summary>
    /// Gets or sets the type of operation to perform (e.g., Review, FineTuning).
    /// </summary>
    public ModelOperationTypesEnum ScheduleType { get; set; }

    /// <summary>
    /// Gets or sets the current scheduling status of the ML model operation.
    /// </summary>
    public ScheduleTypesEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the related ML model.
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the navigation property to the related ML model.
    /// </summary>
    [ForeignKey("MLModelId")]
    public virtual MLModel? MLModel { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the related extracted data.
    /// </summary>
    public Guid ExtractedDataId { get; set; }

    /// <summary>
    /// Gets or sets the navigation property to the related extracted data.
    /// </summary>
    [ForeignKey("ExtractedDataId")]
    public virtual ExtractedData? ExtractedData { get; set; }

    /// <summary>
    /// Gets or sets the collection of fine-tuning logs linked to this schedule, representing tuning history or status.
    /// </summary>
    public virtual ICollection<FineTuningLog>? FineTuningLogs { get; set; }
}
