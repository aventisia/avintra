namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// DTO representing the history record of a fine-tuning operation for an existing ML model.
/// </summary>
public class FineTuningHistoryDto
{
    /// <summary>
    /// Gets or sets the unique identifier of this fine-tuning history record.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the machine learning model associated with this fine-tuning request.
    /// </summary>
    public Guid? MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the version number of the fine-tuning record.
    /// </summary>
    public int? Version { get; set; }

    /// <summary>
    /// Gets or sets the current status of the fine-tuning process.
    /// </summary>
    public ScheduleTypesEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the fine-tuning task was scheduled to run.
    /// </summary>
    public DateTimeOffset? ScheduledOn { get; set; }

    /// <summary>
    /// Gets or sets the accuracy for the record
    /// </summary>
    [Range(1, 100)]
    public decimal? Accuracy { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the fine-tuning process was completed.
    /// </summary>
    public DateTimeOffset? FineTunedOn { get; set; }

    /// <summary>
    /// Gets or sets the duration of the fine-tuning process in seconds.
    /// </summary>
    public double? Duration { get; set; }

    /// <summary>
    /// Gets or sets the count of records used in the fine-tuning process.
    /// </summary>
    public int? Record { get; set; } = 1;
}
