namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Represents extracted data used for fine-tuning an AI persona model.
/// </summary>
public class AIPersonaFineTuningDataDto
{
    /// <summary>
    /// Gets or sets the unique identifier for this AI persona data record.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the ID of the machine learning model associated with this AI persona data.
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the document from which this AI persona data was extracted.
    /// </summary>
    public Guid DocId { get; set; }

    /// <summary>
    /// Gets or sets the name of the document that contains the extracted AI persona data.
    /// </summary>
    [StringLength(255)]
    public string? DocName { get; set; }

    /// <summary>
    /// Gets or sets the current processing status of the extracted AI persona data.
    /// </summary>
    public ExtractedDataStatusesEnums Status { get; set; }

    /// <summary>
    /// Gets or sets the accuracy of the extracted AI persona data, represented as a percentage (1-100).
    /// </summary>
    [Range(1, 100)]
    public decimal? Accuracy { get; set; }

    /// <summary>
    /// Gets or sets the list of data fields extracted from the document for the AI persona.
    /// </summary>
    public List<ColumnsDto>? Columns { get; set; }

    /// <summary>
    /// Gets or sets the type or category of extracted data for the AI persona.
    /// </summary>
    public ExtractedDataType? Type { get; set; }

    /// <summary>
    /// Indicates whether this AI persona data has been submitted for fine-tuning the model.
    /// </summary>
    public bool SubmitForFineTuning { get; set; }

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
    /// Gets or sets the timestamp when the fine-tuning task was scheduled to run.
    /// </summary>
    public DateTimeOffset? ScheduledOn { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the fine-tuning of the AI persona model was completed.
    /// </summary>
    public DateTimeOffset? FineTunedOn { get; set; }

    /// <summary>
    /// Gets or sets the duration (in seconds) it took to complete the fine-tuning process for the AI persona model.
    /// </summary>
    public int? Duration { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when this AI persona fine-tuning data record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who created this AI persona fine-tuning data record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who last modified this AI persona fine-tuning data record.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the display name of the user who created this record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created this record.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}