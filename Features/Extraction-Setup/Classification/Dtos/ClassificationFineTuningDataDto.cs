namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents extracted data used for classification model fine-tuning.
/// </summary>
public class ClassificationFineTuningDataDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the extracted data record.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the associated machine learning model.
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the uploaded document from which data was extracted.
    /// </summary>
    public Guid DocId { get; set; }

    /// <summary>
    /// Gets or sets the name of the uploaded document.
    /// </summary>
    [StringLength(255)]
    public string? DocName { get; set; }

    /// <summary>
    /// Gets or sets the current processing status of the extracted data.
    /// </summary>
    public ExtractedDataStatusesEnums Status { get; set; }

    /// <summary>
    /// Gets or sets the accuracy of the extracted data, expressed as a percentage (1–100).
    /// </summary>
    [Range(1, 100)]
    public decimal? Accuracy { get; set; }

    /// <summary>
    /// Gets or sets the list of extracted fields from the document.
    /// </summary>
    public List<ColumnsDto>? Columns { get; set; }

    /// <summary>
    /// Gets or sets the type of extracted data.
    /// </summary>
    public ExtractedDataType? Type { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this record has been submitted for fine-tuning.
    /// </summary>
    public bool SubmitForFineTuning { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the fine-tuning task was scheduled to run.
    /// </summary>
    public DateTimeOffset? ScheduledOn { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the fine-tuning process was completed.
    /// </summary>
    public DateTimeOffset? FineTunedOn { get; set; }

    /// <summary>
    /// Gets or sets the duration of the fine-tuning process, in seconds.
    /// </summary>
    public int? Duration { get; set; }

    /// <summary>
    /// Gets or sets the token count related to this data record.
    /// </summary>
    public int TokenCount { get; set; }

    /// <summary>
    /// Gets or sets the number of times this data record has been executed.
    /// </summary>
    public int ExecutionCount { get; set; }

    /// <summary>
    /// Gets or sets the number of failed executions for this data record.
    /// </summary>
    public int FailedCount { get; set; }

    /// <summary>
    /// Gets or sets the execution time in seconds.
    /// </summary>
    public int ExecutionTime { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when this record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the user who created the record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the user who last modified the record.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the display name of the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the record.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}
