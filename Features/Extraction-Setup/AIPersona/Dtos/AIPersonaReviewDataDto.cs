namespace MLModelBuilderAPIs.DTOs;

public class AIPersonaReviewDataDto
{
    /// <summary>
    /// Gets or sets the unique identifier for this AI persona data record.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier for the machine learning model associated with this AI persona data record.
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the document uploaded for this AI persona data record.
    /// </summary>
    public Guid DocId { get; set; }

    /// <summary>
    /// Gets or sets the name of the document associated with this AI persona data record.
    /// </summary>
    [StringLength(255)]
    public string? DocName { get; set; }

    /// <summary>
    /// Gets or sets the current status of the extracted data, indicating the processing stage for the AI persona setup.
    /// </summary>
    public ExtractedDataStatusesEnums Status { get; set; }

    /// <summary>
    /// Gets or sets the accuracy percentage (from 1 to 100) of the AI persona data extraction for this record.
    /// </summary>
    [Range(1, 100)]
    public decimal? Accuracy { get; set; }

    /// <summary>
    /// Gets or sets the list of fields extracted from the document, such as names, attributes, or categories relevant to the AI persona.
    /// </summary>
    public List<ColumnsDto>? Columns { get; set; }

    /// <summary>
    /// Gets or sets the type of data extracted, classifying the nature of the content in the AI persona data record.
    /// </summary>
    public ExtractedDataType? Type { get; set; }

    /// <summary>
    /// Indicates whether this AI persona data or model has been submitted for fine-tuning to enhance model performance.
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
    /// Gets or sets the execution time in seconds.
    /// </summary>
    public int ExecutionTime { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when this AI persona data record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the user who created this AI persona data record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the user who last modified this AI persona data record.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the name of the user who created this AI persona data record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created this AI persona data record.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}