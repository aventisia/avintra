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
    /// Gets or sets the identifier of the file used in the fine-tuning process.
    /// </summary>
    public Guid DocId { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the machine learning model associated with this fine-tuning request.
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the name of the document linked to this fine-tuning record.
    /// </summary>
    [StringLength(255)]
    public string? DocName { get; set; }

    /// <summary>
    /// Gets or sets the current status of the fine-tuning process.
    /// </summary>
    public ExtractedDataStatusesEnums Status { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the fine-tuning process was completed.
    /// </summary>
    public DateTimeOffset? FineTunedOn { get; set; }

    /// <summary>
    /// Gets or sets the duration of the fine-tuning process in seconds.
    /// </summary>
    public double? Duration { get; set; }
}
