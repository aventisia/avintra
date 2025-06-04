namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents the execution details of a scheduled operation, including timing, document association, and execution status.
/// </summary>
public class FineTuningLog : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for this execution record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the execution process started.
    /// </summary>
    public DateTime StartedOn { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the execution process ended.
    /// </summary>
    public DateTime? EndedOn { get; set; }

    /// <summary>
    /// Gets or sets the current status of the execution (e.g., Pending, InProgress, Completed, Failed).
    /// </summary>
    public ExtractedDataStatusesEnums Status { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the related uploaded document.
    /// </summary>
    public Guid DocId { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the related scheduled model operation.
    /// </summary>
    public Guid ScheduledModelId { get; set; }

    /// <summary>
    /// Gets or sets the navigation property for the associated scheduled model.
    /// </summary>
    [ForeignKey("ScheduledModelId")]
    public virtual ScheduledModel? ScheduledModel { get; set; }

    /// <summary>
    /// Gets or sets the navigation property for the associated uploaded document.
    /// </summary>
    [ForeignKey("DocId")]
    public virtual UploadedDoc? UploadedDoc { get; set; }
}
