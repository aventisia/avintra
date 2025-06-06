namespace MLModelBuilderAPIs.DTOs;

public class SummarizationExtractedDataDto
{
    /// <summary>
    /// Gets or sets the primary key for the data model
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the library identifier to which the data model record is associated
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the uploaded doc record's primary key to which this record is associated.
    /// </summary>/
    public Guid DocId { get; set; }

    /// <summary>
    /// Gets or sets the name of a document associated with this record
    /// </summary>
    [StringLength(255)]
    public string? DocName { get; set; }

    /// <summary>
    /// Gets or sets the structured data segments extracted from the document.
    /// </summary>
    public SummarizationSetupData? ExtractedData { get; set; }

    /// <summary>
    /// Gets or sets the accuracy for the record
    /// </summary>
    [Range(1, 100)]
    public decimal? Accuracy { get; set; }

    /// <summary>
    /// Gets or sets the type of extra
    /// </summary>
    public ExtractedDataType? Type { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the model or data has been submitted for fine-tuning.
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
    /// Gets or sets the date of creation of extracted data.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who created the record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who modified the record last.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the the username who created the record.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}