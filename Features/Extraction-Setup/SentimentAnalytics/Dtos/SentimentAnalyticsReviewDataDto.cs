namespace MLModelBuilderAPIs.DTOs;

public class SentimentAnalyticsReviewDataDto
{
    /// <summary>
    /// Gets or sets the unique identifier for this extracted data record.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier for the machine learning model to which this data record is associated.
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the uploaded document associated with this extracted data record.
    /// </summary>
    public Guid DocId { get; set; }

    /// <summary>
    /// Gets or sets the name of the document that is associated with this extracted data record.
    /// </summary>
    [StringLength(255)]
    public string? DocName { get; set; }

    /// <summary>
    /// Gets or sets the current status of the extracted data, representing its processing stage.
    /// </summary>
    public ExtractedDataStatusesEnums Status { get; set; }

    /// <summary>
    /// Gets or sets the accuracy percentage (between 1 and 100) of the extracted data for this record.
    /// </summary>
    [Range(1, 100)]
    public decimal? Accuracy { get; set; }

    /// <summary>
    /// Gets or sets the list of extracted data fields from the document, such as names, dates, or categories.
    /// </summary>
    public List<ColumnsDto>? Columns { get; set; }

    /// <summary>
    /// Gets or sets the type of data extracted, categorizing the nature of the content in the record.
    /// </summary>
    public ExtractedDataType? Type { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this data or model has been submitted for fine-tuning to improve performance.
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
    /// Gets or sets the timestamp indicating when this extracted data record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the user who created this extracted data record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the user who last modified this extracted data record.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the name of the user who created this extracted data record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created this extracted data record.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}